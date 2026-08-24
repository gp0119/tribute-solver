import type { Metadata, Viewport } from 'next';
import './globals.css';

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;
const socialImage = metadataBase ? new URL('/og.png', metadataBase) : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: '奉纳符推演器',
  description: '离线推断能力勋章奉纳符的四种宝石排列。',
  openGraph: {
    title: '奉纳符推演器',
    description: '输入每行结果，推断四种宝石的正确排列。',
    images: socialImage ? [{ url: socialImage }] : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title: '奉纳符推演器',
    description: '输入每行结果，推断四种宝石的正确排列。',
    images: socialImage ? [socialImage] : undefined,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
