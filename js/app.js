// State
let cart = [];
let note = "";
let currentSaleMode = 'retail';
let productsCache = [];
let customersCache = [];
let expensesCache = [];
let currentUser = null;
let salesTrendChart = null;
let topItemsChart = null;
let currentCouponCode = null;



// Formatting
const currencyFormatter = new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
});

const dateFormatter = new Intl.DateTimeFormat('en-LK', {
    dateStyle: 'medium',
    timeStyle: 'short'
});

// Category Colors for Cards
const categoryColors = {
    'T-Shirts': 'from-blue-400 to-blue-600',
    'Shirts': 'from-indigo-400 to-indigo-600',
    'Trousers': 'from-slate-600 to-slate-800',
    'Denims': 'from-sky-600 to-sky-800',
    'Frocks': 'from-pink-400 to-rose-600',
    'Sarees': 'from-fuchsia-500 to-purple-700',
    'Sarongs': 'from-amber-600 to-orange-700',
    'Kurtas': 'from-teal-400 to-emerald-600',
    'Blouses': 'from-purple-400 to-purple-600',
    'Skirts': 'from-rose-400 to-pink-500',
    'Innerwear': 'from-rose-300 to-rose-400',
    'Underwear': 'from-rose-300 to-rose-400',
    'Baniams': 'from-gray-200 to-gray-400 text-slate-700', // Light color for white baniams
    'Socks': 'from-orange-300 to-orange-500',
    'Hats': 'from-red-400 to-red-600',
    'Kids': 'from-yellow-400 to-amber-500',
    'Shorts': 'from-lime-400 to-green-600',
    'Accessories': 'from-cyan-400 to-blue-500',
    'default': 'from-indigo-400 to-purple-600'
};

const categoryIcons = {
    'T-Shirts': 'shirt',
    'Shirts': 'shirt', // Formal/Casual shirts
    'Trousers': 'move-vertical',
    'Denims': 'layers',
    'Frocks': 'scissors',
    'Sarees': 'sparkles', // Premium look
    'Sarongs': 'rectangle-vertical', // Shape of a sarong
    'Kurtas': 'flower-2', // Patterned
    'Blouses': 'flower',
    'Skirts': 'umbrella',
    'Shorts': 'scissors', // Cut trousers
    'Innerwear': 'heart',
    'Underwear': 'heart',
    'Baniams': 'shield',
    'Socks': 'footprints',
    'Hats': 'sun',
    'Kids': 'baby',
    'Accessories': 'watch',
    'default': 'tag'
};

// Restoration & Migration Logic
async function ensureSampleData() {
    const products = await db.products.toArray();

    // 1. Migration for missing fields
    for (const p of products) {
        if (p.size === undefined || p.color === undefined || p.costPrice === undefined) {
            await db.products.update(p.id, {
                size: p.size || 'M',
                color: p.color || 'Standard',
                costPrice: p.costPrice || (p.retailPrice * 0.7)
            });
        }
    }

    const customers = await db.customers.toArray();
    for (const c of customers) {
        if (c.tier === undefined) {
            await db.customers.update(c.id, { tier: 'Silver' });
        }
    }

    // 2. Comprehensive Inventory Data
    const inventoryData = [
        { name: 'Slim Fit Cotton Shirt', category: 'Shirts', size: 'S', color: 'White', retailPrice: 2800, wholesalePrice: 2200, costPrice: 1800, stockQty: 15, source: 'In-house', barcode: 'SHT-WHT-S' },
        { name: 'Slim Fit Cotton Shirt', category: 'Shirts', size: 'M', color: 'White', retailPrice: 2800, wholesalePrice: 2200, costPrice: 1800, stockQty: 25, source: 'In-house', barcode: 'SHT-WHT-M' },
        { name: 'Slim Fit Cotton Shirt', category: 'Shirts', size: 'L', color: 'White', retailPrice: 2800, wholesalePrice: 2200, costPrice: 1800, stockQty: 20, source: 'In-house', barcode: 'SHT-WHT-L' },
        { name: 'Slim Fit Cotton Shirt', category: 'Shirts', size: 'M', color: 'Midnight Blue', retailPrice: 2800, wholesalePrice: 2200, costPrice: 1800, stockQty: 18, source: 'In-house', barcode: 'SHT-BLU-M' },

        { name: 'Classic Blue Denims', category: 'Denims', size: '30', color: 'Indigo', retailPrice: 3500, wholesalePrice: 2800, costPrice: 2400, stockQty: 12, source: 'Outsourced', barcode: 'DEN-IND-30' },
        { name: 'Classic Blue Denims', category: 'Denims', size: '32', color: 'Indigo', retailPrice: 3500, wholesalePrice: 2800, costPrice: 2400, stockQty: 30, source: 'Outsourced', barcode: 'DEN-IND-32' },
        { name: 'Classic Blue Denims', category: 'Denims', size: '34', color: 'Indigo', retailPrice: 3500, wholesalePrice: 2800, costPrice: 2400, stockQty: 15, source: 'Outsourced', barcode: 'DEN-IND-34' },

        { name: 'Floral Summer Frock', category: 'Frocks', size: 'S', color: 'Rose Pink', retailPrice: 4500, wholesalePrice: 3800, costPrice: 3200, stockQty: 8, source: 'Outsourced', barcode: 'FRK-PNK-S' },
        { name: 'Floral Summer Frock', category: 'Frocks', size: 'M', color: 'Rose Pink', retailPrice: 4500, wholesalePrice: 3800, costPrice: 3200, stockQty: 12, source: 'Outsourced', barcode: 'FRK-PNK-M' },

        { name: 'Handloom Cotton Sarong', category: 'Sarongs', size: 'Free', color: 'Blue Check', retailPrice: 1800, wholesalePrice: 1400, costPrice: 1100, stockQty: 40, source: 'In-house', barcode: 'SAR-BLU-CHK' },
        { name: 'Handloom Cotton Sarong', category: 'Sarongs', size: 'Free', color: 'Red Check', retailPrice: 1800, wholesalePrice: 1400, costPrice: 1100, stockQty: 35, source: 'In-house', barcode: 'SAR-RED-CHK' },

        { name: 'Premium Silk Saree', category: 'Sarees', size: '6m', color: 'Royal Maroon', retailPrice: 8500, wholesalePrice: 7000, costPrice: 6000, stockQty: 5, source: 'Outsourced', barcode: 'SRE-MAR-6M' },

        { name: 'Cotton Crew Neck Tee', category: 'T-Shirts', size: 'M', color: 'Charcoal Grey', retailPrice: 1200, wholesalePrice: 950, costPrice: 750, stockQty: 50, source: 'In-house', barcode: 'TSH-GRY-M' },
        { name: 'Cotton Crew Neck Tee', category: 'T-Shirts', size: 'L', color: 'Charcoal Grey', retailPrice: 1200, wholesalePrice: 950, costPrice: 750, stockQty: 45, source: 'In-house', barcode: 'TSH-GRY-L' }
    ];

    for (const item of inventoryData) {
        const found = products.find(p => p.name === item.name && p.size === item.size && p.color === item.color);
        if (!found) {
            await db.products.add(item);
        }
    }

    // 3. Seed Coupons
    const couponCount = await db.coupons.count();
    if (couponCount === 0) {
        await db.coupons.bulkAdd([
            { code: 'SALE10', type: 'percentage', value: 10, expiry: '2026-12-31' },
            { code: 'WELCOME500', type: 'fixed', value: 500, expiry: '2026-12-31' }
        ]);
    }

    loadInventory();
    loadPOS();
}

async function ensureAdminUser() {
    const uCount = await db.users.count();
    if (uCount === 0) {
        await db.users.bulkAdd([
            {
                username: 'admin',
                password: '240be518fabd2724ddb6f0403bf3d352c4a03783a3a4115e612984587a6c906c', // admin123
                role: 'admin'
            },
            {
                username: 'staff',
                password: '240be518fabd2724ddb6f0403bf3d352c4a03783a3a4115e612984587a6c906c', // admin123
                role: 'staff'
            }
        ]);
        console.log("Admin Users Seeded");
    }
}


// --- Security & Auth ---

// SHA-256 Hashing for passwords
// SHA-256 Hashing for passwords (with fallback for non-secure contexts like file://)
async function hashPassword(password) {
    if (!window.crypto || !window.crypto.subtle) {
        console.warn("Security Warning: Crypto Subtle not available. Using simple fallback hashing (Not for production).");
        // Simple hash fallback if crypto is missing (standard in file:// or old browsers)
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return "fallback_" + hash;
    }
    const msgUint8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}


