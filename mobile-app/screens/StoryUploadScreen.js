/**
 * screens/StoryUploadScreen.js
 */

import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { storyAPI } from "../services/api";

export default function StoryUploadScreen({ navigation }) {
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, // Images + videos
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
      videoMaxDuration: 15,
    });

    if (!result.canceled) setMedia(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!media) return;
    setLoading(true);
    try {
      const isVideo = media.type === "video";
      const formData = new FormData();
      formData.append("media", {
        uri: media.uri,
        type: isVideo ? "video/mp4" : "image/jpeg",
        name: isVideo ? "story.mp4" : "story.jpg",
      });

      await storyAPI.create(formData);
      Alert.alert("Success", "Story uploaded! It will disappear in 24 hours. ⏰");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", "Failed to upload story");
    } finally {
      setLoading(false);
    }
  };

  if (!media) {
    return (
      <View style={styles.container}>
        <Ionicons name="images-outline" size={80} color="#dbdbdb" />
        <Text style={styles.title}>Share a Story</Text>
        <Text style={styles.subtitle}>Disappears after 24 hours</Text>
        <TouchableOpacity style={styles.btn} onPress={pickMedia}>
          <Text style={styles.btnText}>Choose Photo or Video</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.previewContainer}>
      <Image source={{ uri: media.uri }} style={styles.preview} />
      <View style={styles.actions}>
        <TouchableOpacity style={styles.discardBtn} onPress={() => setMedia(null)}>
          <Text style={styles.discardText}>Discard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareBtn, loading && styles.btnDisabled]}
          onPress={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.shareText}>Share to Story</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff", padding: 40 },
  title: { fontSize: 22, fontWeight: "600", marginTop: 20, color: "#262626" },
  subtitle: { fontSize: 14, color: "#999", marginTop: 8, marginBottom: 30 },
  btn: { backgroundColor: "#0095f6", borderRadius: 8, paddingHorizontal: 30, paddingVertical: 14, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  previewContainer: { flex: 1, backgroundColor: "#000" },
  preview: { flex: 1 },
  actions: { position: "absolute", bottom: 40, left: 0, right: 0, flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20 },
  discardBtn: { backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14, borderWidth: 1, borderColor: "#fff" },
  discardText: { color: "#fff", fontWeight: "600" },
  shareBtn: { backgroundColor: "#0095f6", borderRadius: 8, paddingHorizontal: 24, paddingVertical: 14 },
  shareText: { color: "#fff", fontWeight: "600" },
  btnDisabled: { opacity: 0.6 },
});
