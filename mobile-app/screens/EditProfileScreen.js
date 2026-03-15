/**
 * screens/EditProfileScreen.js
 */

import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    username: user?.username || "",
    fullName: user?.fullName || "",
    bio: user?.bio || "",
    website: user?.website || "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setProfilePic(result.assets[0]);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (profilePic) {
        formData.append("profilePic", {
          uri: profilePic.uri,
          type: "image/jpeg",
          name: "profile.jpg",
        });
      }

      const res = await userAPI.updateProfile(formData);
      updateUser(res.data);
      Alert.alert("Success", "Profile updated!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* Avatar */}
      <TouchableOpacity style={styles.avatarSection} onPress={pickImage}>
        <Image
          source={{ uri: profilePic?.uri || user?.profilePic }}
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Change Profile Photo</Text>
      </TouchableOpacity>

      {[
        { label: "Name", field: "fullName", placeholder: "Full name" },
        { label: "Username", field: "username", placeholder: "Username" },
        { label: "Website", field: "website", placeholder: "Website" },
        { label: "Bio", field: "bio", placeholder: "Bio", multiline: true },
      ].map(({ label, field, placeholder, multiline }) => (
        <View key={field} style={styles.field}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput
            style={[styles.input, multiline && styles.multiInput]}
            value={form[field]}
            onChangeText={(v) => update(field, v)}
            placeholder={placeholder}
            multiline={multiline}
            placeholderTextColor="#999"
          />
        </View>
      ))}

      <TouchableOpacity
        style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  avatarSection: { alignItems: "center", paddingVertical: 20, borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb" },
  avatar: { width: 90, height: 90, borderRadius: 45, marginBottom: 10 },
  changePhotoText: { color: "#0095f6", fontWeight: "600", fontSize: 14 },
  field: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#dbdbdb" },
  fieldLabel: { fontSize: 12, color: "#999", marginBottom: 4 },
  input: { fontSize: 15, color: "#262626" },
  multiInput: { minHeight: 60, textAlignVertical: "top" },
  saveBtn: { backgroundColor: "#0095f6", margin: 16, borderRadius: 8, paddingVertical: 13, alignItems: "center" },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
