import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { useRouter } from "expo-router";

// ❌ AUTH DISABLED
// import * as WebBrowser from "expo-web-browser";
// import * as Google from "expo-auth-session/providers/google";

// WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Join the Circle</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              Early access to curated collections and intelligent shopping.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#A0A0A0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput 
                style={styles.input}
                placeholder="rehan@example.com"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MOBILE NUMBER</Text>
              <TextInput 
                style={styles.input}
                placeholder="+91 98765 43210"
                placeholderTextColor="#A0A0A0"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD</Text>
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

          </View>

          {/* Footer */}
          <View style={styles.footer}>
            
            {/* Create Account */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => {
                if (!name || !email || !password) {
                  alert('Please fill name, email, and password.');
                  return;
                }
                router.push('/Home');
              }}
            >
              <Text style={styles.buttonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            {/* Google Button (Fake for now) */}
            <TouchableOpacity 
              style={styles.googleButton}
              onPress={() => alert("Google Sign-In (Disabled for now)")}
            >
              <Text style={styles.googleIcon}>🔴</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Login */}
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/Login')}
            >
              <Text style={styles.secondaryText}>
                Already have an account?{" "}
                <Text style={styles.boldText}>Sign In</Text>
              </Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#F7F5F0",
  black: "#111111",
  gold: "#AF9461",
  textSecondary: "#8E8E8E",
  border: "#E5E5E5"
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 35,
    paddingTop: 70,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 60,
  },

  title: {
    fontSize: 36,
    fontFamily: "serif",
    color: COLORS.black,
    marginBottom: 18,
  },

  accentLine: {
    width: 50,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 22,
  },

  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },

  form: {
    gap: 40,
  },

  inputGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
  },

  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.gold,
    fontWeight: "700",
    marginBottom: 10,
  },

  input: {
    fontSize: 17,
    color: COLORS.black,
  },

  footer: {
    marginTop: 70,
    alignItems: "center",
  },

  primaryButton: {
    backgroundColor: COLORS.black,
    width: "100%",
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 4,
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  orText: {
    marginHorizontal: 10,
    fontSize: 11,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 6,
    width: "100%",
    marginBottom: 25,
    gap: 10,
  },

  googleIcon: {
    fontSize: 16,
  },

  googleText: {
    fontSize: 14,
    color: "#444",
    fontWeight: "500",
  },

  secondaryAction: {
    padding: 10,
  },

  secondaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  boldText: {
    color: COLORS.black,
    fontWeight: "700",
  },
});