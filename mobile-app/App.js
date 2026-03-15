/**
 * ════════════════════════════════════════════
 * App.js — ROOT COMPONENT
 * ════════════════════════════════════════════
 *
 * ORDER MATTERS for providers:
 * AuthProvider (outermost) → SocketProvider needs user from Auth
 * GestureHandlerRootView → required by React Navigation
 */

import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import * as Notifications from "expo-notifications";

import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import AppNavigator from "./navigation/AppNavigator";

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <SocketProvider>
          <AppNavigator />
        </SocketProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
