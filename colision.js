const canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const window_height = window.innerHeight;
const window_width = window.innerWidth;

canvas.height = window_height;
canvas.width = window_width;

const EMOJIS = ["🌸", "🌼", "🌻", "🌺", "🌷"];

class Drop {
  constructor(x, radius) {
    this.radius = radius;
    this.x = x;
    this.y = -this.radius;
    this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    this.gravity = 0.25;
    this.damping = 0.55;
    this.vy = 2 + Math.random() * 2; // velocidad inicial predefinida
  }

  // Desaparece y vuelve a aparecer arriba para tener caída libre nuevamente
  respawn() {
    this.x = Math.random() * (window_width - this.radius * 2) + this.radius;
    this.y = -this.radius; // justo después del margen superior
    this.radius = Math.random() * 15 + 18;
    this.emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    this.vy = 2 + Math.random() * 2;
  }

  update(speedFactor) {
    this.vy += this.gravity * speedFactor;
    this.y += this.vy * speedFactor;

    // Rebote tipo pelota en el borde inferior (pierde fuerza en cada rebote)
    if (this.y + this.radius >= window_height) {
      this.y = window_height - this.radius;
      this.vy = -this.vy * this.damping;

      // Cuando ya casi no rebota, desaparece y vuelve a caer desde arriba
      if (Math.abs(this.vy) < 1.5) {
        this.respawn();
      }
    }
  }

  draw(context) {
    context.font = `${this.radius * 2}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#000"; // respaldo por si el sistema no pinta el emoji a color
    context.fillText(this.emoji, this.x, this.y);
  }

  // Detecta si el punto (mouseX, mouseY) del clic cayó dentro del objeto
  isHit(mouseX, mouseY) {
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    return Math.sqrt(dx * dx + dy * dy) <= this.radius;
  }
}

class Simulation {
  constructor(n) {
    this.drops = [];
    this.removedCount = 0;
    this.generate(n);
  }

  generate(n) {
    for (let i = 0; i < n; i++) {
      const radius = Math.random() * 15 + 18;
      const x = Math.random() * (window_width - radius * 2) + radius;
      const drop = new Drop(x, radius);
      drop.y = -radius - Math.random() * 100; // pequeño escalonado para que no caigan todas a la vez
      this.drops.push(drop);
    }
  }

  // Reglas de velocidad según el contador de objetos eliminados
  get speedFactor() {
    if (this.removedCount > 20) return 2.2; // velocidad alta
    if (this.removedCount > 10) return 1.6; // velocidad media
    return 1; // velocidad inicial
  }

  // Busca el objeto bajo el clic, lo "elimina" (lo repone) y suma al contador
  handleClick(mouseX, mouseY) {
    for (let i = this.drops.length - 1; i >= 0; i--) {
      if (this.drops[i].isHit(mouseX, mouseY)) {
        this.drops[i].respawn();
        this.removedCount++;
        break;
      }
    }
  }

  drawBackground(context) {
    const gradient = context.createLinearGradient(0, 0, 0, window_height);
    gradient.addColorStop(0, "#a1c4fd");
    gradient.addColorStop(1, "#ffd6e8");
    context.fillStyle = gradient;
    context.fillRect(0, 0, window_width, window_height);
  }

  drawCounter(context) {
    context.fillStyle = "#333";
    context.font = "bold 22px Arial";
    context.textAlign = "right";
    context.textBaseline = "top";
    context.fillText(`Eliminados: ${this.removedCount}`, window_width - 20, 20);
  }

  update() {
    const factor = this.speedFactor;
    this.drops.forEach(drop => drop.update(factor));
  }

  draw(context) {
    this.drawBackground(context);
    this.drops.forEach(drop => drop.draw(context));
    this.drawCounter(context);
  }

  animate(context) {
    this.update();
    this.draw(context);
    requestAnimationFrame(() => this.animate(context));
  }
}

const simulation = new Simulation(25);
simulation.animate(ctx);

// Detecta mouseX y mouseY con clic izquierdo para "eliminar" el objeto bajo el cursor
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;
  simulation.handleClick(mouseX, mouseY);
});