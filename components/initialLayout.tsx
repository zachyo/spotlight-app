import { View, Text } from "react-native";
import React, { useEffect } from "react";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useSegments } from "expo-router";

export default function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthScreen = segments[0] === "(auth)";
    // if not signed in, route to auth screen (do this when not in auth screen)
    // if signed in, route to home page (do this when in auth screen)

    if (!isSignedIn && !inAuthScreen) router.replace("/(auth)/login");
    else if (isSignedIn && inAuthScreen) router.replace("/(tabs)/home");
  }, [isLoaded, isSignedIn, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}
