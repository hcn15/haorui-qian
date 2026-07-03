document.addEventListener('DOMContentLoaded', function() {
    var mobileMenuBtn = document.getElementById('mobileMenuBtn');
    var mobileNavOverlay = document.getElementById('mobileNavOverlay');
    var mobileNavDrawer = document.getElementById('mobileNavDrawer');

    if (!mobileMenuBtn || !mobileNavOverlay || !mobileNavDrawer) {
        return;
    }

    function toggleMobileMenu() {
        mobileMenuBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        mobileNavDrawer.classList.toggle('active');
    }

    function closeMobileMenu() {
        mobileMenuBtn.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        mobileNavDrawer.classList.remove('active');
        document.querySelectorAll('.mobile-nav-item').forEach(function(item) {
            item.classList.remove('open');
        });
    }

    mobileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileMenu();
    });

    mobileNavOverlay.addEventListener('click', function() {
        closeMobileMenu();
    });

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

    document.querySelectorAll('.mobile-nav-sub-link').forEach(function(link) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    document.querySelectorAll('.mobile-nav-lang a').forEach(function(link) {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });

    window.addEventListener('resize', function() {
        if (window.innerWidth >= 768) {
            closeMobileMenu();
        }
    });
});