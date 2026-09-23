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
        // ============ 生产环境（黑科技.商城 公网域名）============
        // 同域部署，Nginx 反代所有 API 到后端 8080，前后端同协议同域
        window.SERVER_BASE_URL = "";
        window.MINIO_BASE_URL = "";
        console.log('[config1.js] 检测到生产环境，同域反代模式');
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
