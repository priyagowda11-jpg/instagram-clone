/**
 * screens/CreatePostScreen.js
 *
 * FLOW:
 * 1. Pick image from gallery (Expo Image Picker)
 * 2. Preview image
 * 3. Add caption
 * 4. Upload → FormData → API → Cloudinary → MongoDB
 */

import React, { useState } from "react";
import {
  View, Text, TextInput, Image, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { postAPI } from "../services/api";

export default function CreatePostScreen({ navigation }) {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Pick image from gallery ──────────────
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need gallery access to pick photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // ─── Take photo with camera ───────────────
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "We need camera access to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  // ─── Submit post ──────────────────────────
  const handleCreate = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setLoading(true);
    try {
      /**
       * WHY FORMDATA?
       * - Files can't be sent as JSON
       * - FormData handles multipart/form-data encoding
       * - Backend (Multer) reads files from multipart requests
       */
      const formData = new FormData();
      formData.append("image", {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: "post.jpg",
      });
      if (caption) formData.append("caption", caption);
      if (location) formData.append("location", location);

      await postAPI.create(formData);

      // Reset form and go back
      setImage(null);
      setCaption("");
      setLocation("");
      navigation.navigate("Home");
      Alert.alert("Success", "Post created! 🎉");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  // ─── Initial pick screen ──────────────────
  if (!image) {
    return (
      <View style={styles.pickContainer}>
        <Text style={styles.pickTitle}>New Post</Text>
        <Ionicons name="image-outline" size={80} color="#dbdbdb" />
        <Text style={styles.pickSubtitle}>Share a photo</Text>

        <TouchableOpacity style={styles.pickButton} onPress={pickImage}>
          <Ionicons name="images" size={20} color="#fff" />
          <Text style={styles.pickButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.pickButton, { backgroundColor: "#262626" }]}
          onPress={takePhoto}
        >
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.pickButtonText}>Take a Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Post editor screen ───────────────────
  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setImage(null)}>
          <Ionicons name="close" size={28} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Post</Text>
        <TouchableOpacity onPress={handleCreate} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#0095f6" />
          ) : (
            <Text style={styles.shareBtn}>Share</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Image preview */}
      <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />

      {/* Caption input */}
      <View style={styles.captionContainer}>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={2200}
          placeholderTextColor="#999"
        />
      </View>

      {/* Location input */}
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={20} color="#999" />
        <TextInput
          style={styles.locationInput}
          placeholder="Add location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor="#999"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pickContainer: {
    flex: 1, backgroundColor: "#fff", justifyContent: "center",
    alignItems: "center", padding: 40,
  },
  pickTitle: { fontSize: 22, fontWeight: "600", color: "#262626", marginBottom: 24 },
  pickSubtitle: { fontSize: 16, color: "#999", marginTop: 12, marginBottom: 30 },
  pickButton: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#0095f6",
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8,
    marginBottom: 14, width: "100%", justifyContent: "center",
  },
  pickButtonText: { color: "#fff", fontWeight: "600", fontSize: 15, marginLeft: 8 },
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb",
  },
  headerTitle: { fontWeight: "600", fontSize: 16, color: "#262626" },
  shareBtn: { color: "#0095f6", fontWeight: "600", fontSize: 16 },
  preview: { width: "100%", height: 400 },
  captionContainer: {
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#dbdbdb",
  },
  captionInput: {
    fontSize: 15, color: "#262626", minHeight: 80, textAlignVertical: "top",
  },
  locationContainer: {
    flexDirection: "row", alignItems: "center",
    padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb",
  },
  locationInput: { flex: 1, fontSize: 15, color: "#262626", marginLeft: 8 },
});
