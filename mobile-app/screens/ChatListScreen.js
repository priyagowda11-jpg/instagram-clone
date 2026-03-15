/**
 * screens/ChatListScreen.js
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from "react-native";
import { messageAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatListScreen({ navigation }) {
  const { user } = useAuth();
  const { isUserOnline } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      setConversations(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0095f6" /></View>;

  return (
    <FlatList
      data={conversations}
      keyExtractor={item => item._id}
      style={styles.list}
      renderItem={({ item }) => {
        const other = item.participants?.find(p => p._id !== user._id);
        const online = isUserOnline(other?._id);
        return (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate("Chat", {
              conversationId: item._id,
              userId: other?._id,
              username: other?.username,
              profilePic: other?.profilePic,
            })}
          >
            <View>
              <Image source={{ uri: other?.profilePic }} style={styles.avatar} />
              {online && <View style={styles.onlineDot} />}
            </View>
            <View style={styles.info}>
              <Text style={styles.username}>{other?.username}</Text>
              <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessageText || "No messages yet"}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={<Text style={styles.empty}>No conversations yet</Text>}
    />
  );
}

const styles = StyleSheet.create({
  list: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  row: { flexDirection: "row", alignItems: "center", padding: 14, borderBottomWidth: 0.5, borderBottomColor: "#f0f0f0" },
  avatar: { width: 56, height: 56, borderRadius: 28, marginRight: 14 },
  onlineDot: {
    position: "absolute", bottom: 2, right: 14,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: "#5CB85C", borderWidth: 2, borderColor: "#fff",
  },
  info: { flex: 1 },
  username: { fontWeight: "600", fontSize: 14, color: "#262626" },
  lastMsg: { fontSize: 13, color: "#999", marginTop: 2 },
  empty: { textAlign: "center", color: "#999", marginTop: 80 },
});
