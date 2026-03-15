/**
 * ════════════════════════════════════════════
 * navigation/AppNavigator.js — ALL NAVIGATION
 * ════════════════════════════════════════════
 *
 * NAVIGATION STRUCTURE:
 *
 * RootStack
 * ├── AuthStack (when not logged in)
 * │   ├── Login
 * │   └── Register
 * └── MainTabs (when logged in)
 *     ├── Home (Tab)
 *     ├── Search (Tab)
 *     ├── Create (Tab — modal trigger)
 *     ├── Reels (Tab)
 *     └── Profile (Tab)
 *         └── Sub-screens via Stack:
 *             ChatList, Chat, Comments, EditProfile, UserProfile
 *
 * WHY TWO NAVIGATORS (Stack + Tab)?
 * - Bottom Tabs = persistent tab bar at bottom
 * - Stack = screens that slide in/out (chat, comments)
 */

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";

// Screens
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import SearchScreen from "../screens/SearchScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import StoryUploadScreen from "../screens/StoryUploadScreen";
import ReelsScreen from "../screens/ReelsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import CommentsScreen from "../screens/CommentsScreen";
import UserProfileScreen from "../screens/UserProfileScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ─── Auth Stack ───────────────────────────────
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// ─── Main Tab Navigator ───────────────────────
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarShowLabel: false,
      tabBarStyle: styles.tabBar,
      tabBarActiveTintColor: "#000",
      tabBarInactiveTintColor: "#999",
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        switch (route.name) {
          case "Home":
            iconName = focused ? "home" : "home-outline";
            break;
          case "Search":
            iconName = focused ? "search" : "search-outline";
            break;
          case "Create":
            iconName = focused ? "add-circle" : "add-circle-outline";
            break;
          case "Reels":
            iconName = focused ? "film" : "film-outline";
            break;
          case "Profile":
            iconName = focused ? "person" : "person-outline";
            break;
          default:
            iconName = "help-circle";
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen name="Create" component={CreatePostScreen} />
    <Tab.Screen name="Reels" component={ReelsScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ─── Root Stack (wraps tabs + full-screen screens) ──
const RootStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MainTabs"
      component={MainTabs}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: "Edit Profile" }}
    />
    <Stack.Screen
      name="ChatList"
      component={ChatListScreen}
      options={{ title: "Messages" }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ route }) => ({ title: route.params?.username || "Chat" })}
    />
    <Stack.Screen
      name="Comments"
      component={CommentsScreen}
      options={{ title: "Comments" }}
    />
    <Stack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: "Notifications" }}
    />
    <Stack.Screen
      name="StoryUpload"
      component={StoryUploadScreen}
      options={{ title: "New Story" }}
    />
    <Stack.Screen
      name="UserProfile"
      component={UserProfileScreen}
      options={({ route }) => ({ title: route.params?.username || "Profile" })}
    />
  </Stack.Navigator>
);

// ─── App Navigator (root) ────────────────────
const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) return null; // Show splash while checking auth

  return (
    <NavigationContainer>
      {user ? <RootStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  tabBar: {
    height: 55,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#dbdbdb",
    elevation: 0,
  },
});
