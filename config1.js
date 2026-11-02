// ======================================================
// 服务器配置文件 - 自动检测开发/生产环境
// ======================================================
// 开发环境（localhost / 内网IP）：直连本地后端 https://localhost:8443
// 生产环境（公网域名）：同域部署，SERVER_BASE_URL 留空串，由 Nginx 反代后端
// 不再需要手动切换注释！
// ======================================================

(function () {
    var host = window.location.hostname;
    var isDev = /^(localhost|127\.0\.0\.1)$/.test(host)
        || /^192\.168\./.test(host)
        || /^10\./.test(host)
        || /^172\.(1[6-9]|2\d|3[01])\./.test(host);

    if (isDev) {
        // ============ 本地开发环境 ============
        // 后端启用 https profile，端口 8443，自签名证书
        // 前端用 http-server -S 或 Live Server HTTPS 模式
        window.SERVER_BASE_URL = "https://localhost:8443";
        // MinIO 本地未配 SSL，用 HTTP；若 HTTPS 页面混合内容警告，改用 /minio/fileDownload 后端代理
        window.MINIO_BASE_URL = "http://192.168.199.71:9001";
        console.log('[config1.js] 检测到本地开发环境，后端: ' + window.SERVER_BASE_URL);
    } else {
        // ============ 生产环境（同域反代模式）============
        // 前后端同域同协议，SERVER_BASE_URL/MINIO_BASE_URL 留空串，由 Nginx 反代
        window.SERVER_BASE_URL = "";
        window.MINIO_BASE_URL = "";
    }
})();

function getImageUrl(url) {
    if (!url) return '';

    // === 清洗内网开发 URL（数据库里可能存了开发时的完整地址）===
    // http://192.168.199.71:8000/img/xxx  →  /img/xxx  （Nginx 反代到 MinIO）
    // http://127.0.0.1:9001/big-event/xxx  →  /big-event/xxx  （Nginx 反代到 MinIO）
    // http://localhost:9000/big-event/xxx  →  /big-event/xxx
    if (url.startsWith('http://') || url.startsWith('https://')) {
        // 内网 IP + 8000/8080 端口 → 提取路径部分
        var devServerPattern = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?/i;
        var cleaned = url.replace(devServerPattern, '');
        if (cleaned !== url) {
            // 是内网 URL，替换成同域路径
            url = cleaned;
        }
    }

    if (url.startsWith('data:')) {
        return url;
    }

    // 已经是绝对路径 /xxx 或清洗后的路径 → 返回
    if (url.startsWith('/')) {
        return url;
    }

    // 相对路径且包含 / → 拼接 MINIO_BASE_URL（仅开发环境生效）
    if (url.includes('/') && !url.startsWith('./')) {
        return MINIO_BASE_URL ? (MINIO_BASE_URL + '/' + url) : url;
    }

    return url;
}

