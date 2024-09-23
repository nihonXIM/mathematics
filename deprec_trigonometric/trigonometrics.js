let scene;
let camera;
let renderer;
let selectedObject = [];
let intervals;
let globalOffset = new THREE.Vector3(0, 0, 0);
let globalLineMaterial = new THREE.LineBasicMaterial({color: 0x33ff33});
let globalMaterial;


function setGridHelper() {
}


function setGlobalOffset(x, y, z){
    globalOffset = new THREE.Vector3(x, y, z);
}


function setGlobalLineMaterialForColor(color){
    let hex = parseInt(color.replace(/^#/, ''), 16);
    globalLineMaterial = new THREE.LineBasicMaterial({color: hex});
}

function Set3DEnv() {

    const gridHelperXYColor1 = new THREE.Color(0x777777);
    const gridHelperXYColor2 = new THREE.Color(0x777777);
    const gridHelperYZColor1 = new THREE.Color(0x777777);
    const gridHelperYZColor2 = new THREE.Color(0x777777);

    scene = new THREE.Scene();

    let canvas = document.getElementById("main3DCanvas");
    const canvasX = canvas.clientWidth;
    const canvasY = canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(60, canvasX / canvasY, 0.1, 1000);
    //  const camera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );

    renderer = new THREE.WebGLRenderer();
    scene.add(camera);

    renderer.setSize(canvasX, canvasY);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.antialias = true;
    // renderer.setAnimationLoop( animateOrbit );


    camera.position.z = 15;
    camera.position.y = 1;


    const size = 25;
    const divisions = 25;


    const gridHelperXY = new THREE.GridHelper(size, divisions, gridHelperXYColor1, gridHelperXYColor2);
    const gridHelperYZ = new THREE.GridHelper(size, divisions, gridHelperYZColor1, gridHelperYZColor2);
    scene.add(gridHelperXY);
    scene.add(gridHelperYZ);

    gridHelperXY.rotation.x = deg2Rad(90);
    gridHelperYZ.rotation.y = deg2Rad(90);


    canvas.appendChild(renderer.domElement);
    renderer.render(scene, camera);
}

function drawTriangle(x, y) {


    globalLineMaterial = new THREE.LineBasicMaterial({color: 0xffff00});

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

    for (let i = 0; i < seg + 1; i++) {
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

    return points;
}

 function drawFromToLine(from, to){

        let points = [];
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



