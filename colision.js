const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

//Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

canvas.style.background = "#ff8";

const COLLISION_COLOR = "#0000FF";
const FLASH_DURATION = 15; // frames que dura el destello azul

class Circle {
  constructor(x, y, radius, color, text, speed) {
    this.posX = x;
    this.posY = y;
    this.radius = radius;
    this.color = color;
    this.originalColor = color;
    this.text = text;
    this.speed = speed;
    this.flashTimer = 0;

    this.dx = 1 * this.speed;
    this.dy = 1 * this.speed;
  }

  draw(context) {
    context.beginPath();

    context.strokeStyle = this.color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "20px Arial";
    context.fillStyle = this.color;
    context.fillText(this.text, this.posX, this.posY);

    context.lineWidth = 2;
    context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
    context.stroke();
    context.closePath();
  }

  move() {
    // Actualizar la posición X
    this.posX += this.dx;
    if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
      this.dx = -this.dx;
    }

    // Actualizar la posición Y
    this.posY += this.dy;
    if (this.posY + this.radius > window_height || this.posY - this.radius < 0) {
      this.dy = -this.dy;
    }
  }

  // Distancia entre centros (inciso A del Contexto)
  distanceTo(other) {
    return Math.sqrt(
      Math.pow(other.posX - this.posX, 2) + Math.pow(other.posY - this.posY, 2)
    );
  }

  // Cambia de dirección al colisionar (inciso C del Contexto)
  bounce() {
    this.dx = -this.dx;
    this.dy = -this.dy;
  }

  // Destello azul temporal al colisionar
  triggerFlash() {
    this.flashTimer = FLASH_DURATION;
    this.color = COLLISION_COLOR;
  }

  updateFlash() {
    if (this.flashTimer > 0) {
      this.flashTimer--;
      if (this.flashTimer === 0) {
        this.color = this.originalColor;
      }
    }
  }

  update(context) {
    this.move();
    this.updateFlash();
    this.draw(context);
  }
}

class Simulation {
  constructor(n) {
    this.circles = [];
    this.previousCollisions = new Set();
    this.generateCircles(n);
  }

  generateCircles(n) {
    for (let i = 0; i < n; i++) {
      let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
      let x = Math.random() * (window_width - radius * 2) + radius;
      let y = Math.random() * (window_height - radius * 2) + radius;
      let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
      let text = `C${i + 1}`;
      this.circles.push(new Circle(x, y, radius, color, text, speed));
    }
  }

  // Colisión colectiva (inciso B) + cambio de dirección (inciso C)
  detectCollisions() {
    const currentCollisions = new Set();

    for (let i = 0; i < this.circles.length; i++) {
      for (let j = i + 1; j < this.circles.length; j++) {
        const a = this.circles[i];
        const b = this.circles[j];
        const distance = a.distanceTo(b);

        if (distance < a.radius + b.radius) {
          const key = `${i}-${j}`;
          currentCollisions.add(key);

          // Solo rebota al iniciar el contacto, no en cada frame que siguen encimados
          if (!this.previousCollisions.has(key)) {
            a.bounce();
            b.bounce();
            a.triggerFlash();
            b.triggerFlash();
          }
        }
      }
    }

    this.previousCollisions = currentCollisions;
  }

  animate() {
    ctx.clearRect(0, 0, window_width, window_height);
    this.detectCollisions();
    this.circles.forEach(circle => circle.update(ctx));
    requestAnimationFrame(() => this.animate());
  }
}

const simulation = new Simulation(20);
simulation.animate();