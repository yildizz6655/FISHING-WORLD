
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

// FISHING WORLD
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 80, 350);

const camera = new THREE.PerspectiveCamera(
  65,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Işıklar
scene.add(new THREE.HemisphereLight(0xffffff, 0x426477, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2);
sun.position.set(50, 100, 40);
sun.castShadow = true;
scene.add(sun);

// Deniz
const oceanGeometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
const oceanMaterial = new THREE.MeshStandardMaterial({
  color: 0x087da8,
  roughness: 0.35,
  metalness: 0.15
});

const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = 0;
ocean.receiveShadow = true;
scene.add(ocean);

// Tekne
const boat = new THREE.Group();
scene.add(boat);

function createPart(geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  boat.add(mesh);
  return mesh;
}

// Tekne gövdesi
createPart(
  new THREE.BoxGeometry(3, 0.7, 7),
  0xeeeeee, 0, 0.8, 0
);

// Alt gövde
createPart(
  new THREE.BoxGeometry(2.6, 0.45, 6.5),
  0x174a68, 0, 0.45, 0
);

// Ön burun
createPart(
  new THREE.ConeGeometry(1.5, 2, 4),
  0xeeeeee, 0, 0.8, -4
).rotation.x = -Math.PI / 2;

// Koltuk
createPart(
  new THREE.BoxGeometry(1.8, 0.7, 1),
  0x263b48, 0, 1.45, 0.5
);

// Motor
createPart(
  new THREE.BoxGeometry(0.8, 1.2, 0.8),
  0x333333, 0, 0.7, 3.8
);

// Motor üstü
createPart(
  new THREE.BoxGeometry(0.9, 0.5, 0.9),
  0x1685bb, 0, 1.5, 3.8
);

// Direksiyon
const steeringWheel = new THREE.Group();
const wheelRing = new THREE.Mesh(
  new THREE.TorusGeometry(0.35, 0.055, 8, 24),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
steeringWheel.add(wheelRing);
steeringWheel.position.set(0, 1.9, 0.5);
boat.add(steeringWheel);

// Adalar
function createIsland(x, z, size) {
  const island = new THREE.Group();

  const land = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.7, size, 3, 32),
    new THREE.MeshStandardMaterial({ color: 0xd5bd82 })
  );
  land.position.y = 1;
  island.add(land);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.65, size * 0.8, 1, 32),
    new THREE.MeshStandardMaterial({ color: 0x39834b })
  );
  grass.position.y = 2.5;
  island.add(grass);

  for (let i = 0; i < 8; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 2, 8),
      new THREE.MeshStandardMaterial({ color: 0x79502b })
    );
    trunk.position.y = 1;
    tree.add(trunk);

    const leaves = new THREE.Mesh(
      new THREE.ConeGeometry(1, 2.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x17652d })
    );
    leaves.position.y = 2.8;
    tree.add(leaves);

    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * size * 0.45;

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

createIsland(-35, -45, 15);
createIsland(50, -85, 22);
createIsland(-80, 75, 18);
createIsland(90, 65, 25);

// Balıklar
const fishList = [];

for (let i = 0; i < 15; i++) {
  const fish = new THREE.Group();

  const colors = [
    0xffcc33, 0xff5555, 0x55ccff,
    0xff88cc, 0xeeeeee
  ];

  const color = colors[i % colors.length];

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 12, 10),
    new THREE.MeshStandardMaterial({ color })
  );
  body.scale.set(1.5, 0.7, 0.7);
  fish.add(body);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(0.35, 0.7, 4),
    new THREE.MeshStandardMaterial({ color })
  );
  tail.position.x = -0.85;
  tail.rotation.z = Math.PI / 2;
  fish.add(tail);

  fish.position.set(
    Math.random() * 120 - 60,
    -1.5,
    Math.random() * 120 - 60
  );

  scene.add(fish);
  fishList.push(fish);
}

// Oyun değişkenleri
let gameStarted = false;
let firstPerson = false;
let speed = 0;
let steering = 0;
let money = 1000;
let caught = 0;

let gasPressed = false;
let brakePressed = false;
let wheelPressed = false;

const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const controls = document.getElementById("controls");
const cameraButton = document.getElementById("camera");
const fishButton = document.getElementById("fish");
const moneyText = document.getElementById("money");
const caughtText = document.getElementById("caught");
const message = document.getElementById("message");
const wheelButton = document.getElementById("wheel");

// Başlat
document.getElementById("start").addEventListener("click", () => {
  gameStarted = true;
  menu.style.display = "none";
  hud.style.display = "block";
  controls.style.display = "flex";
  cameraButton.style.display = "block";
  fishButton.style.display = "block";
});

