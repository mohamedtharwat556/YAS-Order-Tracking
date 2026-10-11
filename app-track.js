(() => {
  const fmtDate = d => new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
  const fmtTime = d => new Date(d).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusIndex = s => ['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'].indexOf(s);

  let orders = [];
  async function loadOrders() {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error loading orders:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return;
    }
    orders = data || [];
  }
  
  const $ = s => document.querySelector(s);
  
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){const statusClass={'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};return `<span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span>`;}
  
  function showTracking(o){
    const result=$('#tracking-result'),idx=statusIndex(o.status);
    const stepNames=['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'];
    result.classList.remove('hidden');
    result.innerHTML=`<div class="tracking-result-head"><div><h3>طلبك ${esc(o.id)}</h3><p>آخر تحديث للحالة: ${fmtDate(o.history?.at(-1)?.at||o.receivedat)} · ${fmtTime(o.history?.at(-1)?.at||o.receivedat)}</p></div>${statusBadge(o.status)}</div>
    <div class="timeline">${stepNames.map((s,i)=>{const complete=idx>=i&&o.status!=='تعذر التسليم',current=idx===i;return `<div class="timeline-step ${complete?'complete':''} ${current?'current':''}"><div class="timeline-dot">${complete?(i<idx?'✓':i+1):i+1}</div><b>${s}</b></div>`;}).join('')}</div>
    ${o.status==='تعذر التسليم'?'<p class="danger">تعذر تسليم الطلب. برجاء التواصل مع فريق خدمة العملاء.</p>':''}
    <div class="tracking-details"><div><small>الجهاز</small><b>${esc(o.devicetype)} · ${esc(o.brand)}</b></div><div><small>طريقة الدفع</small><b>${esc(o.paymentmethod)}</b></div><div><small>تاريخ الطلب</small><b>${fmtDate(o.receivedat)}</b></div><div><small>العنوان</small><b>${esc(o.address)}</b></div><div><small>السائق</small><b>${esc(o.driver||'سيتم تحديده')}</b></div><div><small>آخر موقع مُسجل</small><b>${o.location?`${esc(o.location.lat)}, ${esc(o.location.lng)}`:'لا يوجد تحديث موقع حتى الآن'}</b></div></div>
    ${o.location?`<p class="muted">آخر تحديث يدوي لموقع السائق: ${fmtTime(o.location.at)} · <a target="_blank" rel="noopener" href="https://maps.google.com/?q=${encodeURIComponent(o.location.lat+','+o.location.lng)}">عرض الموقع على الخريطة</a></p>`:''}`;
  }
  
  // Check if order ID is in URL query
  const params = new URLSearchParams(window.location.search);
  const orderFromUrl = params.get('order');
  if(orderFromUrl){
    $('#order-input').value = orderFromUrl;
  }
  
  $('#tracking-form').addEventListener('submit',async e=>{
    e.preventDefault();
    await loadOrders();
    const d=Object.fromEntries(new FormData(e.currentTarget).entries());
    const o=orders.find(x=>x.id.trim().toLowerCase()===d.orderId.trim().toLowerCase()&&x.phone.replace(/\D/g,'')===d.phone.replace(/\D/g,''));
    if(!o){
      $('#tracking-result').classList.add('hidden');
      toast('لم نتمكن من العثور على الطلب. راجع رقم الطلب والهاتف.');
      return;
    }
    showTracking(o);
  });
})();
