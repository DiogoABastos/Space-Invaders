const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function drawRect(x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawText(text, x, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `${size}px Arial`;
  ctx.fillText(text, x, y);
}

const gameVars = {
  framesSec: 30,
  frames: 0
}

const state = {
  current: 0,
  active: 1,
  start: 0,
  game: 1,
  level: { first: 1, second: 2, third: 3, forth: 4, last: 4 },
  end: 3,
  getReady: 4
}

const start = {
  x: canvas.width / 2 - 100,
  y: canvas.height / 2 + 20,
  x2: canvas.width / 2 - 50,
  y2: canvas.height / 2 + 50,
  color: 'white',
  size: 20,

  draw() {
    if (state.current === state.start) {
      drawText('Try reach the last Level', this.x, this.y, this.size, this.color);
      drawText('Click to start', this.x2, this.y2, this.size, this.color);
    }
  }
}

const end = {
  x: canvas.width / 2 - 100,
  y: canvas.height / 2 + 20,
  message: '',
  color: 'white',
  size: 20,

  draw() {
    if (state.current === state.end) {
      drawText(`${this.message} Click to restart`, this.x, this.y, this.size, this.color);
    }
  }
}

const getReady = {
  x: canvas.width / 2 - 70,
  y: canvas.height / 2 - 20,
  color: 'white',
  size: 30,

  draw() {
    if (state.current === state.getReady) {
      const message = state.active === state.level.last ? 'Last Level' : `Level ${state.active} of ${state.level.last}`;
      drawText(message, this.x, this.y, this.size, this.color);
      setTimeout(() => {
        state.current = state.game;
      }, 1500);
    }
  }
}

const player = {
  x: canvas.width / 2 - 20,
  y: canvas.height - 10,
  w: 40,
  h: 10,
  color: 'white',
  bullets: [],
  bulletSpeed: -5,
  speed: 0,

  move(speed) {
    this.speed = speed;
  },

  fire() {
    const bullet = new Bullet(this.x + this.w / 2, this.y + this.h / 2, 3, 5, this.bulletSpeed, this.color);
    this.bullets.push(bullet);
  },

  update() {
    if (state.current === state.game) {
      this.x += this.speed;

      if (this.x + this.w / 2 < 0) {
        this.x = 0 - this.w / 2;
      } else if (this.x + this.w / 2 > canvas.width) {
        this.x = canvas.width - this.w / 2;
      }

      enemies.bullets.forEach(bullet => {
        if (collide(this, bullet)) {
          end.message = 'You lost!';
          state.active = state.level.first;
          state.current = state.end;
        }
      });

      this.bullets.forEach(bullet => {
        bullet.update();
        if (bullet.y < 0) {
          this.bullets.splice(this.bullets.findIndex(b => b === bullet), 1);
        }

        enemies.active().forEach(enemy => {
          if (collide(bullet, enemy)) {
            enemies.active().splice(enemies.active().findIndex(e => e === enemy), 1);
            this.bullets.splice(this.bullets.findIndex(b => b === bullet), 1);
          }
        });
      });
    }
  },

  draw() {
    if (state.current !== state.getReady) {
      drawRect(this.x, this.y, this.w, this.h, this.color);

      this.bullets.forEach(bullet => {
        bullet.draw();
      });
    }
  },

  restart() {
    this.x = canvas.width / 2 - 20;
    this.y = canvas.height - 10;
    this.w = 40;
    this.h = 10;
    this.bullets = [];
    this.bulletSpeed = -5;
    this.speed = 0;
  }
}

function handleKeydown(e) {
  const left = 37;
  const right = 39;
  const speed = 5;

  if (e.keyCode === left) {
    player.move(-speed);
  } else if (e.keyCode === right) {
    player.move(speed);
  }
}

function handleKeyup(e) {
  const left = 37;
  const right = 39;
  const space = 32;

  if (e.keyCode === left || e.keyCode === right) {
    player.move(0);
  } else if (e.keyCode === space) {
    player.fire();
  }
}

function handleClick() {
  if (state.current === state.start) {
    state.current = state.game;
  } else if (state.current === state.end) {
    player.restart();
    enemies.restart();
    state.current = state.start;
  }
}

window.addEventListener('keydown', handleKeydown);
window.addEventListener('keyup', handleKeyup);
canvas.addEventListener('click', handleClick);

function collide(a, b) {
  const aTop = a.y;
  const aBot = a.y + a.h;
  const aLeft = a.x;
  const aRight = a.x + a.w;
  const bTop = b.y;
  const bBot = b.y + b.h;
  const bLeft = b.x;
  const bRight = b.x + b.w;

  return aLeft < bRight && aRight > bLeft && aTop < bBot && aBot > bTop;
}

function Bullet(x, y, w, h, speed, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
  this.speed = speed;
  this.xSpeed = 1;

  this.update = function() {
    this.y += this.speed;

    if (state.active === state.level.forth) {
      this.x += this.xSpeed;
      if (this.x > canvas.width || this.x < 0) {
        this.xSpeed = -this.xSpeed;
      }
    }
  }

  this.draw = function() {
    drawRect(this.x, this.y, this.w, this.h, this.color);
  }
}

function Enemy(x, y, w, h, color) {
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.color = color;
  this.speed = 5;

  this.fall = function() {
    this.y += this.speed;
  }

  this.fire = function() {
    const bullet = new Bullet(this.x + this.w / 2, this.y + this.h / 2, 3, 5, this.speed, this.color);
    enemies.bullets.push(bullet);
  }

  this.draw = function() {
    drawRect(this.x, this.y, this.w, this.h, this.color);
  }
}

function makeFirstWave() {
  const wave = [];
  for (let i = 1; i < 8; i++) {
    for(let j = 1; j < 4; j++) {
      wave.push(new Enemy(i * 40, j * 50, 20, 20, 'red'));
    }
  }

  return wave;
}

function makeSecondWave() {
  const wave = [];
  for (let i = 1; i < 8; i++) {
    for(let j = 1; j < 4; j++) {
      wave.push(new Enemy(i * 40, j * 50, 20, 20, 'red'));
    }
  }

  return wave;
}

function makeThirdWave() {
  const wave = [];
  for (let i = 1; i < 8; i++) {
    for(let j = 1; j < 4; j++) {
      wave.push(new Enemy(i * 40, j * 50, 20, 20, 'red'));
    }
  }

  return wave;
}

function makeForthWave() {
  const wave = [];
  for (let i = 1; i < 8; i++) {
    for(let j = 1; j < 4; j++) {
      wave.push(new Enemy(i * 40, j * 50, 20, 20, 'red'));
    }
  }

  return wave;
}

function sortWaveByX(array) {
  return array.sort((a, b) => a.x - b.x);
}

function everyFrames(n) {
  return gameVars.frames % n === 0;
}

const enemies = {
  firstWave: makeFirstWave(),
  secondWave: makeSecondWave(),
  thirdWave: makeThirdWave(),
  forthWave: makeForthWave(),
  bullets: [],
  speed: 2,
  fallSpeed: 1,

  active() {
    if (state.active === state.level.first) {
      return this.firstWave;
    } else if (state.active === state.level.second) {
      return this.secondWave;
    } else if (state.active === state.level.third) {
      return this.thirdWave;
    } else if (state.active === state.level.forth) {
      return this.forthWave;
    }
  },

  update() {
    if (state.current === state.game) {

      if (this.active().length === 0) {
        player.restart();
        this.restart();
        if (state.active === state.level.last) {
          end.message = 'You win!';
          state.active = state.level.first;
          state.current = state.end;
        } else {
          state.active += 1;
          state.current = state.getReady;
        }
      }

      this.active().forEach(enemy => {
        if (collide(player, enemy) || enemy.y > canvas.height) {
          end.message = 'You lost!';
          state.active = state.level.first;
          state.current = state.end;
        }
      });

      this.active().forEach(enemy => {
        enemy.x += this.speed;
        if (state.active === state.level.third) {
          enemy.y += this.fallSpeed;
        } else if (state.active === state.level.forth) {
          enemy.y += this.fallSpeed * 2;
        }
      });

      const leftEnemy = sortWaveByX(this.active())[0];
      const rightEnemy = sortWaveByX(this.active())[this.active().length - 1];

      if (leftEnemy.x < 0 || rightEnemy.x + rightEnemy.w > canvas.width) {
        this.speed = -this.speed;

        this.active().forEach(enemy => {
          if (state.active === state.level.second) {
            enemy.fall();
          }
        });
      }

      if (everyFrames(10)) {
        const index = Math.floor(Math.random() * this.active().length);
        const randomEnemy = this.active()[index];

        randomEnemy.fire();
      }

      this.bullets.forEach(bullet => {
        bullet.update();
        if (bullet.y > canvas.height) {
          this.bullets.splice(this.bullets.findIndex(b => b === bullet), 1);
        }
      });
    }
  },

  draw() {
    if (state.current !== state.getReady) {
      this.active().forEach(enemy => {
        enemy.draw();
      });

      this.bullets.forEach(bullet => {
        bullet.draw();
      });
    }
  },

  restart() {
    this.firstWave = makeFirstWave();
    this.secondWave = makeSecondWave();
    this.thirdWave = makeThirdWave();
    this.forthWave = makeForthWave();
    this.bullets = [];
    this.speed = 2;
    this.fallSpeed = 1;
  }
}

const enemiesLeft = {
  x: 200,
  y: 25,
  color: 'white',
  size: 15,

  draw() {
    drawText(`Enemies Left: ${enemies.active().length}`, this.x, this.y, this.size, this.color);
  }
}

const levelIndicator = {
  x: 20,
  y: 25,
  color: 'white',
  size: 15,

  draw() {
    drawText(`Level ${state.active} of ${state.level.last}`, this.x, this.y, this.size, this.color);
  }
}

function update() {
  player.update();
  enemies.update();
}

function draw() {
  start.draw();
  player.draw();
  enemies.draw();
  end.draw();
  enemiesLeft.draw();
  levelIndicator.draw();
  getReady.draw();
}

function loop() {
  drawRect(0, 0, canvas.width, canvas.height, 'rgb(0, 0, 20)');
  update();
  draw();
  gameVars.frames++;
}

function game() {
  const interval = setInterval(loop, 1000 / gameVars.framesSec);
}

game();