async function checkAuth() {
    const savedUser = sessionStorage.getItem('pos_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('login-overlay').classList.add('hidden');
        updateNavForRole();
    } else {
        document.getElementById('login-overlay').classList.remove('hidden');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.classList.add('hidden');

    try {
        const hashedPassword = await hashPassword(password);
        const user = await db.users.where('username').equalsIgnoreCase(username).first();

        if (user) {
            if (user.password === hashedPassword || (user.password === '240be518fabd2724ddb6f0403bf3d352c4a03783a3a4115e612984587a6c906c' && password === 'admin123')) {
                currentUser = { id: user.id, username: user.username, role: user.role };
                sessionStorage.setItem('pos_user', JSON.stringify(currentUser));
                document.getElementById('login-overlay').classList.add('hidden');
                updateNavForRole();
                navigate('dashboard');
                e.target.reset();
            } else {
                errorEl.classList.remove('hidden');
            }
        } else {
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        alert("Authentication system error. Please refresh.");
    }
}


function handleLogout() {
    sessionStorage.removeItem('pos_user');
    currentUser = null;
    document.getElementById('login-overlay').classList.remove('hidden');
    navigate('dashboard'); // Reset to dashboard for next login
}



function updateNavForRole() {
    if (!currentUser) return;

    // Hide/Show items based on role
    const isAdmin = currentUser.role === 'admin';

    // If staff, hide restricted areas
    const restrictedItems = ['nav-inventory', 'nav-reports', 'nav-vendors', 'nav-expenses', 'nav-customers', 'nav-users', 'nav-coupons'];
    restrictedItems.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (isAdmin) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });

    // Dashboard Profit Card restriction
    const profitCard = document.getElementById('dash-profit-card');
    if (profitCard) {
        if (isAdmin) {
            profitCard.classList.remove('hidden');
        } else {
            profitCard.classList.add('hidden');
        }
    }

    // Profile Initials
    const profileBtn = document.querySelector('[title="Shop Settings"]');
    if (profileBtn) {
        profileBtn.textContent = currentUser.username.charAt(0).toUpperCase();
        // Only admin can access settings
        if (!isAdmin) {
            profileBtn.onclick = () => alert("Access Denied: Settings are for Admin only.");
        } else {
            profileBtn.onclick = () => openModal('settings-modal');
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    await ensureAdminUser(); // Ensure users exist
    await checkAuth();
    ensureSampleData(); // Run migration check


    // Add Login Form Listener
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Handle Initial Navigation (Check Hash or Default)
    const hash = window.location.hash.replace('#', '');
    const validViews = ['dashboard', 'pos', 'inventory', 'reports', 'vendors', 'customers', 'expenses', 'returns', 'users', 'coupons'];
    if (hash && validViews.includes(hash)) {
        navigate(hash, false);
    } else {
        navigate('dashboard', true); // Replace state or push initial
    }

    updateDate();
    setInterval(updateDate, 60000);

    // Back Button Support
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.view) {
            navigate(event.state.view, false);
        } else {
            navigate('dashboard', false);
        }
    });

    // Initial Data Loads
    loadVendors();
    loadCustomers();
    document.getElementById('vendor-form').addEventListener('submit', handleVendorSubmit);

    // Customer Logic
    document.getElementById('customer-form').addEventListener('submit', handleCustomerSubmit);

    // Expense Logic
    document.getElementById('expense-form').addEventListener('submit', handleExpenseSubmit);


    // Product Logic
    document.getElementById('product-form').addEventListener('submit', handleProductSubmit);
    document.getElementById('inv-search').addEventListener('input', (e) => loadInventory(e.target.value));

    // POS Logic
    // Smart Search for Barcode Scanning
    const posSearch = document.getElementById('pos-search');
    posSearch.addEventListener('input', (e) => handlePosSearchInput(e.target.value));
    posSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handlePosSearchInput(e.target.value, true);
    });

    document.getElementById('pos-category-filter').addEventListener('change', (e) => loadPosGrid(document.getElementById('pos-search').value, e.target.value));

    // Cart inputs
    document.getElementById('cart-discount').addEventListener('input', updateCartUI);

    // Settings logic
    document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
    initSettings();
    updateHoldCount();

    // User Mgmt logic
    document.getElementById('user-mgmt-form').addEventListener('submit', handleUserMgmtSubmit);

    // Coupon logic
    document.getElementById('coupon-form').addEventListener('submit', handleCouponSubmit);
});


// App Settings
const defaultSettings = {
    name: "URBAN VOGUE",
    address: "No. 55, Independence Arcade, Colombo 07",
    phone: "077-7123456",
    footer: "Thank You & Come Again!"
};

function getSettings() {
    return JSON.parse(localStorage.getItem('pos_settings')) || defaultSettings;
}

function initSettings() {
    const s = getSettings();
    document.getElementById('settings-form').addEventListener('submit', handleSettingsSubmit);
    // Update headers if any exist in DOM that need dynamic updating (optional)
}

function handleSettingsSubmit(e) {
    e.preventDefault();
    const settings = {
        name: document.getElementById('set-shop-name').value,
        address: document.getElementById('set-address').value,
        phone: document.getElementById('set-phone').value,
        footer: document.getElementById('set-footer').value
    };
    localStorage.setItem('pos_settings', JSON.stringify(settings));
    closeModal('settings-modal');
    alert("Settings Saved! Receipt header updated.");
}

function checkNetworkStatus() {
    const isOnline = navigator.onLine;
    const text = isOnline ? "System is Online & Synced" : "Offline Mode Active";
    alert(text);
}

function updateDate() {
    const now = new Date();
    document.getElementById('current-date').textContent = dateFormatter.format(now);
}

// Navigation
function navigate(viewId, addToHistory = true) {
    if (!currentUser) return;

    // RBAC Check
    const restrictedItems = ['inventory', 'reports', 'vendors', 'customers', 'expenses'];
    if (currentUser.role !== 'admin' && restrictedItems.includes(viewId)) {
        alert("Access Denied: You do not have permission to view this section.");
        return;
    }


    // Hide all views

    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(el => {
        el.classList.remove('bg-indigo-500/10', 'text-white', 'border-l-4', 'border-indigo-500');
        el.classList.add('text-slate-400');
        // Reset icon color
        const icon = el.querySelector('i'); // Lucide replaces i with svg but keeps class? No, it replaces.
        // Actually best to re-render or just toggle classes on svg if possible. 
        // Simpler: Just rely on CSS group-hover for default state, and add active state here.
    });

    // Show selected
    document.getElementById(`${viewId}-view`).classList.remove('hidden');
    const navBtn = document.getElementById(`nav-${viewId}`);
    if (navBtn) {
        navBtn.classList.add('bg-slate-700/50', 'text-white', 'border-l-4', 'border-indigo-400');
        navBtn.classList.remove('text-slate-400');
    }

    // Update History
    if (addToHistory) {
        history.pushState({ view: viewId }, null, `#${viewId}`);
    }

    // Update Title
    const titles = {
        'dashboard': 'Dashboard Overview',
        'pos': 'Point of Sale Terminal',
        'inventory': 'Inventory Management',
        'reports': 'Sales Analytics & Reports',
        'vendors': 'Vendor Directory',
        'customers': 'Customer Management',
        'expenses': 'Expense Tracker',
        'returns': 'Returns & Exchanges',
        'users': 'User Management',
        'coupons': 'Coupons & Promos'
    };
    document.getElementById('page-title').textContent = titles[viewId];

    // Refresh Data
    if (viewId === 'dashboard') loadDashboard();
    if (viewId === 'inventory') {
        if (!window.keepInventoryFilter) window.inventoryFilter = null;
        window.keepInventoryFilter = false;
        loadInventory();
        if (window.inventoryFilter === 'low-stock') {
            document.getElementById('inv-search').value = "Low Stock Items";
        } else {
            document.getElementById('inv-search').value = "";
        }
    }
    if (viewId === 'pos') loadPOS();
    if (viewId === 'reports') loadReports();
    if (viewId === 'vendors') loadVendors();
    if (viewId === 'customers') loadCustomers();
    if (viewId === 'expenses') loadExpenses();
    if (viewId === 'returns') loadReturns();
    if (viewId === 'users') loadUsers();
    if (viewId === 'coupons') loadCoupons();
}


function navigateToLowStock() {
    window.inventoryFilter = 'low-stock';
    window.keepInventoryFilter = true;
    navigate('inventory');
}

// --- Dashboard ---
async function loadDashboard() {
    const todayStr = new Date().toLocaleDateString();
    const sales = await db.sales.toArray();

    const todaysSales = sales.filter(s => new Date(s.date).toLocaleDateString() === todayStr);
    const validSales = todaysSales.filter(s => s.status !== 'returned');

    const expenses = await db.expenses.toArray();
    const todaysExpenses = expenses.filter(e => new Date(e.date).toLocaleDateString() === todayStr);
    const totalExpense = todaysExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalRevenue = validSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalCost = validSales.reduce((sum, s) => sum + (s.totalCost || 0), 0);
    const totalProfit = (totalRevenue - totalCost) - totalExpense;

    const lowStockCount = await db.products.where('stockQty').below(10).count();

    document.getElementById('dash-total-sales').textContent = currencyFormatter.format(totalRevenue);
    document.getElementById('dash-order-count').textContent = validSales.length;
    document.getElementById('dash-low-stock').textContent = lowStockCount;
    document.getElementById('dash-profit').textContent = currencyFormatter.format(totalProfit);

    updateCharts(sales);

    // Recent Table
    const recent = [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const tbody = document.getElementById('dash-recent-sales');
    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-slate-400">No recent transactions</td></tr>`;
    } else {
        document.getElementById('dash-recent-sales').innerHTML = recent.map(s => `
        <tr class="hover:bg-slate-50 transition">
            <td class="pl-4 py-3 font-bold text-slate-700">#${s.id}</td>
            <td class="py-3 font-extrabold text-indigo-600">${currencyFormatter.format(s.totalAmount)}</td>
            <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase ${s.type === 'retail' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}">${s.type}</span></td>
            <td class="pr-4 py-3 text-right text-slate-400 font-medium">${new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
    `).join('');

        // --- Best Sellers ---
        const itemCounts = {};
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!itemCounts[item.name]) itemCounts[item.name] = { qty: 0, category: item.category };
                itemCounts[item.name].qty += item.qty;
            });
        });

        const topItems = Object.entries(itemCounts)
            .sort((a, b) => b[1].qty - a[1].qty)
            .slice(0, 5);

        document.getElementById('dash-best-sellers').innerHTML = topItems.map(([name, data]) => `
        <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 transition hover:bg-white hover:shadow-sm">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <i data-lucide="${categoryIcons[data.category] || 'tag'}" class="w-4 h-4"></i>
                </div>
                <div>
                   <h6 class="text-sm font-bold text-slate-700 leading-tight">${name}</h6>
                   <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${data.category}</p>
                </div>
            </div>
            <div class="text-right">
                <span class="text-sm font-black text-indigo-600">${data.qty}</span>
                <span class="text-[10px] text-slate-400 block font-bold">SOLD</span>
            </div>
        </div>
    `).join('');
    }
    lucide.createIcons();
}

