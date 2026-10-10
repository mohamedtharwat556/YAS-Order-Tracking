'use client';

import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    // Load the sales app script when component mounts
    const script = document.createElement('script');
    script.src = '/js/app-sales.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark">Y</span><span><b>YAS</b><small>Order & Delivery</small></span></a>
        <div className="nav-label">قسم المبيعات</div>
        <button className="nav-item active" data-view="sales"><span>▦</span> لوحة الطلبات</button>
        <button className="nav-item" data-view="new-order"><span>＋</span> إنشاء طلب جديد</button>
        <div className="sidebar-bottom"><div className="avatar">م</div><div><b>محمد ثروت</b><small>Sales · نسخة تجريبية</small></div></div>
      </aside>
      <main className="main">
        <header className="topbar"><div><div className="eyebrow">YAS / OPERATIONS</div><h1 id="page-title">لوحة إدارة الطلبات</h1></div><div className="top-actions"><span className="today" id="today"></span><span className="avatar">م</span></div></header>
        <section className="view active" id="view-sales">
          <div className="welcome-row"><div><h2>أهلًا بيك 👋</h2><p>تابع الطلبات وحالة التوصيل من مكان واحد.</p></div><button className="btn primary" data-go="new-order">＋ إنشاء طلب جديد</button></div>
          <div className="stats">
            <article className="stat-card"><div className="stat-top"><span>إجمالي الطلبات</span><span className="stat-icon blue">▤</span></div><strong id="stat-total">0</strong><small>كل الطلبات المسجلة</small></article>
            <article className="stat-card"><div className="stat-top"><span>تم طلبه</span><span className="stat-icon gray">◷</span></div><strong id="stat-new">0</strong><small>في انتظار التجهيز</small></article>
            <article className="stat-card"><div className="stat-top"><span>خرج للتوصيل</span><span className="stat-icon orange">➜</span></div><strong id="stat-out">0</strong><small>مع السائق حاليًا</small></article>
            <article className="stat-card"><div className="stat-top"><span>تم التوصيل</span><span className="stat-icon green">✓</span></div><strong id="stat-done">0</strong><small>طلبات تم تسليمها</small></article>
          </div>
        </section>
      </main>
      <div className="toast" id="toast" role="status"></div>
    </div>
  );
}
