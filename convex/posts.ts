import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";
import { Id } from "./_generated/dataModel";

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Unauthorized");

  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    caption: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("Image not found");

    // create post
    const postId = await ctx.db.insert("posts", {
      userId: currentUser?._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // icrement number of user posts
    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});

export const getFeedPosts = query({
  handler: async (ctx) => {
    const currentUser = await getAuthenticatedUser(ctx);

    // get all posts
    const posts = await ctx.db.query("posts").order("desc").collect();

    if (posts.length === 0) return [];

    // enhace post obj with user data and interaction status
    const postsWithSomeInfo = await Promise.all(
      posts.map(async (post) => {
        const postAuthor = (await ctx.db.get(post.userId))!;

        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q
              .eq("postId", post._id)
              .eq("userId", currentUser?._id as Id<"users">)
          )
          .first();

        const bookmark = await ctx.db
          .query("bookmarks")
          .withIndex("by_user_and_post", (q) =>
            q
              .eq("postId", post._id)
              .eq("userId", currentUser?._id as Id<"users">)
          )
          .first();

        return {
          ...post,
          author: {
            _id: postAuthor?._id,
            username: postAuthor?.username,
            image: postAuthor?.image,
          },
          isLiked: !!like,
          isBookmarked: !!bookmark,
        };
      })
    );

    return postsWithSomeInfo;
  },
});

export const toggleLike = mutation({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q
          .eq("postId", args.postId)
          .eq("userId", currentUser?._id as Id<"users">)
      )
      .first();
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    if (existing) {
      // remove like
      await ctx.db.delete(existing._id);
      await ctx.db.patch(args.postId, { likes: post.likes - 1 });
      return false;
    } else {
      // add like
      await ctx.db.insert("likes", {
        userId: currentUser._id,
        postId: args.postId,
      });
      await ctx.db.patch(args.postId, { likes: post.likes + 1 });

      // if not current user post, create notification
      if (currentUser._id !== post.userId) {
        await ctx.db.insert("notifications", {
          receiverId: post.userId,
          senderId: currentUser._id,
          type: "like",
          postId: args.postId,
        });
      }

      return true;
    }
  },
});

export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId)!;
    if (!post) throw new Error();

    // delete associated likes
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    // delete associated comments
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    // delete associated bookmarks
    const bookmarks = await ctx.db
      .query("bookmarks")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const bookmark of bookmarks) {
      await ctx.db.delete(bookmark._id);
    }

    // delete associated notifications
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const notification of notifications) {
      await ctx.db.delete(notification._id);
    }

    // delete storage file and post
    await ctx.storage.delete(post?.storageId);
    await ctx.db.delete(args.postId);

    // decrement user post by 1
    await ctx.db.patch(currentUser?._id as Id<"users">, {
      posts: Math.max(0, (currentUser?.posts || 1) - 1),
    });
  },
});

export const getPostsByUser = query({
  args: {
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const currentUser = args?.userId
      ? await ctx.db.get(args.userId)
      : await getAuthenticatedUser(ctx);

    // if (!currentUser) throw new Error("User not found");

    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", (q) =>
        q.eq("userId", args.userId || (currentUser?._id as Id<"users">))
      )
      .collect();

    return posts;
  },
});
