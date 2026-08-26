import type { Metadata, Viewport } from 'next'
import './globals.css'

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined
const socialImage = metadataBase ? new URL('/og.png', metadataBase) : undefined

export const metadata: Metadata = {
  metadataBase,
  title: '奉纳符推演器',
  description: '离线推断能力勋章奉纳符的四种宝石排列。',
  icons: {
    icon: '/tribute-symbol.png',
  },
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
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='zh-CN' className='max-w-full overflow-x-hidden'>
      <body className="m-0 min-w-80 overflow-x-hidden font-['Microsoft_YaHei_UI','Microsoft_YaHei',system-ui,sans-serif] text-[#35271d] [background:radial-gradient(ellipse_at_50%_-18%,rgb(255_255_255/0.62),transparent_46rem),radial-gradient(circle_at_8%_19%,rgb(157_99_42/0.18),transparent_22rem),radial-gradient(circle_at_93%_68%,rgb(123_70_27/0.13),transparent_26rem),repeating-linear-gradient(0deg,rgb(83_46_18/0.027)_0_1px,transparent_1px_5px),repeating-linear-gradient(90deg,rgb(255_255_255/0.05)_0_2px,transparent_2px_7px),#e8cf9e]">
        {children}
      </body>
    </html>
  )
}
