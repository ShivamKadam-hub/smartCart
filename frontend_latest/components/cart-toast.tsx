import React from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CartToastProps = {
  toast: string;
  toastAnim: Animated.Value;
  bottom?: number;
  onPress: () => void;
};

export function CartToast({ toast, toastAnim, bottom = 90, onPress }: CartToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: toastAnim,
          bottom,
        },
      ]}
    >
      <TouchableOpacity style={styles.toastBody} onPress={onPress} activeOpacity={0.85}>
        <Text numberOfLines={1} style={styles.toastText}>
          {toast}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="white" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 100,
  },
  toastBody: {
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  toastText: {
    color: "white",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
    marginRight: 10,
  },
});
