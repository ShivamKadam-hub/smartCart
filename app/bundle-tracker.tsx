import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { CartToast } from "./../components/cart-toast";
import { useCart } from "./context/CartContext";
import { useCartToast } from "./../hooks/use-cart-toast";
import { analyzeCartBundles, getSuggestionsForCategory } from "./../constants/bundles";
import { Product } from "./../constants/products";

const { width } = Dimensions.get("window");

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
  success: "#2E7D32",
};

export default function BundleTrackerScreen() {
  const router = useRouter();
  const { cartItems, addToCart } = useCart();
  const { toast, toastAnim, showToast } = useCartToast();

  const bundlesStatus = analyzeCartBundles(cartItems);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.product_id,
      name: product.name,
      description: product.description,
      price: product.price,
      img: product.img,
      label: product.category,
      originalPrice: product.originalPrice,
      color: product.color,
    });
    showToast(`${product.name} added to complete bundle!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.82}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Bundle Tracker</Text>
            <Text style={styles.subtitle}>Unlock exclusive set discounts.</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/cart")}
          activeOpacity={0.82}>
          <View style={{ position: "relative" }}>
            <Ionicons name="bag-outline" size={18} color={COLORS.black} />
            {cartItems.length > 0 && <View style={styles.cartBadge} />}
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.heroBanner}>
          <Ionicons name="layers-outline" size={32} color={COLORS.gold} style={styles.heroIcon} />
          <Text style={styles.heroTitle}>Smart Bundling</Text>
          <Text style={styles.heroCopy}>
            We scan your cart to suggest complementary pieces. Complete a bundle to automatically apply savings to your order.
          </Text>
        </View>

        {bundlesStatus.map(bundle => {
          const isActive = bundle.fulfilledCategories.length > 0;
          
          if (!isActive && cartItems.length > 0) return null; // Show only partially active bundles or all if cart is empty

          return (
            <View key={bundle.id} style={styles.bundleCard}>
              <View style={[styles.bundleHeader, { backgroundColor: bundle.bgColor }]}>
                <View style={styles.bundleHeaderTop}>
                  <View style={styles.bundleIconWrap}>
                    <Ionicons name={bundle.icon as any} size={20} color={COLORS.black} />
                  </View>
                  <View style={styles.bundleTag}>
                    <Text style={styles.bundleTagText}>{bundle.discountPercent}% OFF</Text>
                  </View>
                </View>
                <Text style={styles.bundleName}>{bundle.name}</Text>
                <Text style={styles.bundleDesc}>{bundle.description}</Text>
                
                {isActive && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(bundle.fulfilledCategories.length / bundle.requiredCategories.length) * 100}%` },
                          bundle.isCompleted && { backgroundColor: COLORS.success }
                        ]} 
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {bundle.isCompleted 
                        ? `Bundle Complete! You save ₹${bundle.potentialSavings.toLocaleString()}` 
                        : `${bundle.missingCategories.length} items needed to unlock`
                      }
                    </Text>
                  </View>
                )}
              </View>

              {/* Requirements & Suggestions */}
              {!bundle.isCompleted && (
                <View style={styles.suggestionsContainer}>
                  {bundle.missingCategories.map(cat => (
                    <View key={cat} style={styles.suggestionCategory}>
                      <Text style={styles.suggestionTitle}>Add any <Text style={{textTransform: "capitalize"}}>{cat}</Text>:</Text>
                      
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionList}>
                        {getSuggestionsForCategory(cat).map(product => (
                          <View key={product.product_id} style={styles.productCard}>
                            <Image source={{ uri: product.img }} style={styles.productImage} />
                            <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                            <Text style={styles.productPrice}>{product.displayPrice}</Text>
                            <TouchableOpacity 
                              style={styles.addButton}
                              onPress={() => handleAddToCart(product)}
                            >
                              <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  ))}
                </View>
              )}

              {/* Completed Bundle State */}
              {bundle.isCompleted && (
                <View style={styles.completedSection}>
                  <View style={styles.completedContent}>
                    <View style={styles.checkmarkCircle}>
                      <Ionicons name="checkmark" size={32} color={COLORS.white} />
                    </View>
                    <Text style={styles.completedTitle}>Bundle Unlocked!</Text>
                    <Text style={styles.completedSubtitle}>
                      Discount of {bundle.discountPercent}% automatically applied
                    </Text>
                    <View style={styles.savingsBox}>
                      <Text style={styles.savingsLabel}>You Save</Text>
                      <Text style={styles.savingsAmount}>₹{bundle.potentialSavings.toLocaleString()}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.checkoutButton}
                      onPress={() => router.push("/cart")}
                      activeOpacity={0.82}
                    >
                      <Text style={styles.checkoutButtonText}>View in Cart</Text>
                      <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          );
        })}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <CartToast
        toast={toast}
        toastAnim={toastAnim}
        bottom={40}
        onPress={() => router.push("/cart")}
      />
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
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    marginRight: 10,
    marginTop: 2,
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
  headerButton: {
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
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 20,
    paddingTop: 10,
  },
  heroBanner: {
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  heroIcon: {
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  heroCopy: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  bundleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  bundleHeader: {
    padding: 24,
  },
  bundleHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  bundleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bundleTag: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bundleTagText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },
  bundleName: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  bundleDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.gold,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
  },
  suggestionsContainer: {
    padding: 20,
    backgroundColor: COLORS.white,
  },
  suggestionCategory: {
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 12,
  },
  suggestionList: {
    gap: 12,
  },
  productCard: {
    width: 140,
    backgroundColor: COLORS.bg,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  productName: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.black,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.black,
  },
  completedSection: {
    padding: 24,
    backgroundColor: `rgba(46, 125, 50, 0.08)`,
    borderTopWidth: 1,
    borderTopColor: "rgba(46, 125, 50, 0.2)",
  },
  completedContent: {
    alignItems: "center",
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  completedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 6,
  },
  completedSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: "center",
  },
  savingsBox: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.success,
    alignItems: "center",
  },
  savingsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  savingsAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.success,
  },
  checkoutButton: {
    width: "100%",
    backgroundColor: COLORS.success,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800",
  },
  bottomSpacer: {
    height: 100,
  },
});
