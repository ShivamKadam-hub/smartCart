import React, { useMemo, useState } from "react";
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
import { MainNav } from "../../components/main-nav";
import { useCart } from "../../context/CartContext";
import { useCartToast } from "../../hooks/use-cart-toast";
import { PRODUCTS } from "../../constants/products";

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
};

const filters = [
  { label: "All", value: "all" },
  { label: "Living", value: "sofa" },
  { label: "Knives", value: "knife" },
  { label: "Cookware", value: "cookware" },
  { label: "Tableware", value: "tableware" },
  { label: "Decor", value: "decor" },
  { label: "Lighting", value: "lighting" },
  { label: "Outdoor", value: "outdoor" },
];

const products = PRODUCTS;

export default function ExploreScreen() {
  const router = useRouter();
  const { addToCart, totalItemCount } = useCart();
  const { toast, toastAnim, showToast } = useCartToast();
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchText, setSearchText] = useState("");

  const visibleProducts = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return products.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.category === activeFilter;
      const matchesSearch =
        search.length === 0 ||
        item.name.toLowerCase().includes(search) ||
        (item.tag ?? "").toLowerCase().includes(search) ||
        item.brand.toLowerCase().includes(search) ||
        item.style.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchText]);

  const handleAddToCart = (item: (typeof products)[number]) => {
    addToCart({
      id: item.product_id,
      name: item.name,
      description: item.description,
      price: item.price,
      img: item.img,
      label: item.tag,
    });
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
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
          activeOpacity={0.82}>
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

        <TouchableOpacity
          style={styles.hero}
          onPress={() => router.push("/category/decor")}
          activeOpacity={0.9}>
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

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop now</Text>
          <Text style={styles.sectionMeta}>{visibleProducts.length} results</Text>
        </View>

        <View style={styles.grid}>
          {visibleProducts.map((item) => {
            const productSlug = item.name
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, '');
            return (
              <TouchableOpacity
                key={item.product_id}
                style={styles.card}
                onPress={() => router.push(`/product/[slug]?slug=${productSlug}`)}
                activeOpacity={0.9}>
                <View style={styles.imageWrap}>
                  <Image source={{ uri: item.img }} style={styles.cardImage} />
                  {item.tag && (
                    <View style={styles.tagPill}>
                      <Text style={styles.tagText}>{item.tag}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardPrice}>{item.displayPrice}</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.categoryActionText}>{item.brand}</Text>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleAddToCart(item);
                    }}
                    activeOpacity={0.85}>
                    <Ionicons name="add" size={16} color={COLORS.black} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CartToast
        toast={toast}
        toastAnim={toastAnim}
        bottom={116}
        onPress={() => router.push("/cart")}
      />
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
  bottomSpacer: {
    height: 130,
  },
});