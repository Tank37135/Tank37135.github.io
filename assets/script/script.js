        document.addEventListener('DOMContentLoaded',
            function() {
                setTimeout(function() {
                        document.getElementById('section1').classList.add('animate');
                    },
                    100);
            });
            
            
            document.addEventListener('DOMContentLoaded', function() {
            const logoContainer = document.querySelector('.logo-container');
            const dropdownMenu = document.querySelector('nav.dropdown-menu');
            const body = document.body;
            let menuOpen = false;
            
            // 点击Logo或文字切换菜单
            logoContainer.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });
            
            // 点击菜单外部关闭菜单
            document.addEventListener('click', function() {
                if (menuOpen) {
                    closeMenu();
                }
            });
            
            // 阻止菜单点击事件冒泡
            dropdownMenu.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // 点击链接后关闭菜单
                if (e.target.classList.contains('menu-item')) {
                    closeMenu();
                }
            });
            
            function toggleMenu() {
                if (menuOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            }
            
            function openMenu() {
                dropdownMenu.classList.add('active');
                menuOpen = true;
            }
            
            function closeMenu() {
                // 先添加淡出效果
                body.style.opacity = '0.7';
                
                // 延迟执行收起动画
                setTimeout(() => {
                    dropdownMenu.classList.remove('active');
                    body.style.opacity = '1';
                    menuOpen = false;
                }, 100);
            }
        });
        
        
        
        
               // 获取搜索输入框和结果容器
        const search = document.getElementById('search');
        const resultsContainer = document.getElementById('articleResults');
        
        // 创建无结果提示元素
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '没有找到匹配的文章';
        noResults.style.display = 'none';
        resultsContainer.appendChild(noResults);

        // 搜索文章的函数
        function searchArticles(query) {
            // 获取所有文章卡片
            const articleCards = resultsContainer.querySelectorAll('.article-card');
            let hasResults = false;
            
            // 将查询转为小写以便对比
            query = query.toLowerCase().trim();

            // 循环检查每个文章卡片
            articleCards.forEach(card => {
                const title = card.querySelector('.article-title').textContent.toLowerCase();
                const tags = card.getAttribute('data-tags').toLowerCase().split(',');
                const excerpt = card.querySelector('.article-excerpt').textContent.toLowerCase();
                
                if (title.includes(query) || 
                    tags.some(tag => tag.includes(query)) ||
                    excerpt.includes(query)) {
                    // 显示匹配的文章卡片
                    card.style.display = 'block';
                    hasResults = true;
                } else {
                    // 隐藏不匹配的文章卡片
                    card.style.display = 'none';
                }
            });

            // 显示或隐藏无结果提示
            noResults.style.display = hasResults ? 'none' : 'block';
        }

        // 监听搜索输入框的实时变化
        search.addEventListener('input', function() {
            const query = this.value;
            if (query) {
                // 执行搜索并过滤结果
                searchArticles(query);
            } else {
                // 恢复所有文章卡片当搜索为空时
                const articleCards = resultsContainer.querySelectorAll('.article-card');
                articleCards.forEach(card => {
                    card.style.display = 'block';
                });
                noResults.style.display = 'none';
            }
        });

        // 点击标签自动填充搜索框功能
        document.addEventListener('DOMContentLoaded', function() {
            const tags = document.querySelectorAll('.tag');
            
            tags.forEach(tag => {
                tag.addEventListener('click', function(e) {
                    e.preventDefault();
                    const tagText = this.textContent;
                    search.value = tagText;
                    searchArticles(tagText);
                });
            });

            // 新增：鼠标悬停卡片倾斜效果
            const cards = document.querySelectorAll('.article-card');
            cards.forEach(card => {
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = e.clientX - rect.left; // 鼠标相对于卡片左侧的位置
                    const y = e.clientY - rect.top; // 鼠标相对于卡片顶部的位置
                    
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;
                    
                    // 计算鼠标相对于卡片中心的位置
                    const relativeX = x - centerX;
                    const relativeY = y - centerY;
                    
                    // 计算旋转角度 (限制在15度以内)
                    const rotateY = (relativeX / centerX) * 15;
                    const rotateX = (relativeY / centerY) * -15;
                    
                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
                });
            });
        });