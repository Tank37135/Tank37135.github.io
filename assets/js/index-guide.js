
        // 获取搜索输入框和结果容器
        const search = document.getElementById('search');
        const resultsContainer = document.getElementById('projectResults');

        // 搜索项目的函数
        function searchProjects(query) {
            // 获取所有项目卡
            const projectCards = resultsContainer.getElementsByTagName('article');
            
            // 将查询转为小写以便对比
            query = query.toLowerCase();

            // 循环检查每个项目卡
            for (let card of projectCards) {
                const projectName = card.getAttribute('data-name').toLowerCase();
                const projectTechs = card.getAttribute('data-tech').toLowerCase().split(', ');

                if (projectName.includes(query) || 
                    projectTechs.some(tech => tech.includes(query))) {
                    // 显示匹配的项目卡
                    card.style.display = 'block';
                } else {
                    // 隐藏不匹配的项目卡
                    card.style.display = 'none';
                }
            }
        }

        // 监听搜索输入框的实时变化
        search.addEventListener('input', function() {
            const query = this.value;
            if (query) {
                // 执行搜索并过滤结果
                searchProjects(query);
            } else {
                // 恢复所有项目卡当搜索为空时
                const projectCards = resultsContainer.getElementsByTagName('article');
                for (let card of projectCards) {
                    card.style.display = 'block';
                }
            }
        });
