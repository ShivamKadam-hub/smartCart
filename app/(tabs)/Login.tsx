import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Enter email and password to sign in.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await login({ email: email.trim(), password });
      router.replace("/Home");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrapper}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              Sign in to access your curated kitchen, saved registries, and orders.
            </Text>
          </View>

          <View style={styles.form}>
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
              <View style={styles.labelRow}>
                <Text style={styles.label}>PASSWORD</Text>
                <TouchableOpacity activeOpacity={0.8}>
                  <Text style={styles.forgotText}>FORGOT?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="........"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
              onPress={() => void handleLogin()}
              disabled={isSubmitting}>
              <Text style={styles.primaryButtonText}>{isSubmitting ? "SIGNING IN..." : "LOG IN"}</Text>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push("/Signup")}>
              <Text style={styles.secondaryText}>
                New here? <Text style={styles.secondaryTextStrong}>Create Account</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F4",
  },
  wrapper: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 42,
  },
  title: {
    fontSize: 38,
    color: "#141414",
    marginBottom: 18,
    fontFamily: Platform.OS === "ios" ? "Times New Roman" : "serif",
  },
  accentLine: {
    width: 72,
    height: 1.2,
    backgroundColor: "#AF9461",
    marginBottom: 18,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 24,
    color: "#706C66",
  },
  form: {
    marginBottom: 18,
  },
  inputGroup: {
    marginBottom: 26,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#AF9461",
    fontWeight: "700",
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 10,
    letterSpacing: 1.4,
    color: "#8E7A57",
    fontWeight: "700",
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: "#D9D4CB",
    paddingVertical: 12,
    fontSize: 18,
    color: "#1E1E1E",
    backgroundColor: "transparent",
  },
  errorText: {
    color: "#A33A2B",
    fontSize: 13,
    marginBottom: 18,
  },
  footer: {
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: "center",
    marginBottom: 22,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: "800",
  },
  secondaryText: {
    fontSize: 13,
    color: "#6D6962",
    textAlign: "center",
  },
  secondaryTextStrong: {
    color: "#141414",
    fontWeight: "700",
  },
});
