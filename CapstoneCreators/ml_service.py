from __future__ import annotations

import threading

from flask import Flask, jsonify, request

from chatbot import llm_reply
from config import EMBEDDING_MODEL, PORT, TOP_K
from data_loader import initialize_state
from intent import extract_intent
from ranker import build_bundle, recommend_items


app = Flask(__name__)
STATE = None
STATE_ERROR: Exception | None = None
STATE_LOCK = threading.Lock()
STATE_READY = threading.Event()


def initialize_state_async():
    global STATE, STATE_ERROR

    try:
        state = initialize_state()
        with STATE_LOCK:
            STATE = state
            STATE_ERROR = None
    except Exception as exc:  # pragma: no cover - surfaced via health endpoint
        with STATE_LOCK:
            STATE_ERROR = exc
    finally:
        STATE_READY.set()


threading.Thread(target=initialize_state_async, daemon=True).start()


def get_state(timeout: float = 0.0):
    if not STATE_READY.wait(timeout=timeout):
        raise RuntimeError("ML service is still loading.")

    with STATE_LOCK:
        if STATE_ERROR is not None:
            raise STATE_ERROR
        if STATE is None:
            raise RuntimeError("ML service is not ready.")
        return STATE


def parse_json_body():
    return request.get_json(silent=True) or {}


def validate_cart(cart):
    if cart is None:
        return []
    if not isinstance(cart, list):
        raise ValueError("cart_items must be a list")
    return cart


def abandonment_score(cart_size: int, dwell_time: float) -> float:
    score = 0.2
    if cart_size <= 1:
        score += 0.35
    if dwell_time < 10:
        score += 0.25
    if cart_size == 0:
        score += 0.2
    return min(score, 1.0)


@app.route("/health", methods=["GET"])
def health():
    with STATE_LOCK:
        ready = STATE is not None and STATE_ERROR is None

    return jsonify(
        {
            "status": "ok" if ready else "loading",
            "products": len(STATE.products) if ready else 0,
            "purchases": len(STATE.purchases) if ready else 0,
            "rules": len(STATE.rules) if ready else 0,
            "popular_products": len(STATE.popular_products) if ready else 0,
            "embedding_model": EMBEDDING_MODEL,
            "error": str(STATE_ERROR) if STATE_ERROR else None,
        }
    )


@app.route("/recommend", methods=["POST"])
def recommend():
    data = parse_json_body()
    try:
        cart_items = validate_cart(data.get("cart_items", []))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    user_text = str(data.get("text", "")).strip()
    top_k = int(data.get("top_k", TOP_K))

    try:
        state = get_state(timeout=0.1)
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    items = recommend_items(state, cart_items, top_k=top_k, user_text=user_text)
    return jsonify({"items": items})


@app.route("/bundle", methods=["POST"])
def bundle():
    data = parse_json_body()
    try:
        cart_items = validate_cart(data.get("cart_items", []))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    user_text = str(data.get("text", "")).strip()
    bundle_size = int(data.get("bundle_size", 5))

    try:
        state = get_state(timeout=0.1)
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    items = build_bundle(state, cart_items, bundle_size=bundle_size, user_text=user_text)
    return jsonify({"items": items})


@app.route("/abandonment", methods=["POST"])
def abandonment():
    data = parse_json_body()
    try:
        cart_size = int(data.get("cart_size", 0))
        dwell_time = float(data.get("dwell_time", 0))
    except (TypeError, ValueError):
        return jsonify({"error": "cart_size must be int and dwell_time must be numeric"}), 400

    return jsonify({"risk": abandonment_score(cart_size, dwell_time)})


@app.route("/chat", methods=["POST"])
def chat():
    data = parse_json_body()
    try:
        cart_items = validate_cart(data.get("cart_items", []))
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    user_text = str(data.get("text", "")).strip()
    top_k = int(data.get("top_k", TOP_K))

    try:
        state = get_state(timeout=0.1)
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 503

    recommendations = recommend_items(state, cart_items, top_k=top_k, user_text=user_text)
    intent = extract_intent(
        user_text,
        state.category_values,
        state.style_values,
        state.brand_values,
    )
    reply = llm_reply(user_text, cart_items, recommendations)

    return jsonify(
        {
            "reply": reply,
            "items": recommendations,
            "intent": intent.__dict__,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=PORT, debug=False, threaded=True)
