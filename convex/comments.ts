import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./user";

export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx);
    const post = await ctx.db.get(args.postId);

    if (!post) throw new ConvexError("Post not found");

    const commentId = await ctx.db.insert("comments", {
      author: currentUser?._id,
      content: args.content,
      postId: args.postId,
    });

    await ctx.db.patch(args.postId, { comments: post.comments + 1 });

    // if not current user post, create notification
    if (currentUser._id !== post.userId) {
      await ctx.db.insert("notifications", {
        receiverId: post.userId,
        senderId: currentUser._id,
        type: "comment",
        postId: args.postId,
        commentId,
      });
    }

    return commentId;
  },
});

export const getComments = query({
  args: {
    postId: v.id("posts"),
  },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    // if (comments.length === 0) return [];

    const commentsWithSomeInfo = await Promise.all(
      comments.map(async (comment) => {
        const commentAuthor = (await ctx.db.get(comment.author))!;

        return {
          ...comment,
          author: {
            _id: commentAuthor?._id,
            username: commentAuthor?.username,
            image: commentAuthor?.image,
          },
        };
      })
    );

    return commentsWithSomeInfo;
  },
});
