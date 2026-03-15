/**
 * screens/SearchScreen.js
 *
 * Debounced search — waits 500ms after typing stops
 * then fires API call. Prevents spamming the server.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View, TextInput, FlatList, Text, Image,
  TouchableOpacity, StyleSheet, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { userAPI } from "../services/api";

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const debounceTimer = useRef(null);

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const res = await userAPI.getSuggestions();
      setSuggestions(res.data);
    } catch (e) {}
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await userAPI.search(query.trim());
        setResults(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer.current);
  }, [query]);

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userRow}
      onPress={() =>
        navigation.navigate("UserProfile", {
          userId: item._id,
          username: item.username,
        })
      }
    >
      <Image source={{ uri: item.profilePic }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
        {item.fullName ? (
          <Text style={styles.fullName}>{item.fullName}</Text>
        ) : null}
        <Text style={styles.followers}>
          {item.followers?.length || 0} followers
        </Text>
      </View>
    </TouchableOpacity>
  );

  const displayData = query.trim() ? results : suggestions;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#999"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {loading && (
        <ActivityIndicator size="small" color="#0095f6" style={{ marginTop: 16 }} />
      )}

      {!query && (
        <Text style={styles.sectionTitle}>Suggestions For You</Text>
      )}

      <FlatList
        data={displayData}
        keyExtractor={(item) => item._id}
        renderItem={renderUser}
        ListEmptyComponent={
          !loading && query ? (
            <Text style={styles.noResults}>No users found for "{query}"</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#efefef",
    margin: 12,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#262626" },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#262626",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 14 },
  userInfo: { flex: 1 },
  username: { fontWeight: "600", fontSize: 13, color: "#262626" },
  fullName: { fontSize: 13, color: "#999", marginTop: 1 },
  followers: { fontSize: 12, color: "#999", marginTop: 1 },
  noResults: { textAlign: "center", color: "#999", marginTop: 40, fontSize: 14 },
});
