"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { LogIn, LogOut, PenSquare, MessageSquare, BookOpen, User, ShieldAlert, Layers, Lightbulb } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, loginWithGoogle, logout, loginAsMock, isMockMode } = useAuth();
  const [showMockMenu, setShowMockMenu] = useState(false);

  const isActive = (path) => pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'fixed',
      top: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '1100px',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1.5rem',
      borderRadius: '24px',
      border: '1px solid var(--border-card)',
    }}>
      <style jsx>{`
        @media (max-width: 820px) {
          .nav-text {
            display: none;
          }
          .nav-links {
            gap: 0.8rem !important;
            margin-left: 8px !important;
          }
        }
      `}</style>
      {/* Brand Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem' }}>
        <span className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <BookOpen size={22} style={{ color: 'var(--primary)' }} />
          Yen BLOG
        </span>
      </Link>

      {/* Nav Links */}
      <div className="nav-links" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginLeft:'15px' }}>
        <Link 
          href="/" 
          style={{ 
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/') ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          文章列表
        </Link>
        <Link 
          href="/guestbook" 
          style={{ 
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/guestbook') ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <MessageSquare size={16} />
          訪客留言板
        </Link>

        <Link
          href="/suggestions"
          title="功能建議 / 改善回報"
          style={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: isActive('/suggestions') ? 'var(--primary)' : 'var(--text-secondary)',
            transition: 'var(--transition-smooth)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <Lightbulb size={16} />
          <span className="nav-text">功能建議</span>
        </Link>

        {user?.role === 'admin' && (
          <Link 
            href="/admin" 
            style={{ 
              fontSize: '0.95rem',
              fontWeight: 500,
              color: isActive('/admin') ? 'var(--secondary)' : 'var(--text-secondary)',
              transition: 'var(--transition-smooth)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <PenSquare size={16} />
            撰寫文章
          </Link>
        )}
      </div>

      {/* Auth & Mock panel */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative' }}>
        {/* Mock Mode Indicators */}
        {isMockMode && (
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMockMenu(!showMockMenu)}
              style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                color: 'var(--secondary)',
                fontSize: '0.75rem',
                padding: '0.25rem 0.6rem',
                borderRadius: '999px',
                cursor: 'pointer',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(168, 85, 247, 0.2)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(168, 85, 247, 0.1)'}
            >
              <Layers size={12} />
              Mock 模式 (點擊切換)
            </button>

            {showMockMenu && (
              <div className="glass-panel" style={{
                position: 'absolute',
                top: '2.2rem',
                right: 0,
                width: '180px',
                padding: '0.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border-card)',
                boxShadow: 'var(--shadow-premium)',
                zIndex: 1010,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '0.25rem 0.5rem', borderBottom: '1px solid var(--border-card)', marginBottom: '0.25rem' }}>
                  選擇模擬角色：
                </div>
                <button 
                  onClick={() => { loginAsMock('admin'); setShowMockMenu(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    padding: '0.4rem 0.5rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <ShieldAlert size={14} style={{ color: 'var(--secondary)' }} />
                  模擬管理員 (Admin)
                </button>
                <button 
                  onClick={() => { loginAsMock('user'); setShowMockMenu(false); }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    padding: '0.4rem 0.5rem',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <User size={14} style={{ color: 'var(--primary)' }} />
                  模擬一般讀者
                </button>
              </div>
            )}
          </div>
        )}

        {/* User Info & Main Action Button */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={user.avatar_url} 
              alt={user.display_name} 
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: `2px solid ${user.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'}`
              }}
            />
            <div style={{ display: 'none', flexDirection: 'column', gap: '0.1rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{user.display_name}</span>
            </div>
            <button 
              onClick={logout}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.75rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(244, 63, 94, 0.1)'; e.target.style.borderColor = 'var(--accent-rose)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255, 255, 255, 0.05)'; e.target.style.borderColor = 'var(--border-card)'; }}
            >
              <LogOut size={14} />
              登出
            </button>
          </div>
        ) : (
          <button 
            onClick={loginWithGoogle}
            style={{
              background: 'var(--primary-gradient)',
              border: 'none',
              color: '#ffffff',
              padding: '0.5rem 1.1rem',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: 'var(--shadow-glow)',
              transition: 'var(--transition-smooth)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px) scale(1.02)'}
            onMouseLeave={(e) => e.target.style.transform = 'none'}
          >
            <LogIn size={14} />
            Google 登入
          </button>
        )}
      </div>
    </nav>
  );
}
