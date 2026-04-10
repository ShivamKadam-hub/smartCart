import React, { useState, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCart } from "../../context/CartContext";
import { getProductBySlug, Product, Review } from "../../constants/products";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  goldLight: "#D4BE8D",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
  star: "#F5A623",
  starEmpty: "#D9D9D9",
  success: "#2E7D32",
};

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {Array.from({ length: full }).map((_, i) => (
        <Ionicons key={`f${i}`} name="star" size={size} color={COLORS.star} />
      ))}
      {half === 1 && <Ionicons name="star-half" size={size} color={COLORS.star} />}
      {Array.from({ length: empty }).map((_, i) => (
        <Ionicons key={`e${i}`} name="star-outline" size={size} color={COLORS.starEmpty} />
      ))}
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>
            {review.userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.reviewMeta}>
          <Text style={styles.reviewName}>{review.userName}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>
        <StarRating rating={review.rating} size={12} />
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );
}

function TagPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tagPill}>
      <Text style={styles.tagLabel}>{label}</Text>
      <Text style={styles.tagValue}>{value}</Text>
    </View>
  );
}

function ImageGallery({ images, tag }: { images: string[]; tag?: string }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList<string>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToOffset({ offset: index * width, animated: true });
    setActiveIndex(index);
  };

  return (
    <View>
      {/* Main swipeable gallery */}
      <View style={styles.imageContainer}>
        <Animated.FlatList
          ref={flatListRef as any}
          data={images}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumEnd}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.image} />
          )}
        />
        {tag && (
          <View style={styles.imageBadge}>
            <Text style={styles.imageBadgeText}>{tag}</Text>
          </View>
        )}

        {/* Image counter */}
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {activeIndex + 1}/{images.length}
          </Text>
        </View>

        {/* Animated dots */}
        <View style={styles.galleryDotsContainer}>
          {images.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 22, 8],
              extrapolate: "clamp",
            });
            const dotOpacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[
                  styles.galleryDot,
                  { width: dotWidth, opacity: dotOpacity },
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Thumbnail strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.thumbnailStrip}
      >
        {images.map((img, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => scrollToIndex(i)}
            activeOpacity={0.8}
            style={[
              styles.thumbnailWrap,
              activeIndex === i && styles.thumbnailActive,
            ]}
          >
            <Image source={{ uri: img }} style={styles.thumbnail} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const product = slug ? getProductBySlug(slug) : undefined;
  const { addToCart } = useCart();
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      img: product.img,
      label: product.tag,
      originalPrice: product.originalPrice,
      color: product.color,
    });
    router.push("/cart");
  };



  const displayedReviews = showAllReviews
    ? product?.reviews ?? []
    : (product?.reviews ?? []).slice(0, 2);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* ── Floating Header ── */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {product ? (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* ── Product Image Gallery ── */}
            <ImageGallery images={product.images} tag={product.tag} />

            {/* ── Main Info ── */}
            <View style={styles.infoSection}>
              <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
              <Text style={styles.title}>{product.name}</Text>

              {/* Price Row */}
              <View style={styles.priceRow}>
                <Text style={styles.price}>{product.displayPrice}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>
                    ₹{product.originalPrice.toLocaleString("en-IN")}
                  </Text>
                )}
                {product.originalPrice && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>
                      {Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )}
                      % OFF
                    </Text>
                  </View>
                )}
              </View>

              {/* Rating Summary */}
              <TouchableOpacity style={styles.ratingRow} activeOpacity={0.7}>
                <StarRating rating={product.rating} size={16} />
                <Text style={styles.ratingText}>{product.rating}</Text>
                <Text style={styles.reviewCountText}>
                  ({product.reviewCount} reviews)
                </Text>
              </TouchableOpacity>

              {/* Color Swatch */}
              {product.color && (
                <View style={styles.colorRow}>
                  <Text style={styles.colorLabel}>Colour:</Text>
                  <View
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor:
                          product.color === "Walnut"
                            ? "#6B4226"
                            : product.color === "Emerald"
                              ? "#2E8B57"
                              : product.color === "Flame Orange"
                                ? "#E25822"
                                : "#B5A642",
                      },
                    ]}
                  />
                  <Text style={styles.colorName}>{product.color}</Text>
                </View>
              )}
            </View>

            {/* ── Product Tags ── */}
            <View style={styles.tagsSection}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              <View style={styles.tagsGrid}>
                <TagPill label="Product ID" value={`#${product.product_id}`} />
                <TagPill label="Category" value={product.category} />
                <TagPill label="Style" value={product.style} />
                <TagPill label="Brand" value={product.brand} />
              </View>
            </View>

            {/* ── Description ── */}
            <View style={styles.descSection}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>

            {/* ── Ratings & Reviews ── */}
            <View style={styles.reviewsSection}>
              <View style={styles.reviewsSectionHeader}>
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
                <View style={styles.overallRating}>
                  <Text style={styles.overallRatingNumber}>{product.rating}</Text>
                  <Ionicons name="star" size={14} color={COLORS.star} />
                </View>
              </View>

              {/* Rating Breakdown */}
              <View style={styles.ratingBreakdown}>
                <View style={styles.ratingBreakdownLeft}>
                  <Text style={styles.bigRating}>{product.rating}</Text>
                  <StarRating rating={product.rating} size={18} />
                  <Text style={styles.totalRatings}>{product.reviewCount} ratings</Text>
                </View>
                <View style={styles.ratingBars}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count =
                      product.reviews.filter((r) => Math.floor(r.rating) === star).length;
                    const pct =
                      product.reviews.length > 0
                        ? (count / product.reviews.length) * 100
                        : 0;
                    return (
                      <View key={star} style={styles.ratingBarRow}>
                        <Text style={styles.barStar}>{star}</Text>
                        <Ionicons name="star" size={10} color={COLORS.star} />
                        <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${pct}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Individual Reviews */}
              {displayedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {product.reviews.length > 2 && (
                <TouchableOpacity
                  onPress={() => setShowAllReviews(!showAllReviews)}
                  style={styles.showAllButton}
                  activeOpacity={0.82}
                >
                  <Text style={styles.showAllText}>
                    {showAllReviews
                      ? "Show Less"
                      : `View All ${product.reviews.length} Reviews`}
                  </Text>
                  <Ionicons
                    name={showAllReviews ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={COLORS.gold}
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* ── Sticky Footer ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.addToCartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.85}
            >
              <Ionicons name="bag-add-outline" size={18} color="white" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() =>
                router.push({
                  pathname: "/checkout",
                  params: { product: product.name },
                })
              }
              activeOpacity={0.85}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.goldLight} />
          <Text style={styles.emptyTitle}>Product not found</Text>
          <Text style={styles.emptyDesc}>
            Sorry, we couldn't find that item. Try selecting another product.
          </Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => router.back()}>
            <Text style={styles.emptyBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  /* ── Floating Header ── */
  floatingHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBtnWishlisted: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },

  /* ── Image Gallery ── */
  imageContainer: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: width,
    height: width * 1.1,
  },
  imageBadge: {
    position: "absolute",
    top: 20,
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "rgba(22,22,22,0.78)",
  },
  imageBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  imageCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "rgba(22,22,22,0.6)",
  },
  imageCounterText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  galleryDotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 16,
    alignSelf: "center",
  },
  galleryDot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
    marginHorizontal: 3,
  },
  thumbnailStrip: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  thumbnailWrap: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  thumbnailActive: {
    borderColor: COLORS.gold,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },

  /* ── Main Info ── */
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  brand: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
    color: COLORS.gold,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
    lineHeight: 34,
    marginBottom: 14,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
  },
  originalPrice: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textDecorationLine: "line-through",
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: COLORS.success + "18",
  },
  discountText: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.success,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
  },
  reviewCountText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  colorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  colorLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  colorName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },

  /* ── Tags ── */
  tagsSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 14,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tagPill: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: "46%",
  },
  tagLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  tagValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
    textTransform: "capitalize",
  },

  /* ── Description ── */
  descSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textSecondary,
  },

  /* ── Reviews ── */
  reviewsSection: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  reviewsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  overallRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: COLORS.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  overallRatingNumber: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.gold,
  },
  ratingBreakdown: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
    gap: 24,
  },
  ratingBreakdownLeft: {
    alignItems: "center",
    justifyContent: "center",
  },
  bigRating: {
    fontSize: 36,
    fontWeight: "800",
    color: COLORS.black,
  },
  totalRatings: {
    marginTop: 6,
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  ratingBars: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  barStar: {
    width: 10,
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    backgroundColor: COLORS.star,
    borderRadius: 3,
  },
  reviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 12,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatarText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.gold,
  },
  reviewMeta: {
    flex: 1,
  },
  reviewName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },
  reviewDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    backgroundColor: COLORS.goldSoft,
    borderRadius: 16,
    marginTop: 4,
  },
  showAllText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.gold,
  },

  /* ── Footer ── */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerWishlistBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartBtn: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.black,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addToCartText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },
  buyNowBtn: {
    flex: 0.7,
    height: 50,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: "center",
    alignItems: "center",
  },
  buyNowText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },

  /* ── Empty State ── */
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 36,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.black,
    marginTop: 16,
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 16,
  },
  emptyBtnText: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
  },
});
