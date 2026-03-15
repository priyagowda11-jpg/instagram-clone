/**
 * ════════════════════════════════════════════
 * components/PostCard.js — SINGLE POST IN FEED
 * ════════════════════════════════════════════
 *
 * FEATURES:
 * - Double-tap to like (Instagram style)
 * - Animated heart on like
 * - Like/Save/Comment/Share buttons
 * - Caption with "more" expand
 * - Timestamp
 */

import React, { useState, useRef } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Animated, Alert, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { postAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function PostCard({ post, navigation, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [isSaved, setIsSaved] = useState(post.savedBy?.includes(user._id) || false);
  const [captionExpanded, setCaptionExpanded] = useState(false);

  // Heart animation refs
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(null);

  const isLiked = likes.includes(user._id);

  // ─── Double-tap to like ───────────────────
  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tapped!
      if (!isLiked) handleLike();
      showHeartAnimation();
    }
    lastTap.current = now;
  };

  const showHeartAnimation = () => {
    heartScale.setValue(0);
    heartOpacity.setValue(1);

    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
      Animated.delay(600),
      Animated.timing(heartOpacity, {
        toValue: 0, duration: 300, useNativeDriver: true,
      }),
    ]).start();
  };

  // ─── Like / Unlike ────────────────────────
  const handleLike = async () => {
    // Optimistic update (update UI immediately, then sync with server)
    if (isLiked) {
      setLikes(likes.filter((id) => id !== user._id));
    } else {
      setLikes([...likes, user._id]);
    }

    try {
      await postAPI.like(post._id);
    } catch (error) {
      // Revert on failure
      setLikes(isLiked ? [...likes, user._id] : likes.filter((id) => id !== user._id));
    }
  };

  // ─── Save Post ────────────────────────────
  const handleSave = async () => {
    setIsSaved(!isSaved); // Optimistic
    try {
      await postAPI.save(post._id);
    } catch (error) {
      setIsSaved(isSaved); // Revert
    }
  };

  // ─── Delete Post ──────────────────────────
  const handleDelete = () => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await postAPI.delete(post._id);
            onDelete && onDelete(post._id);
          } catch (error) {
            Alert.alert("Error", "Failed to delete post");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() =>
            navigation.navigate(
              post.user._id === user._id ? "Profile" : "UserProfile",
              { userId: post.user._id, username: post.user.username }
            )
          }
        >
          <Image
            source={{ uri: post.user?.profilePic }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{post.user?.username}</Text>
            {post.location ? <Text style={styles.location}>{post.location}</Text> : null}
          </View>
        </TouchableOpacity>

        {/* 3-dot menu (only for own posts) */}
        {post.user._id === user._id && (
          <TouchableOpacity onPress={handleDelete} style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Image with double-tap */}
      <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap}>
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
        {/* Animated heart overlay */}
        <Animated.View
          style={[
            styles.heartOverlay,
            { opacity: heartOpacity, transform: [{ scale: heartScale }] },
          ]}
          pointerEvents="none"
        >
          <Ionicons name="heart" size={90} color="#fff" />
        </Animated.View>
      </TouchableOpacity>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? "#ed4956" : "#262626"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("Comments", { postId: post._id })}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="paper-plane-outline" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={handleSave}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color="#262626"
          />
        </TouchableOpacity>
      </View>

      {/* Like count */}
      {likes.length > 0 && (
        <Text style={styles.likeCount}>
          {likes.length} {likes.length === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* Caption */}
      {post.caption ? (
        <View style={styles.captionContainer}>
          <Text style={styles.captionUsername}>{post.user?.username}</Text>
          <Text
            style={styles.captionText}
            numberOfLines={captionExpanded ? undefined : 2}
          >
            {" "}{post.caption}
          </Text>
          {post.caption.length > 80 && !captionExpanded && (
            <TouchableOpacity onPress={() => setCaptionExpanded(true)}>
              <Text style={styles.moreText}>more</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Comment preview */}
      {post.comments?.length > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Comments", { postId: post._id })}
        >
          <Text style={styles.commentsPreview}>
            View all {post.comments.length} comments
          </Text>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          month: "long", day: "numeric",
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff", marginBottom: 8 },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", padding: 12,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  username: { fontWeight: "600", fontSize: 13, color: "#262626" },
  location: { fontSize: 11, color: "#262626" },
  moreBtn: { padding: 6 },
  postImage: { width, height: width },
  heartOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center", alignItems: "center",
  },
  actions: {
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", paddingHorizontal: 12, paddingVertical: 8,
  },
  actionsLeft: { flexDirection: "row", alignItems: "center" },
  actionBtn: { marginRight: 14 },
  likeCount: { fontWeight: "600", fontSize: 13, paddingHorizontal: 12, color: "#262626" },
  captionContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, marginTop: 4 },
  captionUsername: { fontWeight: "600", fontSize: 13, color: "#262626" },
  captionText: { fontSize: 13, color: "#262626", flex: 1, flexWrap: "wrap" },
  moreText: { color: "#999", fontSize: 13, marginLeft: 12 },
  commentsPreview: { color: "#999", fontSize: 13, paddingHorizontal: 12, marginTop: 4 },
  timestamp: { color: "#999", fontSize: 10, paddingHorizontal: 12, marginTop: 4, marginBottom: 8 },
});
