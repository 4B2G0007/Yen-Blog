import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Yen Blog",
  description: "精緻奢華的個人部落格系統，支援 Google 登入、按讚、文章留言與獨立訪客留言板功能。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="page-wrapper container animate-fade-in">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
