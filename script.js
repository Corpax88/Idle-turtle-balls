const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 390;
canvas.height = 700;

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Bakgrunn
  ctx.fillStyle = "#102033";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Steam engine i bakgrunnen
  ctx.font = "64px Arial";
  ctx.textAlign = "center";
  ctx.fillText("⚙️", canvas.width / 2, 140);
  ctx.fillText("🏭", canvas.width / 2 - 60, 170);
  ctx.fillText("🏭", canvas.width / 2 + 60, 170);

  // Skilpadde
  ctx.font = "58px Arial";
  ctx.fillText("🐢", canvas.width / 2, 300);

  // Baller
  ctx.font = "32px Arial";
  ctx.fillText("⚪", 120, 430);
  ctx.fillText("⚪", 190, 480);
  ctx.fillText("⚪", 260, 420);

  // Tekst
  ctx.fillStyle = "white";
  ctx.font = "22px Arial";
  ctx.fillText("Idle Turtle Balls v0.1", canvas.width / 2, 640);
}

draw();