/**
 * screens/ChatScreen.js — REAL-TIME CHAT
 *
 * HOW REAL-TIME WORKS:
 * 1. Screen mounts → load message history from API
 * 2. Socket.on("newMessage") → append to messages list
 * 3. User types → emit "typing" event
 * 4. User sends → API call + socket emits to receiver
 * 5. Message appears instantly on both sides
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { messageAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function ChatScreen({ route, navigation }) {
  const { conversationId: initialConvId, userId, username, profilePic } = route.params;
  const { user } = useAuth();
  const { socket, isUserOnline } = useSocket();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConvId);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const typingTimer = useRef(null);

  // ─── Load message history ─────────────────
  useEffect(() => {
    if (conversationId) loadMessages();
    else setLoading(false);
  }, [conversationId]);

  // ─── Socket listeners ─────────────────────
  useEffect(() => {
    if (!socket) return;

    // Receive new message in real-time
    socket.on("newMessage", ({ message, conversationId: cid }) => {
      if (cid === conversationId || message.sender._id === userId) {
        setMessages((prev) => [...prev, message]);
        setConversationId(cid);
        scrollToBottom();
      }
    });

    // Typing indicator
    socket.on("userTyping", ({ conversationId: cid }) => {
      if (cid === conversationId) setIsTyping(true);
    });

    socket.on("userStopTyping", () => setIsTyping(false));

    return () => {
      socket.off("newMessage");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [socket, conversationId]);

  const loadMessages = async () => {
    try {
      const res = await messageAPI.getMessages(conversationId);
      setMessages(res.data);
      scrollToBottom();
    } catch (e) {} finally { setLoading(false); }
  };

  const scrollToBottom = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // ─── Typing events ────────────────────────
  const handleTyping = (value) => {
    setText(value);
    if (!socket) return;

    socket.emit("typing", { conversationId, userId: user._id, receiverId: userId });

    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { conversationId, receiverId: userId });
    }, 1500);
  };

  // ─── Send text message ────────────────────
  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    const msgText = text.trim();
    setText("");

    try {
      const formData = new FormData();
      formData.append("receiverId", userId);
      formData.append("text", msgText);

      const res = await messageAPI.send(formData);
      const { message, conversationId: cid } = res.data;
      setMessages((prev) => [...prev, message]);
      setConversationId(cid);
      scrollToBottom();
    } catch (e) {
      setText(msgText); // restore on failure
    } finally {
      setSending(false);
    }
  };

  // ─── Send image ───────────────────────────
  const handleImageSend = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSending(true);
      try {
        const formData = new FormData();
        formData.append("receiverId", userId);
        formData.append("image", {
          uri: result.assets[0].uri,
          type: "image/jpeg",
          name: "chat_image.jpg",
        });

        const res = await messageAPI.send(formData);
        setMessages((prev) => [...prev, res.data.message]);
        setConversationId(res.data.conversationId);
        scrollToBottom();
      } catch (e) {} finally { setSending(false); }
    }
  };

  const isOnline = isUserOnline(userId);

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0095f6" /></View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Online status header */}
      <View style={styles.statusBar}>
        <Image source={{ uri: profilePic }} style={styles.headerAvatar} />
        <View>
          <Text style={styles.headerUsername}>{username}</Text>
          <Text style={[styles.statusText, isOnline && styles.onlineText]}>
            {isOnline ? "Active now" : "Offline"}
          </Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const isMine = item.sender?._id === user._id || item.sender === user._id;
          return (
            <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.chatImage} />
              ) : null}
              {item.text ? (
                <Text style={[styles.bubbleText, isMine && styles.myBubbleText]}>
                  {item.text}
                </Text>
              ) : null}
            </View>
          );
        }}
        ListFooterComponent={
          isTyping ? (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>{username} is typing...</Text>
            </View>
          ) : null
        }
        onLayout={scrollToBottom}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity onPress={handleImageSend} style={styles.imageBtn}>
          <Ionicons name="image-outline" size={26} color="#0095f6" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Message..."
          value={text}
          onChangeText={handleTyping}
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
        />

        {text.trim() ? (
          <TouchableOpacity onPress={handleSend} disabled={sending}>
            {sending ? (
              <ActivityIndicator size="small" color="#0095f6" />
            ) : (
              <Text style={styles.sendBtn}>Send</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  statusBar: {
    flexDirection: "row", alignItems: "center", padding: 12,
    borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb",
  },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerUsername: { fontWeight: "600", fontSize: 14, color: "#262626" },
  statusText: { fontSize: 12, color: "#999" },
  onlineText: { color: "#5CB85C" },
  bubble: {
    maxWidth: "70%", padding: 10, borderRadius: 18, marginBottom: 8,
  },
  myBubble: { backgroundColor: "#0095f6", alignSelf: "flex-end", borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: "#f0f0f0", alignSelf: "flex-start", borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, color: "#262626" },
  myBubbleText: { color: "#fff" },
  chatImage: { width: 200, height: 200, borderRadius: 12 },
  typingIndicator: { padding: 8 },
  typingText: { fontSize: 12, color: "#999", fontStyle: "italic" },
  inputBar: {
    flexDirection: "row", alignItems: "center",
    padding: 10, borderTopWidth: 0.5, borderTopColor: "#dbdbdb",
    backgroundColor: "#fff",
  },
  imageBtn: { marginRight: 10 },
  input: {
    flex: 1, borderWidth: 1, borderColor: "#dbdbdb", borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, fontSize: 14,
    color: "#262626", maxHeight: 80,
  },
  sendBtn: { color: "#0095f6", fontWeight: "700", fontSize: 14, marginLeft: 10 },
});
