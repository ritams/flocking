// Global parameters
let width = 150;
let height = 150;
const numBoids = 100;
var visualRange = 100;
let mousePos = { x: 0, y: 0 };

const margin = 150;
const margin_bottom = 350;
const turnFactor = 1;
const centeringFactor = 0.005; // adjust velocity by this %
const minDistance = 50; // The distance to stay away from other boids
const avoidFactor = 0.05; // Adjust velocity by this %
const matchingFactor = 0.05; // Adjust by this % of average velocity
const speedLimit = 10;
const avoidRadius = 100; // Distance within which boids will try to avoid the mouse
const mouseAvoidFactor = 5; // How strongly boids will move away from the mouse
const DRAW_TRAIL = true;
const MAX_OPACITY = 20; // Percent
const OPACITY_STROKE_GROUPS = 10; // Number of histories to draw with the same stroke (to improve performance)
const MAX_WING_SHADOW_LENGTH = 10; // Pixels
const MAX_WING_LENGTH = 2; // Pixels

var visualRange = 100;  
// var visualRangeSlider = document.getElementById("ritam");

// visualRangeSlider.oninput = function() {
//   visualRange = this.value;
// }

let boids = [];

// Function to update global mouse position
function updateMousePosition(evt) {
  const rect = document.getElementById("boids").getBoundingClientRect();
  mousePos.x = evt.clientX - rect.left;
  mousePos.y = evt.clientY - rect.top;
}

function setupMousePositionListener() {
  document.getElementById("boids").addEventListener('mousemove', updateMousePosition);
}

function initBoids() {
  for (let i = 0; i < numBoids; i += 1) {
    boids.push({
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
      theta: Math.random() * 2 * Math.PI,
      theta_history: [],
      dx_history: [],
      dy_history: [],
    });
  }
}

function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) ** 2 +
    (boid1.y - boid2.y) ** 2
  );
}

function nClosestBoids(boid, n) {
  const sorted = boids.slice();
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  return sorted.slice(1, n + 1);
}

function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

function keepWithinBounds(boid) {
  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor;
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin_bottom) {
    boid.dy -= turnFactor;
  }
}

function flyTowardsCenter(boid) {
  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      centerX += otherBoid.x;
      centerY += otherBoid.y;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    centerX /= numNeighbors;
    centerY /= numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
  }
}

function avoidOthers(boid) {
  let moveX = 0;
  let moveY = 0;
  for (let otherBoid of boids) {
    if (otherBoid !== boid && distance(boid, otherBoid) < minDistance) {
      moveX += boid.x - otherBoid.x;
      moveY += boid.y - otherBoid.y;
    }
  }

  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;
}

function matchVelocity(boid) {
  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      avgDX += otherBoid.dx;
      avgDY += otherBoid.dy;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    avgDX /= numNeighbors;
    avgDY /= numNeighbors;

    boid.dx += (avgDX - boid.dx) * matchingFactor;
    boid.dy += (avgDY - boid.dy) * matchingFactor;
  }
}

function limitSpeed(boid) {
  const speed = Math.sqrt(boid.dx ** 2 + boid.dy ** 2);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

function update_theta(boid) {
  let dtheta = 0.01 * Math.sqrt(boid.dx ** 2 + boid.dy ** 2);
  boid.theta += dtheta;
}

function avoidMouse(boid) {
  let dx = boid.x - mousePos.x;
  let dy = boid.y - mousePos.y;
  let distance = Math.sqrt(dx ** 2 + dy ** 2);

  if (distance < avoidRadius) {
    boid.dx += (dx / distance) * mouseAvoidFactor;
    boid.dy += (dy / distance) * mouseAvoidFactor;
  }
}

function drawTrail(ctx, boid) {
  if (DRAW_TRAIL) {
    ctx.lineWidth = 2;
    for (let i = 0; i < boid.history.length - 1; i++) {
      if (i % OPACITY_STROKE_GROUPS === 0) {
        ctx.beginPath();
      }
      ctx.strokeStyle = `rgba(0 0 0 / ${MAX_OPACITY * i / boid.history.length}%)`;
      const start = boid.history[i];
      const end = boid.history[i + 1];

      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(end[0], end[1]);

      const midPoint = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
      const slope = (end[1] - start[1]) / (end[0] - start[0]);
      const perpSlope = -1 / slope;
      const length = MAX_WING_SHADOW_LENGTH * Math.sin(boid.theta_history[i]);

      const angle = Math.atan(perpSlope);
      const dx = length * Math.cos(angle);
      const dy = length * Math.sin(angle);

      ctx.moveTo(midPoint[0] - dx, midPoint[1] - dy);
      ctx.lineTo(midPoint[0] + dx, midPoint[1] + dy);
      if (i % OPACITY_STROKE_GROUPS === OPACITY_STROKE_GROUPS - 1) {
        ctx.stroke();
        ctx.closePath();
      }
    }
  }
}

function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  ctx.fillStyle = "#000000";
  ctx.strokeStyle = "#558cf4";
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 30, boid.y);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(boid.x - 15, boid.y);
  ctx.lineTo(boid.x - 30, boid.y + 5);
  ctx.lineTo(boid.x - 30, boid.y - 5);
  ctx.lineTo(boid.x - 15, boid.y);
  ctx.fill();
  ctx.closePath();

  const wing_length = MAX_WING_LENGTH * Math.sin(boid.theta);

  ctx.beginPath();
  ctx.moveTo(boid.x - 15, boid.y + wing_length);
  ctx.lineTo(boid.x - 15 + 5, boid.y);
  ctx.lineTo(boid.x - 15 - 5, boid.y);
  ctx.moveTo(boid.x - 15, boid.y + wing_length);
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(boid.x - 15, boid.y - wing_length);
  ctx.lineTo(boid.x - 15 + 5, boid.y);
  ctx.lineTo(boid.x - 15 - 5, boid.y);
  ctx.moveTo(boid.x - 15, boid.y - wing_length);
  ctx.fill();
  ctx.closePath();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}



function animationLoop() {
  const dt = 0.5;

  for (let i = 0; i < 1 / dt; i += 1) {
    for (let boid of boids) {
      flyTowardsCenter(boid);
      avoidOthers(boid);
      matchVelocity(boid);
      limitSpeed(boid);
      keepWithinBounds(boid);
      update_theta(boid);
      avoidMouse(boid);

      boid.x += boid.dx * dt;
      boid.y += boid.dy * dt;

      boid.history.push([boid.x, boid.y]);
      boid.theta_history.push(boid.theta);
      boid.dx_history.push(boid.dx);
      boid.dy_history.push(boid.dy);

      const max_hist = 50 / dt;
      boid.history = boid.history.slice(-max_hist);
      boid.theta_history = boid.theta_history.slice(-max_hist);
      boid.dx_history = boid.dx_history.slice(-max_hist);
      boid.dy_history = boid.dy_history.slice(-max_hist);
    }
  }



  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawTrail(ctx, boid);
  }
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  setupMousePositionListener();
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();
  initBoids();
  window.requestAnimationFrame(animationLoop);
};
