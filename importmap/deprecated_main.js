import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GPUStatsPanel } from 'three/addons/utils/GPUStatsPanel.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';


let scene;
let camera;
let renderer;
let labelRenderer;
let selectedObject = [];
let intervals;
let globalOffset = new THREE.Vector3(0, 0, 0);
let globalLineMaterial = new THREE.LineBasicMaterial({color: 0x33ff33});
let globalMaterial;
let gui;
const layers = {

  'Toggle Name': function () {

    camera.layers.toggle( 0 );

  },
  'Toggle Mass': function () {

    camera.layers.toggle( 1 );

  },
  'Enable All': function () {

    camera.layers.enableAll();

  },

  'Disable All': function () {

    camera.layers.disableAll();

  }

};
let canvasX ;
let canvasY ;
let canvas;
function setGridHelper() {
}


function setGlobalOffset(x, y, z){
  globalOffset = new THREE.Vector3(x, y, z);
}


function setGlobalLineMaterial(color){
  let hex = parseInt(color.replace(/^#/, ''), 16);
  globalLineMaterial = new THREE.LineBasicMaterial({color: hex});
}
let controls;
function setOrbit(){

  controls = new OrbitControls( camera, renderer.domElement );

//controls.update() must be called after any manual changes to the camera's transform
  controls.update();
    animateOrbit();
  // renderer.setAnimationLoop( animateOrbit );
}

function Set3DEnv() {

  const gridHelperXYColor1 = new THREE.Color(0x777777);
  const gridHelperXYColor2 = new THREE.Color(0x777777);
  const gridHelperYZColor1 = new THREE.Color(0x777777);
  const gridHelperYZColor2 = new THREE.Color(0x777777);

  scene = new THREE.Scene();

  canvas = document.getElementById("main3DCanvas");
  canvasX = canvas.clientWidth;
  canvasY = canvas.clientHeight;
  const width = window.innerWidth, height = window.innerHeight;

// init

  camera = new THREE.PerspectiveCamera( 60, canvasX / canvasY, 0.01, 1000 );
  camera.position.z = 15;
  camera.position.y = 1;
  camera.layers.enableAll();


  const dirLight = new THREE.DirectionalLight( 0xffffff, 3 );
  dirLight.position.set( 0, 0, 1 );
  dirLight.layers.enableAll();
  scene.add( dirLight );

  const size = 25;
  const divisions = 25;


  const gridHelperXY = new THREE.GridHelper(size, divisions, gridHelperXYColor1, gridHelperXYColor2);
  const gridHelperYZ = new THREE.GridHelper(size, divisions, gridHelperYZColor1, gridHelperYZColor2);
  scene.add(gridHelperXY);
  scene.add(gridHelperYZ);

  gridHelperXY.rotation.x = deg2Rad(90);
  gridHelperYZ.rotation.y = deg2Rad(90);




  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( canvasX, canvasY );
  renderer.setPixelRatio(window.devicePixelRatio);
  canvas.appendChild( renderer.domElement );




  const axesHelper = new THREE.AxesHelper( 5 );
  axesHelper.layers.enableAll();
  scene.add( axesHelper );

  renderer.render( scene, camera );

// animation

}

function initGui() {

  gui = new GUI();

  gui.title( 'Camera Layers' );

  gui.add( layers, 'Toggle Name' );
  gui.add( layers, 'Toggle Mass' );
  gui.add( layers, 'Enable All' );
  gui.add( layers, 'Disable All' );

  gui.open();

}
let frameRate = 24;

function animateOrbit() {

  setTimeout(()=>{
    requestAnimationFrame( animateOrbit );
    renderer.render( scene, camera );
  },50 );

  // required if controls.enableDamping or controls.autoRotate are set to true
  // controls.update();


}

function drawTriangle(e, x, y) {
  if(x == null) x= 4;
  if(y == null) y= 3;

  const points = [];
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(x, 0, 0));
  points.push(new THREE.Vector3(x, y, 0));
  points.push(new THREE.Vector3(0, 0, 0));
  points.push(new THREE.Vector3(0, 0, 0));

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, globalLineMaterial);

  scene.add(line);

  selectedObject.push(line);
  renderer.render(scene, camera);
}



