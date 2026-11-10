
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// =====================================
// FISHING WORLD
// =====================================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86cbed);
scene.fog = new THREE.Fog(0x86cbed, 120, 500);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

// MENÜ
const menu = document.getElementById('menu');
const hud = document.getElementById('hud');
const controls = document.getElementById('controls');
const speedDisplay = document.getElementById('speed');
const message = document.getElementById('message');

let gameStarted = false;
let firstPerson = false;
let speed = 0;
let money = 1000;
let caughtCount = 0;
let fishingState = 'idle';
let fishingTime = 0;

window.startFishingGame = function () {
  gameStarted = true;
  menu.style.display = 'none';
  hud.style.display = 'flex';
  controls.style.display = 'flex';
  speedDisplay.style.display = 'block';
  message.innerText = 'Okyanusa hoş geldin!';
};

// IŞIKLAR
scene.add(new THREE.HemisphereLight(0xbdeaff, 0x29485b, 2));

const sun = new THREE.DirectionalLight(0xfff1d0, 2.5);
sun.position.set(-70, 100, 50);
scene.add(sun);

// PARÇA OLUŞTURMA
function makePart(parent, geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.5,
      metalness: 0.08
    })
  );

  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

// DENİZ
const waterGeometry = new THREE.PlaneGeometry(600, 600, 70, 70);
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x087fa9,
  roughness: 0.22,
  metalness: 0.25
});

const ocean = new THREE.Mesh(waterGeometry, waterMaterial);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

const waterPositions = waterGeometry.attributes.position;
const originalWaterZ = [];

for (let i = 0; i < waterPositions.count; i++) {
  originalWaterZ.push(waterPositions.getZ(i));
}

// GÜNEŞ
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(9, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xffe7a0 })
);
sunMesh.position.set(-100, 90, -180);
scene.add(sunMesh);

// ADALAR
function createIsland(x, z, size) {
  const island = new THREE.Group();

  makePart(
    island,
    new THREE.CylinderGeometry(size, size * 1.3, 7, 32),
    0xc9a16b, 0, -2, 0
  );

  makePart(
    island,
    new THREE.CylinderGeometry(size * 0.95, size, 3, 32),
    0x38894a, 0, 2, 0
  );

  makePart(
    island,
    new THREE.ConeGeometry(size * 0.5, size * 1.5, 10),
    0x657d62, 0, size * 0.8, 0
  );

  for (let i = 0; i < 7; i++) {
    const tree = new THREE.Group();

    makePart(
      tree,
      new THREE.CylinderGeometry(0.3, 0.4, 5, 8),
      0x80512b, 0, 2.5, 0
    );

    for (let j = 0; j < 3; j++) {
      makePart(
        tree,
        new THREE.ConeGeometry(1.4, 3.5, 6),
        0x176b36, 0, 4 + j * 1.2, 0
      );
    }

    tree.position.set(
      (Math.random() - 0.5) * size,
      3,
      (Math.random() - 0.5) * size
    );

    island.add(tree);
  }

  island.position.set(x, 0, z);
  scene.add(island);
}

createIsland(-55, -90, 25);
createIsland(85, -140, 32);
createIsland(120, 55, 23);
createIsland(-150, 110, 35);

// TEKNE
const boat = new THREE.Group();
scene.add(boat);

makePart(boat, new THREE.BoxGeometry(3.5, 1, 7.5), 0x713b20, 0, 1, 0);
makePart(boat, new THREE.BoxGeometry(3.1, 0.2, 6.5), 0xd6b17a, 0, 1.6, 0);
makePart(boat, new THREE.BoxGeometry(2.1, 1.6, 2.2), 0xecece7, 0, 2.5, 0.8);
makePart(boat, new THREE.BoxGeometry(2.5, 0.2, 2.6), 0x164a70, 0, 3.4, 0.8);
makePart(boat, new THREE.BoxGeometry(2.12, 0.65, 0.08), 0x54c5e8, 0, 2.75, -0.32);
makePart(boat, new THREE.BoxGeometry(0.8, 1.2, 0.8), 0x333b43, 0, 0.8, 4);

for (const side of [-1, 1]) {
  makePart(
    boat,
    new THREE.BoxGeometry(0.12, 0.5, 5.5),
    0xe4e4e4, side * 1.5, 2, 0
  );
}

// MOTOR VE PERVANE
const motor = new THREE.Group();
motor.position.set(0, 0.8, 4.2);
boat.add(motor);

