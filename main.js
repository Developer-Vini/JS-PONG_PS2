const font = new Font("fonts/PingPong.otf");
const pad = Pads.get(0);
const canvas = Screen.getMode();
canvas.width = 640;
canvas.height = 448;
Screen.setMode(canvas);
let playerScore = 0;
let aiScore = 0;
let gameState = "PLAYING";
class Paddle {
  constructor(x, y, width, height, speed) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
  }
  update(isPlayer) {
    if (isPlayer) {
      if (pad.pressed(Pads.UP)) this.y -= this.speed;
      if (pad.pressed(Pads.DOWN)) this.y += this.speed;
    } else {
      const targetY = ball.y - this.height / 2;
      if (this.y < targetY - 10) {
        this.y += this.speed * 0.7;
      } else if (this.y > targetY + 10) {
        this.y -= this.speed * 0.7;
      }
    }
    this.y = Math.max(0, Math.min(this.y, canvas.height - this.height));
  }
  draw() {
    Draw.rect(this.x, this.y, this.width, this.height, Color.new(255, 255, 255));
  }
}
class Ball {
  constructor() {
    this.reset();
    this.radius = 10;
    this.speed = 6;
  }
  reset() {
    this.x = canvas.width / 2;
    this.y = canvas.height / 2;
    this.dx = (Math.random() > 0.5 ? 1 : -1) * this.speed;
    this.dy = (Math.random() * 2 - 1) * this.speed;
  }
  update() {
    this.x += this.dx;
    this.y += this.dy;
    if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
      this.dy *= -1;
    }
    const hitPlayerPaddle = (
      this.x - this.radius <= player.x + player.width &&
      this.y >= player.y &&
      this.y <= player.y + player.height
    );
    const hitAiPaddle = (
      this.x + this.radius >= ai.x &&
      this.y >= ai.y &&
      this.y <= ai.y + ai.height
    );
    if (hitPlayerPaddle || hitAiPaddle) {
      this.dx *= -1;
      const paddle = hitPlayerPaddle ? player : ai;
      const hitPosition = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
      this.dy = hitPosition * 5;
    }
    if (this.x - this.radius <= 0) {
      aiScore++;
      this.reset();
      if (aiScore >= 5) gameState = "AI_WINS";
    }
    if (this.x + this.radius >= canvas.width) {
      playerScore++;
      this.reset();
      if (playerScore >= 5) gameState = "PLAYER_WINS";
    }
  }

  draw() {
    Draw.circle(this.x, this.y, this.radius, Color.new(255, 255, 255));
  }
}
const player = new Paddle(20, canvas.height / 2 - 50, 10, 100, 5);
const ai = new Paddle(canvas.width - 30, canvas.height / 2 - 50, 10, 100, 5);
const ball = new Ball();
os.setInterval(() => {
  pad.update();
  if (gameState === "PLAYING") {
    player.update(true);
    ai.update(false);    
    ball.update();
  } else {
    if (pad.justPressed(Pads.START)) {
      playerScore = 0;
      aiScore = 0;
      gameState = "PLAYING";
      ball.reset();
    }
  }
  Screen.clear();
  player.draw();
  ai.draw();
  ball.draw();
  font.print(canvas.width / 4, 30, playerScore);
  font.print((canvas.width / 4) * 3, 30, aiScore);
  for (let y = 0; y < canvas.height; y += 20) {
    Draw.rect(canvas.width / 2 - 2, y, 4, 10, Color.new(100, 100, 100));
  }
  if (gameState === "PLAYER_WINS") {
    font.print(canvas.width / 2 - 120, canvas.height / 2, "VOCÊ VENCEU!");
    font.print(canvas.width / 2 - 180, canvas.height / 2 + 30, "Pressione START para jogar novamente");
  } else if (gameState === "AI_WINS") {
    font.print(canvas.width / 2 - 100, canvas.height / 2, "IA VENCEU!");
    font.print(canvas.width / 2 - 180, canvas.height / 2 + 30, "Pressione START para jogar novamente");
  }
  Screen.flip();
}, 0);