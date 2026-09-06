import { create } from 'zustand';
import { 
  Club, 
  Society, 
  ClubPact, 
  DigitalEvent, 
  ClubPost, 
  ClubComment, 
  ClubRole, 
  ClubHierarchyRank 
} from '@/types/database';
import { 
  INITIAL_CLUBS, 
  INITIAL_SOCIETIES, 
  INITIAL_PACTS, 
  INITIAL_DIGITAL_EVENTS, 
  INITIAL_POSTS, 
  INITIAL_COMMENTS 
} from '@/lib/channels-data';

interface ClubsState {
  clubs: Club[];
  societies: Society[];
  pacts: ClubPact[];
  events: DigitalEvent[];
  posts: ClubPost[];
  commentsByPostId: Record<string, ClubComment[]>;
  subscribedClubIds: string[];
  
  // Legacy aliases
  channels: Club[];
  subscribedChannelIds: string[];

  // Actions - Clubs
  joinClub: (clubId: string, user?: { id: string; username: string; display_name: string; avatar_url: string }) => boolean;
  leaveClub: (clubId: string, userId?: string) => void;
  createClub: (club: {
    name: string;
    slug: string;
    tag: string;
    motto: string;
    description: string;
    category: 'Gaming' | 'Anime' | 'Pop Culture' | 'Tech';
    avatar_url: string;
    banner_url?: string;
    entry_type: 'open' | 'application' | 'invite';
    member_limit: number;
    created_by: string;
  }) => Club;

  // Custom Discord-style Roles inside Club Settings
  createCustomRole: (clubId: string, role: { name: string; color: string; icon?: string }) => ClubRole;
  deleteCustomRole: (clubId: string, roleId: string) => void;
  assignRoleToMember: (clubId: string, memberUserId: string, role: ClubRole) => void;
  removeRoleFromMember: (clubId: string, memberUserId: string, roleId: string) => void;
  setMemberRank: (clubId: string, memberUserId: string, rank: ClubHierarchyRank) => void;

  // Actions - Societies & Mutual Treaties
  createSocietyWithPact: (data: {
    name: string;
    slug: string;
    tag: string;
    motto: string;
    description: string;
    category: string;
    crest_url: string;
    founderClubId: string;
    alliedClubId: string;
    treatyCharter: string[];
  }) => Society;
  signMutualPact: (pactId: string) => void;

  // Actions - Digital Events
  createDigitalEvent: (event: Omit<DigitalEvent, 'id' | 'created_at' | 'rsvp_user_ids'>) => DigitalEvent;
  rsvpEvent: (eventId: string, userId: string) => void;

  // Actions - Discussions & Boosts
  createPost: (post: { 
    club_id: string; 
    society_id?: string | null;
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
    event_id?: string;
    user_id: string; 
    author_name: string; 
    author_username: string; 
    author_avatar: string; 
    author_rank?: ClubHierarchyRank;
    author_custom_roles?: ClubRole[];
    author_club_tag?: string;
  }) => ClubPost;
  boostPost: (postId: string) => void;
  votePost: (postId: string, type: 'up' | 'down') => void; // backwards compat for upvotes
  
  addComment: (postId: string, parentId: string | null, content: string, user: { 
    id: string; 
    name: string; 
    username: string; 
    avatar: string; 
    rank?: ClubHierarchyRank;
    custom_roles?: ClubRole[];
  }) => void;
  boostComment: (postId: string, commentId: string) => void;
  voteComment: (postId: string, commentId: string, type: 'up' | 'down') => void;
}

