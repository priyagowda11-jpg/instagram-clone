/**
 * screens/ProfileScreen.js
 *
 * Grid layout for own profile (Instagram style)
 * Shows: avatar, stats (posts/followers/following), bio, post grid
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const GRID_SIZE = (width - 2) / 3;

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(user._id),
        userAPI.getUserPosts(user._id),
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Avatar */}
      <Image source={{ uri: profile?.profilePic }} style={styles.avatar} />

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatItem count={posts.length} label="Posts" />
        <StatItem count={profile?.followers?.length || 0} label="Followers" />
        <StatItem count={profile?.following?.length || 0} label="Following" />
      </View>

      {/* Name + Bio */}
      <View style={styles.bioSection}>
        {profile?.fullName ? (
          <Text style={styles.fullName}>{profile.fullName}</Text>
        ) : null}
        {profile?.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : null}
      </View>

      {/* Action buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() =>
            navigation.navigate("ChatList")
          }
        >
          <Ionicons name="paper-plane-outline" size={20} color="#262626" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsBtn} onPress={logout}>
          <Ionicons name="log-out-outline" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Grid divider */}
      <View style={styles.gridHeader}>
        <Ionicons name="grid-outline" size={22} color="#262626" />
      </View>
    </View>
  );

  const renderPost = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("Comments", { postId: item._id })}
    >
      <Image source={{ uri: item.image }} style={styles.gridImage} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.usernameTitle}>{profile?.username}</Text>
        <TouchableOpacity>
          <Ionicons name="add-outline" size={28} color="#262626" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        numColumns={3}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={{ height: 1 }} />}
        columnWrapperStyle={{ gap: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyGrid}>
            <Ionicons name="camera-outline" size={50} color="#dbdbdb" />
            <Text style={styles.emptyText}>No Posts Yet</Text>
          </View>
        }
      />
    </View>
  );
}

const StatItem = ({ count, label }) => (
  <View style={styles.statItem}>
    <Text style={styles.statCount}>{count}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb",
  },
  usernameTitle: { fontWeight: "700", fontSize: 18, color: "#262626" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16 },
  avatar: { width: 86, height: 86, borderRadius: 43, marginBottom: 12 },
  statsRow: { flexDirection: "row", marginBottom: 12 },
  statItem: { alignItems: "center", marginRight: 32 },
  statCount: { fontWeight: "700", fontSize: 18, color: "#262626" },
  statLabel: { fontSize: 13, color: "#262626" },
  bioSection: { marginBottom: 14 },
  fullName: { fontWeight: "600", fontSize: 14, color: "#262626", marginBottom: 2 },
  bio: { fontSize: 14, color: "#262626", lineHeight: 20 },
  buttonRow: { flexDirection: "row", marginBottom: 16 },
  editBtn: {
    flex: 1, borderWidth: 1, borderColor: "#dbdbdb", borderRadius: 8,
    paddingVertical: 7, alignItems: "center", marginRight: 8,
  },
  editBtnText: { fontWeight: "600", fontSize: 14, color: "#262626" },
  settingsBtn: {
    borderWidth: 1, borderColor: "#dbdbdb", borderRadius: 8,
    paddingVertical: 7, paddingHorizontal: 10, marginRight: 8,
  },
  gridHeader: {
    borderTopWidth: 0.5, borderTopColor: "#dbdbdb",
    alignItems: "center", paddingVertical: 10,
  },
  gridImage: { width: GRID_SIZE, height: GRID_SIZE },
  emptyGrid: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#999", fontSize: 14, marginTop: 10 },
});
