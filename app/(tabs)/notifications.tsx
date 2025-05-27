import Loader from "@/components/Loader";
import { NotificationItem } from "@/components/NotificationItem";
import { COLORS } from "@/constants/theme";
import { api } from "@/convex/_generated/api";
import { styles } from "@/styles/notifications.styles";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import React from "react";
import { FlatList, Text, View } from "react-native";

export default function Notifications() {
  const notifications = useQuery(api.notifications.getNotifications);

  if (notifications === undefined) return <Loader />;
  if (notifications.length === 0) return <NoNotificationsFound />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      {notifications.length === 0 ? (
        <NoNotificationsFound />
      ) : (
        <FlatList
          data={notifications}
          renderItem={({ item }) => <NotificationItem not={item} />}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const NoNotificationsFound = () => {
  return (
    <View style={[styles.container, styles.centered]}>
      <Ionicons
        name="notifications-off-outline"
        size={40}
        color={COLORS.primary}
      />
      <Text
        style={{
          fontSize: 20,
          color: COLORS.white,
          fontWeight: 600,
          marginTop: 16,
        }}
      >
        No notifications yet
      </Text>
    </View>
  );
};
