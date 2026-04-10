import { useRef, useState } from "react";
import { Animated } from "react-native";

export function useCartToast() {
  const [toast, setToast] = useState("");
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToast(message);
    Animated.timing(toastAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }).start(() => {
          setToast("");
        });
      }, 1400);
    });
  };

  return { toast, toastAnim, showToast };
}
