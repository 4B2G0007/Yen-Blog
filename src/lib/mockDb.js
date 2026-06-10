const DEFAULT_POSTS = [
  {
    id: "post-1",
    title: "探索 Glassmorphism 磨砂玻璃設計：現代網頁的流光美學",
    slug: "exploring-glassmorphism-modern-web-design",
    summary: "本文將深入剖析 Glassmorphism 的核心視覺原理，探討如何利用 Vanilla CSS 的 backdrop-filter 屬性，搭配微光邊框與漸層背景，打造出高級感十足的現代 UI 介面。",
    content: `# 探索 Glassmorphism 磨砂玻璃設計：現代網頁的流光美學

在當前的 Web UI 設計趨勢中，**Glassmorphism (磨砂玻璃質感)** 無疑是最吸睛的視覺風格之一。從 macOS Big Sur 到 Windows Fluent Design，這種半透明、帶有模糊背景、邊框泛光的美學設計，正迅速席捲各大現代化網站。

## 什麼是 Glassmorphism？

Glassmorphism 的核心特色包含：
1. **半透明感 (Translucency)**：使用帶有高透明度的背景色（例如 \`rgba(255, 255, 255, 0.05)\`）。
2. **多層次疊加 (Multi-layered approach)**：卡片懸浮在具有色彩斑斕或漸層的背景之上。
3. **背景模糊 (Background Blur)**：使用 CSS 的 \`backdrop-filter: blur()\` 讓卡片後方的背景變模糊。
4. **精緻微光邊框 (Subtle Border)**：一條極細且帶有透明度的邊框，模擬玻璃邊緣的折射效果。

---

## 程式碼實作示範

在 CSS 中，你可以這樣定義一個經典的磨砂玻璃面板：

\`\`\`css
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
}
\`\`\`

這僅僅需要幾行程式碼，就能呈現出非常高級的科技質感。

---

## 為什麼要搭配漸層背景？

磨砂玻璃效果的靈魂在於「背景的透光感」。如果背景是純黑或純白，模糊效果將毫無用武之地。因此，在網頁主體背景中加入一些「彩色光暈」或雙色漸層，能讓玻璃卡片看起來更加立體、生動。

在我們這套 Blog 系統中，我們就運用了 \`radial-gradient\` 渲染了深色的太空紫與星空藍光暈。當你滾動網頁時，卡片背後的光影會緩慢挪移，創造出極佳的動態體驗。

> **設計小技巧**：邊框的透明度通常要比卡片背景稍高一點點，這樣才能勾勒出玻璃邊緣的折射微光。`,
    cover_image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: "2026-06-01T12:00:00Z",
    updated_at: "2026-06-01T12:00:00Z",
    likes_count: 5,
    comments_count: 2
  },
  {
    id: "post-2",
    title: "為什麼我選擇 Next.js 14 作為個人 Blog 的核心開發框架？",
    slug: "why-nextjs-14-for-personal-blog",
    summary: "部落格網頁的靈魂在於加載速度與搜尋引擎優化（SEO）。本文分享我將部落格遷移至 Next.js App Router 的實戰心得，以及它如何幫我輕鬆搞定 Google OAuth 整合。",
    content: `# 為什麼我選擇 Next.js 14 作為個人 Blog 的核心開發框架？

當我們著手建立一個個人部落格時，通常會面臨許多技術選擇：是用靜態網站產生器（Hugo, Gatsby），還是主流的單頁應用 SPA 框架（CRA React）？

經過多方權衡，我最終選擇了 **Next.js 14 (App Router)**。以下是主要的原因：

## 1. 卓越的 SEO 表現 (Search Engine Optimization)

部落格文章是寫給人看的，更需要讓搜尋引擎爬蟲（如 Googlebot）能輕鬆讀取。傳統的 React SPA 因為是客戶端渲染 (Client-Side Rendering)，爬蟲抓到時可能是一片空白。
Next.js 預設使用 **伺服器端渲染 (Server-Side Rendering)** 與 **靜態生成 (Static Site Generation)**，讓文章內容在伺服器端就渲染成完美的 HTML，網頁加載速度極快，SEO 體驗完美。

## 2. 檔案路由與 API 路由整合

Next.js 的 App Router 讓路由管理變得極為直覺：
*   \`src/app/page.js\` -> 首頁
*   \`src/app/posts/[slug]/page.js\` -> 文章內頁
*   \`src/app/guestbook/page.js\` -> 訪客留言板

同時，我們可以直接在 \`src/app/api/\` 下編寫後端 API，不需要額外架設 Node.js Express 伺服器，非常適合輕量級的全端專案。

---

## 3. 與 Supabase 的無縫接軌

搭配 Supabase，我們可以極快地實作以下核心功能：
- **Google 第三方登入**：利用 Supabase Auth 模組，只需設定 Google Developer Console，五分鐘即可搞定。
- **文章留言與點讚**：Supabase 提供即時（Realtime）資料庫同步功能，點讚與留言能做到即時反應，讓訪客的互動感大增。

在接下來的文章中，我將寫一篇教學，詳細示範如何將 Google OAuth 憑證串接到 Next.js 與 Supabase 中。`,
    cover_image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
    status: "published",
    created_at: "2026-06-02T08:30:00Z",
    updated_at: "2026-06-02T08:30:00Z",
    likes_count: 3,
    comments_count: 1
  }
];

