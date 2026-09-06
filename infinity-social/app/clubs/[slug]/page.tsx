'use client';

import React, { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { useChannelsStore } from '@/lib/channels-store';
import { useAuth } from '@/components/AuthProvider';
import ChannelPostCard from '@/components/ChannelPostCard';
import DigitalEventCard from '@/components/DigitalEventCard';
import ClubSettingsModal from '@/components/ClubSettingsModal';
import TreatyPactModal from '@/components/TreatyPactModal';
import CreatePostModal from '@/components/CreatePostModal';
import ClubBadge from '@/components/ChannelBadge';
import { 
  Shield, 
  Crown, 
  Settings, 
  Handshake, 
  Calendar, 
  Plus, 
  Users, 
  MessageSquare, 
  Sparkles, 
  ChevronLeft,
  Share2,
  CheckCircle2,
  Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClubDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { user } = useAuth();
  const { 
    clubs, 
    societies, 
    pacts, 
    events, 
    posts, 
    subscribedClubIds, 
    joinClub, 
    leaveClub,
    assignRoleToMember,
    removeRoleFromMember
  } = useChannelsStore();

  const [activeTab, setActiveTab] = useState<'discussions' | 'events' | 'members' | 'treaties'>('discussions');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTreatyOpen, setIsTreatyOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const club = clubs.find((c) => c.slug === slug);
  if (!club) {
    return (
      <div className="min-h-screen bg-[#07070d] text-zinc-100 pt-32 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-3">Club Not Found</h1>
        <p className="text-zinc-400 mb-6">The requested club does not exist or has been disbanded.</p>
        <Link href="/clubs" className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-sm">
          Return to Clubs
        </Link>
      </div>
    );
  }

  const isJoined = subscribedClubIds.includes(club.id);
  const currentUserId = user?.id || 'anon-guest';
  const currentMember = club.members.find((m) => m.user_id === currentUserId);
  const isPresident = currentMember?.rank === 'president' || club.created_by === currentUserId;
  const isVicePres = currentMember?.rank === 'vice_president';
  const canManageRoles = isPresident || isVicePres;

  const society = societies.find((s) => s.id === club.society_id);
  const clubPacts = pacts.filter((p) => p.club_a_id === club.id || p.club_b_id === club.id);
  const clubEvents = events.filter((ev) => ev.club_id === club.id);
  const clubPosts = posts.filter((p) => p.club_id === club.id);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Club HQ link copied!');
    }
  };

  return (
    <div className="min-h-screen bg-[#040406] text-zinc-100 pt-20 pb-20 selection:bg-cyan-500 selection:text-black">
      {/* Club Hero Banner */}
      <div className="relative w-full h-56 sm:h-72 lg:h-80 bg-black overflow-hidden border-b border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={club.banner_url}
          alt={club.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#040406] via-black/40 to-transparent" />

        {/* Back Link */}
        <div className="absolute top-4 left-4 z-10">
          <Link
            href="/clubs"
            className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/20 text-xs font-semibold text-zinc-200 hover:text-white flex items-center gap-1.5 backdrop-blur-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>All Clubs & Societies</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        {/* Club HQ Identity Card */}
        <div className="ios-glass-card p-6 sm:p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
            {/* Club Avatar */}
            <div className="relative shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={club.avatar_url}
                alt={club.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/20 shadow-2xl bg-black"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-md bg-black/90 border border-white/20 font-mono font-black text-[11px] text-white shadow-sm">
                [{club.tag}]
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
                  {club.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                  LEVEL {club.level} • {club.xp.toLocaleString()} XP
                </span>
                {society && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 font-mono text-xs font-bold">
                    [{society.tag}] {society.name}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-mono text-cyan-400 italic">
                &quot;{club.motto}&quot;
              </p>

              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 pt-1 flex-wrap">
                <span>Domain: {club.category}</span>
                <span>•</span>
                <span>Capacity: {club.member_count} / {club.member_limit} Members</span>
                <span>•</span>
                <span className="text-emerald-400 uppercase font-bold">{club.entry_type} Entry</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-zinc-300 border border-white/10 transition-colors cursor-pointer"
              title="Share Club HQ"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Club Settings */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/10 border border-white/15 text-xs font-bold text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-cyan-400" />
              <span>Roles & Settings</span>
            </button>

            {/* Treaty Ratification Modal */}
            <button
              onClick={() => setIsTreatyOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Handshake className="w-3.5 h-3.5 text-zinc-400" />
              <span>Alliance Treaty</span>
            </button>

            {/* Join / Leave */}
            <button
              onClick={() => {
                if (isJoined) {
                  leaveClub(club.id, user?.id);
                  toast.success(`Left [${club.tag}] ${club.name}`);
                } else {
                  const success = joinClub(club.id, user ? {
                    id: user.id,
                    username: user.email?.split('@')[0] || 'member',
                    display_name: user.email?.split('@')[0] || 'Club Member',
                    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                  } : undefined);
                  if (success) {
                    toast.success(`Joined [${club.tag}] ${club.name}!`);
                  } else {
                    toast.error('Club is currently at max capacity.');
                  }
                }
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                isJoined
                  ? 'text-zinc-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08]'
                  : 'text-white bg-white/10 hover:bg-white/20 border border-white/10'
              }`}
            >
              {isJoined ? 'Joined' : 'Join Club'}
            </button>
          </div>
        </div>

        {/* Grand Society Alliance Callout if applicable */}
        {society && (
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-zinc-500" />
              <span>Federated in Society:</span>
              <span className="font-semibold text-zinc-200">[{society.tag}] {society.name}</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-500">Mutual Treaty Ratified</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'discussions'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussions ({clubPosts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('events')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'events'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Events ({clubEvents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('members')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'members'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({club.members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('treaties')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'treaties'
                  ? 'bg-white/10 text-white border border-white/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Treaties & Perks</span>
            </button>
          </div>
        </div>

        {/* TAB 1: DISCUSSIONS FEED */}
        {activeTab === 'discussions' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Feed Main */}
            <div className="lg:col-span-8 space-y-6">
              {/* Filter Bar & Quick Create Trigger */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Club Discussions ({clubPosts.length})</span>
                </div>

                <button
                  onClick={() => setIsCreatePostOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-black font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-400/20 cursor-pointer transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>New Topic</span>
                </button>
              </div>

              {/* Feed List */}
              <div className="space-y-4">
                {clubPosts.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-white/[0.02] border border-white/10 text-center text-zinc-400">
                    <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm">No discussion topics in this club yet.</p>
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs"
                    >
                      Start First Topic
                    </button>
                  </div>
                ) : (
                  clubPosts.map((post) => (
                    <ChannelPostCard
                      key={post.id}
                      post={post}
                      channelSlug={club.slug}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Club Info Sidebar */}
            <div className="hidden lg:block lg:col-span-4 space-y-6">
              {/* Club Rules */}
              <div className="p-5 rounded-2xl bg-[#090912] border border-white/10 space-y-3">
                <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-cyan-400" /> Club Codex & Rules
                </h3>
                <ul className="space-y-2 text-xs text-zinc-400">
                  {club.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-cyan-400 font-mono font-bold">0{idx + 1}.</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Club Custom Discord Roles Pill Box */}
              <div className="ios-glass-card p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-zinc-300">
                    Custom Discord-Style Roles
                  </h3>
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {club.custom_roles.map((r) => (
                    <span
                      key={r.id}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{
                        backgroundColor: `${r.color}15`,
                        borderColor: `${r.color}45`,
                        borderWidth: '1px',
                        color: r.color,
                        boxShadow: `0 2px 8px -1px ${r.color}25, inset 0 1px 0 rgba(255, 255, 255, 0.2)`,
                      }}
                    >
                      {r.icon} {r.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIGITAL EVENTS */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clubEvents.length === 0 ? (
              <div className="col-span-3 p-12 rounded-3xl ios-glass-card text-center text-zinc-400">
                <Calendar className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm">No scheduled events for this club currently.</p>
              </div>
            ) : (
              clubEvents.map((ev) => (
                <DigitalEventCard key={ev.id} event={ev} />
              ))
            )}
          </div>
        )}

        {/* TAB 3: MEMBERS & HIERARCHY */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Hierarchy Order: President 👑 &gt; Vice President ⚔️ &gt; Executive 🛡️ &gt; Member 🔰
              </span>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1 rounded-lg bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold cursor-pointer"
              >
                Promote / Assign Roles
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {club.members.map((member) => {
                const assignedRoleIds = new Set(member.custom_roles.map((r) => r.id));
                const isPresident = member.rank === 'president';

                return (
                  <div
                    key={member.id}
                    className="ios-glass-card p-4 rounded-2xl flex flex-col justify-between gap-3 shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.avatar_url}
                        alt={member.username}
                        className="w-11 h-11 rounded-full object-cover border border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-white truncate">{member.display_name}</h4>
                        </div>
                        <span className="text-[11px] font-mono text-zinc-400 block">@{member.username}</span>

                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <ClubBadge
                            rank={member.rank}
                            clubTag={club.tag}
                            size="xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Discord-Style Interactive Roles Box */}
                    <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
                        <span>Roles</span>
                        <span className="text-zinc-600">Click to toggle</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Render existing custom roles with 'x' remove action */}
                        {member.custom_roles.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              removeRoleFromMember(club.id, member.user_id, r.id);
                              toast.success(`Removed "${r.name}" from @${member.username}`);
                            }}
                            title={`Click to remove role "${r.name}"`}
                            className="group inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-300 hover:text-rose-300 border border-white/[0.08] transition-colors cursor-pointer"
                          >
                            <span>{r.icon}</span>
                            <span>{r.name}</span>
                            <span className="text-zinc-500 group-hover:text-rose-400 text-xs font-bold leading-none ml-0.5">×</span>
                          </button>
                        ))}

                        {/* Discord-style '+' Role Add Popover / Dropdown */}
                        {club.custom_roles.filter((r) => !assignedRoleIds.has(r.id)).length > 0 && (
                          <div className="relative inline-block">
                            <select
                              value=""
                              onChange={(e) => {
                                const roleId = e.target.value;
                                const targetRole = club.custom_roles.find((r) => r.id === roleId);
                                if (targetRole) {
                                  assignRoleToMember(club.id, member.user_id, targetRole);
                                  toast.success(`Assigned "${targetRole.name}" to @${member.username}`);
                                }
                              }}
                              className="appearance-none bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 rounded-md px-2 py-0.5 text-[10px] font-medium cursor-pointer transition-colors focus:outline-none"
                              title="Add custom role like Discord"
                            >
                              <option value="" disabled>+ Add Role</option>
                              {club.custom_roles
                                .filter((r) => !assignedRoleIds.has(r.id))
                                .map((r) => (
                                  <option key={r.id} value={r.id} className="bg-[#0e0e16] text-white">
                                    {r.icon} {r.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )}

                        {club.custom_roles.length === 0 && (
                          <button
                            onClick={() => setIsSettingsOpen(true)}
                            className="text-[10px] text-cyan-400/80 hover:text-cyan-300 hover:underline"
                          >
                            + Create roles in Settings
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: TREATIES & PERKS */}
        {activeTab === 'treaties' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Perks */}
            <div className="ios-glass-card p-6 rounded-3xl space-y-4">
              <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>Club Perks & Privileges</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-zinc-300">
                {club.perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Signed Treaties */}
            <div className="ios-glass-card p-6 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-purple-400" />
                  <span>Mutual Alliance Treaties</span>
                </h3>
                <button
                  onClick={() => setIsTreatyOpen(true)}
                  className="text-xs font-bold text-purple-300 hover:underline"
                >
                  + Sign Treaty
                </button>
              </div>

              {clubPacts.length === 0 ? (
                <p className="text-xs text-zinc-500">No ratified treaties yet. Form a pact to join a Grand Society.</p>
              ) : (
                <div className="space-y-3">
                  {clubPacts.map((pact) => (
                    <div
                      key={pact.id}
                      className="p-3.5 rounded-2xl bg-black/40 border border-purple-500/30 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-purple-200 block">{pact.treaty_title}</span>
                        <span className="text-[10px] font-mono text-zinc-400">Society: {pact.society_name}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-[10px] uppercase font-bold">
                        {pact.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ClubSettingsModal
        club={club}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <TreatyPactModal
        currentClub={club}
        isOpen={isTreatyOpen}
        onClose={() => setIsTreatyOpen(false)}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        defaultChannelId={club.id}
      />
    </div>
  );
}