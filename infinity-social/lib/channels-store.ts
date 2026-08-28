import { create } from 'zustand';
import { Channel, ChannelPost, ChannelComment, ChannelBadgeType } from '@/types/database';
import { INITIAL_CHANNELS, INITIAL_POSTS, INITIAL_COMMENTS } from '@/lib/channels-data';

interface ChannelsState {
  channels: Channel[];
  posts: ChannelPost[];
  commentsByPostId: Record<string, ChannelComment[]>;
  subscribedChannelIds: string[];
  
  // Actions
  joinChannel: (channelId: string) => void;
  leaveChannel: (channelId: string) => void;
  createChannel: (channel: Omit<Channel, 'id' | 'member_count' | 'weekly_visitors' | 'weekly_contributions' | 'created_at'>) => Channel;
  
  createPost: (post: { 
    channel_id: string; 
    title: string; 
    content: string; 
    flair?: string; 
    media_url?: string; 
    link_url?: string;
    article_slug?: string;
    article_title?: string;
    article_thumbnail?: string;
    article_score?: string;
    article_read_time?: string;
    article_category?: string;
    user_id: string; 
    author_name: string; 
    author_username: string; 
    author_avatar: string; 
  }) => ChannelPost;
  votePost: (postId: string, type: 'up' | 'down') => void;
  
  addComment: (postId: string, parentId: string | null, content: string, user: { id: string; name: string; username: string; avatar: string; badges?: ChannelBadgeType[] }) => void;
  voteComment: (postId: string, commentId: string, type: 'up' | 'down') => void;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: INITIAL_CHANNELS,
  posts: INITIAL_POSTS,
  commentsByPostId: INITIAL_COMMENTS,
  subscribedChannelIds: ['ch-gaming', 'ch-anime'],

  joinChannel: (channelId) => {
    set((state) => ({
      subscribedChannelIds: [...state.subscribedChannelIds, channelId],
      channels: state.channels.map((c) =>
        c.id === channelId ? { ...c, member_count: c.member_count + 1 } : c
      ),
    }));
  },

  leaveChannel: (channelId) => {
    set((state) => ({
      subscribedChannelIds: state.subscribedChannelIds.filter((id) => id !== channelId),
      channels: state.channels.map((c) =>
        c.id === channelId ? { ...c, member_count: Math.max(0, c.member_count - 1) } : c
      ),
    }));
  },

  createChannel: (data) => {
    const newChannel: Channel = {
      ...data,
      id: `ch-${Date.now()}`,
      member_count: 1,
      weekly_visitors: 1,
      weekly_contributions: 0,
      rules: ['Be respectful', 'No spam'],
      created_at: new Date().toISOString(),
    };
    set((state) => ({
      channels: [newChannel, ...state.channels],
      subscribedChannelIds: [...state.subscribedChannelIds, newChannel.id],
    }));
    return newChannel;
  },

  createPost: (data) => {
    const newPost: ChannelPost = {
      id: `post-${Date.now()}`,
      channel_id: data.channel_id,
      user_id: data.user_id,
      author_name: data.author_name,
      author_username: data.author_username,
      author_avatar: data.author_avatar,
      author_badges: ['top_1_percent_commenter'],
      title: data.title,
      content: data.content,
      flair: data.flair || 'Discussion',
      media_url: data.media_url || null,
      link_url: data.link_url || null,
      article_slug: data.article_slug || null,
      article_title: data.article_title || null,
      article_thumbnail: data.article_thumbnail || null,
      article_score: data.article_score || null,
      article_read_time: data.article_read_time || null,
      article_category: data.article_category || null,
      upvotes: 1,
      downvotes: 0,
      user_vote: 'up',
      comments_count: 0,
      created_at: 'Just now',
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
      commentsByPostId: {
        ...state.commentsByPostId,
        [newPost.id]: [],
      },
    }));

    return newPost;
  },

  votePost: (postId, type) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id !== postId) return post;
        const currentVote = post.user_vote;
        let upvotes = post.upvotes;
        let downvotes = post.downvotes;
        let newVote: 'up' | 'down' | null = type;

        if (currentVote === type) {
          // Cancel vote
          newVote = null;
          if (type === 'up') upvotes -= 1;
          else downvotes -= 1;
        } else if (currentVote) {
          // Switch vote
          if (type === 'up') {
            upvotes += 1;
            downvotes -= 1;
          } else {
            downvotes += 1;
            upvotes -= 1;
          }
        } else {
          // New vote
          if (type === 'up') upvotes += 1;
          else downvotes += 1;
        }

        return { ...post, upvotes, downvotes, user_vote: newVote };
      }),
    }));
  },

  addComment: (postId, parentId, content, user) => {
    const targetPost = get().posts.find((p) => p.id === postId);
    const isOp = targetPost?.user_id === user.id;

    const newComment: ChannelComment = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      post_id: postId,
      parent_id: parentId,
      user_id: user.id,
      author_name: user.name,
      author_username: user.username,
      author_avatar: user.avatar,
      author_badges: user.badges || ['top_1_percent_commenter'],
      content,
      upvotes: 1,
      downvotes: 0,
      user_vote: 'up',
      is_op: isOp,
      created_at: 'Just now',
      replies: [],
    };

    set((state) => {
      const currentComments = state.commentsByPostId[postId] || [];

      // Helper to insert reply into recursive structure
      const insertReply = (list: ChannelComment[]): ChannelComment[] => {
        return list.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newComment] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: insertReply(c.replies) };
          }
          return c;
        });
      };

      const updatedComments = parentId
        ? insertReply(currentComments)
        : [...currentComments, newComment];

      return {
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: updatedComments,
        },
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p
        ),
      };
    });
  },

  voteComment: (postId, commentId, type) => {
    set((state) => {
      const currentComments = state.commentsByPostId[postId] || [];

      const updateVoteInList = (list: ChannelComment[]): ChannelComment[] => {
        return list.map((c) => {
          if (c.id === commentId) {
            const currentVote = c.user_vote;
            let upvotes = c.upvotes;
            let downvotes = c.downvotes;
            let newVote: 'up' | 'down' | null = type;

            if (currentVote === type) {
              newVote = null;
              if (type === 'up') upvotes -= 1;
              else downvotes -= 1;
            } else if (currentVote) {
              if (type === 'up') {
                upvotes += 1;
                downvotes -= 1;
              } else {
                downvotes += 1;
                upvotes -= 1;
              }
            } else {
              if (type === 'up') upvotes += 1;
              else downvotes += 1;
            }

            return { ...c, upvotes, downvotes, user_vote: newVote };
          }

          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateVoteInList(c.replies) };
          }
          return c;
        });
      };

      return {
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: updateVoteInList(currentComments),
        },
      };
    });
  },
}));
