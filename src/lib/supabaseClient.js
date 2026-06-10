import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;
let isMock = false;

// Check if keys are placeholders or missing
if (
  !supabaseUrl || 
  !supabaseAnonKey || 
  supabaseUrl.includes('your-supabase-project') || 
  supabaseAnonKey.includes('your-supabase-anon-key-placeholder')
) {
  isMock = true;
  console.warn("Supabase 憑證為預設佔位符，系統將以 Mock 模式（LocalStorage 模擬資料庫）運行。");
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("無法初始化 Supabase 客戶端，將降級為 Mock 模式運行：", error);
    isMock = true;
  }
}

export { supabase, isMock };