makePart(motor, new THREE.BoxGeometry(0.7, 1.1, 0.6), 0x252b32, 0, 0, 0);

const propeller = new THREE.Group();
propeller.position.set(0, -0.6, 0.2);
motor.add(propeller);

for (let i = 0; i < 3; i++) {
  const blade = makePart(
    propeller,
    new THREE.BoxGeometry(0.12, 0.9, 0.08),
    0xaaaaaa, 0, 0.45, 0
  );
  blade.rotation.z = i * Math.PI * 2 / 3;
}

// BALIKLAR
const fish = [];

function createFish(x, z, color, size) {
  const group = new THREE.Group();

  makePart(
    group,
    new THREE.SphereGeometry(size, 12, 10),
    color, 0, 0, 0
  );

  const tail = makePart(
    group,
    new THREE.ConeGeometry(size * 0.7, size * 1.5, 4),
    color, 0, 0, size * 1.3
  );

  tail.rotation.x = Math.PI / 2;

  group.position.set(x, -2, z);
  scene.add(group);

  fish.push({ group, x, z, phase: Math.random() * 10 });
}

for (let i = 0; i < 15; i++) {
  const colors = [0xffaa22, 0xff5555, 0xdddddd, 0x44ccaa];

  createFish(
    (Math.random() - 0.5) * 100,
    (Math.random() - 0.5) * 100,
    colors[i % colors.length],
    0.5 + Math.random() * 0.6
  );
}

// =====================================
// DİREKSİYON
// =====================================

const wheel = document.createElement('div');

wheel.id = 'steering-wheel';
wheel.innerHTML = `
  <div class="wheel-ring">
    <div class="wheel-spoke wheel-top"></div>
    <div class="wheel-spoke wheel-left"></div>
    <div class="wheel-spoke wheel-right"></div>
    <div class="wheel-center"></div>
  </div>
`;

document.body.appendChild(wheel);

const wheelStyle = document.createElement('style');

wheelStyle.textContent = `
#steering-wheel {
  display:none;
  position:absolute;
  z-index:15;
  left:25px;
  bottom:25px;
  width:145px;
  height:145px;
  touch-action:none;
  user-select:none;
}
.wheel-ring {
  position:absolute;
  inset:5px;
  border:11px solid #b9c6d0;
  border-radius:50%;
  background:radial-gradient(circle,#273b4b 0%,#111b25 70%);
  box-shadow:0 4px 15px #000b,inset 0 0 8px #fff5;
  transform-origin:center;
}
.wheel-spoke {
  position:absolute;
  background:linear-gradient(90deg,#8b9ba8,#e2e8ed,#647582);
  border-radius:8px;
}
.wheel-top {
  width:10px;height:54px;
  left:50%;top:0;
  transform:translateX(-50%);
}
.wheel-left {
  width:10px;height:53px;
  left:24px;top:34px;
  transform:rotate(-55deg);
}
.wheel-right {
  width:10px;height:53px;
  right:24px;top:34px;
  transform:rotate(55deg);
}
.wheel-center {
  position:absolute;
  width:35px;height:35px;
  left:50%;top:50%;
  transform:translate(-50%,-50%);
  background:radial-gradient(circle,#dce4ea,#536574);
  border:3px solid #182c3b;
  border-radius:50%;
}
@media (max-width:500px) {
  #steering-wheel {width:125px;height:125px;left:14px;bottom:18px}
}
`;

document.head.appendChild(wheelStyle);

const wheelRing = wheel.querySelector('.wheel-ring');

let steeringValue = 0;
let wheelAngle = 0;
let draggingWheel = false;
let previousPointerAngle = 0;

function updateWheelVisibility() {
  wheel.style.display =
    gameStarted && firstPerson ? 'block' : 'none';

  const leftButton = document.getElementById('left');
  const rightButton = document.getElementById('right');

  if (leftButton) {
    leftButton.style.display = firstPerson ? 'none' : '';
  }

  if (rightButton) {
    rightButton.style.display = firstPerson ? 'none' : '';
  }
}

function pointerAngle(event) {
  const rect = wheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  return Math.atan2(
    event.clientY - centerY,
    event.clientX - centerX
  );
}

wheel.addEventListener('pointerdown', event => {
  event.preventDefault();

  draggingWheel = true;
  previousPointerAngle = pointerAngle(event);

  wheel.setPointerCapture(event.pointerId);
});

