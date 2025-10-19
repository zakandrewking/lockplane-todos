import './globals.css'

export const metadata = {
  title: 'Lockplane Todos',
  description: 'Stay organized, get things done',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