// ======================================================
// Token 过期检测：解析 JWT exp 字段，过期则清除登录态
// ======================================================
function checkTokenExpired() {
    try {
        var token = localStorage.getItem('token');
        if (!token) return true;

        var parts = token.split('.');
        if (parts.length !== 3) return true;

        var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        var exp = (payload.claims && payload.claims.exp) || payload.exp;
        if (!exp) return false;

        if (Date.now() >= exp * 1000) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('roleId');
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

// ======================================================
// 登录跳转：自动为所有 login.html 链接追加 redirect 参数
// ======================================================
(function () {
    function currentPage() {
        var p = window.location.pathname;
        var page = p.replace(/^\//, '');
        if (!page) page = 'index.html';
        var search = window.location.search || '';
        return page + search;
    }

    function patchLoginLinks() {
        var links = document.querySelectorAll('a[href*="login.html"]');
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var href = a.getAttribute('href') || '';
            if (href.indexOf('login.html') === -1) continue;
            if (href.indexOf('tab=register') > -1) continue;
            if (href.indexOf('redirect=') > -1) continue;
            var sep = href.indexOf('?') > -1 ? '&' : '?';
            a.setAttribute('href', href + sep + 'redirect=' + encodeURIComponent(currentPage()));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', patchLoginLinks);
    } else {
        patchLoginLinks();
    }
})();

// ======================================================
// 用户下拉菜单增强：自动注入"我的需求/个人主页/需求审核(admin)"入口
// 适用所有含 #userDropdown 的页面（无需每个页面单独改）
// ======================================================
(function () {
    // 根据当前页面深度计算到站点根的相对前缀
    // root:        ''          (index.html / shangcheng.html)
    // pages/x/:    '../'       (pages/user/cart.html)
    // pages/x/y/:  '../../'    (深度2，少见)
    // 采用与 cart.js getRootPrefix() 相同的 'pages' 目录锚点法，
    // 兼容部署在根目录或 /my-web/ 等子目录的情况
    function rootPrefix() {
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

    // 从 localStorage.token 解析 JWT 中的 roleId
    function getRoleIdFromToken() {
        try {
            var token = localStorage.getItem('token');
            if (!token) return null;
            var parts = token.split('.');
            if (parts.length !== 3) return null;
            var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            var claims = payload.claims || payload;
            var rid = claims.roleId;
            return rid ? Number(rid) : null;
        } catch (e) { return null; }
    }

    // 创建单个 dropdown-item DOM
    function makeItem(href, iconSvg, label, badgeId) {
        var a = document.createElement('a');
        a.className = 'dropdown-item';
        a.href = href;
        a.innerHTML = iconSvg + '<span>' + label + '</span>' +
            (badgeId ? '<span class="dropdown-badge" id="' + badgeId + '" style="display:none;">0</span>' : '');
        return a;
    }

    // 图标 SVG（与现有 dropdown 风格一致）
    var ICON_REQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/></svg>';
    var ICON_PROFILE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
    var ICON_AUDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>';

    function injectDropdownLinks() {
        var dropdowns = document.querySelectorAll('#userDropdown');
        if (!dropdowns.length) return;

        var prefix = rootPrefix();
        var roleId = getRoleIdFromToken();

        // 为每个 dropdown 注入新链接（避免重复注入：检查 data-enhanced 标记）
        for (var i = 0; i < dropdowns.length; i++) {
            var dropdown = dropdowns[i];
            if (dropdown.getAttribute('data-enhanced') === '1') continue;
            dropdown.setAttribute('data-enhanced', '1');

            // 找到退出登录之前的 divider，作为插入锚点
            var logoutLink = dropdown.querySelector('.dropdown-logout');
            if (!logoutLink) continue;
            var anchor = logoutLink.previousElementSibling;
            // 确保 anchor 是 .dropdown-divider；不是则在 logoutLink 之前新建一个
            if (!anchor || !anchor.classList || !anchor.classList.contains('dropdown-divider')) {
                anchor = document.createElement('div');
                anchor.className = 'dropdown-divider';
                dropdown.insertBefore(anchor, logoutLink);
            }

            // 创建文档片段批量插入
            var frag = document.createDocumentFragment();

            // 我的需求
            frag.appendChild(makeItem(
                prefix + 'pages/user/my-requirements.html',
                ICON_REQ, '我的需求'
            ));

            // 个人主页
            frag.appendChild(makeItem(
                prefix + 'pages/user/profile.html',
                ICON_PROFILE, '个人主页'
            ));

            // 需求审核（仅管理员可见）
            var auditItem = makeItem(
                prefix + 'pages/admin/audit-requirements.html',
                ICON_AUDIT, '需求审核'
            );
            auditItem.id = 'dropdownAuditLink';
            if (roleId !== 1) {
                auditItem.style.display = 'none';
            }
            frag.appendChild(auditItem);

            // 在 anchor(divider) 之前插入新项
            dropdown.insertBefore(frag, anchor);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectDropdownLinks);
    } else {
        injectDropdownLinks();
    }
})();
