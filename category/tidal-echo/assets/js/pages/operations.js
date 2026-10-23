(function () {
    'use strict';

    const financeContainer = document.getElementById('financeContainer');
    const summaryCards = document.getElementById('summaryCards');
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalRecoveryElement = document.getElementById('totalRecovery');
    const totalExpenseElement = document.getElementById('totalExpense');
    const totalNetElement = document.getElementById('totalNet');
    const reduceMotion = window.TidalUI ? window.TidalUI.reduceMotion : null;
    let currentMonthId = null;
    let allMonths = [];

    if (window.TidalLightbox) {
        window.TidalLightbox.init('.image-zoom-trigger');
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatMoney(value) {
        return Number(value).toFixed(2);
    }

    function formatAmount(value) {
        return (value >= 0 ? '+' : '') + formatMoney(value);
    }

    function balanceClass(value) {
        if (value > 0) return 'balance-positive';
        if (value < 0) return 'balance-negative';
        return 'balance-zero';
    }

    function amountClass(value) {
        return value >= 0 ? 'income' : 'expense';
    }

    function computeSummaries(months) {
        let totalAllIncome = 0;
        let totalSponsorship = 0;
        let totalRecovery = 0;
        let totalExpense = 0;

        months.forEach(function (month) {
            let monthIncome = 0;
            let monthExpense = 0;
            const rows = Array.isArray(month.rows) ? month.rows : [];

            rows.forEach(function (row) {
                const amount = Number.parseFloat(row.amount);
                if (Number.isNaN(amount)) return;

                if (amount >= 0) {
                    totalAllIncome += amount;
                    monthIncome += amount;
                    if (amount > 0) {
                        if (String(row.tag || '').trim() === '赞助收入') {
                            totalSponsorship += amount;
                        } else {
                            totalRecovery += amount;
                        }
                    }
                } else {
                    totalExpense += Math.abs(amount);
                    monthExpense += Math.abs(amount);
                }
            });

            month._income = monthIncome;
            month._expense = monthExpense;
            month._net = monthIncome - monthExpense;
            month._rowCount = rows.length;
        });

        return {
            totalSponsorship: totalSponsorship,
            totalRecovery: totalRecovery,
            totalExpense: totalExpense,
            totalNet: totalAllIncome - totalExpense
        };
    }

    function renderSummary(summary) {
        totalIncomeElement.textContent = formatMoney(summary.totalSponsorship);
        totalRecoveryElement.textContent = formatMoney(summary.totalRecovery);
        totalExpenseElement.textContent = formatMoney(summary.totalExpense);
        totalNetElement.textContent = formatMoney(summary.totalNet);
        totalNetElement.className = 'value ' + balanceClass(summary.totalNet);
    }

    function monthButton(month, isActive) {
        const count = month._rowCount > 0
            ? '<span class="badge">' + month._rowCount + '</span>'
            : '';

        return [
            '<button class="month-btn' + (isActive ? ' active' : '') + '"',
            ' type="button" data-month="' + escapeHtml(month.id) + '"',
            ' aria-pressed="' + String(isActive) + '">',
            '<span class="micon"><i class="fas fa-calendar-alt" aria-hidden="true"></i></span>',
            '<span class="mname">' + escapeHtml(month.label) + '</span>',
            count,
            '</button>'
        ].join('');
    }

    function tableMarkup(month) {
        const rows = month.rows || [];
        if (rows.length === 0) {
            return [
                '<div class="empty-state">',
                '<i class="fas fa-inbox" aria-hidden="true"></i>',
                '<p>本月暂无流水记录</p>',
                '</div>'
            ].join('');
        }

        const body = rows.map(function (row) {
            const amount = Number.parseFloat(row.amount);
            const tagClass = /^tag-[a-z0-9-]+$/i.test(row.tagClass || '')
                ? row.tagClass
                : 'tag-expense';

            return [
                '<tr>',
                '<td>' + escapeHtml(row.date) + '</td>',
                '<td>' + escapeHtml(row.source || '-') + '</td>',
                '<td><span class="' + amountClass(amount) + '">' + formatAmount(amount) + '</span></td>',
                '<td>' + escapeHtml(row.registrar || '-') + '</td>',
                '<td><span class="tag ' + tagClass + '">' + escapeHtml(row.tag || '-') + '</span></td>',
                '</tr>'
            ].join('');
        }).join('');

        return [
            '<div class="table-wrap">',
            '<div class="table-scroll">',
            '<table>',
            '<thead><tr>',
            '<th scope="col">时间</th>',
            '<th scope="col">来源</th>',
            '<th scope="col">金额</th>',
            '<th scope="col">登记人</th>',
            '<th scope="col">备注</th>',
            '</tr></thead>',
            '<tbody>' + body + '</tbody>',
            '</table>',
            '</div>',
            '<div class="table-footer">',
            '<i class="fas fa-info-circle" aria-hidden="true"></i>',
            '共 ' + rows.length + ' 笔交易 · ',
            '当月收入：<span style="color:#2ECC71;">+' + formatMoney(month._income) + '</span> · ',
            '当月支出：<span style="color:#E74C3C;">-' + formatMoney(month._expense) + '</span> · ',
            '当月净额：<span style="color:' + (month._net >= 0 ? '#2ECC71' : '#E74C3C') + ';">' +
                formatAmount(month._net) + '</span>',
            '</div>',
            '</div>'
        ].join('');
    }

    function renderFinance(months, activeId) {
        const buttons = months.map(function (month) {
            return monthButton(month, month.id === activeId);
        }).join('');

        const options = months.map(function (month) {
            return [
                '<option value="' + escapeHtml(month.id) + '"',
                month.id === activeId ? ' selected' : '',
                '>' + escapeHtml(month.label) + '（' + month._rowCount + ' 笔）</option>'
            ].join('');
        }).join('');

        const panels = months.map(function (month) {
            return [
                '<div class="table-panel' + (month.id === activeId ? ' active' : '') + '"',
                ' data-month="' + escapeHtml(month.id) + '">',
                tableMarkup(month),
                '</div>'
            ].join('');
        }).join('');

        financeContainer.className = 'finance-container';
        financeContainer.innerHTML = [
            '<div class="month-selector" id="monthSelector" aria-label="财务月份">' + buttons + '</div>',
            '<div class="month-selector-mobile">',
            '<div class="select-wrapper">',
            '<label class="sr-only" for="monthSelect">选择财务月份</label>',
            '<select id="monthSelect">' + options + '</select>',
            '<i class="fas fa-chevron-down select-arrow" aria-hidden="true"></i>',
            '</div>',
            '</div>',
            '<div class="table-panels" id="tablePanels" aria-live="polite">' + panels + '</div>'
        ].join('');

        financeContainer.querySelectorAll('.month-btn').forEach(function (button) {
            button.addEventListener('click', function () {
                switchMonth(button.dataset.month);
            });
        });

        const select = document.getElementById('monthSelect');
        if (select) {
            select.addEventListener('change', function () {
                switchMonth(select.value);
            });
        }
    }

    function switchMonth(monthId) {
        if (!monthId || monthId === currentMonthId) return;
        const month = allMonths.find(function (candidate) {
            return candidate.id === monthId;
        });
        if (!month) return;

        currentMonthId = monthId;

        document.querySelectorAll('.month-btn').forEach(function (button) {
            const active = button.dataset.month === monthId;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });

        const select = document.getElementById('monthSelect');
        if (select) select.value = monthId;

        document.querySelectorAll('.table-panel').forEach(function (panel) {
            panel.classList.toggle('active', panel.dataset.month === monthId);
        });

        const url = new URL(window.location.href);
        url.searchParams.set('month', monthId);
        history.replaceState(null, '', url);
    }

    function showError(message, detail) {
        financeContainer.className = 'finance-container error';
        financeContainer.innerHTML = [
            '<i class="fas fa-exclamation-circle" aria-hidden="true"></i>',
            '<p class="error-title"><strong>无法加载财务数据</strong></p>',
            '<p>' + escapeHtml(message) + '</p>',
            detail ? '<div class="error-detail">' + escapeHtml(detail) + '</div>' : '',
            '<button type="button" class="retry-button">',
            '<i class="fas fa-redo" aria-hidden="true"></i> 重新加载',
            '</button>'
        ].join('');
        summaryCards.style.display = 'none';
        const retry = financeContainer.querySelector('.retry-button');
        if (retry) retry.addEventListener('click', init);
    }

    function showLoading() {
        financeContainer.className = 'finance-container loading';
        financeContainer.innerHTML = [
            '<div class="loading-state">',
            '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i>',
            '<p>正在加载财务数据...</p>',
            '</div>'
        ].join('');
    }

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const dividerObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('wide');
            dividerObserver.unobserve(entry.target);
        });
    }, { threshold: 0.3 });

    function revealInitialElements() {
        document.querySelectorAll('.divider').forEach(function (divider) {
            if (!divider.id) return;
            dividerObserver.observe(divider);
        });

        if (reduceMotion && reduceMotion.matches) {
            summaryCards.classList.add('visible');
            financeContainer.classList.add('visible');
            document.querySelectorAll('.divider').forEach(function (divider) {
                divider.classList.add('wide');
            });
            return;
        }

        observer.observe(summaryCards);
        observer.observe(financeContainer);
    }

    async function loadData() {
        const response = await fetch(new URL('../assets/data/funds.json', window.location.href), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText);
        }

        const data = await response.json();
        if (!Array.isArray(data.months) || data.months.length === 0) {
            throw new Error('数据格式错误：缺少 months 数组或数组为空');
        }

        return data;
    }

    async function init() {
        showLoading();
        revealInitialElements();

        try {
            const data = await loadData();
            allMonths = data.months.map(function (month, index) {
                return {
                    ...month,
                    id: month.id || 'month-' + index,
                    label: month.label || month.id || '未命名月份',
                    rows: Array.isArray(month.rows) ? month.rows : []
                };
            });

            const summary = computeSummaries(allMonths);
            renderSummary(summary);

            const requestedMonth = new URLSearchParams(window.location.search).get('month');
            currentMonthId = allMonths.some(function (month) {
                return month.id === requestedMonth;
            }) ? requestedMonth : allMonths[0].id;

            renderFinance(allMonths, currentMonthId);
            summaryCards.style.display = 'flex';

            window.setTimeout(function () {
                observer.observe(summaryCards);
                observer.observe(financeContainer);
            }, 0);
        } catch (error) {
            const detail = error.message.includes('HTTP')
                ? '请确认 assets/data/funds.json 存在且文件可访问。'
                : error.message;
            showError('加载财务数据失败，请稍后重试。', detail);
        }
    }

    init();
})();
