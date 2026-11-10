
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// FISHING WORLD
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86cbed);
scene.fog = new THREE.Fog(0x86cbed, 120, 500);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(0xbdeaff, 0x29485b, 2));

const sun = new THREE.DirectionalLight(0xfff1d0, 3);
sun.position.set(-70, 100, 50);
sun.castShadow = true;
scene.add(sun);

// WATER
const waterGeometry = new THREE.PlaneGeometry(600, 600, 100, 100);
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x087fa9,
  roughness: 0.22,
  metalness: 0.3
});

const ocean = new THREE.Mesh(waterGeometry, waterMaterial);
ocean.rotation.x = -Math.PI / 2;
scene.add(ocean);

const waterPositions = waterGeometry.attributes.position;
const originalWaterZ = [];

for (let i = 0; i < waterPositions.count; i++) {
  originalWaterZ.push(waterPositions.getZ(i));
}

// SUN
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(9, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xffe7a0 })
);
sunMesh.position.set(-100, 90, -180);
scene.add(sunMesh);

// ISLANDS
function createIsland(x, z, size) {
  const island = new THREE.Group();

  const sand = new THREE.Mesh(
    new THREE.CylinderGeometry(size, size * 1.3, 7, 48),
    new THREE.MeshStandardMaterial({ color: 0xc9a16b })
  );
  sand.position.y = -2;
  island.add(sand);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.95, size, 3, 48),
    new THREE.MeshStandardMaterial({ color: 0x38894a })
  );
  grass.position.y = 2;
  island.add(grass);

  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.5, size * 1.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x657d62 })
  );
  mountain.position.y = size * 0.8;
  island.add(mountain);

  for (let i = 0; i < 7; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 5, 8),
      new THREE.MeshStandardMaterial({ color: 0x80512b })
    );
    trunk.position.y = 2.5;
    tree.add(trunk);

    for (let j = 0; j < 5; j++) {
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(1.1, 4, 5),
        new THREE.MeshStandardMaterial({ color: 0x176b36 })
      );
      leaf.position.set(
        Math.cos(j * 1.25) * 1.2,
        4.5,
        Math.sin(j * 1.25) * 1.2
      );
      leaf.rotation.z = -Math.PI / 3;
      tree.add(leaf);
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

// BOAT
const boat = new THREE.Group();
scene.add(boat);

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
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

makePart(boat, new THREE.BoxGeometry(3.5, 1, 7.5), 0x713b20, 0, 1, 0);
makePart(boat, new THREE.BoxGeometry(3.1, 0.2, 6.5), 0xd6b17a, 0, 1.6, 0);
makePart(boat, new THREE.BoxGeometry(2.1, 1.6, 2.2), 0xecece7, 0, 2.5, 0.8);
makePart(boat, new THREE.BoxGeometry(2.5, 0.2, 2.6), 0x164a70, 0, 3.4, 0.8);
makePart(boat, new THREE.BoxGeometry(2.12, 0.65, 0.08), 0x54c5e8, 0, 2.75, -0.32);
makePart(boat, new THREE.BoxGeometry(0.8, 1.2, 0.8), 0x333b43, 0, 0.8, 4);

for (const side of [-1, 1]) {
  makePart(boat, new THREE.BoxGeometry(0.12, 0.5, 5.5), 0xe4e4e4, side * 1.5, 2, 0);
}

// FISH
const fish = [];

function createFish(x, z, color, size) {
  const group = new THREE.Group();

  makePart(group, new THREE.SphereGeometry(size, 16, 12), color, 0, 0, 0);

  const tail = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.7, size * 1.5, 4),
    new THREE.MeshStandardMaterial({ color })
  );
  tail.position.z = size * 1.3;
  tail.rotation.x = Math.PI / 2;
  group.add(tail);

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

// FISHING SYSTEM
let fishingState = 'idle';
let money = 1000;
let caughtCount = 0;
let biteTime = 0;
let fishingTime = 0;

const bobber = new THREE.Mesh(
  new THREE.SphereGeometry(0.35, 16, 12),
  new THREE.MeshStandardMaterial({
    color: 0xff3333,
    roughness: 0.3
  })
);
bobber.visible = false;
scene.add(bobber);

const lineGeometry = new THREE.BufferGeometry();
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
const fishingLine = new THREE.Line(lineGeometry, lineMaterial);
fishingLine.visible = false;
scene.add(fishingLine);

const rod = makePart(
  boat,
  new THREE.CylinderGeometry(0.07, 0.1, 4, 8),
  0x5b321b,
  1.2, 2.7, -2
);
rod.rotation.x = Math.PI / 3;
rod.rotation.z = -0.25;

