(function () {
    'use strict';

    const SERVER_IP = 'mc.tank37135.cn';
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktopQuery = window.matchMedia('(min-width: 941px)');

    const header = document.getElementById('siteHeader');
    const menu = document.getElementById('siteMenu');
    const menuToggle = document.getElementById('siteMenuToggle');
    const menuPanel = menu ? menu.querySelector('.site-mobile-menu__panel') : null;
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMsg');
    const scrollProgress = document.getElementById('scrollProgress');
    const bannerContent = document.getElementById('bannerContent');

    let menuOpen = false;
    let menuHideTimer = null;
    let lastFocusedElement = null;
    let toastTimer = null;
    let scrollTicking = false;

    function updateScrollState() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (header) {
            header.classList.toggle('is-scrolled', scrollTop > 24);
        }

        if (scrollProgress) {
            const scrollable = document.documentElement.scrollHeight - window.innerHeight;
            const percent = scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0;
            scrollProgress.style.width = percent + '%';
            scrollProgress.setAttribute('aria-valuenow', String(Math.round(percent)));
        }

        if (bannerContent && !reducedMotion.matches) {
            bannerContent.style.transform = 'translateY(' + (-scrollTop * 0.2) + 'px)';
        }

        scrollTicking = false;
    }

    function requestScrollUpdate() {
        if (!scrollTicking) {
            scrollTicking = true;
            window.requestAnimationFrame(updateScrollState);
        }
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);
    updateScrollState();

    function openMenu() {
        if (!menu || !menuToggle || menuOpen) return;
        window.clearTimeout(menuHideTimer);
        lastFocusedElement = document.activeElement;
        menu.hidden = false;
        menu.setAttribute('aria-hidden', 'false');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', '关闭导航菜单');
        document.body.classList.add('menu-open');
        menuOpen = true;

        requestAnimationFrame(function () {
            menu.classList.add('is-open');
            requestAnimationFrame(function () {
                const firstLink = menuPanel && menuPanel.querySelector('.site-mobile-nav a');
                if (firstLink) firstLink.focus();
            });
        });
    }

    function closeMenu(restoreFocus) {
        if (!menu || !menuToggle || !menuOpen) return;
        menu.classList.remove('is-open');
        menu.setAttribute('aria-hidden', 'true');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', '打开导航菜单');
        document.body.classList.remove('menu-open');
        menuOpen = false;

        menuHideTimer = window.setTimeout(function () {
            menu.hidden = true;
        }, reducedMotion.matches ? 0 : 220);

        if (restoreFocus) {
            const target = lastFocusedElement || menuToggle;
            target.focus();
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', function () {
            if (menuOpen) {
                closeMenu(true);
            } else {
                openMenu();
            }
        });
    }

    if (menu) {
        menu.querySelectorAll('[data-menu-close]').forEach(function (button) {
            button.addEventListener('click', function () {
                closeMenu(true);
            });
        });

        menu.querySelectorAll('.site-mobile-nav a').forEach(function (link) {
            link.addEventListener('click', function () {
                closeMenu(false);
            });
        });
    }

    document.addEventListener('keydown', function (event) {
        if (!menuOpen) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            closeMenu(true);
            return;
        }

        if (event.key !== 'Tab' || !menuPanel) return;

        const focusable = Array.from(
            menuPanel.querySelectorAll('a[href], button:not([disabled])')
        ).filter(function (element) {
            return element.offsetParent !== null;
        });

        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    desktopQuery.addEventListener('change', function (event) {
        if (event.matches && menuOpen) closeMenu(false);
    });

    function showToast(message) {
        if (!toast || !toastMessage) return;
        toastMessage.textContent = message;
        toast.classList.add('show');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            toast.classList.remove('show');
        }, 2800);
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            const copied = document.execCommand('copy');
            showToast(copied ? '已复制服务器地址：' + text : '复制失败，请手动复制：' + text);
        } catch (error) {
            showToast('复制失败，请手动复制：' + text);
        }

        textarea.remove();
    }

    function copyIp() {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(SERVER_IP)
                .then(function () {
                    showToast('已复制服务器地址：' + SERVER_IP);
                })
                .catch(function () {
                    fallbackCopy(SERVER_IP);
                });
            return;
        }

        fallbackCopy(SERVER_IP);
    }

    document.querySelectorAll('[data-copy-ip]').forEach(function (button) {
        button.addEventListener('click', copyIp);
    });

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            const hash = anchor.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({
                behavior: reducedMotion.matches ? 'auto' : 'smooth',
                block: 'start'
            });
            history.pushState(null, '', hash);
            target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
        });
    });

    window.TidalUI = {
        notify: showToast,
        reduceMotion: reducedMotion
    };
})();
