import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { CartToast } from "../../components/cart-toast";
import { RecommendationStrip } from "../../components/recommendation-strip";
import { MainNav } from "../../components/main-nav";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCartToast } from "../../hooks/use-cart-toast";
import { getMlChat, getMlRecommendations, getProducts, type ProductRecord } from "@/lib/api";

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ExploreScreen() {
  const router = useRouter();
  const { addToCart, cartItems, totalItemCount } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast, toastAnim, showToast } = useCartToast();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<ProductRecord[]>([]);
  const [searchResults, setSearchResults] = useState<ProductRecord[]>([]);
  const [aiSuggestionReply, setAiSuggestionReply] = useState("");
  const [aiSuggestedProducts, setAiSuggestedProducts] = useState<ProductRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await getProducts();
        if (mounted) {
          setProducts(response.data);
        }
      } catch (error) {
        if (mounted) {
          setLoadError(error instanceof Error ? error.message : "Unable to load products.");
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      if (products.length === 0) {
        setRecommendedProducts([]);
        return;
      }

      try {
        setRecommendationLoading(true);
        const response = await getMlRecommendations({
          cartItems: products.slice(0, 4).map((item) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            label: item.category,
            category: item.category,
            backendProductId: item.id,
          })),
          text: "explore recommendations",
          topK: 4,
        });

        if (mounted) {
          setRecommendedProducts(response.data);
        }
      } catch {
        if (mounted) {
          setRecommendedProducts([]);
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
  }, [products]);

  useEffect(() => {
    let mounted = true;
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setIsSearching(false);
      return () => {
        mounted = false;
      };
    }

    const timeoutId = setTimeout(() => {
      const loadSearchResults = async () => {
        try {
          setIsSearching(true);
          const response = await getProducts({
            q: trimmedSearch,
            category: activeFilter === "all" ? undefined : activeFilter,
          });

          if (mounted) {
            setSearchResults(response.data.slice(0, 6));
          }
        } catch {
          if (mounted) {
            setSearchResults([]);
          }
        } finally {
          if (mounted) {
            setIsSearching(false);
          }
        }
      };

      void loadSearchResults();
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeFilter, searchText]);

  useEffect(() => {
    let mounted = true;
    const trimmedSearch = searchText.trim();

    if (trimmedSearch.length < 2) {
      setAiSuggestionReply("");
      setAiSuggestedProducts([]);
      setIsAiSearching(false);
      return () => {
        mounted = false;
      };
    }

    const timeoutId = setTimeout(() => {
      const loadAiSuggestions = async () => {
        try {
          setIsAiSearching(true);
          const response = await getMlChat({
            text: `User is searching for: ${trimmedSearch}`,
            topK: 4,
            cartItems: cartItems.slice(0, 4).map((item) => ({
              name: item.name,
              description: item.description,
              price: item.price,
              label: item.label,
              category: item.label,
              backendProductId: item.backendProductId,
            })),
          });

          if (mounted) {
            setAiSuggestionReply(response.data.reply || "");
            setAiSuggestedProducts(response.data.items || []);
          }
        } catch {
          if (mounted) {
            setAiSuggestionReply("");
            setAiSuggestedProducts([]);
          }
        } finally {
          if (mounted) {
            setIsAiSearching(false);
          }
        }
      };

      void loadAiSuggestions();
    }, 450);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [cartItems, searchText]);

  const filters = useMemo(() => {
    return [
      { label: "All", value: "all" },
      ...Array.from(new Set(products.map((item) => item.category).filter(Boolean))).map((category) => ({
        label: category.charAt(0).toUpperCase() + category.slice(1),
        value: category,
      })),
    ];
  }, [products]);

  const visibleProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return products.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.category === activeFilter;
      const matchesSearch =
        search.length === 0 ||
        item.name.toLowerCase().includes(search) ||
        item.tags.some((tag) => tag.toLowerCase().includes(search)) ||
        item.description.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, products, searchText]);

  const categorySuggestions = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    if (!search) {
      return [];
    }

    return filters
      .filter((item) => item.value !== "all")
      .filter(
        (item) =>
          item.label.toLowerCase().includes(search) || item.value.toLowerCase().includes(search)
      )
      .slice(0, 4);
  }, [filters, searchText]);

  const showSuggestions = searchText.trim().length > 0;

  const handleAddToCart = async (item: ProductRecord) => {
    await addToCart({
      id: item.id,
      backendProductId: item.id,
      name: item.name,
      description: item.description || `${item.category} product`,
      price: item.price,
      img: item.imageUrl,
      label: item.category,
    });
    setRecentlyAdded((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setRecentlyAdded((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 2000);
    showToast(`${item.name} added to cart`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.subtitle}>Discover categories, trends, and fresh arrivals.</Text>
        </View>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push("/cart")} activeOpacity={0.82}>
          <Ionicons name="bag-outline" size={18} color={COLORS.black} />
          {totalItemCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalItemCount > 9 ? "9+" : totalItemCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={16} color={COLORS.textSecondary} />
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search styles, categories, or materials"
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
          />
        </View>

        {showSuggestions ? (
          <View style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionTitle}>Search suggestions</Text>
              {isSearching ? <Text style={styles.suggestionMeta}>Searching...</Text> : null}
            </View>

            {categorySuggestions.length > 0 ? (
              <View style={styles.suggestionChipRow}>
                {categorySuggestions.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.suggestionChip}
                    onPress={() => {
                      setActiveFilter(item.value);
                      setSearchText("");
                    }}
                    activeOpacity={0.82}>
                    <Text style={styles.suggestionChipText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}

            {searchResults.length > 0 ? (
              <View style={styles.suggestionList}>
                {searchResults.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSearchText("");
                      router.push(`/product/${item.slug}`);
                    }}
                    activeOpacity={0.82}>
                    <Image source={{ uri: item.imageUrl }} style={styles.suggestionImage} />
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionItemTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.suggestionItemMeta} numberOfLines={1}>
                        {item.category} • Rs {item.price.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <Ionicons name="arrow-forward" size={16} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : !isSearching ? (
              <Text style={styles.emptySuggestionText}>No matching products yet. Try another keyword.</Text>
            ) : null}

            {isAiSearching ? (
              <Text style={styles.aiStatusText}>AI is curating smarter matches...</Text>
            ) : null}

            {aiSuggestionReply ? (
              <View style={styles.aiReplyCard}>
                <Text style={styles.aiReplyLabel}>AI suggestion</Text>
                <Text style={styles.aiReplyText}>{aiSuggestionReply}</Text>
              </View>
            ) : null}

            {aiSuggestedProducts.length > 0 ? (
              <View style={styles.aiSuggestionBlock}>
                <Text style={styles.aiSuggestionHeading}>AI-picked products</Text>
                {aiSuggestedProducts.map((item) => (
                  <TouchableOpacity
                    key={`ai-${item.id}`}
                    style={styles.suggestionItem}
                    onPress={() => {
                      setSearchText("");
                      router.push(`/product/${item.slug}`);
                    }}
                    activeOpacity={0.82}>
                    <Image source={{ uri: item.imageUrl }} style={styles.suggestionImage} />
                    <View style={styles.suggestionContent}>
                      <Text style={styles.suggestionItemTitle} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.suggestionItemMeta} numberOfLines={2}>
                        {item.category} • Rs {item.price.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.aiAddButton}
                      onPress={() => void handleAddToCart(item)}
                      activeOpacity={0.85}>
                      <Ionicons name="add" size={16} color={COLORS.black} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((item) => {
            const active = item.value === activeFilter;
            return (
              <TouchableOpacity
                key={item.value}
                style={[styles.filterPill, active && styles.filterPillActive]}
                onPress={() => setActiveFilter(item.value)}
                activeOpacity={0.82}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity style={styles.hero} onPress={() => router.push("/category/decor")} activeOpacity={0.9}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1200",
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTag}>Editor Curated</Text>
            <Text style={styles.heroTitle}>Soft textures and sculptural accents</Text>
            <Text style={styles.heroCopy}>Open the decor collection and shop the full story.</Text>
          </View>
        </TouchableOpacity>

        <RecommendationStrip
          title="Recommended for you"
          items={recommendedProducts.length > 0 ? recommendedProducts : visibleProducts.slice(0, 4)}
          loading={recommendationLoading}
          loadingText="Finding personalized picks..."
          onAction={async (item) => {
            await handleAddToCart(item);
          }}
        />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop now</Text>
          <Text style={styles.sectionMeta}>{visibleProducts.length} results</Text>
        </View>

        {isLoading ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>Loading products from backend...</Text>
          </View>
        ) : null}
        {loadError ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{loadError}</Text>
          </View>
        ) : null}

        <View style={styles.grid}>
          {visibleProducts.map((item) => (
            <View key={item.id} style={styles.card}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => router.push(`/product/${item.slug}`)}>
                <View style={styles.imageWrap}>
                  <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
                  <View style={styles.tagPill}>
                    <Text style={styles.tagText}>{item.category}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.heartButton, isWishlisted(item.slug) && styles.heartButtonActive]}
                    onPress={() =>
                      void toggleWishlist({
                        slug: item.slug,
                        title: item.name,
                        price: `Rs ${item.price.toLocaleString("en-IN")}`,
                        image: item.imageUrl,
                        description: item.description || item.name,
                        backendProductId: item.id,
                      })
                    }
                    activeOpacity={0.85}>
                    <Ionicons
                      name={isWishlisted(item.slug) ? "heart" : "heart-outline"}
                      size={16}
                      color={isWishlisted(item.slug) ? "#fff" : COLORS.black}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardPrice}>{`Rs ${item.price.toLocaleString("en-IN")}`}</Text>
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.categoryAction}
                  onPress={() => router.push(`/category/${normalizeSlug(item.category)}`)}
                  activeOpacity={0.82}>
                  <Text style={styles.categoryActionText}>Open</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addButton, recentlyAdded.has(item.id) && styles.addButtonAdded]}
                  onPress={() => void handleAddToCart(item)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={recentlyAdded.has(item.id) ? "checkmark" : "add"}
                    size={16}
                    color={recentlyAdded.has(item.id) ? "#fff" : COLORS.black}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CartToast toast={toast} toastAnim={toastAnim} bottom={116} onPress={() => router.push("/cart")} />
      <MainNav activeRoute="explore" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 5,
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
  scrollContent: {
    paddingBottom: 40,
  },
  searchWrap: {
    marginHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: COLORS.black,
    fontSize: 14,
    fontWeight: "500",
  },
  suggestionCard: {
    marginHorizontal: 24,
    marginTop: 12,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 14,
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.black,
    letterSpacing: 0.4,
  },
  suggestionMeta: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  suggestionChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.goldSoft,
  },
  suggestionChipText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  suggestionList: {
    gap: 10,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  suggestionImage: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "#EFEDE7",
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
  },
  suggestionItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  suggestionItemMeta: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  emptySuggestionText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  aiStatusText: {
    fontSize: 12,
    color: COLORS.gold,
    fontWeight: "700",
  },
  aiReplyCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.goldSoft,
    gap: 6,
  },
  aiReplyLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.gold,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  aiReplyText: {
    fontSize: 13,
    color: COLORS.black,
    lineHeight: 20,
    fontWeight: "600",
  },
  aiSuggestionBlock: {
    gap: 10,
  },
  aiSuggestionHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.black,
  },
  aiAddButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  filterRow: {
    paddingHorizontal: 24,
    gap: 10,
    paddingVertical: 18,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.goldSoft,
    borderColor: COLORS.gold,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },
  filterTextActive: {
    color: COLORS.gold,
  },
  hero: {
    marginHorizontal: 24,
    borderRadius: 26,
    overflow: "hidden",
    height: 280,
    marginBottom: 24,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.22)",
  },
  heroTag: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  heroTitle: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 8,
    maxWidth: 260,
  },
  heroCopy: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 260,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
  },
  statusBox: {
    marginHorizontal: 24,
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  grid: {
    paddingHorizontal: 24,
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrap: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 220,
    borderRadius: 18,
  },
  tagPill: {
    position: "absolute",
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "rgba(22,22,22,0.78)",
  },
  tagText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  heartButtonActive: {
    backgroundColor: "#000",
  },
  cardTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.black,
  },
  cardPrice: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  cardFooter: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryAction: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: COLORS.goldSoft,
  },
  categoryActionText: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "800",
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonAdded: {
    backgroundColor: COLORS.gold,
  },
  bottomSpacer: {
    height: 130,
  },
});
