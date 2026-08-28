/* ============================================================
 * favorite.js  ——  收藏前端模块（后端 + localStorage 混合版）
 * ------------------------------------------------------------
 * 策略：
 *   - 已登录（localStorage 中存在 token）：后端为持久化真源，
 *     localStorage 作为本地镜像。每次页面加载从后端同步一次；
 *     每次写操作乐观更新本地并异步提交后端。
 *   - 未登录：纯 localStorage（key: hr_fav_items），提示登录。
 *
 * 自动行为：
 *   1) 注入 .fav-badge 角标样式
 *   2) 所有 .fav-btn 自动：href → ./pages/user/favorite.html，追加数量角标
 *   3) 暴露 window.HRFavorite 全局对象
 *
 * 对外 API（HRFavorite）：
 *   - HRFavorite.toggleFavorite()  切换收藏状态
 *   - HRFavorite.checkFavorite()   检查是否已收藏
 *   - HRFavorite.renderFavoritePage()  渲染收藏页
 * ============================================================ */
(function () {
    'use strict';

    var STORAGE_KEY = 'hr_fav_items';
    var SYNCED_FLAG = 'hr_fav_synced';

    /* ---------- 根路径辅助 ---------- */
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

    function computeFavPage() {
        try {
            var path = window.location.pathname;
            var parts = path.split('/');
            var pagesIdx = -1;
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === 'pages') { pagesIdx = i; break; }
            }
            if (pagesIdx === -1) return 'pages/user/favorite.html';
            if (parts[pagesIdx + 1] === 'user') return 'favorite.html';
            return '../user/favorite.html';
        } catch (e) { return 'pages/user/favorite.html'; }
    }

    var FAV_PAGE = computeFavPage();

    var API_BASE = (typeof SERVER_BASE_URL !== 'undefined') ? SERVER_BASE_URL : '';
    var SYNCING = false;

    /* ---------- 登录态 ---------- */
    function isLoggedIn() {
        try { return !!localStorage.getItem('token'); } catch (e) { return false; }
    }

    /* ---------- 基础读写（localStorage） ---------- */
    function getFav() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            var arr = raw ? JSON.parse(raw) : [];
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function writeLocal(fav) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fav));
        } catch (e) { }
        updateFavBadges();
    }

    /* ---------- 工具函数 ---------- */
    function escapeHtml(s) {
        if (!s) return '';
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function isValidImageUrl(url) {
        if (!url) return false;
        if (url.indexOf('data:') === 0) return false;
        if (url.indexOf('header') > -1 || url.indexOf('banner') > -1) return false;
        return true;
    }

    /* ============================================================
     * 后端 API 层
     * ============================================================ */
    function apiUrl(path) { return API_BASE + '/favorite' + path; }

    function authHeaders() {
        var h = { 'Content-Type': 'application/json' };
        var token = localStorage.getItem('token');
        if (token) { h['Authorization'] = token; }
        return h;
    }

    function handleAuthFailure(resp) {
        if (resp && resp.status === 401) {
            try {
                localStorage.removeItem('token');
                localStorage.removeItem(SYNCED_FLAG);
                localStorage.removeItem(STORAGE_KEY);
            } catch (e) { }
            updateFavBadges();
            return true;
        }
        return false;
    }

    /* 后端 FavoriteItem → 前端格式 */
    function fromServerItem(s) {
        return {
            key: s.productKey || (s.productId ? s.productId : ''),
            productId: s.productId || '',
            name: s.productName || '',
            spec: s.spec || '',
            price: s.price || 0,
            priceText: s.priceText || '',
            image: s.image || '',
            url: s.url || '',
            createdAt: s.createdAt || ''
        };
    }

    /* 前端格式 → 后端格式 */
    function toServerItem(it) {
        return {
            productKey: it.key,
            productId: it.productId || it.key,
            productName: it.name,
            spec: it.spec || '',
            price: it.price || 0,
            priceText: it.priceText || '',
            image: it.image || '',
            url: it.url || ''
        };
    }

    /* ---------- 后端同步 ---------- */
    function syncFromServer() {
        if (!isLoggedIn() || SYNCING) return;
        SYNCING = true;

        fetch(apiUrl(''), {
            method: 'GET',
            headers: authHeaders()
        })
        .then(function (resp) {
            if (handleAuthFailure(resp)) throw new Error('auth');
            return resp.json();
        })
        .then(function (data) {
            if (data && data.code === 200 && Array.isArray(data.data)) {
                var fav = data.data.map(fromServerItem);
                writeLocal(fav);
            }
            try { localStorage.setItem(SYNCED_FLAG, '1'); } catch (e) { }
        })
        .catch(function () { })
        .then(function () { SYNCING = false; });
    }

    /* ============================================================
     * 收藏操作
     * ============================================================ */

    /** 从当前页面采集产品信息 */
    function collectFromPage() {
        var name = '';
        var titleEl = document.querySelector('.product-title, .detail-title, h1.product-title, .hero-section h1');
        if (titleEl) name = titleEl.textContent.trim();

        var image = '';
        var mainImg = document.getElementById('mainImage');
        if (mainImg && mainImg.tagName === 'IMG') {
            image = mainImg.src;
        }
        if (!image) {
            var preciseSelectors = [
                '.product-show .product-gallery .main-image img',
                '.product-gallery .main-image img',
                '.product-show .main-image img',
                '.product-detail-main img',
                '.hero-section img'
            ];
            for (var i = 0; i < preciseSelectors.length; i++) {
                var imgEl = document.querySelector(preciseSelectors[i]);
                if (imgEl && imgEl.tagName === 'IMG' && isValidImageUrl(imgEl.src)) {
                    image = imgEl.src;
                    break;
                }
            }
        }
        // 英文详情页主图常作为 hero-section 背景
        if (!image) {
            var heroSection = document.querySelector('.hero-section');
            if (heroSection) {
                var computedStyle = window.getComputedStyle(heroSection, '::before');
                var bgImage = computedStyle.getPropertyValue('background-image');
                if (bgImage && bgImage !== 'none') {
                    var urlMatch = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
                    if (urlMatch && urlMatch[1] && isValidImageUrl(urlMatch[1])) {
                        image = urlMatch[1];
                    }
                }
            }
        }

        var price = 0;
        var priceText = '';
        var priceEl = document.querySelector('.product-price .price, .price-info .price, .detail-price');
        if (priceEl) {
            var text = priceEl.textContent.trim();
            var match = text.match(/[\d,]+\.?\d*/);
            if (match) {
                price = parseFloat(match[0].replace(/,/g, ''));
                priceText = text;
            } else {
                priceText = text;
            }
        }
        if (!priceText) priceText = price ? ('¥' + price) : '¥询价';

        var spec = '';
        var specEl = document.querySelector('.product-spec .spec-value, .spec-selected');
        if (specEl) spec = specEl.textContent.trim();

        var url = location.pathname.replace(/^\//, '') + location.search;

        var productId = url.split('/').pop().replace('.html', '');
        var key = productId + (spec ? ('@' + spec) : '');

        return {
            key: key,
            productId: productId,
            name: name,
            spec: spec,
            price: price,
            priceText: priceText,
            image: image,
            url: url
        };
    }

    /** 检查是否已收藏 */
    function checkFavorite(key) {
        var fav = getFav();
        for (var i = 0; i < fav.length; i++) {
            if (String(fav[i].key) === String(key)) return true;
        }
        return false;
    }

    /** 切换收藏状态（添加/取消） */
    function toggleFavorite(item) {
        if (!item || !item.key) {
            item = collectFromPage();
        }

        var fav = getFav();
        var existingIndex = -1;
        for (var i = 0; i < fav.length; i++) {
            if (String(fav[i].key) === String(item.key)) {
                existingIndex = i;
                break;
            }
        }

        var isAdding = false;
        if (existingIndex >= 0) {
            //已收藏 → 取消收藏
            fav.splice(existingIndex, 1);
            writeLocal(fav);
            //后端删除
            if (isLoggedIn() && !SYNCING) {
                fetch(apiUrl('?productKey=' + encodeURIComponent(item.key)), {
                    method: 'DELETE',
                    headers: authHeaders()
                }).then(handleAuthFailure).catch(function () { });
            }
            isAdding = false;
        } else {
            //未收藏 → 添加收藏
            fav.push(item);
            writeLocal(fav);
            //后端添加
            if (isLoggedIn() && !SYNCING) {
                fetch(apiUrl(''), {
                    method: 'POST',
                    headers: authHeaders(),
                    body: JSON.stringify(toServerItem(item))
                }).then(handleAuthFailure).catch(function () { });
            }
            isAdding = true;
        }

        updateFavoriteButton(item.key, isAdding);
        return isAdding;
    }

    /** 更新页面上收藏按钮的状态 */
    function updateFavoriteButton(key, isFavorited) {
        var btns = document.querySelectorAll('.btn-favorite, [onclick*="handleFavorite"]');
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            if (isFavorited) {
                btn.classList.add('favorited');
                var iconEl = btn.querySelector('.fav-icon');
                if (iconEl) {
                    iconEl.textContent = '★';
                } else {
                    if (btn.innerHTML.indexOf('收藏') > -1) {
                        btn.innerHTML = btn.innerHTML.replace('收藏', '已收藏');
                    }
                }
            } else {
                btn.classList.remove('favorited');
                var icon = btn.querySelector('.fav-icon');
                if (icon) {
                    icon.textContent = '☆';
                } else {
                    if (btn.innerHTML.indexOf('已收藏') > -1) {
                        btn.innerHTML = btn.innerHTML.replace('已收藏', '收藏');
                    }
                }
            }
        }
    }

    /** 页面加载时同步收藏按钮状态 */
    function syncFavoriteButton() {
        var item = collectFromPage();
        var isFav = checkFavorite(item.key);
        updateFavoriteButton(item.key, isFav);
    }

    /** 删除收藏 */
    function removeFavorite(key) {
        var fav = getFav();
        for (var i = 0; i < fav.length; i++) {
            if (String(fav[i].key) === String(key)) {
                fav.splice(i, 1);
                break;
            }
        }
        writeLocal(fav);

        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl('?productKey=' + encodeURIComponent(key)), {
                method: 'DELETE',
                headers: authHeaders()
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    /** 清空收藏 */
    function clearFavorites() {
        writeLocal([]);

        if (isLoggedIn() && !SYNCING) {
            fetch(apiUrl('/all'), {
                method: 'DELETE',
                headers: authHeaders()
            }).then(handleAuthFailure).catch(function () { });
        }
    }

    /** 获取收藏总数 */
    function getFavCount() {
        return getFav().length;
    }

    /* ============================================================
     * 角标
     * ============================================================ */
    function updateFavBadges() {
        var count = getFavCount();
        var badges = document.querySelectorAll('.fav-badge');
        for (var i = 0; i < badges.length; i++) {
            badges[i].textContent = count > 99 ? '99+' : String(count);
            badges[i].style.display = count > 0 ? '' : 'none';
        }
    }

    function injectBadgeStyle() {
        if (document.getElementById('fav-badge-style')) return;
        var style = document.createElement('style');
        style.id = 'fav-badge-style';
        style.textContent =
            '.fav-badge{position:absolute;top:-8px;right:-8px;min-width:18px;height:18px;' +
            'border-radius:9px;background:#f5a623;color:#fff;font-size:11px;font-weight:700;' +
            'display:none;align-items:center;justify-content:center;padding:0 5px;line-height:1;' +
            'z-index:10;box-shadow:0 2px 6px rgba(245,166,35,0.4);}' +
            '.fav-btn{position:relative;text-decoration:none;color:inherit;}';
        document.head.appendChild(style);
    }

    function setupFavButtons() {
        var btns = document.querySelectorAll('.fav-btn');
        for (var i = 0; i < btns.length; i++) {
            var btn = btns[i];
            if (btn.dataset.favInit === '1') continue;
            btn.dataset.favInit = '1';
            btn.href = FAV_PAGE;
            //添加角标
            var badge = document.createElement('span');
            badge.className = 'fav-badge';
            badge.textContent = '0';
            btn.appendChild(badge);
        }
        updateFavBadges();
    }

    /* ============================================================
     * 收藏列表页渲染
     * ============================================================ */
    function getItemAvatar(it) {
        var fallback = '<span class=\'avatar-fallback\'>' + escapeHtml((it.name || '?').charAt(0)) + '</span>';
        if (it.image && isValidImageUrl(it.image)) {
            return '<img src="' + escapeHtml(it.image) + '" alt="' + escapeHtml(it.name) + '" onerror="this.parentNode.innerHTML=\'' + fallback.replace(/'/g, '\\\'') + '\'">';
        }
        return fallback;
    }

    function renderFavoritePage() {
        var wrap = document.getElementById('favoriteContainer');
        if (!wrap) return;

        var fav = getFav();
        var totalEl = document.getElementById('favCount');
        var clearBtn = document.getElementById('clearFavBtn');
        var favBar = document.getElementById('favBar');

        //空状态
        if (!fav.length) {
            wrap.innerHTML =
                '<div class="fav-empty">' +
                '<div class="empty-icon">⭐</div>' +
                '<p class="empty-text">还没有收藏任何商品，快去发现心仪的产品吧～</p>' +
                '<a class="btn-go-shop" href="' + ROOT + 'neep.html">去逛逛</a>' +
                '</div>';
            if (totalEl) totalEl.textContent = '0';
            if (clearBtn) clearBtn.style.display = 'none';
            if (favBar) favBar.style.display = 'none';
            return;
        }

        //卡片列表
        var cards = fav.map(function (it, index) {
            var hasPrice = !!it.price && parseFloat(it.price) > 0;
            var priceDisplay = hasPrice ? ('¥' + parseFloat(it.price).toLocaleString()) : '¥询价';
            var avatar = getItemAvatar(it);

            var productLink = '';
            if (it.url) {
                productLink = '<a class="link" href="./' + escapeHtml(it.url) + '">查看商品 <span class="arrow">→</span></a>';
            }

            var specTag = '';
            if (it.spec) {
                specTag = '<div class="spec">规格：' + escapeHtml(it.spec) + '</div>';
            }

            return '' +
                '<div class="fav-card" data-key="' + escapeHtml(it.key) + '" style="animation-delay: ' + (index * 0.05) + 's">' +
                '<div class="card-img">' + avatar + '</div>' +
                '<div class="card-info">' +
                '<div class="name" title="' + escapeHtml(it.name) + '">' + escapeHtml(it.name) + '</div>' +
                specTag +
                '<div class="price">' + escapeHtml(priceDisplay) + '</div>' +
                productLink +
                '</div>' +
                '<div class="card-actions">' +
                '<button class="btn-remove" onclick="HRFavorite.removeFavItem(\'' + escapeHtml(it.key) + '\')">' +
                '<span class="icon">✕</span>' +
                '<span class="text">取消收藏</span>' +
                '</button>' +
                '</div>' +
                '</div>';
        }).join('');

        wrap.innerHTML = '<div class="fav-grid">' + cards + '</div>';

        if (totalEl) totalEl.textContent = String(fav.length);
        if (clearBtn) clearBtn.style.display = '';
        if (favBar) favBar.style.display = '';
    }

    /** 删除收藏项（带确认） */
    function removeFavItem(key) {
        var fav = getFav();
        var itemName = '';
        for (var i = 0; i < fav.length; i++) {
            if (fav[i].key === String(key)) {
                itemName = fav[i].name || '该商品';
                break;
            }
        }

        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog(
                '确认取消收藏',
                '确定要取消收藏"' + itemName + '"吗？',
                function () {
                    var card = document.querySelector('.fav-card[data-key="' + key + '"]');
                    if (card) {
                        card.style.transition = 'all 0.3s ease';
                        card.style.opacity = '0';
                        card.style.transform = 'scale(0.9)';
                    }
                    setTimeout(function () {
                        removeFavorite(key);
                        renderFavoritePage();
                        if (typeof showToast === 'function') {
                            showToast('已取消收藏', 'success');
                        }
                    }, 250);
                }
            );
        } else if (confirm('确定要取消收藏"' + itemName + '"吗？')) {
            removeFavorite(key);
            renderFavoritePage();
        }
    }

    function clearFavAndRefresh() {
        if (typeof showConfirmDialog === 'function') {
            showConfirmDialog(
                '确认清空',
                '确定要清空所有收藏吗？此操作不可撤销。',
                function () {
                    clearFavorites();
                    renderFavoritePage();
                    if (typeof showToast === 'function') {
                        showToast('已清空收藏', 'success');
                    }
                }
            );
        } else if (confirm('确定要清空所有收藏吗？')) {
            clearFavorites();
            renderFavoritePage();
        }
    }

    /* ============================================================
     * 初始化
     * ============================================================ */
    function init() {
        injectBadgeStyle();
        setupFavButtons();

        //已登录则从后端同步
        if (isLoggedIn()) {
            try {
                var synced = localStorage.getItem(SYNCED_FLAG);
                if (!synced) {
                    syncFromServer();
                }
            } catch (e) { }
        }

        //如果在收藏页，渲染列表
        if (document.getElementById('favoriteContainer')) {
            renderFavoritePage();
        }

        //如果有收藏按钮，同步状态
        if (document.querySelector('.btn-favorite, [onclick*="handleFavorite"]')) {
            syncFavoriteButton();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    //监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', function (e) {
        if (e.key === STORAGE_KEY || e.key === 'token') {
            updateFavBadges();
            if (document.getElementById('favoriteContainer')) {
                renderFavoritePage();
            }
            if (document.querySelector('.btn-favorite, [onclick*="handleFavorite"]')) {
                syncFavoriteButton();
            }
        }
    });

    /* ---------- 暴露全局 API ---------- */
    window.HRFavorite = {
        toggleFavorite: toggleFavorite,
        checkFavorite: checkFavorite,
        collectFromPage: collectFromPage,
        removeFavItem: removeFavItem,
        clearFavAndRefresh: clearFavAndRefresh,
        renderFavoritePage: renderFavoritePage,
        getFavCount: getFavCount,
        syncFromServer: syncFromServer
    };

})();
