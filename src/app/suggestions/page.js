"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { dbService } from '@/lib/dbService';
import { isMock, supabase } from '@/lib/supabaseClient';
import {
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Link as LinkIcon,
  Send,
  ShieldCheck,
  XCircle
} from 'lucide-react';

const CATEGORIES = {
  feature: '功能建議',
  bug: 'Bug 回報',
  ui: '介面改善',
  other: '其他'
};

const MARKERS = [
  {
    value: 'done',
    label: '已修正 / 已新增',
    Icon: CheckCircle2,
    color: '#34d399',
    background: 'rgba(16, 185, 129, 0.16)',
    border: 'rgba(16, 185, 129, 0.45)'
  },
  {
    value: 'rejected',
    label: '不採納 / 無效回報',
    Icon: XCircle,
    color: '#fb7185',
    background: 'rgba(244, 63, 94, 0.14)',
    border: 'rgba(244, 63, 94, 0.45)'
  },
  {
    value: 'todo',
    label: '已加入待辦',
    Icon: ClipboardList,
    color: '#facc15',
    background: 'rgba(250, 204, 21, 0.14)',
    border: 'rgba(250, 204, 21, 0.42)'
  }
];

export default function SuggestionsPage() {
  const { user, loginWithGoogle } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("feature");
  const [content, setContent] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const loadSuggestions = async () => {
    try {
      setSuggestions(await dbService.getSuggestions());
    } catch (error) {
      console.error("載入功能建議失敗：", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuggestions();

    if (isMock || !supabase) return undefined;

    const channel = supabase
      .channel('suggestions-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suggestions' }, loadSuggestions)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    try {
      setSubmitting(true);
      const newSuggestion = await dbService.addSuggestion(user, {
        title: title.trim(),
        category,
        content: content.trim(),
        page_url: pageUrl.trim()
      });
      setSuggestions(current => [
        newSuggestion,
        ...current.filter(item => item.id !== newSuggestion.id)
      ]);
      setTitle("");
      setCategory("feature");
      setContent("");
      setPageUrl("");
    } catch (error) {
      console.error("送出功能建議失敗：", error);
      alert("送出失敗，請稍後再試。");
    } finally {
      setSubmitting(false);
    }
  };

  const updateMarker = async (suggestion, selectedMarker) => {
    if (!isAdmin || updatingId) return;

    const nextMarker = suggestion.admin_marker === selectedMarker ? null : selectedMarker;
    try {
      setUpdatingId(suggestion.id);
      const updated = await dbService.updateSuggestionMarker(suggestion.id, nextMarker);
      setSuggestions(current => current.map(item => item.id === suggestion.id ? updated : item));
    } catch (error) {
      console.error("更新建議狀態失敗：", error);
      alert("狀態更新失敗，請確認你有 Admin 權限。");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <style jsx>{`
        @media (max-width: 720px) {
          .page-header,
          .form-grid,
          .suggestion-card {
            grid-template-columns: 1fr !important;
          }
          .status-column {
            align-items: flex-start !important;
          }
        }
      `}</style>

      <section className="glass-panel page-header" style={{
        padding: '2rem',
        border: '1px solid var(--border-card)',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: '1rem',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>
            功能建議 / 改善回報
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.65, maxWidth: '680px' }}>
            歡迎回報想新增的功能、遇到的 Bug，或覺得可以改善的地方。所有建議都會公開顯示，處理進度也會同步更新。
          </p>
        </div>
        {isAdmin && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#e9d5ff',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            background: 'rgba(168, 85, 247, 0.1)',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.85rem',
            fontWeight: 700
          }}>
            <ShieldCheck size={16} />
            Admin 可管理狀態
          </div>
        )}
      </section>

      <section className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border-card)' }}>
        {user ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '1rem' }}>
              <label style={fieldStyle}>
                <span style={labelStyle}>標題 *</span>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="例如：希望新增文章搜尋功能"
                  maxLength={80}
                  required
                  style={inputStyle}
                />
              </label>
              <label style={fieldStyle}>
                <span style={labelStyle}>類型</span>
                <select value={category} onChange={(event) => setCategory(event.target.value)} style={inputStyle}>
                  {Object.entries(CATEGORIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label style={fieldStyle}>
              <span style={labelStyle}>詳細內容 *</span>
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="請描述希望改善的地方、重現 Bug 的方式，或期待的使用情境。"
                rows={5}
                maxLength={1200}
                required
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
              />
            </label>

            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
              <label style={fieldStyle}>
                <span style={labelStyle}>相關頁面網址</span>
                <input
                  value={pageUrl}
                  onChange={(event) => setPageUrl(event.target.value)}
                  placeholder="可選，例如 /posts/example"
                  maxLength={200}
                  style={inputStyle}
                />
              </label>
              <button
                type="submit"
                disabled={submitting || !title.trim() || !content.trim()}
                style={{
                  ...primaryButtonStyle,
                  opacity: title.trim() && content.trim() ? 1 : 0.55,
                  cursor: title.trim() && content.trim() && !submitting ? 'pointer' : 'not-allowed'
                }}
              >
                <Send size={16} />
                {submitting ? '送出中...' : '送出建議'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ padding: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-secondary)' }}>登入後就可以提出功能建議或 Bug 回報。</p>
            <button type="button" onClick={loginWithGoogle} style={primaryButtonStyle}>
              使用 Google 登入
            </button>
          </div>
        )}
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Lightbulb size={19} style={{ color: 'var(--primary)' }} />
          建議列表 ({suggestions.length})
        </h2>

        {loading ? (
          [1, 2, 3].map(item => (
            <div key={item} className="glass-panel" style={{ height: '132px', opacity: 0.5 }} />
          ))
        ) : suggestions.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            目前還沒有建議。
          </div>
        ) : (
          suggestions.map(suggestion => (
            <article
              key={suggestion.id}
              className="glass-panel suggestion-card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: '1rem',
                padding: '1.25rem',
                border: '1px solid var(--border-card)'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', minWidth: 0 }}>
                <img
                  src={suggestion.avatar_url}
                  alt={suggestion.display_name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', flex: '0 0 auto' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={categoryStyle}>{CATEGORIES[suggestion.category] || '其他'}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {suggestion.display_name} · {formatDate(suggestion.created_at)}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                    {suggestion.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.65, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                    {suggestion.content}
                  </p>
                  {suggestion.page_url && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', overflowWrap: 'anywhere' }}>
                      <LinkIcon size={13} />
                      {suggestion.page_url}
                    </div>
                  )}
                </div>
              </div>

              <div className="status-column" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {MARKERS.map(marker => {
                    const active = suggestion.admin_marker === marker.value;
                    return (
                      <button
                        key={marker.value}
                        type="button"
                        title={marker.label}
                        aria-label={marker.label}
                        disabled={!isAdmin || updatingId === suggestion.id}
                        onClick={() => updateMarker(suggestion, marker.value)}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          border: active ? `1px solid ${marker.border}` : '1px solid rgba(255,255,255,0.1)',
                          background: active ? marker.background : '#05070d',
                          color: active ? marker.color : '#6b7280',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isAdmin ? 'pointer' : 'default',
                          transition: 'var(--transition-smooth)'
                        }}
                      >
                        <marker.Icon size={20} />
                      </button>
                    );
                  })}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  {markerText(suggestion.admin_marker)}
                </span>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function markerText(marker) {
  if (marker === 'done') return '已修正 / 已新增';
  if (marker === 'rejected') return '不採納 / 無效回報';
  if (marker === 'todo') return '已加入待辦';
  return '尚未處理';
}

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.45rem'
};

const labelStyle = {
  color: 'var(--text-secondary)',
  fontSize: '0.86rem',
  fontWeight: 700
};

const inputStyle = {
  background: 'rgba(0,0,0,0.22)',
  border: '1px solid var(--border-card)',
  borderRadius: '10px',
  color: 'var(--text-primary)',
  fontFamily: 'inherit',
  fontSize: '0.94rem',
  outline: 'none',
  padding: '0.7rem 0.85rem',
  width: '100%'
};

const primaryButtonStyle = {
  background: 'var(--primary-gradient)',
  border: 'none',
  borderRadius: '10px',
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.45rem',
  fontWeight: 750,
  fontSize: '0.92rem',
  padding: '0.72rem 1rem',
  boxShadow: 'var(--shadow-glow)',
  whiteSpace: 'nowrap',
  cursor: 'pointer'
};

const categoryStyle = {
  border: '1px solid rgba(99, 102, 241, 0.35)',
  background: 'rgba(99, 102, 241, 0.1)',
  color: '#c7d2fe',
  borderRadius: '999px',
  padding: '0.18rem 0.55rem',
  fontSize: '0.72rem',
  fontWeight: 700
};
