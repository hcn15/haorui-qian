/* ============================================================
 * index-header-footer.js
 * 抽取自 index.html 的登录状态管理逻辑
 * 依赖：cart.js（HRCart）、config1.js（SERVER_BASE_URL）
 * ============================================================ */

function initAuthState() {
    var token = localStorage.getItem('token');
    var username = localStorage.getItem('username');
    var guest = document.getElementById('authGuest');
    var user = document.getElementById('authUser');
    if (!guest || !user) return;
    var avatarChar = (username || '商').charAt(0).toUpperCase();
    if (token && username) {
        guest.style.display = 'none';
        user.style.display = 'flex';
        var userNameEl = document.getElementById('userName');
        var userAvatarEl = document.getElementById('userAvatar');
        var dropdownAvatarEl = document.getElementById('dropdownAvatar');
        var dropdownUsernameEl = document.getElementById('dropdownUsername');
        if (userNameEl) userNameEl.textContent = username;
        if (userAvatarEl) userAvatarEl.textContent = avatarChar;
        if (dropdownAvatarEl) dropdownAvatarEl.textContent = avatarChar;
        if (dropdownUsernameEl) dropdownUsernameEl.textContent = username;
        updateCartBadgeInDropdown();
    } else {
        guest.style.display = 'flex';
        user.style.display = 'none';
        closeUserDropdown();
    }
}

function updateCartBadgeInDropdown() {
    var badge = document.getElementById('dropdownCartBadge');
    if (!badge) return;
    var count = window.HRCart ? HRCart.getCartCount() : 0;
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function updateCartBadge() {
    var badges = document.querySelectorAll('.cart-badge');
    var count = window.HRCart ? HRCart.getCartCount() : 0;
    badges.forEach(function (badge) {
        if (count > 0) {
            badge.textContent = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

function closeUserDropdown() {
    var dropdown = document.getElementById('userDropdown');
    var trigger = document.getElementById('userMenuTrigger');
    if (dropdown) dropdown.classList.remove('show');
    if (trigger) trigger.classList.remove('active');
}

function toggleUserDropdown(e) {
    e.stopPropagation();
    var dropdown = document.getElementById('userDropdown');
    var trigger = document.getElementById('userMenuTrigger');
    if (!dropdown || !trigger) return;
    var isOpen = dropdown.classList.contains('show');
    if (isOpen) {
        closeUserDropdown();
    } else {
        dropdown.classList.add('show');
        trigger.classList.add('active');
        updateCartBadgeInDropdown();
    }
}

function handleLogout(e) {
    e.preventDefault();
    if (!confirm('确定要退出登录吗？')) return;
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('roleId');
    if (window.HRCart) HRCart.logout();
    closeUserDropdown();
    initAuthState();
}

document.addEventListener('DOMContentLoaded', function () {
    var trigger = document.getElementById('userMenuTrigger');
    var logoutBtn = document.getElementById('dropdownLogout');
    if (trigger) trigger.addEventListener('click', toggleUserDropdown);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    document.addEventListener('click', function (e) {
        var userSection = document.getElementById('authUser');
        if (userSection && !userSection.contains(e.target)) closeUserDropdown();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeUserDropdown();
    });
    initAuthState();
    updateCartBadge();
});
