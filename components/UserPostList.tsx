import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/profle.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

type PostType = {
  _id: Id<"posts">;
  _creationTime: number;
  caption?: string | undefined;
  userId: Id<"users">;
  comments: number;
  imageUrl: string;
  storageId: Id<"_storage">;
  likes: number;
};
const UserPostList = ({
  username,
  posts,
}: {
  username: string;
  posts: PostType[];
}) => {
  const router = useRouter();
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else router.replace("/(tabs)/home");
  };
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{username} posts</Text>
        <View style={{ width: 24 }} />
      </View>
    </View>
  );
};

export default UserPostList;
