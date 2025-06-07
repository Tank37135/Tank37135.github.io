        var canvas = document.getElementById("canvas")
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