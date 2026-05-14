import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Este é um blog com Next.js',
  description: 'Descrição do Site em si.',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html lang="en">
      <body className="flex min-h-full flex-col">
        <header>
          <h1>Este é um blog com Next.js</h1>
        </header>
        {children}
        <footer>
          <p>Footer</p>
        </footer>
      </body>
    </html>
  )
}
