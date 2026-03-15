import React, { useState, useEffect, useCallback } from "react";
import {
  View, FlatList, Dimensions, StyleSheet, Text,
  TouchableOpacity, Image, ActivityIndicator,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { reelAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { width, height } = Dimensions.get("window");

export default function ReelsScreen() {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async () => {
    try {
      const res = await reelAPI.getFeed();
      setReels(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }, []);

  const viewabilityConfig = { itemVisiblePercentThreshold: 60 };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (reels.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="film-outline" size={60} color="#fff" />
        <Text style={styles.emptyText}>No reels yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={reels}
      keyExtractor={(item) => item._id}
      renderItem={({ item, index }) => (
        <ReelItem
          reel={item}
          isActive={index === activeIndex}
          currentUserId={user._id}
        />
      )}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      style={styles.list}
    />
  );
}

function ReelItem({ reel, isActive, currentUserId }) {
  const [likes, setLikes] = useState(reel.likes || []);
  const isLiked = likes.includes(currentUserId);

  const player = useVideoPlayer(reel.video, (p) => {
    p.loop = true;
    if (isActive) p.play();
  });

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive]);

  const handleLike = async () => {
    setLikes(isLiked
      ? likes.filter((id) => id !== currentUserId)
      : [...likes, currentUserId]
    );
    try {
      await reelAPI.like(reel._id);
    } catch (e) {}
  };

  return (
    <View style={styles.reelContainer}>
      <VideoView
        player={player}
        style={styles.video}
        contentFit="cover"
        nativeControls={false}
      />

      <View style={styles.overlay}>
        <View style={styles.bottomInfo}>
          <Image source={{ uri: reel.user?.profilePic }} style={styles.avatar} />
          <View style={styles.reelInfo}>
            <Text style={styles.username}>{reel.user?.username}</Text>
            {reel.caption ? (
              <Text style={styles.caption} numberOfLines={2}>{reel.caption}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={30}
              color={isLiked ? "#ed4956" : "#fff"}
            />
            <Text style={styles.actionCount}>{likes.length}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionCount}>{reel.comments?.length || 0}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="paper-plane-outline" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" },
  emptyText: { color: "#fff", marginTop: 12, fontSize: 16 },
  list: { flex: 1, backgroundColor: "#000" },
  reelContainer: { width, height, backgroundColor: "#000" },
  video: { width, height },
  overlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "flex-end", padding: 20, paddingBottom: 80,
  },
  bottomInfo: { flex: 1, flexDirection: "row", alignItems: "flex-end" },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#fff", marginRight: 10 },
  reelInfo: { flex: 1 },
  username: { color: "#fff", fontWeight: "700", fontSize: 15, marginBottom: 4 },
  caption: { color: "#fff", fontSize: 13, marginBottom: 6 },
  rightActions: { alignItems: "center", marginLeft: 20 },
  actionItem: { alignItems: "center", marginBottom: 20 },
  actionCount: { color: "#fff", fontSize: 12, marginTop: 4 },
});