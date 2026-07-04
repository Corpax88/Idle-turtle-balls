const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 390;
canvas.height = 700;

const turtle = {
  x: canvas.width / 2,
  y: 255,
  radius: 38
};

const balls = [
  { x: 120, y: 430, vx: 2.1, vy: -2.4, r: 18 },
  { x: 210, y: 500, vx: -2.5, vy: -1.8, r: 18 },
  { x: 280, y: 420, vx: -1.8, vy: 2.2, r: 18 }
];

let money = Number(localStorage.getItem("money")) || 0;

function drawBackground() {
  ctx.fillStyle = "#102033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("⚙️", canvas.width / 2, 125);
  ctx.fillText("🏭", canvas.width / 2 - 60, 160);
  ctx.fillText("🏭", canvas.width / 2 + 60, 160);
}

function drawTurtle() {
  ctx.font = "58px Arial";
  ctx.textAlign = "center";
  ctx.fillText("🐢", turtle.x, turtle.y);
}

function drawBalls() {
  for (const ball of balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#d8d8d8";
    ctx.lineWidth = 3;
    ctx.stroke();
  }
}

function updateBalls() {
  for (const ball of balls) {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.x < ball.r || ball.x > canvas.width - ball.r) {
      ball.vx *= -1;
    }

    if (ball.y < ball.r || ball.y > canvas.height - ball.r) {
      ball.vy *= -1;
    }

    const dx = ball.x - turtle.x;
    const dy = ball.y - turtle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball.r + turtle.radius) {
      ball.vx *= -1;
      ball.vy *= -1;
      money += 1;
localStorage.setItem("money", money);
    }
  }
}

function drawUI() {
  ctx.fillStyle = "white";
  ctx.font = "24px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`💰 ${money}`, 20, 40);

  ctx.font = "18px Arial";
  ctx.fillText("v0.2 - Moving Balls", 20, 660);
}

function gameLoop() {
  updateBalls();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawBackground();
  drawTurtle();
  drawBalls();
  drawUI();

  requestAnimationFrame(gameLoop);
}

gameLoop();