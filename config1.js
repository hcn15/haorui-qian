// ======================================================
// 服务器配置文件
// 所有前端页面通过此变量访问后端API
// 切换环境时取消对应行注释即可
// ======================================================
// 生产环境推荐"同域部署"：SERVER_BASE_URL 留空串，由 Nginx 反代后端
// 前后端同协议同域，无 CORS 与混合内容(Mixed Content)问题
// ======================================================

// 生产环境（同域部署，自动继承当前协议 HTTPS）
// const SERVER_BASE_URL = "";

// 本地开发环境（前后端分离，后端启用 HTTPS profile 端口 8443）
// 取消下行注释启用；前端建议用 Live Server 的 HTTPS 模式
// const SERVER_BASE_URL = "https://localhost:8443";

// 旧本地 IP 地址（HTTP，HTTPS 页面会触发混合内容，仅兼容旧环境）
const SERVER_BASE_URL = "http://192.168.199.71:8080";

// 旧线上 IP 地址（HTTP，勿用于 HTTPS 生产环境）
// const SERVER_BASE_URL = "http://1.94.18.1:8080";

// ======================================================
// MinIO 图片服务器配置（前端展示图片用）
// 生产环境：由 Nginx 反代到同域路径，MINIO_BASE_URL 留空串（同域 HTTPS）
// 本地开发：MinIO 默认未启用 SSL；若页面是 HTTPS，图片会混合内容警告
//           本地可临时改用后端代理 /minio/fileDownload，或给 MinIO 配 SSL
// ======================================================
// const MINIO_BASE_URL = "";

// 本地开发（MinIO 未配 SSL，仅 HTTP 可用）
const MINIO_BASE_URL = "http://192.168.199.71:9001";

// 旧线上 IP 地址（HTTP，勿用于 HTTPS 生产环境）
// const MINIO_BASE_URL = "http://1.94.18.1:9001";

function getImageUrl(url) {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
    }
    if (url.includes('/') && !url.startsWith('/') && !url.startsWith('./')) {
        return MINIO_BASE_URL + '/' + url;
    }
    return url;
}

// ======================================================
// Token 过期检测：解析 JWT exp 字段，过期则清除登录态
// 所有页面通过 checkTokenExpired() 主动检测，而非仅靠 401 被动触发
// ======================================================
function checkTokenExpired() {
    try {
        var token = localStorage.getItem('token');
        if (!token) return true; // 无 token 视为已过期

        var parts = token.split('.');
        if (parts.length !== 3) return true; // 格式不合法

        var payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
        // JWT exp 在 claims 嵌套或顶层
        var exp = (payload.claims && payload.claims.exp) || payload.exp;
        if (!exp) return false; // 无法解析过期时间，不主动清除

        // exp 是秒级时间戳，与当前时间比较
        if (Date.now() >= exp * 1000) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('roleId');
            return true; // 已过期并清除
        }
        return false; // 未过期
    } catch (e) {
        return false; // 解析异常不清除，交给后端 401 兜底
    }
}

// ======================================================
// 登录跳转：自动为所有 login.html 链接追加 redirect 参数
// 登录成功后返回登录前的页面，而非统一跳 index.html
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
            // 只处理跳转到 login.html 的链接，不处理 login.html 自身的内部链接
            if (href.indexOf('login.html') === -1) continue;
            // 跳过带 tab=register 的注册链接（注册后通常回首页）
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
