(function () {
    'use strict';

    const typeLabels = {
        milestone: '里程碑',
        event: '社区活动',
        maintenance: '维护'
    };

    const summary = document.getElementById('archiveSummary');
    const state = document.getElementById('archiveState');
    const timeline = document.getElementById('archiveTimeline');
    const reduceMotion = window.TidalUI
        ? window.TidalUI.reduceMotion
        : window.matchMedia('(prefers-reduced-motion: reduce)');

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function parseDate(value) {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? null : date;
    }

    function formatDisplayDate(value) {
        const date = parseDate(value);
        if (!date) return '日期待确认';

        return new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(date).replaceAll('/', '-');
    }

    function showEmpty() {
        timeline.hidden = true;
        state.hidden = false;
        state.innerHTML = [
            '<div class="archive-empty">',
            '<i class="fas fa-box-archive" aria-hidden="true"></i>',
            '<h3>暂无公开事件</h3>',
            '<p>服务器历史事件尚未录入，后续会在这里按时间整理。</p>',
            '</div>'
        ].join('');
        summary.textContent = '暂无历史事件。';
    }

    function showError(message) {
        timeline.hidden = true;
        state.hidden = false;
        state.innerHTML = [
            '<div class="archive-error" role="alert">',
            '<strong>无法加载历史归档</strong>',
            '<p>' + escapeHtml(message) + '</p>',
            '<button class="archive-retry" type="button"><i class="fas fa-redo" aria-hidden="true"></i> 重新加载</button>',
            '</div>'
        ].join('');
        summary.textContent = '历史归档加载失败。';
        state.querySelector('.archive-retry').addEventListener('click', loadEvents);
    }

    function activateTimelineMotion() {
        const items = Array.from(timeline.querySelectorAll('.archive-year, .archive-event'));

        if (reduceMotion.matches || !('IntersectionObserver' in window)) {
            items.forEach(function (item) {
                item.classList.add('is-visible');
            });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -32px 0px'
        });

        items.forEach(function (item) {
            observer.observe(item);
        });
    }

    function renderEvents(events) {
        const validEvents = events
            .map(function (event, index) {
                return {
                    id: event.id || 'event-' + index,
                    date: parseDate(event.date),
                    rawDate: event.date || '',
                    title: String(event.title || '未命名事件'),
                    summary: String(event.summary || ''),
                    type: typeLabels[event.type] ? event.type : 'event'
                };
            })
            .filter(function (event) {
                return event.date !== null;
            })
            .sort(function (left, right) {
                return right.date.getTime() - left.date.getTime();
            });

        if (validEvents.length === 0) {
            showEmpty();
            return;
        }

        const groups = validEvents.reduce(function (result, event) {
            const year = new Intl.DateTimeFormat('zh-CN', {
                timeZone: 'Asia/Shanghai',
                year: 'numeric'
            }).format(event.date).replace('年', '');
            if (!result[year]) result[year] = [];
            result[year].push(event);
            return result;
        }, {});

        timeline.innerHTML = Object.keys(groups)
            .sort(function (left, right) {
                return Number(right) - Number(left);
            })
            .map(function (year) {
                const items = groups[year].map(function (event) {
                    return [
                        '<article class="archive-event">',
                        '<div class="archive-event__meta">',
                        '<time class="archive-event__date" datetime="' + escapeHtml(event.rawDate) + '">' +
                            escapeHtml(formatDisplayDate(event.rawDate)) + '</time>',
                        '<span class="archive-event__type archive-event__type--' + event.type + '">' +
                            escapeHtml(typeLabels[event.type]) + '</span>',
                        '</div>',
                        '<h4>' + escapeHtml(event.title) + '</h4>',
                        '<p>' + escapeHtml(event.summary) + '</p>',
                        '</article>'
                    ].join('');
                }).join('');

                return [
                    '<section class="archive-year" aria-labelledby="archive-year-' + year + '">',
                    '<h3 class="archive-year__title" id="archive-year-' + year + '">' + year + '</h3>',
                    '<div class="archive-events">' + items + '</div>',
                    '</section>'
                ].join('');
            }).join('');

        state.hidden = true;
        timeline.hidden = false;
        summary.textContent = '共记录 ' + validEvents.length + ' 个历史事件。';
        activateTimelineMotion();
    }

    async function loadEvents() {
        state.hidden = false;
        timeline.hidden = true;
        summary.textContent = '正在加载历史事件...';
        state.innerHTML = [
            '<div class="loading-state">',
            '<i class="fas fa-spinner fa-pulse" aria-hidden="true"></i>',
            '<p>正在加载历史事件...</p>',
            '</div>'
        ].join('');

        try {
            const response = await fetch(new URL('../assets/data/history.json', window.location.href), {
                cache: 'no-store'
            });
            if (!response.ok) {
                throw new Error('HTTP ' + response.status + ': ' + response.statusText);
            }

            const data = await response.json();
            if (!Array.isArray(data.events)) {
                throw new Error('数据格式错误：缺少 events 数组');
            }

            renderEvents(data.events);
        } catch (error) {
            showError(error.message);
        }
    }

    loadEvents();
})();