wheel.addEventListener('pointermove', event => {
  if (!draggingWheel) return;

  event.preventDefault();

  let currentAngle = pointerAngle(event);
  let difference = currentAngle - previousPointerAngle;

  if (difference > Math.PI) difference -= Math.PI * 2;
  if (difference < -Math.PI) difference += Math.PI * 2;

  previousPointerAngle = currentAngle;

  wheelAngle += difference;
  wheelAngle = THREE.MathUtils.clamp(wheelAngle, -1.2, 1.2);

  steeringValue = wheelAngle / 1.2;

  wheelRing.style.transform =
    `rotate(${wheelAngle * 100}deg)`;
});

function releaseWheel() {
  draggingWheel = false;
}

wheel.addEventListener('pointerup', releaseWheel);
wheel.addEventListener('pointercancel', releaseWheel);
wheel.addEventListener('lostpointercapture', releaseWheel);

// =====================================
// KONTROLLER
// =====================================

const keys = {
  forward: false,
  left: false,
  right: false,
  brake: false
};

function setControl(id, key) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener('pointerdown', event => {
    event.preventDefault();
    keys[key] = true;
    button.setPointerCapture(event.pointerId);
  });

  const release = () => {
    keys[key] = false;
  };

  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('lostpointercapture', release);
}

setControl('forward', 'forward');
setControl('left', 'left');
setControl('right', 'right');
setControl('brake', 'brake');

// KAMERA
document.getElementById('camera').onclick = () => {
  firstPerson = !firstPerson;

  updateWheelVisibility();

  message.innerText = firstPerson
    ? 'Birinci şahıs kamera - Direksiyonu kullan!'
    : 'Üçüncü şahıs kamera';
};

