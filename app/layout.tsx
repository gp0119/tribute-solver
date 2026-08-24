import type { Metadata, Viewport } from 'next';
import './globals.css';

const metadataBase = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tribute-solver-20260824.ganpeng0119.chatgpt.site',
);

export const metadata: Metadata = {
  metadataBase,
  title: '奉纳符推演器',
  description: '离线推断能力勋章奉纳符的四种宝石排列。',
  openGraph: {
    title: '奉纳符推演器',
    description: '输入每行结果，推断四种宝石的正确排列。',
    images: [{ url: '/og.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '奉纳符推演器',
    description: '输入每行结果，推断四种宝石的正确排列。',
    images: ['/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
