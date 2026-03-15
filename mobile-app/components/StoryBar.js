/**
 * components/StoryBar.js — STORY CIRCLES AT TOP OF FEED
 *
 * Shows story circles — gradient ring if unviewed stories exist
 * First circle is "Your Story" (add story button)
 */

import React from "react";
import {
  View, Text, Image, TouchableOpacity, ScrollView,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function StoryBar({ stories, navigation }) {
  const { user } = useAuth();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {/* Add Your Story */}
      <TouchableOpacity
        style={styles.storyItem}
        onPress={() => navigation.navigate("StoryUpload")}
      >
        <View style={styles.addStoryContainer}>
          <Image source={{ uri: user?.profilePic }} style={styles.storyAvatar} />
          <View style={styles.addBadge}>
            <Ionicons name="add" size={12} color="#fff" />
          </View>
        </View>
        <Text style={styles.storyUsername} numberOfLines={1}>Your Story</Text>
      </TouchableOpacity>

      {/* Others' stories */}
      {stories?.map((storyGroup) => (
        <TouchableOpacity
          key={storyGroup.user._id}
          style={styles.storyItem}
          onPress={() => {
            /* Story viewer would go here */
          }}
        >
          {/* Gradient ring for unviewed */}
          {storyGroup.hasUnviewed ? (
            <View style={styles.gradientRing}>
              <View style={styles.gradientInner}>
                <Image
                  source={{ uri: storyGroup.user.profilePic }}
                  style={styles.storyAvatar}
                />
              </View>
            </View>
          ) : (
            <View style={styles.viewedRing}>
              <Image
                source={{ uri: storyGroup.user.profilePic }}
                style={styles.storyAvatar}
              />
            </View>
          )}
          <Text style={styles.storyUsername} numberOfLines={1}>
            {storyGroup.user.username}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 14,
    width: 68,
  },
  addStoryContainer: {
    position: "relative",
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#dbdbdb",
  },
  addBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0095f6",
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  gradientRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    // Instagram gradient: pink → purple → orange
    backgroundColor: "#E1306C", // fallback
    padding: 2.5,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientInner: {
    width: 61,
    height: 61,
    borderRadius: 30.5,
    backgroundColor: "#fff",
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  viewedRing: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 1,
    borderColor: "#dbdbdb",
    justifyContent: "center",
    alignItems: "center",
    padding: 2,
  },
  storyUsername: {
    fontSize: 11,
    color: "#262626",
    marginTop: 6,
    maxWidth: 68,
    textAlign: "center",
  },
});
