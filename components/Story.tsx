import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { styles } from "@/styles/home.styles";
import { Image } from "expo-image";

type StoryType = {
  id: number;
  username: string;
  avatar: string;
  hasStory: boolean;
};

const Story = ({ story }: { story: StoryType }) => {
  return (
    <TouchableOpacity style={styles.storyWrapper}>
      <View style={[styles.storyRing, !story.hasStory && styles.noStory]}>
        <Image source={story.avatar} style={styles.storyAvatar} />
      </View>
      <Text style={styles.storyUsername}>{story.username}</Text>
    </TouchableOpacity>
  );
};

export default Story;
