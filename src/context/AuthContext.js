"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isMock } from '@/lib/supabaseClient';

// ==========================================================
// 系統管理員設定區 (Admin Settings)
// ==========================================================
// 請將您的 Gmail 帳號填入下方陣列中（例如：['your-email@gmail.com']）
// 當您首次透過 Google 登入本站時，系統會自動在資料庫中將您設為 Admin（管理員）。
// 如果您在登入後才將信箱加入此處，系統也會在您下一次登入或重新整理網頁時自動將您的角色升級為 Admin。
const ADMIN_EMAILS = [
  '4b2g0007@stust.edu.tw', // 👈 請修改此處為您的 Gmail 帳號
];

const AuthContext = createContext({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
  loginAsMock: (role) => {},
  isMockMode: false
});

const MOCK_ADMIN_USER = {
  id: "user-mock-admin",
  email: "admin@myblog.com",
  display_name: "林部落格主 (Admin)",
  avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
  role: "admin"
};

const MOCK_REGULAR_USER = {
  id: "user-mock-2",
  email: "reader@gmail.com",
  display_name: "林小明 (Reader)",
  avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix",
  role: "user"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync profile data to get role
  const syncProfile = async (authSessionUser) => {
    if (!authSessionUser) return null;
    
    try {
      // Fetch user profile from database to get the role
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authSessionUser.id)
        .single();

      const isUserAdmin = ADMIN_EMAILS.includes(authSessionUser.email);

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, create one
          const role = isUserAdmin ? 'admin' : 'user';

          const newProfile = {
            id: authSessionUser.id,
            email: authSessionUser.email,
            display_name: authSessionUser.user_metadata?.full_name || authSessionUser.email.split('@')[0],
            avatar_url: authSessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${authSessionUser.id}`,
            role: role,
            created_at: new Date().toISOString()
          };

          const { data: insertedData, error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (insertError) throw insertError;
          return insertedData;
        }
        throw error;
      }

      // Automatically promote to admin if user email is added to ADMIN_EMAILS list
      if (data && isUserAdmin && data.role !== 'admin') {
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', data.id)
          .select()
          .single();
        
        if (!updateError) {
          return updatedData;
        }
      }

      return data;
    } catch (err) {
      console.error("同步使用者 Profile 失敗：", err);
      // Return a basic profile if syncing fails
      const isUserAdmin = ADMIN_EMAILS.includes(authSessionUser.email);
      return {
        id: authSessionUser.id,
        email: authSessionUser.email,
        display_name: authSessionUser.user_metadata?.full_name || authSessionUser.email.split('@')[0],
        avatar_url: authSessionUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${authSessionUser.id}`,
        role: isUserAdmin ? 'admin' : 'user'
      };
    }
  };

  useEffect(() => {
    if (isMock) {
      // Mock mode: restore mock user from localStorage
      if (typeof window !== "undefined") {
        const savedUser = localStorage.getItem("mock_current_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
      setLoading(false);
      return;
    }

    // Supabase mode: Subscribe to auth changes
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await syncProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("取得 Initial Auth 失敗：", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        const profile = await syncProfile(session.user);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    if (isMock) {
      // In mock mode, default login as mock user
      loginAsMock('user');
      return;
    }
    
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error("Google 登入失敗：", err);
      alert("登入失敗，請確認 Supabase RLS 與 Google OAuth 設定。");
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    if (isMock) {
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("mock_current_user");
      }
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err) {
      console.error("登出失敗：", err);
    } finally {
      setLoading(false);
    }
  };

  const loginAsMock = (role) => {
    if (!isMock) return;
    const mockUser = role === 'admin' ? MOCK_ADMIN_USER : MOCK_REGULAR_USER;
    setUser(mockUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("mock_current_user", JSON.stringify(mockUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      loginWithGoogle,
      logout,
      loginAsMock,
      isMockMode: isMock
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
