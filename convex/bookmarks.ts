import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const toggleBookmarks = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("bookmarks")
      .withIndex("by_user_and_post", (q) =>
        q.eq("postId", args.postId).eq("userId", currentUser._id)
      )
      .first();

    if (existing) {
      // remove bookamrks
      await ctx.db.delete(existing._id);
      return false;
    } else {
      // add bookamrks
      await ctx.db.insert("bookmarks", {
        userId: currentUser._id,
        postId: args.postId,
      });

      return true;
    }
  },
});

export const getBookmarkedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // get all bookmarks of current user
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
      .order("desc")
      .collect();

    if (bookmarks.length === 0) return [];

    // enhace post obj with user data and interaction status
    const bookmarksWithSomeInfo = await Promise.all(
      bookmarks.map(async (bookmark) => {
        const post = (await ctx.db.get(bookmark.postId))!;
        return post;
      })
    );

    return bookmarksWithSomeInfo;
  },
});
