import React from "react";
import {
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { LinearGradient } from "expo-linear-gradient";

export default function LandingScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Garamond: require("../../assets/fonts/EBGaramond-Regular.ttf"),
    "Garamond-Italic": require("../../assets/fonts/EBGaramond-Italic.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />

      <ImageBackground source={require("../../assets/images/bg.jpg")} style={styles.background}>
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.05)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.overlay}
        />

        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.accentLine} />

            <Text style={styles.brand}>
              Williams{"\n"}
              <Text style={styles.cursiveBrand}>Sonoma</Text>
            </Text>

            <View style={styles.quoteContainer}>
              <Text style={styles.tagline}>
                Shop homes.{"\n"}
                <Text style={styles.highlight}>Not just products.</Text>
              </Text>
            </View>

            <Text style={styles.subtext}>Smart bundles. Real-time suggestions.</Text>
          </View>

          <View style={styles.bottom}>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/Home")}>
              <Text style={styles.buttonText}>Enter the Collection -&gt;</Text>
            </TouchableOpacity>

            <Text style={styles.footer}>SINCE 1956 | SONOMA, CALIFORNIA</Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const COLORS = {
  gold: "#AF9461",
  white: "#FFFFFF",
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  container: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 40,
    zIndex: 3,
  },
  accentLine: {
    width: 50,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 40,
  },
  brand: {
    fontSize: 60,
    fontFamily: "Garamond",
    color: "#fff",
    lineHeight: 60,
    marginBottom: 50,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  cursiveBrand: {
    fontFamily: "Garamond-Italic",
    fontSize: 70,
    color: COLORS.gold,
  },
  quoteContainer: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.gold,
    paddingLeft: 20,
    marginBottom: 25,
  },
  tagline: {
    fontSize: 34,
    fontFamily: "Garamond",
    color: "#fff",
    lineHeight: 42,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  highlight: {
    fontFamily: "Garamond-Italic",
    fontSize: 32,
    color: "#fff",
  },
  subtext: {
    fontSize: 11,
    color: "rgba(255,255,255,0.8)",
    letterSpacing: 3,
    textTransform: "uppercase",
    marginTop: 12,
  },
  bottom: {
    paddingHorizontal: 30,
    paddingBottom: 45,
    alignItems: "center",
    zIndex: 3,
  },
  button: {
    backgroundColor: "#fff",
    width: "100%",
    paddingVertical: 18,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: "600",
  },
  footer: {
    marginTop: 25,
    fontSize: 8,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.7)",
  },
});
