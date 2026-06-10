"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dbService } from '@/lib/dbService';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { Heart, MessageSquare, Calendar, ChevronLeft, Send, Trash2, ShieldAlert } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams();
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    async function loadPostData() {
      if (!slug) return;
      try {
        const postData = await dbService.getPostBySlug(slug);
        if (!postData) {
          router.push('/404');
          return;
        }

        // If draft and not admin, redirect
        if (postData.status === 'draft' && user?.role !== 'admin') {
          router.push('/');
          return;
        }

        setPost(postData);
        
        // Load likes
        const count = await dbService.getLikesCount(postData.id);
        setLikesCount(count);
        
        if (user) {
          const liked = await dbService.hasLiked(postData.id, user.id);
          setHasLiked(liked);
        }

        // Load comments
        const commentsData = await dbService.getComments(postData.id);
        setComments(commentsData);
      } catch (err) {
        console.error("載入文章詳情失敗：", err);
      } finally {
        setLoading(false);
      }
    }
    loadPostData();
  }, [slug, user, router]);

  const handleLike = async () => {
    if (!user) {
      alert("請先登入後才能按讚文章喔！");
      return;
    }
    try {
      const liked = await dbService.toggleLike(post.id, user.id);
      setHasLiked(liked);
      setLikesCount(prev => liked ? prev + 1 : Math.max(0, prev - 1));
    } catch (err) {
      console.error("按讚處理失敗：", err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const newComment = await dbService.addComment(post.id, user, commentText);
      setComments(prev => [...prev, newComment]);
      setCommentText("");
    } catch (err) {
      console.error("發布留言失敗：", err);
      alert("留言發布失敗，請重試。");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("確定要刪除這則留言嗎？")) return;
    try {
      await dbService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error("刪除留言失敗：", err);
      alert("刪除失敗。");
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-TW', options);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '2rem auto', opacity: 0.6 }}>
        <div style={{ width: '80px', height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
        <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
        <div style={{ width: '100%', height: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back button */}
      <Link 
        href="/" 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: 500,
          alignSelf: 'flex-start',
          transition: 'var(--transition-smooth)'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'translateX(-3px)'}
        onMouseLeave={(e) => e.target.style.transform = 'none'}
      >
        <ChevronLeft size={16} />
        返回文章列表
      </Link>

      {/* Post Cover Header */}
      <article className="glass-panel" style={{ overflow: 'hidden', border: '1px solid var(--border-card)' }}>
        {post.cover_image && (
          <div style={{ width: '100%', height: '320px', position: 'relative' }}>
            <img 
              src={post.cover_image} 
              alt={post.title} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Post Detail Body */}
        <div style={{ padding: '2.5rem 2rem' }}>
          
          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Calendar size={14} />
              {formatDate(post.created_at)}
            </span>
            {post.status === 'draft' && (
              <span style={{
                background: 'rgba(244, 63, 94, 0.25)',
                border: '1px solid var(--accent-rose)',
                color: '#fda4af',
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                fontWeight: 600,
                fontSize: '0.75rem'
              }}>
                草稿
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '2rem' }}>
            {post.title}
          </h1>

          {/* Markdown Content Area */}
          <div className="markdown-content" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: '2.5rem' }}>
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>

          {/* Markdown Styling via styled-jsx */}
          <style jsx global>{`
            .markdown-content h1, .markdown-content h2, .markdown-content h3 {
              color: var(--text-primary);
              margin-top: 2rem;
              margin-bottom: 1rem;
              font-weight: 700;
            }
            .markdown-content h1 { font-size: 1.75rem; border-bottom: 1px solid var(--border-card); padding-bottom: 0.5rem; }
            .markdown-content h2 { font-size: 1.4rem; }
            .markdown-content h3 { font-size: 1.15rem; }
            .markdown-content p { margin-bottom: 1.25rem; }
            .markdown-content ul, .markdown-content ol { margin-bottom: 1.25rem; padding-left: 1.5rem; }
            .markdown-content li { margin-bottom: 0.5rem; }
            .markdown-content blockquote {
              border-left: 4px solid var(--primary);
              background: rgba(255,255,255,0.02);
              padding: 0.75rem 1.25rem;
              margin: 1.5rem 0;
              border-radius: 0 8px 8px 0;
              font-style: italic;
              color: var(--text-primary);
            }
            .markdown-content pre {
              background: rgba(0, 0, 0, 0.4);
              padding: 1.25rem;
              border-radius: 12px;
              overflow-x: auto;
              border: 1px solid var(--border-card);
              margin: 1.5rem 0;
            }
            .markdown-content code {
              font-family: Consolas, Monaco, 'Andale Mono', monospace;
              font-size: 0.9rem;
              background: rgba(255,255,255,0.08);
              padding: 0.15rem 0.35rem;
              border-radius: 4px;
              color: #f3f4f6;
            }
            .markdown-content pre code {
              background: none;
              padding: 0;
              border-radius: 0;
            }
          `}</style>

          {/* Social Stats Action bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'between',
            borderTop: '1px solid var(--border-card)',
            paddingTop: '1.5rem',
            marginTop: '2rem'
          }}>
            <button 
              onClick={handleLike}
              style={{
                background: hasLiked ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${hasLiked ? 'var(--accent-rose)' : 'var(--border-card)'}`,
                color: hasLiked ? 'var(--accent-rose)' : 'var(--text-secondary)',
                padding: '0.6rem 1.25rem',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-smooth)',
                boxShadow: hasLiked ? '0 0 15px rgba(244, 63, 94, 0.2)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!hasLiked) {
                  e.target.style.background = 'rgba(244, 63, 94, 0.08)';
                  e.target.style.borderColor = 'rgba(244, 63, 94, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!hasLiked) {
                  e.target.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.target.style.borderColor = 'var(--border-card)';
                }
              }}
            >
              <Heart size={18} fill={hasLiked ? 'var(--accent-rose)' : 'none'} style={{
                transition: 'transform 0.2s ease',
                transform: hasLiked ? 'scale(1.2)' : 'none'
              }} />
              {likesCount} 個讚
            </button>

            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MessageSquare size={16} />
              {comments.length} 則留言
            </span>
          </div>

        </div>
      </article>

      {/* Comment Section Panel */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          讀者留言區
        </h3>

        {/* Comment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'center', padding: '1.5rem 0' }}>
              目前還沒有留言，快來當第一個留言的人吧！
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', paddingBottom: '1.25rem' }}>
                <img 
                  src={comment.avatar_url} 
                  alt={comment.display_name} 
                  style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.3rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{comment.display_name}</span>
                      {comment.user_id === 'user-mock-admin' && (
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
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {comment.content}
                  </p>

                  {/* Actions (Delete button) */}
                  {(user?.role === 'admin' || user?.id === comment.user_id) && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
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
                        marginTop: '0.25rem',
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

        {/* Write comment editor */}
        <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '2rem' }}>
          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '1rem' }}>
              <img 
                src={user.avatar_url} 
                alt={user.display_name} 
                style={{ width: '42px', height: '42px', borderRadius: '50%' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  以 <strong>{user.display_name}</strong> 的身份留言
                </span>
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="寫下您的看法與留言..."
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
                  disabled={submittingComment || !commentText.trim()}
                  style={{
                    background: 'var(--primary-gradient)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '0.5rem 1.25rem',
                    borderRadius: '10px',
                    cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    alignSelf: 'flex-end',
                    opacity: commentText.trim() ? 1 : 0.5,
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <Send size={14} />
                  {submittingComment ? "提交中..." : "發表留言"}
                </button>
              </div>
            </form>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem 1.5rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.01)',
              border: '1px dashed var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                想對文章發表留言嗎？請先登入您的 Google 帳戶。
              </p>
              <button 
                onClick={loginWithGoogle}
                style={{
                  background: 'var(--primary-gradient)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '0.55rem 1.25rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  boxShadow: 'var(--shadow-glow)',
                  transition: 'var(--transition-smooth)'
                }}
              >
                Google 帳戶登入
              </button>
            </div>
          )}
        </div>

      </section>

    </div>
  );
}
