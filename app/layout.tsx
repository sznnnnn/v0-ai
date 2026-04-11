import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { BuddyupLegacyStorageMigration } from '@/components/buddyup-legacy-storage-migration'
import { GlobalTestMenu } from '@/components/global-test-menu'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'BuddyUp - AI 驱动的个人陈述生成工具 | 内测中',
  description:
    'BuddyUp 内测中 - 基于大语言模型的 AI 个人陈述生成器，快速生成、编辑和管理多版本 PS，数据本地存储，保护隐私。本站含问卷·匹配·工作台可交互 Demo。',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <BuddyupLegacyStorageMigration />
        {children}
        <GlobalTestMenu />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
