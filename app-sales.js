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
    // Normalize data from lowercase to camelCase for display
    orders = (data || []).map(o => ({
      ...o,
      mapLink: o.maplink || o.mapLink,
      deviceType: o.devicetype || o.deviceType,
      paymentMethod: o.paymentmethod || o.paymentMethod,
      paymentStatus: o.paymentstatus || o.paymentStatus,
      receivedAt: o.receivedat || o.receivedAt
    }));
    renderSales();
  }
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2600);}
  function statusBadge(status){const statusClass={'تم طلبه':'s-new','تم الشحن':'s-shipped','خرج للتوصيل':'s-out','تم التوصيل':'s-done','تعذر التسليم':'s-failed'};return `<span class="status ${statusClass[status]||'s-new'}">${esc(status)}</span>`;}
  function go(view){$$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${view}`));$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));const titles={dashboard:'لوحة الإحصائيات',sales:'لوحة إدارة الطلبات','new-order:'إنشاء طلب جديد','edit-order:'تعديل الطلب'};$('#page-title').textContent=titles[view]||'YAS';if(view==='sales')renderSales();if(view==='new-order')setReceivedAt();if(view==='dashboard')renderDashboard();}
  function setReceivedAt(){const el=$('#received-at');if(el&&!el.value){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());el.value=d.toISOString().slice(0,16);}}
  function renderSales(){
    $('#stat-total').textContent=orders.length;
    $('#stat-new').textContent=orders.filter(o=>o.status==='تم طلبه').length;
    $('#stat-out').textContent=orders.filter(o=>o.status==='خرج للتوصيل').length;
    $('#stat-done').textContent=orders.filter(o=>o.status==='تم التوصيل').length;
    const q=($('#order-search').value||'').trim().toLowerCase();
    const statusFilter=$('#status-filter').value;
    const paymentFilter=$('#payment-filter').value;
    const driverFilter=$('#driver-filter').value;
    const filtered=orders.filter(o=>{
      const matchesSearch=!q||[o.id,o.customer,o.phone,o.brand].some(v=>String(v||'').toLowerCase().includes(q));
      const matchesStatus=!statusFilter||o.status===statusFilter;
      const matchesPayment=!paymentFilter||o.paymentmethod===paymentFilter;
      const matchesDriver=!driverFilter||o.driver===driverFilter;
      return matchesSearch&&matchesStatus&&matchesPayment&&matchesDriver;
    });
    $('#orders-table').innerHTML=filtered.map(o=>{
      const trackUrl=`${window.location.origin}/track.html?order=${o.id}`;
      return `<tr><td><input type="checkbox" class="order-checkbox" data-id="${esc(o.id)}"></td><td><span class="order-code">${esc(o.id)}</span></td><td><span class="customer-name">${esc(o.customer)}</span><span class="subtext">${esc(o.phone)}</span></td><td>${esc(o.devicetype)}<span class="subtext">${esc(o.brand)}</span></td><td>${esc(o.paymentmethod)}<span class="subtext">${esc(o.paymentstatus)}</span></td><td>${esc(o.driver||'غير محدد')}</td><td>${statusBadge(o.status)}</td><td>${fmtDate(o.receivedat)}<span class="subtext">${fmtTime(o.receivedat)}</span></td><td><button class="icon-btn" data-edit-order="${esc(o.id)}" title="تعديل الطلب">✏️</button><button class="icon-btn" data-delete-order="${esc(o.id)}" title="حذف الطلب" style="color: var(--red);">🗑️</button><button class="icon-btn" data-copy-link="${trackUrl}" title="نسخ رابط التتبع">📋</button></td></tr>`;
    }).join('');
    $('#orders-empty').classList.toggle('hidden',filtered.length>0);
  }

  function renderDashboard(){
    const total = orders.length;
    const revenue = orders.reduce((sum, o) => sum + (parseFloat(o.amount) || 0), 0);
    const completed = orders.filter(o => o.status === 'تم التوصيل').length;
    const pending = orders.filter(o => ['تم طلبه', 'تم الشحن', 'خرج للتوصيل'].includes(o.status)).length;

    $('#dash-total').textContent = total;
    $('#dash-revenue').textContent = revenue.toLocaleString('ar-EG') + ' ج.م';
    $('#dash-completed').textContent = completed;
    $('#dash-pending').textContent = pending;

    // Status Chart
    const statusCounts = {
      'تم طلبه': orders.filter(o => o.status === 'تم طلبه').length,
      'تم الشحن': orders.filter(o => o.status === 'تم الشحن').length,
      'خرج للتوصيل': orders.filter(o => o.status === 'خرج للتوصيل').length,
      'تم التوصيل': orders.filter(o => o.status === 'تم التوصيل').length,
      'تعذر التسليم': orders.filter(o => o.status === 'تعذر التسليم').length
    };

    const statusCtx = document.getElementById('statusChart');
    if (window.statusChartInstance) window.statusChartInstance.destroy();
    window.statusChartInstance = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });

    // Payment Method Chart
    const paymentCounts = {
      'كاش': orders.filter(o => o.paymentmethod === 'كاش').length,
      'عند الاستلام': orders.filter(o => o.paymentmethod === 'عند الاستلام').length,
      'تحويل بنكي': orders.filter(o => o.paymentmethod === 'تحويل بنكي').length,
      'اتفاق': orders.filter(o => o.paymentmethod === 'اتفاق بين السيلز والعميل').length
    };

    const paymentCtx = document.getElementById('paymentChart');
    if (window.paymentChartInstance) window.paymentChartInstance.destroy();
    window.paymentChartInstance = new Chart(paymentCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(paymentCounts),
        datasets: [{
          label: 'عدد الطلبات',
          data: Object.values(paymentCounts),
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  function generateReport(period){
    const now=new Date();
    let startDate;
    if(period==='today'){
      startDate=new Date(now.getFullYear(),now.getMonth(),now.getDate());
    }else if(period==='week'){
      startDate=new Date(now.getFullYear(),now.getMonth(),now.getDate()-7);
    }else if(period==='month'){
      startDate=new Date(now.getFullYear(),now.getMonth(),1);
    }

    const filtered=orders.filter(o=>{
      const orderDate=new Date(o.receivedat);
      return orderDate>=startDate;
    });

    const total=filtered.length;
    const revenue=filtered.reduce((sum,o)=>sum+(parseFloat(o.amount)||0),0);
    const completed=filtered.filter(o=>o.status==='تم التوصيل').length;
    const pending=filtered.filter(o=>['تم طلبه','تم الشحن','خرج للتوصيل'].includes(o.status)).length;

    const periodNames={today:'اليوم',week:'هذا الأسبوع',month:'هذا الشهر'};
    $('#report-result').innerHTML=`
      <div class="report-summary">
        <h3>تقرير ${periodNames[period]}</h3>
        <div class="report-stats">
          <div><strong>${total}</strong><small>إجمالي الطلبات</small></div>
          <div><strong>${revenue.toLocaleString('ar-EG')} ج.م</strong><small>إجمالي المبيعات</small></div>
          <div><strong>${completed}</strong><small>تم التوصيل</small></div>
          <div><strong>${pending}</strong><small>قيد التوصيل</small></div>
        </div>
      </div>
    `;
    $('#report-result').classList.remove('hidden');
  }

  $('#generate-report').addEventListener('click',()=>{
    const period=$('#report-period').value;
    generateReport(period);
  });
  
  $('#today').textContent=today.toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'});
  $$('[data-view]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.view)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  $('#order-search').addEventListener('input',renderSales);
  $('#status-filter').addEventListener('change',renderSales);
  $('#payment-filter').addEventListener('change',renderSales);
  $('#driver-filter').addEventListener('change',renderSales);
  $('#clear-filters').addEventListener('click',()=>{
    $('#order-search').value='';
    $('#status-filter').value='';
    $('#payment-filter').value='';
    $('#driver-filter').value='';
    renderSales();
  });

  $('#export-excel').addEventListener('click',()=>{
    const q=($('#order-search').value||'').trim().toLowerCase();
    const statusFilter=$('#status-filter').value;
    const paymentFilter=$('#payment-filter').value;
    const driverFilter=$('#driver-filter').value;
    const filtered=orders.filter(o=>{
      const matchesSearch=!q||[o.id,o.customer,o.phone,o.brand].some(v=>String(v||'').toLowerCase().includes(q));
      const matchesStatus=!statusFilter||o.status===statusFilter;
      const matchesPayment=!paymentFilter||o.paymentmethod===paymentFilter;
      const matchesDriver=!driverFilter||o.driver===driverFilter;
      return matchesSearch&&matchesStatus&&matchesPayment&&matchesDriver;
    });

    if(filtered.length===0){
      toast('لا توجد طلبات للتصدير');
      return;
    }

    const exportData=filtered.map(o=>({
      'رقم الطلب':o.id,
      'العميل':o.customer,
      'الهاتف':o.phone,
      'العنوان':o.address,
      'نوع الجهاز':o.devicetype,
      'الماركة':o.brand,
      'الكمية':o.quantity,
      'القيمة':o.amount,
      'التفاصيل':o.details,
      'طريقة الدفع':o.paymentmethod,
      'حالة الدفع':o.paymentstatus,
      'السائق':o.driver,
      'الحالة':o.status,
      'تاريخ الاستلام':o.receivedat,
      'ملاحظات':o.notes||''
    }));

    const ws=XLSX.utils.json_to_sheet(exportData);
    const wb=XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,ws,'الطلبات');
    XLSX.writeFile(wb,'YAS-Orders.xlsx');
    toast('تم تصدير البيانات بنجاح');
  });

  $('#bulk-update').addEventListener('click',()=>{
    const selectedIds=[...document.querySelectorAll('.order-checkbox:checked')].map(cb=>cb.dataset.id);
    if(selectedIds.length===0){
      toast('اختر طلبات على الأقل للتحديث');
      return;
    }
    const newStatus=prompt('اختر الحالة الجديدة:\n\n1. تم طلبه\n2. تم الشحن\n3. خرج للتوصيل\n4. تم التوصيل\n5. تعذر التسليم\n\nأدخل الرقم:');
    const statusMap={'1':'تم طلبه','2':'تم الشحن','3':'خرج للتوصيل','4':'تم التوصيل','5':'تعذر التسليم'};
    if(!newStatus||!statusMap[newStatus]){
      toast('اختيار غير صحيح');
      return;
    }
    const selectedStatus=statusMap[newStatus];
    if(!confirm(`تأكد من تغيير حالة ${selectedIds.length} طلب إلى "${selectedStatus}"؟`)){
      return;
    }
    selectedIds.forEach(async id=>{
      const o=orders.find(x=>x.id===id);
      if(o){
        o.status=selectedStatus;
        o.history=o.history||[];
        o.history.push({status:selectedStatus,at:new Date().toISOString()});
        const { error }=await supabaseClient.from('orders').update({status:o.status,history:o.history}).eq('id',id);
        if(error) console.error('Error updating order:',error);
      }
    });
    await loadOrders();
    toast(`تم تحديث ${selectedIds.length} طلب بنجاح`);
    document.querySelectorAll('.order-checkbox').forEach(cb=>cb.checked=false);
  });

  $('#select-all').addEventListener('change',e=>{
    document.querySelectorAll('.order-checkbox').forEach(cb=>cb.checked=e.target.checked);
  });
  
  loadOrders();
  
  $('#orders-table').addEventListener('click',async e=>{
    const b=e.target.closest('[data-copy-link]');
    if(b){
      const link=b.dataset.copyLink;
      navigator.clipboard.writeText(link).then(()=>toast('تم نسخ رابط التتبع ✓')).catch(()=>toast('خطأ في النسخ'));
    }
    const editBtn=e.target.closest('[data-edit-order]');
    if(editBtn){
      const orderId=editBtn.dataset.editOrder;
      const o=orders.find(x=>x.id===orderId);
      if(o){
        $('#edit-order-id').value=o.id;
        $('#edit-order-form').elements.customer.value=o.customer;
        $('#edit-order-form').elements.phone.value=o.phone;
        $('#edit-order-form').elements.address.value=o.address;
        $('#edit-order-form').elements.mapLink.value=o.maplink||'';
        $('#edit-order-form').elements.deviceType.value=o.devicetype;
        $('#edit-order-form').elements.brand.value=o.brand;
        $('#edit-order-form').elements.quantity.value=o.quantity;
        $('#edit-order-form').elements.amount.value=o.amount;
        $('#edit-order-form').elements.details.value=o.details;
        $('#edit-order-form').elements.paymentMethod.value=o.paymentmethod;
        $('#edit-order-form').elements.paymentStatus.value=o.paymentstatus;
        $('#edit-order-form').elements.driver.value=o.driver;
        $('#edit-order-form').elements.receivedAt.value=o.receivedat;
        $('#edit-order-form').elements.notes.value=o.notes||'';
        go('edit-order');
      }
    }
    const deleteBtn=e.target.closest('[data-delete-order]');
    if(deleteBtn){
      const orderId=deleteBtn.dataset.deleteOrder;
      if(confirm(`هل أنت متأكد من حذف الطلب ${orderId}؟ لا يمكن التراجع عن هذا الإجراء.`)){
        const { error } = await supabaseClient.from('orders').delete().eq('id', orderId);
        if (error) {
          console.error('Error deleting order:', error);
          toast('حدث خطأ أثناء حذف الطلب');
          return;
        }
        await loadOrders();
        toast(`تم حذف الطلب ${orderId}`);
      }
    }
  });
  
  $('#order-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());

    // Generate simple order ID: YAS-1, YAS-2, etc.
    const maxOrderNum = orders.reduce((max, o) => {
      const num = parseInt(o.id.replace('YAS-', '')) || 0;
      return num > max ? num : max;
    }, 0);
    const orderId = `YAS-${maxOrderNum + 1}`;

    const o={
      id: orderId,
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

  $('#edit-order-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());
    const orderId=data.editOrderId;
    delete data.editOrderId;

    const o={
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
      notes: data.notes
    };

    const { error } = await supabaseClient.from('orders').update(o).eq('id', orderId);
    if (error) {
      console.error('Error updating order:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast('حدث خطأ أثناء تحديث الطلب: ' + error.message);
      return;
    }

    await loadOrders();
    go('sales');
    toast(`تم تحديث الطلب بنجاح · ${orderId}`);
  });

  loadOrders();
  setReceivedAt();
})();
