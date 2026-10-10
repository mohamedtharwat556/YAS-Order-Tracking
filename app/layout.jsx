import './globals.css'

export const metadata = {
  title: 'YAS | إدارة الطلبات والتوصيل',
  description: 'نظام إدارة الطلبات والتوصيل',
  htmlLang: 'ar',
  dir: 'rtl',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
