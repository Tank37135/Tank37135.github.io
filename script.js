
        function updateProgressBars() {
            const now = new Date();
            const seconds = now.getSeconds();
            const minutes = now.getMinutes();
            const hours = now.getHours();
            const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
            const totalDaysInYear = (new Date(now.getFullYear(), 11, 31) - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);

            document.getElementById('minuteProgressBar').style.width = `${Math.floor((seconds / 60) * 100)}%`;
            document.getElementById('minuteProgressBar').innerText = `${Math.floor((seconds / 60) * 100)}%`;
            document.getElementById('hourProgressBar').style.width = `${Math.floor((minutes / 60) * 100)}%`;
            document.getElementById('hourProgressBar').innerText = `${Math.floor((minutes / 60) * 100)}%`;
            document.getElementById('hour24ProgressBar').style.width = `${Math.floor((hours / 24) * 100)}%`;
            document.getElementById('hour24ProgressBar').innerText = `${Math.floor((hours / 24) * 100)}%`;
            document.getElementById('yearProgressBar').style.width = `${Math.floor((dayOfYear / totalDaysInYear) * 100)}%`;
            document.getElementById('yearProgressBar').innerText = `${Math.floor((dayOfYear / totalDaysInYear) * 100)}%`;
        }

        setInterval(updateProgressBars, 1000); // 每秒更新进度条
        updateProgressBars(); // 初始化进度条
