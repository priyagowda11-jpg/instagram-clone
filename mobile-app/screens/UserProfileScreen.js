/**
 * screens/UserProfileScreen.js — VIEW OTHER USERS
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, Image, FlatList, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
} from "react-native";
import { userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");
const GRID_SIZE = (width - 2) / 3;

export default function UserProfileScreen({ route, navigation }) {
  const { userId } = route.params;
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(userId),
        userAPI.getUserPosts(userId),
      ]);
      setProfile(profileRes.data);
      setPosts(postsRes.data);
      setFollowing(profileRes.data.followers?.some(f => f._id === currentUser._id || f === currentUser._id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (following) {
        await userAPI.unfollow(userId);
        setFollowing(false);
        setProfile(p => ({ ...p, followers: p.followers.filter(f => f._id !== currentUser._id) }));
      } else {
        await userAPI.follow(userId);
        setFollowing(true);
        setProfile(p => ({ ...p, followers: [...p.followers, currentUser._id] }));
      }
    } catch (e) {}
  };

  const handleMessage = () => {
    // Navigate to chat with this user
    navigation.navigate("Chat", {
      userId: profile._id,
      username: profile.username,
      profilePic: profile.profilePic,
    });
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0095f6" /></View>;

  return (
    <FlatList
      data={posts}
      keyExtractor={item => item._id}
      numColumns={3}
      columnWrapperStyle={{ gap: 1 }}
      ListHeaderComponent={
        <View style={styles.header}>
          <Image source={{ uri: profile?.profilePic }} style={styles.avatar} />
          <View style={styles.stats}>
            {[
              { count: posts.length, label: "Posts" },
              { count: profile?.followers?.length || 0, label: "Followers" },
              { count: profile?.following?.length || 0, label: "Following" },
            ].map(({ count, label }) => (
              <View key={label} style={styles.stat}>
                <Text style={styles.statCount}>{count}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>
          {profile?.fullName ? <Text style={styles.fullName}>{profile.fullName}</Text> : null}
          {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followingBtn]}
              onPress={handleFollow}
            >
              <Text style={[styles.followBtnText, following && styles.followingBtnText]}>
                {following ? "Following" : "Follow"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gridDivider} />
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity>
          <Image source={{ uri: item.image }} style={{ width: GRID_SIZE, height: GRID_SIZE }} />
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No posts yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { padding: 16 },
  avatar: { width: 86, height: 86, borderRadius: 43, marginBottom: 14 },
  stats: { flexDirection: "row", marginBottom: 14 },
  stat: { alignItems: "center", marginRight: 30 },
  statCount: { fontWeight: "700", fontSize: 18 },
  statLabel: { fontSize: 13 },
  fullName: { fontWeight: "600", fontSize: 14, color: "#262626", marginBottom: 2 },
  bio: { fontSize: 14, color: "#262626", marginBottom: 14 },
  btnRow: { flexDirection: "row", marginBottom: 14 },
  followBtn: {
    flex: 1, backgroundColor: "#0095f6", borderRadius: 8,
    paddingVertical: 8, alignItems: "center", marginRight: 8,
  },
  followingBtn: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#dbdbdb" },
  followBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  followingBtnText: { color: "#262626" },
  messageBtn: {
    flex: 1, borderWidth: 1, borderColor: "#dbdbdb", borderRadius: 8,
    paddingVertical: 8, alignItems: "center",
  },
  messageBtnText: { fontWeight: "600", fontSize: 14, color: "#262626" },
  gridDivider: { borderTopWidth: 0.5, borderTopColor: "#dbdbdb", marginTop: 8 },
  empty: { textAlign: "center", color: "#999", marginTop: 40 },
});
