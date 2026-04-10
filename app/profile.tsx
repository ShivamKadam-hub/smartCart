import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCart } from "./context/CartContext";

const COLORS = {
  bg: "#F6F5F1",
  white: "#FFFFFF",
  gold: "#AF9461",
  goldSoft: "rgba(175,148,97,0.12)",
  black: "#161616",
  textSecondary: "#7B7B75",
  border: "rgba(0,0,0,0.06)",
};

const quickLinks = [
  { label: "Explore collection", route: "/explore", icon: "compass-outline" as const },
  { label: "Bundle Tracker", route: "/bundle-tracker", icon: "layers-outline" as const },
  { label: "View cart", route: "/cart", icon: "bag-outline" as const },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { totalItemCount, savedItems } = useCart();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Added a back button since it's a stack screen */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.82}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Sign in to keep your saved items, carts, and orders together.</Text>

        <View style={styles.heroCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person-outline" size={30} color={COLORS.gold} />
          </View>
          <Text style={styles.heroTitle}>Welcome to your account</Text>
          <Text style={styles.heroCopy}>
            Create an account for faster checkout, or sign in to continue where you left off.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/Login")}
            activeOpacity={0.86}>
            <Text style={styles.primaryButtonText}>Log in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/Signup")}
            activeOpacity={0.86}>
            <Text style={styles.secondaryButtonText}>Create account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{savedItems.length}</Text>
            <Text style={styles.metricLabel}>Saved items</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{totalItemCount}</Text>
            <Text style={styles.metricLabel}>Cart items</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick links</Text>
          {quickLinks.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.linkRow}
              onPress={() => router.push(item.route as "/explore" | "/bundle-tracker" | "/cart")}
              activeOpacity={0.82}>
              <View style={styles.linkIcon}>
                <Ionicons name={item.icon} size={18} color={COLORS.gold} />
              </View>
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.black,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  heroCard: {
    marginTop: 24,
    backgroundColor: COLORS.white,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.black,
    marginBottom: 8,
  },
  heroCopy: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 22,
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: "800",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 14,
    marginTop: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.black,
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 22,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.black,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
  },
  linkIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.goldSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  linkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.black,
  },
  bottomSpacer: {
    height: 130,
  },
});