// --- Inventory ---
async function loadInventory(query = '') {
    let products = await db.products.toArray();
    productsCache = products;

    if (query) {
        const lower = query.toLowerCase();
        products = products.filter(p => p.name.toLowerCase().includes(lower) || p.category.toLowerCase().includes(lower));
    }

    const tbody = document.getElementById('inventory-table-body');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-10 text-slate-400">No products found. Add one to get started.</td></tr>`;
    } else {
        if (window.inventoryFilter === 'low-stock') {
            products.sort((a, b) => a.stockQty - b.stockQty);
        }

        tbody.innerHTML = products.map(p => `
            <tr class="hover:bg-indigo-50/30 transition group border-b border-slate-50">
                <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                            ${p.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-bold text-slate-700">${p.name}</div>
                            <div class="flex gap-2 mt-0.5">
                                 <div class="text-[10px] text-slate-400 font-medium badge badge-outline border border-slate-200 px-1 rounded">${p.source}</div>
                                 <div class="text-[10px] ${p.gender === 'Female' ? 'bg-pink-50 text-pink-500 border-pink-100' : p.gender === 'Male' ? 'bg-blue-50 text-blue-500 border-blue-100' : 'bg-slate-50 text-slate-500 border-slate-200'} font-bold px-1 rounded border uppercase">${p.gender || 'Unisex'}</div>
                                 ${p.size ? `<span class="text-[10px] bg-indigo-50 text-indigo-500 font-bold px-1 rounded border border-indigo-100 uppercase">${p.size}</span>` : ''}
                                 ${p.color ? `<span class="text-[10px] bg-slate-50 text-slate-500 font-bold px-1 rounded border border-slate-200 uppercase">${p.color}</span>` : ''}
                            </div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4"><span class="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 border border-slate-200">${p.category}</span></td>

                <td class="px-6 py-4 text-right">
                    <span class="font-bold ${p.stockQty < 10 ? 'text-red-500 bg-red-50 px-2 py-1 rounded' : 'text-slate-600'}">${p.stockQty}</span>
                </td>
                <td class="px-6 py-4 text-right text-slate-600 font-mono text-sm">${currencyFormatter.format(p.retailPrice)}</td>
                <td class="px-6 py-4 text-right text-slate-600 font-mono text-sm">${currencyFormatter.format(p.wholesalePrice)}</td>
                <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onclick="printBarcode(${p.id})" title="Print Barcode" class="p-2 hover:bg-white hover:shadow text-slate-600 rounded-lg transition-all border border-transparent hover:border-slate-100"><i data-lucide="barcode" class="w-4 h-4"></i></button>
                        <button onclick="editProduct(${p.id})" class="p-2 hover:bg-white hover:shadow text-indigo-600 rounded-lg transition-all border border-transparent hover:border-indigo-100"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                        <button onclick="deleteProduct(${p.id})" class="p-2 hover:bg-white hover:shadow text-red-500 rounded-lg transition-all border border-transparent hover:border-red-100"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    lucide.createIcons();
}

async function handleProductSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('prod-id').value;
    const product = {
        name: document.getElementById('prod-name').value,
        barcode: document.getElementById('prod-barcode').value,
        category: document.getElementById('prod-category').value,
        source: document.getElementById('prod-source').value,
        stockQty: parseInt(document.getElementById('prod-stock').value),
        retailPrice: parseFloat(document.getElementById('prod-retail').value),
        wholesalePrice: parseFloat(document.getElementById('prod-wholesale').value),
        size: document.getElementById('prod-size').value,
        color: document.getElementById('prod-color').value,
        gender: document.getElementById('prod-gender').value
    };

    if (id) {
        await db.products.update(parseInt(id), product);
    } else {
        await db.products.add(product);
    }

    closeModal('product-modal');
    loadInventory();
    e.target.reset();
}

async function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        await db.products.delete(id);
        loadInventory();
    }
}

function editProduct(id) {
    const p = productsCache.find(x => x.id === id);
    if (!p) return;

    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-barcode').value = p.barcode || '';
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-source').value = p.source;
    document.getElementById('prod-stock').value = p.stockQty;
    document.getElementById('prod-retail').value = p.retailPrice;
    document.getElementById('prod-wholesale').value = p.wholesalePrice;
    document.getElementById('prod-size').value = p.size || '';
    document.getElementById('prod-color').value = p.color || '';
    document.getElementById('prod-gender').value = p.gender || 'Unisex';

    document.getElementById('modal-title').innerText = 'Edit Product';
    openModal('product-modal');
}

// --- POS ---
async function loadPOS() {
    const products = await db.products.toArray();
    productsCache = products;

    // Setup filter
    const categories = [...new Set(products.map(p => p.category))];
    const filterSelect = document.getElementById('pos-category-filter');
    if (filterSelect) {
        filterSelect.innerHTML = '<option value="">All Categories</option>' + categories.map(c => `< option value = "${c}" > ${c}</option > `).join('');
    }

    loadPosGrid();
    await renderCustomerSelect(); // Ensure customers are loaded in POS
}

function loadPosGrid(query = '', category = '') {
    let list = productsCache.filter(p => p.stockQty > 0);

    if (query) {
        const lower = query.toLowerCase().trim();
        list = list.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            (p.barcode && p.barcode.includes(lower))
        );
    }
    if (category) {
        list = list.filter(p => p.category === category);
    }

    const grid = document.getElementById('pos-product-grid');
    if (list.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
                <i data-lucide="package-search" class="w-16 h-16 mb-4 opacity-50"></i>
                <p class="text-lg font-medium">No products found</p>
            </div>
        `;
    } else {
        const grouped = {};
        list.forEach(p => {
            if (!grouped[p.name]) {
                grouped[p.name] = {
                    ...p,
                    variantCount: 0,
                    totalStock: 0,
                    minPrice: p.retailPrice,
                    maxPrice: p.retailPrice
                };
            }
            grouped[p.name].variantCount++;
            grouped[p.name].totalStock += p.stockQty;
            const price = currentSaleMode === 'retail' ? p.retailPrice : p.wholesalePrice;
            if (price < grouped[p.name].minPrice) grouped[p.name].minPrice = price;
            if (price > grouped[p.name].maxPrice) grouped[p.name].maxPrice = price;
        });

        grid.innerHTML = Object.values(grouped).map(p => {
            const price = currentSaleMode === 'retail' ? p.retailPrice : p.wholesalePrice;
            const colorClass = categoryColors[p.category] || categoryColors['default'];
            const iconName = categoryIcons[p.category] || categoryIcons['default'];
            const displayPrice = p.variantCount > 1 && p.minPrice !== p.maxPrice
                ? `${currencyFormatter.format(p.minPrice)} - ${currencyFormatter.format(p.maxPrice)}`
                : currencyFormatter.format(price);

            const nameParam = JSON.stringify(p.name);

            return `
                <div onclick='openVariantSelector(${nameParam})' class="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer overflow-hidden flex flex-col h-48">
                    <div class="h-24 bg-gradient-to-br ${colorClass} p-4 flex justify-center items-center relative">
                        <div class="absolute top-2 right-2 bg-white/20 backdrop-blur text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ${p.totalStock} Total
                        </div>
                        ${p.variantCount > 1 ? `<div class="absolute top-2 left-2 bg-indigo-600/80 backdrop-blur text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-indigo-400/50 shadow-sm">${p.variantCount} Options</div>` : ''}
                        <i data-lucide="${iconName}" class="text-white w-10 h-10 drop-shadow-md transform group-hover:scale-110 transition-transform duration-300"></i>
                    </div>
                    <div class="p-3 flex-1 flex flex-col justify-between">
                        <div>
                            <h4 class="font-bold text-slate-700 leading-tight line-clamp-2 text-sm group-hover:text-indigo-600 transition-colors">${p.name}</h4>
                            <span class="text-[10px] text-slate-400 font-medium uppercase block mt-1">${p.category}</span>
                        </div>
                        <div class="flex items-end justify-between mt-2">
                            <span class="text-xs font-extrabold text-slate-800">${displayPrice}</span>
                            <div class="w-8 h-8 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                                <i data-lucide="layers" class="w-4 h-4"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
    lucide.createIcons();
}

async function openVariantSelector(productName) {
    const variants = productsCache.filter(p => p.name === productName);
    if (variants.length === 0) return;

    const modal = document.getElementById('variant-modal');
    const grid = document.getElementById('variant-options-grid');
    const title = document.getElementById('variant-product-name');
    if (!modal || !grid) return;

    title.textContent = productName;
    grid.innerHTML = variants.map(v => {
        const price = currentSaleMode === 'retail' ? v.retailPrice : v.wholesalePrice;
        const outOfStock = v.stockQty <= 0;
        return `
            <button ${outOfStock ? 'disabled' : `onclick="addToCart(${v.id}); document.getElementById('variant-modal').classList.add('hidden');"`}
                class="flex flex-col items-start p-6 rounded-3xl border-2 transition-all text-left relative overflow-hidden group
                ${outOfStock ? 'bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed' : 'bg-white border-slate-100 hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1'}">
                <div class="flex gap-2 mb-3">
                    ${v.size ? `<span class="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-sm shadow-indigo-200">${v.size}</span>` : ''}
                    ${v.color ? `<span class="bg-white text-slate-500 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-200">${v.color}</span>` : ''}
                </div>
                <div class="font-black text-slate-800 text-2xl group-hover:text-indigo-600 transition-colors">${currencyFormatter.format(price)}</div>
                <div class="text-[11px] text-slate-400 font-bold mt-1 uppercase tracking-tight">${v.stockQty} Units In Stock</div>
            </button>
        `;
    }).join('');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    lucide.createIcons();
}

function setSaleMode(mode) {
    currentSaleMode = mode;
    const btnRetail = document.getElementById('btn-retail');
    const btnWholesale = document.getElementById('btn-wholesale');

    const activeClasses = "bg-indigo-600 text-white shadow-md";
    const inactiveClasses = "text-slate-500 hover:text-slate-800 hover:bg-slate-100/50";

    btnRetail.className = "px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wide transition-all " + (mode === 'retail' ? activeClasses : inactiveClasses);
    btnWholesale.className = "px-3 py-1.5 text-xs font-bold rounded-md uppercase tracking-wide transition-all " + (mode === 'wholesale' ? activeClasses : inactiveClasses);

    loadPosGrid(document.getElementById('pos-search').value, document.getElementById('pos-category-filter').value);
    updateCartUI();
}

function addToCart(productId) {
    const product = productsCache.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(i => i.id === productId);
    const currentQty = existing ? existing.qty : 0;

    if (currentQty + 1 > product.stockQty) {
        alert("Out of Stock!");
        return;
    }

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            qty: 1,
            retailPrice: product.retailPrice,
            wholesalePrice: product.wholesalePrice,
            category: product.category,
            size: product.size || '',
            color: product.color || ''
        });
    }
    updateCartUI();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartQty(index, change) {
    const item = cart[index];
    const product = productsCache.find(p => p.id === item.id);

    if (item.qty + change > product.stockQty) {
        alert("Not enough stock");
        return;
    }

    item.qty += change;
    if (item.qty <= 0) cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    const container = document.getElementById('cart-items');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-64 text-slate-300">
                <i data-lucide="shopping-cart" class="w-16 h-16 mb-4 opacity-30"></i>
                <p class="font-medium">Your cart is empty</p>
                <p class="text-xs">Scan or click items to add</p>
            </div>`;
    } else {
        container.innerHTML = cart.map((item, index) => {
            const price = currentSaleMode === 'retail' ? item.retailPrice : item.wholesalePrice;
            const iconName = categoryIcons[item.category] || 'tag';

            return `
                <div class="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm animate-fade-in">
                    <div class="flex items-center gap-3 flex-1 overflow-hidden">
                        <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                             <i data-lucide="${iconName}" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0 flex-1">
                            <h5 class="font-bold text-sm text-slate-700 leading-tight">${item.name}</h5>
                            <div class="flex flex-wrap gap-1.5 mt-1.5">
                                ${item.size ? `<span class="text-[10px] bg-indigo-600 text-white font-black px-2 py-0.5 rounded-lg uppercase shadow-sm shadow-indigo-100">${item.size}</span>` : ''}
                                ${item.color ? `<span class="text-[10px] bg-white text-slate-500 font-black px-2 py-0.5 rounded-lg uppercase border border-slate-200">${item.color}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3 ml-2">
                        <div class="flex items-center bg-slate-100 rounded-lg p-0.5">
                            <button onclick="updateCartQty(${index}, -1)" class="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center hover:text-indigo-600 transition"><i data-lucide="minus" class="w-3 h-3"></i></button>
                            <span class="text-sm font-bold w-6 text-center text-slate-700">${item.qty}</span>
                            <button onclick="updateCartQty(${index}, 1)" class="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center hover:text-indigo-600 transition"><i data-lucide="plus" class="w-3 h-3"></i></button>
                        </div>
                        <div class="text-right w-16">
                            <div class="font-bold text-sm text-indigo-600">${currencyFormatter.format(price * item.qty)}</div>
                        </div>
                         <button onclick="removeFromCart(${index})" class="text-slate-300 hover:text-red-500 transition-colors"><i data-lucide="x" class="w-4 h-4"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        lucide.createIcons();
    }

    const subtotal = cart.reduce((sum, item) => {
        const price = currentSaleMode === 'retail' ? item.retailPrice : item.wholesalePrice;
        return sum + (price * item.qty);
    }, 0);

    const discountInput = document.getElementById('cart-discount').value;
    const discount = parseFloat(discountInput) || 0;

    let loyaltyDiscount = 0;
    const customerId = document.getElementById('pos-customer-select').value;
    const loyaltyContainer = document.getElementById('loyalty-redemption-container');

    if (customerId) {
        loyaltyContainer.classList.remove('hidden');
        const customer = customersCache.find(c => c.id === parseInt(customerId));
        if (customer) {
            const points = customer.points || 0;
            const value = points;
            document.getElementById('available-points-text').textContent = `Available: ${points} PTS (LKR ${value.toFixed(2)})`;

            if (document.getElementById('redeem-points-toggle').checked) {
                loyaltyDiscount = Math.min(subtotal - discount, value);
            }
        }
    } else {
        loyaltyContainer.classList.add('hidden');
        document.getElementById('redeem-points-toggle').checked = false;
    }

    const total = Math.max(0, subtotal - discount - loyaltyDiscount);

    document.getElementById('cart-subtotal').textContent = currencyFormatter.format(subtotal);
    if (loyaltyDiscount > 0) {
        document.getElementById('cart-total').innerHTML = `<span class="text-xs text-slate-400 line-through mr-2">${currencyFormatter.format(subtotal - discount)}</span> ${currencyFormatter.format(total)}`;
    } else {
        document.getElementById('cart-total').textContent = currencyFormatter.format(total);
    }
}

async function processCheckout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    if (!confirm("Confirm Checkout?")) return;

    const subtotal = cart.reduce((sum, item) => {
        const price = currentSaleMode === 'retail' ? item.retailPrice : item.wholesalePrice;
        return sum + (price * item.qty);
    }, 0);
    const discount = parseFloat(document.getElementById('cart-discount').value) || 0;

    const customerId = document.getElementById('pos-customer-select').value;
    const paymentMethod = window.currentPaymentMethod || 'Cash';

    if (paymentMethod === 'Credit' && !customerId) {
        alert("Please select a customer for Credit Sales!");
        return;
    }

    const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.qty), 0);
    const isRedeeming = document.getElementById('redeem-points-toggle').checked;
    let redemptionAmount = 0;

    if (customerId && isRedeeming) {
        const cust = await db.customers.get(parseInt(customerId));
        redemptionAmount = Math.min(subtotal - discount, cust.points || 0);
    }

    const total = Math.max(0, subtotal - discount - redemptionAmount);

    const sale = {
        date: new Date(),
        totalAmount: total,
        discount: discount + redemptionAmount,
        promoDiscount: discount,
        loyaltyDiscount: redemptionAmount,
        couponCode: currentCouponCode,
        totalCost: totalCost,
        type: currentSaleMode,
        items: JSON.parse(JSON.stringify(cart)),
        customerId: customerId ? parseInt(customerId) : null,
        paymentMethod: paymentMethod,
        status: 'completed'
    };

    const saleId = await db.sales.add(sale);

    for (const item of cart) {
        const product = productsCache.find(p => p.id === item.id);
        const newStock = product.stockQty - item.qty;
        await db.products.update(product.id, { stockQty: newStock });
    }

    if (customerId) {
        const cust = await db.customers.get(parseInt(customerId));
        if (cust) {
            let newPoints = cust.points || 0;
            if (isRedeeming) newPoints -= redemptionAmount;

            const pointsAwarded = Math.floor(total / 100);
            newPoints += pointsAwarded;

            let tier = cust.tier || 'Silver';
            if (newPoints > 500) tier = 'Gold';
            if (newPoints > 2000) tier = 'Platinum';

            const updates = { points: newPoints, tier: tier };
            if (paymentMethod === 'Credit') {
                updates.balance = (cust.balance || 0) + total;
            }
            await db.customers.update(cust.id, updates);
        }
    }

    printReceipt(sale, saleId, subtotal);

    cart = [];
    currentCouponCode = null;
    document.getElementById('pos-customer-select').value = '';
    document.getElementById('cart-discount').value = '';
    document.getElementById('cart-coupon').value = '';
    document.getElementById('redeem-points-toggle').checked = false;
    setPaymentMethod('Cash');
    updateCartUI();
    loadPOS();
}

function printReceipt(sale, saleId, subtotal) {
    const s = getSettings();

    // Update Receipt DOM before printing
    const area = document.getElementById('receipt-print-area');
    area.querySelector('h2').textContent = s.name;
    area.querySelectorAll('p')[1].textContent = s.address; // 2nd p is address
    area.querySelectorAll('p')[2].textContent = "Hotline: " + s.phone;

    document.getElementById('receipt-date').textContent = "Date: " + new Date(sale.date).toLocaleString();
    document.getElementById('receipt-id').textContent = "#" + saleId;
    
    const customerEl = document.getElementById('receipt-customer');
    if (sale.customerId) {
        const customer = customersCache.find(c => c.id === sale.customerId);
        customerEl.textContent = "Customer: " + (customer ? customer.name : "ID #" + sale.customerId);
    } else {
        customerEl.textContent = "";
    }

    document.getElementById('receipt-type').textContent = sale.type.toUpperCase();

    const tbody = document.getElementById('receipt-items');
    tbody.innerHTML = sale.items.map(item => {
        const price = sale.type === 'retail' ? item.retailPrice : item.wholesalePrice;
        const variantInfo = (item.size || item.color) ? ` (${item.size}${item.size && item.color ? '/' : ''}${item.color})` : '';
        return `
            <tr>
                <td style="max-width: 35mm; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}${variantInfo}</td>
                <td class="text-right">${item.qty}</td>
                <td class="text-right">${price.toFixed(2)}</td>
                <td class="text-right">${(price * item.qty).toFixed(2)}</td>
            </tr>
        `;
    }).join('');

    document.getElementById('receipt-subtotal').textContent = subtotal.toFixed(2);

    // Detailed Discount Breakdown
    const promoRow = document.getElementById('receipt-promo-row');
    const loyaltyRow = document.getElementById('receipt-loyalty-row');

    if (sale.promoDiscount > 0) {
        promoRow.classList.remove('hidden');
        document.getElementById('receipt-promo-discount').textContent = "-" + sale.promoDiscount.toFixed(2);
    } else {
        promoRow.classList.add('hidden');
    }

    if (sale.loyaltyDiscount > 0) {
        loyaltyRow.classList.remove('hidden');
        document.getElementById('receipt-loyalty-discount').textContent = "-" + sale.loyaltyDiscount.toFixed(2);
    } else {
        loyaltyRow.classList.add('hidden');
    }

    document.getElementById('receipt-total').textContent = sale.totalAmount.toFixed(2);

    area.querySelector('.text-center.mt-6 p').textContent = s.footer || "Thank you!";

    window.print();

    window.currentSaleForWhatsApp = { sale, saleId };
    
    // Auto-fill phone if customer selected
    const whatsappPhoneInput = document.getElementById('whatsapp-phone');
    if (whatsappPhoneInput) {
        whatsappPhoneInput.value = ''; // Reset
        if (sale.customerId) {
            const customer = customersCache.find(c => c.id === sale.customerId);
            if (customer && customer.contact) {
                // Ensure number is digits only and has country code (rudimentary)
                let num = customer.contact.replace(/\D/g, '');
                if (num && num.length === 9 || num.length === 10) {
                    if (num.startsWith('0')) num = num.substring(1);
                    if (!num.startsWith('94')) num = '94' + num;
                }
                whatsappPhoneInput.value = num;
            }
        }
    }

    setTimeout(() => {
        openModal('whatsapp-modal');
        lucide.createIcons();
    }, 1000);
}

async function applyCoupon() {
    const code = document.getElementById('cart-coupon').value.trim().toUpperCase();
    if (!code) return;

    const coupon = await db.coupons.where('code').equalsIgnoreCase(code).first();
    if (!coupon) {
        alert("Invalid Coupon Code!");
        return;
    }

    if (new Date(coupon.expiry) < new Date()) {
        alert("Coupon has expired!");
        return;
    }

    const subtotal = cart.reduce((sum, item) => {
        const price = currentSaleMode === 'retail' ? item.retailPrice : item.wholesalePrice;
        return sum + (price * item.qty);
    }, 0);

    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = subtotal * (coupon.value / 100);
    } else {
        discount = coupon.value;
    }

    document.getElementById('cart-discount').value = Math.floor(discount);
    currentCouponCode = coupon.code;
    updateCartUI();
    alert(`Coupon Applied: ${coupon.code} - Save ${currencyFormatter.format(discount)}`);
}

