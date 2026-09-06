import { Club, Society, ClubPact, DigitalEvent, ClubPost, ClubComment } from '@/types/database';

export const INITIAL_SOCIETIES: Society[] = [
  {
    id: 'soc-panth',
    name: 'Pantheon of Interactive Arts',
    slug: 'pantheon-arts',
    tag: 'PANTH',
    motto: 'Bridging competitive gaming execution with masterwork animation.',
    description: 'A Grand Allied Society established by mutual treaty between Crucible Vanguard and Sakuga Syndicate. We host combined game & anime digital summits.',
    category: 'Cross-Media',
    crest_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1400&auto=format&fit=crop&q=80',
    founder_club_id: 'club-crucible',
    member_club_ids: ['club-crucible', 'club-sakuga'],
    level: 14,
    xp: 28400,
    treaty_charter: [
      'Mutual non-aggression and cross-guild co-op summit hosting.',
      'Shared digital watchparty channels for seasonal anime and gaming reveals.',
      'Joint tournament scheduling with shared XP prize pools.',
      'Shared honorary Discord-style roles for guild executives.'
    ],
    created_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'soc-cinema-lab',
    name: 'Neo-Auteur Film & Tech Collective',
    slug: 'neo-auteur-collective',
    tag: 'AUTR',
    motto: 'Where cutting-edge compute pipelines meet cinematic auteur storytelling.',
    description: 'Federated alliance uniting film critics, cinematographers, and GPU/hardware modders for virtual movie retrospectives and deep-dive audio engineering.',
    category: 'Film & Tech',
    crest_url: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=300&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&auto=format&fit=crop&q=80',
    founder_club_id: 'club-cinema',
    member_club_ids: ['club-cinema', 'club-tech'],
    level: 9,
    xp: 14200,
    treaty_charter: [
      'Bi-weekly virtual cinema screenings with real-time technical breakdown audio.',
      'Collaborative hardware benchmarks on real-time raytraced cinematography.',
      'Cross-club executive council voting on featured monthly articles.'
    ],
    created_at: '2024-02-14T00:00:00Z',
  }
];

export const INITIAL_PACTS: ClubPact[] = [
  {
    id: 'pact-1',
    society_id: 'soc-panth',
    society_name: 'Pantheon of Interactive Arts',
    club_a_id: 'club-crucible',
    club_b_id: 'club-sakuga',
    status: 'active',
    treaty_title: 'Treaty of the Twin Vanguards (Gaming & Animation Alliance)',
    signed_at: '2024-01-20T00:00:00Z',
  },
  {
    id: 'pact-2',
    society_id: 'soc-cinema-lab',
    society_name: 'Neo-Auteur Film & Tech Collective',
    club_a_id: 'club-cinema',
    club_b_id: 'club-tech',
    status: 'active',
    treaty_title: 'Charter of High-Fidelity Cinema & Compute',
    signed_at: '2024-02-14T00:00:00Z',
  }
];

