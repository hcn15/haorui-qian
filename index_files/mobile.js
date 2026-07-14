/**
 * 移动端菜单交互逻辑
 * 负责移动端汉堡菜单的显示/隐藏、侧边栏抽屉切换、子菜单展开收起
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取移动端菜单相关DOM元素
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileNavOverlay = document.getElementById('mobileNavOverlay');
    var mobileNavDrawer = document.getElementById('mobileNavDrawer');

    // 元素不存在时直接返回
    if (!mobileMenuBtn || !mobileNavOverlay || !mobileNavDrawer) {
        return;
    }

    /** 切换移动端菜单的显示/隐藏状态 */
    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        mobileNavDrawer.classList.toggle('active');
    }

    /** 关闭移动端菜单并重置子菜单状态 */
    function closeMobileMenu() {
        mobileMenuBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
        document.querySelectorAll('.mobile-nav-item').forEach(function(item) {
            item.classList.remove('open');
        });
    }

    // 点击汉堡按钮切换菜单
    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    // 点击遮罩层关闭菜单
    mobileNavOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });

    // 处理导航链接点击：有子菜单则展开/收起，否则关闭菜单
    document.querySelectorAll('.mobile-nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            var hasSub = this.nextElementSibling && this.nextElementSibling.classList.contains('mobile-nav-sub');
            if (hasSub) {
                e.preventDefault();
                this.parentElement.classList.toggle('open');
            } else {
                closeMobileMenu();
            }
        });
    });

    // 点击子菜单链接时关闭菜单
    document.querySelectorAll('.mobile-nav-sub-link').forEach(function(link) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // 点击语言切换链接时关闭菜单
    document.querySelectorAll('.mobile-nav-lang a').forEach(function(link) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    // 窗口尺寸变化时，如果宽度>=768px则关闭菜单（回到桌面视图）
    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });
});