import Loader from "@/components/Loader";
import Post from "@/components/Post";
import { StoriesSection } from "@/components/Stories";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/home.styles";
import { useState } from "react";

export default function Home() {
  const { signOut } = useAuth();
  const [refreshing, setResfreshing] = useState(false);

  const posts = useQuery(api.posts.getFeedPosts);
  const onRefresh = () => {
    setResfreshing(true);
    // use tanstack query to refresh query
    setTimeout(() => setResfreshing(false), 2000);
  };

  if (posts === undefined) return <Loader />;
  // if (posts.length === 0) return <NoPostsFound />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>spotlight</Text>
        <TouchableOpacity onPress={() => signOut()}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      {posts.length === 0 ? (
        <NoPostsFound />
      ) : (
        <FlatList
          data={posts}
          renderItem={({ item }) => <Post post={item} />}
          keyExtractor={(item) => item._id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListHeaderComponent={<StoriesSection />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        />
      )}
    </View>
  );
}

export const NoPostsFound = ({ placeholder }: { placeholder?: string }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 55,
      }}
    >
      <Text style={{ fontSize: 20, color: COLORS.primary }}>
        {placeholder ?? "No posts yet"}
      </Text>
    </View>
  );
};