export const INITIAL_DIGITAL_EVENTS: DigitalEvent[] = [
  {
    id: 'event-1',
    club_id: 'club-crucible',
    society_id: 'soc-panth',
    title: 'Elden Ring: Shadow of the Erdtree — All-Remembrances Guild Raid Night',
    description: 'Live synchronized co-op boss marathon, build theorycrafting, and parry frame demonstrations on Discord Stage.',
    category: 'game',
    event_type: 'raid_night',
    banner_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80',
    start_time: new Date(Date.now() + 86400000 * 2).toISOString(),
    platform_name: 'Discord Stage & Twitch',
    platform_url: 'https://discord.gg',
    rsvp_user_ids: ['user-aryan', 'user-kenji', 'user-elena', 'user-clara'],
    xp_reward: 250,
    created_by: 'user-aryan',
    created_at: '2024-03-01T00:00:00Z',
  },
  {
    id: 'event-2',
    club_id: 'club-sakuga',
    society_id: 'soc-panth',
    title: 'Chainsaw Man: Reze Arc & Solo Leveling S2 — Key Animation Breakdown Watchparty',
    description: 'Synchronized watchparty highlighting studio MAPPA & A-1 Pictures key animator cuts, debris physics, and compositing styles.',
    category: 'anime',
    event_type: 'watchparty',
    banner_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80',
    start_time: new Date(Date.now() + 86400000 * 4).toISOString(),
    platform_name: 'Hyperbeam Watchparty Room',
    platform_url: 'https://hyperbeam.com',
    rsvp_user_ids: ['user-kenji', 'user-pupul', 'user-maya'],
    xp_reward: 200,
    created_by: 'user-kenji',
    created_at: '2024-03-02T00:00:00Z',
  },
  {
    id: 'event-3',
    club_id: 'club-cinema',
    society_id: 'soc-cinema-lab',
    title: 'Christopher Nolan & Denis Villeneuve: 70mm IMAX Cinematography Retrospective',
    description: 'Deep-dive virtual summit analyzing aspect ratio shifts, practical effects vs CGI pipelines, and Ludwig Göransson sound design.',
    category: 'movie',
    event_type: 'discussion_summit',
    banner_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=80',
    start_time: new Date(Date.now() + 86400000 * 6).toISOString(),
    platform_name: 'Cinema Guild Stage',
    platform_url: 'https://discord.gg',
    rsvp_user_ids: ['user-clara', 'user-elena', 'user-marcus'],
    xp_reward: 180,
    created_by: 'user-clara',
    created_at: '2024-03-03T00:00:00Z',
  },
  {
    id: 'event-4',
    club_id: 'club-tech',
    society_id: 'soc-cinema-lab',
    title: 'RTX 5090 Blackwell Architecture & Neural Rendering Keynote Stream',
    description: 'Live commentary on next-gen silicon, DLSS 4 frame reconstruction, and local LLM tensor acceleration benchmarks.',
    category: 'tech',
    event_type: 'keynote_stream',
    banner_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80',
    start_time: new Date(Date.now() + 86400000 * 7).toISOString(),
    platform_name: 'YouTube Live Stream',
    platform_url: 'https://youtube.com',
    rsvp_user_ids: ['user-marcus', 'user-aryan', 'user-clara'],
    xp_reward: 150,
    created_by: 'user-marcus',
    created_at: '2024-03-04T00:00:00Z',
  }
];

