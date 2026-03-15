/**
 * screens/NotificationsScreen.js
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { notificationAPI } from "../services/api";

const ICONS = { like: "❤️", comment: "💬", follow: "👤", message: "✉️" };

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
    notificationAPI.markAllRead(); // Mark all read when screen opens
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationAPI.get();
      setNotifications(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0095f6" /></View>;

  return (
    <FlatList
      data={notifications}
      keyExtractor={item => item._id}
      style={styles.list}
      renderItem={({ item }) => (
        <View style={[styles.row, !item.isRead && styles.unread]}>
          <Image source={{ uri: item.sender?.profilePic }} style={styles.avatar} />
          <View style={styles.info}>
            <Text style={styles.message}>
              <Text style={styles.bold}>{item.sender?.username}</Text>
              {" "}{item.message?.replace(item.sender?.username, "").trim()}
            </Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.icon}>{ICONS[item.type] || "🔔"}</Text>
          {item.post?.image && (
            <Image source={{ uri: item.post.image }} style={styles.postThumb} />
          )}
        </View>
      )}
      ListEmptyComponent={<Text style={styles.empty}>No notifications yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderBottomWidth: 0.5, borderBottomColor: "#f5f5f5",
  },
  unread: { backgroundColor: "#f0f8ff" },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  info: { flex: 1 },
  message: { fontSize: 13, color: "#262626" },
  bold: { fontWeight: "600" },
  time: { fontSize: 11, color: "#999", marginTop: 2 },
  icon: { fontSize: 20, marginHorizontal: 8 },
  postThumb: { width: 40, height: 40, borderRadius: 4 },
  empty: { textAlign: "center", color: "#999", marginTop: 60, fontSize: 15 },
});
