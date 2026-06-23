import { supabase, isMock } from './supabaseClient';
import { MockDb } from './mockDb';

export const dbService = {
  // --- POSTS ---
  async getPosts() {
    if (isMock) {
      return MockDb.getPosts();
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*, likes(count), comments(count)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map(post => ({
      ...post,
      likes_count: post.likes?.[0]?.count || 0,
      comments_count: post.comments?.[0]?.count || 0
    }));
  },

  async getPostBySlug(slug) {
    const decodedSlug = decodeURIComponent(slug);
    if (isMock) {
      return MockDb.getPostBySlug(decodedSlug);
    }
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', decodedSlug)
      .single();
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  async savePost(post) {
    if (isMock) {
      return MockDb.savePost(post);
    }
    const isNew = !post.id;
    const postPayload = {
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      cover_image: post.cover_image,
      status: post.status || 'published',
      updated_at: new Date().toISOString(),
    };

    if (isNew) {
      postPayload.created_at = new Date().toISOString();
      const { data, error } = await supabase
        .from('posts')
        .insert([postPayload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('posts')
        .update(postPayload)
        .eq('id', post.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  async deletePost(postId) {
    if (isMock) {
      return MockDb.deletePost(postId);
    }
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);
    if (error) throw error;
    return true;
  },

  // --- COMMENTS ---
  async getComments(postId) {
    if (isMock) {
      return MockDb.getComments(postId);
    }
    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Map response to match standard UI format
    return data.map(item => ({
      id: item.id,
      post_id: item.post_id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      display_name: item.profiles?.display_name || '讀者',
      avatar_url: item.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
    }));
  },

  async addComment(postId, user, content) {
    if (isMock) {
      return MockDb.addComment(postId, user, content);
    }
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: postId,
          user_id: user.id,
          content: content,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();
    if (error) throw error;
    
    return {
      ...data,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    };
  },

  async deleteComment(commentId) {
    if (isMock) {
      return MockDb.deleteComment(commentId);
    }
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
    return true;
  },

  // --- LIKES ---
  async getLikesCount(postId) {
    if (isMock) {
      return MockDb.getLikes(postId).length;
    }
    const { count, error } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId);
    if (error) throw error;
    return count || 0;
  },

  async hasLiked(postId, userId) {
    if (!userId) return false;
    if (isMock) {
      return MockDb.hasLiked(postId, userId);
    }
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
    return data.length > 0;
  },

  async toggleLike(postId, userId) {
    if (isMock) {
      return MockDb.toggleLike(postId, userId);
    }
    
    // Check if liked already
    const liked = await this.hasLiked(postId, userId);
    if (liked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;
      return false; // unliked
    } else {
      const { error } = await supabase
        .from('likes')
        .insert([{ post_id: postId, user_id: userId }]);
      if (error) throw error;
      return true; // liked
    }
  },

  // --- GUESTBOOK ---
  async getGuestbook() {
    if (isMock) {
      return MockDb.getGuestbook();
    }
    const { data, error } = await supabase
      .from('guestbook')
      .select(`
        id,
        user_id,
        content,
        created_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      content: item.content,
      created_at: item.created_at,
      display_name: item.profiles?.display_name || '訪客',
      avatar_url: item.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
    }));
  },

  async addGuestbook(user, content) {
    if (isMock) {
      return MockDb.addGuestbook(user, content);
    }
    const { data, error } = await supabase
      .from('guestbook')
      .insert([
        {
          user_id: user.id,
          content: content,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();
    if (error) throw error;
    
    return {
      ...data,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    };
  },

  async deleteGuestbook(entryId) {
    if (isMock) {
      return MockDb.deleteGuestbook(entryId);
    }
    const { error } = await supabase
      .from('guestbook')
      .delete()
      .eq('id', entryId);
    if (error) throw error;
    return true;
  },

  async getPendingCommentsCount() {
    if (isMock) {
      const comments = MockDb.getStorageItem("mock_comments", []);
      const guestbook = MockDb.getStorageItem("mock_guestbook", []);
      const pendingComments = comments.filter(c => !c.summarized && c.user_id !== "user-mock-admin").length;
      const pendingGuestbook = guestbook.filter(g => !g.summarized && g.user_id !== "user-mock-admin").length;
      return pendingComments + pendingGuestbook;
    }
    
    const { count: commentsCount, error: commentsError } = await supabase
      .from('comments')
      .select('*, profiles!inner(role)', { count: 'exact', head: true })
      .eq('summarized', false)
      .neq('profiles.role', 'admin');
    if (commentsError) throw commentsError;

    const { count: guestbookCount, error: guestbookError } = await supabase
      .from('guestbook')
      .select('*, profiles!inner(role)', { count: 'exact', head: true })
      .eq('summarized', false)
      .neq('profiles.role', 'admin');
    if (guestbookError) throw guestbookError;

    return (commentsCount || 0) + (guestbookCount || 0);
  },

  async triggerAiSummary() {
    if (isMock) {
      const comments = MockDb.getStorageItem("mock_comments", []);
      const guestbook = MockDb.getStorageItem("mock_guestbook", []);
      
      const pendingCount = comments.filter(c => !c.summarized && c.user_id !== "user-mock-admin").length
        + guestbook.filter(g => !g.summarized && g.user_id !== "user-mock-admin").length;

      const updatedComments = comments.map(c => ({ ...c, summarized: true }));
      const updatedGuestbook = guestbook.map(g => ({ ...g, summarized: true }));
      
      MockDb.setStorageItem("mock_comments", updatedComments);
      MockDb.setStorageItem("mock_guestbook", updatedGuestbook);
      
      return {
        success: true,
        message: `【Mock 模式模擬】AI 留言彙整成功！共彙整了 ${pendingCount} 則新留言。`,
        count: pendingCount
      };
    }

    const response = await fetch('/api/cron/summarize', {
      method: 'POST'
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "發送請求失敗");
    }
    return data;
  },

  // --- SUGGESTIONS ---
  async getSuggestions() {
    if (isMock) {
      return MockDb.getSuggestions();
    }
    const { data, error } = await supabase
      .from('suggestions')
      .select(`
        id,
        user_id,
        title,
        category,
        content,
        page_url,
        admin_marker,
        created_at,
        updated_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      title: item.title,
      category: item.category,
      content: item.content,
      page_url: item.page_url,
      admin_marker: item.admin_marker,
      created_at: item.created_at,
      updated_at: item.updated_at,
      display_name: item.profiles?.display_name || '使用者',
      avatar_url: item.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
    }));
  },

  async addSuggestion(user, suggestion) {
    if (isMock) {
      return MockDb.addSuggestion(user, suggestion);
    }
    const { data, error } = await supabase
      .from('suggestions')
      .insert([
        {
          user_id: user.id,
          title: suggestion.title,
          category: suggestion.category || 'feature',
          content: suggestion.content,
          page_url: suggestion.page_url || null,
          admin_marker: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select(`
        id,
        user_id,
        title,
        category,
        content,
        page_url,
        admin_marker,
        created_at,
        updated_at
      `)
      .single();
    if (error) throw error;

    return {
      ...data,
      display_name: user.display_name,
      avatar_url: user.avatar_url
    };
  },

  async updateSuggestionMarker(suggestionId, marker) {
    if (isMock) {
      return MockDb.updateSuggestionMarker(suggestionId, marker);
    }
    const { data, error } = await supabase
      .from('suggestions')
      .update({
        admin_marker: marker,
        updated_at: new Date().toISOString()
      })
      .eq('id', suggestionId)
      .select(`
        id,
        user_id,
        title,
        category,
        content,
        page_url,
        admin_marker,
        created_at,
        updated_at,
        profiles (
          display_name,
          avatar_url
        )
      `)
      .single();
    if (error) throw error;

    return {
      id: data.id,
      user_id: data.user_id,
      title: data.title,
      category: data.category,
      content: data.content,
      page_url: data.page_url,
      admin_marker: data.admin_marker,
      created_at: data.created_at,
      updated_at: data.updated_at,
      display_name: data.profiles?.display_name || '使用者',
      avatar_url: data.profiles?.avatar_url || 'https://api.dicebear.com/7.x/adventurer/svg',
    };
  }
};
