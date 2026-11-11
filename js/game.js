
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// =====================================
// FISHING WORLD - GAME ENGINE
// =====================================

const canvas = document.getElementById("gameCanvas");

if (!canvas) {
  throw new Error("gameCanvas bulunamadı. index.html dosyasını kontrol et.");
}

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78bde5);
scene.fog = new THREE.Fog(0x78bde5, 100, 450);

const camera = new THREE.PerspectiveCamera(
  65,
  innerWidth / innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

// =====================================
// LIGHTING
// =====================================

scene.add(new THREE.HemisphereLight(0xbdeaff, 0x35556b, 2));

const sunlight = new THREE.DirectionalLight(0xffffff, 2.2);
sunlight.position.set(-40, 100, 50);
sunlight.castShadow = true;
scene.add(sunlight);

// =====================================
// OCEAN
// =====================================

const ocean = new THREE.Mesh(
  new THREE.PlaneGeometry(1500, 1500, 100, 100),
  new THREE.MeshStandardMaterial({
    color: 0x087eaf,
    roughness: 0.3,
    metalness: 0.18
  })
);

ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.2;
scene.add(ocean);

// =====================================
// BOAT
// =====================================

const boat = new THREE.Group();
scene.add(boat);

function boatPart(geometry, color, x, y, z) {
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  boat.add(mesh);
  return mesh;
}

// Gövde
boatPart(
  new THREE.BoxGeometry(3.2, 0.65, 7),
  0xe7e7e7, 0, 0.7, 0
);

// Alt gövde
boatPart(
  new THREE.BoxGeometry(2.8, 0.5, 6.5),
  0x174b6b, 0, 0.35, 0
);

// Ön burun
const bow = boatPart(
  new THREE.ConeGeometry(1.6, 2.3, 4),
  0xe7e7e7, 0, 0.7, -4
);
bow.rotation.x = -Math.PI / 2;

// İç bölüm
boatPart(
  new THREE.BoxGeometry(2.2, 0.3, 3.2),
  0x9aa9b0, 0, 1.05, 0.2
);

// Koltuk
boatPart(
  new THREE.BoxGeometry(1.8, 0.7, 1),
  0x263c4b, 0, 1.4, 0.8
);

// Motor
boatPart(
  new THREE.BoxGeometry(0.9, 1.3, 0.9),
  0x242a30, 0, 0.8, 3.7
);

// Motor kapağı
boatPart(
  new THREE.BoxGeometry(1, 0.5, 1),
  0x087dbb, 0, 1.5, 3.7
);

// =====================================
// ISLANDS
// =====================================

function createIsland(x, z, size) {
  const island = new THREE.Group();

  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.7, size, 3, 32),
    new THREE.MeshStandardMaterial({ color: 0xd5bd88 })
  );
  sand.position.y = 0.5;
  island.add(sand);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.65, size * 0.75, 1, 32),
    new THREE.MeshStandardMaterial({ color: 0x398b45 })
  );
  grass.position.y = 2.4;
  island.add(grass);

  for (let i = 0; i < 10; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.22, 2, 8),
      new THREE.MeshStandardMaterial({ color: 0x79502b })
    );
    trunk.position.y = 1;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1.1, 2.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x17642e })
    );
    leaves.position.y = 2.8;
    tree.add(leaves);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * size * 0.4;

    tree.position.set(
      Math.cos(angle) * distance,
      3,
      Math.sin(angle) * distance
    );

    island.add(tree);
  }

  island.position.set(x, 0, z);
  scene.add(island);
}

createIsland(-45, -55, 18);
createIsland(65, -100, 25);
createIsland(-100, 85, 22);
createIsland(110, 70, 27);

// =====================================
// FISH
// =====================================

const fishList = [];

for (let i = 0; i < 15; i++) {
  const fish = new THREE.Group();

  const color = [
    0xffcc33,
    0xff5555,
    0x55ccff,
    0xff88cc,
    0xffffff
  ][i % 5];

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 12),
    new THREE.MeshStandardMaterial({ color })
  );

  body.scale.set(1.5, 0.7, 0.7);
  fish.add(body);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 4),
    new THREE.MeshStandardMaterial({ color })
  );

  tail.position.x = -0.8;
  tail.rotation.z = Math.PI / 2;
  fish.add(tail);

  fish.position.set(
    Math.random() * 150 - 75,
    -1.5,
    Math.random() * 150 - 75
  );

  scene.add(fish);
  fishList.push(fish);
}

// =====================================
// GAME VARIABLES
// =====================================

let gameStarted = false;
let firstPerson = false;

let speed = 0;
let throttle = 0;
let steering = 0;
let money = 1000;
let caught = 0;

let wheelDragging = false;
let throttleDragging = false;

const $ = id => document.getElementById(id);

const menu = $("menu");
const startButton = $("startBtn");
const hud = $("hud");
const moneyText = $("money");
const caughtText = $("caught");
const speedText = $("speed");

const wheel = $("wheel");
const throttleTrack = $("throttle");
const throttleHandle = $("throttleHandle");

const brakeButton = $("brakeBtn");
const cameraButton = $("cameraBtn");
const fishButton = $("fishBtn");

// =====================================
// START GAME
// =====================================

startButton.addEventListener("click", () => {
  gameStarted = true;

  menu.style.display = "none";
  hud.style.display = "block";

  $("gameControls").style.display = "flex";
  cameraButton.style.display = "block";
  fishButton.style.display = "block";
});

