
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// FISHING WORLD - 3D ENGINE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8bd5f5);
scene.fog = new THREE.Fog(0x8bd5f5, 70, 220);

const camera = new THREE.PerspectiveCamera(
  65, window.innerWidth / window.innerHeight, 0.1, 500
);

const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// LIGHTS
scene.add(new THREE.HemisphereLight(0xffffff, 0x286078, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(-30, 60, 30);
sun.castShadow = true;
scene.add(sun);

// OCEAN
const waterGeometry = new THREE.PlaneGeometry(500, 500, 100, 100);
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x087da8,
  roughness: 0.3,
  metalness: 0.25,
  flatShading: false
});

const ocean = new THREE.Mesh(waterGeometry, waterMaterial);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = 0;
ocean.receiveShadow = true;
scene.add(ocean);

const positions = waterGeometry.attributes.position;
const originalY = [];

for (let i = 0; i < positions.count; i++) {
  originalY.push(positions.getY(i));
}

// SUN
const sunMesh = new THREE.Mesh(
  new THREE.SphereGeometry(7, 24, 24),
  new THREE.MeshBasicMaterial({color: 0xffeeaa})
);
sunMesh.position.set(-60, 65, -120);
scene.add(sunMesh);

// ISLAND
function createIsland(x, z, size) {
  const island = new THREE.Group();

  const land = new THREE.Mesh(
    new THREE.CylinderGeometry(size, size * 1.3, 5, 32),
    new THREE.MeshStandardMaterial({color: 0xc9a46b})
  );
  land.position.y = -1;
  island.add(land);

  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(size * 0.9, size, 1.5, 32),
    new THREE.MeshStandardMaterial({color: 0x429b4b})
  );
  grass.position.y = 2;
  island.add(grass);

  const mountain = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.55, size * 1.8, 8),
    new THREE.MeshStandardMaterial({color: 0x66845b})
  );
  mountain.position.y = size * 0.8;
  island.add(mountain);

  island.position.set(x, 0, z);
  scene.add(island);
}

createIsland(-45, -65, 20);
createIsland(65, -110, 27);
createIsland(100, 35, 18);

// BOAT
const boat = new THREE.Group();

const hull = new THREE.Mesh(
  new THREE.BoxGeometry(3, 1.2, 7),
  new THREE.MeshStandardMaterial({color: 0x8b451d, roughness: 0.7})
);
hull.position.y = 1;
boat.add(hull);

const deck = new THREE.Mesh(
  new THREE.BoxGeometry(2.8, 0.25, 5.5),
  new THREE.MeshStandardMaterial({color: 0xd6b27b})
);
deck.position.y = 1.65;
boat.add(deck);

const cabin = new THREE.Mesh(
  new THREE.BoxGeometry(2, 1.7, 2),
  new THREE.MeshStandardMaterial({color: 0xffffff})
);
cabin.position.set(0, 2.5, 0.8);
boat.add(cabin);

const roof = new THREE.Mesh(
  new THREE.BoxGeometry(2.3, 0.2, 2.3),
  new THREE.MeshStandardMaterial({color: 0x164a70})
);
roof.position.set(0, 3.45, 0.8);
boat.add(roof);

// BOAT WINDOWS
const windowMesh = new THREE.Mesh(
  new THREE.BoxGeometry(2.05, 0.65, 0.08),
  new THREE.MeshStandardMaterial({
    color: 0x65c9e8,
    metalness: 0.3,
    roughness: 0.2
  })
);
windowMesh.position.set(0, 2.7, -0.22);
boat.add(windowMesh);

boat.position.set(0, 0, 0);
scene.add(boat);

boat.traverse(object => {
  if (object.isMesh) {
    object.castShadow = true;
    object.receiveShadow = true;
  }
});

// CAMERA
let firstPerson = false;
let speed = 0;
const keys = {forward:false, left:false, right:false};

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

// KEYBOARD CONTROLS
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

  const time = clock.getElapsedTime();
  const delta = Math.min(clock.getDelta(), 0.05);

  // WATER WAVES
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getY(i);

    const wave =
      Math.sin(x * 0.08 + time * 1.5) * 0.35 +
      Math.cos(z * 0.07 + time) * 0.25;

    positions.setZ(i, originalY[i] + wave);
  }

  positions.needsUpdate = true;
  waterGeometry.computeVertexNormals();

  // BOAT MOVEMENT
  if (keys.forward) {
    speed = Math.min(speed + delta * 2, 12);
  } else {
    speed *= 0.97;
  }

  if (keys.left) boat.rotation.y += delta * 0.8;
  if (keys.right) boat.rotation.y -= delta * 0.8;

  boat.position.x -= Math.sin(boat.rotation.y) * speed * delta;
  boat.position.z -= Math.cos(boat.rotation.y) * speed * delta;

  // FLOATING BOAT
  boat.position.y = Math.sin(time * 1.5) * 0.12;

  // CAMERA FOLLOW
  const offset = firstPerson
    ? new THREE.Vector3(0, 3.5, 0.3)
    : new THREE.Vector3(0, 7, 13);

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

// SCREEN RESIZE
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
