// Tank37135.github.io-TKB6 All rights reserved-Tank37135 
//代码块
        function copyCode(button) {
                    const code = button.nextElementSibling.textContent;
                    
                    navigator.clipboard.writeText(code).then(() => {
         const originalText = button.textContent;
         button.textContent = '已复制!';
         button.style.background = '#28a745';
         
         setTimeout(() => {
             button.textContent = originalText;
             button.style.background = '#ff9900';
         }, 2000);
                    }).catch(err => {
         console.error('复制失败:', err);
         alert('复制失败，请手动复制');
                    });
                }
   //工具栏
        // 获取元素
        const toTopBtn = document.getElementById('toTopBtn');
        const toBottomBtn = document.getElementById('toBottomBtn');
        const musicBtn = document.getElementById('musicBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const musicIcon = musicBtn.querySelector('.music-icon');
        const topWrapper = toTopBtn.parentElement;
        const bottomWrapper = toBottomBtn.parentElement;
        
        // 音乐按钮状态
        let musicDisabled = false;
        
        // 滚动事件监听
        window.addEventListener('scroll', function() {
            // 检查是否在页面顶部
            if (window.pageYOffset > 300) { // 滚动超过300px显示回到顶部按钮
                toTopBtn.classList.remove('hidden');
                topWrapper.classList.remove('collapsed');
            } else {
                toTopBtn.classList.add('hidden');
                topWrapper.classList.add('collapsed');
            }
            
            // 检查是否接近页面底部
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollTop + clientHeight >= scrollHeight - 100) { // 距离底部100px时隐藏回到底部按钮
                toBottomBtn.classList.add('hidden');
                bottomWrapper.classList.add('collapsed');
            } else {
                toBottomBtn.classList.remove('hidden');
                bottomWrapper.classList.remove('collapsed');
            }
        }, { passive: true });
        
        // 回到顶部按钮点击事件
        toTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        // 回到底部按钮点击事件
        toBottomBtn.addEventListener('click', function() {
            window.scrollTo({
                top: document.body.scrollHeight,
                behavior: 'smooth'
            });
        });
        
        // 音乐按钮点击事件
        musicBtn.addEventListener('click', function() {
            musicDisabled = !musicDisabled;
            musicIcon.classList.toggle('disabled', musicDisabled);
            console.log('音乐状态:', musicDisabled ? '禁用' : '启用');
        });
        
        // 设置按钮点击事件
        settingsBtn.addEventListener('click', function() {
            console.log('设置按钮点击 - 功能待实现');
        });