// 页面加载时显示加载动画
        document.body.classList.add('loading'); // 添加加载类
        document.getElementById('loader').style.display = 'block'; // 显示加载动画

        // 当页面加载完成时隐藏加载动画
        window.addEventListener('load', function() {
            document.getElementById('loader').style.display = 'none'; // 隐藏加载动画
            document.body.classList.remove('loading'); // 移除加载类
            document.body.style.overflow = 'auto'; // 允许滚动
        });
        document.querySelectorAll('.lazy').forEach(image => {
    image.addEventListener('load', () => {
        const container = image.parentElement; // 获取图片的父容器
        const loader = container.querySelector('.loader'); // 查找加载动画
        loader.style.display = 'none'; // 隐藏加载动画
        image.style.opacity = 1; // 显示图片
    });

    // 添加默认样式，使图片初始不可见
    image.style.opacity = 0; // 初始设置为透明
});