// --- Vendors ---
async function loadVendors() {
    const vendors = await db.vendors.toArray();
    const grid = document.getElementById('vendors-grid');
    if (vendors.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center text-slate-400 py-10">No vendors found.</div>`;
    } else {
        grid.innerHTML = vendors.map(v => `
            <div onclick="editVendor(${v.id})" class="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover-scale group relative overflow-hidden cursor-pointer transition-all active:scale-95">
                <div class="absolute top-0 right-0 p-10 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 opacity-50 group-hover:scale-110 transition-transform"></div>
                <div class="relative z-10 flex items-center gap-4">
                     <div class="bg-indigo-100 p-3 rounded-xl text-indigo-600 shadow-inner">
                        <i data-lucide="user" class="w-6 h-6"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-lg text-slate-700">${v.name}</h4>
                        <p class="text-slate-400 text-sm font-medium mb-1">${v.company || 'Personal'}</p>
                    </div>
                </div>
                <div class="relative z-10 mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-600">
                     <div class="flex items-center gap-3">
                        <i data-lucide="phone" class="w-4 h-4 text-indigo-400"></i>
                        <span class="font-mono">${v.contact}</span>
                     </div>
                     <button onclick="event.stopPropagation(); deleteVendor(${v.id})" class="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('');
    }
    lucide.createIcons();
}

function openVendorModal() {
    document.getElementById('vend-id').value = "";
    document.getElementById('vendor-form').reset();
    const modal = document.getElementById('vendor-modal');
    modal.querySelector('h3').innerText = 'Add Vendor/Customer';
    openModal('vendor-modal');
}

async function handleVendorSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('vend-id').value;
    const vendor = {
        name: document.getElementById('vend-name').value,
        company: document.getElementById('vend-company').value,
        contact: document.getElementById('vend-contact').value
    };

    if (id) {
        await db.vendors.update(parseInt(id), vendor);
    } else {
        await db.vendors.add(vendor);
    }

    closeModal('vendor-modal');
    loadVendors();
    e.target.reset();
}

function editVendor(id) {
    db.vendors.get(id).then(v => {
        if (!v) return;
        document.getElementById('vend-id').value = v.id;
        document.getElementById('vend-name').value = v.name;
        document.getElementById('vend-company').value = v.company;
        document.getElementById('vend-contact').value = v.contact;

        const modal = document.getElementById('vendor-modal');
        modal.querySelector('h3').innerText = 'Edit Vendor';

        openModal('vendor-modal');
    });
}

async function deleteVendor(id) {
    if (confirm("Delete this vendor?")) {
        await db.vendors.delete(id);
        loadVendors();
    }
}

// --- Reports ---
// --- Reports logic moved to end of file ---


// --- Utils ---
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('hidden');

    if (id === 'product-modal') {
        const titleEl = document.getElementById('modal-title');
        if (titleEl && titleEl.innerText !== 'Edit Product') {
            document.getElementById('modal-title').innerText = 'Add New Product';
            document.getElementById('prod-id').value = '';
            document.getElementById('product-form').reset();
        }
    }
    if (id === 'settings-modal') {
        initSettings();
    }
}

// Auto-Add Logic for Barcode Scanners
function handlePosSearchInput(value, isEnter = false) {
    const term = value.trim();
    if (!term) {
        loadPosGrid('');
        return;
    }

    const scannerMatch = productsCache.find(p => p.barcode === term);

    if (scannerMatch && isEnter) {
        addToCart(scannerMatch.id);
        document.getElementById('pos-search').value = '';
        loadPosGrid('');
        return;
    }

    loadPosGrid(term);
}

// Day End Report
async function shareDailyReport() {
    const today = new Date().toLocaleDateString();
    const sales = await db.sales.toArray();
    const todaysSales = sales.filter(s => new Date(s.date).toLocaleDateString() === today);

    if (todaysSales.length === 0) {
        alert("No sales recorded today to share.");
        return;
    }

    const totalRev = todaysSales.reduce((s, x) => s + x.totalAmount, 0);
    const totalTxns = todaysSales.length;

    const itemMap = {};
    todaysSales.forEach(s => {
        s.items.forEach(i => {
            if (!itemMap[i.name]) itemMap[i.name] = 0;
            itemMap[i.name] += i.qty;
        });
    });

    let itemSummary = "";
    Object.keys(itemMap).forEach(k => {
        itemSummary += `- ${k}: ${itemMap[k]} \n`;
    });

    const s = getSettings();
    const subject = `Day End Summary - ${s.name} - ${today}`;
    const body = `
DAILY SALES REPORT
------------------
Shop: ${s.name}
Date: ${today}

Total Revenue: ${currencyFormatter.format(totalRev)}
Total Transactions: ${totalTxns}

TOP ITEMS SOLD:
${itemSummary}

------------------
System Generated Report
`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

// --- HOLD / RECALL LOGIC ---
async function holdCart() {
    if (cart.length === 0) return;

    const hold = {
        date: new Date(),
        cart: JSON.parse(JSON.stringify(cart)),
        customerId: document.getElementById('pos-customer-select').value,
        type: currentSaleMode,
        discount: parseFloat(document.getElementById('cart-discount').value) || 0
    };

    await db.holds.add(hold);
    cart = [];
    document.getElementById('cart-discount').value = '';
    document.getElementById('pos-customer-select').value = '';
    updateCartUI();
    updateHoldCount();
    alert("Cart held successfully!");
}

async function updateHoldCount() {
    const count = await db.holds.count();
    const badge = document.getElementById('hold-count-badge');
    if (count > 0) {
        badge.textContent = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

async function openRecallModal() {
    const holds = await db.holds.toArray();
    const list = document.getElementById('recall-list');

    if (holds.length === 0) {
        list.innerHTML = '<p class="text-center text-slate-400 py-4">No held carts.</p>';
    } else {
        list.innerHTML = holds.map(h => `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center transition hover:border-indigo-300">
                <div>
                    <h5 class="font-bold text-slate-800">${h.cart.length} items - ${new Date(h.date).toLocaleTimeString()}</h5>
                    <p class="text-xs text-slate-500">${h.type.toUpperCase()}${h.customerId ? ' • Customer ID: #' + h.customerId : ' • Guest Sale'}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="recallCart(${h.id})" class="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-indigo-700">Recall</button>
                    <button onclick="deleteHold(${h.id})" class="p-1.5 text-red-400 hover:text-red-600"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </div>
        `).join('');
        lucide.createIcons();
    }
    openModal('recall-modal');
}

async function recallCart(id) {
    if (cart.length > 0 && !confirm("There are items in the current cart. Replace them?")) return;

    const h = await db.holds.get(id);
    if (h) {
        cart = h.cart;
        currentSaleMode = h.type;
        document.getElementById('pos-customer-select').value = h.customerId || '';
        document.getElementById('cart-discount').value = h.discount || '';

        await db.holds.delete(id);
        updateCartUI();
        updateHoldCount();
        closeModal('recall-modal');
    }
}

async function deleteHold(id) {
    if (!confirm("Are you sure you want to delete this held cart?")) return;
    await db.holds.delete(id);
    updateHoldCount();
    openRecallModal();
}


async function handleBulkImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const text = e.target.result;
        const rows = text.split('\n').filter(row => row.trim());
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

        const products = [];
        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(',').map(v => v.trim());
            const p = {};
            headers.forEach((h, index) => {
                p[h] = values[index];
            });

            products.push({
                name: p.name,
                category: p.category || 'General',
                retailPrice: parseFloat(p.retail) || 0,
                wholesalePrice: parseFloat(p.wholesale) || 0,
                costPrice: parseFloat(p.cost) || 0,
                stockQty: parseInt(p.stock) || 0,
                source: p.source || 'In-house',
                barcode: p.barcode || '',
                size: p.size || '',
                color: p.color || ''
            });
        }

        if (products.length > 0) {
            await db.products.bulkAdd(products);
            alert(`Successfully imported ${products.length} products!`);
            loadInventory();
        }
    };
    reader.readAsText(file);
}

async function backupData() {
    const data = {
        products: await db.products.toArray(),
        sales: await db.sales.toArray(),
        vendors: await db.vendors.toArray(),
        users: await db.users.toArray(),
        customers: await db.customers.toArray(),
        expenses: await db.expenses.toArray()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pos_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

async function loadCustomers(forceId = null) {
    customersCache = await db.customers.toArray();
    const tbody = document.getElementById('customers-table-body');
    if (!tbody) return;
    if (customersCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400">No customers found.</td></tr>`;
        return;
    }

    tbody.innerHTML = customersCache.map(c => {
        const tierClass = c.tier === 'Platinum' ? 'bg-indigo-600 text-white' :
            (c.tier === 'Gold' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600');
        return `
            <tr class="hover:bg-slate-50 transition border-b border-slate-50 last:border-0 group">
                <td class="px-6 py-4 font-bold text-slate-800">${c.name}</td>
                <td class="px-6 py-4 text-slate-500">${c.contact}</td>
                <td class="px-6 py-4 text-center">
                    <span class="${tierClass} font-black px-3 py-1 rounded-lg text-[10px] uppercase tracking-widest shadow-sm">${c.tier || 'Silver'}</span>
                </td>
                <td class="px-6 py-4 text-center">
                    <span class="text-slate-600 font-bold text-xs">${c.points || 0} PTS</span>
                </td>
                <td class="px-6 py-4 text-right ${c.balance > 0 ? 'text-red-500 font-bold' : 'text-slate-400'}">
                    ${currencyFormatter.format(c.balance || 0)}
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="editCustomer(${c.id})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                    <button onclick="deleteCustomer(${c.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    lucide.createIcons();
    await renderCustomerSelect(forceId);
}

async function handleCustomerSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('cust-id').value;
    const customer = {
        name: document.getElementById('cust-name').value,
        contact: document.getElementById('cust-contact').value,
        points: 0,
        balance: 0
    };

    let newId = null;
    if (id) {
        const old = await db.customers.get(parseInt(id));
        customer.points = old.points;
        customer.balance = old.balance;
        await db.customers.update(parseInt(id), customer);
        newId = id;
    } else {
        newId = await db.customers.add(customer);
    }

    closeModal('customer-modal');
    loadCustomers(newId);
    e.target.reset();
}

function editCustomer(id) {
    db.customers.get(id).then(c => {
        if (!c) return;
        document.getElementById('cust-id').value = c.id;
        document.getElementById('cust-name').value = c.name;
        document.getElementById('cust-contact').value = c.contact;
        document.getElementById('customer-modal').querySelector('h3').innerText = 'Edit Customer';
        openModal('customer-modal');
    });
}

async function deleteCustomer(id) {
    if (confirm("Delete this customer?")) {
        await db.customers.delete(id);
        loadCustomers();
    }
}

async function renderCustomerSelect(forceId = null) {
    const clients = await db.customers.toArray();
    const select = document.getElementById('pos-customer-select');
    if (!select) return;
    const current = forceId || select.value;
    select.innerHTML = '<option value="">Guest Customer</option>' +
        clients.map(c => `<option value="${c.id}">${c.name} (${c.contact})</option>`).join('');
    select.value = current;
}

// 2. Expenses
async function loadExpenses() {
    expensesCache = await db.expenses.reverse().toArray();
    const tbody = document.getElementById('expenses-table-body');
    if (!tbody) return;
    if (expensesCache.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400">No expenses recorded.</td></tr>`;
        return;
    }

    tbody.innerHTML = expensesCache.map(e => `
        <tr class="hover:bg-slate-50 transition border-b border-slate-50">
            <td class="px-6 py-4 text-xs font-mono text-slate-400">${new Date(e.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 font-bold text-slate-700">${e.category}</td>
            <td class="px-6 py-4 text-slate-500 italic">${e.description || '-'}</td>
            <td class="px-6 py-4 text-right font-bold text-orange-600">${currencyFormatter.format(e.amount)}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteExpense(${e.id})" class="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    const expense = {
        category: document.getElementById('exp-category').value,
        amount: parseFloat(document.getElementById('exp-amount').value),
        description: document.getElementById('exp-desc').value,
        date: new Date().toISOString()
    };
    await db.expenses.add(expense);
    closeModal('expense-modal');
    loadExpenses();
    e.target.reset();
}

async function deleteExpense(id) {
    if (confirm("Delete this expense entry?")) {
        await db.expenses.delete(id);
        loadExpenses();
    }
}

// 3. Modern Reports with Charts
async function loadReports() {
    const sales = await db.sales.toArray();

    const grouped = {};
    sales.forEach(s => {
        if (!s.date) return;
        if (s.status === 'returned') return;

        const dateKey = new Date(s.date).toLocaleDateString();
        if (!grouped[dateKey]) grouped[dateKey] = { count: 0, total: 0, timestamp: new Date(s.date).getTime() };
        grouped[dateKey].count++;
        grouped[dateKey].total += (s.totalAmount || 0);
    });

    const dates = Object.keys(grouped).sort((a, b) => grouped[b].timestamp - grouped[a].timestamp);
    const tbody = document.getElementById('report-daily-body');

    if (dates.length === 0) {
        if (tbody) tbody.innerHTML = `<tr><td colspan="3" class="text-center py-10 text-slate-400 font-medium">No sales data recorded yet.</td></tr>`;
    } else {
        if (tbody) {
            tbody.innerHTML = dates.map(d => `
                <tr class="hover:bg-indigo-50/20 transition-colors border-b border-slate-50 last:border-0 group">
                    <td class="px-6 py-4">
                        <div class="flex flex-col">
                            <span class="font-bold text-slate-700">${d}</span>
                            <span class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Sale Date</span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-slate-500">
                        <div class="flex items-center gap-2 bg-slate-50 w-fit px-3 py-1 rounded-lg border border-slate-100 group-hover:bg-white transition-colors">
                            <i data-lucide="shopping-bag" class="w-3.5 h-3.5 text-indigo-500"></i>
                            <span class="font-bold text-slate-600 truncate">${grouped[d].count} <span class="text-[10px] text-slate-400 font-medium ml-1">Orders</span></span>
                        </div>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="font-black text-indigo-600 text-lg">${currencyFormatter.format(grouped[d].total)}</div>
                        <div class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Net Revenue</div>
                    </td>
                </tr>
            `).join('');
        }
    }

    try {
        initCharts(sales);
    } catch (e) {
        console.error("Chart Init Failed:", e);
    }
    lucide.createIcons();
}

function initCharts(sales) {
    const ctxSales = document.getElementById('salesChart');
    const ctxCat = document.getElementById('categoryChart');
    if (!ctxSales) return;

    const dailyTotals = {};
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString();
    });

    last7Days.forEach(d => dailyTotals[d] = 0);
    sales.forEach(s => {
        if (s.status === 'returned') return;
        const d = new Date(s.date).toLocaleDateString();
        if (dailyTotals[d] !== undefined) dailyTotals[d] += (s.totalAmount || 0);
    });

    if (salesChart) salesChart.destroy();
    salesChart = new Chart(ctxSales, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Revenue (LKR)',
                data: last7Days.map(d => dailyTotals[d]),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            }
        }
    });

    const catMap = {};
    sales.forEach(s => {
        s.items.forEach(i => {
            if (!catMap[i.category]) catMap[i.category] = 0;
            catMap[i.category] += i.qty;
        });
    });

    const labels = Object.keys(catMap);
    const data = labels.map(l => catMap[l]);

    if (categoryChart) categoryChart.destroy();
    categoryChart = new Chart(ctxCat, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444',
                    '#8b5cf6', '#06b6d4', '#475569'
                ],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } }
            },
            cutout: '70%'
        }
    });
}
function setPaymentMethod(method) {
    window.currentPaymentMethod = method;
    const btnCash = document.getElementById('pm-cash');
    const btnCredit = document.getElementById('pm-credit');
    if (!btnCash || !btnCredit) return;

    if (method === 'Cash') {
        btnCash.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold text-xs transition-all shadow-sm';
        btnCredit.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-slate-100 bg-white text-slate-500 font-bold text-xs hover:border-indigo-200 transition-all';
    } else {
        btnCredit.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-indigo-500 bg-indigo-50 text-indigo-700 font-bold text-xs transition-all shadow-sm';
        btnCash.className = 'flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-slate-100 bg-white text-slate-500 font-bold text-xs hover:border-indigo-200 transition-all';
    }
}

async function printBarcode(productId) {
    const p = await db.products.get(productId);
    if (!p || !p.barcode) {
        alert("Product has no barcode to print!");
        return;
    }
    const win = window.open('', '', 'width=400,height=300');
    win.document.write(`
        <html>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; font-family:sans-serif; margin:0;">
            <div style="font-size:14px; font-weight:bold; margin-bottom:5px;">${getSettings().name}</div>
            <div style="font-size:12px; margin-bottom:10px;">${p.name}</div>
            <div style="font-family:'Libre Barcode 39', cursive; font-size:48px;">*${p.barcode}*</div>
            <div style="font-size:14px; font-weight:bold; margin-top:5px;">LKR ${p.retailPrice.toFixed(2)}</div>
        </body>
        </html>
    `);
    win.print();
}

async function processReturn(saleId) {
    if (!confirm("Are you sure you want to process a RETURN for this sale? Inventory will be restored.")) {
        return;
    }
    const sale = await db.sales.get(saleId);
    if (!sale) return;

    for (const item of sale.items) {
        const prod = await db.products.get(item.id);
        if (prod) {
            await db.products.update(prod.id, { stockQty: prod.stockQty + item.qty });
        }
    }

    await db.sales.update(saleId, { status: 'returned' });
    alert("Return processed successfully!");
    loadDashboard();
}

async function shareDailyReportWhatsApp() {
    const todayStr = new Date().toLocaleDateString();
    const sales = await db.sales.toArray();
    const todaysSales = sales.filter(s => new Date(s.date).toLocaleDateString() === todayStr && s.status !== 'returned');

    if (todaysSales.length === 0) {
        alert("No sales recorded for today yet!");
        return;
    }

    const totalRevenue = todaysSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const s = getSettings();

    const categoryTotals = {};
    todaysSales.forEach(sale => {
        sale.items.forEach(item => {
            if (!categoryTotals[item.category]) categoryTotals[item.category] = 0;
            categoryTotals[item.category] += item.qty;
        });
    });

    const breakdown = Object.entries(categoryTotals)
        .map(([cat, qty]) => `- ${cat}: ${qty} items`)
        .join('%0A');

    const message = `* DAILY SALES SUMMARY - ${s.name}*% 0A` +
        `Date: ${todayStr}% 0A` +
        `--------------------------% 0A` +
        `* Total Revenue: ${currencyFormatter.format(totalRevenue)}*% 0A` +
        `Total Success Orders: ${todaysSales.length}% 0A` +
        `--------------------------% 0A` +
        `* Category Breakdown:*% 0A${breakdown}% 0A` +
        `--------------------------% 0A` +
        `_Generated via UrbanVogue POS_`;

    window.open(`https://wa.me/?text=${message}`, '_blank');
}

function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.classList.remove('active', 'bg-white', 'shadow-sm', 'text-indigo-600');
        btn.classList.add('text-slate-400');
    });
    const activeBtn = document.getElementById(`theme-${theme}`);
    if (activeBtn) {
        activeBtn.classList.add('active', 'bg-white', 'shadow-sm', 'text-indigo-600');
        activeBtn.classList.remove('text-slate-400');
    }
    localStorage.setItem('pos-theme', theme);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function shareReceiptWhatsApp() {
    if (!window.currentSaleForWhatsApp) return;
    const { sale, saleId } = window.currentSaleForWhatsApp;
    try {
        const s = getSettings();
        let customerName = "";
        if (sale.customerId) {
            const customer = await db.customers.get(parseInt(sale.customerId));
            if (customer) customerName = `Customer: ${customer.name}\n`;
        }

        const itemsStr = sale.items.map(i => {
            const price = sale.type === 'retail' ? i.retailPrice : i.wholesalePrice;
            return `${i.name} x${i.qty} - ${currencyFormatter.format(price * i.qty)}`;
        }).join('\n');

        const discountBreakdown = [];
        if (sale.promoDiscount > 0) {
            discountBreakdown.push(`Promo/Discount: -${currencyFormatter.format(sale.promoDiscount)} ${sale.couponCode ? '(' + sale.couponCode + ')' : ''}`);
        }
        if (sale.loyaltyDiscount > 0) {
            discountBreakdown.push(`Loyalty Redeem: -${currencyFormatter.format(sale.loyaltyDiscount)}`);
        }
        const discountStr = discountBreakdown.length > 0 ? `--------------------------\n${discountBreakdown.join('\n')}\n` : '';

        const plainMessage = `*RECEIPT: ${s.name}*\n` +
            customerName +
            `Order ID: #${saleId}\n` +
            `Date: ${new Date(sale.date).toLocaleString()}\n` +
            `--------------------------\n` +
            `${itemsStr}\n` +
            `--------------------------\n` +
            `Subtotal: ${currencyFormatter.format(sale.totalAmount + (sale.discount || 0))}\n` +
            discountStr +
            `*Net Amount: ${currencyFormatter.format(sale.totalAmount)}*\n` +
            `Payment: ${sale.paymentMethod}\n` +
            `--------------------------\n` +
            `Thank you for shopping with us!\n` +
            `${s.footer || 'Visit us again!'}`;

        const phone = document.getElementById('whatsapp-phone').value.replace(/\D/g, '');
        const encodedMessage = encodeURIComponent(plainMessage);
        closeModal('whatsapp-modal');
        
        let url = `https://wa.me/?text=${encodedMessage}`;
        if (phone) {
            url = `https://wa.me/${phone}?text=${encodedMessage}`;
        }
        
        window.open(url, '_blank');
    } catch (err) {
        console.error("WhatsApp Share Error:", err);
        alert("Failed to generate WhatsApp link.");
    }
}

// --- Returns & Exchanges ---
let currentReturnSale = null;

async function loadReturns() {
    const returns = await db.returns.toArray();
    const tbody = document.getElementById('returns-history-body');
    if (!tbody) return;

    if (returns.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-slate-400">No returns recorded yet.</td></tr>`;
        return;
    }

    // Sort by date descending
    const sorted = [...returns].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sorted.map(r => `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 font-bold text-slate-700">#RET-${r.id}</td>
            <td class="px-6 py-4 font-medium text-indigo-600">#${r.saleid}</td>
            <td class="px-6 py-4 text-xs">
                ${r.items.map(i => `<div class="bg-slate-100 px-2 py-0.5 rounded inline-block m-1">${i.name} (${i.qty})</div>`).join('')}
            </td>
            <td class="px-6 py-4 text-right font-black text-red-600">${currencyFormatter.format(r.totalrefund)}</td>
            <td class="px-6 py-4 text-center text-slate-400 text-xs">${new Date(r.date).toLocaleDateString()}</td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function searchSaleForReturn() {
    const saleId = document.getElementById('return-search-sale').value.trim();
    if (!saleId) return alert("Please enter a Sale ID.");

    const sale = await db.sales.get(parseInt(saleId));
    if (!sale) return alert("Sale not found. Please check the ID.");

    currentReturnSale = sale;
    document.getElementById('return-sale-title').textContent = `Sale #${saleId} Details`;
    document.getElementById('return-sale-date').textContent = `Date: ${new Date(sale.date).toLocaleString()}`;
    
    const tbody = document.getElementById('return-items-table');
    tbody.innerHTML = sale.items.map((item, index) => {
        const price = sale.type === 'retail' ? item.retailPrice : item.wholesalePrice;
        return `
            <tr class="hover:bg-red-50/30 transition">
                <td class="px-6 py-4">
                    <div class="font-bold text-slate-700">${item.name}</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase">${item.size} / ${item.color}</div>
                </td>
                <td class="px-6 py-4 text-slate-600 font-medium">${currencyFormatter.format(price)}</td>
                <td class="px-6 py-4 text-center font-bold text-slate-400">${item.qty}</td>
                <td class="px-6 py-4 text-center">
                    <input type="number" min="0" max="${item.qty}" value="0" 
                        oninput="updateReturnSummary()"
                        class="w-16 px-2 py-1 text-center bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none">
                </td>
                <td class="px-6 py-4 text-right">
                    <input type="text" id="return-reason-${index}" placeholder="Reason..." 
                        class="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-slate-300 outline-none">
                </td>
            </tr>
        `;
    }).join('');

    document.getElementById('return-sale-details').classList.remove('hidden');
    updateReturnSummary();
}

function updateReturnSummary() {
    if (!currentReturnSale) return;

    let totalRefund = 0;
    const inputs = document.querySelectorAll('#return-items-table input[type="number"]');
    
    inputs.forEach((input, index) => {
        const qty = parseInt(input.value) || 0;
        const item = currentReturnSale.items[index];
        const price = currentReturnSale.type === 'retail' ? item.retailPrice : item.wholesalePrice;
        totalRefund += (qty * price);
    });

    document.getElementById('return-total-refund').textContent = currencyFormatter.format(totalRefund);
}

function resetReturnForm() {
    currentReturnSale = null;
    document.getElementById('return-sale-details').classList.add('hidden');
    document.getElementById('return-search-sale').value = '';
}

async function confirmReturn() {
    if (!currentReturnSale) return;

    const returnItems = [];
    const inputs = document.querySelectorAll('#return-items-table input[type="number"]');
    let totalRefund = 0;

    inputs.forEach((input, index) => {
        const qty = parseInt(input.value) || 0;
        if (qty > 0) {
            const item = currentReturnSale.items[index];
            const price = currentReturnSale.type === 'retail' ? item.retailPrice : item.wholesalePrice;
            const reason = document.getElementById(`return-reason-${index}`).value || "Customer returns item";
            
            returnItems.push({
                productId: item.id,
                name: item.name,
                qty: qty,
                price: price,
                reason: reason
            });
            totalRefund += (qty * price);
        }
    });

    if (returnItems.length === 0) return alert("Please select at least one item to return.");

    if (!confirm(`Are you sure you want to process this return? Total Refund: ${currencyFormatter.format(totalRefund)}`)) return;

    try {
        // 1. Save Return Record
        const returnRecord = {
            saleid: currentReturnSale.id, // match lowercase
            totalrefund: totalRefund, // match lowercase
            items: returnItems,
            date: new Date().toISOString(),
            processedby: currentUser ? currentUser.username : "System" // match lowercase + fallback
        };
        await db.returns.add(returnRecord);

        // 2. Update Product Stock
        for (const item of returnItems) {
            const product = await db.products.get(item.productId);
            if (product) {
                await db.products.update(item.productId, {
                    stockQty: product.stockQty + item.qty
                });
            }
        }

        // 3. Update Sale Status
        await db.sales.update(currentReturnSale.id, { hasreturn: true }); // match lowercase

        alert("Return processed successfully. Inventory updated.");
        resetReturnForm();
        loadReturns(); // Refresh history
        loadInventory(); // Refresh inventory if open
        loadDashboard(); // Refresh stats
    } catch (err) {
        console.error("Return Processing Error:", err);
        alert("Failed to process return.");
    }
}

// --- User Management ---
async function loadUsers() {
    const users = await db.users.toArray();
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    tbody.innerHTML = users.map(u => `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                        ${u.username.charAt(0).toUpperCase()}
                    </div>
                    <span class="font-bold text-slate-700">${u.username}</span>
                </div>
            </td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}">
                    ${u.role}
                </span>
            </td>
            <td class="px-6 py-4 text-xs text-slate-400">
                ${new Date(u.created_at || Date.now()).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex justify-end gap-2">
                    <button onclick="editUser(${u.id})" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                    ${u.username !== 'admin' ? `<button onclick="deleteUser(${u.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>` : ''}
                </div>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function handleUserMgmtSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('user-mgmt-id').value;
    const username = document.getElementById('user-mgmt-username').value;
    const password = document.getElementById('user-mgmt-password').value;
    const role = document.getElementById('user-mgmt-role').value;

    const userData = {
        username: username,
        role: role
    };

    if (password) {
        userData.password = await hashPassword(password);
    }

    try {
        if (id) {
            await db.users.update(parseInt(id), userData);
            alert("User updated successfully.");
        } else {
            if (!password) return alert("Password is required for new users.");
            await db.users.add(userData);
            alert("User created successfully.");
        }
        closeModal('user-modal');
        loadUsers();
        e.target.reset();
    } catch (err) {
        alert("Failed to save user. Username might already exist.");
    }
}

async function editUser(id) {
    const user = await db.users.get(id);
    if (!user) return;

    document.getElementById('user-mgmt-id').value = user.id;
    document.getElementById('user-mgmt-username').value = user.username;
    document.getElementById('user-mgmt-password').value = "";
    document.getElementById('user-mgmt-role').value = user.role;

    openModal('user-modal');
}

async function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        await db.users.delete(id);
        loadUsers();
    }
}

// --- Coupon Management ---
async function loadCoupons() {
    const coupons = await db.coupons.toArray();
    const tbody = document.getElementById('coupons-table-body');
    if (!tbody) return;

    tbody.innerHTML = coupons.map(c => `
        <tr class="hover:bg-slate-50 transition">
            <td class="px-6 py-4 font-bold text-slate-700">${c.code}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${c.type === 'percentage' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}">
                    ${c.type}
                </span>
            </td>
            <td class="px-6 py-4 font-mono font-bold">
                ${c.type === 'percentage' ? c.value + '%' : currencyFormatter.format(c.value)}
            </td>
            <td class="px-6 py-4 text-xs text-slate-400">
                ${new Date(c.expiry).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 font-medium text-slate-500">${c.usedcount || 0}</td>
            <td class="px-6 py-4 text-right">
                <button onclick="deleteCoupon(${c.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
    `).join('');
    lucide.createIcons();
}

async function handleCouponSubmit(e) {
    e.preventDefault();
    const coupon = {
        code: document.getElementById('cpn-code').value.toUpperCase(),
        type: document.getElementById('cpn-type').value,
        value: parseFloat(document.getElementById('cpn-value').value),
        expiry: document.getElementById('cpn-expiry').value,
        usedcount: 0
    };

    try {
        await db.coupons.add(coupon);
        alert("Coupon created successfully!");
        closeModal('coupon-modal');
        loadCoupons();
        e.target.reset();
    } catch (err) {
        alert("Failed to create coupon. Code might already exist.");
    }
}

async function deleteCoupon(id) {
    if (confirm("Are you sure you want to delete this coupon?")) {
        await db.coupons.delete(id);
        loadCoupons();
    }
}

// Initial Theme Load
window.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('pos-theme') || 'light';
    changeTheme(savedTheme);
});


