# Google 帳號登入（OAuth）與管理員正式串接指南

本指南詳細說明如何將本部落格系統正式串接至您專屬的 **Supabase** 與 **Google Cloud**，並啟用 Google 登入功能。

---

## 步驟一：填寫您的管理員信箱

1. 打開本機專案檔案 [AuthContext.js](file:///c:/Users/STUST/Desktop/tess-main/src/context/AuthContext.js)。
2. 在程式碼最上方的 `ADMIN_EMAILS` 陣列中填入您的 Gmail。例如：
   ```javascript
   const ADMIN_EMAILS = [
     'your-actual-email@gmail.com', // 👈 改為您的 Google 帳戶信箱
   ];
   ```
3. 存檔。此設定會在您使用 Google 登入時自動在資料庫內將您的身分升級為 `admin`。

---

## 步驟二：取得並設定 Supabase 憑證

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)。
2. 創建新專案，或打開您現有的專案。
3. 前往左側選單的 **Project Settings (專案設定)** -> **API**。
4. 複製以下兩個資訊：
   - **Project URL** (`https://xxxx.supabase.co`)
   - **Anon Key** (即公鑰 `eyJhbGciOi...`)
5. 在部落格專案的根目錄中，將 `NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 填入您的 [.env.local](file:///c:/Users/STUST/Desktop/tess-main/.env.local) 中。

---

## 步驟三：設定 Google OAuth 憑證

### 1. 前往 Google Cloud Console 建立 OAuth 憑證
1. 打開 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立新專案（或選擇現有專案）。
3. 搜尋並前往 **OAuth 同意畫面 (OAuth Consent Screen)**：
   - 選擇 **外部 (External)** 並點擊建立。
   - 填寫 **應用程式名稱** (例如: Aether Blog)、**使用者支援電子郵件** 與 **開發人員聯絡資訊**，其他留空並存檔。
4. 前往 **憑證 (Credentials)** 頁面：
   - 點擊 **+ 建立憑證 (+ Create Credentials)** -> 選擇 **OAuth 用戶端 ID (OAuth Client ID)**。
   - 應用程式類型選擇 **網頁應用程式 (Web Application)**。
   - 在 **已授權的 JavaScript 來源 (Authorized JavaScript origins)** 加入：
     - `http://localhost:3000` (本地測試網址)
     - `https://您的專案ID.supabase.co` (您的 Supabase URL)
   - 在 **已授權的重新導向 URI (Authorized redirect URIs)** 加入：
     - `https://您的專案ID.supabase.co/auth/v1/callback` (請將「您的專案ID」替換成您實際的 Supabase ID，這可以在 Supabase 控制台的 API 頁面查到)
   - 點擊建立，您會取得一組 **用戶端 ID (Client ID)** 與 **用戶端密鑰 (Client Secret)**。

### 2. 在 Supabase 後台啟用 Google 登入
1. 回到 [Supabase Dashboard](https://supabase.com/dashboard)，進入您的專案。
2. 前往左側選單的 **Authentication (認證)** -> **Providers (登入提供者)**。
3. 展開 **Google** 並將其切換為 **Enabled (已啟用)**。
4. 將剛才從 Google Cloud Console 複製的 **Client ID** 與 **Client Secret** 填入對應輸入框。
5. 點擊 **Save (儲存)**。

---

## 步驟四：重啟 Next.js 伺服器

1. 在終端機中停止目前的執行程序。
2. 再次輸入以下指令啟動：
   ```bash
   npm run dev
   ```
3. 系統偵測到 `.env.local` 內填入了有效的 Supabase 網址後，右上角原本的「Mock 模式」標誌便會消失，正式啟用 Supabase 雲端資料庫連線。
4. 點擊右上角 **Google 登入**，完成授權後，系統即會建立您的 Profile，並根據 `ADMIN_EMAILS` 的設定自動賦予您 Admin 管理員身分，此時您便能直接撰寫、發布文章與管理所有留言！