// =====================================
// STEERING WHEEL
// =====================================

function updateSteering(e) {
  const rect = wheel.getBoundingClientRect();

  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const dx = e.clientX - cx;
  const dy = e.clientY - cy;

  steering = THREE.MathUtils.clamp(dx / (rect.width * 0.35), -1, 1);

  wheel.style.transform = `rotate(${steering * 110}deg)`;
}

wheel.addEventListener("pointerdown", e => {
  wheelDragging = true;
  wheel.setPointerCapture(e.pointerId);
  updateSteering(e);
});

wheel.addEventListener("pointermove", e => {
  if (wheelDragging) updateSteering(e);
});

function releaseWheel() {
  wheelDragging = false;
}

wheel.addEventListener("pointerup", releaseWheel);
wheel.addEventListener("pointercancel", releaseWheel);

// =====================================
// THROTTLE LEVER
// =====================================

function updateThrottle(e) {
  const rect = throttleTrack.getBoundingClientRect();

  const position = THREE.MathUtils.clamp(
    (e.clientY - rect.top) / rect.height,
    0,
    1
  );

  // Yukarı = ileri, orta = boş, aşağı = geri
  throttle = 1 - position * 2;

  throttleHandle.style.top = `${position * 100}%`;
}

throttleHandle.addEventListener("pointerdown", e => {
  throttleDragging = true;
  throttleHandle.setPointerCapture(e.pointerId);
  updateThrottle(e);
});

throttleHandle.addEventListener("pointermove", e => {
  if (throttleDragging) updateThrottle(e);
});

function releaseThrottle() {
  throttleDragging = false;
}

throttleHandle.addEventListener("pointerup", releaseThrottle);
throttleHandle.addEventListener("pointercancel", releaseThrottle);

// =====================================
// BRAKE
// =====================================

let braking = false;

brakeButton.addEventListener("pointerdown", e => {
  e.preventDefault();
  braking = true;
});

brakeButton.addEventListener("pointerup", () => braking = false);
brakeButton.addEventListener("pointerleave", () => braking = false);
brakeButton.addEventListener("pointercancel", () => braking = false);

// =====================================
// CAMERA
// =====================================

cameraButton.addEventListener("click", () => {
  firstPerson = !firstPerson;
  cameraButton.textContent = firstPerson ? "🚤" : "📷";
});

// =====================================
// FISHING
// =====================================

fishButton.addEventListener("click", () => {
  if (Math.abs(speed) > 0.5) {
    showMessage("Önce tekneyi durdur!");
    return;
  }

  caught++;

  const reward = Math.floor(Math.random() * 400) + 100;
  money += reward;

  moneyText.textContent = money;
  caughtText.textContent = caught;

  showMessage(`🐟 Balık yakaladın! +${reward} TL`);
});

// =====================================
// MESSAGE
// =====================================

let messageTimer;

function showMessage(text) {
  const message = $("message");
  message.textContent = text;
  message.style.display = "block";

  clearTimeout(messageTimer);

  messageTimer = setTimeout(() => {
    message.style.display = "none";
  }, 2500);
}

// =====================================
// CAMERA FOLLOW
// =====================================

function updateCamera() {
  const forward = new THREE.Vector3(
    -Math.sin(boat.rotation.y),
    0,
    -Math.cos(boat.rotation.y)
  );

  if (firstPerson) {
    camera.position.set(
      boat.position.x,
      boat.position.y + 3.2,
      boat.position.z
    );

    camera.lookAt(
      boat.position.x + forward.x * 18,
      boat.position.y + 1.5,
      boat.position.z + forward.z * 18
    );
  } else {
    camera.position.set(
      boat.position.x - forward.x * 13,
      boat.position.y + 8,
      boat.position.z - forward.z * 13
    );

    camera.lookAt(
      boat.position.x,
      boat.position.y + 1,
      boat.position.z
    );
  }
}

// =====================================
// GAME LOOP
// =====================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (gameStarted) {
    if (Math.abs(throttle) > 0.05) {
      speed += throttle * delta * 5;
    } else {
      speed *= Math.pow(0.97, delta * 60);
    }

    if (braking) {
      speed *= Math.pow(0.90, delta * 60);
    }

    speed = THREE.MathUtils.clamp(speed, -12, 18);

    if (!wheelDragging) {
      steering *= Math.pow(0.90, delta * 60);
      wheel.style.transform = `rotate(${steering * 110}deg)`;
    }

    boat.rotation.y += steering * delta * (0.45 + Math.abs(speed) * 0.06);

    const forwardX = -Math.sin(boat.rotation.y);
    const forwardZ = -Math.cos(boat.rotation.y);

    boat.position.x += forwardX * speed * delta;
    boat.position.z += forwardZ * speed * delta;

    boat.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.08;

    speedText.textContent = Math.round(Math.abs(speed));
  }

  ocean.position.x = boat.position.x;
  ocean.position.z = boat.position.z;

  fishList.forEach((fish, i) => {
    fish.position.x += Math.sin(clock.elapsedTime + i) * delta * 0.4;
    fish.rotation.y = Math.sin(clock.elapsedTime + i) * 0.2;
  });

  updateCamera();
  renderer.render(scene, camera);
}

boat.position.set(0, 0, 0);
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);

animate();

// =====================================
// RESIZE
// =====================================

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
  
