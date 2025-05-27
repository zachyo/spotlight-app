import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Modal,
} from "react-native";
import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks";
import { Doc, Id } from "@/convex/_generated/dataModel";
import Loader from "@/components/Loader";
import { styles } from "@/styles/profle.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { Image } from "expo-image";
import { NoPostsFound } from "../(tabs)/profile";
import { FlatList } from "react-native";

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  const [selectedPost, setSelectedPost] = useState<Doc<"posts"> | null>(null);

  const profile = useQuery(api.user.getUserProfile, {
    userId: id as Id<"users">,
  });
  const posts = useQuery(api.posts.getPostsByUser, {
    userId: id as Id<"users">,
  });
  const isFollowing = useQuery(api.user.isFollowing, {
    followingId: id as Id<"users">,
  });
  const toggleFollow = useMutation(api.user.toggleFollow);
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else router.replace("/(tabs)/home");
  };

  if (profile === undefined || posts === undefined || isFollowing === undefined)
    return <Loader />;
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile.username}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <View style={styles.avatarAndStats}>
            {/* Avatar */}
            <Image
              style={styles.avatar}
              source={profile.image}
              contentFit="cover"
              cachePolicy={"memory-disk"}
            />
            {/* Stats */}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{profile.fullname}</Text>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.posts}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{profile.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>
          </View>
          {profile.bio && <Text style={styles.bio}>{profile.bio}</Text>}

          <Pressable
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => toggleFollow({ followingId: id as Id<"users"> })}
          >
            <Text
              style={[
                styles.followButtonText,
                isFollowing && styles.followingButtonText,
              ]}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </Pressable>
        </View>

        {posts.length === 0 && <NoPostsFound />}
        <FlatList
          data={posts}
          numColumns={3}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => setSelectedPost(item)}
            >
              <Image
                source={item.imageUrl}
                style={styles.gridImage}
                contentFit="cover"
                transition={200}
              />
            </TouchableOpacity>
          )}
          style={{ marginTop: 20 }}
        />
      </ScrollView>

      {/* Selected Image Modal */}
      <Modal
        visible={!!selectedPost}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.postDetailContainer}>
            <View style={styles.postDetailHeader}>
              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <Ionicons name="close" size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <Image
              source={selectedPost?.imageUrl}
              style={styles.postDetailImage}
              cachePolicy={"memory-disk"}
              transition={100}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
