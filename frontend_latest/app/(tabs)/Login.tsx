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
} from "react-native";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.wrapper}
      >
        <View style={styles.inner}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              Sign in to access your curated kitchen, saved registries, and orders.
            </Text>
          </View>

          {/* Form Fields */}
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
                <TouchableOpacity>
                  <Text style={styles.forgotText}>FORGOT?</Text>
                </TouchableOpacity>
              </View>
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

          {/* Actions */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.primaryButton}
              onPress={() => {
                if (!email || !password) {
                  alert('Enter email and password to sign in.');
                  return;
                }
                router.push('/Home');
              }}
            >
              <Text style={styles.buttonText}>SIGN IN</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={() => router.push('/Signup')}
            >
              <Text style={styles.secondaryText}>
                New to the circle? <Text style={styles.boldText}>Join Now</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const COLORS = {
  bg: "#F8F8F7",
  black: "#1A1A1A",
  gold: "#AF9461",
  textSecondary: "#8E8E8E",
  border: "#E0E0E0"
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  wrapper: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 35,
    justifyContent: "center", // Centered for Login
  },
  header: {
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: "serif",
    color: COLORS.black,
    marginBottom: 15,
  },
  accentLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.gold,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    letterSpacing: 0.3,
  },
  form: {
    gap: 40,
  },
  inputGroup: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10,
    letterSpacing: 2,
    color: COLORS.gold,
    fontWeight: "700",
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 10,
    letterSpacing: 1,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  input: {
    fontSize: 16,
    color: COLORS.black,
    paddingVertical: 5,
  },
  footer: {
    marginTop: 60,
    alignItems: "center",
  },
  primaryButton: {
    backgroundColor: COLORS.black,
    width: "100%",
    paddingVertical: 20,
    borderRadius: 2,
    alignItems: "center",
    marginBottom: 25,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 3,
  },
  secondaryAction: {
    padding: 10,
  },
  secondaryText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  boldText: {
    color: COLORS.black,
    fontWeight: "700",
  }
});