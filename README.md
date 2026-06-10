# ✨ Yen Blog — 流光磨砂玻璃全端個人部落格與 AI 彙整留言板

Yen Blog 是一個兼具極致視覺美學與實用功能的現代化個人部落格與訪客留言系統。專案採用深色太空星系主題，搭配精緻的磨砂玻璃質感（Glassmorphism）、微光邊框折射與流動漸層動畫，並深度整合了 **Next.js 14**、**Supabase** 以及 **Google Gemini AI 留言自動彙整發信系統**。

---

## 🚀 核心特色功能

### 1. 🌌 極致流光視覺設計 (Glassmorphism)
- 全站採用精心調配的太空深藍與星空紫配色，搭配動態 `radial-gradient` 渲染的背景光暈。
- 導覽列與卡片元素均採用高透光度的磨砂玻璃效果（`backdrop-filter: blur(12px)`）與微光懸停浮起動畫，展現高階質感。

### 2. ⚡ 雙引擎資料庫設計 (Supabase / LocalStorage Mock)
- **雲端模式 (Supabase Mode)**：正式連線至 Supabase PostgreSQL 資料庫與 Google OAuth 登入。
- **單機模擬模式 (Mock Mode)**：若檢測到環境變數未配置，系統會**自動無縫降級至 LocalStorage 模擬資料庫**。右上角會顯示 Mock 標誌，並提供一鍵切換「管理員」與「一般讀者」的模擬角色選單，便於本地開發與完整功能測試。

### 3. ✍️ 簡化與智慧化文章發布 (Admin Dashboard)
- 後台管理介面僅保留**「標題」**與**「Markdown 內文」**為核心輸入，大幅降低發文門檻。
- 狀態按鈕化：一鍵點擊「儲存為草稿」或「直接發布」。
- **進階設定收合**：將 Slug、封面網址、文章摘要收合於進階設定中，且：
  - **自動 Slug**：留空時會自動將標題轉為小寫英數字及中線；若為中文，則自動產生唯一識別碼。
  - **智慧摘要**：留空時會自動去除 Markdown 語法標籤，並自動擷取內文前 150 字作為文章摘要。

### 4. 💬 讀者留言與訪客簽到牆 (Interactive Features)
- 每篇文章下方擁有獨立的留言串與點讚計數。
- 獨立的**訪客留言板 (Guestbook)**，提供公共留言牆與歷史留言紀錄。
- 管理員擁有全局刪除留言之權限，使用者則可刪除自己的留言。

### 5. 🧠 Gemini 2.5 Flash-Lite AI 留言彙整發信系統
- 為了解決留言過多導致管理員信箱被刷屏的痛點，系統內建了 AI 留言總結功能。
- **AI 處理邏輯**：
  1. 系統自動在資料庫篩選 `summarized = false` 的全新留言與簽到。
  2. 整合留言列表並透過 **Gemini 2.5 Flash-Lite** 進行分析歸納，產生包含【數據總覽】、【讀者回饋分析】與【待辦/回覆警示】的繁體中文 Markdown 報告。
  3. 透過 Nodemailer SMTP 將漂亮的 HTML 格式報告寄送至管理員信箱。
  4. 發信後將此批留言標記為已彙整，防範重複發信。
- **雙向觸發**：可利用 Vercel Cron 定期自動打 API 路由 `/api/cron/summarize`，亦可在 Admin 後台一鍵手動點擊「AI 彙整並寄信給我」。

---

## 🛠️ 技術棧說明

- **前端核心**：React 18, Next.js 14.2.35 (App Router)
- **後端與認證**：Supabase Client, Google OAuth
- **AI 模型**：Google Generative AI (`gemini-2.5-flash-lite`)
- **電子郵件**：Nodemailer (SMTP, 支援 Gmail 應用程式密碼)
- **視覺與元件**：Vanilla CSS, Lucide React (圖示), React Markdown (內容渲染)

---

## ⚙️ 環境變數配置 (`.env.local`)

請複製根目錄下的 `.env.example` 並重新命名為 `.env.local`，填入以下資訊：

```bash
# Supabase 連線憑證
NEXT_PUBLIC_SUPABASE_URL=https://您的專案ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=您的Anon公開Key

# Supabase Service Role Key (伺服器端專用，用來繞過 RLS 的管理員密鑰)
SUPABASE_SERVICE_ROLE_KEY=您的ServiceRole金鑰

# Gemini API 金鑰 (請至 Google AI Studio 申請)
GEMINI_API_KEY=您的Gemini金鑰

# SMTP 電子郵件寄送設定 (以 Gmail 應用程式密碼為例)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=您的Gmail帳號@gmail.com
SMTP_PASS=您的16位元Gmail應用程式密碼
SMTP_FROM_NAME=Yen Blog AI 助手
```

---

## 🗄️ 資料庫初始化

正式連線 Supabase 時，請複製專案根目錄下的 **`schema.sql`** 的內容，前往您的 **Supabase Dashboard -> SQL Editor** 中開新查詢（Create a new query）並貼上執行。這會為您建立：
- `profiles`（使用者設定檔）
- `posts`（部落格文章）
- `comments`（文章留言）
- `likes`（點讚紀錄）
- `guestbook`（留言牆紀錄）
- 繞過 RLS 的管理員輔助函式與各表的 Row Level Security 安全策略。

---

## 💻 本地運行

1. **安裝相依套件**：
   ```bash
   npm install
   ```

2. **啟動本地開發伺服器**：
   ```bash
   npm run dev
   ```

3. 開啟 [http://localhost:3000](http://localhost:3000) 即可在瀏覽器中查看。

---

## 🚀 部署至 Vercel 上線

1. 將專案 Push 到您的 **GitHub**（建議使用 Private 隱私儲存庫）。
2. 前往 **Vercel 控制台**，點擊 **Add New Project** 匯入此 GitHub 儲存庫。
3. 在部署設定的 **Environment Variables** 欄位中，填入 `.env.local` 裡的所有環境變數。
4. 點擊 **Deploy**，部署成功後即會生成公開訪問網址。
5. （選用）若要啟用定時自動發信，可前往 Vercel Cron 或外部定時排程服務（如 `cron-job.org`），設定定時發送 `GET` 或 `POST` 請求至 `https://您的網站.vercel.app/api/cron/summarize`。