// KLAVYE
window.addEventListener('keydown', event => {
  if (event.key === 'w' || event.key === 'ArrowUp') keys.forward = true;
  if (event.key === 's' || event.key === 'ArrowDown') keys.brake = true;
  if (event.key === 'a' || event.key === 'ArrowLeft') keys.left = true;
  if (event.key === 'd' || event.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', event => {
  if (event.key === 'w' || event.key === 'ArrowUp') keys.forward = false;
  if (event.key === 's' || event.key === 'ArrowDown') keys.brake = false;
  if (event.key === 'a' || event.key === 'ArrowLeft') keys.left = false;
  if (event.key === 'd' || event.key === 'ArrowRight') keys.right = false;
});

// =====================================
// OLTA
// =====================================

const bobber = new THREE.Mesh(
  new THREE.SphereGeometry(0.35, 16, 12),
  new THREE.MeshStandardMaterial({ color: 0xff3333 })
);

bobber.visible = false;
scene.add(bobber);

const fishingLine = new THREE.Line(
  new THREE.BufferGeometry(),
  new THREE.LineBasicMaterial({ color: 0xffffff })
);

fishingLine.visible = false;
scene.add(fishingLine);

const rod = makePart(
  boat,
  new THREE.CylinderGeometry(0.07, 0.1, 4, 8),
  0x5b321b, 1.2, 2.7, -2
);

rod.rotation.x = Math.PI / 3;
rod.rotation.z = -0.25;

function updateFishingButton() {
  const button = document.getElementById('fish');

  button.innerText =
    fishingState === 'idle' ? '🎣 OLTA' :
    fishingState === 'casting' ? 'BEKLE...' :
    '🪝 ÇEK!';
}

function fishingAction() {
  if (!gameStarted) return;

  if (fishingState === 'idle') {
    fishingState = 'casting';
    fishingTime = 0;

    bobber.visible = true;
    fishingLine.visible = true;

    message.innerText = 'Oltanı attın! Balık bekleniyor...';
    updateFishingButton();
    return;
  }

  if (fishingState === 'bite') {
    const reward = Math.floor(50 + Math.random() * 101);

    money += reward;
    caughtCount++;

    document.getElementById('money').innerText =
      money.toLocaleString('tr-TR');

    document.getElementById('caught').innerText = caughtCount;

    message.innerText = 'Balığı yakaladın! +' + reward + ' TL!';

    fishingState = 'idle';
    bobber.visible = false;
    fishingLine.visible = false;

    updateFishingButton();
  } else {
    message.innerText = 'Balığın gelmesini bekle!';
  }
}

document.getElementById('fish').onclick = fishingAction;

// =====================================
// ANİMASYON
// =====================================

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // DENİZ DALGALARI
  for (let i = 0; i < waterPositions.count; i++) {
    const x = waterPositions.getX(i);
    const y = waterPositions.getY(i);

    const wave =
      Math.sin(x * 0.08 + time * 1.5) * 0.4 +
      Math.cos(y * 0.07 + time) * 0.3;

    waterPositions.setZ(i, originalWaterZ[i] + wave);
  }

  waterPositions.needsUpdate = true;
  waterGeometry.computeVertexNormals();

  // GAZ VE FREN
  if (gameStarted) {
    if (keys.forward && !keys.brake) {
      speed = Math.min(speed + delta * 8, 30);
    } else if (keys.brake) {
      speed = Math.max(speed - delta * 15, 0);
    } else {
      speed *= Math.pow(0.985, delta * 60);
    }

    // DİREKSİYON HESABI
    let steering = firstPerson
      ? steeringValue
      : (Number(keys.left) - Number(keys.right));

    boat.rotation.y += delta * steering * 1.3 *
      Math.max(0.15, speed / 12);

    // TEKNE HAREKETİ
    boat.position.x -= Math.sin(boat.rotation.y) * speed * delta;
    boat.position.z -= Math.cos(boat.rotation.y) * speed * delta;

    boat.position.y = Math.sin(time * 1.5) * 0.15;
    boat.rotation.z = Math.sin(time * 1.5) * 0.015;

    // MOTOR PERVANESİ
    propeller.rotation.z += delta * speed * 2;

    // DİREKSİYONU BIRAKINCA ORTALA
    if (!draggingWheel) {
      wheelAngle *= Math.pow(0.08, delta);
      steeringValue = wheelAngle / 1.2;

      wheelRing.style.transform =
        `rotate(${wheelAngle * 100}deg)`;
    }
  }

  speedDisplay.innerText =
    'HIZ: ' + Math.round(speed * 4) + ' KM/H';

  // BALIKLAR
  fish.forEach(f => {
    f.group.position.x =
      f.x + Math.sin(time + f.phase) * 2;

    f.group.position.z =
      f.z + Math.cos(time * 0.7 + f.phase) * 2;
  });

  // OLTA BEKLEME
  if (fishingState === 'casting' && gameStarted) {
    fishingTime += delta;

    if (fishingTime > 5) {
      fishingState = 'bite';
      message.innerText = 'BALIK OLTAYA TAKILDI! HEMEN ÇEK!';
      updateFishingButton();
    }
  }

  // ŞAMANDIRA
  if (fishingState !== 'idle') {
    const bobberOffset = new THREE.Vector3(1.2, 0, -13)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.rotation.y
      );

    const bobberPosition = boat.position.clone().add(bobberOffset);

    bobber.position.set(
      bobberPosition.x,
      0.3 + Math.sin(time * 4) * 0.15,
      bobberPosition.z
    );

    if (fishingState === 'bite') {
      bobber.position.y += Math.sin(time * 12) * 0.25;
    }

    const rodTip = new THREE.Vector3(1.2, 4.5, -3)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.rotation.y
      )
      .add(boat.position);

    fishingLine.geometry.setFromPoints([
      rodTip,
      new THREE.Vector3(
        (rodTip.x + bobber.position.x) / 2,
        1.5,
        (rodTip.z + bobber.position.z) / 2
      ),
      bobber.position
    ]);
  }

  // KAMERA
  if (firstPerson) {
    const cameraOffset = new THREE.Vector3(0, 3.1, 0.5)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.rotation.y
      );

    const cameraTarget = boat.position.clone().add(cameraOffset);

    camera.position.lerp(cameraTarget, 0.2);

    const lookDirection = new THREE.Vector3(0, 2.8, -30)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.rotation.y
      );

    camera.lookAt(
      boat.position.x + lookDirection.x,
      boat.position.y + lookDirection.y,
      boat.position.z + lookDirection.z
    );
  } else {
    const offset = new THREE.Vector3(0, 8, 15)
      .applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        boat.rotation.y
      );

    const targetCamera = boat.position.clone().add(offset);

    camera.position.lerp(targetCamera, 0.1);

    camera.lookAt(
      boat.position.x,
      boat.position.y + 1,
      boat.position.z
    );
  }

  renderer.render(scene, camera);
}

updateWheelVisibility();
animate();

// EKRAN BOYUTU
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
                                       
