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
        
        
        
//打字机
function getGreeting() {
            const hour = new Date().getHours();
            
            if (hour >= 5 && hour < 11) {
                return "早上好，呼吸新鲜的空气吧";
            } else if (hour >= 11 && hour < 13) {
                return "中午好，吃午餐了吗";
            } else if (hour >= 13 && hour < 18) {
                return "下午好，去活动一下吧";
            } else if (hour >= 18 && hour < 22) {
                return "晚上好，记得准时睡觉哦";
            } else {
                return "休息一下吧，熬夜对身体不好";
            }
        }

        // 打字机效果
        const sentences = [
            getGreeting(),
            "记录生活，分享技术",
            "html实践网站啦~",
            "天天开心一点，不要emo了~",
            "海内存知己，天涯若比邻"
        ];

        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        let textElement = document.getElementById('text');

        function typeText() {
            let currentMessage = sentences[index];
            if (isDeleting) {
                if (charIndex > 0) {
                    charIndex--;
                    textElement.textContent = currentMessage.substring(0, charIndex);
                } else {
                    isDeleting = false;
                    index = (index + 1) % sentences.length;
                }
            } else {
                if (charIndex < currentMessage.length) {
                    charIndex++;
                    textElement.textContent = currentMessage.substring(0, charIndex);
                } else {
                    isDeleting = true;
                    setTimeout(typeText, 3000); // 等待3秒后删除
                    return;
                }
            }
            setTimeout(typeText, isDeleting ? 60 : 80); // 加快打字速度
        }

        typeText();