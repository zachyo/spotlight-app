import React from "react";
import { Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  return (
    <View>
      <Redirect href={"/(auth)/login"} />
    </View>
  );
}
