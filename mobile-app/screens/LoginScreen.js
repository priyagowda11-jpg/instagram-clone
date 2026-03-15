import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView,
  Platform, ActivityIndicator, Alert, ScrollView,
} from "react-native";
import { useAuth } from "../context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error) {
      Alert.alert("Login Failed", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>Instagram</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Log In</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.switchText}>
            Don't have an account?{" "}
            <Text style={styles.switchTextBold}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: {
    flexGrow: 1, alignItems: "center", justifyContent: "center",
    paddingHorizontal: 40, paddingVertical: 60,
  },
  logo: {
    fontSize: 42, fontWeight: "300", fontStyle: "italic",
    marginBottom: 40, color: "#262626",
    fontFamily: Platform.OS === "ios" ? "Palatino" : "serif",
  },
  inputContainer: { width: "100%", marginBottom: 12 },
  input: {
    backgroundColor: "#fafafa", borderWidth: 1, borderColor: "#dbdbdb",
    borderRadius: 6, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 14, marginBottom: 10, color: "#262626",
  },
  button: {
    backgroundColor: "#0095f6", borderRadius: 6, paddingVertical: 12,
    width: "100%", alignItems: "center", marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  divider: {
    flexDirection: "row", alignItems: "center", width: "100%", marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#dbdbdb" },
  dividerText: { marginHorizontal: 12, color: "#999", fontSize: 12, fontWeight: "600" },
  switchText: { fontSize: 13, color: "#262626", textAlign: "center" },
  switchTextBold: { fontWeight: "600", color: "#0095f6" },
});