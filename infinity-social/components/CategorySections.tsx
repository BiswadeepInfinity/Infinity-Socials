'use client';

import Link from 'next/link';

interface CategoryItem {
  name: string;
  slug: string;
  count: string;
  image: string;
  tagline: string;
  accent: string;
}

const GAMES_CATEGORIES: CategoryItem[] = [
  { name: 'Action RPGs', slug: 'action-games', count: '280+ Articles', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80', tagline: 'Soulsborne, Witcher, Wukong', accent: '#00f0ff' },
  { name: 'Open World', slug: 'rpgs', count: '190+ Articles', image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&q=80', tagline: 'GTA VI, Cyberpunk, Elden Ring', accent: '#8a2be2' },
  { name: 'Indie Gems', slug: 'indie-games', count: '140+ Articles', image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80', tagline: 'Hades II, Hollow Knight, Celeste', accent: '#10b981' },
  { name: 'FPS & Shooters', slug: 'fps', count: '110+ Articles', image: 'https://images.unsplash.com/photo-1586182987320-4f376d39d787?w=600&q=80', tagline: 'DOOM, Destiny, Valorant', accent: '#f59e0b' },
  { name: 'Survival Horror', slug: 'horror-games', count: '85+ Articles', image: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80', tagline: 'Silent Hill 2, Resident Evil', accent: '#ef4444' },
];

const TECH_CATEGORIES: CategoryItem[] = [
  { name: 'AI & Neural Systems', slug: 'ai-tech', count: '340+ Articles', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80', tagline: 'LLMs, Diffusion, Robotics', accent: '#38bdf8' },
  { name: 'Hardware & Silicon', slug: 'hardware', count: '210+ Articles', image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=80', tagline: 'RTX 5090, Apple M-Series, AMD', accent: '#a855f7' },
  { name: 'Cybersecurity', slug: 'cybersecurity', count: '130+ Articles', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80', tagline: 'Zero-Day, Encryption, OSINT', accent: '#ef4444' },
  { name: 'Space & Deep Tech', slug: 'space-tech', count: '90+ Articles', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80', tagline: 'Quantum, Propulsion, Fusion', accent: '#10b981' },
  { name: 'Consumer Tech & VR', slug: 'gadgets', count: '175+ Articles', image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80', tagline: 'Vision Pro, OLED, Foldables', accent: '#f59e0b' },
];

const MOVIES_CATEGORIES: CategoryItem[] = [
  { name: 'Sci-Fi & Cyberpunk', slug: 'sci-fi-movies', count: '240+ Articles', image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&q=80', tagline: 'Dune, Blade Runner, Interstellar', accent: '#06b6d4' },
  { name: 'Cinematic Epics', slug: 'cinematic-epics', count: '185+ Articles', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80', tagline: 'IMAX 70mm, Nolan, Villeneuve', accent: '#facc15' },
  { name: 'Psychological Thrillers', slug: 'thrillers', count: '150+ Articles', image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80', tagline: 'Fincher, A24, Neo-Noir', accent: '#f43f5e' },
  { name: 'Blockbuster Universes', slug: 'blockbusters', count: '290+ Articles', image: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=600&q=80', tagline: 'DC Elseworlds, Marvel, Star Wars', accent: '#6366f1' },
  { name: 'Auteur & Indie Cinema', slug: 'indie-cinema', count: '110+ Articles', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80', tagline: 'Cannes, Sundance, Festival Cuts', accent: '#10b981' },
];

const ANIME_CATEGORIES: CategoryItem[] = [
  { name: 'Shonen Battle', slug: 'shonen', count: '320+ Articles', image: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=600&q=80', tagline: 'Jujutsu Kaisen, Demon Slayer', accent: '#ff007f' },
  { name: 'Dark Fantasy & Seinen', slug: 'seinen', count: '160+ Articles', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80', tagline: 'Berserk, Vinland Saga, Monster', accent: '#a855f7' },
  { name: 'Isekai & Power Fantasy', slug: 'isekai', count: '180+ Articles', image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&q=80', tagline: 'Solo Leveling, Slime Tensei', accent: '#3b82f6' },
  { name: 'Cyberpunk & Mecha', slug: 'mecha', count: '95+ Articles', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80', tagline: 'Gundam, Evangelion, Edgerunners', accent: '#06b6d4' },
  { name: 'Slice of Life & Romance', slug: 'slice-of-life', count: '115+ Articles', image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=600&q=80', tagline: 'Frieren, Oshi no Ko', accent: '#14b8a6' },
];

function CategoryTrack({
  title,
  subtitle,
  categoryType,
  items,
  badgeText,
}: {
  title: string;
  subtitle: string;
  categoryType: string;
  items: CategoryItem[];
  badgeText: string;
}) {
  return (
    <div className="py-8 w-full flex justify-center">
      <div className="w-full max-w-[1240px] px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span className="text-[11px] font-mono font-bold tracking-widest text-white/50 uppercase">
                {categoryType}
              </span>
            </div>
            <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-white/50 font-light mt-0.5">
              {subtitle}
            </p>
          </div>

          <Link
            href={`/categories/${items[0].slug}`}
            className="text-xs font-mono text-white/70 hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto group"
          >
            <span>View all {badgeText}</span>
            <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>        {/* Responsive Grid Tray: 2-col on mobile, up to 5-col on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {items.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="group relative h-[210px] xs:h-[240px] sm:h-[310px] rounded-[18px] sm:rounded-[22px] overflow-hidden cursor-pointer border border-white/[0.12] hover:border-white/35 transition-all duration-300 flex flex-col justify-end p-3 sm:p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] hover:-translate-y-1 bg-[#0c0c14]"
            >
              {/* Background Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Dynamic Gradient Scrim */}
              <div
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                style={{
                  background: `linear-gradient(to top, rgba(5,5,10,0.95) 0%, rgba(5,5,10,0.65) 45%, rgba(5,5,10,0.1) 100%)`,
                }}
              />

              {/* Accent Border Glow on Hover */}
              <div
                className="absolute inset-0 rounded-[18px] sm:rounded-[22px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `inset 0 0 20px ${cat.accent}30`,
                  border: `1px solid ${cat.accent}60`,
                }}
              />

              {/* Text / Meta Info */}
              <div className="relative z-10 space-y-0.5">
                <span
                  className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider block drop-shadow-sm"
                  style={{ color: cat.accent }}
                >
                  {cat.count}
                </span>
                <h4 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-white transition-colors leading-snug">
                  {cat.name}
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-wider text-white/50 truncate hidden xs:block">
                  {cat.tagline}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

export default function CategorySections() {
  return (
    <section className="w-full py-12 border-t border-white/[0.06] bg-[#030306] flex flex-col items-center">
      {/* 1. Gaming */}
      <CategoryTrack
        title="Gaming Frontiers"
        subtitle="Forensic reviews, technical breakdowns, and deep design critiques."
        categoryType="Interactive Entertainment"
        badgeText="Games"
        items={GAMES_CATEGORIES}
      />

      {/* 2. Tech */}
      <CategoryTrack
        title="Tech & Deep Innovations"
        subtitle="Next-generation silicon, artificial intelligence, and cutting-edge engineering."
        categoryType="Digital Revolution"
        badgeText="Tech"
        items={TECH_TECH_CATEGORIES(TECH_CATEGORIES)}
      />

      {/* 3. Cinema & Movies */}
      <CategoryTrack
        title="Cinema & Film Spotlight"
        subtitle="Auteur essays, IMAX cinematic breakdowns, and blockbuster analysis."
        categoryType="Motion Pictures & Directing"
        badgeText="Movies"
        items={MOVIES_CATEGORIES}
      />

      {/* 4. Anime & Manga */}
      <CategoryTrack
        title="Anime & Manga Radar"
        subtitle="Seasonal breakdowns, sakuga animation analysis, and serialization coverage."
        categoryType="Japanese Pop Culture"
        badgeText="Anime"
        items={ANIME_CATEGORIES}
      />
    </section>
  );
}

function TECH_TECH_CATEGORIES(items: CategoryItem[]) {
  return items;
}
