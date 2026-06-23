"use client";

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/dbService';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, PlusCircle, Edit, Trash, Save, Eye, LayoutGrid, CheckCircle, ChevronDown, ChevronUp, Mail, Brain, ImagePlus, X } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Form State
  const [postId, setPostId] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const statusRef = useRef("published");
  const coverFileInputRef = useRef(null);

  // AI Summarize State
  const [pendingComments, setPendingComments] = useState(0);
  const [summarizing, setSummarizing] = useState(false);

  const [posts, setPosts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Sync slug from title automatically when creating
  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!postId) {
      // Basic slug generator (replace spaces/special chars)
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5-_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleCoverImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      alert("封面圖片只支援 JPG 與 PNG 格式！");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCoverImage(reader.result);
    };
    reader.onerror = () => {
      alert("讀取圖片失敗，請重新選擇一次。");
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  };

  const handleCoverImageClear = () => {
    setCoverImage("");
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
  };

  const loadPosts = async () => {
    try {
      const data = await dbService.getPosts();
      setPosts(data);
    } catch (err) {
      console.error("載入文章失敗：", err);
    }
  };

  const loadPendingCount = async () => {
    try {
      const count = await dbService.getPendingCommentsCount();
      setPendingComments(count);
    } catch (err) {
      console.error("載入未處理留言數失敗：", err);
    }
  };

  useEffect(() => {
    if (!loading && user?.role === 'admin') {
      loadPosts();
      loadPendingCount();
    }
  }, [user, loading]);

  const handleAiSummarize = async () => {
    if (pendingComments === 0) {
      alert("目前沒有新留言需要彙整！");
      return;
    }
    try {
      setSummarizing(true);
      const result = await dbService.triggerAiSummary();
      alert(result.message || "AI 總結完成並已成功寄送通知信！");
      await loadPendingCount();
    } catch (err) {
      console.error("AI 總結發信失敗：", err);
      alert("發信失敗：" + (err.message || JSON.stringify(err)));
    } finally {
      setSummarizing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("請填寫標題與文章內文！");
      return;
    }

    // Clean and generate Slug if empty
    let finalSlug = slug.trim();
    if (!finalSlug) {
      // Basic slug generator (replace spaces/special chars)
      finalSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fa5-_]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (!finalSlug || finalSlug === '-') {
        finalSlug = `post-${Date.now()}`;
      }
    }

    // Generate Summary if empty
    let finalSummary = summary.trim();
    if (!finalSummary) {
      // Strip markdown syntax
      const plainText = content
        .replace(/[#*`~_]/g, '')               // remove # * ` ~ _
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // remove markdown links [text](url) -> text
        .replace(/\n+/g, ' ')                  // collapse newlines
        .trim();
      finalSummary = plainText.substring(0, 150);
      if (plainText.length > 150) {
        finalSummary += '...';
      }
    }

    try {
      setSaving(true);
      const postPayload = {
        title,
        slug: finalSlug,
        summary: finalSummary,
        content,
        cover_image: coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        status: statusRef.current
      };
      if (postId) {
        postPayload.id = postId;
      }

      await dbService.savePost(postPayload);
      
      setSuccessMsg(postId ? "文章更新成功！" : "文章發表成功！");
      handleResetForm();
      await loadPosts();

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      console.error("儲存文章失敗：", err);
      alert("儲存失敗：" + (err.message || err.details || JSON.stringify(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (post) => {
    setPostId(post.id);
    setTitle(post.title);
    setSlug(post.slug);
    setSummary(post.summary || "");
    setContent(post.content || "");
    setCoverImage(post.cover_image || "");
    setStatus(post.status || "published");
    statusRef.current = post.status || "published";
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (post) => {
    const confirmed = confirm(`確定要刪除「${post.title}」嗎？這個動作無法復原。`);
    if (!confirmed) return;

    try {
      await dbService.deletePost(post.id);
      if (postId === post.id) {
        handleResetForm();
      }
      setSuccessMsg("文章已刪除。");
      await loadPosts();

      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      console.error("刪除文章失敗：", err);
      alert("刪除文章失敗：" + (err.message || err.details || JSON.stringify(err)));
    }
  };

  const handleResetForm = () => {
    setPostId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setCoverImage("");
    if (coverFileInputRef.current) {
      coverFileInputRef.current.value = "";
    }
    setStatus("published");
    statusRef.current = "published";
  };

  // Auth Gate
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', opacity: 0.6 }}>
        <p>驗證權限中，請稍候...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="glass-panel" style={{
        maxWidth: '550px',
        margin: '4rem auto',
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid rgba(244, 63, 94, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
      }}>
        <div style={{
          background: 'rgba(244, 63, 94, 0.1)',
          padding: '1rem',
          borderRadius: '50%',
          color: 'var(--accent-rose)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ShieldAlert size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>存取被拒絕 (Access Denied)</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
          此為部落格管理後台頁面，僅限管理員帳號登入。如果您是部落格主，請於右上角登入您的管理員 Google 帳戶；若處於 Mock 模式，請在右上角點擊並選擇「模擬管理員」身份。
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
      
      {/* Success Badge */}
      {successMsg && (
        <div style={{
          position: 'fixed',
          top: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1px solid var(--accent-emerald)',
          color: '#a7f3d0',
          padding: '0.75rem 2rem',
          borderRadius: '12px',
          zIndex: 1100,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 0 20px rgba(16, 185, 129, 0.3)'
        }}>
          <CheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* AI Summary and Email Panel */}
      <section className="glass-panel ai-panel" style={{
        padding: '1.5rem 2rem',
        border: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1.5rem',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)',
        flexWrap: 'wrap'
      }}>
        <style jsx>{`
          .ai-panel {
            display: flex !important;
          }
          @media (max-width: 600px) {
            .ai-panel {
              flex-direction: column;
              align-items: flex-start !important;
            }
            .ai-btn {
              width: 100%;
            }
          }
        `}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            padding: '0.75rem',
            borderRadius: '12px',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Brain size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              Gemini AI 留言彙整發信系統
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              目前有 <strong style={{ color: pendingComments > 0 ? 'var(--secondary)' : 'var(--text-muted)' }}>{pendingComments}</strong> 則新文章留言/簽到留言尚未處理。
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleAiSummarize}
          disabled={summarizing || pendingComments === 0}
          className="ai-btn"
          style={{
            background: pendingComments > 0 ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.02)',
            border: pendingComments > 0 ? 'none' : '1px solid var(--border-card)',
            color: pendingComments > 0 ? '#ffffff' : 'var(--text-muted)',
            padding: '0.65rem 1.5rem',
            borderRadius: '10px',
            cursor: pendingComments > 0 && !summarizing ? 'pointer' : 'not-allowed',
            fontWeight: 650,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'var(--transition-smooth)',
            boxShadow: pendingComments > 0 ? 'var(--shadow-glow)' : 'none'
          }}
          onMouseEnter={(e) => { if (pendingComments > 0 && !summarizing) e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { if (pendingComments > 0 && !summarizing) e.currentTarget.style.transform = 'none'; }}
        >
          <Mail size={16} />
          {summarizing ? "AI 彙整發信中..." : "AI 彙整並寄信給我"}
        </button>
      </section>

      {/* Write Post Section */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem', border: '1px solid var(--border-card)' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <PlusCircle size={24} style={{ color: 'var(--secondary)' }} />
          {postId ? "編輯部落格文章" : "撰寫新部落格文章"}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Main Core Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>文章標題 *</label>
              <input 
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="例如：探索 Next.js 14 的全新渲染模式"
                style={inputStyle}
                required
              />
            </div>
            
            {/* Content Markdown Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>文章內文 (支援 Markdown 格式) *</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# 這是一級標題 &#10;&#10;這裡開始寫正文，支援 **粗體**、*斜體*、`代碼` 以及連結。"
                rows={12}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace' }}
                required
              />
            </div>
          </div>

          {/* Toggle Advanced Settings */}
          <div style={{ margin: '0.5rem 0' }}>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-card)',
                borderRadius: '12px',
                padding: '0.6rem 1.2rem',
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {showAdvanced ? "隱藏進階設定" : "顯示進階設定 (自訂 Slug、封面、摘要)"}
            </button>
          </div>

          {/* Collapsible Advanced Form Grid */}
          {showAdvanced && (
            <div className="glass-panel animate-fade-in" style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid var(--border-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="form-grid">
                <style jsx>{`
                  @media (max-width: 768px) {
                    .form-grid {
                      grid-template-columns: 1fr !important;
                    }
                  }
                `}</style>
                
                {/* Slug */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>網址識別碼 Slug</label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(選填，留空自動產生)</span>
                  </div>
                  <input 
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="例如: nextjs-14-render-mode"
                    style={inputStyle}
                  />
                </div>

                {/* Cover Image */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>封面圖片</label>
                  <input
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    onChange={handleCoverImageSelect}
                    style={{ display: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border-card)',
                        borderRadius: '10px',
                        padding: '0.65rem 1rem',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <ImagePlus size={16} />
                      選擇
                    </button>
                    {coverImage && (
                      <button
                        type="button"
                        onClick={handleCoverImageClear}
                        style={{
                          background: 'rgba(244, 63, 94, 0.08)',
                          border: '1px solid rgba(244, 63, 94, 0.25)',
                          borderRadius: '10px',
                          padding: '0.65rem 1rem',
                          color: '#fda4af',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <X size={16} />
                        移除
                      </button>
                    )}
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      支援 .jpg 與 .png
                    </span>
                  </div>
                  {coverImage && (
                    <div style={{
                      marginTop: '0.5rem',
                      width: '100%',
                      maxWidth: '260px',
                      aspectRatio: '16 / 9',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-card)',
                      background: 'rgba(0,0,0,0.2)'
                    }}>
                      <img
                        src={coverImage}
                        alt="封面圖片預覽"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>文章摘要 (顯示於列表頁)</label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(選填，留空自動擷取)</span>
                </div>
                <textarea 
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="請簡短介紹這篇文章的內容... (選填)"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            {postId && (
              <button 
                type="button"
                onClick={handleResetForm}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-primary)',
                  padding: '0.6rem 1.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'var(--transition-smooth)',
                  marginRight: 'auto'
                }}
              >
                取消編輯
              </button>
            )}
            
            <button 
              type="submit"
              onClick={() => { statusRef.current = "draft"; }}
              disabled={saving}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-primary)',
                padding: '0.6rem 1.8rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              {saving && statusRef.current === "draft" ? "正在儲存..." : "儲存為草稿"}
            </button>

            <button 
              type="submit"
              onClick={() => { statusRef.current = "published"; }}
              disabled={saving}
              style={{
                background: 'var(--primary-gradient)',
                border: 'none',
                color: '#ffffff',
                padding: '0.6rem 2rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 650,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-glow)',
                transition: 'var(--transition-smooth)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; }}
            >
              <Save size={16} />
              {saving && statusRef.current === "published" ? "正在儲存..." : (postId ? "發布並儲存" : "直接發布")}
            </button>
          </div>
        </form>
      </section>

      {/* Manage Posts List Section */}
      <section className="glass-panel" style={{ padding: '2.5rem 2rem', border: '1px solid var(--border-card)' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <LayoutGrid size={20} style={{ color: 'var(--primary)' }} />
          文章列表管理 ({posts.length})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-card)',
              gap: '1rem'
            }} className="post-mgmt-item">
              <style jsx>{`
                @media (max-width: 600px) {
                  .post-mgmt-item {
                    flex-direction: column;
                    align-items: flex-start !important;
                  }
                  .post-mgmt-actions {
                    width: 100%;
                    justify-content: flex-end;
                  }
                }
              `}</style>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '1rem' }}>{post.title}</span>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                    background: post.status === 'draft' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: post.status === 'draft' ? '#fda4af' : '#a7f3d0',
                    border: `1px solid ${post.status === 'draft' ? 'rgba(244, 63, 94, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}>
                    {post.status === 'draft' ? '草稿' : '公開'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Slug: /{post.slug} • 按讚: {post.likes_count || 0} • 留言: {post.comments_count || 0}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="post-mgmt-actions">
                <Link 
                  href={`/posts/${post.slug}`} 
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-card)',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Eye size={12} />
                  預覽
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(post)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    border: '1px solid rgba(244, 63, 94, 0.35)',
                    fontSize: '0.8rem',
                    color: '#fda4af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Trash size={12} />
                  刪除
                </button>
                <button 
                  onClick={() => handleEditClick(post)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    fontSize: '0.8rem',
                    color: '#a5b4fc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Edit size={12} />
                  編輯
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

const inputStyle = {
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid var(--border-card)',
  borderRadius: '12px',
  padding: '0.75rem 1rem',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  outline: 'none',
  width: '100%',
  transition: 'all 0.3s ease'
};
