import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { RecommendationStrip } from "@/components/recommendation-strip";
import { CartToast } from "@/components/cart-toast";
import { MainNav } from "@/components/main-nav";
import { getMlChat, getMlRecommendations, getProducts, type ProductRecord } from "@/lib/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCartToast } from "@/hooks/use-cart-toast";

const { width } = Dimensions.get("window");
const ITEM_SIZE = 220;

const heroData = [
  {
    id: 1,
    title: "THE COLLECTION",
    sub: "Backend-backed picks for your home",
    img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200",
  },
  {
    id: 2,
    title: "CURATED LIVING",
    sub: "Fresh arrivals and intelligent bundles",
    img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200",
  },
  {
    id: 3,
    title: "DESIGNED TOGETHER",
    sub: "Catalog, cart, and ML all in sync",
    img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200",
  },
];

function formatPrice(price: number) {
  return `Rs ${price.toLocaleString("en-IN")}`;
}

function HeroCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<Animated.FlatList<(typeof heroData)[number]>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % heroData.length;
      listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={styles.heroWrapper}>
      <Animated.FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={heroData}
        keyExtractor={(item) => String(item.id)}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.hero}>
            <Image source={{ uri: item.img }} style={styles.heroImage} />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroTitle}>{item.title}</Text>
              <Text style={styles.heroSub}>{item.sub}</Text>
            </View>
          </View>
        )}
      />
      <View style={styles.heroDotsContainer}>
        {heroData.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 18, 8],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: "clamp",
          });
          return <Animated.View key={index} style={[styles.heroDot, { width: dotWidth, opacity }]} />;
        })}
      </View>
    </View>
  );
}

