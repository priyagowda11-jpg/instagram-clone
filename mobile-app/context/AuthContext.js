/**
 * ════════════════════════════════════════════
 * context/AuthContext.js — GLOBAL AUTH STATE
 * ════════════════════════════════════════════
 *
 * WHY CONTEXT API?
 * - Avoids "prop drilling" (passing user down 5 levels)
 * - Any screen can call useAuth() to get/set user
 *
 * PERSISTENT LOGIN FLOW:
 * 1. App starts → checkAuth() reads AsyncStorage
 * 2. Token found → verify with server → set user
 * 3. Token missing/invalid → show Login screen
 * 4. Logout → clear AsyncStorage → show Login screen
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authAPI, userAPI } from "../services/api";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking token

  // ─── Check for persisted login on app start ──
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const response = await authAPI.getMe();
        setUser(response.data);
      }
    } catch (error) {
      // Token invalid or expired
      await AsyncStorage.multiRemove(["token", "user"]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Register push notification token ────────
  const registerForPushNotifications = async () => {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  };

  // ─── Login ───────────────────────────────────
  const login = async (email, password) => {
    const pushToken = await registerForPushNotifications();
    const response = await authAPI.login({ email, password, pushToken });
    const data = response.data;

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    return data;
  };

  // ─── Register ────────────────────────────────
  const register = async (username, email, password, fullName) => {
    const response = await authAPI.register({ username, email, password, fullName });
    const data = response.data;

    await AsyncStorage.setItem("token", data.token);
    await AsyncStorage.setItem("user", JSON.stringify(data));
    setUser(data);

    return data;
  };

  // ─── Logout ──────────────────────────────────
  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setUser(null);
  };

  // ─── Update local user state ─────────────────
  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for clean usage: const { user } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
