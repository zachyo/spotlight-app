import ErrorBoundary from "@/components/ErrorBoundary";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import React from "react";

export default function ClerkAndCovexProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
  const convex = new ConvexReactClient(
    process.env.EXPO_PUBLIC_CONVEX_URL! as string,
    {
      unsavedChangesWarning: false,
    }
  );

  if (!publishableKey) {
    throw new Error("Missing key");
  }
  return (
    <ErrorBoundary name="RootProvider">
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ConvexProviderWithClerk useAuth={useAuth} client={convex}>
          {children}
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ErrorBoundary>
  );
}
