(function() {
  "use strict";

  // ── 全局 copyCode 函数（供 onclick="copyCode(this)" 调用） ──
  window.copyCode = function(btn) {
    var pre = btn.nextElementSibling;
    var codeEl = pre && pre.tagName === "PRE" ? pre.querySelector("code") : pre;
    var text = codeEl ? codeEl.textContent || "" : "";
    doCopy(btn, text);
  };

  // ── 统一的复制逻辑 ──
  function doCopy(btn, text) {
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = "✅ 已复制";
      btn.classList.add("code-block__copy-btn--copied");
      setTimeout(function() {
        btn.textContent = orig;
        btn.classList.remove("code-block__copy-btn--copied");
      }, 2000);
    }).catch(function() {
      btn.textContent = "❌ 复制失败";
      setTimeout(function() {
        btn.textContent = "复制";
      }, 2000);
    });
  }

  // ── 事件委托：支持 .code-block__copy-btn 点击 ──
  function initCodeCopy() {
    document.addEventListener("click", function(e) {
      var btn = e.target.closest(".code-block__copy-btn");
      if (!btn) return;
      var pre = btn.nextElementSibling;
      var codeEl = pre && pre.tagName === "PRE" ? pre.querySelector("code") : pre;
      var text = codeEl ? codeEl.textContent || "" : "";
      doCopy(btn, text);
    });
  }

  // ── 回到顶部/底部 ──
  function initFloatingBar() {
    var topBtn = document.getElementById("toTopBtn");
    var btmBtn = document.getElementById("toBottomBtn");
    if (!topBtn || !btmBtn) return;
    window.addEventListener("scroll", function() {
      var y = window.pageYOffset, dh = document.documentElement.scrollHeight, wh = window.innerHeight;
      if (y > 300) topBtn.classList.remove("float-bar__btn--hidden"); else topBtn.classList.add("float-bar__btn--hidden");
      if (y + wh >= dh - 100) btmBtn.classList.add("float-bar__btn--hidden"); else btmBtn.classList.remove("float-bar__btn--hidden");
    }, { passive: true });
    topBtn.addEventListener("click", function() { window.scrollTo({ top: 0, behavior: "smooth" }); });
    btmBtn.addEventListener("click", function() { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); });
  }

  document.addEventListener("DOMContentLoaded", function() {
    initFloatingBar();
    initCodeCopy();
  });
})();
