
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// FISHING WORLD - GRAPHICS UPDATE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x83c9ed);
scene.fog = new THREE.Fog(0x83c9ed, 100, 450);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.appendChild(renderer.domElement);

// LIGHTING
scene.add(new THREE.HemisphereLight(0xbdeaff, 0x31566b, 2));

const sun = new THREE.DirectionalLight(0xfff1d0, 3);
sun.position.set(-80, 120, 60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 150;
sun.shadow.camera.bottom = -150;
scene.add(sun);

// OCEAN
const waterGeometry = new THREE.PlaneGeometry(600, 600, 120, 120);

const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x087fa9,
  roughness: 0.22,
  metalness: 0.32
});

const ocean = new THREE.Mesh(waterGeometry, waterMaterial);
ocean.rotation.x = -Math.PI / 2;
ocean.receiveShadow = true;
scene.add(ocean);

const positions = waterGeometry.attributes.position;
const originalZ = [];

for (let i = 0; i < positions.count; i++) {
  originalZ.push(positions.getZ(i));
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
    new THREE.CylinderGeometry(size, size * 1.25, 7, 48),
    new THREE.MeshStandardMaterial({ color: 0xc9a16b })
  );
  sand.position.y = -2;
  sand.castShadow = true;
  island.add(sand);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.95, size, 3, 48),
    new THREE.MeshStandardMaterial({ color: 0x38894a })
  );
  grass.position.y = 2;
  grass.castShadow = true;
  island.add(grass);

  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.5, size * 1.5, 10),
    new THREE.MeshStandardMaterial({ color: 0x657d62 })
  );
  mountain.position.y = size * 0.8;
  mountain.castShadow = true;
  island.add(mountain);

  // PALM TREES
  for (let i = 0; i < 5; i++) {
    const tree = new THREE.Group();

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.5, 6, 8),
      new THREE.MeshStandardMaterial({ color: 0x80512b })
    );
    trunk.position.y = 3;
    tree.add(trunk);

    for (let j = 0; j < 5; j++) {
      const leaf = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 5, 5),
        new THREE.MeshStandardMaterial({ color: 0x176b36 })
      );
      leaf.position.set(
        Math.cos(j * 1.25) * 1.5,
        5,
        Math.sin(j * 1.25) * 1.5
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

// BOAT
const boat = new THREE.Group();

function boatPart(geometry, color, x, y, z) {
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.08
    })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  boat.add(mesh);
  return mesh;
}

// Hull
boatPart(new THREE.BoxGeometry(3.5, 1.1, 7.5), 0x713b20, 0, 1, 0);

// Deck
boatPart(new THREE.BoxGeometry(3.1, 0.2, 6.5), 0xd6b17a, 0, 1.65, 0);

// Cabin
boatPart(new THREE.BoxGeometry(2.1, 1.6, 2.2), 0xecece7, 0, 2.5, 0.8);

// Roof
boatPart(new THREE.BoxGeometry(2.5, 0.2, 2.6), 0x164a70, 0, 3.4, 0.8);

// Windows
boatPart(new THREE.BoxGeometry(2.12, 0.65, 0.08), 0x54c5e8, 0, 2.75, -0.32);

// Seats
for (let i = 0; i < 2; i++) {
  boatPart(
    new THREE.BoxGeometry(1.1, 0.35, 0.7),
    0x9a552c,
    0,
    2,
    -2 + i * 1.5
  );
}

// Motor
boatPart(new THREE.BoxGeometry(0.8, 1.2, 0.8), 0x333b43, 0, 0.8, 4);

// Boat rails
for (const side of [-1, 1]) {
  boatPart(
    new THREE.BoxGeometry(0.12, 0.5, 5.5),
    0xe4e4e4,
    side * 1.5,
    2,
    0
  );
}

scene.add(boat);

// CAMERA AND CONTROLS
let firstPerson = false;
let speed = 0;

const keys = {
  forward: false,
  left: false,
  right: false
};

function setControl(id, key) {
  const button = document.getElementById(id);

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

// GAME LOOP
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const time = clock.elapsedTime;

  // WATER ANIMATION
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    const wave =
      Math.sin(x * 0.08 + time * 1.5) * 0.4 +
      Math.cos(y * 0.07 + time) * 0.3;

    positions.setZ(i, originalZ[i] + wave);
  }

  positions.needsUpdate = true;
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

  // CAMERA FOLLOW
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