export const INITIAL_CLUBS: Club[] = [
  {
    id: 'club-crucible',
    name: 'Crucible Vanguard',
    slug: 'crucible',
    tag: 'CRUC',
    motto: 'Mastery through trial. Lore through perseverance.',
    description: 'A dedicated gaming club focused on Soulsborne, ARPG mechanics, competitive speedruns, build optimization, and late-game raid nights.',
    category: 'Gaming',
    avatar_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&auto=format&fit=crop&q=80',
    created_by: 'user-aryan',
    president_id: 'user-aryan',
    entry_type: 'open',
    member_limit: 100,
    member_count: 48,
    level: 12,
    xp: 24500,
    society_id: 'soc-panth',
    custom_roles: [
      { id: 'role-parry', club_id: 'club-crucible', name: 'Parry God', color: '#f43f5e', icon: '⚔️' },
      { id: 'role-theory', club_id: 'club-crucible', name: 'Lore Archon', color: '#8b5cf6', icon: '📜' },
      { id: 'role-raid', club_id: 'club-crucible', name: 'Raid Captain', color: '#06b6d4', icon: '🛡️' },
    ],
    members: [
      {
        id: 'mem-1',
        user_id: 'user-aryan',
        username: 'aryan_vanguard',
        display_name: 'Aryan Shah',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan',
        rank: 'president',
        custom_roles: [{ id: 'role-raid', club_id: 'club-crucible', name: 'Raid Captain', color: '#06b6d4', icon: '🛡️' }],
        xp_contributed: 6400,
        joined_at: '2024-01-15T00:00:00Z',
      },
      {
        id: 'mem-2',
        user_id: 'user-elena',
        username: 'elena_souls',
        display_name: 'Elena Rostova',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        rank: 'vice_president',
        custom_roles: [{ id: 'role-parry', club_id: 'club-crucible', name: 'Parry God', color: '#f43f5e', icon: '⚔️' }],
        xp_contributed: 4900,
        joined_at: '2024-01-16T00:00:00Z',
      },
      {
        id: 'mem-3',
        user_id: 'user-kenji',
        username: 'kenji_blade',
        display_name: 'Kenji Tanaka',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
        rank: 'executive',
        custom_roles: [{ id: 'role-theory', club_id: 'club-crucible', name: 'Lore Archon', color: '#8b5cf6', icon: '📜' }],
        xp_contributed: 3800,
        joined_at: '2024-01-20T00:00:00Z',
      }
    ],
    perks: [
      'Priority squad slot in bi-weekly raid marathons',
      'Exclusive access to the Vanguard build theory sheet',
      'Early access to allied Pantheon Society summit stages',
      'Custom Discord-style colored club tag next to your name'
    ],
    rules: [
      'Respect all fellow members regardless of skill tier.',
      'Always spoiler-tag boss revelations and lore endings.',
      'No toxic elitism — teach and uplift fellow initiates.',
      'Active attendance in scheduled digital raids is encouraged.'
    ],
    created_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'club-sakuga',
    name: 'Sakuga Syndicate',
    slug: 'sakuga',
    tag: 'SAKU',
    motto: 'Deconstructing frame-by-frame animation genius.',
    description: 'An international anime club devoted to studio deep dives, key animation craft, sound architecture, and manga narrative arcs.',
    category: 'Anime',
    avatar_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&auto=format&fit=crop&q=80',
    created_by: 'user-kenji',
    president_id: 'user-kenji',
    entry_type: 'open',
    member_limit: 150,
    member_count: 82,
    level: 15,
    xp: 31200,
    society_id: 'soc-panth',
    custom_roles: [
      { id: 'role-anim', club_id: 'club-sakuga', name: 'Animator', color: '#10b981', icon: '🎨' },
      { id: 'role-manga', club_id: 'club-sakuga', name: 'Manga Scholar', color: '#f59e0b', icon: '📖' },
      { id: 'role-ost', club_id: 'club-sakuga', name: 'OST Enthusiast', color: '#ec4899', icon: '🎵' },
    ],
    members: [
      {
        id: 'mem-saku-1',
        user_id: 'user-kenji',
        username: 'kenji_blade',
        display_name: 'Kenji Tanaka',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
        rank: 'president',
        custom_roles: [{ id: 'role-anim', club_id: 'club-sakuga', name: 'Animator', color: '#10b981', icon: '🎨' }],
        xp_contributed: 7200,
        joined_at: '2024-01-10T00:00:00Z',
      },
      {
        id: 'mem-saku-2',
        user_id: 'user-pupul',
        username: 'pupul_art',
        display_name: 'Pupul Sen',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pupul',
        rank: 'vice_president',
        custom_roles: [{ id: 'role-manga', club_id: 'club-sakuga', name: 'Manga Scholar', color: '#f59e0b', icon: '📖' }],
        xp_contributed: 5100,
        joined_at: '2024-01-12T00:00:00Z',
      }
    ],
    perks: [
      'Synchronized seasonal premiere watchparties',
      'Curated list of untranslated animator interviews and cuts',
      'Cross-guild access to Pantheon of Interactive Arts summits',
      'Custom colored Sakuga Scholar tag on all discussion takes'
    ],
    rules: [
      'Credit all animators, storyboarders, and background artists.',
      'Untagged manga spoilers result in immediate temporary probation.',
      'Healthy debate on adaptation pacing is encouraged.'
    ],
    created_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'club-cinema',
    name: 'Cinema Auteurs Guild',
    slug: 'cinema',
    tag: 'NOIR',
    motto: 'Every frame a painting. Every score a heartbeat.',
    description: 'An elite cinephile club dedicated to film theory, 70mm IMAX cinematography, auteur retrospectives, and screenwriting critiques.',
    category: 'Pop Culture',
    avatar_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1400&auto=format&fit=crop&q=80',
    created_by: 'user-clara',
    president_id: 'user-clara',
    entry_type: 'application',
    member_limit: 50,
    member_count: 38,
    level: 9,
    xp: 16800,
    society_id: 'soc-cinema-lab',
    custom_roles: [
      { id: 'role-dir', club_id: 'club-cinema', name: 'Director Eye', color: '#e11d48', icon: '🎬' },
      { id: 'role-cine', club_id: 'club-cinema', name: '35mm Purist', color: '#d97706', icon: '🎞️' },
      { id: 'role-crit', club_id: 'club-cinema', name: 'Master Critic', color: '#a855f7', icon: '🖋️' },
    ],
    members: [
      {
        id: 'mem-cin-1',
        user_id: 'user-clara',
        username: 'clara_films',
        display_name: 'Clara Oswald',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara',
        rank: 'president',
        custom_roles: [{ id: 'role-dir', club_id: 'club-cinema', name: 'Director Eye', color: '#e11d48', icon: '🎬' }],
        xp_contributed: 6100,
        joined_at: '2024-02-01T00:00:00Z',
      }
    ],
    perks: [
      'Access to private virtual screening lounges',
      'Direct debate access with verified Infinity Critics',
      'Exclusive voting power in monthly Guild Spotlight picks'
    ],
    rules: [
      'Constructive long-form essays welcomed and celebrated.',
      'Disagreements on artistic interpretation must remain polite and civil.',
      'Cite your cinematographic references where applicable.'
    ],
    created_at: '2024-02-01T00:00:00Z',
  },
  {
    id: 'club-tech',
    name: 'Cyberware Neural Lab',
    slug: 'tech',
    tag: 'TECH',
    motto: 'Silicon pushed to the absolute edge.',
    description: 'Hardware enthusiasts, benchmark overclockers, custom loop builders, and neural rendering researchers.',
    category: 'Tech',
    avatar_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    banner_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&auto=format&fit=crop&q=80',
    created_by: 'user-marcus',
    president_id: 'user-marcus',
    entry_type: 'open',
    member_limit: 100,
    member_count: 52,
    level: 8,
    xp: 14900,
    society_id: 'soc-cinema-lab',
    custom_roles: [
      { id: 'role-oc', club_id: 'club-tech', name: 'LN2 Overclocker', color: '#38bdf8', icon: '⚡' },
      { id: 'role-ai', club_id: 'club-tech', name: 'Neural Hacker', color: '#a855f7', icon: '🧠' },
    ],
    members: [
      {
        id: 'mem-tech-1',
        user_id: 'user-marcus',
        username: 'marcus_vfx',
        display_name: 'Marcus Vance',
        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        rank: 'president',
        custom_roles: [{ id: 'role-oc', club_id: 'club-tech', name: 'LN2 Overclocker', color: '#38bdf8', icon: '⚡' }],
        xp_contributed: 5800,
        joined_at: '2024-02-10T00:00:00Z',
      }
    ],
    perks: [
      'Early benchmark drops and thermal paste testing logs',
      'Virtual live streaming watchparties for tech keynotes',
      'Guild assistance on custom PC build part lists'
    ],
    rules: [
      'No platform war flame wars — focus on objective benchmarks.',
      'Verify voltage and overclock safety before advising initiates.'
    ],
    created_at: '2024-02-10T00:00:00Z',
  }
];

