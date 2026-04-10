import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "./context/CartContext";
import { PRODUCTS, Product } from "../constants/products";

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  goldMedium: "rgba(175,148,97,0.25)",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
  userBubble: "#161616",
  botBubble: "#FFFFFF",
};

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  products?: Product[];
  timestamp: Date;
};

const QUICK_ACTIONS = [
  { label: "🛋️ Furniture", query: "furniture" },
  { label: "🍳 Kitchen", query: "kitchen" },
  { label: "🪴 Decor", query: "decor" },
  { label: "💡 Lighting", query: "lighting" },
  { label: "🌿 Outdoor", query: "outdoor" },
  { label: "🔥 Best Sellers", query: "best seller" },
  { label: "🆕 New Arrivals", query: "new" },
];

function getSmartResponse(input: string): { text: string; products: Product[] } {
  const lower = input.toLowerCase().trim();

  if (/^(hi|hello|hey|hola|namaste|good\s*(morning|evening|afternoon))/.test(lower)) {
    return {
      text: "Welcome to Williams Sonoma! ✨\n\nI'm your personal shopping concierge. I can help you discover our curated collections — from artisan cookware to statement furniture.\n\nWhat are you looking for today?",
      products: [],
    };
  }

  if (/^(thanks|thank you|thx|ty)/.test(lower)) {
    return {
      text: "You're welcome! Happy to help. Feel free to ask me anything else about our collections. 🌟",
      products: [],
    };
  }

  if (/cheap|affordable|budget|under\s*\d+|low\s*price/.test(lower)) {
    const priceMatch = lower.match(/under\s*(\d+)/);
    const maxPrice = priceMatch ? parseInt(priceMatch[1]) : 5000;
    const affordable = PRODUCTS.filter((p) => p.price <= maxPrice)
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);
    if (affordable.length > 0) {
      return {
        text: `Here are some beautiful pieces under ₹${maxPrice.toLocaleString()}:`,
        products: affordable,
      };
    }
    const minPrice = PRODUCTS.reduce((min, p) => Math.min(min, p.price), Infinity);
    return {
      text: `Our most accessible pieces start from ₹${minPrice.toLocaleString()}:`,
      products: [...PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 3),
    };
  }

  if (/best\s*seller|popular|trending|top/.test(lower)) {
    const bestSellers = PRODUCTS.filter((p) => p.tag === "Best Seller" || (p.rating >= 4.7));
    return {
      text: "These are our most loved pieces — handpicked favorites that customers keep coming back to:",
      products: bestSellers.slice(0, 4),
    };
  }

  if (/new|latest|just\s*arrived|fresh/.test(lower)) {
    const newItems = PRODUCTS.filter((p) => p.tag === "New");
    return {
      text: "Fresh from our artisan partners — these just-arrived pieces are already turning heads:",
      products: newItems.length > 0 ? newItems.slice(0, 4) : PRODUCTS.slice(0, 3),
    };
  }

  if (/sofa|couch|chair|seat|living\s*room|furniture/.test(lower)) {
    const sofas = PRODUCTS.filter((p) => p.category === "sofa");
    return {
      text: "Our furniture collection brings together comfort and timeless design. Each piece is built to be the heart of your home:",
      products: sofas.slice(0, 4),
    };
  }

  if (/knife|knives|cut|blade|chef/.test(lower)) {
    const knives = PRODUCTS.filter((p) => p.category === "knife");
    return {
      text: "Precision meets artistry in our cutlery collection. Hand-forged from the finest steel:",
      products: knives,
    };
  }

  if (/cook|pan|pot|dutch|oven|kitchen/.test(lower)) {
    const kitchen = PRODUCTS.filter((p) =>
      ["knife", "cookware", "tableware"].includes(p.category)
    );
    return {
      text: "From stovetop to table — our kitchen collection is designed for those who believe cooking is an art:",
      products: kitchen.slice(0, 4),
    };
  }

  if (/decor|vase|candle|mirror|frame|accent/.test(lower)) {
    const decor = PRODUCTS.filter((p) => p.category === "decor");
    return {
      text: "Transform any space with our curated décor. Each piece tells its own story:",
      products: decor.slice(0, 4),
    };
  }

  if (/light|lamp|pendant|glow/.test(lower)) {
    const lighting = PRODUCTS.filter((p) => p.category === "lighting");
    return {
      text: "Set the mood with our lighting collection. From statement pendants to sculptural lamps:",
      products: lighting.slice(0, 4),
    };
  }

  if (/outdoor|table|patio|garden/.test(lower)) {
    const outdoor = PRODUCTS.filter((p) => p.category === "outdoor");
    return {
      text: "Bring the indoors out. Our outdoor collection is built to withstand the elements beautifully:",
      products: outdoor,
    };
  }

  if (/cart|order|checkout|buy|purchase/.test(lower)) {
    return {
      text: "You can view your cart by tapping the bag icon. Our checkout process is seamless and secure.\n\nWould you like me to suggest some products?",
      products: [],
    };
  }

  if (/ship|deliver|return|refund|exchange/.test(lower)) {
    return {
      text: "📦 Shipping: Free on orders over ₹5,000. Express delivery available.\n\n🔄 Returns: 30-day hassle-free returns.\n\n💳 All payment methods accepted.\n\nAnything else I can help with?",
      products: [],
    };
  }

  const matchedProducts = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.style.toLowerCase().includes(lower)
  );

  if (matchedProducts.length > 0) {
    return {
      text: `I found ${matchedProducts.length} piece${matchedProducts.length > 1 ? "s" : ""} matching your search:`,
      products: matchedProducts.slice(0, 4),
    };
  }

  return {
    text: "I'd love to help you find the perfect piece! Try asking about:\n\n• Categories (furniture, kitchen, décor, lighting)\n• Best sellers or new arrivals\n• Budget-friendly options\n• Shipping & returns\n\nOr simply tell me what room you're styling! 🏡",
    products: [],
  };
}

