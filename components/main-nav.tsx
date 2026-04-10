import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

type MainNavProps = {
  activeRoute: "home" | "explore" | "wishlist" | "profile";
};

const navItems = [
  { key: "home", label: "Home", icon: "home", route: "/Home" },
  { key: "explore", label: "Explore", icon: "compass", route: "/explore" },
  { key: "wishlist", label: "Wishlist", icon: "heart", route: "/wishlist" },
  { key: "profile", label: "Profile", icon: "user", route: "/profile" },
] as const;

export function MainNav({ activeRoute }: MainNavProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      {/* Floating Chatbot FAB */}
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => router.push("/chatbot")}
        activeOpacity={0.85}
      >
        <Ionicons name="sparkles" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Nav */}
      <View style={styles.container}>
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.tab}
            onPress={() => router.push(item.route)}
            activeOpacity={0.8}
          >
            <Feather
              name={item.icon}
              size={20}
              color={activeRoute === item.key ? "#000" : "#999"}
            />
            <Text style={[styles.label, activeRoute === item.key && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  chatFab: {
    position: "absolute",
    right: 20,
    top: -60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#AF9461",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  container: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
    paddingVertical: 10,
    justifyContent: "space-around",
  },
  tab: {
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 10,
    color: "#999",
  },
  activeLabel: {
    color: "#000",
    fontWeight: "700",
  },
});
