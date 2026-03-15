import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    username: "", email: "", password: "", fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleRegister = async () => {
    const { username, email, password, fullName } = form;
    if (!username || !email || !password) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      await register(username.trim(), email.trim(), password, fullName.trim());
    } catch (error) {
      Alert.alert("Register Failed", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Instagram</Text>
        <Text style={styles.subtitle}>Sign up to see photos and videos from your friends.</Text>

        <TextInput style={styles.input} placeholder="Full Name" value={form.fullName}
          onChangeText={(v) => update("fullName", v)} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Username *" value={form.username}
          onChangeText={(v) => update("username", v)} autoCapitalize="none"
          autoCorrect={false} placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Email *" value={form.email}
          onChangeText={(v) => update("email", v)} keyboardType="email-address"
          autoCapitalize="none" placeholderTextColor="#999" />
        <TextInput style={styles.input} placeholder="Password * (min 6 chars)" value={form.password}
          onChangeText={(v) => update("password", v)} secureTextEntry placeholderTextColor="#999" />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.loginLink}>
          <Text style={styles.loginText}>
            Already have an account? <Text style={styles.loginBold}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flexGrow: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  logo: {
    fontSize: 42, fontWeight: "300", fontStyle: "italic",
    marginBottom: 12, color: "#262626",
    fontFamily: Platform.OS === "ios" ? "Palatino" : "serif",
  },
  subtitle: { fontSize: 17, color: "#999", textAlign: "center", marginBottom: 30, lineHeight: 22 },
  input: {
    backgroundColor: "#fafafa", borderWidth: 1, borderColor: "#dbdbdb",
    borderRadius: 6, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, marginBottom: 10, width: "100%", color: "#262626",
  },
  button: {
    backgroundColor: "#0095f6", borderRadius: 6, paddingVertical: 12,
    width: "100%", alignItems: "center", marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  loginLink: { marginTop: 24 },
  loginText: { fontSize: 13, color: "#262626" },
  loginBold: { fontWeight: "600", color: "#0095f6" },
});