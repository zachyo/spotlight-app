import { View, Text, FlatList } from "react-native";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Loader from "@/components/Loader";
import { styles } from "@/styles/home.styles";
import { NoPostsFound } from "./home";
import { Image } from "expo-image";

export default function Bookmarks() {
  const bookmarks = useQuery(api.bookmarks.getBookmarkedPosts);

  if (bookmarks === undefined) return <Loader />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookmarks</Text>
      </View>

      {/* Posts */}
      {bookmarks.length === 0 ? (
        <NoPostsFound placeholder="No bookmarked posts yet" />
      ) : (
        <FlatList
          data={bookmarks}
          numColumns={3}
          renderItem={({ item }) => (
            <View style={{ width: "33.33%", padding: 1 }}>
              <Image
                source={item.imageUrl}
                style={{ width: "100%", aspectRatio: 1 }}
                contentFit="cover"
                transition={200}
                cachePolicy={"memory-disk"}
              />
            </View>
          )}
          // keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.container]}
        />
      )}
    </View>
  );
}
