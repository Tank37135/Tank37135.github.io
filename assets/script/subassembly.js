(function() {
  "use strict";
  document.addEventListener("DOMContentLoaded", function() {
    initFloatingBar();
    initCodeCopy();
  });

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

  function initCodeCopy() {
    document.addEventListener("click", function(e) {
      var btn = e.target.closest(".code-block__copy-btn");
      if (!btn) return;
      var code = btn.nextElementSibling;
      if (!code) return;
      navigator.clipboard.writeText(code.textContent || "").then(function() {
        var orig = btn.textContent;
        btn.textContent = "✅ 已复制"; btn.classList.add("code-block__copy-btn--copied");
        setTimeout(function() { btn.textContent = orig; btn.classList.remove("code-block__copy-btn--copied"); }, 2000);
      }).catch(function() {
        btn.textContent = "复制失败";
        setTimeout(function() { btn.textContent = "复制"; }, 2000);
      });
    });
  }
})();