function updateFishingButton() {
  const button = document.getElementById('fish');
  if (fishingState === 'idle') button.innerText = '🎣 OLTA';
  if (fishingState === 'casting') button.innerText = 'BEKLE...';
  if (fishingState === 'bite') button.innerText = '🪝 ÇEK!';
}

function fishingAction() {
  const message = document.getElementById('message');

  if (fishingState === 'idle') {
    fishingState = 'casting';
    fishingTime = 0;
    bobber.visible = true;
    fishingLine.visible = true;
    message.innerText = '🎣 Oltanı attın! Balık bekleniyor...';
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

    message.innerText =
      '🐟 Balığı yakaladın! +' + reward + ' TL kazandın!';

    fishingState = 'idle';
    bobber.visible = false;
    fishingLine.visible = false;
    updateFishingButton();
    return;
  }

  if (fishingState === 'casting') {
    message.innerText = '🐟 Sabret! Balığın gelmesini bekle.';
  }
}

document.getElementById('fish').addEventListener('click', fishingAction);

// CONTROLS
let firstPerson = false;
let speed = 0;
const keys = { forward: false, left: false, right: false };

function setControl(id, key) {
  const button = document.getElementById(id);
  if (!button) return;

  button.addEventListener('pointerdown', e => {
    e.preventDefault();
    keys[key] = true;
  });

  button.addEventListener('pointerup', () => keys[key] = false);
  button.addEventListener('pointerleave', () => keys[key] = false);
  button.addEventListener('pointercancel', () => keys[key] = false);
}

setControl('forward', 'forward');
setControl('left', 'left');
setControl('right', 'right');

document.getElementById('camera').onclick = () => {
  firstPerson = !firstPerson;
  document.getElementById('message').innerText =
    firstPerson ? 'Birinci şahıs kamera' : 'Üçüncü şahıs kamera';
};

// KEYBOARD
window.addEventListener('keydown', e => {
  if (e.key === 'w' || e.key === 'ArrowUp') keys.forward = true;
  if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'd' || e.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', e => {
  if (e.key === 'w' || e.key === 'ArrowUp') keys.forward = false;
  if (e.key === 'a' || e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'd' || e.key === 'ArrowRight') keys.right = false;
});

// ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // WAVES
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

  // BOAT MOVEMENT
  if (keys.forward) {
    speed = Math.min(speed + delta * 3, 15);
  } else {
    speed *= 0.985;
  }

  if (keys.left) boat.rotation.y += delta * 0.8;
  if (keys.right) boat.rotation.y -= delta * 0.8;

  boat.position.x -= Math.sin(boat.rotation.y) * speed * delta;
  boat.position.z -= Math.cos(boat.rotation.y) * speed * delta;
  boat.position.y = Math.sin(time * 1.5) * 0.15;

  // FISH MOVEMENT
  fish.forEach(f => {
    f.group.position.x = f.x + Math.sin(time + f.phase) * 2;
    f.group.position.z = f.z + Math.cos(time * 0.7 + f.phase) * 2;
  });

  // FISHING TIMER
  if (fishingState === 'casting') {
    fishingTime += delta;

    if (fishingTime > 5) {
      fishingState = 'bite';
      biteTime = time;
      document.getElementById('message').innerText =
        '‼️ BALIK OLTAYA TAKILDI! Hemen ÇEK!';
      updateFishingButton();
    }
  }

  // BOBBER POSITION
  const bobberOffset = new THREE.Vector3(1.2, 0, -13)
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y);

  const bobberPosition = boat.position.clone().add(bobberOffset);

  if (fishingState !== 'idle') {
    bobber.position.set(
      bobberPosition.x,
      0.3 + Math.sin(time * 4) * 0.15,
      bobberPosition.z
    );

    if (fishingState === 'bite') {
      bobber.position.y += Math.sin(time * 12) * 0.25;
    }

    const rodTip = new THREE.Vector3(1.2, 4.5, -3)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y)
      .add(boat.position);

    const points = [
      rodTip,
      new THREE.Vector3(
        (rodTip.x + bobber.position.x) / 2,
        1.5,
        (rodTip.z + bobber.position.z) / 2
      ),
      bobber.position
    ];

    fishingLine.geometry.setFromPoints(points);
  }

  // CAMERA
  const offset = firstPerson
    ? new THREE.Vector3(0, 3.5, 0.3)
    : new THREE.Vector3(0, 8, 15);

  const rotatedOffset = offset.clone()
    .applyAxisAngle(new THREE.Vector3(0, 1, 0), boat.rotation.y);

  const targetCamera = boat.position.clone().add(rotatedOffset);
  camera.position.lerp(targetCamera, 0.08);

  camera.lookAt(
    boat.position.x,
    boat.position.y + (firstPerson ? 2.5 : 1),
    boat.position.z
  );

  renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
