import './globals.css'

export const metadata = {
  title: 'SanafISP.net',
  description: 'High-speed fiber internet in your area',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}