(function () {
    'use strict';

    const introCard = document.getElementById('introCard');
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    const reduceMotion = window.TidalUI ? window.TidalUI.reduceMotion : null;
    let countsAnimated = false;

    function revealElement(element, observer) {
        if (!element) return;
        element.classList.add('visible');
        if (observer) observer.unobserve(element);
    }

    function animateCounts() {
        if (countsAnimated) return;
        countsAnimated = true;

        statNumbers.forEach(function (element) {
            const target = Number.parseFloat(element.dataset.count);
            if (Number.isNaN(target)) return;

            if (reduceMotion && reduceMotion.matches) {
                element.textContent = target;
                return;
            }

            const startTime = performance.now();
            const duration = 1200;

            function update(time) {
                const progress = Math.min((time - startTime) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const current = target * eased;
                element.textContent = Number.isInteger(target)
                    ? String(Math.round(current))
                    : current.toFixed(1);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    element.textContent = String(target);
                }
            }

            requestAnimationFrame(update);
        });
    }

    document.querySelectorAll('.feature-item').forEach(function (item) {
        item.addEventListener('mousemove', function (event) {
            if (reduceMotion && reduceMotion.matches) return;
            const rect = item.getBoundingClientRect();
            item.style.setProperty('--mouse-x', ((event.clientX - rect.left) / rect.width) * 100 + '%');
            item.style.setProperty('--mouse-y', ((event.clientY - rect.top) / rect.height) * 100 + '%');
        });
    });

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);

            if (entry.target === introCard) {
                window.setTimeout(animateCounts, 160);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const animatedElements = [
        introCard,
        document.getElementById('dividerIntro'),
        document.getElementById('dividerServer'),
        document.getElementById('dividerFeatures'),
        document.getElementById('dividerGallery'),
        document.getElementById('dividerDownloads'),
        ...document.querySelectorAll('#featureGrid .feature-item'),
        ...document.querySelectorAll('#galleryGrid .gallery-item'),
        ...document.querySelectorAll('#downloadGrid .download-card'),
        document.querySelector('.server-config')
    ].filter(Boolean);

    animatedElements.forEach(function (element) {
        observer.observe(element);
    });

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

    if (window.TidalLightbox) {
        window.TidalLightbox.init('.gallery-item .image-zoom-trigger');
    }

    if (reduceMotion && reduceMotion.matches) {
        document.querySelectorAll('.feature-item, .gallery-item, .download-card, #introCard, .server-config')
            .forEach(function (element) {
                element.classList.add('visible');
            });
        document.querySelectorAll('.divider').forEach(function (divider) {
            divider.classList.add('wide');
        });
        animateCounts();
        return;
    }

    window.setTimeout(function () {
        document.querySelectorAll('.feature-item, .gallery-item, .download-card, #introCard, .server-config')
            .forEach(function (element) {
                const rect = element.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.88 && rect.bottom > 0) {
                    revealElement(element, observer);
                }
            });

        if (introCard && introCard.classList.contains('visible')) {
            window.setTimeout(animateCounts, 180);
        }

        document.querySelectorAll('.divider').forEach(function (divider) {
            const rect = divider.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                divider.classList.add('wide');
                dividerObserver.unobserve(divider);
            }
        });
    }, 160);
})();
