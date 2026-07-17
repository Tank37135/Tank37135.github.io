(function() {
  "use strict";
  var canvas = document.getElementById("canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var particles = [];
  var mouse = { x: null, y: null, radius: 120 };
  var animId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var count = Math.floor(Math.min(canvas.width, canvas.height) / 8);
    while (particles.length < count) {
      particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.6, size: Math.random()*2+1, baseSize: Math.random()*2+1 });
    }
    while (particles.length > count) particles.pop();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;
      p.vx *= 0.99; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
      if (mouse.x !== null) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y, dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < mouse.radius && dist > 0) {
          var force = (mouse.radius - dist) / mouse.radius;
          var angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.5;
          p.vy += Math.sin(angle) * force * 0.5;
          p.size = p.baseSize + force * 2;
        } else { p.size += (p.baseSize - p.size) * 0.05; }
      }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill();
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j], dx2 = p.x - p2.x, dy2 = p.y - p2.y, dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
        if (dist2 < 120) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = "rgba(66,165,245," + (1 - dist2/120)*0.35 + ")"; ctx.lineWidth = 0.8; ctx.stroke(); }
      }
    }
    animId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("mousemove", function(e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener("mouseleave", function() { mouse.x = null; mouse.y = null; });
  resize(); draw();
})();