export const useChannelsStore = create<ClubsState>((set, get) => ({
  clubs: INITIAL_CLUBS,
  societies: INITIAL_SOCIETIES,
  pacts: INITIAL_PACTS,
  events: INITIAL_DIGITAL_EVENTS,
  posts: INITIAL_POSTS,
  commentsByPostId: INITIAL_COMMENTS,
  subscribedClubIds: ['club-crucible', 'club-sakuga'],

  // Legacy mappings
  channels: INITIAL_CLUBS,
  subscribedChannelIds: ['club-crucible', 'club-sakuga'],

  joinClub: (clubId, user) => {
    const club = get().clubs.find(c => c.id === clubId);
    if (!club) return false;
    if (club.member_count >= club.member_limit) return false;

    set((state) => {
      const isAlready = state.subscribedClubIds.includes(clubId);
      if (isAlready) return state;

      const newMember = user ? {
        id: `mem-${Date.now()}`,
        user_id: user.id,
        username: user.username,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        rank: 'member' as ClubHierarchyRank,
        custom_roles: [],
        xp_contributed: 100,
        joined_at: new Date().toISOString(),
      } : null;

      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            member_count: c.member_count + 1,
            xp: c.xp + 100,
            members: newMember ? [...c.members, newMember] : c.members,
          };
        }
        return c;
      });

      return {
        subscribedClubIds: [...state.subscribedClubIds, clubId],
        subscribedChannelIds: [...state.subscribedClubIds, clubId],
        clubs: updatedClubs,
        channels: updatedClubs,
      };
    });
    return true;
  },

  leaveClub: (clubId, userId) => {
    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            member_count: Math.max(0, c.member_count - 1),
            members: userId ? c.members.filter(m => m.user_id !== userId) : c.members,
          };
        }
        return c;
      });

      const nextSub = state.subscribedClubIds.filter(id => id !== clubId);
      return {
        subscribedClubIds: nextSub,
        subscribedChannelIds: nextSub,
        clubs: updatedClubs,
        channels: updatedClubs,
      };
    });
  },

  createClub: (clubData) => {
    const newClub: Club = {
      id: `club-${clubData.slug}`,
      name: clubData.name,
      slug: clubData.slug,
      tag: clubData.tag.toUpperCase(),
      motto: clubData.motto,
      description: clubData.description,
      category: clubData.category,
      avatar_url: clubData.avatar_url,
      banner_url: clubData.banner_url || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&auto=format&fit=crop&q=80',
      created_by: clubData.created_by,
      president_id: clubData.created_by,
      entry_type: clubData.entry_type,
      member_limit: clubData.member_limit,
      member_count: 1,
      level: 1,
      xp: 500,
      custom_roles: [
        { id: `role-${Date.now()}-1`, club_id: `club-${clubData.slug}`, name: 'Founding Member', color: '#f43f5e', icon: '👑' },
        { id: `role-${Date.now()}-2`, club_id: `club-${clubData.slug}`, name: 'Elite Guard', color: '#06b6d4', icon: '🛡️' },
      ],
      members: [
        {
          id: `mem-pres-${Date.now()}`,
          user_id: clubData.created_by,
          username: 'club_founder',
          display_name: 'Guild Founder',
          avatar_url: clubData.avatar_url,
          rank: 'president',
          custom_roles: [{ id: `role-${Date.now()}-1`, club_id: `club-${clubData.slug}`, name: 'Founding Member', color: '#f43f5e', icon: '👑' }],
          xp_contributed: 500,
          joined_at: new Date().toISOString(),
        }
      ],
      perks: [
        'Exclusive voting on clan topics & tournaments',
        'Direct Discord role sync with Guild tags',
        'Capacity for up to ' + clubData.member_limit + ' clan members'
      ],
      rules: [
        'Uphold guild camaraderie & respect fellow initiates.',
        'Tag spoilers for all recent game and movie releases.'
      ],
      created_at: new Date().toISOString(),
    };

    set((state) => {
      const nextClubs = [newClub, ...state.clubs];
      return {
        clubs: nextClubs,
        channels: nextClubs,
        subscribedClubIds: [...state.subscribedClubIds, newClub.id],
        subscribedChannelIds: [...state.subscribedClubIds, newClub.id],
      };
    });

    return newClub;
  },

  createCustomRole: (clubId, role) => {
    const newRole: ClubRole = {
      id: `role-${Date.now()}`,
      club_id: clubId,
      name: role.name,
      color: role.color,
      icon: role.icon || '🏷️',
    };

    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            custom_roles: [...c.custom_roles, newRole],
          };
        }
        return c;
      });
      return { clubs: updatedClubs, channels: updatedClubs };
    });

    return newRole;
  },

  deleteCustomRole: (clubId, roleId) => {
    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            custom_roles: c.custom_roles.filter(r => r.id !== roleId),
            members: c.members.map(m => ({
              ...m,
              custom_roles: m.custom_roles.filter(r => r.id !== roleId)
            }))
          };
        }
        return c;
      });
      return { clubs: updatedClubs, channels: updatedClubs };
    });
  },

  assignRoleToMember: (clubId, memberUserId, role) => {
    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            members: c.members.map(m => {
              if ((m.user_id === memberUserId || m.id === memberUserId) && !m.custom_roles.some(r => r.id === role.id)) {
                return { ...m, custom_roles: [...m.custom_roles, role] };
              }
              return m;
            })
          };
        }
        return c;
      });
      return { clubs: updatedClubs, channels: updatedClubs };
    });
  },

  removeRoleFromMember: (clubId, memberUserId, roleId) => {
    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            members: c.members.map(m => {
              if (m.user_id === memberUserId || m.id === memberUserId) {
                return { ...m, custom_roles: m.custom_roles.filter(r => r.id !== roleId) };
              }
              return m;
            })
          };
        }
        return c;
      });
      return { clubs: updatedClubs, channels: updatedClubs };
    });
  },

  setMemberRank: (clubId, memberUserId, rank) => {
    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === clubId) {
          return {
            ...c,
            members: c.members.map(m => {
              if (m.user_id === memberUserId) {
                return { ...m, rank };
              }
              return m;
            })
          };
        }
        return c;
      });
      return { clubs: updatedClubs, channels: updatedClubs };
    });
  },

  createSocietyWithPact: (data) => {
    const newSocietyId = `soc-${data.slug}`;
    const newSociety: Society = {
      id: newSocietyId,
      name: data.name,
      slug: data.slug,
      tag: data.tag.toUpperCase(),
      motto: data.motto,
      description: data.description,
      category: data.category,
      crest_url: data.crest_url,
      banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&auto=format&fit=crop&q=80',
      founder_club_id: data.founderClubId,
      member_club_ids: [data.founderClubId, data.alliedClubId],
      level: 5,
      xp: 10000,
      treaty_charter: data.treatyCharter,
      created_at: new Date().toISOString(),
    };

    const newPact: ClubPact = {
      id: `pact-${Date.now()}`,
      society_id: newSocietyId,
      society_name: data.name,
      club_a_id: data.founderClubId,
      club_b_id: data.alliedClubId,
      status: 'active',
      treaty_title: `Grand Treaty of ${data.name}`,
      signed_at: new Date().toISOString(),
    };

    set((state) => {
      const updatedClubs = state.clubs.map((c) => {
        if (c.id === data.founderClubId || c.id === data.alliedClubId) {
          return { ...c, society_id: newSocietyId, xp: c.xp + 500 };
        }
        return c;
      });

      return {
        societies: [newSociety, ...state.societies],
        pacts: [newPact, ...state.pacts],
        clubs: updatedClubs,
        channels: updatedClubs,
      };
    });

    return newSociety;
  },

  signMutualPact: (pactId) => {
    set((state) => ({
      pacts: state.pacts.map(p => p.id === pactId ? { ...p, status: 'active' } : p)
    }));
  },

  createDigitalEvent: (eventData) => {
    const newEvent: DigitalEvent = {
      id: `event-${Date.now()}`,
      ...eventData,
      rsvp_user_ids: [eventData.created_by],
      created_at: new Date().toISOString(),
    };

    set((state) => {
      // Award club and society XP for event creation
      const updatedClubs = state.clubs.map(c => {
        if (c.id === eventData.club_id) return { ...c, xp: c.xp + 300 };
        return c;
      });

      return {
        events: [newEvent, ...state.events],
        clubs: updatedClubs,
        channels: updatedClubs,
      };
    });

    return newEvent;
  },

  rsvpEvent: (eventId, userId) => {
    set((state) => ({
      events: state.events.map(ev => {
        if (ev.id === eventId) {
          const hasRsvp = ev.rsvp_user_ids.includes(userId);
          const nextRsvp = hasRsvp 
            ? ev.rsvp_user_ids.filter(id => id !== userId)
            : [...ev.rsvp_user_ids, userId];
          return { ...ev, rsvp_user_ids: nextRsvp };
        }
        return ev;
      })
    }));
  },

  createPost: (postData) => {
    const club = get().clubs.find(c => c.id === postData.club_id);
    const newPost: ClubPost = {
      id: `post-${Date.now()}`,
      club_id: postData.club_id,
      society_id: postData.society_id || club?.society_id || null,
      user_id: postData.user_id,
      author_name: postData.author_name,
      author_username: postData.author_username,
      author_avatar: postData.author_avatar,
      author_rank: postData.author_rank || 'member',
      author_custom_roles: postData.author_custom_roles || [],
      author_club_tag: postData.author_club_tag || club?.tag || 'CLAN',
      title: postData.title,
      content: postData.content,
      flair: postData.flair || 'Discussion',
      media_url: postData.media_url || null,
      link_url: postData.link_url || null,
      article_slug: postData.article_slug || null,
      article_title: postData.article_title || null,
      article_thumbnail: postData.article_thumbnail || null,
      article_score: postData.article_score || null,
      article_read_time: postData.article_read_time || null,
      article_category: postData.article_category || null,
      event_id: postData.event_id || null,
      boosts: 1,
      user_boosted: true,
      comments_count: 0,
      created_at: 'Just now',
    };

    set((state) => {
      const updatedClubs = state.clubs.map(c => {
        if (c.id === postData.club_id) return { ...c, xp: c.xp + 50 };
        return c;
      });

      return {
        posts: [newPost, ...state.posts],
        clubs: updatedClubs,
        channels: updatedClubs,
      };
    });

    return newPost;
  },

  boostPost: (postId) => {
    set((state) => ({
      posts: state.posts.map((p) => {
        if (p.id === postId) {
          const isBoosted = p.user_boosted;
          return {
            ...p,
            boosts: isBoosted ? p.boosts - 1 : p.boosts + 1,
            user_boosted: !isBoosted,
          };
        }
        return p;
      }),
    }));
  },

  votePost: (postId, type) => {
    // Backwards-compatible boost
    get().boostPost(postId);
  },

  addComment: (postId, parentId, content, user) => {
    const newComment: ClubComment = {
      id: `comm-${Date.now()}`,
      post_id: postId,
      parent_id: parentId,
      user_id: user.id,
      author_name: user.name,
      author_username: user.username,
      author_avatar: user.avatar,
      author_rank: user.rank || 'member',
      author_custom_roles: user.custom_roles || [],
      content,
      boosts: 1,
      user_boosted: true,
      created_at: 'Just now',
      replies: [],
    };

    set((state) => {
      const currentComments = state.commentsByPostId[postId] || [];

      const insertReply = (list: ClubComment[]): ClubComment[] => {
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

  boostComment: (postId, commentId) => {
    set((state) => {
      const currentComments = state.commentsByPostId[postId] || [];

      const updateInList = (list: ClubComment[]): ClubComment[] => {
        return list.map((c) => {
          if (c.id === commentId) {
            const isBoosted = c.user_boosted;
            return {
              ...c,
              boosts: isBoosted ? c.boosts - 1 : c.boosts + 1,
              user_boosted: !isBoosted,
            };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateInList(c.replies) };
          }
          return c;
        });
      };

      return {
        commentsByPostId: {
          ...state.commentsByPostId,
          [postId]: updateInList(currentComments),
        },
      };
    });
  },

  voteComment: (postId, commentId, type) => {
    get().boostComment(postId, commentId);
  },
}));
