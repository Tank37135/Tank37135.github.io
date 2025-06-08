        document.addEventListener('DOMContentLoaded', function() {
            const loadingContainer = document.getElementById('loadingContainer');
            const loadingText = document.getElementById('loadingText');
            
            // 获取页面中所有需要加载的资源
            const resources = document.querySelectorAll('img, video, audio');
            let loadedCount = 0;
            let totalResources = resources.length;
            let hasError = false;
            
            // 3分钟超时计时器
            const timeoutTimer = setTimeout(() => {
                loadingText.textContent = '加载过长，即将跳过动画';
                // 5秒后自动隐藏
                setTimeout(() => {
                    loadingContainer.classList.add('hidden');
                }, 5000);
            }, 180000); // 3分钟 = 180000毫秒

            // 如果没有需要加载的资源，立即隐藏加载动画
            if (totalResources === 0) {
                clearTimeout(timeoutTimer);
                loadingContainer.classList.add('hidden');
                return;
            }

            // 更新加载进度
            function updateProgress() {
                const progress = Math.round((loadedCount / totalResources) * 100);
                loadingText.textContent = `正在加载 ${progress}%`;
                
                // 所有资源加载完成
                if (loadedCount >= totalResources) {
                    clearTimeout(timeoutTimer);
                    loadingContainer.classList.add('hidden');
                }
            }

            // 为每个资源添加加载和错误事件监听器
            resources.forEach(resource => {
                // 如果资源已经完成加载（可能是从缓存中加载的）
                if (resource.complete || (resource.readyState && resource.readyState >= 3)) {
                    loadedCount++;
                    updateProgress();
                } else {
                    resource.addEventListener('load', () => {
                        loadedCount++;
                        updateProgress();
                    });
                    
                    resource.addEventListener('error', () => {
                        // 加载失败也计入完成，但标记有错误
                        loadedCount++;
                        hasError = true;
                        updateProgress();
                    });
                }
            });
        });