-- ==========================================================
-- Aether Blog 資料庫初始化與 RLS 安全原則設定腳本
-- 請將此腳本複製到 Supabase Dashboard -> SQL Editor 中執行。
-- ==========================================================

-- 1. 建立 profiles (使用者設定檔) 資料表
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 建立 posts (文章) 資料表
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT,
    content TEXT,
    cover_image TEXT,
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 建立 comments (文章留言) 資料表
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 建立 likes (點讚) 資料表
CREATE TABLE IF NOT EXISTS public.likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    CONSTRAINT unique_post_user_like UNIQUE (post_id, user_id)
);

-- 5. 建立 guestbook (訪客留言板) 資料表
CREATE TABLE IF NOT EXISTS public.guestbook (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================================
-- 啟用安全資料原則 (Row Level Security, RLS)
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guestbook ENABLE ROW LEVEL SECURITY;

-- ==========================================================
-- 定義 RLS 安全原則 (Policies)
-- ==========================================================

-- 輔助函式：判斷當前登入者是否為管理員
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --- profiles 原則 ---
CREATE POLICY "允許所有人讀取個人資料" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "允許使用者新增自己的個人資料" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "允許使用者更新自己的個人資料" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);


-- --- posts 原則 ---
CREATE POLICY "允許所有人讀取文章" ON public.posts
    FOR SELECT USING (true);

CREATE POLICY "僅限管理員寫入文章" ON public.posts
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "僅限管理員更新文章" ON public.posts
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "僅限管理員刪除文章" ON public.posts
    FOR DELETE USING (public.is_admin());


-- --- comments 原則 ---
CREATE POLICY "允許所有人讀取留言" ON public.comments
    FOR SELECT USING (true);

CREATE POLICY "允許登入使用者新增留言" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "允許留言擁有者或管理員刪除留言" ON public.comments
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());


-- --- likes 原則 ---
CREATE POLICY "允許所有人讀取按讚紀錄" ON public.likes
    FOR SELECT USING (true);

CREATE POLICY "允許登入使用者新增按讚" ON public.likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "允許點讚者取消按讚" ON public.likes
    FOR DELETE USING (auth.uid() = user_id);


-- --- guestbook 原則 ---
CREATE POLICY "允許所有人讀取留言板" ON public.guestbook
    FOR SELECT USING (true);

CREATE POLICY "允許登入使用者新增留言板留言" ON public.guestbook
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "允許留言板留言擁有者或管理員刪除" ON public.guestbook
    FOR DELETE USING (auth.uid() = user_id OR public.is_admin());
