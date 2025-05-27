import Loader from "@/components/Loader";
import UserPostList from "@/components/UserPostList";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "convex/react";
import React from "react";

export default function UserPosts() {
  const { userId } = useAuth();
  const currentUser = useQuery(
    api.user.getUserByClerkId,
    userId
      ? {
          clerkId: userId,
        }
      : "skip"
  );
  const posts = useQuery(api.posts.getPostsByUser, {
    userId: currentUser?._id as Id<"users">,
  });

  if (!currentUser || posts === undefined) return <Loader />;

  return <UserPostList username={currentUser.fullname} posts={posts} />;
}
