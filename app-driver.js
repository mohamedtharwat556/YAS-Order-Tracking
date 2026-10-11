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
    renderDriver();
  }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){const statusClass={'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};return `<span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span>`;}
  
  function renderDriver(){
    const driverName = 'أحمد حسن'; // In Phase 2, this will come from auth
    const list=orders.filter(o=>o.driver === driverName);
    
    // Update stats
    $('#driver-total').textContent = list.length;
    $('#driver-pending').textContent = list.filter(o => ['تم طلبه', 'تم الشحن', 'خرج للتوصيل'].includes(o.status)).length;
    $('#driver-completed').textContent = list.filter(o => o.status === 'تم التوصيل').length;
    
    $('#driver-orders').innerHTML=list.length?list.map(o=>`<article class="driver-card"><div class="driver-card-top"><div><span class="order-code">${esc(o.id)}</span><h3>${esc(o.customer)}</h3><p>${esc(o.devicetype)} · ${esc(o.brand)}</p></div>${statusBadge(o.status)}</div><div class="driver-meta"><span>☎ ${esc(o.phone)}</span><span>⌖ ${esc(o.address)}</span><span>الدفع: ${esc(o.paymentmethod)}</span></div><div class="driver-actions"><select data-status-for="${esc(o.id)}" aria-label="تغيير الحالة">${['تم طلبه','تم الشحن','خرج للتوصيل','تم التوصيل','تعذر التسليم'].map(s=>`<option ${o.status===s?'selected':''}>${s}</option>`).join('')}</select><button class="btn primary" data-update-status="${esc(o.id)}">تحديث الحالة</button>${o.maplink?`<a class="btn secondary" href="${esc(o.maplink)}" target="_blank" rel="noopener">فتح الخريطة</a>`:`<button class="btn secondary" data-address="${esc(o.id)}">عرض العنوان</button>`}</div><p class="subtext">آخر موقع للسائق: ${o.location?`${esc(o.location.lat)}, ${esc(o.location.lng)} · ${fmtTime(o.location.at)}`:'لم يتم تسجيل موقع بعد'}</p></article>`).join(''):'<div class="panel">لا توجد طلبات مسندة لك حتى الآن.</div>';
  }
  
  $('#today').textContent=today.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  
  $('#driver-orders').addEventListener('click',async e=>{
    const b=e.target.closest('[data-update-status]');
    if(b){
      const id=b.dataset.updateStatus;
      const o=orders.find(x=>x.id===id);
      const sel=$(`[data-status-for="${CSS.escape(id)}"]`);
      if(!o||!sel)return;
      o.status=sel.value;
      o.history=o.history||[];
      o.history.push({status:o.status,at:new Date().toISOString()});

      const { error } = await supabaseClient
        .from('orders')
        .update({ status: o.status, history: o.history })
        .eq('id', id);

      if (error) {
        console.error('Error updating order:', error);
        toast('حدث خطأ أثناء تحديث الحالة');
        return;
      }

      renderDriver();
      toast('تم تحديث حالة الطلب');
      return;
    }
    const a=e.target.closest('[data-address]');
    if(a){
      const o=orders.find(x=>x.id===a.dataset.address);
      if(o)toast(o.address);
    }
  });
  
  let watchId=null;

  $('#update-location').addEventListener('click',async ()=>{
    const output=$('#location-result');
    if(!navigator.geolocation){
      output.textContent='المتصفح لا يدعم تحديد الموقع.';
      toast('ميزة الموقع غير مدعومة');
      return;
    }
    output.textContent='جاري طلب إذن الموقع...';
    navigator.geolocation.getCurrentPosition(async pos=>{
      const loc={lat:pos.coords.latitude.toFixed(5),lng:pos.coords.longitude.toFixed(5),at:new Date().toISOString()};
      const driverName = 'أحمد حسن';
      const driverOrders = orders.filter(o=>o.driver === driverName);

      for (const o of driverOrders) {
        const { error } = await supabaseClient
          .from('orders')
          .update({ location: loc })
          .eq('id', o.id);
        if (error) console.error('Error updating location:', error);
      }

      output.textContent=`آخر تحديث: ${loc.lat}, ${loc.lng} · ${fmtTime(loc.at)}`;
      await loadOrders();
      toast('تم تسجيل الموقع على الطلبات المسندة');
    },err=>{
      output.textContent=err.code===1?'لم تسمح بالوصول للموقع. فعّل إذن الموقع وحاول تاني.':'تعذر تحديد الموقع. تأكد من إعدادات الجهاز والاتصال.';
    },{enableHighAccuracy:true,timeout:12000});
  });

  $('#auto-location').addEventListener('change',e=>{
    const output=$('#location-result');
    if(e.target.checked){
      if(!navigator.geolocation){
        output.textContent='المتصفح لا يدعم تحديد الموقع.';
        e.target.checked=false;
        toast('ميزة الموقع غير مدعومة');
        return;
      }
      output.textContent='جاري تفعيل التتبع التلقائي...';
      watchId=navigator.geolocation.watchPosition(async pos=>{
        const loc={lat:pos.coords.latitude.toFixed(5),lng:pos.coords.longitude.toFixed(5),at:new Date().toISOString()};
        const driverName = 'أحمد حسن';
        const driverOrders = orders.filter(o=>o.driver === driverName);

        for (const o of driverOrders) {
          const { error } = await supabaseClient
            .from('orders')
            .update({ location: loc })
            .eq('id', o.id);
          if (error) console.error('Error updating location:', error);
        }

        output.textContent=`آخر تحديث تلقائي: ${loc.lat}, ${loc.lng} · ${fmtTime(loc.at)}`;
        await loadOrders();
      },err=>{
        console.error('Geolocation error:', err);
        output.textContent='خطأ في التتبع التلقائي';
      },{enableHighAccuracy:true,timeout:30000,maximumAge:0});
      toast('تم تفعيل التتبع التلقائي (كل 30 ثانية)');
    }else{
      if(watchId){
        navigator.geolocation.clearWatch(watchId);
        watchId=null;
        output.textContent='تم إيقاف التتبع التلقائي';
        toast('تم إيقاف التتبع التلقائي');
      }
    }
  });

  loadOrders();
})();
