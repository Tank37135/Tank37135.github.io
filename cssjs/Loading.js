document.addEventListener("DOMContentLoaded", function() {
    const lazyImages = document.querySelectorAll('img.lazy');

    const loadImage = (image) => {
        const src = image.getAttribute('data-src');
        if (!src) return;
        image.src = src; // 设置图片源
        image.onload = () => {
            image.style.display = 'block'; // 显示图片
            image.parentElement.querySelector('.loader').style.display = 'none'; // 隐藏加载提示
            image.parentElement.style.backgroundColor = 'transparent'; // 隐藏黑色背景
        };
    };

    const imgObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadImage(entry.target);
                observer.unobserve(entry.target); // 停止观察已加载的图片
            }
        });
    });

    lazyImages.forEach(image => {
        imgObserver.observe(image); // 观察每个懒加载图片
    });
});
