'use client';

export default function Footer() {
  const navCols = [
    { title: 'Content', links: ['Reviews', 'Interviews', 'Blogs', 'Editorials', 'Guides'] },
    { title: 'Categories', links: ['Games', 'Anime', 'Movies', 'TV Shows', 'Music'] },
    { title: 'Community', links: ['Forums', 'Bookshelf', 'Leaderboard', 'Discord', 'Contact'] },
  ];

  return (
    <>
      <style>{`
        .footer-link {
          color: var(--text-secondary);
          font-size: 0.875rem;
          transition: color 0.15s;
          display: inline-block;
        }
        .footer-link:hover { color: white; }
        .footer-legal { color: var(--text-muted); font-size: 0.8rem; }
        .footer-legal:hover { color: var(--text-secondary); }
        .footer-social-btn {
          display: flex; width: 36px; height: 36px;
          align-items: center; justify-content: center;
          border-radius: 12px; font-size: 0.9rem;
          background: var(--glass-bg); border: 1px solid var(--glass-border);
          backdrop-filter: blur(12px); cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .footer-social-btn:hover { border-color: rgba(124,58,237,0.4); background: var(--glass-bg-hover); }
      `}</style>
      <footer
        id="footer"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '64px 0 40px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '48px' }}>
            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 20px rgba(124,58,237,0.4)', color: 'white', fontWeight: 700, fontSize: '1rem',
                }}>∞</div>
                <span style={{ fontWeight: 700 }}>Infinity Social</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '220px' }}>
                The premium destination for pop culture media. Games, anime, movies, and beyond.
              </p>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                {['𝕏', '📘', '📸', '🎮'].map((icon, i) => (
                  <a key={i} href="#" className="footer-social-btn" aria-label={`Social ${i}`}>{icon}</a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {navCols.map(col => (
              <div key={col.title}>
                <h4 style={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {col.title}
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {col.links.map(link => (
                    <li key={link}>
                      <a href={`/${link.toLowerCase().replace(/\s+/g, '-')}`} className="footer-link">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            marginTop: '48px', paddingTop: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              © 2025 Infinity Social. All rights reserved.
            </span>
            <div style={{ display: 'flex', gap: '24px' }}>
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <a key={item} href="#" className="footer-legal">{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
