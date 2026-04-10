from __future__ import annotations

import json
import os
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


def build_llm_prompt(user_text, cart_items, recommendations):
    return f"""
You are an ecommerce shopping assistant.
Answer naturally and briefly.
Use the recommendation results to explain why the products fit the user.

User message:
{user_text}

Cart items:
{json.dumps(cart_items)}

Recommendations:
{json.dumps(recommendations, indent=2)}
""".strip()


def load_env_fallbacks():
    env_files = [
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / ".env",
        Path(__file__).resolve().parent.parent / "backend" / ".env",
    ]

    values = {}
    for env_file in env_files:
        if not env_file.exists():
            continue

        for raw_line in env_file.read_text(encoding="utf-8").splitlines():
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values.setdefault(key.strip(), value.strip())

    return values


def llm_reply(user_text, cart_items, recommendations):
    fallback_env = load_env_fallbacks()
    api_key = os.getenv("OPENAI_API_KEY") or fallback_env.get("OPENAI_API_KEY")
    model_name = os.getenv("OPENAI_MODEL") or fallback_env.get("OPENAI_MODEL", "gpt-4.1-mini")

    if not api_key or OpenAI is None:
        if recommendations:
            ids = [str(item["product_id"]) for item in recommendations[:3]]
            return f"Here are some strong matches for your cart: {', '.join(ids)}."
        return "I could not find strong matches yet. Try adding more items or refining your request."

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=model_name,
        input=build_llm_prompt(user_text, cart_items, recommendations),
    )
    return response.output_text.strip()