// Re-export alias for legacy code
export const INITIAL_CHANNELS = INITIAL_CLUBS;

export const INITIAL_POSTS: ClubPost[] = [
  {
    id: 'post-1',
    club_id: 'club-crucible',
    society_id: 'soc-panth',
    user_id: 'user-aryan',
    author_name: 'Aryan Shah',
    author_username: 'aryan_vanguard',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aryan',
    author_rank: 'president',
    author_club_tag: 'CRUC',
    author_custom_roles: [
      { id: 'role-raid', club_id: 'club-crucible', name: 'Raid Captain', color: '#06b6d4', icon: '🛡️' }
    ],
    title: 'Messmer the Impaler: Frame Data, Stance Break Thresholds & Light Roll Punishes',
    content: 'Messmer is genuinely one of the tightest boss designs FromSoftware has ever produced. The second phase transformation hitboxes require precise roll direction rather than spamming backward recovery. On our upcoming Guild Raid Night this Friday, we will demonstrate how to consistently trigger critical staggers with dual heavy spears.',
    flair: 'Combat Analysis',
    article_slug: 'elden-ring-shadow-erdtree-review',
    article_title: 'Elden Ring: Shadow of the Erdtree — The Definitive Verdict',
    article_thumbnail: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
    article_score: '9.8',
    article_read_time: '14 MIN READ',
    article_category: 'GAME REVIEW',
    event_id: 'event-1',
    boosts: 342,
    comments_count: 28,
    is_pinned: true,
    created_at: '3 hours ago',
  },
  {
    id: 'post-2',
    club_id: 'club-sakuga',
    society_id: 'soc-panth',
    user_id: 'user-kenji',
    author_name: 'Kenji Tanaka',
    author_username: 'kenji_blade',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
    author_rank: 'president',
    author_club_tag: 'SAKU',
    author_custom_roles: [
      { id: 'role-anim', club_id: 'club-sakuga', name: 'Animator', color: '#10b981', icon: '🎨' }
    ],
    title: 'MAPPA vs Ufotable: Dynamic Impact Frames & 3D Environment Compositing in 2026',
    content: 'The synthesis between Unreal Engine pre-visualization and traditional 2D genga animation reached a turning point this season. When analyzing the camera rotation during high-velocity sequences, hand-drawn key frames remain irreplaceable for emotional weight and visual snap.',
    flair: 'Sakuga Study',
    article_slug: 'demon-slayer-infinity-castle-preview',
    article_title: 'Demon Slayer: Infinity Castle — Cinematic Arc Preview',
    article_thumbnail: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    article_score: '9.4',
    article_read_time: '9 MIN READ',
    article_category: 'ANIME DEEP DIVE',
    event_id: 'event-2',
    boosts: 295,
    comments_count: 19,
    created_at: '5 hours ago',
  },
  {
    id: 'post-3',
    club_id: 'club-cinema',
    society_id: 'soc-cinema-lab',
    user_id: 'user-clara',
    author_name: 'Clara Oswald',
    author_username: 'clara_films',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Clara',
    author_rank: 'president',
    author_club_tag: 'NOIR',
    author_custom_roles: [
      { id: 'role-dir', club_id: 'club-cinema', name: 'Director Eye', color: '#e11d48', icon: '🎬' }
    ],
    title: 'Dune: Part Two & The Renaissance of Monumental Practical World-Building',
    content: 'Greig Fraser and Denis Villeneuve made a deliberate choice to use infrared sensor cameras for Giedi Prime, producing an alien monochromatic glare that CGI grading cannot mimic. In our upcoming Guild Retrospective, we will break down the sound layering of the Shai-Hulud sandworm roar.',
    flair: 'Cinematography',
    article_slug: 'dune-part-two-cinematic-triumph',
    article_title: 'Dune: Part Two — The Triumph of Monumental Sci-Fi',
    article_thumbnail: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    article_score: '9.6',
    article_read_time: '12 MIN READ',
    article_category: 'FILM CRITIQUE',
    event_id: 'event-3',
    boosts: 412,
    comments_count: 34,
    is_pinned: true,
    created_at: '1 day ago',
  }
];

