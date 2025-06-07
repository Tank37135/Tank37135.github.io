        // 资源加载管理器
        class ResourceLoader {
            constructor() {
                this.startTime = Date.now();
                this.minDisplayTime = 2000; // 最少显示2秒
                this.timeoutWarning = 113000; // 1分53秒显示超时提示
                this.forceHideTimeout = 120000; // 2分钟强制隐藏
                this.timers = [];
            }

            // 初始化加载检测
            init() {
                this.setupTimers();
                this.checkAllResources().then(() => {
                    this.handleComplete();
                }).catch(() => {
                    this.handleComplete();
                });
            }

            // 设置计时器
            setupTimers() {
                // 超时提示计时器
                this.timers.push(setTimeout(() => {
                    document.querySelector('.timeout-message').style.display = 'block';
                }, this.timeoutWarning));

                // 强制隐藏计时器
                this.timers.push(setTimeout(() => {
                    this.handleComplete();
                }, this.forceHideTimeout));
            }

            // 检查所有资源
            checkAllResources() {
                return Promise.all([
                    this.checkImages(),
                    this.checkVideos(),
                    this.checkFonts(),
                    this.checkScripts(),
                    this.checkStylesheets(),
                    this.checkIframes()
                ]);
            }

            // 检查图片
            checkImages() {
                const images = Array.from(document.querySelectorAll('img'));
                if (images.length === 0) return Promise.resolve();

                return Promise.all(images.map(img => {
                    if (img.complete) return Promise.resolve();
                    return new Promise(resolve => {
                        img.addEventListener('load', resolve);
                        img.addEventListener('error', resolve);
                    });
                }));
            }

            // 检查视频
            checkVideos() {
                const videos = Array.from(document.querySelectorAll('video'));
                if (videos.length === 0) return Promise.resolve();

                return Promise.all(videos.map(video => {
                    if (video.readyState > 3) return Promise.resolve();
                    return new Promise(resolve => {
                        video.addEventListener('canplaythrough', resolve);
                        video.addEventListener('error', resolve);
                    });
                }));
            }

            // 检查字体
            checkFonts() {
                if (!document.fonts || document.fonts.size === 0) {
                    return Promise.resolve();
                }
                return document.fonts.ready;
            }

            // 检查脚本
            checkScripts() {
                const scripts = Array.from(document.querySelectorAll('script[src]'));
                if (scripts.length === 0) return Promise.resolve();

                return Promise.all(scripts.map(script => {
                    if (script.dataset.loaded === 'true') return Promise.resolve();
                    return new Promise(resolve => {
                        script.addEventListener('load', () => {
                            script.dataset.loaded = 'true';
                            resolve();
                        });
                        script.addEventListener('error', resolve);
                    });
                }));
            }

            // 检查样式表
            checkStylesheets() {
                const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
                if (stylesheets.length === 0) return Promise.resolve();

                return Promise.all(stylesheets.map(sheet => {
                    if (sheet.sheet) return Promise.resolve();
                    return new Promise(resolve => {
                        sheet.addEventListener('load', resolve);
                        sheet.addEventListener('error', resolve);
                    });
                }));
            }

            // 检查iframe
            checkIframes() {
                const iframes = Array.from(document.querySelectorAll('iframe'));
                if (iframes.length === 0) return Promise.resolve();

                return Promise.all(iframes.map(iframe => {
                    if (iframe.dataset.loaded === 'true') return Promise.resolve();
                    return new Promise(resolve => {
                        iframe.addEventListener('load', () => {
                            iframe.dataset.loaded = 'true';
                            resolve();
                        });
                        iframe.addEventListener('error', resolve);
                    });
                }));
            }

            // 处理加载完成
            handleComplete() {
                // 清除所有计时器
                this.timers.forEach(timer => clearTimeout(timer));
                
                // 计算剩余最少显示时间
                const elapsed = Date.now() - this.startTime;
                const remaining = Math.max(this.minDisplayTime - elapsed, 0);
                
                // 延迟隐藏以确保最小显示时间
                setTimeout(() => {
                    document.documentElement.classList.add('loaded');
                    
                    // 动画结束后移除元素
                    const loader = document.querySelector('.l-body');
                    loader.addEventListener('transitionend', () => {
                        loader.style.display = 'none';
                    }, { once: true });
                }, remaining);
            }
        }

        // 启动资源加载检测
        document.addEventListener('DOMContentLoaded', () => {
            new ResourceLoader().init();
        });

        // 如果DOM已经加载完成（代码放在body底部时）
        if (document.readyState !== 'loading') {
            new ResourceLoader().init();
        }