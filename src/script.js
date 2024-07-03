import * as THREE from 'three';
import {
    OrbitControls,
    RGBELoader
} from 'three/examples/jsm/Addons.js';

import {
    Brush,
    Evaluator,
    SUBTRACTION
} from 'three-bvh-csg';
import CustomShaderMaterial from 'three-custom-shader-material/vanilla';
import GUI from 'lil-gui';

import terrainVShader from './shaders/terrain/vertex.glsl';
import terrainFShader from './shaders/terrain/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 325 });
const debugObject = {};

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.set(-10, 6, -2);
scene.add(camera);

// Loaders
const rgbeLoader = new RGBELoader();

/**
 * Environment map
 */
rgbeLoader.load('/spruit_sunrise.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping;

    scene.background = environmentMap;
    scene.backgroundBlurriness = 0.5;
    scene.environment = environmentMap;
});

// Uniforms
const uniforms = {
    uPositionFrequency: new THREE.Uniform(0.2),
    uStrength: new THREE.Uniform(2.0),
    uWarpFrequency: new THREE.Uniform(5.0),
    uWarpStrength: new THREE.Uniform(0.5),
    uElevation: new THREE.Uniform(3.0),
    uTime: new THREE.Uniform(0.0),
};

/**
 * Terrain
 */
const terrainGeometry = new THREE.PlaneGeometry(10, 10, 500, 500);
terrainGeometry.deleteAttribute('uv');
terrainGeometry.deleteAttribute('normal');
terrainGeometry.rotateX(-Math.PI * 0.5);
const terrainMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    vertexShader: terrainVShader,
    fragmentShader: terrainFShader,
    uniforms: uniforms,

    // Base Mesh
    metalness: 0,
    roughness: 0.5,
    color: '#85D534',
});
const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.receiveShadow = true;
terrain.castShadow = true;
scene.add(terrain);

/**
 * Board
 */
const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11));
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10));

// Evaluate
const evaluator = new Evaluator();
const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION);
board.geometry.clearGroups();
board.material = new THREE.MeshStandardMaterial({
    color: 0XFFFFFF,
    metalness: 0,
    roughness: 0.3
});
board.receiveShadow = true;
board.castShadow = true;
scene.add(board);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2);
directionalLight.position.set(6.25, 3, 4);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.camera.top = 8;
directionalLight.shadow.camera.right = 8;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -8;
scene.add(directionalLight);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
});

/**
 * Tweaks
 */
const terrainGUI = gui.addFolder("Génération Terrain");
const baseTerrainGUI = terrainGUI.addFolder("Génération Terrain Base");
const warpTerrainGUI = terrainGUI.addFolder("Génération Terrain Secondaire");
baseTerrainGUI.add(uniforms.uElevation, 'value')
    .min(0.0)
    .max(5.0)
    .step(1.0)
    .name("Nombre d'Elévation")
;
baseTerrainGUI.add(uniforms.uPositionFrequency, 'value')
    .min(0.0)
    .max(0.3)
    .step(0.001)
    .name("Frequence terrain")
;
baseTerrainGUI.add(uniforms.uStrength, 'value')
    .min(0.0)
    .max(3.0)
    .step(0.001)
    .name("Force de génération")
;
warpTerrainGUI.add(uniforms.uWarpFrequency, 'value')
    .min(0.0)
    .max(10.0)
    .step(0.001)
    .name("Frequence terrain secondaire")
;
warpTerrainGUI.add(uniforms.uWarpStrength, 'value')
    .min(0.0)
    .max(1.0)
    .step(0.001)
    .name("Force générattion terrain secondaire");
;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    // Uniforms
    uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