export const INITIAL_COMMENTS: Record<string, ClubComment[]> = {
  'post-1': [
    {
      id: 'comm-1',
      post_id: 'post-1',
      parent_id: null,
      user_id: 'user-elena',
      author_name: 'Elena Rostova',
      author_username: 'elena_souls',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
      author_rank: 'vice_president',
      author_custom_roles: [
        { id: 'role-parry', club_id: 'club-crucible', name: 'Parry God', color: '#f43f5e', icon: '⚔️' }
      ],
      content: 'Completely agree on rolling forward into his spear thrust. When running a light dagger setup, dodging toward his inner knee grants enough recovery frames to land a full heavy stagger charge. Looking forward to demonstrating this during Raid Night!',
      boosts: 58,
      created_at: '2 hours ago',
      replies: [
        {
          id: 'comm-1-1',
          post_id: 'post-1',
          parent_id: 'comm-1',
          user_id: 'user-kenji',
          author_name: 'Kenji Tanaka',
          author_username: 'kenji_blade',
          author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kenji',
          author_rank: 'executive',
          author_custom_roles: [
            { id: 'role-theory', club_id: 'club-crucible', name: 'Lore Archon', color: '#8b5cf6', icon: '📜' }
          ],
          content: 'The animation cues also sync with the flame sound pitch. When the spear glows white-hot, hit the parry window instantly.',
          boosts: 24,
          created_at: '1 hour ago',
          replies: []
        }
      ]
    },
    {
      id: 'comm-2',
      post_id: 'post-1',
      parent_id: null,
      user_id: 'user-marcus',
      author_name: 'Marcus Vance',
      author_username: 'marcus_vfx',
      author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      author_rank: 'member',
      content: 'The sound design when the serpent jaws snap shut is incredible. Looking forward to the raid night stream on Discord Stage!',
      boosts: 18,
      created_at: '30 mins ago',
      replies: []
    }
  ]
};
