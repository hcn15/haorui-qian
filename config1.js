// ======================================================
// 服务器配置文件
// 所有前端页面通过此变量访问后端API
// 切换环境时修改此配置即可
// ======================================================

//// 线上环境
//const SERVER_BASE_URL = "http://1.94.18.1:8080";

//// 本地开发环境（取消注释启用）
const SERVER_BASE_URL = "http://192.168.199.71:8080";

//// MinIO图片服务器配置
//// 本地开发环境
const MINIO_BASE_URL = "http://192.168.199.71:9001";
//// 线上环境
// const MINIO_BASE_URL = "http://1.94.18.1:9001";

// 服务器开发环境（与前端同一IP，避免浏览器PNA安全限制）
// const SERVER_BASE_URL = "http://1.94.18.1:8080";

// 空字符串表示同域部署
// const SERVER_BASE_URL = "";

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
// 登录跳转：自动为所有 login.html 链接追加 redirect 参数
// 登录成功后返回登录前的页面，而非统一跳 neep.html
// ======================================================
(function () {
    function currentPage() {
        var p = window.location.pathname;
        var page = p.replace(/^\//, '');
        if (!page) page = 'neep.html';
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
