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
 *   2) 所有 .cart-btn 自动：href → ./pages/user/cart.html，追加数量角标
 *   3) 暴露 window.addToCartFromPage，供产品详情页 handleAddCart 调用
 *   4) 购物车页调用 HRCart.renderCartPage() 渲染
 *
 * 对外 API（HRCart）保持不变，调用方无需改动。
 * ============================================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'hr_cart_items';
    var SYNCED_FLAG = 'hr_cart_synced'; // 标记本地是否已与后端同步

    /* ---------- 动态计算购物车页面路径 ---------- */
    function computeCartPage() {
        try {
            var path = window.location.pathname;
            // Normalize: remove trailing filename
            var dir = path.substring(0, path.lastIndexOf('/') + 1);
            // Count directory depth relative to site root
            // Pages at root: /index.html -> '' (empty)
            // Pages at pages/: /pages/user/cart.html -> 'pages/user/'
            // We need to figure out the relative path from current page to pages/user/cart.html
            
            var parts = path.split('/');
            // Find 'pages' segment index
            var pagesIdx = -1;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === 'pages') {
                    pagesIdx = i;
                    break;
                }
            }
            
            if (pagesIdx === -1) {
                // Root level (e.g., /index.html, /shangcheng.html)
                return 'pages/user/cart.html';
            }
            
            // Check if current page is in pages/user/
            if (parts[pagesIdx + 1] === 'user') {
                return 'cart.html';
            }
            
            // Any other pages/ subdirectory (about, info, product-detail, etc.)
            return '../user/cart.html';
        } catch (e) {
            return 'pages/user/cart.html';
        }
    }

    var CART_PAGE = computeCartPage();

    /* ---------- 根路径辅助：返回从当前页面到站点根的相对路径 ---------- */
    function getRootPrefix() {
        try {
            var path = window.location.pathname;
            var parts = path.split('/');
            var pagesIdx = -1;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === 'pages') { pagesIdx = i; break; }
            }
            if (pagesIdx === -1) return '';
            var depth = parts.length - 1 - pagesIdx;
            var prefix = '';
            for (var j = 0; j < depth; j++) prefix += '../';
            return prefix;
        } catch (e) { return ''; }
    }

    var ROOT = getRootPrefix();

    /* 基于根路径构造目标页面路径 */
    function rootPath(rel) { return ROOT + rel; }

    var API_BASE = (typeof SERVER_BASE_URL !== 'undefined') ? SERVER_BASE_URL : '';
    var SYNCING = false; // 防止同步过程中触发后端写回

    /* ---------- 登录态 ---------- */
    function isLoggedIn() {
        try {
            if (typeof checkTokenExpired === 'function' && checkTokenExpired()) return false;
            return !!localStorage.getItem('token');
        } catch (e) { return false; }
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

    /* ---------- 获取商品图片/头像（图片失败时回退为文字头像） ---------- */
    function getItemAvatar(it) {
        // 如果有图片，尝试加载；加载失败时用文字头像替换
        if (it.image) {
            var safeImg = escapeHtml(it.image);
            var safeName = escapeHtml(it.name || '商');
            var initial = safeName.charAt(0) || '?';
            // 根据商品名生成颜色
            var colors = ['#0a4db4', '#1e6fd9', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#faad14', '#2f54eb', '#f5222d'];
            var colorIdx = 0;
            for (var ci = 0; ci < safeName.length; ci++) { colorIdx = (colorIdx + safeName.charCodeAt(ci)) % colors.length; }
            var bg = colors[colorIdx];
            return '<div class="avatar-wrap">' +
                '<img src="' + safeImg + '" alt="' + safeName + '" ' +
                'onerror="this.parentNode.innerHTML=\'<div class=\\\'avatar-fallback\\\' style=\\\'background:' + bg + '\\\'>' + initial + '</div>\'">' +
                '</div>';
        }
        // 无图片：使用带颜色背景的文字头像
        var name = it.name || '商品';
        var ch = name.charAt(0) || '?';
        var colors2 = ['#0a4db4', '#1e6fd9', '#52c41a', '#722ed1', '#fa8c16', '#eb2f96', '#13c2c2', '#faad14', '#2f54eb', '#f5222d'];
        var idx = 0;
        for (var k = 0; k < name.length; k++) { idx = (idx + name.charCodeAt(k)) % colors2.length; }
        return '<div class="avatar-fallback" style="background:' + colors2[idx] + '">' + ch + '</div>';
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

    /* 处理 401：token 失效，回退为游客模式并清空本地购物车数据 */
    function handleAuthFailure(resp) {
        if (resp && resp.status === 401) {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem(SYNCED_FLAG);
            } catch (e) { }
            // 同标签页不触发 storage 事件，需显式清空购物车并刷新显示
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) { }
            writeLocal([]);
            if (document.getElementById('cartContainer')) { renderCartPage(); }
            return true;
        }
        return false;
    }

    /* 后端 CartItem → 前端购物车项格式（保留本地已有图片/字段） */
    function fromServerItem(s) {
        var key = s.productKey || (s.productId ? s.productId : '');
        // 查找本地是否已有该项（保留本地图片等后端可能缺失的字段）
        var localCart = [];
        try { localCart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { }
        var existing = null;
        for (var i = 0; i < localCart.length; i++) {
            if (String(localCart[i].key) === String(key)) { existing = localCart[i]; break; }
        }

        // 图片策略：优先使用本地图片（因为本地图片是从详情页正确采集的）
        // 只有当本地没有有效图片时，才使用后端的图片
        var localImage = (existing && existing.image) ? existing.image : '';
        var serverImage = s.image || '';
        // 验证后端图片是否有效（非空、非data:开头、包含有效URL特征）
        var validServerImage = isValidImageUrl(serverImage) ? serverImage : '';
        // 本地图片优先级更高
        var finalImage = localImage || validServerImage || '';

        return {
            key: key,
            id: s.productId || (existing && existing.id) || '',
            name: (existing && existing.name) || s.productName || '未命名商品',
            price: parseFloat(s.price) || (existing ? existing.price : 0),
            priceText: (existing && existing.priceText) || s.priceText || (s.price ? ('¥' + s.price) : '¥询价'),
            image: finalImage,
            spec: s.spec || (existing && existing.spec) || '',
            qty: parseInt(s.quantity, 10) || (existing ? (parseInt(existing.qty, 10) || 1) : 1),
            url: (existing && existing.url) || s.url || '',
            addedAt: s.createdAt ? Date.parse(s.createdAt.replace(' ', 'T')) : (existing ? existing.addedAt : Date.now())
        };
    }

    /* ---------- 辅助：验证图片 URL 是否有效 ---------- */
    function isValidImageUrl(url) {
        if (!url || typeof url !== 'string') return false;
        // 排除 data: URI
        if (url.indexOf('data:') === 0) return false;
        // 排除空值
        if (!url.trim()) return false;
        // 必须包含 http 或 / 等有效路径特征
        return url.indexOf('http') === 0 || url.indexOf('/') === 0 || url.indexOf('./') === 0;
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
            // 如果新采集的图片更有效（非空且当前图片无效），更新图片
            if (item.image && (!existing.image || !isValidImageUrl(existing.image))) {
                existing.image = item.image;
            }
            // 如果名称被修正了，也更新名称
            if (item.name && item.name !== '未命名商品' && existing.name === '未命名商品') {
                existing.name = item.name;
            }
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
            // 对于已存在的商品，使用PUT更新；对于新商品，使用POST创建
            var apiMethod = existing ? 'PUT' : 'POST';
            var apiBody = existing ? { 
                productKey: key, 
                quantity: parseInt(item.qty, 10) || 1 
            } : toServerItem(item);
            fetch(apiUrl(''), {
                method: apiMethod,
                headers: authHeaders(),
                body: JSON.stringify(apiBody)
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

        // 精确采集商品图片：优先级从高到低
        var image = '';

        // 1. 优先使用 ID 选择器 #mainImage（所有详情页都有此ID）
        var mainImg = document.getElementById('mainImage');
        if (mainImg && mainImg.tagName === 'IMG') {
            image = getValidImageSrc(mainImg);
        }

        // 2. 尝试商品展示区域内的选择器
        if (!image) {
            var preciseSelectors = [
                '.product-show .product-gallery .main-image img',
                '.product-gallery .main-image img',
                '.product-show .main-image img',
                '.product-detail-main img'
            ];
            for (var i = 0; i < preciseSelectors.length; i++) {
                var imgEl = document.querySelector(preciseSelectors[i]);
                if (imgEl && imgEl.tagName === 'IMG') {
                    image = getValidImageSrc(imgEl);
                    if (image) break;
                }
            }
        }

        // 3. 尝试缩略图列表中的第一张
        if (!image) {
            var firstThumb = document.querySelector('.thumbnail-list .thumb-item img, .thumb-item img');
            if (firstThumb && firstThumb.tagName === 'IMG') {
                image = getValidImageSrc(firstThumb);
            }
        }

        // 4. 兜底：在商品展示区域内查找第一张有效图片
        if (!image) {
            var productShow = document.querySelector('.product-show, .product-gallery');
            if (productShow) {
                var imgsInShow = productShow.querySelectorAll('img');
                for (var j = 0; j < imgsInShow.length; j++) {
                    var img = imgsInShow[j];
                    var src = getValidImageSrc(img);
                    if (src) {
                        image = src;
                        break;
                    }
                }
            }
        }

        // 5. 最终兜底：取主内容区非装饰性的大图（排除header、footer、logo区域）
        if (!image) {
            var mainContent = document.querySelector('.product-show, .product-detail, .content-area, main') || document.body;
            var allImgs = mainContent.querySelectorAll('img');
            for (var k = 0; k < allImgs.length; k++) {
                var imgEl2 = allImgs[k];
                var src2 = imgEl2.getAttribute('src') || imgEl2.src || '';
                var w = imgEl2.naturalWidth || imgEl2.offsetWidth;
                var h = imgEl2.naturalHeight || imgEl2.offsetHeight;
                // 排除小图标和logo
                if (w > 80 && h > 80 && src2 && src2.indexOf('icon') === -1 && src2.indexOf('logo') === -1 && src2.indexOf('data:') !== 0) {
                    image = src2;
                    break;
                }
            }
        }

        var qtyEl = document.getElementById('quantityInput') || document.querySelector('input[type=number]');
        var qty = qtyEl ? (parseInt(qtyEl.value, 10) || 1) : 1;

        var specEl = document.querySelector('.spec-option.selected, .spec-item.active, .spec-item.selected');
        var spec = specEl ? (specEl.textContent || '').trim() : '';

        var pageId = location.pathname.split('/').pop().replace(/\.html$/i, '') || 'product';
        var id = pageId + (spec ? ('_' + spec) : '');
        var key = id;

        return {
            key: key,
            id: id,
            name: name,
            price: price,
            priceText: priceText || (price ? ('¥' + price) : '¥询价'),
            image: image,
            spec: spec,
            qty: qty,
            url: location.pathname.replace(/^\//, '') + location.search
        };
    }

    /* ---------- 辅助：获取有效的图片 URL ---------- */
    function getValidImageSrc(imgEl) {
        if (!imgEl || imgEl.tagName !== 'IMG') return '';
        var src = imgEl.getAttribute('src') || imgEl.src || '';
        // 排除 data: URI、空值、装饰性图片
        if (!src || src.indexOf('data:') === 0 || src.indexOf('icon') !== -1 || src.indexOf('logo') !== -1) {
            return '';
        }
        // 返回完整路径
        return imgEl.src || src;
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

    /* ---------- 购物车页渲染（优化版 v3 - 保留表格结构和colgroup） ---------- */
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
                '<a class="btn-go-shop" href="' + rootPath('index.html') + '">去逛逛</a>' +
                '</div>';
            if (totalEl) totalEl.textContent = '¥0';
            if (countEl) countEl.textContent = '0';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
            if (clearBtn) clearBtn.style.display = 'none';
            return;
        }

        // 确保表格结构存在（含 colgroup），只更新 tbody
        var table = wrap.querySelector('table.cart-table');
        if (!table) {
            // 首次渲染或从空状态恢复：重建完整结构
            table = document.createElement('table');
            table.className = 'cart-table';
            table.id = 'cartTable';
            table.innerHTML =
                '<colgroup>' +
                '<col class="colgroup-img">' +
                '<col class="colgroup-name">' +
                '<col class="colgroup-price">' +
                '<col class="colgroup-qty">' +
                '<col class="colgroup-subtotal">' +
                '<col class="colgroup-op">' +
                '</colgroup>' +
                '<thead><tr>' +
                '<th>商品</th>' +
                '<th>名称</th>' +
                '<th>单价</th>' +
                '<th>数量</th>' +
                '<th>小计</th>' +
                '<th>操作</th>' +
                '</tr></thead>' +
                '<tbody></tbody>';
            wrap.innerHTML = '';
            wrap.appendChild(table);
        }

        // 构建tbody行数据
        var rows = cart.map(function (it, index) {
            var qty = parseInt(it.qty, 10) || 1;
            var priceVal = parseFloat(it.price);
            var hasPrice = !isNaN(priceVal) && priceVal > 0;
            var price = hasPrice ? priceVal : 0;
            var subtotal = price * qty;

            // 单价显示：有价格时显示纯数字（CSS::before会加¥），无价格时显示"¥询价"
            var priceDisplay = hasPrice ? price.toLocaleString() : '¥询价';
            var subtotalDisplay = hasPrice ? subtotal.toLocaleString() : '¥询价';
            var avatar = getItemAvatar(it);

            // 生成商品详情链接
            var productLink = '';
            if (it.url) {
                productLink = '<a class="link" href="' + rootPath(it.url) + '">查看商品 <span class="arrow">→</span></a>';
            }

            // 生成规格标签
            var specTag = '';
            if (it.spec) {
                specTag = '<div class="spec">规格：' + escapeHtml(it.spec) + '</div>';
            }

            var priceClass = hasPrice ? 'col-price has-price' : 'col-price no-price';
            var subtotalClass = hasPrice ? 'col-subtotal has-price' : 'col-subtotal no-price';

            return '' +
                '<tr data-key="' + escapeHtml(it.key) + '" style="animation-delay: ' + (index * 0.05) + 's">' +
                '<td class="col-img">' +
                '<div class="img-box">' + avatar + '</div>' +
                '</td>' +
                '<td class="col-name">' +
                '<div class="name" title="' + escapeHtml(it.name) + '">' + escapeHtml(it.name) + '</div>' +
                specTag +
                productLink +
                '</td>' +
                '<td class="' + priceClass + '" data-price="' + (it.price || 0) + '">' + escapeHtml(priceDisplay) + '</td>' +
                '<td class="col-qty">' +
                '<div class="qty-control">' +
                '<button class="qty-btn minus" aria-label="减少" onclick="HRCart.changeItemQty(\'' + escapeHtml(it.key) + '\', -1)">−</button>' +
                '<input class="qty-input" type="number" value="' + qty + '" min="1" max="999" onchange="HRCart.setItemQty(\'' + escapeHtml(it.key) + '\', this.value)">' +
                '<button class="qty-btn plus" aria-label="增加" onclick="HRCart.changeItemQty(\'' + escapeHtml(it.key) + '\', 1)">+</button>' +
                '</div>' +
                '</td>' +
                '<td class="' + subtotalClass + '" data-subtotal="' + subtotal + '">' + escapeHtml(subtotalDisplay) + '</td>' +
                '<td class="col-op">' +
                '<button class="btn-remove" onclick="HRCart.removeCartItem(\'' + escapeHtml(it.key) + '\')">' +
                '<span class="icon">🗑</span>' +
                '<span class="text">删除</span>' +
                '</button>' +
                '</td>' +
                '</tr>';
        }).join('');

        // 只更新 tbody，保留 colgroup 和 thead
        var tbody = table.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = rows;
        }

        // 合计
        var total = getCartTotal();
        if (totalEl) totalEl.textContent = total ? ('¥' + total.toLocaleString()) : '¥询价';
        if (countEl) countEl.textContent = getCartCount();
        if (checkoutBtn) checkoutBtn.style.display = '';
        if (clearBtn) clearBtn.style.display = '';

        // 添加表格完成动画
        setTimeout(function () {
            if (table) {
                table.classList.add('table-ready');
            }
        }, 50);
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

        // 触发数量变更动画
        setTimeout(function () {
            var row = document.querySelector('tr[data-key="' + key + '"]');
            if (row) {
                var qtyInput = row.querySelector('.qty-input');
                var subtotalCell = row.querySelector('.col-subtotal');
                if (qtyInput) {
                    qtyInput.classList.remove('changed');
                    // 强制重排以重启动画
                    void qtyInput.offsetWidth;
                    qtyInput.classList.add('changed');
                }
                if (subtotalCell) {
                    subtotalCell.classList.remove('changed');
                    void subtotalCell.offsetWidth;
                    subtotalCell.classList.add('changed');
                }
            }
        }, 10);

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

        // 触发数量变更动画
        setTimeout(function () {
            var row = document.querySelector('tr[data-key="' + key + '"]');
            if (row) {
                var qtyInput = row.querySelector('.qty-input');
                var subtotalCell = row.querySelector('.col-subtotal');
                if (qtyInput) {
                    qtyInput.classList.remove('changed');
                    void qtyInput.offsetWidth;
                    qtyInput.classList.add('changed');
                }
                if (subtotalCell) {
                    subtotalCell.classList.remove('changed');
                    void subtotalCell.offsetWidth;
                    subtotalCell.classList.add('changed');
                }
            }
        }, 10);
    }

    function removeCartItem(key) {
        // 获取商品名称用于确认对话框
        var cart = getCart();
        var itemName = '';
        for (var i = 0; i < cart.length; i++) {
            if (cart[i].key === String(key)) {
                itemName = cart[i].name || '该商品';
                break;
            }
        }

        // 显示自定义确认对话框
        showConfirmDialog(
            '确认删除',
            '确定要从购物车中删除"' + itemName + '"吗？',
            function () {
                // 先执行删除的视觉动画
                var row = document.querySelector('tr[data-key="' + key + '"]');
                if (row) {
                    row.style.transition = 'all 0.3s cubic-bezier(0.55, 0, 1, 0.45)';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(30px)';
                    row.style.height = '0px';
                    row.style.marginBottom = '-1px';
                }
                // 延迟删除以显示动画
                setTimeout(function () {
                    removeFromCart(key);
                    renderCartPage();
                    if (typeof showToast === 'function') {
                        showToast('已从购物车移除', 'success');
                    }
                }, 250);
            }
        );
    }

    /* ---------- 自定义确认对话框 ---------- */
    function showConfirmDialog(title, content, onConfirm) {
        // 创建对话框
        var dialog = document.createElement('div');
        dialog.className = 'confirm-dialog';
        dialog.innerHTML =
            '<div class="dialog-box">' +
            '<div class="dialog-title">' + escapeHtml(title) + '</div>' +
            '<div class="dialog-content">' + escapeHtml(content) + '</div>' +
            '<div class="dialog-actions">' +
            '<button class="btn-cancel">取消</button>' +
            '<button class="btn-confirm">确认删除</button>' +
            '</div>' +
            '</div>';

        // 绑定事件
        var cancelBtn = dialog.querySelector('.btn-cancel');
        var confirmBtn = dialog.querySelector('.btn-confirm');

        cancelBtn.addEventListener('click', function () {
            document.body.removeChild(dialog);
        });

        confirmBtn.addEventListener('click', function () {
            document.body.removeChild(dialog);
            if (onConfirm) onConfirm();
        });

        // 点击遮罩关闭
        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) {
                document.body.removeChild(dialog);
            }
        });

        // ESC键关闭
        var escHandler = function (e) {
            if (e.key === 'Escape') {
                document.body.removeChild(dialog);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        document.body.appendChild(dialog);
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
                var curPath = location.pathname.replace(/^\//, '') + location.search;
                location.href = rootPath('pages/user/login.html') + '?redirect=' + encodeURIComponent(curPath);
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

        var valid = true;
        var fName = document.getElementById('hrField-name');
        var fPhone = document.getElementById('hrField-phone');
        var fAddr = document.getElementById('hrField-address');
        fName.classList.remove('invalid');
        fPhone.classList.remove('invalid');
        fAddr.classList.remove('invalid');

        if (!name) { fName.classList.add('invalid'); valid = false; }
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
                writeLocal([]);
                try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
                updateCartBadges();
                renderCartPage();

                var order = res.data;
                var orderNo = order.orderNo || '';
                var qty = order.totalQuantity || 0;
                var total = parseFloat(order.totalAmount) || 0;
                var totalText = total ? ('¥' + total.toLocaleString()) : '¥询价';

                /* ---------- 分支判断：有价商品走支付流程，询价商品直接下单 ---------- */
                if (total > 0) {
                    // 有价商品：弹出支付窗口，支持微信/支付宝支付
                    showPaymentModal(order);
                } else {
                    // 询价商品（totalAmount=0）：直接提交订单，不走支付
                    showInquirySuccessModal(orderNo, qty, totalText);
                }
            } else {
                showToastMsg(res.message || res.msg || '订单提交失败', 'error');
            }
        }).catch(function (err) {
            showToastMsg('订单提交失败：' + err.message, 'error');
        }).finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = '确认提交'; }
        });
    }

    function showToastMsg(msg, type) {
        if (typeof showToast === 'function') {
            showToast(msg, type || 'error');
        } else {
            alert(msg);
        }
    }

    /* ---------- 询价订单成功弹窗（替代原生confirm） ---------- */
    function showInquirySuccessModal(orderNo, qty, totalText) {
        var html =
            '<div id="hrInquiryModal" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:#fff;border-radius:14px;width:420px;max-width:92vw;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.3);">' +
            '<div style="padding:32px 24px;text-align:center;">' +
            '<div style="width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:linear-gradient(135deg,#52c41a,#389e0d);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(82,196,26,.35);animation:hrPayPop .4s cubic-bezier(.22,1,.36,1);">' +
            '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
            '</div>' +
            '<div style="font-size:20px;font-weight:700;color:#333;margin-bottom:8px;">订单提交成功</div>' +
            '<div style="font-size:14px;color:#888;margin-bottom:4px;">订单号：' + orderNo + '</div>' +
            '<div style="font-size:14px;color:#888;margin-bottom:16px;">共 ' + qty + ' 件商品，合计：' + totalText + '</div>' +
            '<div style="background:#f6ffed;border:1px solid #b7eb8f;border-radius:8px;padding:10px 16px;margin-bottom:20px;font-size:13px;color:#389e0d;text-align:left;">' +
            '您的订单为询价单，客服将尽快与您联系确认价格。如有疑问请联系在线客服。</div>' +
            '</div>' +
            '<div style="border-top:1px solid #f0f0f0;padding:16px 24px;display:flex;gap:12px;">' +
            '<button onclick="closeInquiryModal()" style="flex:1;padding:12px;border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;font-size:14px;color:#666;">继续购物</button>' +
            '<button onclick="location.href=rootPath(\'pages/user/order.html\')" style="flex:1;padding:12px;border:none;background:#0a4db4;color:#fff;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">查看订单</button>' +
            '</div>' +
            '</div></div>';
        // 注入成功动画关键帧
        if (!document.getElementById('hrPaySuccessStyle')) {
            var sty = document.createElement('style');
            sty.id = 'hrPaySuccessStyle';
            sty.textContent = '@keyframes hrPayPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}';
            document.head.appendChild(sty);
        }
        document.body.insertAdjacentHTML('beforeend', html);
    }
    window.closeInquiryModal = function () {
        var m = document.getElementById('hrInquiryModal');
        if (m) m.remove();
    };

    /* ---------- 支付弹窗：有价商品结算后弹出，支持微信/支付宝扫码支付 ---------- */
    var _paymentOrder = null;   // 当前订单对象
    var _paymentTimer = null;   // 支付倒计时定时器
    var _paymentStatusTimer = null; // 支付状态轮询定时器
    var _paymentHandled = false; // 防止支付成功被重复处理（轮询+mock-pay可能同时触发）
    var _qrcodeJsLoading = null; // Promise：确保 qrcode.min.js 只加载一次

    /**
     * 按需加载本地 qrcode.min.js（与 cart.js 同目录）。
     * 相比在 21 个 HTML 模板里手工写 <script>，动态加载更稳妥：
     * 不扫码时不会下载，下载失败时自动降级为 qrserver.com 在线图片（在 _renderQrCode 内处理）。
     * @returns {Promise<boolean>} QRCode 是否可用
     */
    function _ensureQrCodeJs() {
        if (window.QRCode && typeof window.QRCode === 'function') return Promise.resolve(true);
        if (_qrcodeJsLoading) return _qrcodeJsLoading;
        _qrcodeJsLoading = new Promise(function (resolve) {
            try {
                // 从当前页面到站点根的相对路径（getRootPrefix 无参数），qrcode.min.js 与 cart.js 都位于站点根
                var rootPrefix = '';
                if (typeof getRootPrefix === 'function') {
                    try { rootPrefix = getRootPrefix() || ''; } catch (e) { rootPrefix = ''; }
                }
                var src = rootPrefix + 'qrcode.min.js';
                var s = document.createElement('script');
                s.type = 'text/javascript';
                s.src = src;
                s.onload = function () {
                    resolve(window.QRCode && typeof window.QRCode === 'function');
                };
                s.onerror = function () {
                    console.warn('[QR] 本地qrcode.min.js加载失败（路径：' + src + '），将回退到 qrserver.com。' +
                        '若需离线渲染，请确认 qrcode.min.js 与 cart.js 位于同一目录。');
                    resolve(false);
                };
                document.head.appendChild(s);
            } catch (err) {
                console.warn('[QR] 动态加载qrcode.min.js发生异常：', err);
                resolve(false);
            }
        });
        return _qrcodeJsLoading;
    }

    /**
     * 显示支付弹窗
     * 调用时机：订单创建成功后，若 totalAmount > 0（有价商品）
     * 询价商品（totalAmount = 0）不调用此函数
     */
    function showPaymentModal(order) {
        _paymentOrder = order;
        // 进入弹窗就预加载 qrcode.min.js，不阻塞后续渲染（加载完成后下次二维码会自动用本地渲染）
        if (typeof _ensureQrCodeJs === 'function') _ensureQrCodeJs();
        _paymentHandled = false; // 重置防止重复处理的标志
        _createPaymentInProgress = false; // 重置创建支付防抖标志
        _selectedPayType = null; // 重置选中支付方式
        // 注入加载动画关键帧
        if (!document.getElementById('hrPaySpinStyle')) {
            var spinStyle = document.createElement('style');
            spinStyle.id = 'hrPaySpinStyle';
            spinStyle.textContent = '@keyframes hrSpin{to{transform:rotate(360deg)}}';
            document.head.appendChild(spinStyle);
        }
        var total = parseFloat(order.totalAmount) || 0;
        var html =
            '<div id="hrPaymentModal" style="position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:99999;display:flex;align-items:center;justify-content:center;">' +
            '<div style="background:#fff;border-radius:14px;width:420px;max-width:92vw;max-height:90vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.3);">' +
            '<div style="background:linear-gradient(135deg,#0a4db4,#1e88e5);color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center;">' +
            '<div><div style="font-size:18px;font-weight:700;">订单支付</div>' +
            '<div style="font-size:13px;opacity:.85;margin-top:4px;">订单号：' + order.orderNo + ' | 共 ' + order.totalQuantity + ' 件</div></div>' +
            '<button onclick="closePaymentModal()" style="background:rgba(255,255,255,.2);border:none;color:#fff;width:30px;height:30px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1;">×</button>' +
            '</div>' +
            '<div style="padding:24px;overflow-y:auto;">' +
            '<div style="text-align:center;margin-bottom:20px;">' +
            '<div style="font-size:13px;color:#888;">应付金额</div>' +
            '<div style="font-size:36px;font-weight:700;color:#ff4d4f;margin:8px 0;">¥' + total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</div>' +
            '</div>' +
            '<div style="border:1px solid #eee;border-radius:10px;padding:16px;margin-bottom:16px;">' +
            '<div style="font-size:14px;color:#333;font-weight:600;margin-bottom:12px;">选择支付方式</div>' +
            '<div style="display:flex;gap:12px;">' +
            '<div id="payTypeWechat" onclick="selectPayType(\'wechat\')" style="flex:1;border:2px solid #07c160;border-radius:8px;padding:14px;text-align:center;cursor:pointer;background:#f0fdf4;transition:all .2s;">' +
            '<div style="font-size:28px;">💬</div>' +
            '<div style="font-size:14px;color:#07c160;font-weight:600;margin-top:6px;">微信支付</div>' +
            '</div>' +
            '<div id="payTypeAlipay" onclick="selectPayType(\'alipay\')" style="flex:1;border:2px solid #e8e8e8;border-radius:8px;padding:14px;text-align:center;cursor:pointer;transition:all .2s;">' +
            '<div style="font-size:28px;">💰</div>' +
            '<div style="font-size:14px;color:#666;margin-top:6px;">支付宝</div>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '<div id="payQrArea" style="display:none;text-align:center;">' +
            '<div id="payQrCode" style="width:200px;height:200px;margin:0 auto;border:1px solid #eee;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#fafafa;position:relative;overflow:hidden;">' +
            '<div style="position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;">' +
            '<div style="font-size:48px;">📱</div>' +
            '<div style="font-size:13px;margin-top:8px;">请选择支付方式</div>' +
            '</div>' +
            '</div>' +
            '<div style="font-size:13px;color:#888;margin-top:10px;">扫码支付 <span id="payCountdown"></span></div>' +
            '<button id="payMockBtn" onclick="mockPaySuccess()" style="margin-top:12px;display:none;background:#0a4db4;color:#fff;border:none;padding:8px 24px;border-radius:20px;cursor:pointer;font-size:13px;">模拟扫码成功</button>' +
            '</div>' +
            '</div>' +
            '<div style="border-top:1px solid #f0f0f0;padding:16px 24px;display:flex;gap:12px;">' +
            '<button onclick="cancelPayment()" style="flex:1;padding:12px;border:1px solid #ddd;background:#fff;border-radius:8px;cursor:pointer;font-size:14px;color:#666;">取消支付</button>' +
            '<button onclick="viewOrdersFromPayment()" style="flex:1;padding:12px;border:none;background:#0a4db4;color:#fff;border-radius:8px;cursor:pointer;font-size:14px;font-weight:600;">查看订单</button>' +
            '</div>' +
            '</div>';
        document.body.insertAdjacentHTML('beforeend', html);
        selectPayType('wechat');
    }

    /** 当前选中的支付方式（防止切换时旧请求覆盖新UI） */
    var _selectedPayType = null;

    /** 切换支付方式（wechat/alipay），自动创建支付记录并显示二维码 */
    window.selectPayType = function (type) {
        _selectedPayType = type; // 记录当前选中方式
        var wechat = document.getElementById('payTypeWechat');
        var alipay = document.getElementById('payTypeAlipay');
        if (!wechat || !alipay) return;

        if (type === 'wechat') {
            wechat.style.borderColor = '#07c160';
            wechat.style.background = '#f0fdf4';
            wechat.querySelector('div:last-child').style.color = '#07c160';
            alipay.style.borderColor = '#e8e8e8';
            alipay.style.background = '#fff';
            alipay.querySelector('div:last-child').style.color = '#666';
        } else {
            alipay.style.borderColor = '#1677ff';
            alipay.style.background = '#e6f4ff';
            alipay.querySelector('div:last-child').style.color = '#1677ff';
            wechat.style.borderColor = '#e8e8e8';
            wechat.style.background = '#fff';
            wechat.querySelector('div:last-child').style.color = '#666';
        }

        if (_paymentOrder) {
            createPaymentRecord(_paymentOrder.id, type);
        }
    };

    /** 调用后端创建支付记录，获取二维码信息 */
    var _createPaymentInProgress = false; // 防止并发重复创建
    function createPaymentRecord(orderId, payType) {
        if (_createPaymentInProgress) return; // 防抖：上一次请求未完成时忽略
        _createPaymentInProgress = true;
        // 显示加载中
        var qrArea = document.getElementById('payQrArea');
        var qrCode = document.getElementById('payQrCode');
        if (qrArea && qrCode) {
            qrArea.style.display = 'block';
            qrCode.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;color:#999;font-size:13px;"><div style="border:3px solid #e0e0e0;border-top:3px solid #0a4db4;border-radius:50%;width:28px;height:28px;animation:hrSpin .8s linear infinite;margin-right:8px;"></div>正在生成二维码...</div>';
            qrCode.style.background = '#fafafa';
        }
        fetch(apiUrl('').replace('/cart', '/payment/create'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ orderId: orderId, payType: payType })
        }).then(function (resp) {
            if (resp.status === 401) throw new Error('登录已过期，请重新登录');
            if (!resp.ok) throw new Error('服务器错误(' + resp.status + ')');
            return resp.json();
        })
        .then(function (res) {
            // 防止过期响应：用户在请求过程中切换了支付方式时，忽略旧请求的结果
            if (payType !== _selectedPayType) {
                return; // 用户已切换支付方式，忽略此响应
            }
            if (res.code === 0 && res.data) {
                showQrCode(res.data);
                startPaymentPoll(res.data);
            } else {
                showToastMsg(res.message || '创建支付失败', 'error');
                // 恢复选择区域
                if (qrCode) {
                    qrCode.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;"><div style="font-size:40px;">⚠️</div><div style="font-size:13px;margin-top:8px;">' + (res.message || '创建支付失败') + '<br>请重试或选择其他支付方式</div></div>';
                }
            }
        }).catch(function (err) {
            if (err.message.indexOf('登录已过期') >= 0) {
                showToastMsg('登录已过期，正在跳转登录页...', 'error');
                setTimeout(function () { location.href = rootPath('pages/user/login.html?redirect=' + encodeURIComponent(location.pathname.replace(/^\//, '') + location.search)); }, 1500);
            } else {
                showToastMsg('创建支付失败：' + err.message, 'error');
                if (qrCode) {
                    qrCode.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;"><div style="font-size:40px;">⚠️</div><div style="font-size:13px;margin-top:8px;">' + err.message + '<br>请重试或选择其他支付方式</div></div>';
                }
            }
        }).finally(function () {
            _createPaymentInProgress = false;
        });
    }

    /**
     * 二维码渲染：优先用本地 qrcodejs（QRCode 构造函数，零网络依赖），
     * 如果本地库未加载则回退到 qrserver.com 图片，进一步失败时显示可复制的原始链接。
     *
     * @param {HTMLElement} container - 二维码容器
     * @param {string} data - 需要编码的内容（支付协议链接或 mock 文本）
     * @param {string} altText - 失败提示中展示给用户的说明
     * @param {number} size - 画布边长，默认 200
     */
    function _renderQrCode(container, data, altText, size) {
        size = size || 200;
        container.innerHTML = '';
        // 1. 优先本地 qrcodejs（不依赖外网，解决你的"二维码加载失败"）
        if (window.QRCode && typeof window.QRCode === 'function') {
            try {
                // 先放一个 canvas/img 占位（根据浏览器能力 QRCode 会自动填充画布或 img）
                var canvasWrap = document.createElement('div');
                canvasWrap.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;';
                container.appendChild(canvasWrap);
                new window.QRCode(canvasWrap, {
                    text: data,
                    width: size,
                    height: size,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel.H
                });
                // 给用户留一个"复制链接"按钮，扫码不便时可以直接用
                var copyBtn = document.createElement('button');
                copyBtn.type = 'button';
                copyBtn.textContent = '📋 复制支付链接';
                copyBtn.style.cssText = 'display:block;margin:8px auto 0;padding:4px 10px;font-size:12px;border:1px solid #e4e7ed;border-radius:6px;background:#fff;color:#606266;cursor:pointer;';
                copyBtn.onclick = function () {
                    try {
                        var ta = document.createElement('textarea');
                        ta.value = data;
                        document.body.appendChild(ta);
                        ta.select();
                        document.execCommand('copy');
                        document.body.removeChild(ta);
                        copyBtn.textContent = '✅ 已复制';
                        setTimeout(function () { copyBtn.textContent = '📋 复制支付链接'; }, 1500);
                    } catch (e) {
                        copyBtn.textContent = '请手动复制：' + data;
                    }
                };
                if (data.indexOf('MOCK_') < 0) container.appendChild(copyBtn);
                return;
            } catch (err) {
                console.warn('[QR] 本地qrcodejs渲染失败，降级到qrserver.com：', err);
                container.innerHTML = '';
            }
        }
        // 2. 回退：qrserver 在线图片
        var qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=' + size + 'x' + size + '&margin=0&data=' + encodeURIComponent(data);
        var img = document.createElement('img');
        img.src = qrImg;
        img.alt = '支付二维码';
        img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        img.onerror = function () {
            // 3. 最终兜底：展示可复制的支付链接
            container.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;gap:6px;padding:16px;text-align:center;">' +
                '<div style="font-size:36px;">⚠️</div>' +
                '<div style="font-size:13px;line-height:1.6;">二维码加载失败<br>' +
                '<span style="color:#409eff;">' + escapeHtml(altText || '') + '</span></div>' +
                '<div style="font-size:12px;color:#606266;word-break:break-all;background:#f5f7fa;padding:6px 8px;border-radius:6px;margin-top:4px;max-width:100%;">' +
                escapeHtml(data) +
                '</div></div>';
        };
        container.innerHTML = '';
        container.appendChild(img);
    }

    function showQrCode(payment) {
        var qrArea = document.getElementById('payQrArea');
        var qrCode = document.getElementById('payQrCode');
        if (!qrArea || !qrCode) return;
        qrArea.style.display = 'block';

        /* 优先使用后端返回的真实二维码URL（微信code_url / 支付宝qr_code / 沙箱qr.alipay.com链接） */
        var qrUrl = payment.qrCodeUrl || payment.qr_code_url || '';

        /* 模拟扫码按钮显隐：仅在 mock 模式（qrCodeUrl 含 MOCK_）显示，
           与后端 mock-pay 三重防护（登录 + mockEnabled + isMockMode）对齐——
           真实支付环境下后端必然拒绝模拟支付，隐藏入口避免用户点击必然报错 */
        var mockBtn = document.getElementById('payMockBtn');
        if (mockBtn) mockBtn.style.display = (qrUrl.indexOf('MOCK_') >= 0) ? 'inline-block' : 'none';

        if (!qrUrl) {
            qrCode.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;"><div style="font-size:48px;">📱</div><div style="font-size:13px;margin-top:8px;">二维码加载失败</div></div>';
            qrCode.style.background = '#fff';
            _paymentOrder._currentPayment = payment;
            return;
        }

        // 先立即用最快的方式渲染（无论 qrcodejs 是否已就绪）；等 qrcodejs 就绪后再升级为本地版本
        var isMock = qrUrl.indexOf('MOCK_') >= 0;
        var hint = '';
        var data;
        if (isMock) {
            data = '【模拟支付】\n支付单号:' + payment.paymentNo + '\n订单号:' + payment.orderNo + '\n金额:¥' +
                parseFloat(payment.amount).toFixed(2) + '\n\n请点击下方"模拟扫码成功"按钮';
            hint = '模拟支付模式，请使用下方模拟扫码按钮';
        } else {
            data = qrUrl;
            hint = '请用沙箱/支付宝 APP 或微信 APP 扫一扫此二维码进行支付';
            if (qrUrl.indexOf('qr.alipay.com') >= 0 || qrUrl.indexOf('alipay.com') >= 0) {
                hint = '请用【沙箱版支付宝 APP】扫一扫支付（买家账号：fxpxvm6410@sandbox.com / 111111）';
            } else if (qrUrl.indexOf('weixin://') === 0 || qrUrl.indexOf('wechat.com') >= 0) {
                hint = '请用【微信】扫一扫此二维码支付';
            }
        }
        _renderQrCode(qrCode, data, hint);
        qrCode.style.background = '#fff';
        _paymentOrder._currentPayment = payment;

        // 如果 qrcodejs 未就绪，等加载完成后再重新渲染（解决用户第一次点"支付宝"仍走到 qrserver 的问题）
        var hadLocal = window.QRCode && typeof window.QRCode === 'function';
        if (!hadLocal && typeof _ensureQrCodeJs === 'function') {
            _ensureQrCodeJs().then(function (ok) {
                if (!ok) return;
                // 重新渲染时要确认 DOM 仍存在（用户可能已关闭弹窗或切到其它支付方式）
                var stillQr = document.getElementById('payQrCode');
                var stillArea = document.getElementById('payQrArea');
                var stillPayment = _paymentOrder && _paymentOrder._currentPayment;
                if (stillQr && stillArea && stillArea.style.display !== 'none' &&
                    stillPayment && (stillPayment.paymentNo === payment.paymentNo)) {
                    _renderQrCode(stillQr, data, hint);
                }
            });
        }
    }

    /** 启动支付倒计时 + 轮询支付状态
     *  倒计时优先使用后端返回的 expireAt（15分钟），无则降级为 180 秒
     *  轮询中处理 status=1(成功) / status=3(已关闭/过期)
     *
     *  优化点：
     *  1. 自适应轮询间隔：0-30s 用 3s（快速捕获支付成功）, 30-120s 用 5s, 120s+ 用 10s
     *     相比固定 3s 间隔，15分钟内请求数从 300 次降至约 80 次，减少 70%+
     *  2. 使用 setTimeout 递归而非 setInterval，确保上一次请求完成后再调度下一次
     *  3. 调用精简接口 /payment/status-summary，不返回 qrCodeUrl/transactionId
     */
    function startPaymentPoll(payment) {
        if (_paymentTimer) clearInterval(_paymentTimer);
        if (_paymentStatusTimer) clearTimeout(_paymentStatusTimer);
        var cdEl = document.getElementById('payCountdown');

        // 优先使用后端 expireAt 计算剩余秒数，避免前端后端超时不一致
        var countdown = 180;
        if (payment && payment.expireAt) {
            var expire = new Date(payment.expireAt.replace(' ', 'T')).getTime();
            var remain = Math.floor((expire - Date.now()) / 1000);
            if (remain > 0) countdown = remain;
        }

        // 轮询控制标志：true 时持续轮询，遇到 success/closed/401 等终止条件置为 false
        var pollActive = true;
        var pollStartTime = Date.now();

        /** 根据已耗时计算下一次轮询间隔（毫秒） */
        function getNextInterval() {
            var elapsedSec = (Date.now() - pollStartTime) / 1000;
            if (elapsedSec < 30) return 3000;   // 0-30s：3s 间隔（快速捕获支付成功）
            if (elapsedSec < 120) return 5000; // 30-120s：5s 间隔
            return 10000;                       // 120s+：10s 间隔
        }

        /** 单次轮询：递归 setTimeout 调度，由 pollActive 控制是否继续 */
        function pollOnce() {
            if (!pollActive || !_paymentOrder || !_paymentOrder.id) return;
            fetch(apiUrl('').replace('/cart', '/payment/status-summary?orderId=') + _paymentOrder.id, {
                headers: authHeaders()
            }).then(function (r) {
                if (r.status === 401) {
                    // token过期，停止轮询并提示重新登录
                    pollActive = false;
                    if (_paymentTimer) clearInterval(_paymentTimer);
                    showToastMsg('登录已过期，请重新登录后再查看支付状态', 'error');
                    setTimeout(function () {
                        location.href = rootPath('pages/user/login.html?redirect=' + encodeURIComponent(location.pathname.replace(/^\//, '') + location.search));
                    }, 1500);
                    return;
                }
                return r.json();
            })
            .then(function (res) {
                if (!res) return;
                if (res.code === 0 && res.data) {
                    var st = res.data.status;
                    if (st === 1) {
                        // 支付成功：停止轮询
                        pollActive = false;
                        handlePaymentSuccess(res.data);
                        return;
                    } else if (st === 3) {
                        // 支付已关闭或过期：停止轮询并提示
                        pollActive = false;
                        if (_paymentTimer) clearInterval(_paymentTimer);
                        var payEl = document.getElementById('payQrCode');
                        if (payEl) {
                            payEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;"><div style="font-size:40px;">⏰</div><div style="font-size:13px;margin-top:8px;">二维码已过期<br>请重新选择支付方式</div></div>';
                            payEl.style.background = '#f5f5f5';
                        }
                        return;
                    }
                }
                // 继续轮询：自适应间隔调度下一次
                if (pollActive) {
                    _paymentStatusTimer = setTimeout(pollOnce, getNextInterval());
                }
            }).catch(function () {
                // 网络异常也继续轮询，避免短暂网络问题导致漏检
                if (pollActive) {
                    _paymentStatusTimer = setTimeout(pollOnce, getNextInterval());
                }
            });
        }

        // 倒计时定时器：固定 1s 间隔，仅用于 UI 展示
        _paymentTimer = setInterval(function () {
            countdown--;
            if (cdEl) cdEl.textContent = '(' + Math.floor(countdown / 60) + ':' + String(countdown % 60).padStart(2, '0') + ' 后过期)';
            if (countdown <= 0) {
                clearInterval(_paymentTimer);
                pollActive = false;
                if (_paymentStatusTimer) clearTimeout(_paymentStatusTimer);
                var payEl = document.getElementById('payQrCode');
                if (payEl) {
                    payEl.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;color:#999;"><div style="font-size:40px;">⏰</div><div style="font-size:13px;margin-top:8px;">二维码已过期<br>请重新选择支付方式</div></div>';
                    payEl.style.background = '#f5f5f5';
                }
            }
        }, 1000);

        // 启动首次轮询（3s 后），15 分钟内自适应间隔：3s → 5s → 10s
        _paymentStatusTimer = setTimeout(pollOnce, 3000);

        // 页面卸载时清理定时器，防止内存泄漏
        if (!window._hrPayCleanupBound) {
            window._hrPayCleanupBound = true;
            window.addEventListener('beforeunload', function () {
                if (_paymentTimer) clearInterval(_paymentTimer);
                if (_paymentStatusTimer) clearTimeout(_paymentStatusTimer);
            });
        }
    }

    /** 处理支付成功（被轮询和mock-pay共同调用，通过_paymentHandled防止重复） */
    function handlePaymentSuccess(payment) {
        if (_paymentHandled) return;
        _paymentHandled = true;
        if (_paymentTimer) clearInterval(_paymentTimer);
        if (_paymentStatusTimer) clearTimeout(_paymentStatusTimer);
        var total = parseFloat(_paymentOrder.totalAmount) || 0;
        var totalText = total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});

        // 在弹窗内显示支付成功状态，替代 alert
        var modal = document.getElementById('hrPaymentModal');
        if (modal) {
            // 注入成功动画关键帧
            if (!document.getElementById('hrPaySuccessStyle')) {
                var sty = document.createElement('style');
                sty.id = 'hrPaySuccessStyle';
                sty.textContent = '@keyframes hrPayPop{0%{transform:scale(0);opacity:0}60%{transform:scale(1.15);opacity:1}100%{transform:scale(1)}}';
                document.head.appendChild(sty);
            }
            var inner = modal.querySelector('div:nth-child(1)');
            if (inner) {
                inner.innerHTML =
                    '<div style="padding:40px 24px;text-align:center;">' +
                    '<div style="width:72px;height:72px;margin:0 auto 20px;border-radius:50%;background:linear-gradient(135deg,#52c41a,#389e0d);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(82,196,26,.35);animation:hrPayPop .4s cubic-bezier(.22,1,.36,1);">' +
                    '<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                    '</div>' +
                    '<div style="font-size:20px;font-weight:700;color:#333;margin-bottom:8px;">支付成功</div>' +
                    '<div style="font-size:14px;color:#888;margin-bottom:4px;">订单号：' + _paymentOrder.orderNo + '</div>' +
                    '<div style="font-size:16px;font-weight:600;color:#ff4d4f;">¥' + totalText + '</div>' +
                    '<div style="font-size:13px;color:#999;margin-top:12px;">即将跳转到订单页…</div>' +
                    '</div>';
            }
        }
        showToastMsg('支付成功！订单号：' + _paymentOrder.orderNo, 'success');

        setTimeout(function () {
            var m = document.getElementById('hrPaymentModal');
            if (m) m.remove();
            location.href = rootPath('pages/user/order.html');
        }, 2000);
    }

    /** 模拟扫码支付成功（调用后端mock-pay接口，用于开发测试） */
    window.mockPaySuccess = function () {
        if (!_paymentOrder || !_paymentOrder._currentPayment) return;
        var btn = document.getElementById('payMockBtn');
        if (btn) { btn.disabled = true; btn.textContent = '处理中...'; }
        fetch(apiUrl('').replace('/cart', '/payment/mock-pay'), {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify({ paymentNo: _paymentOrder._currentPayment.paymentNo })
        }).then(function (resp) {
            if (resp.status === 401) throw new Error('登录已过期');
            if (!resp.ok) throw new Error('服务器错误');
            return resp.json();
        })
        .then(function (res) {
            if (res.code === 0) {
                handlePaymentSuccess(res.data);
            } else {
                showToastMsg(res.message || '支付失败', 'error');
            }
        }).catch(function (err) {
            // 与后端 mock-pay 登录鉴权对齐：未登录/token 过期返回 401，跳转登录页
            if (err.message.indexOf('登录已过期') >= 0) {
                showToastMsg('登录已过期，正在跳转登录页...', 'error');
                setTimeout(function () { location.href = rootPath('pages/user/login.html?redirect=' + encodeURIComponent(location.pathname.replace(/^\//, '') + location.search)); }, 1500);
            } else {
                showToastMsg('支付失败：' + err.message, 'error');
            }
        }).finally(function () {
            if (btn) { btn.disabled = false; btn.textContent = '模拟扫码成功'; }
        });
    };

    /** 取消支付：关闭支付记录 + 取消订单 + 移除弹窗 */
    window.cancelPayment = function () {
        if (_paymentTimer) clearInterval(_paymentTimer);
        if (_paymentStatusTimer) clearTimeout(_paymentStatusTimer);
        var orderId = _paymentOrder ? _paymentOrder.id : null;
        var paymentId = _paymentOrder && _paymentOrder._currentPayment ? _paymentOrder._currentPayment.id : null;
        var modal = document.getElementById('hrPaymentModal');

        // 1. 关闭支付记录
        if (paymentId) {
            fetch(apiUrl('').replace('/cart', '/payment/close'), {
                method: 'POST',
                headers: authHeaders(),
                body: JSON.stringify({ paymentId: paymentId })
            }).catch(function (e) {
                console.warn('关闭支付记录失败:', e);
            });
        }

        // 2. 同时取消订单（防止"取消支付了怎么还有订单"）
        if (orderId) {
            fetch(apiUrl('').replace('/cart', '/order/') + orderId + '/cancel', {
                method: 'PUT',
                headers: authHeaders()
            }).then(function (resp) {
                if (resp.status === 401) {
                    showToastMsg('登录已过期，订单取消可能未成功', 'error');
                    return null;
                }
                return resp.json();
            }).then(function (res) {
                if (res && res.code !== 0) {
                    // 订单取消失败（可能已支付），提示用户
                    showToastMsg(res.message || '订单取消失败，请前往订单页查看', 'warning');
                }
            }).catch(function (e) {
                console.warn('取消订单失败:', e);
            });
        }

        _paymentOrder = null;
        _paymentHandled = false;
        if (modal) modal.remove();
    };

    /** 跳转订单页（支付完成后或用户主动查看） */
    window.viewOrdersFromPayment = function () {
        if (_paymentTimer) clearInterval(_paymentTimer);
        if (_paymentStatusTimer) clearInterval(_paymentStatusTimer);
        document.getElementById('hrPaymentModal').remove();
        location.href = rootPath('pages/user/order.html');
    };

    /** 关闭支付弹窗（×按钮）：清理定时器并移除弹窗，不触发取消支付 */
    window.closePaymentModal = function () {
        if (_paymentTimer) clearInterval(_paymentTimer);
        if (_paymentStatusTimer) clearInterval(_paymentStatusTimer);
        var m = document.getElementById('hrPaymentModal');
        if (m) m.remove();
    };

    /* ---------- 跳转到订单页 ---------- */
    function viewOrders() {
        location.href = rootPath('pages/user/order.html');
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
        // 若当前在购物车页，立即重渲染以同步显示空状态
        if (document.getElementById('cartContainer')) {
            renderCartPage();
        }
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
    window.showConfirmDialog = showConfirmDialog;
    // 暴露支付弹窗入口，供订单页"去支付"按钮调用（order.html）
    window.showPaymentModal = showPaymentModal;

    /* ---------- 数据版本号（用于迁移旧数据） ---------- */
    var CART_DATA_VERSION = 'v2';

    /* ---------- 数据迁移：清理旧的错误购物车数据 ---------- */
    function migrateCartData() {
        var currentVersion = '';
        try { currentVersion = localStorage.getItem('hr_cart_version') || ''; } catch (e) { }

        if (currentVersion === CART_DATA_VERSION) return;

        var cart = getCart();
        var needsCleanup = false;

        for (var i = 0; i < cart.length; i++) {
            var item = cart[i];
            // 检查1：商品名为空或无效
            if (!item.name || item.name === '未命名商品') {
                needsCleanup = true;
                break;
            }
            // 检查2：图片URL包含可疑特征（如占位符、错误路径）
            if (item.image) {
                var imgUrl = item.image.toLowerCase();
                // 检查图片是否为占位符
                if (imgUrl.indexOf('placeholder') !== -1 || imgUrl.indexOf('dummy') !== -1) {
                    needsCleanup = true;
                    break;
                }
                // 检查图片是否为装饰性图片（header、logo、icon等）
                if (imgUrl.indexOf('header') !== -1 || imgUrl.indexOf('footer') !== -1 ||
                    imgUrl.indexOf('banner') !== -1 || imgUrl.indexOf('nav') !== -1) {
                    needsCleanup = true;
                    break;
                }
            }
            // 检查3：图片和名称可能不匹配的迹象
            if (item.name && item.image) {
                var nameLower = item.name.toLowerCase();
                var imgLower = item.image.toLowerCase();
                // 检查图片URL是否包含其他商品的关键字
                var productKeywords = ['cr30h', 'cr20a', 'craf', 'cra-ip68', 'nova2', 'mg400', 'm1pro', 'atom', 'rover', 'magician', 'es01'];
                for (var k = 0; k < productKeywords.length; k++) {
                    var kw = productKeywords[k];
                    // 如果图片URL包含某个商品关键字，但商品名不包含该关键字，可能是图片错位
                    if (imgLower.indexOf(kw) !== -1 && nameLower.indexOf(kw.substring(0, 3)) === -1 && nameLower.indexOf(kw.replace('-', ' ')) === -1) {
                        // 这种情况可能是图片与名称不匹配
                        // 但为了安全起见，只标记为需要验证
                        break;
                    }
                }
            }
        }

        if (needsCleanup) {
            // 清理购物车数据（因为无法确定正确的图片，需要用户重新添加商品）
            writeLocal([]);
            try { localStorage.removeItem(SYNCED_FLAG); } catch (e) { }
        }

        // 更新版本号
        try { localStorage.setItem('hr_cart_version', CART_DATA_VERSION); } catch (e) { }
    }

    /* ---------- 跨标签页登录态同步 ----------
     * 监听 storage 事件：当其他标签页登录/登出（token 变化）时，
     * 当前标签页同步角标与购物车列表，避免显示过期数据。 */
    var lastLoginState = isLoggedIn();
    window.addEventListener('storage', function (e) {
        if (e.key === 'token') {
            var nowLoggedIn = !!e.newValue;
            // 登录态从 有→无：退出登录，清空本地购物车
            if (lastLoginState && !nowLoggedIn) {
                try {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(SYNCED_FLAG);
                } catch (err) { }
                writeLocal([]);
                if (document.getElementById('cartContainer')) { renderCartPage(); }
            }
            // 登录态从 无→有：从后端拉取购物车
            else if (!lastLoginState && nowLoggedIn) {
                syncFromServer();
            }
            lastLoginState = nowLoggedIn;
        }
        // 本地购物车数据被其他标签页改动：同步角标与列表
        else if (e.key === STORAGE_KEY) {
            updateCartBadges();
            if (document.getElementById('cartContainer')) { renderCartPage(); }
        }
    });

    /* ---------- 初始化 ---------- */
    function init() {
        injectBadgeStyle();
        enhanceCartButtons();
        initMobileSidebar();

        // 执行数据迁移
        migrateCartData();

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
