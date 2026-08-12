/* ============================================================
 * cart.js  ——  购物车前端模块（后端 + localStorage 混合版）
 * ------------------------------------------------------------
 * 策略：
 *   - 已登录（localStorage 中存在 token）：后端为持久化真源，
 *     localStorage 作为本地镜像（用于同步渲染）。每次页面加载
 *     会从后端同步一次；每次写操作乐观更新本地并异步提交后端。
 *   - 未登录：纯 localStorage（key: hr_cart_items），保留原行为，
 *     结算时提示登录。登录后本地购物车会自动合并到后端。
 *
 * 自动行为：
 *   1) 注入 .cart-badge 角标样式
 *   2) 所有 .cart-btn 自动：href → ./cart.html，追加数量角标
 *   3) 暴露 window.addToCartFromPage，供产品详情页 handleAddCart 调用
 *   4) 购物车页调用 HRCart.renderCartPage() 渲染
 *
 * 对外 API（HRCart）保持不变，调用方无需改动。
 * ============================================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'hr_cart_items';
    var SYNCED_FLAG = 'hr_cart_synced'; // 标记本地是否已与后端同步
    var CART_PAGE = './cart.html';

    var API_BASE = (typeof SERVER_BASE_URL !== 'undefined') ? SERVER_BASE_URL : '';
    var SYNCING = false; // 防止同步过程中触发后端写回

    /* ---------- 登录态 ---------- */
    function isLoggedIn() {
        try { return !!localStorage.getItem('token'); } catch (e) { return false; }
    }

    /* ---------- 基础读写（localStorage） ---------- */
    function getCart() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    /* 仅写 localStorage，不触发后端调用 */
    function writeLocal(cart) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
        } catch (e) { /* 忽略 quota 错误 */ }
        updateCartBadges();
    }

    /* 旧的 saveCart：写本地 + （已登录时）保持标记，不再回写后端。
     * 后端回写由具体业务函数显式调用。 */
    function saveCart(cart) {
        writeLocal(cart);
    }

    /* ---------- 数量 / 合计 ---------- */
    function getCartCount() {
        return getCart().reduce(function (s, it) {
            return s + (parseInt(it.qty, 10) || 0);
        }, 0);
    }

    function getCartTotal() {
        return getCart().reduce(function (s, it) {
            return s + ((parseFloat(it.price) || 0) * (parseInt(it.qty, 10) || 1));
        }, 0);
    }

    /* ---------- 价格文本解析 ---------- */
    function parsePrice(text) {
        if (!text) return 0;
        var m = String(text).replace(/,/g, '').match(/(\d+(\.\d+)?)/);
        return m ? parseFloat(m[1]) : 0;
    }

    /* ============================================================
     * 后端 API 层
     * ============================================================ */
    function apiUrl(path) { return API_BASE + '/cart' + path; }

    function authHeaders() {
        var h = { 'Content-Type': 'application/json' };
        var token = localStorage.getItem('token');
        if (token) { h['Authorization'] = token; }
        return h;
    }

    /* 处理 401：token 失效，回退为游客模式 */
    function handleAuthFailure(resp) {
        if (resp && resp.status === 401) {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem(SYNCED_FLAG);
            } catch (e) { }
            return true;
        }
        return false;
    }

    /* 后端 CartItem → 前端购物车项格式 */
    function fromServerItem(s) {
        var key = s.productKey || (s.productId ? s.productId : '');
        return {
            key: key,
            id: s.productId || '',
            name: s.productName || '未命名商品',
            price: parseFloat(s.price) || 0,
            priceText: s.priceText || (s.price ? ('¥' + s.price) : '¥询价'),
            image: s.image || '',
            spec: s.spec || '',
            qty: parseInt(s.quantity, 10) || 1,
            url: s.url || '',
            addedAt: s.createdAt ? Date.parse(s.createdAt.replace(' ', 'T')) : Date.now()
        };
    }

    /* 前端购物车项 → 后端提交体 */
    function toServerItem(it) {
        return {
            productKey: it.key,
            productId: it.id,
            productName: it.name,
            spec: it.spec || '',
            price: parseFloat(it.price) || 0,
            priceText: it.priceText || '',
            image: it.image || '',
            url: it.url || '',
            quantity: parseInt(it.qty, 10) || 1
        };
    }

    /* 从后端拉取购物车并覆盖本地镜像 */
    function syncFromServer() {
        if (!isLoggedIn() || SYNCING) return Promise.resolve();
        SYNCING = true;
        return fetch(apiUrl(''), { headers: authHeaders() })
            .then(function (resp) {
                if (handleAuthFailure(resp)) { SYNCING = false; return []; }
                return resp.json();
            })
            .then(function (res) {
                if (res && res.code === 0 && Array.isArray(res.data)) {
                    var cart = res.data.map(fromServerItem);
                    writeLocal(cart);
                    try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
                    if (document.getElementById('cartContainer')) { renderCartPage(); }
                }
                SYNCING = false;
            })
            .catch(function () { SYNCING = false; });
    }

    /* 将本地游客购物车合并到后端（登录后调用一次） */
    function mergeLocalToServer() {
        var local = getCart();
        if (!local.length) {
            try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
            return Promise.resolve();
        }
        var promises = local.map(function (it) {
            return fetch(apiUrl(''), {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(toServerItem(it))
            }).then(function (r) { handleAuthFailure(r); return r; });
        });
        return Promise.all(promises).then(function () {
            try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
        });
    }

    /* ============================================================
     * 业务操作
     * ============================================================ */

    /* ---------- 添加商品（按 key 合并数量） ---------- */
    function addToCart(item) {
        if (!item || !item.key) return;
        var cart = getCart();
        var key = String(item.key);

        var existing = null;
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].key === key) { existing = cart[i]; break; }
        }

        if (existing) {
            existing.qty = (parseInt(existing.qty, 10) || 0) + (parseInt(item.qty, 10) || 1);
        } else {
            cart.push({
                key: key,
                id: item.id || '',
                name: item.name || '未命名商品',
                price: parseFloat(item.price) || 0,
                priceText: item.priceText || (item.price ? ('¥' + item.price) : '¥询价'),
                image: item.image || '',
                spec: item.spec || '',
                qty: parseInt(item.qty, 10) || 1,
                url: item.url || '',
                addedAt: Date.now()
            });
        }
        writeLocal(cart);

        //已登录：异步提交后端
        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl(''), {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify(toServerItem(item))
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    /* ---------- 从当前产品详情页 DOM 收集商品信息 ---------- */
    function collectFromPage() {
        var titleEl = document.querySelector('.product-title, h1.product-title, .product-name');
        var name = titleEl ? (titleEl.textContent || '').trim() : (document.title.split(' - ')[0] || '商品');

        var priceEl = document.querySelector('.price-value, .price');
        var priceText = priceEl ? (priceEl.textContent || '').trim() : '';
        var price = parsePrice(priceText);

        var imgEl = document.querySelector('.main-image img, .product-img img, .main-image img');
        var image = '';
        if (imgEl) {
            image = imgEl.getAttribute('src') || imgEl.src || '';
        }

        var qtyEl = document.getElementById('quantityInput') || document.querySelector('input[type=number]');
        var qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;

        var specEl = document.querySelector('.spec-option.selected, .spec-item.active, .spec-item.selected');
        var spec = specEl ? (specEl.textContent || '').trim() : '';

        var pageId = location.pathname.split('/').pop().replace(/\.html$/i, '') || 'product';
        var id = pageId + (spec ? ('_' + spec) : '');
        var key = id; // product_key 与 id 一致（已含规格）

        return {
            key: key,
            id: id,
            name: name,
            price: price,
            priceText: priceText || (price ? ('¥' + price) : '¥询价'),
            image: image,
            spec: spec,
            qty: qty,
            url: location.pathname.split('/').pop()
        };
    }

    /* 详情页 handleAddCart 调用入口 */
    function addToCartFromPage() {
        try {
            var item = collectFromPage();
            addToCart(item);
            if (typeof showToast === 'function') {
                showToast('已加入购物车！', 'success');
            }
        } catch (e) {
            if (typeof showToast === 'function') {
                showToast('加入购物车失败：' + e.message, 'error');
            }
        }
    }

    /* ---------- 删除 / 改数量 / 清空 ---------- */
    function removeFromCart(key) {
        var cart = getCart().filter(function (it) { return it.key !== String(key); });
        writeLocal(cart);

        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl('') + '?productKey=' + encodeURIComponent(key), {
                method: 'DELETE',
                headers: authHeaders()
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    function updateCartQty(key, qty) {
        var cart = getCart();
        cart.forEach(function (it) {
            if (it.key === String(key)) {
                it.qty = Math.max(1, (parseInt(qty, 10) || 1));
            }
        });
        writeLocal(cart);

        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl(''), {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ productKey: String(key), quantity: Math.max(1, parseInt(qty, 10) || 1) })
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    function clearCart() {
        writeLocal([]);

        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl('/all'), {
                method: 'DELETE',
                headers: authHeaders()
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    /* ---------- 角标 ---------- */
    function updateCartBadges() {
        var count = getCartCount();
        var badges = document.querySelectorAll('.cart-badge');
        for (var i = 0; i < badges.length; i++) {
            badges[i].textContent = count > 99 ? '99+' : String(count);
            badges[i].style.display = count > 0 ? '' : 'none';
        }
    }

    /* ---------- 自动增强 .cart-btn：href + 角标 ---------- */
    function enhanceCartButtons() {
        var btns = document.querySelectorAll('.cart-btn');
        for (var i = 0; i < btns.length; i++) {
            var b = btns[i];
            if (b.getAttribute('data-cart-enhanced') === '1') continue;
            b.setAttribute('data-cart-enhanced', '1');
            if (!b.getAttribute('href') || b.getAttribute('href') === '#') {
                b.setAttribute('href', CART_PAGE);
            }
            if (!b.querySelector('.cart-badge')) {
                var span = document.createElement('span');
                span.className = 'cart-badge';
                span.textContent = '0';
                span.style.display = 'none';
                b.appendChild(span);
            }
        }
        updateCartBadges();
    }

    /* ---------- HTML 转义 ---------- */
    function escapeHtml(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    /* ---------- 购物车页渲染 ---------- */
    function renderCartPage() {
        var wrap = document.getElementById('cartContainer');
        if (!wrap) return;

        var cart = getCart();
        var totalEl = document.getElementById('cartTotal');
        var countEl = document.getElementById('cartCount');
        var checkoutBtn = document.getElementById('checkoutBtn');
        var clearBtn = document.getElementById('clearCartBtn');

        // 空状态
        if (!cart.length) {
            wrap.innerHTML =
                '<div class="cart-empty">' +
                '<div class="empty-icon">🛒</div>' +
                '<p class="empty-text">购物车还是空的，快去挑选心仪的产品吧～</p>' +
                '<a class="btn-go-shop" href="./neep.html">去逛逛</a>' +
                '</div>';
            if (totalEl) totalEl.textContent = '¥0';
            if (countEl) countEl.textContent = '0';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        // 表格行
        var rows = cart.map(function (it) {
            var subtotal = (parseFloat(it.price) || 0) * (parseInt(it.qty, 10) || 1);
            var subtotalText = it.price ? ('¥' + subtotal.toLocaleString()) : '¥询价';
            return '' +
                '<tr data-key="' + escapeHtml(it.key) + '">' +
                '<td class="col-img"><div class="img-box">' +
                (it.image ? '<img src="' + escapeHtml(it.image) + '" alt="" onerror="this.style.display=\'none\'">' : '<span class="img-ph">📦</span>') +
                '</div></td>' +
                '<td class="col-name"><div class="name">' + escapeHtml(it.name) + '</div>' +
                (it.spec ? '<div class="spec">规格：' + escapeHtml(it.spec) + '</div>' : '') +
                (it.url ? '<a class="link" href="./' + escapeHtml(it.url) + '">查看商品 ›</a>' : '') +
                '</td>' +
                '<td class="col-price">' + escapeHtml(it.priceText || (it.price ? ('¥' + it.price) : '¥询价')) + '</td>' +
                '<td class="col-qty">' +
                '<div class="qty-control">' +
                '<button class="qty-btn" onclick="HRCart.changeItemQty(\'' + escapeHtml(it.key) + '\', -1)">-</button>' +
                '<input class="qty-input" type="number" value="' + it.qty + '" min="1" onchange="HRCart.setItemQty(\'' + escapeHtml(it.key) + '\', this.value)">' +
                '<button class="qty-btn" onclick="HRCart.changeItemQty(\'' + escapeHtml(it.key) + '\', 1)">+</button>' +
                '</div>' +
                '</td>' +
                '<td class="col-subtotal">' + subtotalText + '</td>' +
                '<td class="col-op"><button class="btn-remove" onclick="HRCart.removeCartItem(\'' + escapeHtml(it.key) + '\')">删除</button></td>' +
                '</tr>';
        }).join('');

        wrap.innerHTML =
            '<table class="cart-table">' +
            '<thead><tr>' +
            '<th class="th-img">商品</th>' +
            '<th class="th-name">名称</th>' +
            '<th class="th-price">单价</th>' +
            '<th class="th-qty">数量</th>' +
            '<th class="th-subtotal">小计</th>' +
            '<th class="th-op">操作</th>' +
            '</tr></thead>' +
            '<tbody>' + rows + '</tbody>' +
            '</table>';

        // 合计
        var total = getCartTotal();
        if (totalEl) totalEl.textContent = total ? ('¥' + total.toLocaleString()) : '¥询价';
        if (countEl) countEl.textContent = getCartCount();
        if (checkoutBtn) checkoutBtn.style.display = '';
        if (clearBtn) clearBtn.style.display = '';
    }

    /* ---------- 购物车页：数量加减 / 删除 / 清空 ---------- */
    function changeItemQty(key, delta) {
        var cart = getCart();
        cart.forEach(function (it) {
            if (it.key === String(key)) {
                it.qty = Math.max(1, (parseInt(it.qty, 10) || 1) + (parseInt(delta, 10) || 0));
            }
        });
        writeLocal(cart);
        renderCartPage();

        //提交后端（绝对值）
        if (isLoggedIn() && !SYNCING) {
            var qty = 1;
            for (var i = 0; i < cart.length; i++) {
                if (cart[i].key === String(key)) { qty = cart[i].qty; break; }
            }
            fetch(apiUrl(''), {
                method: 'PUT',
                headers: authHeaders(),
                body: JSON.stringify({ productKey: String(key), quantity: qty })
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    function setItemQty(key, qty) {
        updateCartQty(key, qty);
        renderCartPage();
    }

    function removeCartItem(key) {
        removeFromCart(key);
        renderCartPage();
    }

    function clearCartAndRefresh() {
        if (!confirm('确定要清空购物车吗？')) return;
        clearCart();
        renderCartPage();
    }

    /* ---------- 结算（弹窗收集收货信息后调用后端创建订单） ---------- */
    function checkout() {
        var cart = getCart();
        if (!cart.length) return;
        if (!isLoggedIn()) {
            if (confirm('结算需要先登录，是否前往登录？')) {
                location.href = './login.html';
            }
            return;
        }
        injectCheckoutModal();
        openCheckoutModal();
    }

    /* ---------- 注入结算表单模态框（一次） ---------- */
    function injectCheckoutModal() {
        if (document.getElementById('hr-checkout-modal')) return;

        var ease = 'cubic-bezier(.22,1,.36,1)';
        var css =
            /* ---- 遮罩：渐变色（不是纯黑50%）+ 模糊背景 ---- */
            '.hr-modal-mask{position:fixed;inset:0;z-index:9998;display:none;align-items:center;justify-content:center;padding:20px;' +
            'background:linear-gradient(135deg,rgba(10,40,95,.55),rgba(10,40,95,.38));backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);}' +
            '.hr-modal-mask.show{display:flex;}' +

            /* ---- 模态框：史诗级阴影 + 顶部三色装饰 + 入场动画 ---- */
            '.hr-modal{background:#fff;border-radius:14px;width:500px;max-width:100%;max-height:90vh;overflow-y:auto;' +
            'box-shadow:0 30px 80px rgba(10,40,95,.35), 0 10px 30px rgba(10,40,95,.22);' +
            'animation:hrModalIn .45s ' + ease + ' both;position:relative;isolation:isolate;}' +
            '.hr-modal::before{content:"";position:absolute;top:0;left:0;right:0;height:3px;' +
            'background:linear-gradient(90deg,#0a4db4,#4a9eff,#f5a623);border-radius:14px 14px 0 0;z-index:2;}' +
            '@keyframes hrModalIn{' +
            '0%{opacity:0;transform:translateY(30px) scale(.96) rotateX(6deg);}' +
            '100%{opacity:1;transform:none;}}' +
            '@keyframes hrMaskIn{from{opacity:0}to{opacity:1}}' +
            '.hr-modal-mask.show{animation:hrMaskIn .3s ease-out both;}' +

            /* ---- 头部：渐变背景 + 图标样式 ---- */
            '.hr-modal-head{display:flex;justify-content:space-between;align-items:center;' +
            'padding:20px 26px 16px;border-bottom:1px solid #eef2f7;' +
            'background:linear-gradient(180deg,rgba(10,77,180,.03),transparent);}' +
            '.hr-modal-head h3{font-size:17px;color:#1f2937;font-weight:700;letter-spacing:.5px;' +
            'display:flex;align-items:center;gap:8px;margin:0;}' +
            '.hr-modal-head h3::before{content:"";width:18px;height:18px;' +
            'background:linear-gradient(135deg,#0a4db4,#f5a623);border-radius:5px;opacity:.12;}' +
            '.hr-modal-close{width:32px;height:32px;border:none;background:#f5f7fa;border-radius:8px;' +
            'font-size:20px;color:#8b95a7;cursor:pointer;line-height:1;padding:0;' +
            'display:flex;align-items:center;justify-content:center;transition:all .2s ' + ease + ';}' +
            '.hr-modal-close:hover{background:#fff1f0;color:#e4393c;transform:rotate(90deg) scale(1.08);}' +

            /* ---- 主体 ---- */
            '.hr-modal-body{padding:22px 26px;}' +

            /* ---- 金额摘要：渐变卡片 ---- */
            '.hr-summary{background:linear-gradient(135deg,#0a4db4,#1e6fd9);' +
            'border-radius:10px;padding:14px 18px;margin-bottom:22px;' +
            'display:flex;justify-content:space-between;align-items:center;' +
            'box-shadow:0 6px 18px rgba(10,77,180,.28);position:relative;overflow:hidden;}' +
            '.hr-summary::before{content:"";position:absolute;inset:0;' +
            'background:radial-gradient(500px 200px at 120% -50%,rgba(255,255,255,.22),transparent 60%),' +
            'radial-gradient(300px 300px at -10% 150%,rgba(245,166,35,.22),transparent 60%);}' +
            '.hr-summary .label{font-size:13px;color:rgba(255,255,255,.9);letter-spacing:.5px;position:relative;z-index:1;}' +
            '.hr-summary .label strong{color:#fff;font-weight:700;margin:0 2px;padding:1px 6px;background:rgba(255,255,255,.22);border-radius:8px;font-size:12px;}' +
            '.hr-summary .amount{font-size:24px;color:#fff;font-weight:800;' +
            'letter-spacing:1px;position:relative;z-index:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.18));}' +

            /* ---- 字段：浮动标签效果 ---- */
            '.hr-field{margin-bottom:18px;}' +
            '.hr-field label{display:block;font-size:12px;color:#4b5563;margin-bottom:6px;font-weight:600;letter-spacing:.5px;}' +
            '.hr-field label .req{color:#e4393c;margin-left:3px;}' +
            '.hr-field input,.hr-field textarea{width:100%;border:1.5px solid #e5e9f0;border-radius:8px;' +
            'padding:11px 14px;font-size:14px;font-family:inherit;outline:none;' +
            'transition:all .25s ' + ease + ';box-sizing:border-box;color:#1f2937;background:#fff;' +
            'box-shadow:inset 0 1px 2px rgba(10,40,95,.03);}' +
            '.hr-field input::placeholder,.hr-field textarea::placeholder{color:#b5bdc9;font-size:13px;}' +
            '.hr-field input:hover,.hr-field textarea:hover{border-color:#cbd2dc;}' +
            '.hr-field input:focus,.hr-field textarea:focus{border-color:#4a9eff;' +
            'box-shadow:0 0 0 4px rgba(74,158,255,.16);background:#fff;}' +
            '.hr-field textarea{resize:vertical;min-height:80px;}' +
            '.hr-field .err{color:#e4393c;font-size:12px;margin-top:6px;display:none;' +
            'padding-left:18px;position:relative;font-weight:500;}' +
            '.hr-field .err::before{content:"⚠";position:absolute;left:0;top:-1px;}' +
            '.hr-field.invalid .err{display:block;animation:hrShake .35s ease-out;}' +
            '.hr-field.invalid input,.hr-field.invalid textarea{border-color:#e4393c;' +
            'box-shadow:0 0 0 3px rgba(228,57,60,.12);}' +
            '@keyframes hrShake{0%,100%{transform:none}25%{transform:translateX(-3px)}75%{transform:translateX(3px)}}' +

            /* ---- 底部 ---- */
            '.hr-modal-foot{display:flex;gap:12px;justify-content:flex-end;padding:16px 26px;' +
            'border-top:1px solid #eef2f7;background:linear-gradient(180deg,rgba(247,249,252,.3),transparent);}' +

            /* ---- 按钮 ---- */
            '.hr-btn{padding:11px 26px;border-radius:8px;font-size:14px;cursor:pointer;font-family:inherit;' +
            'border:none;font-weight:600;letter-spacing:.5px;transition:all .25s ' + ease + ';}' +
            '.hr-btn-cancel{background:#f7f9fc;color:#4b5563;border:1px solid #e5e9f0;}' +
            '.hr-btn-cancel:hover{background:#eef2f7;border-color:#cbd2dc;transform:translateY(-1px);}' +
            '.hr-btn-submit{background:linear-gradient(135deg,#e4393c,#f5222d);color:#fff;' +
            'box-shadow:0 6px 20px rgba(228,57,60,.38);position:relative;overflow:hidden;isolation:isolate;padding:11px 32px;}' +
            '.hr-btn-submit::before{content:"";position:absolute;inset:0;' +
            'background:linear-gradient(120deg,transparent 25%,rgba(255,255,255,.32) 50%,transparent 75%);' +
            'transform:translateX(-110%);transition:transform .75s ' + ease + ';z-index:-1;}' +
            '.hr-btn-submit:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(228,57,60,.48);}' +
            '.hr-btn-submit:hover::before{transform:translateX(110%);}' +
            '.hr-btn-submit:active{transform:translateY(0);}' +
            '.hr-btn-submit:disabled{opacity:.6;cursor:not-allowed;transform:none;box-shadow:0 2px 8px rgba(228,57,60,.25);}' +

            /* ---- 响应式 ---- */
            '@media (max-width:520px){.hr-modal{border-radius:12px;}' +
            '.hr-modal-head{padding:16px 18px 12px;}' +
            '.hr-modal-body{padding:16px 18px;}' +
            '.hr-modal-foot{padding:14px 18px;}' +
            '.hr-btn{padding:10px 18px;font-size:13px;}}' +

            /* ---- 减少动效 ---- */
            '@media (prefers-reduced-motion:reduce){' +
            '.hr-modal,.hr-modal-mask,.hr-modal-close,.hr-btn,.hr-field.invalid .err{animation:none!important;transition:none!important;}}';

        var styleEl = document.createElement('style');
        styleEl.id = 'hr-checkout-modal-style';
        styleEl.appendChild(document.createTextNode(css));
        document.head.appendChild(styleEl);

        var mask = document.createElement('div');
        mask.className = 'hr-modal-mask';
        mask.id = 'hr-checkout-modal';
        mask.innerHTML =
            '<div class="hr-modal">' +
            '<div class="hr-modal-head">' +
            '<h3>📝 填写订单信息</h3>' +
            '<button class="hr-modal-close" onclick="HRCart.closeCheckoutModal()" title="关闭">×</button>' +
            '</div>' +
            '<div class="hr-modal-body">' +
            '<div class="hr-summary">' +
            '<span class="label">共 <strong id="hrCoQty">0</strong> 件商品，合计：</span>' +
            '<span class="amount" id="hrCoTotal">¥0</span>' +
            '</div>' +
            '<div class="hr-field" id="hrField-name">' +
            '<label>收货人姓名<span class="req">*</span></label>' +
            '<input type="text" id="hrCoName" placeholder="请输入收货人姓名" maxlength="32">' +
            '<div class="err">请填写收货人姓名</div>' +
            '</div>' +
            '<div class="hr-field" id="hrField-phone">' +
            '<label>联系电话<span class="req">*</span></label>' +
            '<input type="text" id="hrCoPhone" placeholder="请输入手机号或座机号" maxlength="20">' +
            '<div class="err">请填写正确的联系电话</div>' +
            '</div>' +
            '<div class="hr-field" id="hrField-address">' +
            '<label>收货地址<span class="req">*</span></label>' +
            '<textarea id="hrCoAddress" placeholder="请输入详细收货地址（省/市/区/街道/门牌号）" maxlength="500"></textarea>' +
            '<div class="err">请填写收货地址</div>' +
            '</div>' +
            '<div class="hr-field">' +
            '<label>订单备注（可选）</label>' +
            '<textarea id="hrCoRemark" placeholder="如有特殊需求请在此说明" maxlength="500"></textarea>' +
            '</div>' +
            '</div>' +
            '<div class="hr-modal-foot">' +
            '<button class="hr-btn hr-btn-cancel" onclick="HRCart.closeCheckoutModal()">取消</button>' +
            '<button class="hr-btn hr-btn-submit" id="hrCoSubmit" onclick="HRCart.submitCheckout()">确认提交</button>' +
            '</div>' +
            '</div>';
        document.body.appendChild(mask);

        //点击遮罩关闭
        mask.addEventListener('click', function (e) {
            if (e.target === mask) { closeCheckoutModal(); }
        });
    }

    function openCheckoutModal() {
        var mask = document.getElementById('hr-checkout-modal');
        if (!mask) return;
        //填充合计
        var qtyEl = document.getElementById('hrCoQty');
        var totalEl = document.getElementById('hrCoTotal');
        if (qtyEl) qtyEl.textContent = getCartCount();
        if (totalEl) {
            var total = getCartTotal();
            totalEl.textContent = total ? ('¥' + total.toLocaleString()) : '¥询价';
        }
        //清空表单
        ['hrCoName', 'hrCoPhone', 'hrCoAddress', 'hrCoRemark'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.value = ''; }
        });
        ['hrField-name', 'hrField-phone', 'hrField-address'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) { el.classList.remove('invalid'); }
        });
        //重置提交按钮
        var btn = document.getElementById('hrCoSubmit');
        if (btn) { btn.disabled = false; btn.textContent = '确认提交'; }

        mask.classList.add('show');
        //自动聚焦姓名
        setTimeout(function () {
            var n = document.getElementById('hrCoName');
            if (n) { n.focus(); }
        }, 100);
    }

    function closeCheckoutModal() {
        var mask = document.getElementById('hr-checkout-modal');
        if (mask) { mask.classList.remove('show'); }
    }

    /* ---------- 实际提交订单到后端 ---------- */
    function submitCheckout() {
        var name = (document.getElementById('hrCoName').value || '').trim();
        var phone = (document.getElementById('hrCoPhone').value || '').trim();
        var address = (document.getElementById('hrCoAddress').value || '').trim();
        var remark = (document.getElementById('hrCoRemark').value || '').trim();

        //校验
        var valid = true;
        var fName = document.getElementById('hrField-name');
        var fPhone = document.getElementById('hrField-phone');
        var fAddr = document.getElementById('hrField-address');
        fName.classList.remove('invalid');
        fPhone.classList.remove('invalid');
        fAddr.classList.remove('invalid');

        if (!name) { fName.classList.add('invalid'); valid = false; }
        //电话：手机号或座机（支持区号-号码）
        if (!phone || !/^[\d\-+ ]{6,20}$/.test(phone)) { fPhone.classList.add('invalid'); valid = false; }
        if (!address) { fAddr.classList.add('invalid'); valid = false; }
        if (!valid) return;

        var dto = {
            contactName: name,
            contactPhone: phone,
            contactAddress: address
        };
        if (remark) { dto.remark = remark; }

        var btn = document.getElementById('hrCoSubmit');
        if (btn) { btn.disabled = true; btn.textContent = '提交中...'; }

        fetch(apiUrl('').replace('/cart', '/order/checkout'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(dto)
        }).then(function (resp) {
            if (handleAuthFailure(resp)) {
                throw new Error('未登录或登录已过期');
            }
            return resp.json();
        }).then(function (res) {
            if (res.code === 0 && res.data) {
                closeCheckoutModal();
                //后端已清空购物车，同步清空本地
                writeLocal([]);
                try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
                updateCartBadges();
                renderCartPage();

                var orderNo = res.data.orderNo || '';
                var qty = res.data.totalQuantity || 0;
                var total = parseFloat(res.data.totalAmount) || 0;
                var totalText = total ? ('¥' + total.toLocaleString()) : '¥询价';
                if (confirm('订单提交成功！\n订单号：' + orderNo + '\n共 ' + qty + ' 件商品，合计：' + totalText + '\n\n是否查看我的订单？')) {
                    location.href = './order.html';
                }
            } else {
                if (typeof showToast === 'function') {
                    showToast(res.message || res.msg || '订单提交失败', 'error');
                } else {
                    alert(res.message || res.msg || '订单提交失败');
                }
            }
        }).catch(function (err) {
            if (typeof showToast === 'function') {
                showToast('订单提交失败：' + err.message, 'error');
            } else {
                alert('订单提交失败：' + err.message);
            }
        }).finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = '确认提交'; }
        });
    }

    /* ---------- 跳转到订单页 ---------- */
    function viewOrders() {
        location.href = './order.html';
    }

    /* ---------- 注入角标 CSS（一次） ---------- */
    function injectBadgeStyle() {
        if (document.getElementById('hr-cart-badge-style')) return;
        var css =
            '.cart-badge{' +
            'position:absolute;top:-8px;right:-8px;' +
            'min-width:18px;height:18px;line-height:18px;padding:0 5px;' +
            'border-radius:9px;background:#e4393c;color:#fff;font-size:11px;' +
            'text-align:center;font-weight:normal;z-index:10;' +
            'box-shadow:0 1px 3px rgba(228,57,60,0.4);' +
            '}' +
            '.cart-badge[style*="display:none"]{display:none!important;}';
        var style = document.createElement('style');
        style.id = 'hr-cart-badge-style';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    }

    /* ---------- 退出登录：清空购物车本地数据 ---------- */
    function logout() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(SYNCED_FLAG);
        } catch (e) { }
        writeLocal([]);
    }

    /* ---------- 暴露到全局 ---------- */
    var HRCart = {
        getCart: getCart,
        getCartCount: getCartCount,
        getCartTotal: getCartTotal,
        addToCart: addToCart,
        addToCartFromPage: addToCartFromPage,
        removeFromCart: removeFromCart,
        updateCartQty: updateCartQty,
        clearCart: clearCart,
        renderCartPage: renderCartPage,
        updateCartBadges: updateCartBadges,
        changeItemQty: changeItemQty,
        setItemQty: setItemQty,
        removeCartItem: removeCartItem,
        clearCartAndRefresh: clearCartAndRefresh,
        checkout: checkout,
        submitCheckout: submitCheckout,
        closeCheckoutModal: closeCheckoutModal,
        syncFromServer: syncFromServer,
        logout: logout,
        viewOrders: viewOrders
    };
    window.HRCart = HRCart;
    window.addToCartFromPage = addToCartFromPage;

    /* ---------- 初始化 ---------- */
    function init() {
        injectBadgeStyle();
        enhanceCartButtons();
        initMobileSidebar();

        //检测登录态变化：之前登录过（有SYNCED_FLAG），但现在没token了，说明刚退出登录，清空购物车
        var hadSynced = false;
        try { hadSynced = localStorage.getItem(SYNCED_FLAG) === '1'; } catch (e) { }
        if (hadSynced && !isLoggedIn()) {
            logout();
        }

        if (isLoggedIn()) {
            //已登录：若本地有未同步的游客数据，先合并到后端，再从后端同步
            var synced = false;
            try { synced = localStorage.getItem(SYNCED_FLAG) === '1'; } catch (e) { }
            if (!synced && getCart().length) {
                mergeLocalToServer().then(syncFromServer);
            } else {
                syncFromServer();
            }
        }

        if (document.getElementById('cartContainer')) {
            renderCartPage();
        }
    }

    function initMobileSidebar() {
        var sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        var title = sidebar.querySelector('.sidebar-title');
        if (!title) return;
        // 默认折叠（移动端）
        if (window.innerWidth <= 768) {
            sidebar.classList.add('collapsed');
        }
        title.addEventListener('click', function () {
            sidebar.classList.toggle('collapsed');
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
