(() => {
  const today = new Date();
  const fmtDate = d => new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
  const fmtTime = d => new Date(d).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

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
    renderSales();
  }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){const statusClass={'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};return `<span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span>`;}
  function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const titles={sales:'لوحة إدارة الطلبات','new-order':'إنشاء طلب جديد'};$('#page-title').textContent=titles[view]||'YAS';if(view==='sales')renderSales();if(view==='new-order')setReceivedAt();}
  function setReceivedAt(){const el=$('#received-at');if(el&&!el.value){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());el.value=d.toISOString().slice(0,16);}}
  function renderSales(){
    $('#stat-total').textContent=orders.length;
    $('#stat-new').textContent=orders.filter(o=>o.status==='تم طلبه').length;
    $('#stat-out').textContent=orders.filter(o=>o.status==='خرج للتوصيل').length;
    $('#stat-done').textContent=orders.filter(o=>o.status==='تم التوصيل').length;
    const q=($('#order-search').value||'').trim().toLowerCase(),f=$('#status-filter').value;
    const filtered=orders.filter(o=>(!f||o.status===f)&&[o.id,o.customer,o.phone,o.brand].some(v=>String(v||'').toLowerCase().includes(q)));
    $('#orders-table').innerHTML=filtered.map(o=>{
      const trackUrl=`${window.location.origin}/track.html?order=${o.id}`;
      return `<tr><td><span class="order-code">${esc(o.id)}</span></td><td><span class="customer-name">${esc(o.customer)}</span><span class="subtext">${esc(o.phone)}</span></td><td>${esc(o.devicetype)}<span class="subtext">${esc(o.brand)}</span></td><td>${esc(o.paymentmethod)}<span class="subtext">${esc(o.paymentstatus)}</span></td><td>${esc(o.driver||'غير محدد')}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.receivedat)}<span class="subtext">${fmtTime(o.receivedat)}</span></td><td><button class="icon-btn" data-copy-link="${trackUrl}" title="نسخ رابط التتبع">📋</button></td></tr>`;
    }).join('');
    $('#orders-empty').classList.toggle('hidden',filtered.length>0);
  }
  
  $('#today').textContent=today.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  $('#order-search').addEventListener('input',renderSales);
  $('#status-filter').addEventListener('change',renderSales);
  
  $('#orders-table').addEventListener('click',e=>{
    const b=e.target.closest('[data-copy-link]');
    if(b){
      const link=b.dataset.copyLink;
      navigator.clipboard.writeText(link).then(()=>toast('تم نسخ رابط التتبع ✓')).catch(()=>toast('خطأ في النسخ'));
    }
  });
  
  $('#order-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());
    const day=new Date(data.receivedAt||Date.now()).toISOString().slice(0,10).replaceAll('-','');
    const count=String(orders.filter(o=>o.id&&o.id.startsWith('YAS-'+day)).length+1).padStart(3,'0');

    const o={
      id:`YAS-${day}-${count}`,
      customer: data.customer,
      phone: data.phone,
      address: data.address,
      maplink: data.mapLink || null,
      devicetype: data.deviceType,
      brand: data.brand,
      quantity: parseInt(data.quantity) || 1,
      amount: data.amount,
      details: data.details,
      paymentmethod: data.paymentMethod,
      paymentstatus: data.paymentStatus,
      driver: data.driver,
      receivedat: data.receivedAt,
      notes: data.notes,
      status:'تم طلبه',
      history:[{status:'تم طلبه',at:new Date().toISOString()}],
      location:null
    };

    const { error } = await supabaseClient.from('orders').insert([o]);
    if (error) {
      console.error('Error creating order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast('حدث خطأ أثناء حفظ الطلب: ' + error.message);
      return;
    }

    form.reset();
    setReceivedAt();
    await loadOrders();
    go('sales');
    toast(`تم تسجيل الطلب بنجاح · ${o.id}`);
  });

  loadOrders();
  setReceivedAt();
})();
