import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,

  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  StatusBar,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { RecommendationStrip } from "@/components/recommendation-strip";
import { useCart } from "./context/CartContext";
import { getMlRecommendations, type ProductRecord } from "@/lib/api";

const { width } = Dimensions.get("window");

/* ── Aligned with Home.tsx color system ── */
const COLORS = {
  bg: "#F6F5F1",
  surfaceWhite: "#FFFFFF",
  gold: "#AF9461",
  goldLight: "#D4BE8D",
  black: "#000000",
  cardBg: "#F2F2F7",
  textSecondary: "#8E8E8E",
  danger: "#C0392B",
  success: "#2E7D32",
  glass: "rgba(255,255,255,0.65)",
  glassBorder: "rgba(255,255,255,0.5)",
  glassStrong: "rgba(255,255,255,0.82)",
  subtleBorder: "rgba(0,0,0,0.05)",
};

const FALLBACK_RECOMMENDATIONS: ProductRecord[] = [
  {
    id: "silk-cushion",
    name: "Silk Cushion",
    slug: "silk-cushion",
    description: "A soft accent cushion with a refined finish.",
    brand: "Sonoma",
    category: "decor",
    tags: ["accent", "soft"],
    price: 1899,
    compareAtPrice: null,
    stock: 12,
    imageUrl: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=400",
    rating: 0,
    metadata: {},
  },
  {
    id: "wall-mirror",
    name: "Wall Mirror",
    slug: "wall-mirror",
    description: "Minimal wall mirror that opens up small spaces.",
    brand: "Sonoma",
    category: "decor",
    tags: ["mirror", "living"],
    price: 4999,
    compareAtPrice: null,
    stock: 8,
    imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=400",
    rating: 0,
    metadata: {},
  },
  {
    id: "candle-set",
    name: "Candle Set",
    slug: "candle-set",
    description: "A warm candle trio for ambient styling.",
    brand: "Sonoma",
    category: "decor",
    tags: ["candle", "home"],
    price: 1499,
    compareAtPrice: null,
    stock: 18,
    imageUrl: "https://images.unsplash.com/photo-1602523961358-f9f03dd557db?q=80&w=400",
    rating: 0,
    metadata: {},
  },
];

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cartItems,
    savedItems,
    addToCart,
    updateQuantity,
    removeFromCart: removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [recommendedItems, setRecommendedItems] = useState<ProductRecord[]>(FALLBACK_RECOMMENDATIONS);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  React.useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      if (cartItems.length === 0) {
        setRecommendedItems(FALLBACK_RECOMMENDATIONS);
        return;
      }

      try {
        setRecommendationLoading(true);
        const response = await getMlRecommendations({
          cartItems: cartItems.map((item) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            label: item.label,
            category: item.label,
            backendProductId: typeof item.backendProductId === "string" ? item.backendProductId : undefined,
          })),
          topK: 3,
        });

        if (mounted) {
          setRecommendedItems(response.data.length > 0 ? response.data : FALLBACK_RECOMMENDATIONS);
        }
      } catch {
        if (mounted) {
          setRecommendedItems(FALLBACK_RECOMMENDATIONS);
        }
      } finally {
        if (mounted) {
          setRecommendationLoading(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      mounted = false;
    };
  }, [cartItems]);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const FREE_DELIVERY_THRESHOLD = 1000;
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : 99;
  const total = subtotal - discount + deliveryFee;
  const amountForFreeDelivery = FREE_DELIVERY_THRESHOLD - subtotal;
  const progressToFreeDelivery = Math.min(
    (subtotal / FREE_DELIVERY_THRESHOLD) * 100,
    100
  );

  const totalSavings =
    cartItems.reduce((sum, item) => {
      if (item.originalPrice) {
        return sum + (item.originalPrice - item.price) * item.quantity;
      }
      return sum;
    }, 0) +
    discount +
    (deliveryFee === 0 ? 99 : 0);

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "SONOMA10") {
      setCouponApplied(true);
    }
  };

  const formatPrice = (price: number) => {
    return "₹" + price.toLocaleString("en-IN");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ═══════════════ FROSTED HEADER ═══════════════ */}
      <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
        <BlurView intensity={80} tint="light" style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerIconCircle}
          >
            <Ionicons name="chevron-back" size={20} color={COLORS.black} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>MY BAG</Text>
            <Text style={styles.headerCount}>
              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </Text>
          </View>
          <TouchableOpacity style={styles.headerIconCircle}>
            <Ionicons
              name="heart-outline"
              size={18}
              color={COLORS.black}
            />
          </TouchableOpacity>
        </BlurView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 150, paddingTop: insets.top + 80 }]}
      >
        {/* ═══════════════ FREE DELIVERY — PREMIUM BANNER ═══════════════ */}
        {cartItems.length > 0 && (
          <Animated.View style={[styles.deliveryBanner, { opacity: fadeAnim }]}>
            <View style={styles.deliveryTopRow}>
              <View style={styles.deliveryIconWrap}>
                <Ionicons name="gift-outline" size={20} color="white" />
              </View>
              <View style={styles.deliveryTextBlock}>
                {subtotal >= FREE_DELIVERY_THRESHOLD ? (
                  <>
                    <Text style={styles.deliveryHeadline}>Complimentary Delivery</Text>
                    <Text style={styles.deliverySubline}>You've unlocked free shipping on this order</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.deliveryHeadline}>
                      {formatPrice(amountForFreeDelivery)} away from free delivery
                    </Text>
                    <Text style={styles.deliverySubline}>
                      Add a few more pieces to your collection
                    </Text>
                  </>
                )}
              </View>
            </View>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: `${progressToFreeDelivery}%` },
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabelLeft}>{formatPrice(subtotal)}</Text>
              <Text style={styles.progressLabelRight}>{formatPrice(FREE_DELIVERY_THRESHOLD)}</Text>
            </View>
            {subtotal < FREE_DELIVERY_THRESHOLD && (
              <TouchableOpacity
                style={styles.shopMoreBtn}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Text style={styles.shopMoreText}>CONTINUE SHOPPING</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.gold} />
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* ═══════════════ OFFERS — REFINED LUXURY ═══════════════ */}
        {cartItems.length > 0 && (
          <View style={styles.offersCard}>
            <View style={styles.offersHeaderRow}>
              <View style={styles.offersHeaderLeft}>
                <Ionicons name="diamond-outline" size={16} color={COLORS.gold} />
                <Text style={styles.offersTitle}>EXCLUSIVE OFFERS</Text>
              </View>
              <View style={styles.offersCountPill}>
                <Text style={styles.offersCountText}>3</Text>
              </View>
            </View>

            <View style={styles.offersListContainer}>
              {/* Offer 1 */}
              <View style={styles.offerRow}>
                <View style={styles.offerIconBox}>
                  <MaterialCommunityIcons name="percent-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.offerTextBlock}>
                  <Text style={styles.offerPrimary}>
                    Use code <Text style={styles.offerCode}>SONOMA10</Text>
                  </Text>
                  <Text style={styles.offerSecondary}>Get 10% off on your entire order</Text>
                </View>
              </View>

              <View style={styles.offerSep} />

              {/* Offer 2 */}
              <View style={styles.offerRow}>
                <View style={styles.offerIconBox}>
                  <Ionicons name="gift-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.offerTextBlock}>
                  <Text style={styles.offerPrimary}>Free Cushion Set</Text>
                  <Text style={styles.offerSecondary}>On orders above ₹15,000</Text>
                </View>
              </View>

              <View style={styles.offerSep} />

              {/* Offer 3 */}
              <View style={styles.offerRow}>
                <View style={styles.offerIconBox}>
                  <Ionicons name="card-outline" size={16} color={COLORS.gold} />
                </View>
                <View style={styles.offerTextBlock}>
                  <Text style={styles.offerPrimary}>HDFC Credit Card</Text>
                  <Text style={styles.offerSecondary}>Extra 5% off on all transactions</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ═══════════════ CART ITEMS — GLASS CARDS ═══════════════ */}
        {cartItems.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Cart Items ({cartItems.length})
            </Text>
            {cartItems.map((item, index) => (
              <Animated.View
                key={item.id}
                style={[
                  styles.cartItemGlass,
                  {
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 * (index + 1), 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <BlurView intensity={60} tint="light" style={styles.cartItemInner}>
                  <View>
                    <Image source={{ uri: item.img }} style={styles.itemImage} />
                    {item.label && (
                      <View style={styles.labelBadge}>
                        <Text style={styles.labelText}>{item.label}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemTopRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <TouchableOpacity
                        onPress={() => removeItem(item.id)}
                        style={styles.removeBtn}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name="close"
                          size={16}
                          color={COLORS.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.itemDescription} numberOfLines={2}>
                      {item.description}
                    </Text>

                    {item.color && (
                      <View style={styles.variantRow}>
                        <View
                          style={[
                            styles.colorDot,
                            {
                              backgroundColor:
                                item.color === "Walnut"
                                  ? "#6B4226"
                                  : item.color === "Ivory"
                                    ? "#FFFFF0"
                                    : "#B5A642",
                            },
                          ]}
                        />
                        <Text style={styles.itemVariant}>{item.color}</Text>
                      </View>
                    )}

                    <View style={styles.priceRow}>
                      <Text style={styles.itemPrice}>
                        {formatPrice(item.price)}
                      </Text>
                      {item.originalPrice && (
                        <Text style={styles.itemOriginalPrice}>
                          {formatPrice(item.originalPrice)}
                        </Text>
                      )}
                      {item.originalPrice && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {Math.round(
                              ((item.originalPrice - item.price) /
                                item.originalPrice) *
                              100
                            )}
                            % OFF
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.itemActions}>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, -1)}
                          style={styles.quantityBtn}
                        >
                          <Ionicons
                            name="remove"
                            size={16}
                            color={COLORS.black}
                          />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          onPress={() => updateQuantity(item.id, 1)}
                          style={styles.quantityBtn}
                        >
                          <Ionicons name="add" size={16} color={COLORS.black} />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        onPress={() => saveForLater(item.id)}
                        style={styles.saveBtn}
                      >
                        <Ionicons
                          name="bookmark-outline"
                          size={14}
                          color={COLORS.gold}
                        />
                        <Text style={styles.saveBtnText}>Save</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </BlurView>
              </Animated.View>
            ))}
          </View>
        ) : (
          /* ── Empty State ── */
          <View style={styles.emptyCart}>
            <View style={styles.emptyIconCircle}>
              <Ionicons
                name="bag-outline"
                size={48}
                color={COLORS.goldLight}
              />
            </View>
            <Text style={styles.emptyTitle}>Your bag is empty</Text>
            <Text style={styles.emptySubtitle}>
              Discover our curated collection and find something you'll love
            </Text>
            <TouchableOpacity
              style={styles.emptyShopBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.emptyShopBtnText}>Start Shopping</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* ═══════════════ COUPON — FROSTED GLASS ═══════════════ */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.frostedCard}>
              <BlurView intensity={60} tint="light" style={styles.frostedInner}>
                <TouchableOpacity
                  style={styles.couponToggle}
                  onPress={() => setShowCouponInput(!showCouponInput)}
                  activeOpacity={0.7}
                >
                  <View style={styles.couponToggleLeft}>
                    <View style={styles.couponIconCircle}>
                      <MaterialCommunityIcons
                        name="ticket-percent-outline"
                        size={18}
                        color={COLORS.gold}
                      />
                    </View>
                    <Text style={styles.couponToggleText}>
                      {couponApplied ? "Coupon Applied!" : "Apply Coupon Code"}
                    </Text>
                  </View>
                  {couponApplied ? (
                    <View style={styles.couponAppliedBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color={COLORS.success}
                      />
                      <Text style={styles.couponAppliedText}>SONOMA10</Text>
                    </View>
                  ) : (
                    <Ionicons
                      name={showCouponInput ? "chevron-up" : "chevron-down"}
                      size={18}
                      color={COLORS.textSecondary}
                    />
                  )}
                </TouchableOpacity>

                {showCouponInput && !couponApplied && (
                  <View style={styles.couponInputRow}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
                      placeholderTextColor="#A0A0A0"
                      value={couponCode}
                      onChangeText={setCouponCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.couponApplyBtn}
                      onPress={applyCoupon}
                    >
                      <Text style={styles.couponApplyText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </BlurView>
            </View>
          </View>
        )}

        {/* ═══════════════ ORDER SUMMARY — FROSTED GLASS ═══════════════ */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <View style={styles.frostedCard}>
              <BlurView
                intensity={60}
                tint="light"
                style={styles.summaryGlass}
              >
                {/* Line items */}
                <View style={styles.summaryLineItem}>
                  <Text style={styles.summaryLabel}>
                    Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)
                  </Text>
                  <Text style={styles.summaryValue}>
                    {formatPrice(subtotal)}
                  </Text>
                </View>

                {couponApplied && (
                  <View style={styles.summaryLineItem}>
                    <View style={styles.summaryLabelWithIcon}>
                      <Ionicons name="pricetag" size={12} color={COLORS.success} />
                      <Text style={[styles.summaryLabel, { color: COLORS.success }]}>
                        Coupon (SONOMA10)
                      </Text>
                    </View>
                    <Text style={[styles.summaryValue, { color: COLORS.success }]}>
                      −{formatPrice(discount)}
                    </Text>
                  </View>
                )}

                <View style={styles.summaryLineItem}>
                  <View style={styles.summaryLabelWithIcon}>
                    <Ionicons
                      name="car-outline"
                      size={12}
                      color={deliveryFee === 0 ? COLORS.success : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.summaryLabel,
                        deliveryFee === 0 && { color: COLORS.success },
                      ]}
                    >
                      Delivery
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.summaryValue,
                      deliveryFee === 0 && { color: COLORS.success },
                    ]}
                  >
                    {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
                  </Text>
                </View>

                {/* Divider */}
                <View style={styles.summaryDivider} />

                {/* Total */}
                <View style={styles.summaryTotalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>{formatPrice(total)}</Text>
                </View>

                {/* Savings */}
                {totalSavings > 0 && (
                  <View style={styles.savingsPill}>
                    <Ionicons name="sparkles" size={13} color={COLORS.gold} />
                    <Text style={styles.savingsPillText}>
                      You save {formatPrice(totalSavings)} on this order
                    </Text>
                  </View>
                )}
              </BlurView>
            </View>
          </View>
        )}

        {/* ═══════════════ SAVED FOR LATER ═══════════════ */}
        {savedItems.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Saved for Later</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{savedItems.length}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.savedRow}
            >
              {savedItems.map((item) => (
                <View key={item.id} style={styles.savedCard}>
                  <Image
                    source={{ uri: item.img }}
                    style={styles.savedImage}
                  />
                  <TouchableOpacity
                    style={styles.savedRemoveBtn}
                    onPress={() => removeSavedItem(item.id)}
                  >
                    <BlurView
                      intensity={70}
                      tint="dark"
                      style={styles.savedRemoveBlur}
                    >
                      <Ionicons name="close" size={12} color="white" />
                    </BlurView>
                  </TouchableOpacity>
                  <View style={styles.savedInfo}>
                    <Text style={styles.savedName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.savedPrice}>
                      {formatPrice(item.price)}
                    </Text>
                    <TouchableOpacity
                      style={styles.moveToCartBtn}
                      onPress={() => moveToCart(item.id)}
                    >
                      <Ionicons
                        name="bag-add-outline"
                        size={13}
                        color="white"
                      />
                      <Text style={styles.moveToCartText}>Move to Bag</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ═══════════════ COMPLETE YOUR LOOK ═══════════════ */}
        {cartItems.length > 0 && (
          <View style={styles.section}>
            <RecommendationStrip
              title="Complete Your Look"
              items={recommendedItems}
              loading={recommendationLoading}
              loadingText="Finding personalized picks..."
              actionLabel="Add"
              onAction={async (item) => {
                await addToCart({
                  id: item.id,
                  backendProductId: item.id,
                  name: item.name,
                  description: item.description || item.name,
                  price: item.price,
                  img: item.imageUrl,
                  label: item.category,
                });
              }}
            />
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>

      {/* ═══════════════ CHECKOUT — GLASS FOOTER ═══════════════ */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutWrapper}>
          <BlurView intensity={100} tint="dark" style={[styles.checkoutBar, { paddingBottom: insets.bottom ? insets.bottom + 15 : 25 }]}>
            <View style={styles.checkoutLeft}>
              <Text style={styles.checkoutTotal}>{formatPrice(total)}</Text>
              <Text style={styles.checkoutSubtext}>
                {totalSavings > 0
                  ? `Saving ${formatPrice(totalSavings)}`
                  : "Including delivery"}
              </Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
              <Text style={styles.checkoutBtnText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={16} color="white" />
            </TouchableOpacity>
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* ════ Frosted Header ════ */
  headerWrapper: {
    overflow: "hidden",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.subtleBorder,
  },
  checkoutBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 25,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerIconCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 4,
    color: COLORS.black,
  },
  headerCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  /* ════ Frosted Card — iOS Glass Effect ════ */
  frostedCard: {
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 4,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  frostedInner: {
    padding: 20,
  },

  /* ════ Free Delivery — Premium Banner ════ */
  deliveryBanner: {
    backgroundColor: COLORS.black,
    borderRadius: 24,
    padding: 22,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  deliveryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  deliveryIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  deliveryTextBlock: {
    flex: 1,
  },
  deliveryHeadline: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  deliverySubline: {
    fontSize: 12,
    color: "rgba(255,255,255,0.55)",
    letterSpacing: 0.3,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabelLeft: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.gold,
  },
  progressLabelRight: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.35)",
  },
  shopMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    marginTop: 14,
    gap: 6,
  },
  shopMoreText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.gold,
    letterSpacing: 2,
  },

  /* ════ Offers — Refined Luxury ════ */
  offersCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    marginBottom: 20,
    overflow: "hidden",
  },
  offersHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  offersHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  offersTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: 3,
  },
  offersCountPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  offersCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "white",
  },
  offersListContainer: {
    backgroundColor: "white",
    marginHorizontal: 8,
    marginBottom: 8,
    borderRadius: 18,
    paddingVertical: 6,
  },
  offerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  offerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(175,148,97,0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  offerTextBlock: {
    flex: 1,
  },
  offerPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 2,
  },
  offerSecondary: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  offerCode: {
    fontWeight: "800",
    color: COLORS.gold,
    letterSpacing: 0.5,
  },
  offerSep: {
    height: 1,
    backgroundColor: COLORS.cardBg,
    marginHorizontal: 16,
  },

  /* ════ Sections ════ */
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },

  /* ════ Cart Item — Glass Card ════ */
  cartItemGlass: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 12,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cartItemInner: {
    flexDirection: "row",
    padding: 16,
  },
  itemImage: {
    width: 96,
    height: 120,
    borderRadius: 16,
  },
  labelBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  labelText: {
    fontSize: 9,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  itemDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginTop: 3,
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.black,
    flex: 1,
    paddingRight: 8, // prevent name from overlapping with X
  },
  removeBtn: {
    padding: 4,
    marginRight: -4,
    marginTop: -4,
  },
  variantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 3,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  itemVariant: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
  },
  itemOriginalPrice: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    backgroundColor: "rgba(192,57,43,0.08)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.danger,
  },
  itemActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    paddingHorizontal: 2,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  quantityBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "700",
    minWidth: 24,
    textAlign: "center",
    color: COLORS.black,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.gold,
  },

  /* ════ Coupon — Glass ════ */
  couponToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  couponIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(175,148,97,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  couponToggleText: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  couponAppliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(46,125,50,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  couponAppliedText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.success,
  },
  couponInputRow: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
    alignItems: "stretch",
  },
  couponInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
    borderWidth: 1,
    borderColor: COLORS.subtleBorder,
  },
  couponApplyBtn: {
    backgroundColor: COLORS.black,
    borderRadius: 14,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  couponApplyText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14,
  },

  /* ════ Order Summary — Glass ════ */
  summaryGlass: {
    padding: 22,
  },
  summaryLineItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  summaryLabelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.black,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.subtleBorder,
    marginVertical: 6,
  },
  summaryTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: 0.3,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
  },
  savingsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(175,148,97,0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
  },
  savingsPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.gold,
    flex: 1,
  },

  /* ════ Count Badge ════ */
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },

  /* ════ Saved / Recommendations ════ */
  savedRow: {
    gap: 12,
  },
  savedCard: {
    width: 160,
    backgroundColor: COLORS.glass,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  savedImage: {
    width: "100%",
    height: 160,
  },
  savedRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 13,
    overflow: "hidden",
  },
  savedRemoveBlur: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  savedInfo: {
    padding: 12,
  },
  savedName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },
  savedPrice: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moveToCartBtn: {
    marginTop: 10,
    backgroundColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  moveToCartText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  addToCartMiniBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: COLORS.black,
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  addToCartMiniText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.black,
  },

  /* ════ Empty Cart ════ */
  emptyCart: {
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  emptyShopBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 30,
    backgroundColor: COLORS.black,
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  emptyShopBtnText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },

  /* ════ Checkout Footer — Glass ════ */
  checkoutWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "android" ? 20 : 30,
  },
  
  checkoutLeft: {},
  checkoutTotal: {
    fontSize: 20,
    fontWeight: "800",
    color: "white",
  },
  checkoutSubtext: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    marginTop: 2,
  },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.gold,
    borderRadius: 18,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    color: "white",
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
