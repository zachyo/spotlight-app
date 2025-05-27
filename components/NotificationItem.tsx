import { COLORS } from "@/constants/theme";
import { Id } from "@/convex/_generated/dataModel";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type Notification = {
  sender: {
    _id: Id<"users">;
    username: string;
    image: string;
  };
  post: {
    _id: Id<"posts">;
    _creationTime: number;
    caption?: string | undefined;
    userId: Id<"users">;
    imageUrl: string;
    storageId: Id<"_storage">;
    likes: number;
    comments: number;
  } | null;
  comment?: string;
  _id: Id<"notifications">;
  _creationTime: number;
  postId?: Id<"posts"> | undefined;
  commentId?: Id<"comments"> | undefined;
  type: "like" | "comment" | "follow";
  receiverId: Id<"users">;
  senderId: Id<"users">;
};

export const NotificationItem = ({ not }: { not: Notification }) => {
  const toShow = {
    like: {
      color: COLORS.primary,
      icon: "heart",
    },
    follow: {
      color: "#885cf6",
      icon: "person-add",
    },
    comment: {
      color: "#3882f6",
      icon: "chatbubble",
    },
  };
  return (
    <View style={styles.notificationItem}>
      <View style={styles.notificationContent}>
        <Link href={`/user/${not.senderId}`} asChild>
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={not.sender.image}
              style={styles.avatar}
              contentFit="cover"
              transition={200}
            />
            <View style={styles.iconBadge}>
              <Ionicons
                size={14}
                color={toShow?.[`${not.type}` as keyof typeof toShow].color}
                name={
                  toShow?.[`${not.type}` as keyof typeof toShow].icon as any
                }
              />
            </View>
          </TouchableOpacity>
        </Link>

        <View style={styles.notificationInfo}>
          <Text>
            <Link
              href={`/user/${not.senderId}`}
              asChild
              style={{ width: "auto" }}
            >
              <TouchableOpacity>
                <Text style={styles.username}>{not.sender.username} </Text>
              </TouchableOpacity>
            </Link>
            <Text style={styles.action}>
              {not.type === "follow"
                ? "started following you"
                : not.type === "like"
                  ? "liked your post"
                  : `commented: "${not.comment}"`}
            </Text>
          </Text>
          <Text style={styles.timeAgo}>
            {formatDistanceToNow(not._creationTime, { addSuffix: true })}
          </Text>
        </View>
      </View>
      {not.post ? (
        <Image
          source={not.post.imageUrl}
          contentFit="cover"
          transition={200}
          style={styles.postImage}
        />
      ) : (
        <TouchableOpacity>
          <Text>Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