const DEFAULT_COMMENTS = [
  {
    id: "comment-1",
    post_id: "post-1",
    user_id: "user-mock-2",
    display_name: "林小明",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    content: "這篇 Glassmorphism 的 CSS 教學太實用了！特別是邊框微光的細節，加上去之後質感真的有差！",
    created_at: "2026-06-01T14:22:00Z"
  },
  {
    id: "comment-2",
    post_id: "post-1",
    user_id: "user-mock-3",
    display_name: "陳雅婷",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anya",
    content: "背景的 radial-gradient 配色真的很好看，有一種科幻太空的氛圍！",
    created_at: "2026-06-01T15:30:00Z"
  },
  {
    id: "comment-3",
    post_id: "post-2",
    user_id: "user-mock-2",
    display_name: "林小明",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    content: "我也覺得 App Router 很方便，特別是引入 Server Component 之後，抓取資料的效能提升很有感。",
    created_at: "2026-06-02T10:15:00Z"
  }
];

const DEFAULT_GUESTBOOK = [
  {
    id: "guest-1",
    user_id: "user-mock-2",
    display_name: "林小明",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
    content: "哈囉！路過前來留言板踩踩，網頁做得超精緻的，推一個！✨",
    created_at: "2026-06-02T12:00:00Z"
  },
  {
    id: "guest-2",
    user_id: "user-mock-3",
    display_name: "陳雅婷",
    avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Anya",
    content: "博主的文章寫得很詳盡，留言板的 Glassmorphism 設計深得我心 ❤️ 期待更多 Next.js 的實戰分享！",
    created_at: "2026-06-02T13:45:00Z"
  }
];

const DEFAULT_LIKES = [
  { post_id: "post-1", user_id: "user-mock-2" },
  { post_id: "post-1", user_id: "user-mock-3" },
  { post_id: "post-1", user_id: "user-mock-admin" },
  { post_id: "post-2", user_id: "user-mock-2" },
  { post_id: "post-2", user_id: "user-mock-admin" }
];

export class MockDb {
  static getStorageItem(key, defaultValue) {
    if (typeof window === "undefined") return defaultValue;
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  }

  static setStorageItem(key, value) {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  // Posts
  static getPosts() {
    return this.getStorageItem("mock_posts", DEFAULT_POSTS);
  }

  static getPostBySlug(slug) {
    const posts = this.getPosts();
    return posts.find(p => p.slug === slug) || null;
  }

  static savePost(post) {
    const posts = this.getPosts();
    const existingIndex = posts.findIndex(p => p.slug === post.slug || p.id === post.id);
    if (existingIndex > -1) {
      posts[existingIndex] = { ...posts[existingIndex], ...post, updated_at: new Date().toISOString() };
    } else {
      posts.unshift({
        id: `post-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        ...post
      });
    }
    this.setStorageItem("mock_posts", posts);
    return post;
  }

  // Comments
  static getComments(postId) {
    const allComments = this.getStorageItem("mock_comments", DEFAULT_COMMENTS);
    return allComments.filter(c => c.post_id === postId).sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
  }

  static addComment(postId, user, content) {
    const allComments = this.getStorageItem("mock_comments", DEFAULT_COMMENTS);
    const newComment = {
      id: `comment-${Date.now()}`,
      post_id: postId,
      user_id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      content,
      created_at: new Date().toISOString()
    };
    allComments.push(newComment);
    this.setStorageItem("mock_comments", allComments);
    
    // Update count in post
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments_count = (post.comments_count || 0) + 1;
      this.savePost(post);
    }

    return newComment;
  }

  static deleteComment(commentId) {
    const allComments = this.getStorageItem("mock_comments", DEFAULT_COMMENTS);
    const comment = allComments.find(c => c.id === commentId);
    if (!comment) return false;
    
    const filtered = allComments.filter(c => c.id !== commentId);
    this.setStorageItem("mock_comments", filtered);

    // Update count in post
    const posts = this.getPosts();
    const post = posts.find(p => p.id === comment.post_id);
    if (post) {
      post.comments_count = Math.max(0, (post.comments_count || 1) - 1);
      this.savePost(post);
    }
    return true;
  }

  // Likes
  static getLikes(postId) {
    const allLikes = this.getStorageItem("mock_likes", DEFAULT_LIKES);
    return allLikes.filter(l => l.post_id === postId);
  }

  static hasLiked(postId, userId) {
    const allLikes = this.getStorageItem("mock_likes", DEFAULT_LIKES);
    return allLikes.some(l => l.post_id === postId && l.user_id === userId);
  }

  static toggleLike(postId, userId) {
    const allLikes = this.getStorageItem("mock_likes", DEFAULT_LIKES);
    const index = allLikes.findIndex(l => l.post_id === postId && l.user_id === userId);
    let liked = false;
    
    if (index > -1) {
      allLikes.splice(index, 1);
    } else {
      allLikes.push({ post_id: postId, user_id: userId });
      liked = true;
    }
    this.setStorageItem("mock_likes", allLikes);

    // Update count in post
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      const postLikes = allLikes.filter(l => l.post_id === postId).length;
      post.likes_count = postLikes;
      this.savePost(post);
    }

    return liked;
  }

  // Guestbook
  static getGuestbook() {
    const entries = this.getStorageItem("mock_guestbook", DEFAULT_GUESTBOOK);
    return entries.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)); // newest first
  }

  static addGuestbook(user, content) {
    const entries = this.getStorageItem("mock_guestbook", DEFAULT_GUESTBOOK);
    const newEntry = {
      id: `guest-${Date.now()}`,
      user_id: user.id,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      content,
      created_at: new Date().toISOString()
    };
    entries.unshift(newEntry);
    this.setStorageItem("mock_guestbook", entries);
    return newEntry;
  }

  static deleteGuestbook(entryId) {
    const entries = this.getStorageItem("mock_guestbook", DEFAULT_GUESTBOOK);
    const filtered = entries.filter(e => e.id !== entryId);
    this.setStorageItem("mock_guestbook", filtered);
    return true;
  }
}
