import Story from "@/components/Story";
import { STORIES } from "@/constants/mock-data";
import { styles } from "@/styles/home.styles";
import { ScrollView } from "react-native";

export const StoriesSection = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.storiesContainer}
    >
      {STORIES.map((story) => (
        <Story story={story} key={story?.id} />
      ))}
    </ScrollView>
  );
};
