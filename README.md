# Yen Blog

以 Next.js 14、Supabase 與 Gemini AI 建置的全端個人部落格。

支援文章管理、Google 登入、留言互動、功能建議回報，以及 AI 自動彙整留言並寄送報告。

## 功能

- 文章瀏覽、Markdown 內容顯示
- 管理員新增、編輯、刪除文章
- 草稿與公開狀態管理
- 文章封面圖片與自動摘要
- Google OAuth 登入
- 文章留言與按讚
- 訪客留言板
- 功能建議與 Bug 回報
- 建議分類：新功能、Bug、介面與其他
- 管理員可標記建議為待處理、已完成或不採用
- Supabase Realtime 即時同步建議狀態
- Gemini AI 彙整尚未處理的留言
- 透過 SMTP 寄送 AI 分析報告
- Gemini 呼叫失敗時自動重試並回傳明確錯誤
- 未設定 Supabase 時自動切換至 LocalStorage Mock 模式
- 響應式磨砂玻璃介面
- 頁尾提供 GitHub 專案連結

## 技術

- Next.js 14 App Router
- React 18
- Supabase
- Google OAuth
- Google Gemini 2.5 Flash-Lite
- Nodemailer
- React Markdown
- Lucide React
- Vanilla CSS

## 開始使用

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 環境變數

複製 `.env.example` 並建立 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=Yen Blog AI 助手
```

若未設定 Supabase 環境變數，專案會自動使用 LocalStorage Mock 模式，方便在本機測試管理員與一般使用者功能。

## 資料庫設定

前往 Supabase Dashboard 的 SQL Editor，依序執行：

1. `schema.sql`
2. `suggestions.sql`

這會建立以下資料表：

- `profiles`
- `posts`
- `comments`
- `likes`
- `guestbook`
- `suggestions`

同時設定 Row Level Security 與建議頁面的 Realtime 支援。

## AI 留言彙整

系統會取得尚未彙整的文章留言與訪客留言，交由 Gemini 產生繁體中文分析報告，再透過 SMTP 寄送給管理員。

可從管理後台手動執行，也可使用排程服務呼叫：

```text
/api/cron/summarize
```

支援 `GET` 與 `POST` 請求。

## 部署

專案可直接部署至 Vercel：

1. 將專案推送至 GitHub。
2. 在 Vercel 匯入儲存庫。
3. 設定所需環境變數。
4. 完成部署。
5. 如需定時彙整，可使用 Vercel Cron 或其他排程服務呼叫摘要 API。

## GitHub

[4B2G0007/Yen-Blog](https://github.com/4B2G0007/Yen-Blog)
