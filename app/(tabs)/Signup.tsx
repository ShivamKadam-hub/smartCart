import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../context/AuthContext";

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Enter your name, email, and password to continue.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      await signup({ name: name.trim(), email: email.trim(), password });
      router.replace("/Home");
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Unable to create account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Join the Circle</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              Early access to curated collections and intelligent shopping.
            </Text>
          </View>

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
                placeholder="........"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
            onPress={() => void handleSignup()}
            activeOpacity={0.9}
            disabled={isSubmitting}>
            <Text style={styles.primaryButtonText}>{isSubmitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/Login")} activeOpacity={0.85}>
            <Text style={styles.secondaryText}>
              Already a member? <Text style={styles.secondaryTextStrong}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF8F4",
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 42,
    paddingBottom: 34,
  },
  header: {
    marginBottom: 34,
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
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    color: "#AF9461",
    fontWeight: "700",
    marginBottom: 10,
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
  primaryButton: {
    backgroundColor: "#1E1E1E",
    paddingVertical: 18,
    borderRadius: 0,
    alignItems: "center",
    marginTop: 12,
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
  secondaryButton: {
    marginTop: 22,
    alignItems: "center",
  },
  secondaryText: {
    fontSize: 13,
    color: "#6D6962",
  },
  secondaryTextStrong: {
    color: "#141414",
    fontWeight: "700",
  },
});
