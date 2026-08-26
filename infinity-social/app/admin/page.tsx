'use client';

import { useState } from 'react';
import Link from 'next/link';

const SIDEBAR_LINKS = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard', href: '/admin' },
  { id: 'articles', icon: '📝', label: 'Articles', href: '/admin/articles' },
  { id: 'categories', icon: '🗂️', label: 'Categories', href: '/admin/categories' },
  { id: 'forums', icon: '💬', label: 'Forums', href: '/admin/forums' },
  { id: 'users', icon: '👥', label: 'Users', href: '/admin/users' },
  { id: 'analytics', icon: '📈', label: 'Analytics', href: '/admin/analytics' },
  { id: 'settings', icon: '⚙️', label: 'Settings', href: '/admin/settings' },
];

const STATS = [
  { label: 'Total Articles', value: '1,284', change: '+12 this week', color: '#7c3aed' },
  { label: 'Active Users', value: '34,921', change: '+1,203 this week', color: '#3b82f6' },
  { label: 'Forum Messages', value: '89,432', change: '+4,821 this week', color: '#ec4899' },
  { label: 'Total Votes', value: '234K', change: '+18K this week', color: '#10b981' },
];

const RECENT_ARTICLES = [
  { id: '1', title: 'Elden Ring: Shadow of the Erdtree Review', category: 'Reviews', status: 'published', views: '84K', date: 'Aug 15' },
  { id: '2', title: 'GTA 6 — Everything We Know', category: 'Games', status: 'published', views: '112K', date: 'Aug 18' },
  { id: '3', title: 'Demon Slayer Hashira Training Arc', category: 'Anime', status: 'published', views: '67K', date: 'Jul 30' },
  { id: '4', title: 'Marvel Thunderbolts Review', category: 'Movies', status: 'draft', views: '—', date: 'Aug 25' },
  { id: '5', title: 'Solo Leveling Season 2 Preview', category: 'Anime', status: 'draft', views: '—', date: 'Aug 25' },
];

export default function AdminDashboard() {
  const [activeLink, setActiveLink] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--black)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? '240px' : '64px',
          flexShrink: 0,
          borderRight: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          gap: '4px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', color: 'white', fontWeight: 700,
          }}>∞</div>
          {sidebarOpen && <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.9rem' }}>Admin Panel</span>}
        </div>

        {/* Nav Links */}
        {SIDEBAR_LINKS.map(link => (
          <Link
            key={link.id}
            href={link.href}
            id={`admin-nav-${link.id}`}
            onClick={() => setActiveLink(link.id)}
            className={`admin-sidebar-link ${activeLink === link.id ? 'active' : ''}`}
            style={{ overflow: 'hidden' }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>{link.icon}</span>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{link.label}</span>}
          </Link>
        ))}

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ marginTop: 'auto', padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px', overflowX: 'hidden' }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.5rem', marginBottom: '4px' }}>Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Welcome back, Admin • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <Link href="/admin/articles/new" id="admin-new-article-btn" className="btn-primary text-sm">
            + New Article
          </Link>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {STATS.map(stat => (
            <div key={stat.label} id={`admin-stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '6px', color: stat.color }}>{stat.change}</div>
              <div style={{ height: '3px', borderRadius: '2px', marginTop: '12px', background: `linear-gradient(90deg, ${stat.color}60, ${stat.color}20)` }} />
            </div>
          ))}
        </div>

        {/* Recent Articles Table */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Articles</h2>
            <Link href="/admin/articles" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>View all →</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Title', 'Category', 'Status', 'Views', 'Date', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 24px', textAlign: 'left', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ARTICLES.map((article, i) => (
                  <tr
                    key={article.id}
                    id={`admin-article-row-${article.id}`}
                    style={{ borderBottom: i < RECENT_ARTICLES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 24px', fontSize: '0.875rem', color: 'var(--text-primary)', maxWidth: '300px' }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title}</span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span className="chip" style={{ fontSize: '0.65rem' }}>{article.category}</span>
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px', borderRadius: '100px',
                        background: article.status === 'published' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                        color: article.status === 'published' ? '#4ade80' : '#fbbf24',
                        border: `1px solid ${article.status === 'published' ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      }}>
                        {article.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 24px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{article.views}</td>
                    <td style={{ padding: '14px 24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{article.date}</td>
                    <td style={{ padding: '14px 24px' }}>
                      <div className="flex gap-2">
                        <Link href={`/admin/articles/${article.id}/edit`} id={`admin-edit-${article.id}`}
                          className="glass text-xs px-3 py-1.5 rounded-xl transition-all"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
                        >
                          Edit
                        </Link>
                        <button id={`admin-delete-${article.id}`}
                          className="text-xs px-3 py-1.5 rounded-xl transition-all"
                          style={{ color: '#f87171', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