// Kamera değiştir
cameraButton.addEventListener("click", () => {
  firstPerson = !firstPerson;
  cameraButton.textContent = firstPerson ? "🚤" : "📷";
});

// Gaz
const gas = document.getElementById("forward");
gas.addEventListener("pointerdown", e => {
  e.preventDefault();
  gasPressed = true;
});
gas.addEventListener("pointerup", () => gasPressed = false);
gas.addEventListener("pointerleave", () => gasPressed = false);
gas.addEventListener("pointercancel", () => gasPressed = false);

// Fren
const brake = document.getElementById("brake");
brake.addEventListener("pointerdown", e => {
  e.preventDefault();
  brakePressed = true;
});
brake.addEventListener("pointerup", () => brakePressed = false);
brake.addEventListener("pointerleave", () => brakePressed = false);
brake.addEventListener("pointercancel", () => brakePressed = false);

// Direksiyon
function steerFromPointer(e) {
  const rect = wheelButton.getBoundingClientRect();
  const center = rect.left + rect.width / 2;
  steering = THREE.MathUtils.clamp(
    (e.clientX - center) / (rect.width / 2),
    -1,
    1
  );
}

wheelButton.addEventListener("pointerdown", e => {
  wheelPressed = true;
  wheelButton.setPointerCapture(e.pointerId);
  steerFromPointer(e);
});

wheelButton.addEventListener("pointermove", e => {
  if (wheelPressed) steerFromPointer(e);
});

wheelButton.addEventListener("pointerup", () => {
  wheelPressed = false;
});

wheelButton.addEventListener("pointercancel", () => {
  wheelPressed = false;
});

// Klavye kontrolü
const keys = {};

window.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

// Balık tut
fishButton.addEventListener("click", () => {
  if (!gameStarted) return;

  if (speed > 0.15) {
    showMessage("Önce tekneyi durdur!");
    return;
  }

  caught++;
  const reward = Math.floor(Math.random() * 400) + 100;
  money += reward;

  moneyText.textContent = money;
  caughtText.textContent = caught;

  showMessage("🐟 Balık yakaladın! +" + reward + " TL");
});

// Mesaj
let messageTimeout;

function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";

  clearTimeout(messageTimeout);
  messageTimeout = setTimeout(() => {
    message.style.display = "none";
  }, 2500);
}

// Kamera konumu
function updateCamera() {
  const direction = new THREE.Vector3(
    Math.sin(boat.rotation.y),
    0,
    Math.cos(boat.rotation.y)
  );

  if (firstPerson) {
    camera.position.set(
      boat.position.x + direction.x * 0.3,
      3.3,
      boat.position.z + direction.z * 0.3
    );

    camera.lookAt(
      boat.position.x + direction.x * 18,
      2,
      boat.position.z + direction.z * 18
    );
  } else {
    camera.position.set(
      boat.position.x - direction.x * 12,
      8,
      boat.position.z - direction.z * 12
    );

    camera.lookAt(
      boat.position.x,
      1,
      boat.position.z
    );
  }
}

// Başlangıç
boat.position.set(0, 0, 0);
camera.position.set(0, 8, 14);
camera.lookAt(0, 0, 0);

// Animasyon
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);

  if (gameStarted) {
    if (gasPressed || keys["w"] || keys["arrowup"]) {
      speed += delta * 1.5;
    } else if (brakePressed || keys["s"] || keys["arrowdown"]) {
      speed -= delta * 2;
    } else {
      speed *= 0.98;
    }

    speed = THREE.MathUtils.clamp(speed, 0, 12);

    let steerInput = steering;

    if (!wheelPressed) {
      if (keys["a"] || keys["arrowleft"]) steerInput = -1;
      else if (keys["d"] || keys["arrowright"]) steerInput = 1;
      else steerInput = 0;
    }

    boat.rotation.y -= steerInput * delta * (0.8 + speed * 0.08);

    boat.position.x -= Math.sin(boat.rotation.y) * speed * delta;
    boat.position.z -= Math.cos(boat.rotation.y) * speed * delta;

    steeringWheel.rotation.z = -steerInput * 0.9;

    boat.position.y = Math.sin(clock.elapsedTime * 1.5) * 0.08;
  }

  fishList.forEach((fish, i) => {
    fish.position.x += Math.sin(clock.elapsedTime + i) * delta * 0.4;
    fish.rotation.y = Math.sin(clock.elapsedTime + i) * 0.2;
  });

  ocean.position.x = boat.position.x;
  ocean.position.z = boat.position.z;

  updateCamera();

  renderer.render(scene, camera);
}

animate();

// Ekran boyutu
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
  
