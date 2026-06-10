"use client";

import { useEffect, useState } from 'react';
import { dbService } from '@/lib/dbService';
import { useAuth } from '@/context/AuthContext';
import { Send, Trash2, MessageSquare, Sparkles, ShieldAlert } from 'lucide-react';

export default function Guestbook() {
  const { user, loginWithGoogle } = useAuth();
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadGuestbook() {
      try {
        const data = await dbService.getGuestbook();
        setMessages(data);
      } catch (err) {
        console.error("載入留言板失敗：", err);
      } finally {
        setLoading(false);
      }
    }
    loadGuestbook();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!inputText.trim()) return;

    try {
      setSubmitting(true);
      const newMsg = await dbService.addGuestbook(user, inputText);
      setMessages(prev => [newMsg, ...prev]);
      setInputText("");
    } catch (err) {
      console.error("留言板送出失敗：", err);
      alert("發布失敗，請重試。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!confirm("確定要刪除這條留言嗎？")) return;
    try {
      await dbService.deleteGuestbook(entryId);
      setMessages(prev => prev.filter(m => m.id !== entryId));
    } catch (err) {
      console.error("刪除留言失敗：", err);
      alert("刪除失敗。");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <section className="glass-panel" style={{
        padding: '2.5rem 2rem',
        borderRadius: '24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-card)',
      }}>
        {/* Glow ball */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '20%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'var(--secondary-glow)',
          filter: 'blur(45px)',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(168, 85, 247, 0.1)',
            padding: '0.3rem 0.75rem',
            borderRadius: '99px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: '#e9d5ff',
            border: '1px solid rgba(168, 85, 247, 0.2)'
          }}>
            <Sparkles size={12} />
            訪客簽到處
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>
            訪客<span className="text-gradient">留言板</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '500px', lineHeight: 1.5 }}>
            歡迎在此簽到、留下問候、發表對網站的建議，或是與其他讀者進行有趣的交流！
          </p>
        </div>
      </section>

      {/* Write Entry Card */}
      <div className="glass-panel" style={{ padding: '2rem', border: '1px solid var(--border-card)' }}>
        {user ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1.25rem' }}>
            <img 
              src={user.avatar_url} 
              alt={user.display_name} 
              style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                border: `2px solid ${user.role === 'admin' ? 'var(--secondary)' : 'var(--primary)'}`
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                以 <strong>{user.display_name}</strong> 的身份留下印記...
              </span>
              <textarea 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="寫下您想說的話 (例如：哈囉！網站設計得好漂亮啊！✨)..."
                rows={3}
                style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-card)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: '0.95rem',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'var(--transition-smooth)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-card)'}
                required
              />
              <button 
                type="submit"
                disabled={submitting || !inputText.trim()}
                style={{
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.55rem 1.4rem',
                  borderRadius: '10px',
                  cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  alignSelf: 'flex-end',
                  opacity: inputText.trim() ? 1 : 0.5,
                  transition: 'var(--transition-smooth)',
                  boxShadow: 'var(--shadow-glow)'
                }}
              >
                <Send size={14} />
                {submitting ? "正在寫入..." : "送出留言"}
              </button>
            </div>
          </form>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '1.5rem 0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              請先登入 Google 帳號，即可在此留言板上發送問候。
            </p>
            <button 
              onClick={loginWithGoogle}
              style={{
                background: 'var(--primary-gradient)',
                border: 'none',
                color: '#ffffff',
                padding: '0.55rem 1.3rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                boxShadow: 'var(--shadow-glow)',
                transition: 'var(--transition-smooth)'
              }}
            >
              使用 Google 登入
            </button>
          </div>
        )}
      </div>

      {/* Messages Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
          <MessageSquare size={18} style={{ color: 'var(--primary)' }} />
          留言牆項目 ({messages.length})
        </h3>

        {loading ? (
          [1, 2].map(n => (
            <div key={n} className="glass-panel" style={{ height: '100px', display: 'flex', alignItems: 'center', padding: '1.5rem', gap: '1rem', opacity: 0.5 }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ width: '120px', height: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                <div style={{ width: '60%', height: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
              </div>
            </div>
          ))
        ) : messages.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            目前還沒有留言，快來寫下第一個祝福吧！✨
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className="glass-panel" 
              style={{
                padding: '1.5rem',
                display: 'flex',
                gap: '1.25rem',
                border: '1px solid var(--border-card)',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
            >
              <img 
                src={msg.avatar_url} 
                alt={msg.display_name} 
                style={{ width: '44px', height: '44px', borderRadius: '50%' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifySelf: 'stretch', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontWeight: 650, fontSize: '0.95rem' }}>{msg.display_name}</span>
                    {msg.user_id === 'user-mock-admin' && (
                      <span style={{
                        background: 'rgba(168, 85, 247, 0.2)',
                        color: '#e9d5ff',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.1rem'
                      }}>
                        <ShieldAlert size={10} />
                        博主
                      </span>
                    )}
                  </div>
                  
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatDate(msg.created_at)}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {msg.content}
                </p>

                {/* Actions (Delete button) */}
                {(user?.role === 'admin' || user?.id === msg.user_id) && (
                  <button 
                    onClick={() => handleDelete(msg.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      marginTop: '0.2rem',
                      transition: 'var(--transition-smooth)'
                    }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--accent-rose)'}
                    onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                  >
                    <Trash2 size={12} />
                    刪除留言
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
