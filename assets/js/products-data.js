/* =========================================================
   BeyondTabs shared product data layer.
   Frontend-only "database": products live in this browser's
   localStorage. The admin dashboard (admin.html) writes to it;
   the public shop page (products.html) reads from it — so on the
   SAME device/browser, products added in admin appear on the
   storefront immediately. There is no server yet, so this does
   NOT sync across different devices or visitors. Swap load()/save()
   for real API calls to a backend when one exists.
   ========================================================= */
window.BeyondTabsProducts = (function () {
  const KEY = 'beyondtabs_products';

  const CATEGORIES = ['Medications', 'Supplements', 'Skincare', 'Wellness', 'Mother & Baby'];

  const SEED = [
    { id: 'seed-1', sku: 'BT-PDX-020', name: 'Panadol Extra (20 tablets)', category: 'Medications', price: 1500, stock: 130, blurb: 'Fast-acting relief for headaches, body pain and fever.', rx: false },
    { id: 'seed-2', sku: 'BT-AMX-021', name: 'Amoxicillin 500mg (21 capsules)', category: 'Medications', price: 3200, stock: 8, blurb: 'Broad-spectrum antibiotic for bacterial infections.', rx: true },
    { id: 'seed-3', sku: 'BT-FLZ-020', name: 'Flagyl 500mg — Metronidazole (20 tablets)', category: 'Medications', price: 5000, stock: 15, blurb: 'Prescription antibiotic and antiprotozoal for bacterial and parasitic infections.', rx: true },
    { id: 'seed-4', sku: 'BT-LIS-030', name: 'Lisinopril 10mg (30 tablets)', category: 'Medications', price: 3400, stock: 12, blurb: 'Daily blood pressure management, as prescribed by your doctor.', rx: true },
    { id: 'seed-5', sku: 'BT-CG-030', name: 'CellGevity (30 capsules)', category: 'Supplements', price: 45000, stock: 42, blurb: 'Glutathione-support supplement built on RiboCeine technology.', rx: false },
    { id: 'seed-6', sku: 'BT-MVT-060', name: 'Daily Multivitamin (60 capsules)', category: 'Supplements', price: 6200, stock: 5, blurb: 'A well-rounded multivitamin for everyday energy and immunity.', rx: false },
    { id: 'seed-7', sku: 'BT-OM3-060', name: 'Omega-3 Capsules (60 capsules)', category: 'Supplements', price: 8700, stock: 38, blurb: 'Supports heart, joint and brain health.', rx: false },
    { id: 'seed-8', sku: 'BT-PCS-001', name: 'PCOS Combo — Women\u2019s Care', category: 'Supplements', price: 150000, stock: 6, blurb: 'A supplement bundle formulated to support hormonal balance.', rx: false },
    { id: 'seed-9', sku: 'BT-VCB-030', name: 'Vitamin C Brightening Serum', category: 'Skincare', price: 50000, stock: 9, blurb: 'Evens tone and adds glow — best for normal to cool skin types.', rx: false },
    { id: 'seed-10', sku: 'BT-HAS-030', name: 'Hyaluronic Acid Serum', category: 'Skincare', price: 9800, stock: 24, blurb: 'Deep hydration for dry or dehydrated skin, any skin type.', rx: false },
    { id: 'seed-11', sku: 'BT-RNC-050', name: 'Retinol Night Cream', category: 'Skincare', price: 14500, stock: 17, blurb: 'Gentle nightly renewal — start slow if you\u2019re new to retinol.', rx: false },
    { id: 'seed-12', sku: 'BT-SPF-050', name: 'Sunscreen SPF50', category: 'Skincare', price: 7200, stock: 3, blurb: 'Broad-spectrum daily protection for Lagos sun and humidity.', rx: false },
    { id: 'seed-13', sku: 'BT-CRJ-001', name: 'Cold-Pressed Retinol Juice', category: 'Wellness', price: 10000, stock: 20, blurb: 'A cold-pressed wellness drink for skin-from-within support.', rx: false },
    { id: 'seed-14', sku: 'BT-GLU-001', name: 'Digital Glucometer Kit', category: 'Wellness', price: 18500, stock: 11, blurb: 'At-home blood glucose monitoring with 25 test strips included.', rx: false },
    { id: 'seed-15', sku: 'BT-BPM-001', name: 'Digital Blood Pressure Monitor', category: 'Wellness', price: 25000, stock: 0, blurb: 'Accurate, easy-to-read arm cuff monitor for home use.', rx: false },
    { id: 'seed-16', sku: 'BT-PNV-060', name: 'Prenatal Multivitamin (60 tablets)', category: 'Mother & Baby', price: 7500, stock: 19, blurb: 'Folic acid, iron and essential nutrients for pregnancy.', rx: false },
  ];

  function computeStatus(stock) {
    const n = Number(stock);
    if (!n || n <= 0) return 'Out of Stock';
    if (n <= 10) return 'Low Stock';
    return 'In Stock';
  }

  function save(list) {
    try {
      localStorage.setItem(KEY, JSON.stringify(list));
    } catch (err) {
      /* localStorage unavailable — changes won't persist this session */
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (err) {
      /* fall through to seed */
    }
    save(SEED);
    return SEED.slice();
  }

  function getAll() {
    return load().map((p) => ({ ...p, status: computeStatus(p.stock) }));
  }

  function skuFor(category, list) {
    const code = (category || 'GEN').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'GEN';
    const seq = list.filter((p) => p.category === category).length + 1;
    return `BT-${code}-${String(seq).padStart(3, '0')}`;
  }

  function add(product) {
    const list = load();
    const id = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const record = {
      id,
      sku: skuFor(product.category, list),
      name: product.name,
      category: product.category,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      blurb: product.blurb || '',
      rx: !!product.rx,
    };
    list.unshift(record);
    save(list);
    return record;
  }

  function update(id, changes) {
    const list = load();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...changes,
      price: Number(changes.price ?? list[idx].price) || 0,
      stock: Number(changes.stock ?? list[idx].stock) || 0,
      rx: changes.rx !== undefined ? !!changes.rx : list[idx].rx,
    };
    save(list);
    return list[idx];
  }

  function remove(id) {
    const list = load().filter((p) => p.id !== id);
    save(list);
  }

  function resetToSeed() {
    save(SEED);
    return getAll();
  }

  return { getAll, add, update, remove, resetToSeed, computeStatus, CATEGORIES };
})();