function drawCube() {
  const meshColor1 = new THREE.Color(0x45aaf2);
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({color: meshColor1});
  const cube = new THREE.Mesh(geometry, globalLineMaterial);
  selectedObject.push(cube);

  scene.add(cube);
  cube.shadow = true;
  renderer.render(scene, camera);

  return cube;
}

function drawVerticalLine(pointInfo){
  globalLineMaterial = new THREE.LineBasicMaterial({color: 0x33ff33});


  for (let i = 0; i < pointInfo[0].length; i++) {
    const points = [];
    for (let j=0; j<pointInfo.length; j++){
      points.push(pointInfo[j][i]);
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    const line = new THREE.Line(geometry, globalLineMaterial);
    scene.add(line);
    selectedObject.push(line);
  }

  renderer.render(scene, camera);


}
function drawSphereAxis(r, s, a, axis) {
  if (r == null) r = 5;
  if (s == null) s = 36;
  if (a == null) a = 360;
  if (axis == null) axis = 'Z';

  let pointsGrp = [];

  let segmentPerAngle = a / s;
  for (let i = 0; i < s; i++) {
    let nextUnitAngle = segmentPerAngle * i;
    let nextCircleRadius = Math.cos(deg2Rad(nextUnitAngle)) * r;
    let zOffset = Math.sin(deg2Rad(nextUnitAngle)) * r;
    pointsGrp.push(drawCircleAxis(nextCircleRadius, s, a, axis, zOffset));
  }


  renderer.render(scene, camera);

  return pointsGrp;
}

function drawSphere(sphereRadius, circleSegment, sphereAngle, sphereSegment) {
  if (sphereRadius == null) sphereRadius = 3;
  if (circleSegment == null) circleSegment = 36;
  if (sphereAngle == null) sphereAngle = 360;
  if (sphereSegment == null) sphereSegment = 30;

  let segmentPerAngle = sphereAngle / sphereSegment;
  for (let i = 0; i < sphereSegment; i++) {
    let nextUnitAngle = segmentPerAngle * i;
    let nextCircleRadius = Math.cos(deg2Rad(nextUnitAngle)) * sphereRadius;
    let zOffset = Math.sin(deg2Rad(nextUnitAngle)) * sphereRadius;
    drawCircle(nextCircleRadius, circleSegment, sphereAngle, zOffset);
  }

  for (let i = 0; i < sphereSegment; i++) {
    let nextUnitAngle = segmentPerAngle * i;
    let nextCircleRadius = Math.cos(deg2Rad(nextUnitAngle)) * sphereRadius;
    let zOffset = Math.sin(deg2Rad(nextUnitAngle)) * sphereRadius;
    drawCircle(nextCircleRadius, circleSegment, sphereAngle, zOffset);
  }
  renderer.render(scene, camera);
}

function drawCircle(r, seg, angle, z) {
  if (r == null) r = 3;
  if (seg == null) seg = 24;
  if (angle == null) angle = 360;
  if (z == null) z = 0;

  let ua = angle / seg;

  globalLineMaterial= new THREE.LineBasicMaterial({color: 0xffff00});

  const points = [];

  for (let i = 0; i < seg + 1; i++) {
    const nDeg = i * ua;
    const xPos = Math.cos(deg2Rad(nDeg)) * r;
    const yPos = Math.sin(deg2Rad(nDeg)) * r;
    points.push(new THREE.Vector3(xPos, yPos, z));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, material);
  selectedObject.push(line);
  scene.add(line);
  renderer.render(scene, camera);
}

function drawCircleAxis(r, seg, angle, axisName, axisVal, split) {
  if (r == null) r = 3;
  if (seg == null) seg = 24;
  if (angle == null) angle = 360;
  if (axisName == null) axisName = 'Z';
  if (axisVal == null) axisVal = 0;


  let a = 0;
  let b = 0;
  let c = 0;


  let ua = angle / seg;


  const points = [];

  for (let i = 0; i < seg+1; i++) {
    const nDeg = i * ua;
    const nRad = deg2Rad(nDeg);
    const cos = Math.cos(nRad);
    const sin = Math.sin(nRad);
    const cosAxisPos = cos * r;
    const sinAxisPos = sin * r;

    points.push(axisChange(globalOffset.x+cosAxisPos, globalOffset.y+sinAxisPos, globalOffset.z+axisVal, axisName));
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, globalLineMaterial);
  selectedObject.push(line);
  scene.add(line);
  renderer.render(scene, camera);

  let splitPoints = [];
  if(split != null){
    for(let i=0; i<split; i++){
      const nDeg = i * (360/split);
      const nRad = deg2Rad(nDeg);
      const cos = Math.cos(nRad);
      const sin = Math.sin(nRad);
      const cosAxisPos = cos * r;
      const sinAxisPos = sin * r;
      splitPoints.push(axisChange(globalOffset.x, globalOffset.y, axisVal+globalOffset.z, axisName));
      splitPoints.push(axisChange(cosAxisPos+globalOffset.x, sinAxisPos+globalOffset.y, axisVal+globalOffset.z, axisName));
      const geometrySplit = new THREE.BufferGeometry().setFromPoints(splitPoints);
      const lineSplit = new THREE.Line(geometrySplit, globalLineMaterial);
      selectedObject.push(lineSplit);
      scene.add(lineSplit);
    }
    renderer.render(scene, camera);
  }

  points.push(points[0]);
  return points;
}

function drawLineFromTo(from, to){
  let points = [];

  if(from == undefined) return false;
  if(to == undefined) return false;


  points.push(from);
  points.push(to);

  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const line = new THREE.Line(geometry, globalLineMaterial);
  selectedObject.push(line);
  scene.add(line);
  renderer.render(scene, camera);

}

function drawSineWave(r, seg, angle, axisName, axisVal){
  if (r == null) r = 3;
  if (seg == null) seg = 24;
  if (angle == null) angle = 360;
  if (axisName == null) axisName = 'Z';
  if (axisVal == null) axisVal = 0;


  let a = 0;
  let b = 0;
  let c = 0;


  let ua = angle / seg;


  const points = [];

  for (let i = 0; i < seg + 1; i++) {
    const nDeg = i * ua;
    const nRad = deg2Rad(nDeg);
    const cos = Math.cos(nRad);
    const sin = Math.sin(nRad);
    const cosAxisPos = cos * r;
    const sinAxisPos = sin * r;

    points.push(axisChange(nRad, sinAxisPos, axisVal, axisName));
  }

  const geometry = new THREE.BufferGeometry().setFromPoints(points);

  const line = new THREE.Line(geometry, globalLineMaterial);
  selectedObject.push(line);
  scene.add(line);
  renderer.render(scene, camera);

  return points;
}
function axisChange(cosAxisPos, sinAxisPos, axisVal, axisName) {

  /*
  * Z => (cos, sin, axisVal)
  * Y => (cos, axisVal, sin)
  * X => (axisVal, sin, cos)
  * */

  if (axisName == 'Z') {
    return new THREE.Vector3(cosAxisPos, sinAxisPos, axisVal);

  } else if (axisName == 'Y') {
    return new THREE.Vector3(cosAxisPos, axisVal, sinAxisPos);

  } else if (axisName == 'X') {
    return new THREE.Vector3(axisVal, sinAxisPos, cosAxisPos);
  }
}

function setCameraPos(x, y, z, callback) {
  camera.position.set(camera.position.x + x, camera.position.y + y, camera.position.z + z);
  renderer.render(scene, camera);
  if (callback != null) callback();
}

function getCameraPos() {
  return [camera.position.x, camera.position.y, camera.position.z]
}

function getCameraRot() {
  return [camera.rotation.x, camera.rotation.y, camera.rotation.z]
}

function setCameraRot(x, y, z, callback) {
  camera.rotation.x += deg2Rad(x);
  camera.rotation.y += deg2Rad(y);
  camera.rotation.z += deg2Rad(z);
  if (callback != null) callback();
  renderer.render(scene, camera);
}

function setCameraLookAt(x, y, z) {
  camera.lookAt(0, 0, 0);
}

function rotateObjectByInterval(intv) {
  if (intv == null) intv = 36;
  intv = intv / 1000;
  if (selectedObject.length == 0) return false;
  if (intervals != null) clearInterval(intervals);
  intervals = setInterval(() => {
    // selectedObject.rotation.x += 0.01;
    for (let i = 0; i < selectedObject.length; i++) {
      selectedObject[i].rotation.x += 0.01;
      selectedObject[i].rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  }, intv);
}

function stopAnim() {
  if (intervals != null) clearInterval(intervals);

}

function deg2Rad(deg) {
  return deg / 360 * (Math.PI * 2);
}


function rad2Deg(rad) {
  return rad / (Math.PI * 2) * 360;
}


let i = 0;



function Curse(){

    // import("./main.js").then((module) => {
    //   // Do something with the module.
    //   module1 = module ;
    //   Set3DEnv();
    //   setInputCameraPos();
    //   setInputCameraRot();
    //   setInputCameraPos();
    //   setInputCameraRot();
    // });
    // setInputCameraPos();
    // setInputCameraRot();
    // setInputCameraPos();
    // setInputCameraRot();

    // drawCube();
    /*


    drawTriangle();

    drawRadianAndDegree();

    drawCircleAxis();

    expDrawSinWave();
    expDrawCosWave();
    expDrawTanWave();


    drawSphereAxis();

    scalarAndVector();
    //magnitude
    //direction

    calculateVectorMinus();
    calculateVectorPlus();



    thetaBetweenTwoVector();

    dotProduct();
    crossProduct();


    */


    // expDrawSineWave();

}

async function expDrawSineWave(){
  let animTime = 40;
  setGlobalOffset(-1, 0, 0);
  let circleVertex = drawCircleAxis(1, 96, 720, 'Z', 0, 48);
  setGlobalOffset(0, 0, 0);
  let sinVertex = drawSineWave(1, 96, 720, 'Z', 0);
  i=0;
  setGlobalLineMaterial("#6be670");
  animSineWaveToCircleLine(circleVertex, sinVertex, sinVertex.length, animTime);

  setTimeout(()=>{
    setGlobalLineMaterial("#00d0ff");
    setGlobalOffset(-5, 0, 0);
    circleVertex = drawCircleAxis(5, 96, 720, 'Z', 0, 48);
    setGlobalOffset(0, 0, 0);
    sinVertex = drawSineWave(5, 96, 720, 'Z', 0);
    i=0;
    animSineWaveToCircleLine(circleVertex, sinVertex, sinVertex.length, animTime);
  },5000);

}

async function animSineWaveToCircleLine(a, b, maxLen, time){

  setTimeout(()=>{
    i+=1;
    drawLineFromTo(a[i], b[i]);
    if(i < maxLen){
      animSineWaveToCircleLine(a, b, maxLen, time);
    }
  }, time);
}


function expDrawAxisCircle(){
  drawCircleAxis(5, 36, 360, 'X');
  drawCircleAxis(5, 36, 360, 'Y');
  drawCircleAxis(5, 36, 360, 'Z');
}

function expDraw3DSphere(){
  let pointInfo = drawSphereAxis(5, 36, 360, 'Y');
  drawVerticalLine(pointInfo);
}

function expDrawTriangleExam(){
  drawTriangle(4, 3);
  drawTriangle(-4, 3);
  drawTriangle(4, -3);
  drawTriangle(-4, -3);
}


function setInputCameraPos() {

  let cameraPosId = document.getElementById("cameraPosId");
  let inputs = cameraPosId.getElementsByTagName("input");
  let curCamPos = getCameraPos();
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = curCamPos[i];
  }
}

function setInputCameraRot() {
  let cameraPosId = document.getElementById("cameraRotId");
  let inputs = cameraPosId.getElementsByTagName("input");
  let curCamPos = getCameraRot();
  for (let i = 0; i < inputs.length; i++) {
    inputs[i].value = rad2Deg(curCamPos[i]);
  }
}

function setCameraPosBind(x, y, z, callback){
  console.log("setCameraPosBind");
  setCameraPos(0.5, 0, 0);
  // if(x == null) x=0.01;
  // if(y == null) y=0.01;
  // if(z == null) z=0.01;
  // setCameraPos(x, y, z, callback);
}


function eventListen(){
  const pbxm = document.querySelector("#posBtnXMinus");
  const pbxp = document.querySelector("#posBtnXPlus");
  const btnViewTriangle = document.querySelector("#btnViewTriangle");
  const btnViewCircle = document.querySelector("#btnViewCircle");
  btnViewTriangle.addEventListener("click", drawTriangle);
  btnViewCircle.addEventListener("click", evt => drawCircleAxis(5));
  pbxm.addEventListener("click", function () {
    setCameraPos(0.5, 0, 0, setInputCameraPos);
  });
  pbxp.addEventListener("click", function () {
    setCameraPos(-0.5, 0, 0,setInputCameraPos);
  });
}

function addLabel(label){

  const EARTH_RADIUS = 5;
  const earthGeometry = new THREE.SphereGeometry( EARTH_RADIUS, 16, 16 );
  const earthMaterial = new THREE.MeshPhongMaterial( {
    specular: 0x33ff33,
    color: 0x33ff33,
    shininess: 5,

  } );
  // earthMaterial.map.colorSpace = THREE.SRGBColorSpace;

  const earth = new THREE.Mesh( earthGeometry, earthMaterial );
  scene.add( earth );

  earth.layers.enableAll();

  const earthDiv = document.createElement( 'div' );
  earthDiv.className = 'label';
  earthDiv.textContent = 'Earth';
  earthDiv.style.backgroundColor = 'transparent';

  const earthLabel = new CSS2DObject( earthDiv );
  earthLabel.position.set( 1.5 * EARTH_RADIUS, 0, 0 );
  earthLabel.center.set( 0, 1 );
  earth.add( earthLabel );
  earthLabel.layers.set( 0 );



  labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize( canvasX, canvasY );
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0px';
  canvas.appendChild( labelRenderer.domElement );

  initGui();

  renderer.render(scene, camera);

}

class AxisManipulate {
  name = "Something Good";

  constructor(element, x, y, z, callback) {

    // Note that the listeners in this case are `this`, not this.handleEvent
  }
  handleEvent(event) {
    console.log(this.name); // 'Something Good', as this is bound to newly created object
    switch (event.type) {
      case "click":
        // some code here…
        break;
      case "dblclick":
        // some code here…
        break;
    }
  }
}


Set3DEnv();
setOrbit();
addLabel("label");

// eventListen();
// expDrawAxisCircle();
// expDrawSineWave();



export { Set3DEnv, setGridHelper,
  setGlobalOffset,
  setGlobalLineMaterial,
  drawTriangle,
  drawCube,
  drawVerticalLine,
  drawSphereAxis,
  drawSphere,
  drawCircle,
  drawCircleAxis,
  drawLineFromTo,
  drawSineWave,
  axisChange,
  setCameraPos,
  getCameraPos,
  getCameraRot,
  setCameraRot,
  setCameraLookAt,
  rotateObjectByInterval,
  stopAnim,
  deg2Rad,
  rad2Deg}


