(function() {
  "use strict";

  document.addEventListener("DOMContentLoaded", function() {
    initNav();
    initTypewriter();
    initCardTilt();
    initScrollEffects();
    initSearch();
    initTagFilter();
    initCategoryFilter();
  });

  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav__toggle");
    var menu = document.querySelector(".nav__menu");
    var links = document.querySelectorAll(".nav__link");

    window.addEventListener("scroll", function() {
      if (window.pageYOffset > 80) nav.classList.add("nav--scrolled");
      else nav.classList.remove("nav--scrolled");
    }, { passive: true });

    if (toggle && menu) {
      toggle.addEventListener("click", function(e) {
        e.stopPropagation();
        toggle.classList.toggle("nav__toggle--active");
        menu.classList.toggle("nav__menu--open");
        document.body.style.overflow = menu.classList.contains("nav__menu--open") ? "hidden" : "";
      });
      links.forEach(function(l) { l.addEventListener("click", function() {
        toggle.classList.remove("nav__toggle--active");
        menu.classList.remove("nav__menu--open");
        document.body.style.overflow = "";
      }); });
      document.addEventListener("click", function(e) {
        if (!nav.contains(e.target) && menu.classList.contains("nav__menu--open")) {
          toggle.classList.remove("nav__toggle--active");
          menu.classList.remove("nav__menu--open");
          document.body.style.overflow = "";
        }
      });
    }
  }

  function initTypewriter() {
    var el = document.getElementById("typewriter-text");
    if (!el) return;
    var sentences = [getGreeting(), "记录生活，分享技术", "用代码构建数字世界", "每一天都是新的冒险", "保持好奇，持续学习", "Also try Minecraft"];
    var si = 0, ci = 0, del = false, pause = false;

    function getGreeting() {
      var h = new Date().getHours();
      if (h >= 5 && h < 12) return "早上好，开始新的一天吧";
      if (h >= 12 && h < 14) return "中午好，记得吃午餐哦";
      if (h >= 14 && h < 18) return "下午好，出去活动一下吧";
      if (h >= 18 && h < 22) return "晚上好，记得准时休息哦";
      return "夜深了，早点休息吧";
    }

    function type() {
      if (pause) return;
      var txt = sentences[si];
      if (del) {
        if (ci > 0) { ci--; el.textContent = txt.substring(0, ci); setTimeout(type, 30 + Math.random()*20); }
        else { del = false; si = (si + 1) % sentences.length; setTimeout(type, 200); }
      } else {
        if (ci < txt.length) { ci++; el.textContent = txt.substring(0, ci); setTimeout(type, 60 + Math.random()*40); }
        else { pause = true; setTimeout(function() { pause = false; del = true; type(); }, 3000); }
      }
    }
    type();
  }

  function initCardTilt() {
    function bindTilt(card) {
      if (card.getAttribute("data-tilt") === "false") return;
      if (card._tiltBound) return;
      card._tiltBound = true;
      card.addEventListener("mousemove", function(e) {
        var r = card.getBoundingClientRect();
        var x = e.clientX - r.left, y = e.clientY - r.top;
        var cx = r.width / 2, cy = r.height / 2;
        card.style.transform = "perspective(1000px) rotateX(" + ((y-cy)/cy*-8) + "deg) rotateY(" + ((x-cx)/cx*8) + "deg) translateZ(10px)";
        card.style.transition = "none";
      });
      card.addEventListener("mouseleave", function() {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)";
        card.style.transition = "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)";
      });
    }
    // 绑定已有卡片
    document.querySelectorAll(".card, .article-card").forEach(bindTilt);
    // 监听动态添加的卡片
    var obs = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(n) {
          if (n.nodeType === 1) {
            if (n.matches && (n.matches(".card") || n.matches(".article-card"))) bindTilt(n);
            if (n.querySelectorAll) n.querySelectorAll(".card, .article-card").forEach(bindTilt);
          }
        });
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }

  function initScrollEffects() {
    // 等待遮罩淡出后再启动入场动画
    var lo = document.getElementById("loadingOverlay");
    function tryStart() {
      if (!lo || lo.classList.contains("loading-overlay--hidden") || window.getComputedStyle(lo).display === "none" || window.getComputedStyle(lo).opacity === "0") {
        startEntrance();
      } else {
        setTimeout(tryStart, 100);
      }
    }
    function startEntrance() {
      // 选择各类页面的主要内容块
      var selectors = [
        ".hero__content",           // 首页 Hero
        ".section__header",         // 首页 Section 标题
        ".card",                    // 首页/分类页 卡片
        ".article-card",            // 文章/工具 卡片
        ".search-container",        // 搜索框
        ".articles-container"       // 文章列表容器
      ];
      var els = document.querySelectorAll(selectors.join(", "));
      // 兜底：无卡片类的页面（文章详情、工具详情等）动画主容器
      if (els.length === 0) {
        var fallback = document.querySelectorAll("main, article, .blog-post, .content-area");
        if (fallback.length > 0) els = fallback;
      }
      if (els.length === 0) return;
      // 设置初始隐藏状态
      els.forEach(function(el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
      });
      void document.body.offsetHeight;
      // 设置过渡
      els.forEach(function(el) {
        el.style.transition = "opacity 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)";
      });
      if ("IntersectionObserver" in window) {
        var obs = new IntersectionObserver(function(entries) {
          entries.forEach(function(e) {
            if (e.isIntersecting) { e.target.style.opacity = "1"; e.target.style.transform = "translateY(0)"; obs.unobserve(e.target); }
          });
        }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
        els.forEach(function(el) { obs.observe(el); });
      } else {
        els.forEach(function(el) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
      }
    }    setTimeout(tryStart, 100);
  }

  function initSearch() {
    var input = document.getElementById("search");
    var container = document.getElementById("articleResults");
    if (!input || !container) return;
    
    function bindSearch() {
      var noResults = container.querySelector(".no-results");
      if (!noResults) {
        noResults = document.createElement("div");
        noResults.className = "no-results";
        noResults.innerHTML = "<div class=\"no-results__icon\"></div><p>没有找到匹配的内容</p>";
        noResults.style.display = "none";
        container.appendChild(noResults);
      }
    }
    
    // 监听动态添加的卡片
    var observer = new MutationObserver(function() {
      bindSearch();
    });
    observer.observe(container, { childList: true });
    
    input.addEventListener("input", function() {
      var q = this.value.toLowerCase().trim();
      var cards = container.querySelectorAll(".card, .article-card");
      bindSearch();
      var noResults = container.querySelector(".no-results");
      var found = false;
      cards.forEach(function(c) {
        if (!q) { c.style.display = "block"; found = true; return; }
        var t = (c.querySelector(".card__title") || c.querySelector(".article-title") || {}).textContent || "";
        var e = (c.querySelector(".card__excerpt") || c.querySelector(".article-excerpt") || {}).textContent || "";
        var tg = c.getAttribute("data-tags") || "";
        var match = t.toLowerCase().indexOf(q) !== -1 || e.toLowerCase().indexOf(q) !== -1 || tg.toLowerCase().indexOf(q) !== -1;
        c.style.display = match ? "block" : "none";
        if (match) found = true;
      });
      if (noResults) noResults.style.display = found || !q ? "none" : "block";
    });
  }

  function initTagFilter() {
    document.addEventListener("click", function(e) {
      var tag = e.target.closest(".tag");
      if (!tag) return;
      var input = document.getElementById("search");
      if (input) { e.preventDefault(); input.value = tag.textContent.trim(); input.dispatchEvent(new Event("input")); }
    });
  }

  function initCategoryFilter() {
    var btns = document.querySelectorAll(".articles-categories__btn");
    if (btns.length === 0) return;
    btns.forEach(function(btn) {
      btn.addEventListener("click", function() {
        btns.forEach(function(b) { b.classList.remove("articles-categories__btn--active"); });
        this.classList.add("articles-categories__btn--active");
        var cat = this.getAttribute("data-cat");
        document.querySelectorAll(".articles-grid .card").forEach(function(c) {
          c.style.display = (cat === "all" || c.getAttribute("data-category") === cat) ? "block" : "none";
        });
      });
    });
  }
})();
