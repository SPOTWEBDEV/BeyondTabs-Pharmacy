/* =========================================================
   BeyondTabs Admin Dashboard
   Products, Newsletter subscribers, Contact messages, Consultation
   bookings, registered Customers, and Settings are all fetched live
   from the MySQL database via server/*.php. Orders and Prescriptions
   still run on placeholder data until an orders/checkout system exists
   to populate real records for them.
   ========================================================= */

/* ---------- Auth guard ----------
   Requires a real, valid admin session from server/auth/session.php.
   The topbar's name/email always reflects what the database says. */
(function authGuard() {
  let cached = null;
  try {
    const raw = localStorage.getItem('beyondtabs_admin_auth');
    if (!raw) {
      window.location.href = 'login.html';
      return;
    }
    cached = JSON.parse(raw);
  } catch (err) {
    window.location.href = 'login.html';
    return;
  }

  function applyToTopbar(user) {
    const nameEl = document.getElementById('admin-name');
    const sourceEl = document.getElementById('admin-source');
    if (nameEl) nameEl.textContent = user.name || (user.email ? user.email.split('@')[0] : 'Admin');
    if (sourceEl) sourceEl.textContent = user.email || 'Staff account';
  }

  // Show the cached identity immediately so there's no blank/flash state,
  // then verify + refresh against the database once the fetch resolves.
  document.addEventListener('DOMContentLoaded', () => {
    applyToTopbar(cached);

    fetch('../server/auth/session.php')
      .then((res) => res.json())
      .then((result) => {
        if (result.success && result.user && result.user.role === 'admin') {
          const fresh = { ...result.user, signedInAt: cached.signedInAt || new Date().toISOString() };
          localStorage.setItem('beyondtabs_admin_auth', JSON.stringify(fresh));
          applyToTopbar(fresh);
        } else {
          localStorage.removeItem('beyondtabs_admin_auth');
          window.location.href = 'login.html';
        }
      })
      .catch(() => {
        // Couldn't verify the session — don't allow a stale/unverified
        // session to keep viewing admin data. Send back to login.
        localStorage.removeItem('beyondtabs_admin_auth');
        window.location.href = 'login.html';
      });
  });
})();

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('../server/auth/logout.php').catch(() => {});
      localStorage.removeItem('beyondtabs_admin_auth');
      window.location.href = 'login.html';
    });
  }

  /* ---------- Sidebar navigation / view switching ---------- */
  const navLinks = document.querySelectorAll('[data-view]');
  const panels = document.querySelectorAll('[data-view-panel]');
  const pageTitle = document.getElementById('page-title');
  const sidebar = document.getElementById('admin-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebarOverlay = document.getElementById('sidebar-overlay');

  function showView(view) {
    panels.forEach((p) => p.classList.toggle('hidden', p.dataset.viewPanel !== view));
    navLinks.forEach((l) => {
      const active = l.dataset.view === view;
      l.classList.toggle('bg-white/10', active);
      l.classList.toggle('text-white', active);
      l.classList.toggle('text-white/60', !active);
    });
    const activeLink = document.querySelector(`[data-view="${view}"]`);
    if (pageTitle && activeLink) pageTitle.textContent = activeLink.dataset.label || 'Overview';
    if (sidebar) sidebar.classList.add('-translate-x-full', 'lg:translate-x-0');
    if (sidebarOverlay) sidebarOverlay.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showView(link.dataset.view);
    });
  });

  if (sidebarToggle && sidebar && sidebarOverlay) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('-translate-x-full');
      sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.add('-translate-x-full');
      sidebarOverlay.classList.add('hidden');
    });
  }

  showView('overview');

  /* ---------- Mock data ---------- */
  const MOCK_ORDERS = [
    { id: 'BT-1049', customer: 'Chiamaka Obi', phone: '0803 456 7890', items: 'Amoxicillin 500mg ×2, Panadol Extra', total: 8500, payment: 'Transfer', status: 'Delivered', date: '2026-08-24' },
    { id: 'BT-1048', customer: 'Tunde Alabi', phone: '0805 112 3344', items: 'CellGevity (30 caps)', total: 45000, payment: 'Card', status: 'Processing', date: '2026-08-24' },
    { id: 'BT-1047', customer: 'Ifeoma Balogun', phone: '0812 998 2211', items: 'Multivitamin, Omega-3 Capsules', total: 12300, payment: 'Cash', status: 'Delivered', date: '2026-08-23' },
    { id: 'BT-1046', customer: 'Emeka Nwosu', phone: '0701 224 5567', items: 'Metformin 500mg, Glucometer strips', total: 9700, payment: 'Transfer', status: 'Pending', date: '2026-08-23' },
    { id: 'BT-1045', customer: 'Blessing Kalu', phone: '0909 887 6655', items: 'Hyaluronic Acid Serum, Sunscreen SPF50', total: 15200, payment: 'Card', status: 'Delivered', date: '2026-08-22' },
    { id: 'BT-1044', customer: 'Ngozi Peters', phone: '0816 334 2298', items: 'Lisinopril 10mg ×3', total: 6800, payment: 'Transfer', status: 'Cancelled', date: '2026-08-22' },
    { id: 'BT-1043', customer: 'Segun Adeyemi', phone: '0703 556 8890', items: 'Retinol Night Cream, Vitamin C Booster', total: 21400, payment: 'Card', status: 'Delivered', date: '2026-08-21' },
    { id: 'BT-1042', customer: 'Amaka Eze', phone: '0812 776 4432', items: 'Daily Multivitamin, Omega-3', total: 10500, payment: 'Cash', status: 'Delivered', date: '2026-08-20' },
    { id: 'BT-1041', customer: 'Yusuf Bello', phone: '0805 223 1190', items: 'Panadol Extra, Vitamin C 1000mg', total: 4200, payment: 'Transfer', status: 'Processing', date: '2026-08-20' },
    { id: 'BT-1040', customer: 'Chidinma Okafor', phone: '0909 445 7781', items: 'CellGevity (30 caps), Multivitamin', total: 52500, payment: 'Card', status: 'Pending', date: '2026-08-19' },
  ];


  const PRESCRIPTIONS_SEED = [
    { patient: 'Tunde Alabi', medication: 'Lisinopril 10mg, Metformin 500mg', submitted: '2026-08-25', status: 'Pending Review' },
    { patient: 'Ngozi Peters', medication: 'Amlodipine 5mg', submitted: '2026-08-25', status: 'Pending Review' },
    { patient: 'Chidinma Okafor', medication: 'Atorvastatin 20mg', submitted: '2026-08-24', status: 'Approved' },
    { patient: 'Yusuf Bello', medication: 'Ciprofloxacin 500mg', submitted: '2026-08-24', status: 'Needs Clarification' },
    { patient: 'Amaka Eze', medication: 'Insulin Glargine', submitted: '2026-08-23', status: 'Approved' },
    { patient: 'Segun Adeyemi', medication: 'Losartan 50mg', submitted: '2026-08-22', status: 'Approved' },
    { patient: 'Blessing Kalu', medication: 'Levothyroxine 75mcg', submitted: '2026-08-21', status: 'Pending Review' },
  ];
  let prescriptions = PRESCRIPTIONS_SEED.map((p) => ({ ...p }));


  /* ---------- Helpers ---------- */
  const naira = (n) => '₦' + Number(n).toLocaleString('en-NG');
  const fmtDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return iso;
    }
  };
  const fmtDateTime = (iso) => {
    try {
      return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return iso;
    }
  };

  const STATUS_STYLES = {
    Delivered: 'bg-green-100 text-green-700',
    Processing: 'bg-blue-100 text-blue-700',
    Registered: 'bg-brand-violet/10 text-brand-violet',
    Pending: 'bg-amber-100 text-amber-700',
    Cancelled: 'bg-red-100 text-red-700',
    'In Stock': 'bg-green-100 text-green-700',
    'Low Stock': 'bg-amber-100 text-amber-700',
    'Out of Stock': 'bg-red-100 text-red-700',
    VIP: 'bg-brand-magenta/10 text-brand-magenta',
    Regular: 'bg-brand-violet/10 text-brand-violet',
    New: 'bg-blue-100 text-blue-700',
    'Pending Review': 'bg-amber-100 text-amber-700',
    Approved: 'bg-green-100 text-green-700',
    'Needs Clarification': 'bg-red-100 text-red-700',
    Confirmed: 'bg-green-100 text-green-700',
    Completed: 'bg-brand-violet/10 text-brand-violet',
    Read: 'bg-brand-ink/5 text-brand-ink/50',
  };
  function badge(status) {
    const cls = STATUS_STYLES[status] || 'bg-brand-ink/5 text-brand-ink/60';
    return `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}">${status}</span>`;
  }

  /* ---------- Pagination helper (used by every table below) ---------- */
  const PAGE_SIZE = 6;

  function paginate(items, page, pageSize) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }

  function renderPaginationControls(containerId, totalItems, page, pageSize, onChange) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
    const rangeEnd = Math.min(page * pageSize, totalItems);

    let pageButtons = '';
    for (let i = 1; i <= totalPages; i++) {
      pageButtons += `<button data-page="${i}" class="h-8 w-8 rounded-full text-xs font-semibold transition-colors ${i === page ? 'bg-brand-ink text-white' : 'text-brand-ink/60 hover:bg-brand-blush'}">${i}</button>`;
    }

    container.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-brand-ink/5">
        <p class="text-xs text-brand-ink/40">Showing ${rangeStart}–${rangeEnd} of ${totalItems}</p>
        <div class="flex items-center gap-1">
          <button data-page="${Math.max(1, page - 1)}" ${page === 1 ? 'disabled' : ''} class="h-8 w-8 rounded-full text-brand-ink/50 hover:bg-brand-blush disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          </button>
          ${pageButtons}
          <button data-page="${Math.min(totalPages, page + 1)}" ${page === totalPages ? 'disabled' : ''} class="h-8 w-8 rounded-full text-brand-ink/50 hover:bg-brand-blush disabled:opacity-30 disabled:hover:bg-transparent flex items-center justify-center">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>`;

    container.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        onChange(Number(btn.dataset.page));
      });
    });
  }

  /* ---------- Orders table ---------- */
  const ordersBody = document.getElementById('orders-table-body');
  const orderSearch = document.getElementById('order-search');
  const orderFilterBtns = document.querySelectorAll('[data-order-filter]');
  let currentOrderFilter = 'All';
  let ordersPage = 1;

  function renderOrders() {
    if (!ordersBody) return;
    const term = (orderSearch?.value || '').toLowerCase();
    const rows = MOCK_ORDERS.filter((o) => {
      const matchesStatus = currentOrderFilter === 'All' || o.status === currentOrderFilter;
      const matchesSearch = !term || o.customer.toLowerCase().includes(term) || o.id.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
    const pageRows = paginate(rows, ordersPage, PAGE_SIZE);
    ordersBody.innerHTML = pageRows.length
      ? pageRows.map((o) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${o.id}</td>
          <td class="py-3 pr-4">
            <p class="font-medium text-brand-ink">${o.customer}</p>
            <p class="text-xs text-brand-ink/45">${o.phone}</p>
          </td>
          <td class="py-3 pr-4 text-brand-ink/70 max-w-[220px]">${o.items}</td>
          <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${naira(o.total)}</td>
          <td class="py-3 pr-4 text-brand-ink/60 whitespace-nowrap">${o.payment}</td>
          <td class="py-3 pr-4">${badge(o.status)}</td>
          <td class="py-3 pr-4 text-brand-ink/50 whitespace-nowrap">${fmtDate(o.date)}</td>
          <td class="py-3 pl-2 text-right"><button class="text-xs font-semibold text-brand-magenta hover:text-brand-violetDark transition-colors">View</button></td>
        </tr>`).join('')
      : `<tr><td colspan="8" class="py-8 text-center text-sm text-brand-ink/40">No orders match your search.</td></tr>`;
    renderPaginationControls('orders-pagination', rows.length, ordersPage, PAGE_SIZE, (p) => { ordersPage = p; renderOrders(); });
  }
  if (orderSearch) orderSearch.addEventListener('input', () => { ordersPage = 1; renderOrders(); });
  orderFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentOrderFilter = btn.dataset.orderFilter;
      orderFilterBtns.forEach((b) => b.classList.remove('bg-brand-ink', 'text-white'));
      orderFilterBtns.forEach((b) => b.classList.add('bg-brand-blush', 'text-brand-ink/60'));
      btn.classList.add('bg-brand-ink', 'text-white');
      btn.classList.remove('bg-brand-blush', 'text-brand-ink/60');
      ordersPage = 1;
      renderOrders();
    });
  });
  renderOrders();

  /* ---------- Recent orders (Overview) ---------- */
  const recentOrdersBody = document.getElementById('recent-orders-body');
  if (recentOrdersBody) {
    recentOrdersBody.innerHTML = MOCK_ORDERS.slice(0, 5).map((o) => `
      <tr class="border-b border-brand-ink/5 last:border-0">
        <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${o.id}</td>
        <td class="py-3 pr-4 text-brand-ink">${o.customer}</td>
        <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${naira(o.total)}</td>
        <td class="py-3 pl-2">${badge(o.status)}</td>
      </tr>`).join('');
  }

  /* ---------- Products (full CRUD via server/products/*.php) ---------- */
  const productsBody = document.getElementById('products-table-body');
  const productsCount = document.getElementById('products-admin-count');
  const productSearchAdmin = document.getElementById('product-search-admin');
  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productModalOverlay = document.getElementById('product-modal-overlay');
  const productModalTitle = document.getElementById('product-modal-title');
  const productModalClose = document.getElementById('product-modal-close');
  const productModalCancel = document.getElementById('product-modal-cancel');
  const productForm = document.getElementById('product-form');
  const productFormError = document.getElementById('product-form-error');
  const productFormSubmitBtn = document.getElementById('product-form-submit');
  const productImageInput = document.getElementById('product-image-input');
  const productImagePreview = document.getElementById('product-image-preview');
  const productImageRemoveBtn = document.getElementById('product-image-remove');
  let productsPage = 1;
  let allProducts = [];
  let pendingImageFile = null;

  const PLACEHOLDER_ICON_SVG = `<svg class="h-8 w-8 text-brand-ink/25" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3 3.75h18a.75.75 0 01.75.75v15a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75v-15A.75.75 0 013 3.75z"/></svg>`;

  function setImagePreview(src) {
    if (!productImagePreview) return;
    if (src) {
      productImagePreview.innerHTML = `<img src="${src}" alt="" class="h-full w-full object-cover">`;
      if (productImageRemoveBtn) productImageRemoveBtn.classList.remove('hidden');
    } else {
      productImagePreview.innerHTML = PLACEHOLDER_ICON_SVG;
      if (productImageRemoveBtn) productImageRemoveBtn.classList.add('hidden');
    }
  }

  if (productImageInput) {
    productImageInput.addEventListener('change', () => {
      const file = productImageInput.files?.[0];
      pendingImageFile = file || null;
      if (file) {
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    });
  }
  if (productImageRemoveBtn) {
    productImageRemoveBtn.addEventListener('click', () => {
      pendingImageFile = null;
      if (productImageInput) productImageInput.value = '';
      productForm.elements['image'].value = '';
      setImagePreview(null);
    });
  }

  function openProductModal(product) {
    if (!productModal || !productForm) return;
    productForm.reset();
    if (productFormError) productFormError.classList.add('hidden');
    pendingImageFile = null;
    if (productImageInput) productImageInput.value = '';
    if (product) {
      productModalTitle.textContent = 'Edit Product';
      productForm.elements['id'].value = product.id;
      productForm.elements['name'].value = product.name;
      productForm.elements['category'].value = product.category;
      productForm.elements['price'].value = product.price;
      productForm.elements['stock'].value = product.stock;
      productForm.elements['blurb'].value = product.blurb || '';
      productForm.elements['rx'].checked = !!product.rx;
      productForm.elements['image'].value = product.image || '';
      setImagePreview(product.image ? '../' + product.image : null);
    } else {
      productModalTitle.textContent = 'Add Product';
      productForm.elements['id'].value = '';
      productForm.elements['image'].value = '';
      setImagePreview(null);
    }
    productModal.classList.remove('hidden');
  }
  function closeProductModal() {
    if (productModal) productModal.classList.add('hidden');
  }

  function renderProductsAdmin() {
    if (!productsBody) return;
    const term = (productSearchAdmin?.value || '').toLowerCase();
    const rows = allProducts.filter((p) => !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term));
    if (productsCount) productsCount.textContent = `${allProducts.length} product${allProducts.length === 1 ? '' : 's'} total`;
    const pageRows = paginate(rows, productsPage, PAGE_SIZE);

    productsBody.innerHTML = pageRows.length
      ? pageRows.map((p) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 shrink-0 rounded-xl bg-brand-blush ring-1 ring-brand-ink/5 overflow-hidden flex items-center justify-center">
                ${p.image ? `<img src="../${p.image}" alt="" class="h-full w-full object-cover">` : `<svg class="h-5 w-5 text-brand-ink/25" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 20.25h18M3 3.75h18a.75.75 0 01.75.75v15a.75.75 0 01-.75.75H3a.75.75 0 01-.75-.75v-15A.75.75 0 013 3.75z"/></svg>`}
              </div>
              <span class="font-medium text-brand-ink max-w-[180px]">${p.name}${p.rx ? ' <span class="ml-1 text-[10px] font-bold text-brand-magenta align-middle">Rx</span>' : ''}</span>
            </div>
          </td>
          <td class="py-3 pr-4 text-brand-ink/50 whitespace-nowrap">${p.sku}</td>
          <td class="py-3 pr-4 text-brand-ink/70 whitespace-nowrap">${p.category}</td>
          <td class="py-3 pr-4 text-brand-ink whitespace-nowrap">${p.stock} units</td>
          <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${naira(p.price)}</td>
          <td class="py-3 pr-4">${badge(p.status)}</td>
          <td class="py-3 pl-2 text-right whitespace-nowrap">
            <button data-edit-product="${p.id}" class="text-xs font-semibold text-brand-violet hover:text-brand-violetDark mr-3">Edit</button>
            <button data-delete-product="${p.id}" class="text-xs font-semibold text-brand-magenta hover:text-brand-magentaDark">Delete</button>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="7" class="py-8 text-center text-sm text-brand-ink/40">No products yet — add your first one.</td></tr>`;
    renderPaginationControls('products-pagination', rows.length, productsPage, PAGE_SIZE, (p) => { productsPage = p; renderProductsAdmin(); });

    productsBody.querySelectorAll('[data-edit-product]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const product = allProducts.find((p) => String(p.id) === btn.dataset.editProduct);
        if (product) openProductModal(product);
      });
    });
    productsBody.querySelectorAll('[data-delete-product]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const product = allProducts.find((p) => String(p.id) === btn.dataset.deleteProduct);
        if (!product || !confirm(`Delete "${product.name}"? This can't be undone.`)) return;
        try {
          const res = await fetch('../server/products/delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: product.id }),
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error || 'Delete failed.');
          await loadProducts();
        } catch (err) {
          alert(err.message || "Couldn't delete this product — please try again.");
        }
      });
    });
  }

  async function loadProducts() {
    if (!productsBody) return;
    try {
      const res = await fetch('../server/products/list.php');
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Could not load products.');
      allProducts = result.products || [];
      renderProductsAdmin();
    } catch (err) {
      productsBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center text-sm text-brand-magenta">Couldn't load products from the server. Check your connection and try again.</td></tr>`;
    }
  }
  loadProducts();

  if (addProductBtn) addProductBtn.addEventListener('click', () => openProductModal(null));
  if (productModalClose) productModalClose.addEventListener('click', closeProductModal);
  if (productModalCancel) productModalCancel.addEventListener('click', closeProductModal);
  if (productModalOverlay) productModalOverlay.addEventListener('click', closeProductModal);
  if (productSearchAdmin) productSearchAdmin.addEventListener('input', () => { productsPage = 1; renderProductsAdmin(); });

  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (productFormError) productFormError.classList.add('hidden');
      if (productFormSubmitBtn) { productFormSubmitBtn.disabled = true; productFormSubmitBtn.textContent = 'Saving…'; }

      try {
        // Upload the image first (if a new one was chosen) to get a real
        // server-side path, then create/update the product record with it.
        // Paths are stored ROOT-RELATIVE (e.g. "server/uploads/products/x.jpg")
        // since that's what the public pages at the project root need. This
        // admin page lives one folder down, so it prefixes with "../" only
        // when actually displaying an image — never in the stored value.
        let imagePath = productForm.elements['image'].value || '';
        if (pendingImageFile) {
          const fd = new FormData();
          fd.append('image', pendingImageFile);
          const uploadRes = await fetch('../server/products/upload_image.php', { method: 'POST', body: fd });
          const uploadResult = await uploadRes.json();
          if (!uploadResult.success) throw new Error(uploadResult.error || 'Image upload failed.');
          imagePath = uploadResult.path;
        }

        const data = Object.fromEntries(new FormData(productForm).entries());
        data.rx = productForm.elements['rx'].checked;
        data.image = imagePath;

        const endpoint = data.id ? '../server/products/update.php' : '../server/products/create.php';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Could not save this product.');

        closeProductModal();
        await loadProducts();
      } catch (err) {
        if (productFormError) {
          productFormError.textContent = err.message || 'Something went wrong — please try again.';
          productFormError.classList.remove('hidden');
        }
      } finally {
        if (productFormSubmitBtn) { productFormSubmitBtn.disabled = false; productFormSubmitBtn.textContent = 'Save Product'; }
      }
    });
  }

  renderProductsAdmin();

  /* ---------- Subscription Plans (full CRUD via server/subscriptions/*.php) ---------- */
  const plansBody = document.getElementById('plans-table-body');
  const addPlanBtn = document.getElementById('add-plan-btn');
  const planModal = document.getElementById('plan-modal');
  const planModalOverlay = document.getElementById('plan-modal-overlay');
  const planModalTitle = document.getElementById('plan-modal-title');
  const planModalClose = document.getElementById('plan-modal-close');
  const planModalCancel = document.getElementById('plan-modal-cancel');
  const planForm = document.getElementById('plan-form');
  const planFormError = document.getElementById('plan-form-error');
  const planFormSubmitBtn = document.getElementById('plan-form-submit');
  let plansPage = 1;
  let allPlans = [];

  function openPlanModal(plan) {
    if (!planModal || !planForm) return;
    planForm.reset();
    if (planFormError) planFormError.classList.add('hidden');
    if (plan) {
      planModalTitle.textContent = 'Edit Plan';
      planForm.elements['id'].value = plan.id;
      planForm.elements['name'].value = plan.name;
      planForm.elements['tagline'].value = plan.tagline || '';
      planForm.elements['price'].value = plan.price;
      planForm.elements['features'].value = (plan.features || []).join('\n');
      planForm.elements['is_popular'].checked = !!plan.is_popular;
    } else {
      planModalTitle.textContent = 'Add Plan';
      planForm.elements['id'].value = '';
    }
    planModal.classList.remove('hidden');
  }
  function closePlanModal() {
    if (planModal) planModal.classList.add('hidden');
  }

  function renderPlans() {
    if (!plansBody) return;
    const pageRows = paginate(allPlans, plansPage, PAGE_SIZE);
    plansBody.innerHTML = pageRows.length
      ? pageRows.map((p) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4">
            <p class="font-medium text-brand-ink">${p.name}</p>
            ${p.tagline ? `<p class="text-xs text-brand-ink/45">${p.tagline}</p>` : ''}
          </td>
          <td class="py-3 pr-4 font-semibold text-brand-ink whitespace-nowrap">${naira(p.price)}/${p.billing_period || 'month'}</td>
          <td class="py-3 pr-4 text-brand-ink/60">${(p.features || []).length} listed</td>
          <td class="py-3 pr-4">${p.is_popular ? badge('Confirmed') : '<span class="text-brand-ink/30 text-xs">—</span>'}</td>
          <td class="py-3 pl-2 text-right whitespace-nowrap">
            <button data-edit-plan="${p.id}" class="text-xs font-semibold text-brand-violet hover:text-brand-violetDark mr-3">Edit</button>
            <button data-delete-plan="${p.id}" class="text-xs font-semibold text-brand-magenta hover:text-brand-magentaDark">Delete</button>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="py-8 text-center text-sm text-brand-ink/40">No subscription plans yet — add your first one.</td></tr>`;
    renderPaginationControls('plans-pagination', allPlans.length, plansPage, PAGE_SIZE, (p) => { plansPage = p; renderPlans(); });

    plansBody.querySelectorAll('[data-edit-plan]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const plan = allPlans.find((p) => String(p.id) === btn.dataset.editPlan);
        if (plan) openPlanModal(plan);
      });
    });
    plansBody.querySelectorAll('[data-delete-plan]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const plan = allPlans.find((p) => String(p.id) === btn.dataset.deletePlan);
        if (!plan || !confirm(`Delete the "${plan.name}" plan? This can't be undone.`)) return;
        try {
          const res = await fetch('../server/subscriptions/delete.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: plan.id }),
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error);
          await loadPlans();
        } catch (err) {
          alert("Couldn't delete this plan — please try again.");
        }
      });
    });
  }

  async function loadPlans() {
    if (!plansBody) return;
    try {
      const res = await fetch('../server/subscriptions/list.php');
      const result = await res.json();
      if (!result.success) throw new Error(result.error);
      allPlans = result.plans || [];
      renderPlans();
    } catch (err) {
      plansBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-sm text-brand-magenta">Couldn't load subscription plans from the server.</td></tr>`;
    }
  }
  loadPlans();

  if (addPlanBtn) addPlanBtn.addEventListener('click', () => openPlanModal(null));
  if (planModalClose) planModalClose.addEventListener('click', closePlanModal);
  if (planModalCancel) planModalCancel.addEventListener('click', closePlanModal);
  if (planModalOverlay) planModalOverlay.addEventListener('click', closePlanModal);

  if (planForm) {
    planForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (planFormError) planFormError.classList.add('hidden');
      if (planFormSubmitBtn) { planFormSubmitBtn.disabled = true; planFormSubmitBtn.textContent = 'Saving…'; }

      try {
        const raw = Object.fromEntries(new FormData(planForm).entries());
        const data = {
          ...raw,
          is_popular: planForm.elements['is_popular'].checked,
          features: raw.features.split('\n').map((f) => f.trim()).filter(Boolean),
        };
        const endpoint = data.id ? '../server/subscriptions/update.php' : '../server/subscriptions/create.php';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Could not save this plan.');

        closePlanModal();
        await loadPlans();
      } catch (err) {
        if (planFormError) {
          planFormError.textContent = err.message || 'Something went wrong — please try again.';
          planFormError.classList.remove('hidden');
        }
      } finally {
        if (planFormSubmitBtn) { planFormSubmitBtn.disabled = false; planFormSubmitBtn.textContent = 'Save Plan'; }
      }
    });
  }

  /* ---------- Customers table (real registered accounts) ---------- */
  const customersBody = document.getElementById('customers-table-body');
  let customersPage = 1;
  let allCustomersList = [];

  function renderCustomers() {
    if (!customersBody) return;
    const pageRows = paginate(allCustomersList, customersPage, PAGE_SIZE);
    customersBody.innerHTML = pageRows.length
      ? pageRows.map((c) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4 font-medium text-brand-ink whitespace-nowrap">${c.name}</td>
          <td class="py-3 pr-4 text-brand-ink/60 whitespace-nowrap">${c.phone || '—'}</td>
          <td class="py-3 pr-4 text-brand-ink/60">${c.email}</td>
          <td class="py-3 pl-2 text-brand-ink/50 whitespace-nowrap">${fmtDate(c.created_at)}</td>
        </tr>`).join('')
      : `<tr><td colspan="4" class="py-8 text-center text-sm text-brand-ink/40">No registered customers yet.</td></tr>`;
    renderPaginationControls('customers-pagination', allCustomersList.length, customersPage, PAGE_SIZE, (p) => { customersPage = p; renderCustomers(); });
  }

  fetch('../server/auth/list_users.php')
    .then((res) => res.json())
    .then((result) => {
      if (result.success) allCustomersList = result.users || [];
      renderCustomers();
    })
    .catch(() => {
      if (customersBody) customersBody.innerHTML = `<tr><td colspan="4" class="py-8 text-center text-sm text-brand-magenta">Couldn't load customers from the server.</td></tr>`;
    });

  /* ---------- Prescriptions table ---------- */
  const prescriptionsBody = document.getElementById('prescriptions-table-body');
  let prescriptionsPage = 1;
  function renderPrescriptions() {
    if (!prescriptionsBody) return;
    const pageRows = paginate(prescriptions, prescriptionsPage, PAGE_SIZE);
    prescriptionsBody.innerHTML = pageRows.map((p) => {
      const i = prescriptions.indexOf(p);
      return `
      <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
        <td class="py-3 pr-4 font-medium text-brand-ink whitespace-nowrap">${p.patient}</td>
        <td class="py-3 pr-4 text-brand-ink/70">${p.medication}</td>
        <td class="py-3 pr-4 text-brand-ink/50 whitespace-nowrap">${fmtDate(p.submitted)}</td>
        <td class="py-3 pr-4">${badge(p.status)}</td>
        <td class="py-3 pl-2 text-right whitespace-nowrap">
          ${p.status !== 'Approved' ? `<button data-approve="${i}" class="text-xs font-semibold text-green-700 hover:text-green-800 mr-3">Approve</button>` : ''}
          ${p.status !== 'Needs Clarification' ? `<button data-flag="${i}" class="text-xs font-semibold text-brand-magenta hover:text-brand-violetDark">Flag</button>` : ''}
        </td>
      </tr>`;
    }).join('');
    renderPaginationControls('prescriptions-pagination', prescriptions.length, prescriptionsPage, PAGE_SIZE, (p) => { prescriptionsPage = p; renderPrescriptions(); });

    prescriptionsBody.querySelectorAll('[data-approve]').forEach((btn) => {
      btn.addEventListener('click', () => {
        prescriptions[Number(btn.dataset.approve)].status = 'Approved';
        renderPrescriptions();
      });
    });
    prescriptionsBody.querySelectorAll('[data-flag]').forEach((btn) => {
      btn.addEventListener('click', () => {
        prescriptions[Number(btn.dataset.flag)].status = 'Needs Clarification';
        renderPrescriptions();
      });
    });
  }
  renderPrescriptions();

  /* ---------- Consultations table (real bookings from the database) ---------- */
  const consultationsBody = document.getElementById('consultations-table-body');
  let consultationsPage = 1;
  let allConsultations = [];

  const SPECIALIST_LABELS = {
    doctor: 'Doctor',
    pharmacist: 'Pharmacist',
    dentist: 'Dentist',
    skin_specialist: 'Skin Specialist',
  };

  function renderConsultations() {
    if (!consultationsBody) return;
    const pageRows = paginate(allConsultations, consultationsPage, PAGE_SIZE);
    consultationsBody.innerHTML = pageRows.length
      ? pageRows.map((c) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4 font-medium text-brand-ink whitespace-nowrap">${c.name}</td>
          <td class="py-3 pr-4 text-brand-ink/70">
            <span class="font-semibold text-brand-ink">${SPECIALIST_LABELS[c.specialist_type] || c.specialist_type}</span>
            <span class="block text-xs text-brand-ink/45">${c.service}</span>
          </td>
          <td class="py-3 pr-4 text-brand-ink/60 whitespace-nowrap">${c.phone}</td>
          <td class="py-3 pr-4 text-brand-ink/60 whitespace-nowrap">${fmtDate(c.preferred_date)}${c.preferred_time ? ' · ' + c.preferred_time : ''}</td>
          <td class="py-3 pl-2">${badge(c.status)}</td>
        </tr>`).join('')
      : `<tr><td colspan="5" class="py-8 text-center text-sm text-brand-ink/40">No consultation bookings yet.</td></tr>`;
    renderPaginationControls('consultations-pagination', allConsultations.length, consultationsPage, PAGE_SIZE, (p) => { consultationsPage = p; renderConsultations(); });
  }

  fetch('../server/consultations/list.php')
    .then((res) => res.json())
    .then((result) => {
      if (result.success) allConsultations = result.consultations || [];
      renderConsultations();
    })
    .catch(() => {
      if (consultationsBody) consultationsBody.innerHTML = `<tr><td colspan="5" class="py-8 text-center text-sm text-brand-magenta">Couldn't load consultations from the server.</td></tr>`;
    });

  /* ---------- Newsletter subscribers (real database) ---------- */
  const newsletterBody = document.getElementById('newsletter-table-body');
  const newsletterCount = document.getElementById('newsletter-count');
  let newsletterPage = 1;
  let allSubscribers = [];

  function renderNewsletter() {
    if (newsletterCount) newsletterCount.textContent = allSubscribers.length;
    if (!newsletterBody) return;
    const pageRows = paginate(allSubscribers, newsletterPage, PAGE_SIZE);

    newsletterBody.innerHTML = pageRows.length
      ? pageRows.map((s) => `
        <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors">
          <td class="py-3 pr-4 text-brand-ink">${s.email}</td>
          <td class="py-3 pr-4 text-brand-ink/50 whitespace-nowrap">${fmtDate(s.created_at)}</td>
          <td class="py-3 pl-2 text-right">
            <button data-remove-sub="${s.id}" class="text-xs font-semibold text-brand-magenta hover:text-brand-violetDark">Remove</button>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="3" class="py-8 text-center text-sm text-brand-ink/40">No subscribers yet.</td></tr>`;
    renderPaginationControls('newsletter-pagination', allSubscribers.length, newsletterPage, PAGE_SIZE, (p) => { newsletterPage = p; renderNewsletter(); });

    newsletterBody.querySelectorAll('[data-remove-sub]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const res = await fetch('../server/newsletter/unsubscribe.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: btn.dataset.removeSub }),
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error);
          allSubscribers = allSubscribers.filter((s) => String(s.id) !== btn.dataset.removeSub);
          renderNewsletter();
        } catch (err) {
          alert("Couldn't remove this subscriber — please try again.");
        }
      });
    });
  }

  fetch('../server/newsletter/list.php')
    .then((res) => res.json())
    .then((result) => {
      if (result.success) allSubscribers = result.subscribers || [];
      renderNewsletter();
    })
    .catch(() => {
      if (newsletterBody) newsletterBody.innerHTML = `<tr><td colspan="3" class="py-8 text-center text-sm text-brand-magenta">Couldn't load subscribers from the server.</td></tr>`;
    });

  const exportBtn = document.getElementById('newsletter-export');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const csvRows = ['Email,Date Subscribed', ...allSubscribers.map((s) => `${s.email},${fmtDate(s.created_at)}`)];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'beyondtabs-newsletter-subscribers.csv';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  /* ---------- Messages (real database) ---------- */
  const messagesBody = document.getElementById('messages-table-body');
  const messagesCount = document.getElementById('messages-count');
  let messagesPage = 1;
  let allMessages = [];

  function renderMessages() {
    const newCount = allMessages.filter((m) => m.status !== 'Read').length;
    if (messagesCount) messagesCount.textContent = newCount;
    if (!messagesBody) return;
    const pageRows = paginate(allMessages, messagesPage, PAGE_SIZE);

    messagesBody.innerHTML = pageRows.length
      ? pageRows.map((m) => {
          const contact = m.phone || m.email || '—';
          return `
          <tr class="border-b border-brand-ink/5 last:border-0 hover:bg-brand-blush/50 transition-colors align-top">
            <td class="py-3 pr-4 font-medium text-brand-ink whitespace-nowrap">${m.name || 'Anonymous'}</td>
            <td class="py-3 pr-4 text-brand-ink/60 whitespace-nowrap">${contact}</td>
            <td class="py-3 pr-4 text-brand-ink/70 max-w-[280px]">${m.message}</td>
            <td class="py-3 pr-4 text-brand-ink/50 whitespace-nowrap">${fmtDateTime(m.created_at)}</td>
            <td class="py-3 pr-4">${badge(m.status === 'Read' ? 'Read' : 'New')}</td>
            <td class="py-3 pl-2 text-right whitespace-nowrap">
              ${m.status !== 'Read' ? `<button data-mark-read="${m.id}" class="text-xs font-semibold text-brand-violet hover:text-brand-violetDark">Mark read</button>` : ''}
            </td>
          </tr>`;
        }).join('')
      : `<tr><td colspan="6" class="py-8 text-center text-sm text-brand-ink/40">No messages yet.</td></tr>`;
    renderPaginationControls('messages-pagination', allMessages.length, messagesPage, PAGE_SIZE, (p) => { messagesPage = p; renderMessages(); });

    messagesBody.querySelectorAll('[data-mark-read]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        try {
          const res = await fetch('../server/contact/mark_read.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: btn.dataset.markRead }),
          });
          const result = await res.json();
          if (!result.success) throw new Error(result.error);
          const msg = allMessages.find((m) => String(m.id) === btn.dataset.markRead);
          if (msg) msg.status = 'Read';
          renderMessages();
        } catch (err) {
          alert("Couldn't update this message — please try again.");
        }
      });
    });
  }

  fetch('../server/contact/list.php')
    .then((res) => res.json())
    .then((result) => {
      if (result.success) allMessages = result.messages || [];
      renderMessages();
    })
    .catch(() => {
      if (messagesBody) messagesBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-sm text-brand-magenta">Couldn't load messages from the server.</td></tr>`;
    });

  /* ---------- Settings form (backed by store_settings table) ---------- */
  const settingsForm = document.getElementById('settings-form');
  const settingsSaved = document.getElementById('settings-saved');
  const settingsError = document.getElementById('settings-error');
  if (settingsForm) {
    fetch('../server/settings/get.php')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success || !result.settings) return;
        const map = { storeName: 'store_name', phone: 'phone', hoursWeekday: 'hours_weekday', address: 'address' };
        Object.entries(map).forEach(([fieldName, dbKey]) => {
          const field = settingsForm.querySelector(`[name="${fieldName}"]`);
          if (field && result.settings[dbKey] !== undefined) field.value = result.settings[dbKey];
        });
      })
      .catch(() => {
        if (settingsError) {
          settingsError.textContent = "Couldn't load current settings from the server.";
          settingsError.classList.remove('hidden');
        }
      });

    settingsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (settingsError) settingsError.classList.add('hidden');
      const data = Object.fromEntries(new FormData(settingsForm).entries());
      try {
        const res = await fetch('../server/settings/save.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!result.success) throw new Error(result.error || 'Save failed.');
        if (settingsSaved) {
          settingsSaved.classList.remove('hidden');
          setTimeout(() => settingsSaved.classList.add('hidden'), 2500);
        }
      } catch (err) {
        if (settingsError) {
          settingsError.textContent = err.message || "Couldn't save settings — please try again.";
          settingsError.classList.remove('hidden');
        }
      }
    });
  }

  /* ---------- Charts ---------- */
  if (window.Chart) {
    const ordersCtx = document.getElementById('orders-chart');
    if (ordersCtx) {
      new Chart(ordersCtx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Orders',
            data: [14, 19, 16, 22, 27, 31, 24],
            borderColor: '#E2004F',
            backgroundColor: 'rgba(226,0,79,0.08)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#E2004F',
            pointRadius: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(43,10,61,0.06)' } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx) {
      new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
          labels: ['Medications', 'Supplements', 'Skincare', 'Baby & Mom', 'Devices'],
          datasets: [{
            data: [38, 27, 18, 10, 7],
            backgroundColor: ['#E2004F', '#9333EA', '#FF7AC6', '#6B21A8', '#F4ECFE'],
            borderWidth: 0,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, color: '#2B0A3D' } } },
        },
      });
    }
  }

  // Footer year (dashboard has its own copy of this element too)
  const yearEls = document.querySelectorAll('#year');
  yearEls.forEach((el) => (el.textContent = new Date().getFullYear()));
});
