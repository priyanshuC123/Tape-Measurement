import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.update();

scene.add(new THREE.AmbientLight(0x404040));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(1, 1, 1);
scene.add(light);


const loader = new GLTFLoader();
var url = "https://dl.dropboxusercontent.com/scl/fi/7ltaif6hq22w0nco08z1x/room_camera_geometry.glb?rlkey=gx9t34ey7fd6csna7ils85pkt&raw=1";
loader.load(
  url,
  function (gltf) {
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const points = [];
const markers = []; 

function addMarker(point) {
  const geometry = new THREE.SphereGeometry(0.05, 32, 32);
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.position.copy(point);
  scene.add(sphere);
  markers.push(sphere); 
}

function clearMarkers() {
  markers.forEach(marker => {
    scene.remove(marker);
  });
  markers.length = 0; 
}


const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
let line; 

function addLine(start, end) {
  const points = [];
  points.push(start.clone());
  points.push(end.clone());

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  if (line) {
    line.geometry.dispose();
    line.geometry = geometry;
  } else {
    line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
  }
}


function onMouseClick(event) {
  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    points.push(intersect.point);
    addMarker(intersect.point);

    if (points.length === 1) {
      addLine(intersect.point, intersect.point);
    } else if (points.length === 2) {
      addLine(points[0], points[1]);

      renderer.render(scene, camera);

      setTimeout(() => {
        const distance = points[0].distanceTo(points[1]);
        alert(`Distance: ${distance.toFixed(2)} meters`);
        clearMarkers();
        if (line) {
          scene.remove(line);
          line = null; 
        }
        points.length = 0; 
      }, 100); 
    }
  }
}

window.addEventListener('click', onMouseClick, false);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

window.onresize = function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};
