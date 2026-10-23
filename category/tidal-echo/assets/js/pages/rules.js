(function () {
    'use strict';

    const termsContent = document.getElementById('termsContent');
    const reduceMotion = window.TidalUI ? window.TidalUI.reduceMotion : null;

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const dividerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('wide');
            dividerObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.divider').forEach(function (divider) {
        if (divider.id) dividerObserver.observe(divider);
    });

    if (reduceMotion && reduceMotion.matches) {
        if (termsContent) termsContent.classList.add('visible');
        document.querySelectorAll('.divider').forEach(function (divider) {
            divider.classList.add('wide');
        });
        return;
    }

    if (termsContent) observer.observe(termsContent);

    window.setTimeout(function () {
        if (termsContent) {
            const rect = termsContent.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                termsContent.classList.add('visible');
                observer.unobserve(termsContent);
            }
        }

        document.querySelectorAll('.divider').forEach(function (divider) {
            const rect = divider.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8 && rect.bottom > 0) {
                divider.classList.add('wide');
                dividerObserver.unobserve(divider);
            }
        });
    }, 160);
})();
