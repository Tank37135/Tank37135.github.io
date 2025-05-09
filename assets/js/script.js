﻿ var canvas = document.getElementById("canvas")
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
        var ctx = canvas.getContext("2d")
        var particlesArray = []
        var count = parseInt(canvas.height / 100 * canvas.width / 100)

        class Particle {
            constructor(x, y) {
                this.x = x
                this.y = y
                this.directionY = 0.5 - Math.random()
                this.directionX = 0.5 - Math.random()
            }
            update() {
                this.y += this.directionY
                this.x += this.directionX
            }
            draw() {
                ctx.beginPath()
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2)
                ctx.fillStyle = "white"
                ctx.fill()
            }
        }

        function createParticle() {
            var x = Math.random() * canvas.width
            var y = Math.random() * canvas.height
            particlesArray.push(new Particle(x, y))
        }

        function handleParticle() {
            for (var i = 0; i < particlesArray.length; i++) {
                var particle = particlesArray[i]
                particle.update()
                particle.draw()
                
                if (particle.x < 0 || particle.x > canvas.width || 
                    particle.y < 0 || particle.y > canvas.height) {
                    particlesArray.splice(i, 1)
                }
                
                for (var j = i; j < particlesArray.length; j++) {
                    let dx = particlesArray[i].x - particlesArray[j].x
                    let dy = particlesArray[i].y - particlesArray[j].y
                    let long = Math.sqrt(dx * dx + dy * dy)
                    
                    if (long < 100) {
                        ctx.beginPath()
                        ctx.strokeStyle = `rgba(255,255,255,${1 - long / 200})`
                        ctx.moveTo(particlesArray[i].x, particlesArray[i].y)
                        ctx.lineTo(particlesArray[j].x, particlesArray[j].y)
                        ctx.lineWidth = 1
                        ctx.stroke()
                    }
                }
            }
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            if (particlesArray.length < count) {
                createParticle()
            }
            handleParticle()
        }

        // 启动动画循环
        setInterval(() => {
            draw()
        }, 1000/60) // 约 60 FPS

        // 窗口大小变化时重置画布
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            count = parseInt(canvas.height / 100 * canvas.width / 100)
        })












let OPT = {
  selector: "#sparks",
  amount: 5000,
  speed: 0.05,
  lifetime: 200,
  direction: {
    x: -0.5,
    y: 1
  },
  size: [2, 2],
  maxopacity: 1,
  color: "150, 150, 150",
  randColor: true,
  acceleration: [5, 40]
};
if (window.innerWidth < 520) {
  OPT.speed = 0.05;
  OPT.color = "150, 150, 150"
}(function spark() {
  const canvas = document.querySelector(OPT.selector);
  const ctx = canvas.getContext("2d");
  let sparks = [];
  window.addEventListener('resize', () => {
    setCanvasWidth()
  });

  function setCanvasWidth() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  function init() {
    setCanvasWidth();
    window.setInterval(() => {
      if (sparks.length < OPT.amount) {
        addSpark()
      }
    }, 1000 / OPT.amount);
    window.requestAnimationFrame(draw)
  }

  function draw() {
    ctx.fillStyle = 'rgba(0,0,0, 0.1)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    sparks.forEach((spark, i, array) => {
      if (spark.opacity <= 0) {
        array.splice(i, 1)
      } else {
        drawSpark(spark)
      }
    });
    window.requestAnimationFrame(draw)
  }

  function Spark(x, y) {
    this.x = x;
    this.y = y;
    this.age = 0;
    this.acceleration = rand(OPT.acceleration[0], OPT.acceleration[1]);
    this.color = OPT.randColor ? rand(0, 255) + "," + rand(0, 255) + "," + rand(0, 255) : OPT.color;
    this.opacity = OPT.maxopacity - this.age / (OPT.lifetime * rand(1, 10));
    this.go = function() {
      this.x += OPT.speed * OPT.direction.x * this.acceleration / 2;
      this.y += OPT.speed * OPT.direction.y * this.acceleration / 2;
      this.opacity = OPT.maxopacity - ++this.age / OPT.lifetime
    }
  }

  function addSpark() {
    let x = rand(-200, window.innerWidth + 200);
    let y = rand(-200, window.innerHeight + 200);
    sparks.push(new Spark(x, y))
  }

  function drawSpark(spark) {
    let x = spark.x,
      y = spark.y;
    spark.go();
    ctx.beginPath();
    ctx.fillStyle = `rgba(${spark.color},${spark.opacity})`;
    ctx.rect(x, y, OPT.size[0], OPT.size[1], 0, 0, Math.PI * 2);
    ctx.fill()
  }
  init()
})();

function updateProgressBars() {
  const now = new Date();
  const seconds = now.getSeconds();
  const minutes = now.getMinutes();
  const hours = now.getHours();
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
  const totalDaysInYear = (new Date(now.getFullYear(), 11, 31) - new Date(now.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24);
  document.getElementById('minuteProgressBar').style.width = `${Math.floor((seconds/60)*100)}%`;
  document.getElementById('minuteProgressBar').innerText = `${Math.floor((seconds/60)*100)}%`;
  document.getElementById('hourProgressBar').style.width = `${Math.floor((minutes/60)*100)}%`;
  document.getElementById('hourProgressBar').innerText = `${Math.floor((minutes/60)*100)}%`;
  document.getElementById('hour24ProgressBar').style.width = `${Math.floor((hours/24)*100)}%`;
  document.getElementById('hour24ProgressBar').innerText = `${Math.floor((hours/24)*100)}%`;
  document.getElementById('yearProgressBar').style.width = `${Math.floor((dayOfYear/totalDaysInYear)*100)}%`;
  document.getElementById('yearProgressBar').innerText = `${Math.floor((dayOfYear/totalDaysInYear)*100)}%`
}
setInterval(updateProgressBars, 1000);
updateProgressBars();



  // 当文档加载完成后执行此函数
  document.addEventListener('DOMContentLoaded', function() {
    // 获取具有特定类的<h3>元素
    var h3Element = document.querySelector('.specific-class');
    // 修改<h3>元素的文本内容
    h3Element.textContent = '已就绪！';
  });