function ProductCard({
  product,
  wishlisted,
  onToggleWishlist,
  onPress,
}: {
  product: ProductRecord;
  wishlisted: boolean;
  onToggleWishlist: () => Promise<void>;
  onPress: () => void;
}) {
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 1.05,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gesture) => {
        rotateY.setValue(gesture.dx / 20);
        rotateX.setValue(-gesture.dy / 20);
      },
      onPanResponderRelease: () => {
        Animated.parallel([
          Animated.spring(rotateX, { toValue: 0, useNativeDriver: true }),
          Animated.spring(rotateY, { toValue: 0, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  const rx = rotateX.interpolate({
    inputRange: [-10, 10],
    outputRange: ["-10deg", "10deg"],
  });
  const ry = rotateY.interpolate({
    inputRange: [-10, 10],
    outputRange: ["-10deg", "10deg"],
  });

  return (
    <TouchableOpacity
      {...panResponder.panHandlers}
      activeOpacity={0.92}
      style={{ marginLeft: 20 }}
      onPress={onPress}>
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ perspective: 1000 }, { rotateX: rx }, { rotateY: ry }, { scale }],
          },
        ]}>
        <TouchableOpacity
          style={[styles.wishlistButton, wishlisted && styles.wishlistButtonActive]}
          onPress={() => void onToggleWishlist()}
          activeOpacity={0.85}>
          <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={16} color={wishlisted ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Image source={{ uri: product.imageUrl }} style={styles.cardImage} />
        <Text style={styles.cardName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.cardPrice}>{formatPrice(product.price)}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function AnimatedProductList({
  products,
  isWishlisted,
  onToggleWishlist,
  onOpenProduct,
}: {
  products: ProductRecord[];
  isWishlisted: (identifier: string) => boolean;
  onToggleWishlist: (product: ProductRecord) => Promise<void>;
  onOpenProduct: (product: ProductRecord) => void;
}) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Animated.FlatList
      horizontal
      data={products}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToInterval={ITEM_SIZE + 20}
      decelerationRate="fast"
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingRight: width / 2 }}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
        { useNativeDriver: true }
      )}
      renderItem={({ item, index }) => {
        const inputRange = [
          (index - 1) * (ITEM_SIZE + 20),
          index * (ITEM_SIZE + 20),
          (index + 1) * (ITEM_SIZE + 20),
        ];

        const scale = scrollX.interpolate({
          inputRange,
          outputRange: [0.85, 1, 0.85],
          extrapolate: "clamp",
        });
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.6, 1, 0.6],
          extrapolate: "clamp",
        });

        return (
          <Animated.View style={{ opacity, transform: [{ scale }] }}>
            <ProductCard
              product={item}
              wishlisted={isWishlisted(item.slug)}
              onToggleWishlist={() => onToggleWishlist(item)}
              onPress={() => onOpenProduct(item)}
            />
          </Animated.View>
        );
      }}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { totalItemCount, addToCart, cartItems } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { toast, toastAnim, showToast } = useCartToast();
  const [searchText, setSearchText] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
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
      try {
        setRecommendationLoading(true);
        const response = await getMlRecommendations({
          cartItems: cartItems.slice(0, 4).map((item) => ({
            name: item.name,
            description: item.description,
            price: item.price,
            label: item.label,
            category: item.label,
            backendProductId: typeof item.backendProductId === "string" ? item.backendProductId : undefined,
          })),
          text: "home recommendations",
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
  }, [cartItems]);

  useEffect(() => {
    let mounted = true;
    const trimmedSearch = searchText.trim();

    if (!trimmedSearch) {
      setSearchResults([]);
      setAiSuggestionReply("");
      setAiSuggestedProducts([]);
      setIsSearching(false);
      setIsAiSearching(false);
      return () => {
        mounted = false;
      };
    }

    const timeoutId = setTimeout(() => {
      const loadSearch = async () => {
        try {
          setIsSearching(true);
          const response = await getProducts({
            q: trimmedSearch,
            category: activeCategory === "all" ? undefined : activeCategory,
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

      void loadSearch();
    }, 250);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [activeCategory, searchText]);

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
              backendProductId: typeof item.backendProductId === "string" ? item.backendProductId : undefined,
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

  const categories = useMemo(() => {
    return ["all", ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))];
  }, [products]);

  const displayedProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesSearch =
        search.length === 0 ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search) ||
        product.tags.some((tag) => tag.toLowerCase().includes(search));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, searchText]);

  const showSearchSuggestions = searchText.trim().length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>WILLIAMS SONOMA</Text>
          <TouchableOpacity style={styles.cartIconButton} onPress={() => router.push("/cart")}>
            <Ionicons name="cart-outline" size={22} color="#000" />
            {totalItemCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItemCount > 9 ? "9+" : totalItemCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchWrapper}>
        <View style={styles.searchBox}>
          <Feather name="search" size={16} color="#999" />
          <TextInput
            placeholder="Search luxury collection..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {showSearchSuggestions ? (
        <View style={styles.searchSuggestionsCard}>
          <View style={styles.searchSuggestionsHeader}>
            <Text style={styles.searchSuggestionsTitle}>Search suggestions</Text>
            {isSearching ? <Text style={styles.searchSuggestionsMeta}>Searching...</Text> : null}
          </View>

          {searchResults.length > 0 ? (
            <View style={styles.suggestionList}>
              {searchResults.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchText("");
                    router.push(`/product/${product.slug}`);
                  }}>
                  <Image source={{ uri: product.imageUrl }} style={styles.suggestionImage} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.suggestionMeta} numberOfLines={1}>
                      {product.category} • {formatPrice(product.price)}
                    </Text>
                  </View>
                  <Ionicons name="arrow-forward" size={16} color="#888" />
                </TouchableOpacity>
              ))}
            </View>
          ) : !isSearching ? (
            <Text style={styles.emptySuggestionText}>No matching products found yet. Try a different keyword.</Text>
          ) : null}

          {isAiSearching ? <Text style={styles.aiStatusText}>AI is curating suggestions...</Text> : null}

          {aiSuggestionReply ? (
            <View style={styles.aiReplyCard}>
              <Text style={styles.aiReplyLabel}>AI suggestion</Text>
              <Text style={styles.aiReplyText}>{aiSuggestionReply}</Text>
            </View>
          ) : null}

          {aiSuggestedProducts.length > 0 ? (
            <View style={styles.aiSuggestionBlock}>
              <Text style={styles.aiSuggestionHeading}>AI-picked products</Text>
              {aiSuggestedProducts.map((product) => (
                <TouchableOpacity
                  key={`ai-${product.id}`}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setSearchText("");
                    router.push(`/product/${product.slug}`);
                  }}>
                  <Image source={{ uri: product.imageUrl }} style={styles.suggestionImage} />
                  <View style={styles.suggestionContent}>
                    <Text style={styles.suggestionName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.suggestionMeta} numberOfLines={1}>
                      {product.category} • {formatPrice(product.price)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.aiAddButton, recentlyAdded.has(product.id) && styles.aiAddButtonAdded]}
                    onPress={() => {
                      void addToCart({
                        id: product.id,
                        backendProductId: product.id,
                        name: product.name,
                        description: product.description || product.name,
                        price: product.price,
                        img: product.imageUrl,
                        label: product.category,
                      });
                      setRecentlyAdded((prev) => new Set(prev).add(product.id));
                      setTimeout(() => {
                        setRecentlyAdded((prev) => {
                          const next = new Set(prev);
                          next.delete(product.id);
                          return next;
                        });
                      }, 2000);
                    }}>
                    <Ionicons
                      name={recentlyAdded.has(product.id) ? "checkmark" : "add"}
                      size={16}
                      color={recentlyAdded.has(product.id) ? "#fff" : "#000"}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      <ScrollView showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.category, item === activeCategory && styles.categoryActive]}
              onPress={() => setActiveCategory(item)}>
              <Text style={[styles.categoryText, item === activeCategory && styles.categoryTextActive]}>
                {item === "all" ? "All" : item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <HeroCarousel />

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <AnimatedProductList
            products={displayedProducts}
            isWishlisted={isWishlisted}
            onToggleWishlist={async (product) => {
              await toggleWishlist({
                slug: product.slug,
                title: product.name,
                price: formatPrice(product.price),
                image: product.imageUrl,
                description: product.description || product.name,
                backendProductId: product.id,
              });
            }}
            onOpenProduct={(product) => router.push(`/product/${product.slug}`)}
          />
        </View>

        <RecommendationStrip
          title="Recommended for you"
          items={recommendedProducts.length > 0 ? recommendedProducts : displayedProducts.slice(0, 4)}
          loading={recommendationLoading}
          loadingText="Finding matching picks..."
          onAction={async (product) => {
            await addToCart({
              id: product.id,
              backendProductId: product.id,
              name: product.name,
              description: product.description || product.name,
              price: product.price,
              img: product.imageUrl,
              label: product.category,
            });
          }}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      <CartToast toast={toast} toastAnim={toastAnim} bottom={116} onPress={() => router.push("/cart")} />
      <MainNav activeRoute="home" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20 },
  logo: { fontSize: 14, letterSpacing: 4, fontWeight: "800" },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchWrapper: { paddingHorizontal: 20, marginBottom: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
  },
  searchInput: { marginLeft: 10, flex: 1 },
  searchSuggestionsCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ECEAE4",
    gap: 12,
  },
  searchSuggestionsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  searchSuggestionsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.3,
  },
  searchSuggestionsMeta: {
    fontSize: 12,
    color: "#888",
    fontWeight: "600",
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
    backgroundColor: "#F3F3F3",
  },
  suggestionContent: {
    flex: 1,
    gap: 4,
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111",
  },
  suggestionMeta: {
    fontSize: 12,
    color: "#777",
    fontWeight: "600",
  },
  emptySuggestionText: {
    fontSize: 13,
    color: "#777",
    lineHeight: 20,
  },
  aiStatusText: {
    fontSize: 12,
    color: "#AF9461",
    fontWeight: "700",
  },
  aiReplyCard: {
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(175,148,97,0.12)",
    gap: 6,
  },
  aiReplyLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#AF9461",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  aiReplyText: {
    fontSize: 13,
    color: "#111",
    lineHeight: 20,
    fontWeight: "600",
  },
  aiSuggestionBlock: {
    gap: 10,
  },
  aiSuggestionHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#111",
  },
  aiAddButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(175,148,97,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  aiAddButtonAdded: {
    backgroundColor: "#AF9461",
  },
  categoryRow: { paddingLeft: 20, marginVertical: 10 },
  category: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryActive: { backgroundColor: "#000" },
  categoryText: { color: "#666" },
  categoryTextActive: { color: "#fff" },
  heroWrapper: {
    marginBottom: 20,
    alignItems: "center",
  },
  hero: {
    width,
    alignItems: "center",
  },
  heroImage: {
    width: width - 40,
    height: 300,
    borderRadius: 20,
  },
  heroOverlay: { position: "absolute", bottom: 20, left: 40 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  heroSub: { color: "#fff", fontSize: 12, maxWidth: 260 },
  heroDotsContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
  },
  heroDot: {
    height: 6,
    borderRadius: 4,
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },
  section: { marginTop: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "700", marginLeft: 20, marginBottom: 10 },
  card: {
    width: ITEM_SIZE,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  wishlistButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  wishlistButtonActive: {
    backgroundColor: "#000",
  },
  cardImage: { height: 200, borderRadius: 15 },
  cardName: { marginTop: 10, fontWeight: "600", fontSize: 16 },
  cardPrice: { color: "#666", marginTop: 4 },
  nav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 14,
    borderTopWidth: 0.5,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  cartIconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  navItem: { alignItems: "center" },
  dot: {
    width: 4,
    height: 4,
    backgroundColor: "#000",
    borderRadius: 2,
    marginTop: 5,
    opacity: 0,
  },
  dotActive: { opacity: 1 },
  statusBox: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "#F8F8F8",
  },
  statusText: {
    color: "#666",
    fontSize: 13,
  },
});
