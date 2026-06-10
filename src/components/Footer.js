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
        <div style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '0.95rem' }}>
          <span className="text-gradient">Yen BLOG</span>
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
