/**
 * 通用导航组件类
 * 负责搜索框交互、移动端菜单交互、产品导航动态渲染
 */
class CommonNav {
    /**
     * HTML 转义：防止 API 返回的名称/URL 等字段包含 < > & " ' 等特殊字符引发 DOM 注入。
     * <p>
     * 仅转义渲染到 innerHTML / 属性值里会被解析的字符，不处理 URL 编码。
     *
     * @param {string} s 待转义的原始字符串
     * @returns {string} 转义后的安全字符串
     */
    static escapeHtml(s) {
        if (s === null || s === undefined) return '';
        return String(s).replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {boolean} options.loadNav - 是否加载产品导航
     * @param {Function} options.toggleMobileMenu - 自定义移动端菜单切换函数
     */
    constructor(options = {}) {
        this.searchBtn = null;
        this.searchBox = null;
        this.mobileMenuBtn = null;
        this.mobileNavPanel = null;
        this.navProductSub = null;
        this.init(options);
    }

    /**
     * 初始化导航组件
     * @param {Object} options - 配置选项
     */
    init(options) {
        this.searchBtn = document.getElementById('searchBtn');
        this.searchBox = document.getElementById('searchBox');
        this.mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        this.mobileNavPanel = document.getElementById('mobileNavPanel');
        this.navProductSub = document.getElementById('navProductSub');
        this.mobileNavProductSub = document.getElementById('mobileNavProductSub');
        
        this.bindSearchEvents();
        this.bindMobileMenuEvents(options.toggleMobileMenu);
        
        if (options.loadNav) {
            this.loadProductNav();
        }
    }

    /** 绑定搜索框显示/隐藏事件 */
    bindSearchEvents() {
        if (!this.searchBtn || !this.searchBox) return;

        this.searchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.searchBox.classList.toggle('active');
            if (this.searchBox.classList.contains('active')) {
                this.searchBox.querySelector('input').focus();
            }
        });

        document.addEventListener('click', () => {
            this.searchBox.classList.remove('active');
        });

        this.searchBox.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    /**
     * 绑定移动端菜单事件
     * @param {Function} customToggle - 自定义切换函数（可选）
     */
    bindMobileMenuEvents(customToggle) {
        if (!this.mobileMenuBtn || !this.mobileNavPanel) return;

        if (customToggle && typeof customToggle === 'function') {
            this.mobileMenuBtn.onclick = customToggle;
            return;
        }

        this.mobileMenuBtn.addEventListener('click', () => {
            this.mobileMenuBtn.classList.toggle('active');
            this.mobileNavPanel.classList.toggle('active');
        });

        document.addEventListener('click', () => {
            this.mobileMenuBtn.classList.remove('active');
            this.mobileNavPanel.classList.remove('active');
        });
    }

    /** 异步加载产品导航数据并渲染 */
    async loadProductNav() {
        if (!this.navProductSub && !this.mobileNavProductSub) return;
        
        const isEnglish = document.documentElement.lang === 'en';
        
        try {
            const res = await fetch(`${SERVER_BASE_URL}/website/product`);
            const resData = await res.json();
            
            if (resData.code === 0 && Array.isArray(resData.data)) {
                let navHtml = '';
                let mobileHtml = '';
                resData.data.forEach(item => {
                    let jumpUrl;
                    if (isEnglish) {
                        jumpUrl = item.id === 4 ? './chanpin1-ai-en.html' : `./chanpin1-en.html?id=${item.id}`;
                    } else {
                        jumpUrl = item.id === 1 ? './chanpin1-cp1.html' : item.id === 4 ? './chanpin1-ai.html' : `./chanpin1.html?id=${item.id}`;
                    }
                    navHtml += `
                        <div class="new-nav-sub-item">
                            <a href="${jumpUrl}" class="new-nav-sub-link">${CommonNav.escapeHtml(item.name)}</a>
                        </div>
                    `;
                    mobileHtml += `
                        <div class="mobile-nav-sub-item"><a href="${jumpUrl}" class="mobile-nav-sub-link">${CommonNav.escapeHtml(item.name)}</a></div>
                    `;
                });
                if (this.navProductSub) {
                    this.navProductSub.innerHTML = navHtml;
                }
                if (this.mobileNavProductSub) {
                    this.mobileNavProductSub.innerHTML = mobileHtml;
                }
            }
        } catch (err) {
            // 产品导航加载失败静默，UI 已有空状态兜底
        }
    }
}

/**
 * API服务类（静态类）
 * 提供统一的HTTP请求封装，包含URL验证、数据验证、响应处理和错误处理
 */