/* ─── Typing Indicator ─────────────────────────────────── */
function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    animate(dot1, 0).start();
    animate(dot2, 150).start();
    animate(dot3, 300).start();
  }, [dot1, dot2, dot3]);

  return (
    <View style={styles.typingContainer}>
      <View style={styles.botAvatar}>
        <Ionicons name="sparkles" size={12} color={COLORS.gold} />
      </View>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { opacity: dot }]} />
        ))}
      </View>
    </View>
  );
}

/* ─── Inline Product Card ──────────────────────────────── */
function InlineProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const productSlug = product.name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <TouchableOpacity
      style={styles.inlineCard}
      onPress={() => router.push(`/product/[slug]?slug=${productSlug}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: product.img }} style={styles.inlineCardImage} />
      <View style={styles.inlineCardInfo}>
        <Text style={styles.inlineCardName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.inlineCardBrand} numberOfLines={1}>
          {product.brand}
        </Text>
        <View style={styles.inlineCardBottom}>
          <Text style={styles.inlineCardPrice}>{product.displayPrice}</Text>
          <TouchableOpacity
            style={styles.inlineAddBtn}
            onPress={() => {
              addToCart({
                id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                img: product.img,
                label: product.tag,
              });
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-add-outline" size={14} color={COLORS.gold} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* ─── Main Screen ──────────────────────────────────────── */
export default function ChatbotScreen() {
  const router = useRouter();
  const { totalItemCount } = useCart();
  const scrollRef = useRef<ScrollView>(null);
  const { width: windowWidth } = useWindowDimensions();

  const isDesktop = windowWidth > 768;
  const chatMaxWidth = isDesktop ? 560 : windowWidth;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      text: "Hello! I'm your Williams Sonoma shopping concierge. ✨\n\nI can help you discover curated collections, find the perfect piece, or answer product questions.\n\nHow can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [isFocused, setIsFocused] = useState(false);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        text: text.trim(),
        isUser: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputText("");
      setIsTyping(true);
      setShowQuickActions(false);
      scrollToBottom();

      const delay = 600 + Math.random() * 800;
      setTimeout(() => {
        const response = getSmartResponse(text);
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: response.text,
          isUser: false,
          products: response.products.length > 0 ? response.products : undefined,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        scrollToBottom();
      }, delay);
    },
    [scrollToBottom]
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ─── HEADER ─── */}
      <View style={styles.header}>
        <View style={[styles.headerInner, isDesktop && { maxWidth: chatMaxWidth, alignSelf: "center" as const, width: "100%" as const }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.82}
            >
              <Ionicons name="chevron-back" size={22} color={COLORS.black} />
            </TouchableOpacity>
            <View style={styles.avatarHeader}>
              <Ionicons name="sparkles" size={16} color={COLORS.gold} />
            </View>
            <View>
              <Text style={styles.headerTitle}>Shopping Assistant</Text>
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push("/cart")}
            activeOpacity={0.82}
          >
            <Ionicons name="bag-outline" size={18} color={COLORS.black} />
            {totalItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItemCount > 9 ? "9+" : totalItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── CHAT BODY ─── */}
      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesList}
          contentContainerStyle={[
            styles.messagesContent,
            isDesktop && { maxWidth: chatMaxWidth, alignSelf: "center" as const, width: "100%" as const },
          ]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
        >
          {/* Date chip */}
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>Today</Text>
          </View>

          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.isUser ? styles.messageRowUser : styles.messageRowBot,
              ]}
            >
              {!msg.isUser && (
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={12} color={COLORS.gold} />
                </View>
              )}
              <View style={styles.bubbleColumn}>
                <View
                  style={[
                    styles.messageBubble,
                    msg.isUser ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      msg.isUser ? styles.userText : styles.botText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  {msg.products && msg.products.length > 0 && (
                    <View style={styles.productsInChat}>
                      {msg.products.map((product) => (
                        <InlineProductCard key={product.product_id} product={product} />
                      ))}
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.timestamp,
                    msg.isUser ? styles.timestampUser : styles.timestampBot,
                  ]}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </View>
            </View>
          ))}

          {isTyping && <TypingIndicator />}
        </ScrollView>

        {/* ─── QUICK ACTIONS ─── */}
        {showQuickActions && (
          <View style={[isDesktop && { maxWidth: chatMaxWidth, alignSelf: "center" as const, width: "100%" as const }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickActionRow}
            >
              {QUICK_ACTIONS.map((action) => (
                <TouchableOpacity
                  key={action.query}
                  style={styles.quickActionChip}
                  onPress={() => sendMessage(action.query)}
                  activeOpacity={0.82}
                >
                  <Text style={styles.quickActionText}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── INPUT BAR ─── */}
        <View style={styles.inputBar}>
          <View
            style={[
              styles.inputWrapper,
              isFocused && styles.inputWrapperFocused,
              isDesktop && { maxWidth: chatMaxWidth, alignSelf: "center" as const, width: "100%" as const },
            ]}
          >
            <TextInput
              style={styles.textInput}
              placeholder="Ask about our collections..."
              placeholderTextColor={COLORS.textSecondary}
              value={inputText}
              onChangeText={setInputText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={() => sendMessage(inputText)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                inputText.trim().length > 0 && styles.sendButtonActive,
              ]}
              onPress={() => sendMessage(inputText)}
              disabled={!inputText.trim()}
              activeOpacity={0.82}
            >
              <Ionicons
                name="arrow-up"
                size={18}
                color={inputText.trim().length > 0 ? COLORS.white : COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── STYLES ───────────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: COLORS.bg,
  },
  avatarHeader: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.goldMedium,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34C759",
  },
  statusText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "500",
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "800",
  },

  /* Chat */
  chatArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },

  /* Date chip */
  dateChip: {
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 18,
  },
  dateChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  /* Messages */
  messageRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowBot: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: COLORS.goldMedium,
  },
  bubbleColumn: {
    maxWidth: "78%",
    flexShrink: 1,
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: COLORS.userBubble,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: COLORS.botBubble,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 21,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: COLORS.black,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timestampUser: {
    textAlign: "right",
  },
  timestampBot: {
    textAlign: "left",
    marginLeft: 4,
  },

  /* Products */
  productsInChat: {
    marginTop: 12,
    gap: 8,
  },
  inlineCard: {
    flexDirection: "row",
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inlineCardImage: {
    width: 68,
    height: 68,
  },
  inlineCardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
  },
  inlineCardName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },
  inlineCardBrand: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  inlineCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  inlineCardPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.gold,
  },
  inlineAddBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.goldMedium,
  },

  /* Typing */
  typingContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  typingBubble: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.gold,
  },

  /* Quick Actions */
  quickActionRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickActionChip: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },

  /* Input */
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bg,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
  },
  inputWrapperFocused: {
    borderColor: COLORS.gold,
    backgroundColor: COLORS.white,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.black,
    paddingVertical: 10,
    ...Platform.select({
      web: { outlineStyle: "none" } as any,
      default: {},
    }),
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonActive: {
    backgroundColor: COLORS.black,
  },
});
