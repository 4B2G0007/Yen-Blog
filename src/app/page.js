"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { dbService } from '@/lib/dbService';
import { useAuth } from '@/context/AuthContext';
import { Heart, MessageSquare, Calendar, ArrowRight, BookOpen, Sparkles, UserCheck } from 'lucide-react';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await dbService.getPosts();
        // filter drafts unless user is admin
        const visiblePosts = user?.role === 'admin' 
          ? data 
          : data.filter(p => p.status === 'published');
        setPosts(visiblePosts);
      } catch (err) {
        console.error("載入文章失敗：", err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [user]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1.5rem' }}>
      
      {/* Hero Banner Section */}
      <section className="glass-panel" style={{
        padding: '3rem 2rem',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
      }}>
        {/* Subtle decorative glowing balls inside hero */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          left: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'var(--primary-glow)',
          filter: 'blur(50px)',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '10%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'var(--secondary-glow)',
          filter: 'blur(50px)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '0.35rem 0.8rem',
            borderRadius: '99px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Sparkles size={12} />
            歡迎來到我的流光數位空間
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            探索程式、設計與<span className="text-gradient">生活美學</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            這裡是我分享技術實戰、介面美學設計，以及隨筆想法的角落。您可以使用 Google 登入後為文章按讚、留言，或在訪客留言板留下您的足跡。
          </p>
        </div>
      </section>

      {/* Main Grid: Articles + Sidebar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2.5rem',
        alignItems: 'start'
      }} className="responsive-grid">
        <style jsx global>{`
          .responsive-grid {
            grid-template-columns: 2.3fr 1fr;
          }
          @media (max-width: 900px) {
            .responsive-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>

        {/* Left Section: Blog posts list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <BookOpen size={20} style={{ color: 'var(--primary)' }} />
            最新文章
          </h2>

          {loading ? (
            // Skeleton Loader
            [1, 2].map((n) => (
              <div key={n} className="glass-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem', gap: '1rem', opacity: 0.5 }}>
                <div style={{ width: '40%', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                <div style={{ width: '80%', height: '30px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                <div style={{ width: '100%', height: '60px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              目前還沒有任何文章發布喔。
              {user?.role === 'admin' && (
                <div style={{ marginTop: '1rem' }}>
                  <Link href="/admin" className="glass-panel" style={{
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.6rem 1.2rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    display: 'inline-block'
                  }}>
                    立即撰寫第一篇文
                  </Link>
                </div>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.id} className="glass-panel glass-panel-hover" style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}>
                {/* Draft Badge */}
                {post.status === 'draft' && (
                  <span style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(244, 63, 94, 0.25)',
                    border: '1px solid var(--accent-rose)',
                    color: '#fda4af',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 10
                  }}>
                    草稿
                  </span>
                )}

                {/* Cover Image */}
                {post.cover_image && (
                  <Link href={`/posts/${post.slug}`} style={{ overflow: 'hidden', height: '240px', display: 'block', position: 'relative' }}>
                    <img 
                      src={post.cover_image} 
                      alt={post.title} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.target.style.transform = 'none'}
                    />
                  </Link>
                )}

                {/* Post Content Summary */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} />
                      {formatDate(post.created_at)}
                    </span>
                  </div>

                  <Link href={`/posts/${post.slug}`}>
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      lineHeight: 1.3,
                      transition: 'var(--transition-smooth)',
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--primary)'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}
                    >
                      {post.title}
                    </h3>
                  </Link>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {post.summary}
                  </p>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: '0.5rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid var(--border-card)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Heart size={16} style={{ color: 'var(--accent-rose)', fill: 'var(--accent-rose)' }} />
                        {post.likes_count || 0} 個讚
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MessageSquare size={16} style={{ color: 'var(--primary)' }} />
                        {post.comments_count || 0} 則留言
                      </span>
                    </div>

                    <Link 
                      href={`/posts/${post.slug}`} 
                      style={{ 
                        fontSize: '0.9rem', 
                        fontWeight: 600, 
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'var(--transition-smooth)'
                      }}
                      onMouseEnter={(e) => e.target.style.transform = 'translateX(3px)'}
                      onMouseLeave={(e) => e.target.style.transform = 'none'}
                    >
                      閱讀全文
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Right Section: Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* About Me Card */}
          

          {/* Quick Guestbook Card */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MessageSquare size={16} style={{ color: 'var(--secondary)' }} />
              訪客留言板
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              歡迎留下你/妳的任何想法!
            </p>
            <Link 
              href="/guestbook" 
              className="glass-panel" 
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                textAlign: 'center',
                padding: '0.6rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'block',
                transition: 'var(--transition-smooth)',
                borderColor: 'rgba(255,255,255,0.08)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.05)'; e.target.style.borderColor = 'var(--border-card-hover)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.02)'; e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              進入留言板頁面
            </Link>
          </div>

        </aside>
      </div>

    </div>
  );
}
