'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function Home() {
  useEffect(() => {
    // Load the sales app script when component mounts
    const script = document.createElement('script');
    script.src = '/css/app-sales.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{
        __html: `
          <html lang="ar" dir="rtl">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>YAS | إدارة الطلبات والتوصيل</title>
            <link rel="stylesheet" href="/css/style.css">
          </head>
          <body class="app-shell">
            <aside class="sidebar">
              <a class="brand" href="#"><span class="brand-mark">Y</span><span><b>YAS</b><small>Order & Delivery</small></span></a>
              <div class="nav-label">قسم المبيعات</div>
              <button class="nav-item active" data-view="sales"><span>▦</span> لوحة الطلبات</button>
              <button class="nav-item" data-view="new-order"><span>＋</span> إنشاء طلب جديد</button>
              <div class="sidebar-bottom"><div class="avatar">م</div><div><b>محمد ثروت</b><small>Sales · نسخة تجريبية</small></div></div>
            </aside>
            <main class="main">
              <header class="topbar"><div><div class="eyebrow">YAS / OPERATIONS</div><h1 id="page-title">لوحة إدارة الطلبات</h1></div><div class="top-actions"><span class="today" id="today"></span><span class="avatar">م</span></div></header>
              <section class="view active" id="view-sales">
                <div class="welcome-row"><div><h2>أهلًا بيك 👋</h2><p>تابع الطلبات وحالة التوصيل من مكان واحد.</p></div><button class="btn primary" data-go="new-order">＋ إنشاء طلب جديد</button></div>
                <div class="stats">
                  <article class="stat-card"><div class="stat-top"><span>إجمالي الطلبات</span><span class="stat-icon blue">▤</span></div><strong id="stat-total">0</strong><small>كل الطلبات المسجلة</small></article>
                  <article class="stat-card"><div class="stat-top"><span>تم طلبه</span><span class="stat-icon gray">◷</span></div><strong id="stat-new">0</strong><small>في انتظار التجهيز</small></article>
                  <article class="stat-card"><div class="stat-top"><span>خرج للتوصيل</span><span class="stat-icon orange">➜</span></div><strong id="stat-out">0</strong><small>مع السائق حاليًا</small></article>
                  <article class="stat-card"><div class="stat-top"><span>تم التوصيل</span><span class="stat-icon green">✓</span></div><strong id="stat-done">0</strong><small>طلبات تم تسليمها</small></article>
                </div>
              </section>
            </main>
            <div class="toast" id="toast" role="status"></div>
          </body>
          </html>
        `
      }} />
      <Script src="/css/app-sales.js" strategy="lazyOnload" />
    </>
  );
}
