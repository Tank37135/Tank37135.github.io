(function () {
    'use strict';

    const overlay = document.createElement('div');
    overlay.className = 'tidal-lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '图片预览');
    overlay.hidden = true;
    overlay.innerHTML = [
        '<button class="tidal-lightbox__close" type="button" aria-label="关闭图片预览">',
        '<i class="fas fa-times" aria-hidden="true"></i>',
        '</button>',
        '<div class="tidal-lightbox__stage">',
        '<img class="tidal-lightbox__image" alt="">',
        '</div>',
        '<p class="tidal-lightbox__caption"></p>'
    ].join('');
    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector('.tidal-lightbox__close');
    const stage = overlay.querySelector('.tidal-lightbox__stage');
    const image = overlay.querySelector('.tidal-lightbox__image');
    const caption = overlay.querySelector('.tidal-lightbox__caption');
    const reduceMotion = window.TidalUI
        ? window.TidalUI.reduceMotion
        : window.matchMedia('(prefers-reduced-motion: reduce)');

    let trigger = null;
    let sourceImage = null;
    let thumbnailRect = null;
    let targetRect = null;
    let closeTimer = null;
    let motionId = 0;

    function getRect(left, top, width, height) {
        return { left, top, width, height };
    }

    function calculateTargetRect(naturalWidth, naturalHeight) {
        const maxWidth = Math.min(window.innerWidth * 0.9, 1200);
        const maxHeight = Math.min(window.innerHeight * 0.82, 900);
        const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1);
        const width = Math.max(1, naturalWidth * ratio);
        const height = Math.max(1, naturalHeight * ratio);

        return getRect(
            (window.innerWidth - width) / 2,
            (window.innerHeight - height) / 2,
            width,
            height
        );
    }

    function setStageRect(rect) {
        stage.style.left = rect.left + 'px';
        stage.style.top = rect.top + 'px';
        stage.style.width = rect.width + 'px';
        stage.style.height = rect.height + 'px';
    }

    function initialTransform() {
        const scaleX = thumbnailRect.width / targetRect.width;
        const scaleY = thumbnailRect.height / targetRect.height;
        const translateX = thumbnailRect.left - targetRect.left;
        const translateY = thumbnailRect.top - targetRect.top;
        return 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + scaleX + ', ' + scaleY + ')';
    }

    function stopAnimations() {
        stage.getAnimations().forEach(function (animation) {
            animation.cancel();
        });
        overlay.getAnimations().forEach(function (animation) {
            animation.cancel();
        });
    }

    function open(triggerElement, imageElement) {
        window.clearTimeout(closeTimer);
        stopAnimations();
        const currentMotion = ++motionId;

        trigger = triggerElement;
        sourceImage = imageElement;
        thumbnailRect = imageElement.getBoundingClientRect();
        image.src = imageElement.currentSrc || imageElement.src;
        image.alt = imageElement.alt || '图片预览';
        caption.textContent = imageElement.alt || '';
        caption.hidden = !imageElement.alt;

        const naturalWidth = imageElement.naturalWidth || thumbnailRect.width || 16;
        const naturalHeight = imageElement.naturalHeight || thumbnailRect.height || 9;
        targetRect = calculateTargetRect(naturalWidth, naturalHeight);
        setStageRect(targetRect);

        overlay.hidden = false;
        overlay.classList.add('is-open');
        document.body.classList.add('lightbox-open');
        closeButton.focus();

        const animations = [];

        if (reduceMotion.matches) {
            stage.style.transform = 'none';
            stage.style.opacity = '1';
            overlay.style.opacity = '1';
        } else {
            const startTransform = initialTransform();
            stage.style.transform = startTransform;
            stage.style.opacity = '0.82';
            overlay.style.opacity = '0';

            animations.push(stage.animate([
                { transform: startTransform, opacity: 0.82 },
                { transform: 'translate(0, 0) scale(1, 1)', opacity: 1 }
            ], {
                duration: 420,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'forwards'
            }));
            animations.push(overlay.animate([
                { opacity: 0 },
                { opacity: 1 }
            ], {
                duration: 240,
                easing: 'ease-out',
                fill: 'forwards'
            }));

            Promise.all(animations.map(function (animation) {
                return animation.finished.catch(function () {});
            })).then(function () {
                if (overlay.hidden || currentMotion !== motionId) return;
                stage.style.transform = 'none';
                stage.style.opacity = '1';
                overlay.style.opacity = '1';
            });
        }
    }

    function close() {
        if (overlay.hidden) return;
        stopAnimations();
        const currentMotion = ++motionId;
        document.body.classList.remove('lightbox-open');

        if (reduceMotion.matches) {
            overlay.style.opacity = '0';
            stage.style.opacity = '0';
            closeTimer = window.setTimeout(function () {
                if (currentMotion === motionId) finishClose();
            }, 160);
            return;
        }

        if (!trigger || !thumbnailRect || !targetRect) {
            closeTimer = window.setTimeout(function () {
                if (currentMotion === motionId) finishClose();
            }, 0);
            return;
        }

        const currentTransform = getComputedStyle(stage).transform;
        const endTransform = initialTransform();

        const stageAnimation = stage.animate([
            { transform: currentTransform, opacity: 1 },
            { transform: endTransform, opacity: 0.75 }
        ], {
            duration: 280,
            easing: 'cubic-bezier(0.4, 0, 1, 1)',
            fill: 'forwards'
        });
        const overlayAnimation = overlay.animate([
            { opacity: getComputedStyle(overlay).opacity || '1' },
            { opacity: 0 }
        ], {
            duration: 230,
            easing: 'ease-in',
            fill: 'forwards'
        });

        Promise.all([
            stageAnimation.finished.catch(function () {}),
            overlayAnimation.finished.catch(function () {})
        ]).then(function () {
            if (currentMotion === motionId) finishClose();
        });
    }

    function finishClose() {
        overlay.hidden = true;
        overlay.classList.remove('is-open');
        overlay.style.opacity = '';
        stage.style.opacity = '';
        stage.style.transform = '';
        image.removeAttribute('src');

        if (trigger) {
            trigger.focus();
        } else if (sourceImage) {
            sourceImage.focus();
        }
    }

    function init(selector) {
        document.addEventListener('click', function (event) {
            const triggerElement = event.target.closest(selector);
            if (!triggerElement) return;

            const imageElement = triggerElement.matches('img')
                ? triggerElement
                : triggerElement.querySelector('img');
            if (!imageElement) return;

            event.preventDefault();
            open(triggerElement, imageElement);
        });
    }

    closeButton.addEventListener('click', close);

    overlay.addEventListener('click', function (event) {
        if (event.target === overlay) close();
    });

    document.addEventListener('keydown', function (event) {
        if (overlay.hidden) return;

        if (event.key === 'Escape') {
            event.preventDefault();
            close();
            return;
        }

        if (event.key === 'Tab') {
            event.preventDefault();
            closeButton.focus();
        }
    });

    window.TidalLightbox = { init: init };
})();