class ApiService {
    /**
     * 发送GET请求
     * @param {string} url - 请求路径（相对于SERVER_BASE_URL）
     * @returns {Object} 响应数据对象
     */
    static async get(url) {
        try {
            this.validateUrl(url);
            
            const response = await fetch(`${SERVER_BASE_URL}${url}`, {
                method: 'GET',
                headers: this.getRequestHeaders(),
                credentials: 'same-origin',
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await this.parseResponse(response);
            return this.sanitizeResponse(data);
        } catch (error) {
            // API 请求失败静默，调用方已处理错误态
            return { code: -1, data: null, message: this.getErrorMessage(error) };
        }
    }

    /**
     * 发送POST请求
     * @param {string} url - 请求路径（相对于SERVER_BASE_URL）
     * @param {Object} data - 请求体数据
     * @returns {Object} 响应数据对象
     */
    static async post(url, data) {
        try {
            this.validateUrl(url);
            this.validateData(data);
            
            const response = await fetch(`${SERVER_BASE_URL}${url}`, {
                method: 'POST',
                headers: this.getRequestHeaders(),
                body: JSON.stringify(data),
                credentials: 'same-origin',
                timeout: 10000
            });
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const result = await this.parseResponse(response);
            return this.sanitizeResponse(result);
        } catch (error) {
            // API 请求失败静默，调用方已处理错误态
            return { code: -1, data: null, message: this.getErrorMessage(error) };
        }
    }

    /**
     * 验证URL有效性，防止XSS和安全漏洞
     * @param {string} url - 待验证的URL
     */
    static validateUrl(url) {
        if (!url || typeof url !== 'string') {
            throw new Error('无效的URL');
        }
        
        const forbiddenChars = ['<', '>', '"', "'", ';', 'javascript:', 'data:'];
        for (const char of forbiddenChars) {
            if (url.includes(char)) {
                throw new Error('URL包含非法字符');
            }
        }
    }

    /**
     * 验证数据是否包含循环引用
     * @param {*} data - 待验证的数据
     */
    static validateData(data) {
        if (data === null || data === undefined) return;
        
        const hasCircularReference = (obj, seen = new WeakSet()) => {
            if (typeof obj !== 'object' || obj === null) return false;
            if (seen.has(obj)) return true;
            seen.add(obj);
            for (const key in obj) {
                if (hasCircularReference(obj[key], seen)) return true;
            }
            return false;
        };
        
        if (hasCircularReference(data)) {
            throw new Error('数据包含循环引用');
        }
    }

    /** 获取请求头配置 */
    static getRequestHeaders() {
        return {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
    }

    /**
     * 解析响应数据为JSON
     * @param {Response} response - fetch响应对象
     * @returns {Object} 解析后的JSON数据
     */
    static async parseResponse(response) {
        try {
            return await response.json();
        } catch {
            return { code: -1, message: '响应格式错误' };
        }
    }

    /**
     * 清理响应数据，防止XSS攻击
     * @param {*} data - 响应数据
     * @returns {Object} 清理后的响应数据
     */
    static sanitizeResponse(data) {
        if (typeof data !== 'object' || data === null) {
            return { code: -1, data: null, message: '响应数据无效' };
        }
        
        if (data.data && typeof data.data === 'string') {
            data.data = Utils.escapeHtml(data.data);
        }
        
        return data;
    }

    /**
     * 根据错误类型返回友好的错误提示信息
     * @param {Error} error - 错误对象
     * @returns {string} 错误提示信息
     */
    static getErrorMessage(error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return '网络连接失败，请检查网络';
        }
        if (error.message.includes('timeout')) {
            return '请求超时，请重试';
        }
        if (error.message.includes('404')) {
            return '资源未找到';
        }
        if (error.message.includes('500')) {
            return '服务器内部错误';
        }
        return '请求失败，请稍后重试';
    }

    /**
     * 根据ID获取产品详情
     * @param {number} id - 产品ID
     * @returns {Object} 产品详情数据
     */
    static async getProductById(id) {
        return await this.get(`/website/product/${id}`);
    }

    /** 获取产品列表 */
    static async getProductList() {
        return await this.get('/website/product');
    }

    /**
     * 获取产品下的子项列表
     * @param {number} productId - 产品ID
     * @returns {Object} 子项列表数据
     */
    static async getProductItems(productId) {
        return await this.get(`/website/productItem?id=${productId}`);
    }

    /**
     * 获取新闻列表
     * @param {boolean} latest - 是否获取最新新闻
     * @returns {Object} 新闻列表数据
     */
    static async getNewsList(latest = true) {
        return await this.get(`/website/news?latest=${latest}`);
    }
}

/**
 * 图片加载器类（静态类）
 * 提供图片加载的回调方式和Promise方式
 */
class ImageLoader {
    /**
     * 加载图片（回调方式）
     * @param {string} url - 图片URL
     * @param {Function} onLoad - 加载成功回调
     * @param {Function} onError - 加载失败回调
     * @returns {HTMLImageElement} 图片元素
     */
    static loadImage(url, onLoad, onError) {
        const img = new Image();
        img.onload = () => onLoad && onLoad(img);
        img.onerror = () => onError && onError();
        img.src = url;
        return img;
    }

    /**
     * 加载图片（Promise方式）
     * @param {string} url - 图片URL
     * @returns {Promise<HTMLImageElement>} 图片加载Promise
     */
    static async loadImageAsync(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`图片加载失败: ${url}`));
            img.src = url;
        });
    }
}