// --- Keyboard Shortcuts ---
document.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    if (e.key === 'F2') {
        e.preventDefault();
        navigate('pos');
        document.getElementById('pos-search').focus();
    }

    if (e.key === 'F4') {
        e.preventDefault();
        navigate('returns');
    }

    if (e.key === 'F8' && !isInput) {
        e.preventDefault();
        holdCart();
    }

    if (e.key === 'F9' && !isInput) {
        e.preventDefault();
        openRecallModal();
    }

    if (e.key === 'F10') {
        e.preventDefault();
        processCheckout();
    }
});

// --- Dashboard Charts ---
async function updateCharts(sales) {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? '#334155' : '#f1f5f9';

    // 1. Sales Trend (Last 7 Days)
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
    });

    const dailyRevenue = last7Days.map(date => {
        const daySales = sales.filter(s => s.date.startsWith(date));
        return daySales.reduce((sum, s) => sum + parseFloat(s.totalAmount), 0);
    });

    if (salesTrendChart) salesTrendChart.destroy();
    const ctxTrend = document.getElementById('salesTrendChart');
    if (ctxTrend) {
        salesTrendChart = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: last7Days.map(d => new Date(d).toLocaleDateString(undefined, { weekday: 'short' })),
                datasets: [{
                    label: 'Revenue',
                    data: dailyRevenue,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 4,
                    pointBackgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                    x: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        });
    }

    // 2. Top Items (Quantity Sold)
    const itemMap = {};
    sales.forEach(s => {
        if (s.items && Array.isArray(s.items)) {
            s.items.forEach(it => {
                itemMap[it.name] = (itemMap[it.name] || 0) + it.qty;
            });
        }
    });

    const top5 = Object.entries(itemMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (topItemsChart) topItemsChart.destroy();
    const ctxTop = document.getElementById('topItemsChart');
    if (ctxTop) {
        topItemsChart = new Chart(ctxTop, {
            type: 'bar',
            data: {
                labels: top5.map(x => x[0]),
                datasets: [{
                    label: 'Qty Sold',
                    data: top5.map(x => x[1]),
                    backgroundColor: ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'],
                    borderRadius: 8
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
                    y: { grid: { display: false }, ticks: { color: textColor } }
                }
            }
        });
    }
}
