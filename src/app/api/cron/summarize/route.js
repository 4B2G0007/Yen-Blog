import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import nodemailer from 'nodemailer';

// 建立獨立的 Server-side Supabase Client (繞過 RLS 的 Admin 權限，若有設定 service_role_key)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

export async function POST(req) {
  try {
    // 檢查 API 金鑰與配置是否存在
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "未配置 GEMINI_API_KEY 環境變數" }, { status: 500 });
    }
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: "未配置 SMTP 發信環境變數 (SMTP_HOST, SMTP_USER, SMTP_PASS)" }, { status: 500 });
    }

    // 1. 讀取所有未處理的文章留言 (comments where summarized = false)
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        profiles!inner ( display_name, email, role ),
        posts ( title )
      `)
      .eq('summarized', false)
      .neq('profiles.role', 'admin');

    if (commentsError) throw commentsError;

    // 2. 讀取所有未處理的訪客留言 (guestbook where summarized = false)
    const { data: guestbookEntries, error: guestbookError } = await supabaseAdmin
      .from('guestbook')
      .select(`
        id,
        content,
        created_at,
        profiles!inner ( display_name, email, role )
      `)
      .eq('summarized', false)
      .neq('profiles.role', 'admin');

    if (guestbookError) throw guestbookError;

    const totalNewComments = (comments?.length || 0) + (guestbookEntries?.length || 0);

    // 如果沒有任何新留言，則直接返回，不需發信
    if (totalNewComments === 0) {
      return NextResponse.json({ success: true, message: "沒有新留言需要彙整", count: 0 });
    }

    // 3. 整理留言數據結構準備給 Gemini
    const formattedComments = comments.map(c => ({
      type: '文章留言',
      post_title: c.posts?.title || '未知文章',
      author: c.profiles?.display_name || '讀者',
      content: c.content,
      time: c.created_at
    }));

    const formattedGuestbook = guestbookEntries.map(g => ({
      type: '訪客留言牆',
      author: g.profiles?.display_name || '訪客',
      content: g.content,
      time: g.created_at
    }));

    const allMessages = [...formattedComments, ...formattedGuestbook];

    // 4. 呼叫 Gemini API 進行彙整
    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `
你是一位專業的部落格 AI 彙整助手。以下是讀者在「Yen Blog」留下的最新未處理留言。
請幫我對這些留言進行彙整與分析，並撰寫一份給管理員的繁體中文 Email 總結報告。

報告需要包含以下結構：
1. **【數據總覽】**：列出本次彙整的留言總量，以及文章評論數與留言牆簽到數。
2. **【讀者回饋分析】**：按「文章主題」或「留言牆」進行分類歸納，總結讀者的回饋、正面評價或主要讨论內容。
3. **【待辦與回覆警示】**：如果留言中包含「錯誤回報」、「問題詢問」、「強烈建議」或「需要管理員回覆」的內容，請挑出來並提供建議的回覆方向。若無則寫「目前無急需回覆的留言」。

以下是未處理的留言列表（JSON 格式）：
${JSON.stringify(allMessages, null, 2)}

請使用精美、結構清晰的 Markdown 格式撰寫，文字要親切有條理。
`;

    const result = await model.generateContent(prompt);
    const aiSummaryMarkdown = result.response.text();

    // 將 Markdown 轉為簡單的 HTML 格式以便信件呈現
    const htmlBody = `
      <div style="background-color: #060913; color: #f3f4f6; font-family: sans-serif; padding: 2rem; border-radius: 16px; max-width: 700px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08);">
        <h2 style="color: #6366f1; border-bottom: 2px solid rgba(99, 102, 241, 0.2); padding-bottom: 0.5rem; margin-top: 0;">✨ Yen Blog AI 留言總結報告</h2>
        <p style="color: #9ca3af; font-size: 0.9rem;">系統已自動將最新積累的 <strong>${totalNewComments} 則新留言</strong> 發送給 Gemini 進行統整。以下是分析內容：</p>
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); padding: 1.5rem; border-radius: 12px; line-height: 1.6; font-size: 0.95rem; white-space: pre-line; color: #e5e7eb;">
          ${aiSummaryMarkdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)\n/g, '<h4 style="color: #a855f7; margin-top: 1.2rem; margin-bottom: 0.5rem;">$1</h4>').replace(/## (.*?)\n/g, '<h3 style="color: #6366f1; border-bottom: 1px dashed rgba(255,255,255,0.1); padding-bottom: 0.3rem; margin-top: 1.5rem;">$1</h3>')}
        </div>
        <p style="color: #6b7280; font-size: 0.8rem; text-align: center; margin-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1rem;">
          本信件由 Yen Blog 系統後台自動發送。若已處理完成，該批留言已被標記為已彙整。
        </p>
      </div>
    `;

    // 5. 透過 Nodemailer SMTP 發信給 Admin
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const adminEmail = '4b2g0007@stust.edu.tw'; // 預設管理員信箱

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'Yen Blog AI 助手'}" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `【Yen Blog】新增 ${totalNewComments} 則留言的 AI 總結報告`,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    // 6. 更新留言狀態，將其標記為已處理 (summarized = true)
    const commentIds = comments.map(c => c.id);
    const guestbookIds = guestbookEntries.map(g => g.id);

    if (commentIds.length > 0) {
      const { error: updateCommentsErr } = await supabaseAdmin
        .from('comments')
        .update({ summarized: true })
        .in('id', commentIds);
      if (updateCommentsErr) throw updateCommentsErr;
    }

    if (guestbookIds.length > 0) {
      const { error: updateGuestbookErr } = await supabaseAdmin
        .from('guestbook')
        .update({ summarized: true })
        .in('id', guestbookIds);
      if (updateGuestbookErr) throw updateGuestbookErr;
    }

    return NextResponse.json({
      success: true,
      message: "AI 總結完成並已成功寄送通知信！",
      count: totalNewComments
    });

  } catch (error) {
    console.error("AI 彙整發信失敗：", error);
    return NextResponse.json({ error: error.message || "伺服器內部錯誤" }, { status: 500 });
  }
}

// 支援 GET 方法，方便 Vercel Cron 等簡單定時排程服務打 API
export async function GET(req) {
  // 將 GET 請求重新轉發給 POST 邏輯處理
  return POST(req);
}
