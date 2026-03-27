import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '港股模拟交易系统',
  description: '高仿真的港股模拟交易系统',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-xl font-bold text-primary">港股模拟交易</h1>
              <nav className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-primary transition-colors">仪表盘</Link>
                <Link href="/market" className="text-gray-600 hover:text-primary transition-colors">行情中心</Link>
                <Link href="/trading" className="text-gray-600 hover:text-primary transition-colors">交易大厅</Link>
                <Link href="/portfolio" className="text-gray-600 hover:text-primary transition-colors">我的持仓</Link>
              </nav>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                U
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-6">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 港股模拟交易系统. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}