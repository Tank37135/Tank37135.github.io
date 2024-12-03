// 监听图片加载事件
  document.addEventListener('DOMContentLoaded', function() {
    var img = document.querySelector('.article-box img');
    img.onload = function() {
      img.classList.add('loaded'); // 加载完成后移除灰色背景和文字
    };
  });