(function () {
    'use strict';

    const PAGE_SIZE = 50;
    const dateTimeFormatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    const banTypes = {
        login_restriction: '限制登录',
        inventory_clear: '清空背包',
        warning: '警告'
    };

    const unbanTypes = {
        appeal_success: '申诉成功',
        time_reached: '时长已满'
    };

    const searchForm = document.getElementById('banSearchForm');
    const searchInput = document.getElementById('banSearch');
    const searchClear = document.getElementById('banSearchClear');
    const resultSummary = document.getElementById('banResultSummary');
    const stateContainer = document.getElementById('banState');
    const tableWrap = document.getElementById('banTableWrap');
    const tableBody = document.getElementById('banTableBody');
    const pagination = document.getElementById('banPagination');
    const previousButton = document.getElementById('banPrev');
    const nextButton = document.getElementById('banNext');
    const pageInfo = document.getElementById('banPageInfo');
    const openReportButton = document.getElementById('openBanReport');
    const reportDialog = document.getElementById('banReportDialog');
    const reportForm = document.getElementById('banReportForm');
    const reportError = document.getElementById('banReportError');
    const reportPlayer = document.getElementById('reportPlayer');

    let records = [];
    let filteredRecords = [];
    let currentPage = 1;
    let searchTimer = null;
    let reportTrigger = null;

    const reportTypeLabels = {
        cheating: '使用外挂或作弊',
        griefing: '破坏或偷窃',
        harassment: '骚扰或刷屏',
        other: '其他违规'
    };

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function formatDateTime(value) {
        if (!value) return '';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '—';

        return dateTimeFormatter.format(date).replaceAll('/', '-');
    }

    function sanctionLabel(value) {
        return banTypes[value] || value || '未注明';
    }

    function unbanLabel(value) {
        return unbanTypes[value] || '—';
    }

    function searchableText(record) {
        return [
            record.playerId,
            record.reason,
            record.operator,
            ...(Array.isArray(record.banTypes) ? record.banTypes.map(sanctionLabel) : []),
            record.unbanType ? unbanLabel(record.unbanType) : ''
        ].join(' ').toLocaleLowerCase('zh-CN');
    }

    function updateUrl() {
        const url = new URL(window.location.href);
        const query = searchInput.value.trim();
        const pages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));

        if (query) {
            url.searchParams.set('q', query);
        } else {
            url.searchParams.delete('q');
        }

        if (currentPage > 1 && currentPage <= pages) {
            url.searchParams.set('page', String(currentPage));
        } else {
            url.searchParams.delete('page');
        }

        history.replaceState(null, '', url);
    }

    function renderEmpty(title, message) {
        tableWrap.hidden = true;
        pagination.hidden = true;
        stateContainer.hidden = false;
        stateContainer.innerHTML = [
            '<div class="ban-empty">',
            '<i class="fas fa-inbox" aria-hidden="true"></i>',
            '<h3>' + escapeHtml(title) + '</h3>',
            '<p>' + escapeHtml(message) + '</p>',
            '</div>'
        ].join('');
    }

    function renderError(message) {
        tableWrap.hidden = true;
        pagination.hidden = true;
        stateContainer.hidden = false;
        stateContainer.innerHTML = [
            '<div class="ban-error" role="alert">',
            '<strong>无法加载封禁记录</strong>',
            '<p>' + escapeHtml(message) + '</p>',
            '<button class="retry-button" type="button"><i class="fas fa-redo" aria-hidden="true"></i> 重新加载</button>',
            '</div>'
        ].join('');

        const retry = stateContainer.querySelector('.retry-button');
        retry.addEventListener('click', loadRecords);
        resultSummary.textContent = '封禁记录加载失败。';
    }

    function renderTable() {
        const pages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
        currentPage = Math.min(Math.max(currentPage, 1), pages);
        const start = (currentPage - 1) * PAGE_SIZE;
        const pageRecords = filteredRecords.slice(start, start + PAGE_SIZE);

        tableBody.innerHTML = pageRecords.map(function (record) {
            const isActive = record.status === 'active';
            const playerClass = isActive ? 'ban-player--active' : 'ban-player--lifted';
            const actions = Array.isArray(record.banTypes) ? record.banTypes : [];
            const actionTags = actions.length > 0
                ? actions.map(function (action) {
                    return '<span class="sanction-tag">' + escapeHtml(sanctionLabel(action)) + '</span>';
                }).join('')
                : '<span class="unban-method">未注明</span>';
            const unbanTime = record.unbanAt ? formatDateTime(record.unbanAt) : '永不';
            const unbanMethod = record.unbanType
                ? '<span class="unban-method unban-method--resolved">' + escapeHtml(unbanLabel(record.unbanType)) + '</span>'
                : '<span class="unban-method">—</span>';

            return [
                '<tr>',
                '<td>',
                '<span class="ban-player ' + playerClass + '">' + escapeHtml(record.playerId) + '</span>',
                '</td>',
                '<td>' + escapeHtml(formatDateTime(record.bannedAt)) + '</td>',
                '<td>' + escapeHtml(unbanTime) + '</td>',
                '<td><div class="sanction-tags">' + actionTags + '</div></td>',
                '<td>' + unbanMethod + '</td>',
                '<td>' + escapeHtml(record.reason) + '</td>',
                '<td>' + escapeHtml(record.operator) + '</td>',
                '</tr>'
            ].join('');
        }).join('');

        stateContainer.hidden = true;
        tableWrap.hidden = false;
        pagination.hidden = false;
        pageInfo.textContent = '第 ' + currentPage + ' / ' + pages + ' 页';
        previousButton.disabled = currentPage <= 1;
        nextButton.disabled = currentPage >= pages;
        resultSummary.textContent =
            '找到 ' + filteredRecords.length + ' 条记录，第 ' + currentPage + ' / ' + pages + ' 页。';
    }

    function applySearch(resetPage) {
        const query = searchInput.value.trim().toLocaleLowerCase('zh-CN');
        searchClear.hidden = query.length === 0;
        filteredRecords = query
            ? records.filter(function (record) {
                return searchableText(record).includes(query);
            })
            : records.slice();
        if (resetPage !== false) {
            currentPage = 1;
        }

        if (records.length === 0) {
            renderEmpty('暂无封禁记录', '当前没有公开的封禁记录。');
            resultSummary.textContent = '共 0 条封禁记录。';
        } else if (filteredRecords.length === 0) {
            renderEmpty('没有匹配记录', '请尝试其他玩家 ID、原因或操作人关键词。');
            resultSummary.textContent = '没有找到匹配的封禁记录。';
        } else {
            renderTable();
        }

        updateUrl();
    }

    function normalizeRecord(record, index) {
        return {
            id: record.id || 'ban-' + index,
            playerId: String(record.playerId || '').trim(),
            bannedAt: record.bannedAt || '',
            unbanAt: record.unbanAt || null,
            status: record.status === 'lifted' ? 'lifted' : 'active',
            banTypes: Array.isArray(record.banTypes) ? record.banTypes : [],
            unbanType: record.unbanType || null,
            reason: String(record.reason || '未注明'),
            operator: String(record.operator || '未注明')
        };
    }

    function buildReportMailto(data) {
        const subject = '潮汐回响玩家举报 - ' + data.playerId;
        const lines = [
            '被举报玩家 ID：' + data.playerId,
            '违规类型：' + reportTypeLabels[data.reportType],
            '发生时间：' + (data.occurredAt ? data.occurredAt.replace('T', ' ') : '未提供'),
            '详细说明：',
            data.details,
            '',
            '证据链接：' + (data.evidence || '未提供'),
            '',
            '提交时间：' + new Intl.DateTimeFormat('zh-CN', {
                timeZone: 'Asia/Shanghai',
                dateStyle: 'medium',
                timeStyle: 'medium'
            }).format(new Date()),
            '此邮件由潮汐回响封禁列表举报表单生成。'
        ];

        return 'mailto:Tank37135@outlook.com?subject=' +
            encodeURIComponent(subject) +
            '&body=' +
            encodeURIComponent(lines.join('\n'));
    }

    function openReportDialog() {
        reportTrigger = document.activeElement;
        reportForm.reset();
        reportError.hidden = true;
        reportError.textContent = '';
        document.body.classList.add('report-open');

        if (typeof reportDialog.showModal === 'function') {
            reportDialog.showModal();
        } else {
            reportDialog.setAttribute('open', '');
        }

        requestAnimationFrame(function () {
            reportPlayer.focus();
        });
    }

    function closeReportDialog() {
        if (reportDialog.open && typeof reportDialog.close === 'function') {
            reportDialog.close();
        } else {
            reportDialog.removeAttribute('open');
            document.body.classList.remove('report-open');
            if (reportTrigger) reportTrigger.focus();
        }
    }

    function reportFieldValues() {
        const selectedType = reportForm.querySelector('input[name="reportType"]:checked');
        return {
            playerId: reportForm.elements.reportPlayer.value.trim(),
            reportType: selectedType ? selectedType.value : '',
            occurredAt: reportForm.elements.reportOccurredAt.value,
            details: reportForm.elements.reportDetails.value.trim(),
            evidence: reportForm.elements.reportEvidence.value.trim()
        };
    }

    async function loadRecords() {
        stateContainer.hidden = false;
        tableWrap.hidden = true;
        pagination.hidden = true;
        resultSummary.textContent = '正在加载封禁记录...';
        stateContainer.innerHTML = [
            '<div class="loading-state">',
            '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i>',
            '<p>正在加载封禁记录...</p>',
            '</div>'
        ].join('');

        try {
            const response = await fetch(new URL('../assets/data/bans.json', window.location.href), {
                cache: 'no-store'
            });
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }

            const data = await response.json();
            if (!Array.isArray(data.records)) {
                throw new Error('数据格式错误：缺少 records 数组');
            }

            records = data.records
                .map(normalizeRecord)
                .filter(function (record) {
                    return record.playerId.length > 0;
                })
                .sort(function (left, right) {
                    return new Date(right.bannedAt).getTime() - new Date(left.bannedAt).getTime();
                });

            applySearch(false);
        } catch (error) {
            renderError(error.message);
        }
    }

    function goToPage(page) {
        const pages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
        const nextPage = Math.min(Math.max(page, 1), pages);
        if (nextPage === currentPage) return;
        currentPage = nextPage;
        renderTable();
        updateUrl();
        document.getElementById('bans').scrollIntoView({
            behavior: window.TidalUI && window.TidalUI.reduceMotion.matches ? 'auto' : 'smooth',
            block: 'start'
        });
    }

    const initialParams = new URLSearchParams(window.location.search);
    searchInput.value = initialParams.get('q') || '';
    currentPage = Math.max(1, Number.parseInt(initialParams.get('page') || '1', 10) || 1);

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        applySearch(true);
    });

    searchInput.addEventListener('input', function () {
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(applySearch, 180);
    });

    searchClear.addEventListener('click', function () {
        searchInput.value = '';
        searchInput.focus();
        applySearch(true);
    });

    previousButton.addEventListener('click', function () {
        goToPage(currentPage - 1);
    });

    nextButton.addEventListener('click', function () {
        goToPage(currentPage + 1);
    });

    openReportButton.addEventListener('click', openReportDialog);

    reportDialog.querySelectorAll('[data-report-close]').forEach(function (button) {
        button.addEventListener('click', closeReportDialog);
    });

    reportDialog.addEventListener('click', function (event) {
        if (event.target === reportDialog) {
            closeReportDialog();
        }
    });

    reportDialog.addEventListener('close', function () {
        document.body.classList.remove('report-open');
        if (reportTrigger) {
            reportTrigger.focus();
            reportTrigger = null;
        }
    });

    reportForm.addEventListener('input', function () {
        reportError.hidden = true;
        reportForm.querySelectorAll('[aria-invalid="true"]').forEach(function (field) {
            field.removeAttribute('aria-invalid');
        });
    });

    reportForm.addEventListener('submit', function (event) {
        event.preventDefault();
        reportError.hidden = true;

        if (!reportForm.checkValidity()) {
            const firstInvalid = reportForm.querySelector(':invalid');
            reportError.textContent = '请补全必填项，并检查玩家 ID 和证据链接的格式。';
            reportError.hidden = false;
            reportForm.querySelectorAll(':invalid').forEach(function (field) {
                field.setAttribute('aria-invalid', 'true');
            });
            if (firstInvalid) {
                firstInvalid.focus();
                firstInvalid.reportValidity();
            }
            return;
        }

        const mailto = buildReportMailto(reportFieldValues());
        const mailLink = document.createElement('a');
        mailLink.href = mailto;
        mailLink.hidden = true;
        document.body.appendChild(mailLink);
        mailLink.click();
        mailLink.remove();

        if (window.TidalUI) {
            window.TidalUI.notify('举报邮件已生成，请在邮件客户端中确认发送。');
        }
        closeReportDialog();
    });

    window.TidalBanReport = {
        buildMailto: buildReportMailto
    };

    loadRecords();
})();
