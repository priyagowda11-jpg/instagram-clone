/**
 * screens/CommentsScreen.js
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { postAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function CommentsScreen({ route }) {
  const { postId } = route.params;
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    try {
      const res = await postAPI.getPost(postId);
      setPost(res.data);
    } catch (e) {} finally { setLoading(false); }
  };

  const handleComment = async () => {
    if (!text.trim()) return;
    setPosting(true);
    try {
      const res = await postAPI.comment(postId, text.trim());
      setPost(prev => ({ ...prev, comments: res.data }));
      setText("");
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 300);
    } catch (e) {} finally { setPosting(false); }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator size="large" color="#0095f6" /></View>;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={listRef}
        data={post?.comments || []}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <View style={styles.commentRow}>
            <Image source={{ uri: item.user?.profilePic }} style={styles.avatar} />
            <View style={styles.commentContent}>
              <Text style={styles.commentUsername}>{item.user?.username}</Text>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.noComments}>No comments yet. Be the first!</Text>}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Input bar */}
      <View style={styles.inputBar}>
        <Image source={{ uri: user?.profilePic }} style={styles.avatar} />
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={text}
          onChangeText={setText}
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity onPress={handleComment} disabled={!text.trim() || posting}>
          {posting ? (
            <ActivityIndicator size="small" color="#0095f6" />
          ) : (
            <Text style={[styles.postBtn, !text.trim() && styles.postBtnDisabled]}>Post</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  commentRow: { flexDirection: "row", marginBottom: 16 },
  avatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentContent: { flex: 1 },
  commentUsername: { fontWeight: "600", fontSize: 13, color: "#262626" },
  commentText: { fontSize: 14, color: "#262626", marginTop: 2 },
  noComments: { textAlign: "center", color: "#999", marginTop: 40 },
  inputBar: {
    flexDirection: "row", alignItems: "center",
    padding: 12, borderTopWidth: 0.5, borderTopColor: "#dbdbdb",
    backgroundColor: "#fff",
  },
  input: { flex: 1, marginHorizontal: 10, fontSize: 14, color: "#262626", maxHeight: 80 },
  postBtn: { color: "#0095f6", fontWeight: "600", fontSize: 14 },
  postBtnDisabled: { opacity: 0.4 },
});
