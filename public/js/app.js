(() => {
  const STORE = 'yas_orders_frontend_v1';
  const statuses = ['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'];
  const statusClass = {'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};
  const statusIndex = s => statuses.indexOf(s);
  const today = new Date();
  const fmtDate = d => new Date(d).toLocaleDateString('ar-EG',{year:'numeric',month:'2-digit',day:'2-digit'});
  const fmtTime = d => new Date(d).toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'});
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const initial = [
    {id:'YAS-20261010-001',customer:'أحمد محمد',phone:'01012345678',address:'المنصورة، شارع الجيش، بجوار البنك',mapLink:'',deviceType:'لابتوب',brand:'Dell Latitude',quantity:1,amount:'18500',details:'لابتوب Dell Latitude',paymentMethod:'كاش',paymentStatus:'مدفوع',driver:'أحمد حسن',receivedAt:new Date().toISOString(),status:'تم التوصيل',notes:'الاتصال قبل الوصول',history:[],location:null},
    {id:'YAS-20261010-002',customer:'سارة أحمد',phone:'01098765432',address:'دمياط الجديدة، الحي الأول',mapLink:'',deviceType:'لابتوب',brand:'Lenovo ThinkPad',quantity:1,amount:'23000',details:'Lenovo ThinkPad',paymentMethod:'عند الاستلام',paymentStatus:'غير مدفوع',driver:'أحمد حسن',receivedAt:new Date().toISOString(),status:'خرج للتوصيل',notes:'',history:[],location:null},
    {id:'YAS-20261010-003',customer:'خالد محمود',phone:'01122334455',address:'القاهرة، مدينة نصر',mapLink:'',deviceType:'شاشة تفاعلية',brand:'Hikvision 65 inch',quantity:1,amount:'42000',details:'شاشة تفاعلية',paymentMethod:'تحويل بنكي',paymentStatus:'مدفوع',driver:'محمود علي',receivedAt:new Date().toISOString(),status:'تم الشحن',notes:'',history:[],location:null}
  ];
  let orders;
  try { const saved = localStorage.getItem(STORE); orders = saved ? JSON.parse(saved) : initial; } catch { orders = initial; }
  const save = () => localStorage.setItem(STORE,JSON.stringify(orders));
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){return `<span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span>`;}
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
      return `<tr><td><span class="order-code">${esc(o.id)}</span></td><td><span class="customer-name">${esc(o.customer)}</span><span class="subtext">${esc(o.phone)}</span></td><td>${esc(o.deviceType)}<span class="subtext">${esc(o.brand)}</span></td><td>${esc(o.paymentMethod)}<span class="subtext">${esc(o.paymentStatus)}</span></td><td>${esc(o.driver||'غير محدد')}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.receivedAt)}<span class="subtext">${fmtTime(o.receivedAt)}</span></td><td><button class="icon-btn" data-copy-link="${trackUrl}" title="نسخ رابط التتبع">📋</button></td></tr>`;
    }).join('');
    $('#orders-empty').classList.toggle('hidden',filtered.length>0);
  }
  function renderDriver(){
    const list=orders.filter(o=>o.driver);
    $('#driver-orders').innerHTML=list.length?list.map(o=>`<article class="driver-card"><div class="driver-card-top"><div><span class="order-code">${esc(o.id)}</span><h3>${esc(o.customer)}</h3><p>${esc(o.deviceType)} · ${esc(o.brand)}</p></div>${statusBadge(o.status)}</div><div class="driver-meta"><span>☎ ${esc(o.phone)}</span><span>⌖ ${esc(o.address)}</span><span>الدفع: ${esc(o.paymentMethod)}</span></div><div class="driver-actions"><select data-status-for="${esc(o.id)}" aria-label="تغيير الحالة">${['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل','تعذر التسليم'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn primary" data-update-status="${esc(o.id)}">تحديث الحالة</button>${o.mapLink?`<a class="btn secondary" href="${esc(o.mapLink)}" target="_blank" rel="noopener">فتح الخريطة</a>`:`<button class="btn secondary" data-address="${esc(o.id)}">عرض العنوان</button>`}</div><p class="subtext">آخر موقع للسائق: ${o.location?`${esc(o.location.lat)}, ${esc(o.location.lng)} · ${fmtTime(o.location.at)}`:'لم يتم تسجيل موقع بعد'}</p></article>`).join(''):'<div class="panel">لا توجد طلبات مسندة لسائق حتى الآن.</div>';
  }
  $('#today').textContent=today.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  $('#order-search').addEventListener('input',renderSales);$('#status-filter').addEventListener('change',renderSales);
  $('#orders-table').addEventListener('click',e=>{const b=e.target.closest('[data-copy-link]');if(b){const link=b.dataset.copyLink;navigator.clipboard.writeText(link).then(()=>toast('تم نسخ رابط التتبع ✓')).catch(()=>toast('خطأ في النسخ'));}});
  $('#order-form').addEventListener('submit',e=>{
    e.preventDefault();const form=e.currentTarget;if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form).entries());
    const day=new Date(data.receivedAt||Date.now()).toISOString().slice(0,10).replaceAll('-','');
    const count=String(orders.filter(o=>o.id.startsWith('YAS-'+day)).length+1).padStart(3,'0');
    const o={...data,id:`YAS-${day}-${count}`,status:'تم طلبه',history:[{status:'تم طلبه',at:new Date().toISOString()}],location:null};
    orders.unshift(o);save();form.reset();setReceivedAt();renderSales();go('sales');toast(`تم تسجيل الطلب بنجاح · ${o.id}`);
  });
  $('#driver-orders').addEventListener('click',e=>{
    const b=e.target.closest('[data-update-status]');if(b){const id=b.dataset.updateStatus,o=orders.find(x=>x.id===id),sel=$(`[data-status-for="${CSS.escape(id)}"]`);if(!o||!sel)return;o.status=sel.value;o.history=o.history||[];o.history.push({status:o.status,at:new Date().toISOString()});save();renderDriver();renderSales();toast('تم تحديث حالة الطلب');return;}
    const a=e.target.closest('[data-address]');if(a){const o=orders.find(x=>x.id===a.dataset.address);if(o)toast(o.address);}
  });
  $('#update-location').addEventListener('click',()=>{
    const output=$('#location-result');
    if(!navigator.geolocation){output.textContent='المتصفح لا يدعم تحديد الموقع.';toast('ميزة الموقع غير مدعومة');return;}
    output.textContent='جاري طلب إذن الموقع...';
    navigator.geolocation.getCurrentPosition(pos=>{
      const loc={lat:pos.coords.latitude.toFixed(5),lng:pos.coords.longitude.toFixed(5),at:new Date().toISOString()};
      orders.filter(o=>o.driver).forEach(o=>{o.location=loc;});save();
      output.textContent=`آخر تحديث: ${loc.lat}, ${loc.lng} · ${fmtTime(loc.at)}`;
      renderDriver();toast('تم تسجيل الموقع على الطلبات المسندة في هذا المتصفح');
    },err=>{output.textContent=err.code===1?'لم تسمح بالوصول للموقع. فعّل إذن الموقع وحاول تاني.':'تعذر تحديد الموقع. تأكد من إعدادات الجهاز والاتصال.';},{enableHighAccuracy:true,timeout:12000});
  });
  function showTracking(o){
    const result=$('#tracking-result'),idx=statusIndex(o.status);
    const stepNames=['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل'];
    result.classList.remove('hidden');
    result.innerHTML=`<div class="tracking-result-head"><div><h3>طلبك ${esc(o.id)}</h3><p>آخر تحديث للحالة: ${fmtDate(o.history?.at(-1)?.at||o.receivedAt)} · ${fmtTime(o.history?.at(-1)?.at||o.receivedAt)}</p></div>${statusBadge(o.status)}</div>
    <div class="timeline">${stepNames.map((s,i)=>{const complete=idx>=i&&o.status!=='تعذر التسليم',current=idx===i;return `<div class="timeline-step ${complete?'complete':''} ${current?'current':''}"><div class="timeline-dot">${complete?(i<idx?'✓':i+1):i+1}</div><b>${s}</b></div>`;}).join('')}</div>
    ${o.status==='تعذر التسليم'?'<p class="danger">تعذر تسليم الطلب. برجاء التواصل مع فريق خدمة العملاء.</p>':''}
    <div class="tracking-details"><div><small>الجهاز</small><b>${esc(o.deviceType)} · ${esc(o.brand)}</b></div><div><small>طريقة الدفع</small><b>${esc(o.paymentMethod)}</b></div><div><small>تاريخ الطلب</small><b>${fmtDate(o.receivedAt)}</b></div><div><small>العنوان</small><b>${esc(o.address)}</b></div><div><small>السائق</small><b>${esc(o.driver||'سيتم تحديده')}</b></div><div><small>آخر موقع مُسجل</small><b>${o.location?`${esc(o.location.lat)}, ${esc(o.location.lng)}`:'لا يوجد تحديث موقع حتى الآن'}</b></div></div>
    ${o.location?`<p class="muted">آخر تحديث يدوي لموقع السائق: ${fmtTime(o.location.at)} · <a target="_blank" rel="noopener" href="https://maps.google.com/?q=${encodeURIComponent(o.location.lat+','+o.location.lng)}">عرض الموقع على الخريطة</a></p>`:''}`;
  }
  $('#tracking-form').addEventListener('submit',e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget).entries());const o=orders.find(x=>x.id.trim().toLowerCase()===d.orderId.trim().toLowerCase()&&x.phone.replace(/\D/g,'')===d.phone.replace(/\D/g,''));if(!o){$('#tracking-result').classList.add('hidden');toast('لم نتمكن من العثور على الطلب. راجع رقم الطلب والهاتف.');return;}showTracking(o);});
  // Demo seed records are local to this browser; new orders are retained with localStorage.
  save();setReceivedAt();renderSales();
})();