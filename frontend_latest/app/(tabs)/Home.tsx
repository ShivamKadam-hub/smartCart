import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  StatusBar,
  Animated,
  PanResponder,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCart } from "../../context/CartContext";
import { PRODUCTS, HOME_CATEGORIES, getProductsForHomeCategory, Product } from "../../constants/products";

const { width } = Dimensions.get("window");
const ITEM_SIZE = 220;

const heroData = [
  { id: 1, title: "THE CLOUD", sub: "Spring Collection 2026", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1200" },
  { id: 2, title: "MODERN LIVING", sub: "Elevate your space", img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=1200" },
  { id: 3, title: "NATURE INSPIRED", sub: "Eco-friendly pieces", img: "https://images.unsplash.com/photo-1540574163026-643ea20ade25?q=80&w=1200" },
];

function HeroCarousel() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<Animated.FlatList<any>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    let interval = setInterval(() => {
      let nextIndex = (currentIndex + 1) % heroData.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 3500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.heroWrapper}>
      <Animated.FlatList
        ref={flatListRef}
        data={heroData}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
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
        {heroData.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
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
          return (
            <Animated.View
              key={i}
              style={[styles.heroDot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>
    </View>
  );
}

function AnimatedProductList({ displayedProducts }: { displayedProducts: any[] }) {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <Animated.FlatList
      data={displayedProducts}
      keyExtractor={(item, index) => index.toString()}
      horizontal
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
            <ProductCard product={item} />
          </Animated.View>
        );
      }}
    />
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { totalItemCount } = useCart();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [activeCategory, setActiveCategory] = useState("Sofa");

  const categories = HOME_CATEGORIES;

  const displayedProducts = getProductsForHomeCategory(activeCategory);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>WILLIAMS SONOMA</Text>
          <TouchableOpacity style={styles.cartIconButton} onPress={() => router.push("/cart")}> 
            <Ionicons name="cart-outline" size={22} color="#000" />
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

      {/* SEARCH */}
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

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* CATEGORIES */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {categories.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.category, item === activeCategory && styles.categoryActive]}
              onPress={() => setActiveCategory(item)}
            >
              <Text style={[styles.categoryText, item === activeCategory && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* HERO CAROUSEL */}
        <HeroCarousel />

        {/* PRODUCTS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>New Arrivals</Text>
          <AnimatedProductList displayedProducts={displayedProducts} />
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* 🔥 APPLE NAVBAR */}
      <View style={styles.nav}>
        {(
          [
            { name: "home" as const, key: "home", route: "/Home" as const },
            { name: "compass" as const, key: "explore", route: "/explore" as const },
            { name: "layers" as const, key: "bundle-tracker", route: "/bundle-tracker" as const },
            { name: "user" as const, key: "profile", route: "/profile" as const },
          ] as const
        ).map((item) => (
          <TouchableOpacity
            key={item.key}
            onPress={() => {
              setActiveTab(item.key);
              router.push(item.route);
            }}
            style={styles.navItem}
          >
            <Feather
              name={item.name}
              size={22}
              color={activeTab === item.key ? "#000" : "#999"}
            />
            <View style={[styles.dot, activeTab === item.key && styles.dotActive]} />
          </TouchableOpacity>
        ))}
      </View>

    </SafeAreaView>
  );
}

function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const productSlug = product.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

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

      onPanResponderMove: (e, g) => {
        rotateY.setValue(g.dx / 20);
        rotateX.setValue(-g.dy / 20);
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
    outputRange: ['-10deg', '10deg'],
  });

  const ry = rotateY.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg'],
  });

  return (
    <TouchableOpacity
      {...panResponder.panHandlers}
      activeOpacity={0.9}
      style={{ marginLeft: 20 }}
      onPress={() => router.push(`/product/[slug]?slug=${productSlug}`)}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { perspective: 1000 },
              { rotateX: rx },
              { rotateY: ry },
              { scale },
            ],
          },
        ]}
      >
        <Image source={{ uri: product.img }} style={styles.cardImage} />
        <Text style={styles.cardName}>{product.name}</Text>
        <Text style={styles.cardPrice}>{product.displayPrice}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: { padding: 20 },
  logo: { fontSize: 14, letterSpacing: 4, fontWeight: "800" },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authControls: {
    flexDirection: 'row',
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#000',
    marginLeft: 10,
  },
  signUpButton: {
    backgroundColor: '#000',
  },
  headerButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
  signUpButtonText: {
    color: '#fff',
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
    alignItems: 'center',
  },
  hero: { 
    width: width,
    alignItems: 'center',
  },
  heroImage: { 
    width: width - 40, 
    height: 300, 
    borderRadius: 20, 
  },
  heroOverlay: { position: "absolute", bottom: 20, left: 40 },
  heroTitle: { color: "#fff", fontSize: 22, fontWeight: "700" },
  heroSub: { color: "#fff", fontSize: 12 },
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
});