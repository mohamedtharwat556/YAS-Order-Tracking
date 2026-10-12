(() => {
  const fmtDate = d => new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
  const fmtTime = d => new Date(d).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusIndex = s => ['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'].indexOf(s);

  // Function to show image in modal
  window.showImageModal = function(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;cursor:pointer;';
    modal.innerHTML = `<img src="${imageUrl}" style="max-width:90%;max-height:90%;object-fit:contain;">`;
    modal.onclick = () => modal.remove();
    document.body.appendChild(modal);
  };

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
    // Normalize data from lowercase to camelCase for display
    orders = (data || []).map(o => ({
      ...o,
      mapLink: o.maplink || o.mapLink,
      deviceType: o.devicetype || o.deviceType,
      paymentMethod: o.paymentmethod || o.paymentMethod,
      paymentStatus: o.paymentstatus || o.paymentStatus,
      receivedAt: o.receivedat || o.receivedAt,
      deliveryPhoto: o.deliveryphoto || o.deliveryPhoto
    }));
  }
  
  const $ = s => document.querySelector(s);
  
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){const statusClass={'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};const carPositions={'تم طلبه':'0%','تم الشحن':'25%','خرج للتوصيل':'50%','تم التوصيل':'75%','تعذر التسليم':'100%'};return `<div class="status-container"><span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span><div class="status-track"><div class="status-car" style="left: ${carPositions[status]||'0%'}"></div></div></div>`;}
  
  function showTracking(o){
    const result=$('#tracking-result'),idx=statusIndex(o.status);
    const stepNames=['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'];
    result.classList.remove('hidden');
    result.innerHTML=`<div class="tracking-result-head"><div><h3>طلبك ${esc(o.id)}</h3><p>آخر تحديث للحالة: ${fmtDate(o.history?.at(-1)?.at||o.receivedat)} · ${fmtTime(o.history?.at(-1)?.at||o.receivedat)}</p></div>${statusBadge(o.status)}</div>
    <div class="timeline">${stepNames.map((s,i)=>{const complete=idx>=i&&o.status!=='تعذر التسليم',current=idx===i;return `<div class="timeline-step ${complete?'complete':''} ${current?'current':''}"><div class="timeline-dot">${complete?(i<idx?'✓':i+1):i+1}</div><b>${s}</b></div>`;}).join('')}</div>
    ${o.status==='تعذر التسليم'?'<p class="danger">تعذر تسليم الطلب. برجاء التواصل مع فريق خدمة العملاء.</p>':''}
    <div class="tracking-details"><div><small>الجهاز</small><b>${esc(o.devicetype)} · ${esc(o.brand)}</b></div><div><small>طريقة الدفع</small><b>${esc(o.paymentmethod)}</b></div><div><small>تاريخ الطلب</small><b>${fmtDate(o.receivedat)}</b></div><div><small>العنوان</small><b>${esc(o.address)}</b></div><div><small>السائق</small><b>${esc(o.driver||'سيتم تحديده')}</b></div><div><small>آخر موقع مُسجل</small><b>${o.location?`${esc(o.location.lat)}, ${esc(o.location.lng)}`:'لا يوجد تحديث موقع حتى الآن'}</b></div></div>
    ${o.location?`<p class="muted">آخر تحديث يدوي لموقع السائق: ${fmtTime(o.location.at)} · <a target="_blank" rel="noopener" href="https://maps.google.com/?q=${encodeURIComponent(o.location.lat+','+o.location.lng)}">عرض الموقع على الخريطة</a></p>`:''}
    ${o.deliveryPhoto||o.signature?`<div class="delivery-proof"><h3>دليل التسليم</h3>${o.deliveryPhoto?`<div><small>صورة التسليم</small><br><img src="${o.deliveryPhoto}" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:5px;cursor:pointer;" onclick="showImageModal('${o.deliveryPhoto}')"></div>`:''}${o.signature?`<div style="margin-top:10px;"><small>توقيع العميل</small><br><img src="${o.signature}" style="max-width:200px;max-height:200px;border-radius:8px;margin-top:5px;cursor:pointer;" onclick="showImageModal('${o.signature}')"></div>`:''}</div>`:''}`;
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
    const form = e.target;
    const d=Object.fromEntries(new FormData(form).entries());
    const o=orders.find(x=>x.id.trim().toLowerCase()===d.orderId.trim().toLowerCase()&&x.phone.replace(/\D/g,'')===d.phone.replace(/\D/g,''));
    if(!o){
      $('#tracking-result').classList.add('hidden');
      toast('لم نتمكن من العثور على الطلب. راجع رقم الطلب والهاتف.');
      return;
    }
    showTracking(o);
  });
})();
