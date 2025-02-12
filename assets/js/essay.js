
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
   