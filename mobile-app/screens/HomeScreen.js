import React, { useState, useEffect, useCallback } from "react";
import {
  View, FlatList, RefreshControl, ActivityIndicator,
  StyleSheet, Text, TouchableOpacity, Image, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { postAPI, storyAPI } from "../services/api";
import PostCard from "../components/PostCard";
import StoryBar from "../components/StoryBar";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    loadFeed(1, true);
    loadStories();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", () => {
      setNotifCount((prev) => prev + 1);
    });
    return () => socket.off("notification");
  }, [socket]);

  const loadFeed = async (pageNum = 1, reset = false) => {
    try {
      const response = await postAPI.getFeed(pageNum);
      const { posts: newPosts, hasMore: more } = response.data;
      setPosts(reset ? newPosts : (prev) => [...prev, ...newPosts]);
      setHasMore(more);
      setPage(pageNum);
    } catch (error) {
      console.error("Feed error:", error);
    }
  };

  const loadStories = async () => {
    try {
      const response = await storyAPI.getFeed();
      setStories(response.data);
    } catch (error) {
      console.error("Stories error:", error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFeed(1, true);
    await loadStories();
    setRefreshing(false);
  }, []);

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadFeed(page + 1);
    setLoadingMore(false);
  };

  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const renderHeader = () => (
    <View>
      <StoryBar stories={stories} navigation={navigation} />
      <View style={styles.divider} />
    </View>
  );

  const renderPost = ({ item }) => (
    <PostCard post={item} navigation={navigation} onDelete={handleDeletePost} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#999" />
      </View>
    );
  };

  if (loading && posts.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topBarLogo}>Instagram</Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.topBarIcon}
            onPress={() => {
              setNotifCount(0);
              navigation.navigate("Notifications");
            }}
          >
            <Ionicons name="heart-outline" size={26} color="#262626" />
            {notifCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {notifCount > 9 ? "9+" : notifCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarIcon}
            onPress={() => navigation.navigate("ChatList")}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#262626" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="camera-outline" size={60} color="#dbdbdb" />
            <Text style={styles.emptyText}>Follow people to see their posts</Text>
          </View>
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onLayout={() => setLoading(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  topBarLogo: {
    fontSize: 26,
    fontWeight: "300",
    fontStyle: "italic",
    color: "#262626",
    fontFamily: Platform.OS === "ios" ? "Palatino" : "serif",
  },
  topBarRight: { flexDirection: "row", alignItems: "center" },
  topBarIcon: { marginLeft: 16, position: "relative" },
  badge: {
    position: "absolute", top: -4, right: -6,
    backgroundColor: "#ed4956", borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: "center", alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  divider: { height: 1, backgroundColor: "#dbdbdb" },
  footer: { padding: 20, alignItems: "center" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", marginTop: 80 },
  emptyText: { color: "#999", marginTop: 12, fontSize: 14 },
});