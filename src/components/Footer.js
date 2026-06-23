export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-card)',
      padding: '2.5rem 0',
      textAlign: 'center',
      marginTop: 'auto',
      background: 'rgba(6, 9, 19, 0.5)',
      backdropFilter: 'blur(10px)',
    }}>
      <div className="container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          fontWeight: 700,
          letterSpacing: '1px',
          fontSize: '0.95rem'
        }}>
          <span className="text-gradient">Yen BLOG</span>
          <a
            className="footer-github-link"
            href="https://github.com/4B2G0007/Yen-Blog"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="前往 Yen Blog GitHub 專案"
            title="GitHub"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.09.682-.217.682-.482 0-.237-.009-.866-.014-1.7-2.782.604-3.369-1.34-3.369-1.34-.455-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.091-.646.35-1.087.635-1.337-2.221-.253-4.555-1.111-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.58 9.58 0 0 1 12 6.836a9.58 9.58 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.337 4.687-4.566 4.935.359.309.679.92.679 1.855 0 1.338-.012 2.419-.012 2.748 0 .267.18.577.688.479C19.137 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10Z" />
            </svg>
          </a>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} Aether Blog. All rights reserved. Powered by Next.js & Supabase.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', maxWidth: '500px' }}>
          用Gemini做的
        </p>
      </div>
    </footer>
  );
}
