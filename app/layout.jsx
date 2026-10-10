import './globals.css'

export const metadata = {
  title: 'YAS | إدارة الطلبات والتوصيل',
  description: 'نظام إدارة الطلبات والتوصيل',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
      </body>
    </html>
  )
}
