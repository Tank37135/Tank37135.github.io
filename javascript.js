
  const leftColumn = document.getElementById('left-column');
  const rightColumn = document.getElementById('right-column');

  // 监听左侧滚动事件
  leftColumn.addEventListener('scroll', () => {
    if (leftColumn.scrollHeight - leftColumn.scrollTop <= leftColumn.clientHeight) {
      rightColumn.scrollTop = rightColumn.scrollHeight; // 滚动右侧到顶部
    }
  });

  // 监听右侧滚动事件
  rightColumn.addEventListener('scroll', () => {
    if (rightColumn.scrollHeight - rightColumn.scrollTop <= rightColumn.clientHeight) {
      leftColumn.scrollTop = leftColumn.scrollHeight; // 滚动左侧到顶部
    }
  });
        function createFirefly() {
            const firefly = document.createElement('div');
            firefly.className = 'firefly';
            firefly.style.left = `${Math.random() * 100}%`;
            firefly.style.top = `${Math.random() * 100}%`;
            firefly.style.animationDelay = `${Math.random() * 15}s, ${Math.random() * 1}s`; /* Adjusted delay */
            firefly.style.backgroundColor = `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.9)`;
            document.body.appendChild(firefly);
        }

        for (let i = 0; i < 50; i++) {
            createFirefly();
        }