/**
 * 工具函数类（静态类）
 * 提供常用的工具方法：防抖、节流、日期格式化、URL参数获取、HTML转义等
 */
class Utils {
    /**
     * 防抖函数
     * @param {Function} func - 待防抖的函数
     * @param {number} wait - 等待时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 待节流的函数
     * @param {number} limit - 限制时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => (inThrottle = false), limit);
            }
        };
    }

    /**
     * 格式化日期字符串，去除时分秒部分
     * @param {string} dateStr - ISO格式的日期字符串
     * @returns {string} 格式化后的日期（YYYY-MM-DD）
     */
    static formatDate(dateStr) {
        if (!dateStr) return '';
        return dateStr.split('T')[0];
    }

    /**
     * 获取URL查询参数
     * @param {string} name - 参数名
     * @returns {string|null} 参数值
     */
    static getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    /**
     * 截断文本并添加省略号
     * @param {string} text - 原始文本
     * @param {number} maxLength - 最大长度
     * @returns {string} 截断后的文本
     */
    static truncateText(text, maxLength) {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    /**
     * HTML转义，防止XSS攻击
     * @param {string} str - 原始字符串
     * @returns {string} 转义后的字符串
     */
    static escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * 平滑滚动到指定元素
     * @param {string} elementId - 元素ID
     * @param {string} behavior - 滚动行为（smooth/instant/auto）
     */
    static scrollToElement(elementId, behavior = 'smooth') {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior });
        }
    }

    /**
     * 处理图片URL，补全缺失的域名
     * @param {string} url - 图片URL
     * @returns {string} 完整的图片URL
     */
    static getImageUrl(url) {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
        }
        if (url.includes('/') && !url.startsWith('/') && !url.startsWith('./')) {
            // 优先使用 config1.js 中自动检测的 MINIO_BASE_URL
            var base = (typeof MINIO_BASE_URL !== 'undefined') ? MINIO_BASE_URL : '';
            return base + '/' + url;
        }
        return url;
    }
}

/**
 * 数据预加载管理器
 * 在页面加载前预先获取数据，提升用户体验
 */
class PreloadManager {
    constructor() {
        this.preloadData = {};   // 存储已加载的数据
        this.preloadPromises = {}; // 存储加载中的Promise
    }

    /**
     * 预加载数据
     * @param {string} url - 请求路径
     * @param {string} key - 数据存储键名
     * @returns {Promise} 加载Promise
     */
    preload(url, key) {
        this.preloadPromises[key] = fetch(`${SERVER_BASE_URL}${url}`)
            .then(res => res.json())
            .then(data => {
                this.preloadData[key] = data;
                return data;
            })
            .catch(err => {
            // 预加载失败静默，不阻塞主流程
                return null;
            });
        return this.preloadPromises[key];
    }

    /**
     * 获取已预加载的数据
     * @param {string} key - 数据键名
     * @returns {*} 数据内容
     */
    getData(key) {
        return this.preloadData[key];
    }

    /**
     * 获取预加载的Promise（用于等待加载完成）
     * @param {string} key - 数据键名
     * @returns {Promise} 加载Promise
     */
    getPromise(key) {
        return this.preloadPromises[key];
    }
}

/**
 * 图片懒加载组件
 * 使用 IntersectionObserver API 实现高效的图片懒加载，不支持时降级为滚动监听
 */
class LazyLoad {
    /**
     * 构造函数
     * @param {Object} options - 配置选项
     * @param {string} options.selector - 懒加载图片选择器
     * @param {string} options.rootMargin - 根元素外边距
     * @param {number} options.threshold - 阈值
     * @param {string} options.fallback - 加载失败时的备用图片
     */
    constructor(options = {}) {
        this.options = {
            selector: 'img[data-src]',
            rootMargin: '100px',
            threshold: 0,
            ...options
        };
        this.images = [];
        this.observer = null;
        this.init();
    }

