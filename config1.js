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
