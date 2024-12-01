import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'
import Head from 'next/head'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Преподаватели ВКИ',
  description:
    'Посмотри что думают окружающие о ваших любимых преподавателях и выскажите своё мнение сами',
  keywords: 'преподаватели, ВКИ, мнения, отзывы, оценки, университет',
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0d1117',
  openGraph: {
    title: 'Преподаватели ВКИ',
    description:
      'Посмотри что думают окружающие о ваших любимых преподавателях и выскажите своё мнение сами',
    url: 'https://your-site-url.com', //NEEEEEEEEEEED
    siteName: 'ВКИ',
    locale: 'ru_RU',
    type: 'website',
  },
  twitter: {
    title: 'Преподаватели ВКИ',
    description:
      'Посмотри что думают окружающие о ваших любимых преподавателях и выскажите своё мнение сами',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <Head>
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