    /** 初始化懒加载 */
    init() {
        this.images = document.querySelectorAll(this.options.selector);
        
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                this.handleIntersection.bind(this),
                {
                    root: null,
                    rootMargin: this.options.rootMargin,
                    threshold: this.options.threshold
                }
            );
            
            this.images.forEach(img => this.observer.observe(img));
        } else {
            this.fallbackLoad();
        }
    }

    /**
     * 处理元素交叉事件
     * @param {IntersectionObserverEntry[]} entries - 交叉观察条目数组
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    /**
     * 加载单张图片
     * @param {HTMLImageElement} img - 图片元素
     */
    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;
        
        img.src = src;
        img.onload = () => {
            img.classList.add('lazy-loaded');
            img.removeAttribute('data-src');
        };
        img.onerror = () => {
            img.src = this.options.fallback || '';
        };
    }

    /** 不支持 IntersectionObserver 时的降级加载方案 */
    fallbackLoad() {
        const loadImages = () => {
            this.images.forEach(img => {
                if (this.isInViewport(img)) {
                    this.loadImage(img);
                }
            });
        };
        
        loadImages();
        window.addEventListener('scroll', Utils.throttle(loadImages, 200));
        window.addEventListener('resize', Utils.throttle(loadImages, 200));
    }

    /**
     * 判断图片是否在可视区域内
     * @param {HTMLElement} img - 图片元素
     * @returns {boolean} 是否在可视区域内
     */
    isInViewport(img) {
        const rect = img.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * 添加新的图片到懒加载队列
     * @param {HTMLImageElement} img - 图片元素
     */
    addImage(img) {
        if (this.observer) {
            this.observer.observe(img);
        } else {
            this.images.push(img);
        }
    }
}

/**
 * 简单轮播组件
 * 基于透明度切换实现图片轮播，支持自动播放和手动切换
 */
class Slider {
    /**
     * 构造函数
     * @param {string} containerId - 轮播容器ID
     * @param {Object} options - 配置选项
     * @param {boolean} options.autoPlay - 是否自动播放
     * @param {number} options.interval - 自动播放间隔（毫秒）
     * @param {string} options.transition - 过渡动画样式
     */
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.items = [];           // 轮播项数组
        this.currentIndex = 0;     // 当前索引
        this.intervalId = null;    // 定时器ID
        this.options = {
            autoPlay: true,
            interval: 3000,
            transition: 'opacity 0.8s ease',
            ...options
        };
    }

    /**
     * 添加轮播项
     * @param {HTMLElement} element - 轮播元素
     */
    addItem(element) {
        element.style.cssText = `
            position:absolute; 
            top:0; 
            left:0; 
            width:100%; 
            height:100%; 
            transition: ${this.options.transition};
        `;
        this.container.appendChild(element);
        this.items.push(element);
        element.style.opacity = this.items.length === 1 ? 1 : 0;
    }

    /**
     * 跳转到指定索引的轮播项
     * @param {number} index - 目标索引
     */
    goTo(index) {
        if (this.items.length === 0) return;
        this.items[this.currentIndex].style.opacity = 0;
        this.currentIndex = (index + this.items.length) % this.items.length;
        this.items[this.currentIndex].style.opacity = 1;
    }

    /** 跳转到下一张 */
    next() {
        this.goTo(this.currentIndex + 1);
    }

    /** 跳转到上一张 */
    prev() {
        this.goTo(this.currentIndex - 1);
    }

    /** 开始自动播放 */
    start() {
        if (this.options.autoPlay && this.items.length > 1) {
            this.stop();
            this.intervalId = setInterval(() => this.next(), this.options.interval);
        }
    }

    /** 停止自动播放 */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    /**
     * 绑定左右切换按钮事件
     * @param {string} prevBtnId - 上一张按钮ID
     * @param {string} nextBtnId - 下一张按钮ID
     */
    bindButtons(prevBtnId, nextBtnId) {
        const prevBtn = document.getElementById(prevBtnId);
        const nextBtn = document.getElementById(nextBtnId);

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prev());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.next());
        }
    }
}

window.CommonNav = CommonNav;
window.ApiService = ApiService;
window.ImageLoader = ImageLoader;
window.Utils = Utils;
window.PreloadManager = PreloadManager;
window.Slider = Slider;
window.LazyLoad = LazyLoad;