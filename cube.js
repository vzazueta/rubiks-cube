import * as THREE from "https://unpkg.com/three@0.124.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.124.0/examples/jsm/controls/OrbitControls.js";

"use strict";

let renderer, scene, camera, cameraControls;
let dimensions, f0, f1, f2, f3, f4, f5;
let rotationQ = [];
let currentRotation, cube, rotationCounter = 0, rotating = false;

const moves = {
	U: "U",
	UP: "U'",
	D: "D",
	DP: "D'",
	R: "R",
	RP: "R'",
	L: "L",
	LP: "L'",
	F: "F",
	FP: "F'",
	B: "B",
	BP: "B'",
}

THREE.Object3D.prototype.rotateAroundWorldAxis = function() {
    var q = new THREE.Quaternion();

    return function rotateAroundWorldAxis( axis, angle ) {
        q.setFromAxisAngle( axis, angle );

        this.applyQuaternion( q );

        this.position.sub( new THREE.Vector3(0, 0, 0) );
        this.position.applyQuaternion( q );
        this.position.add( new THREE.Vector3(0, 0, 0) );

        return this;
    }
}();

function init() {
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
	document.getElementById("cube").appendChild(renderer.domElement);

	scene = new THREE.Scene();

	let fov = 60;
	let aspect = window.innerWidth * 0.8 / window.innerHeight;
	let near = 0.1;
	let far = 10000;
	camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 0, 20);
	cameraControls = new OrbitControls(camera, renderer.domElement);

	scene.add(new THREE.AmbientLight(0xffffff));

	cube = createMesh();
	rubik(dimensions, f0, f1, f2, f3, f4, f5);

	renderLoop();
}

function createMesh() {
	cube = [[], [], [], [], [], []];
	for(let i = 0; i < 6; i++) {
		for(let j = 0; j < dimensions; j++) {
			cube[i].push([]);
			for(let k = 0; k < dimensions; k++) {
				cube[i][j].push(0);
			}
		}
	}
	return cube;
}

function renderLoop() {
	renderer.render(scene, camera);
	if(rotationQ.length > 0) {
		rotateFace(rotationQ[0]);
	}
	requestAnimationFrame(renderLoop);
}

function restartScene() {
	while(scene.children.length > 1){ 
		scene.remove(scene.children[1]); 
	}
	rotationQ = [];
	rotationCounter = 0;
	rotating = false;
	clearInterval(currentRotation);
	cube = createMesh();
	rubik(dimensions, f0, f1, f2, f3, f4, f5);
}

function renderMove(move, speed) {
	const size = dimensions - 1;
	let temp;
	switch(move) {
		case moves.U:
			addRotation(cube[4], true, "y", speed);
			cube[4] = rotateClockwise(cube[4]);
			temp = cube[0][0];
			cube[0][0] = cube[1][0];
			cube[1][0] = cube[2][0];
			cube[2][0] = cube[3][0];
			cube[3][0] = temp;
			break;
		case moves.UP:
			addRotation(cube[4], false, "y", speed);
			cube[4] = rotateCounterClockwise(cube[4]);
			temp = cube[0][0];
			cube[0][0] = cube[3][0];
			cube[3][0] = cube[2][0];
			cube[2][0] = cube[1][0];
			cube[1][0] = temp;
			break;
		case moves.D:
			addRotation(cube[5], false, "y", speed);
			cube[5] = rotateClockwise(cube[5]);
			temp = cube[0][size];
			cube[0][size] = cube[3][size];
			cube[3][size] = cube[2][size];
			cube[2][size] = cube[1][size];
			cube[1][size] = temp;
			break;
		case moves.DP:
			addRotation(cube[5], true, "y", speed);
			cube[5] = rotateCounterClockwise(cube[5]);
			temp = cube[0][size];
			cube[0][size] = cube[1][size];
			cube[1][size] = cube[2][size];
			cube[2][size] = cube[3][size];
			cube[3][size] = temp;
			break;
		case moves.R:
			addRotation(cube[1], true, "x", speed);
			cube[1] = rotateClockwise(cube[1]);
			temp = getColumn(cube[0], size);
			setColumn(cube[0], size, getColumn(cube[5], size));
			setColumn(cube[5], size, getColumn(cube[2], 0).reverse());
			setColumn(cube[2], 0, getColumn(cube[4], size).reverse());
			setColumn(cube[4], size, temp);
			break;
		case moves.RP:
			addRotation(cube[1], false, "x", speed);
			cube[1] = rotateCounterClockwise(cube[1]);
			temp = getColumn(cube[0], size);
			setColumn(cube[0], size, getColumn(cube[4], size));
			setColumn(cube[4], size, getColumn(cube[2], 0).reverse());
			setColumn(cube[2], 0, getColumn(cube[5], size).reverse());
			setColumn(cube[5], size, temp);
			break;
		case moves.L:
			addRotation(cube[3], false, "x", speed);
			cube[3] = rotateClockwise(cube[3]);
			temp = getColumn(cube[0], 0);
			setColumn(cube[0], 0, getColumn(cube[4], 0));
			setColumn(cube[4], 0, getColumn(cube[2], size).reverse());
			setColumn(cube[2], size, getColumn(cube[5], 0).reverse());
			setColumn(cube[5], 0, temp);
			break;
		case moves.LP:
			addRotation(cube[3], true, "x", speed);
			cube[3] = rotateCounterClockwise(cube[3]);
			temp = getColumn(cube[0], 0);
			setColumn(cube[0], 0, getColumn(cube[5], 0));
			setColumn(cube[5], 0, getColumn(cube[2], size).reverse());
			setColumn(cube[2], size, getColumn(cube[4], 0).reverse());
			setColumn(cube[4], 0, temp);
			break;
		case moves.F:
			addRotation(cube[0], true, "z", speed);
			cube[0] = rotateClockwise(cube[0]);
			temp = cube[4][size];
			cube[4][size] = getColumn(cube[3], size).reverse();
			setColumn(cube[3], size, cube[5][0]);
			cube[5][0] = getColumn(cube[1], 0).reverse();
			setColumn(cube[1], 0, temp);
			break;
		case moves.FP:
			addRotation(cube[0], false, "z", speed);
			cube[0] = rotateCounterClockwise(cube[0]);
			temp = cube[4][size];
			cube[4][size] = getColumn(cube[1], 0);
			setColumn(cube[1], 0, cube[5][0].slice().reverse());
			cube[5][0] = getColumn(cube[3], size);
			setColumn(cube[3], size, temp.slice().reverse());
			break;
		case moves.B:
			addRotation(cube[2], false, "z", speed);
			cube[2] = rotateClockwise(cube[2]);
			temp = cube[4][0];
			cube[4][0] = getColumn(cube[1], size);
			setColumn(cube[1], size, cube[5][size].slice().reverse());
			cube[5][size] = getColumn(cube[3], 0);
			setColumn(cube[3], 0, temp.slice().reverse());
			break;
		case moves.BP:
			addRotation(cube[2], true, "z", speed);
			cube[2] = rotateCounterClockwise(cube[2]);
			temp = cube[4][0];
			cube[4][0] = getColumn(cube[3], 0).reverse();
			setColumn(cube[3], 0, cube[5][size]);
			cube[5][size] = getColumn(cube[1], size).reverse();
			setColumn(cube[1], size, temp);
			break;
		default:
			console.log("ERROR: invalid move");
	}
}

function rubik(dimensions, f0, f1, f2, f3, f4, f5) {
	let colours = [f1, f3, f4, f5, f0, f2];
	let faceMaterials = colours.map(function(c) {
		return new THREE.MeshBasicMaterial({ color: c });
	});

	let cubeSize = 3;
	let spacing = 0.25;

	let increment = cubeSize + spacing;

	function newCube(x, y, z) {
		let cubeGeometry = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
		let cube = new THREE.Mesh(cubeGeometry, faceMaterials);

		cube.position.set(x, y, z);
		cube.rubikPosition = cube.position.clone();

		scene.add(cube);
		return cube;
	}

	let c;
	let offset = (dimensions - 1) / 2;
	for(let i = 0; i < dimensions; i ++) {
		for(let j = 0; j < dimensions; j ++) {
			for(let k = 0; k < dimensions; k ++) {
				let x = (i - offset) * increment,
					y = (j - offset) * increment,
					z = (k - offset) * increment;

				c = newCube(x, y, z);
				let coords = getCoords(i, j, k);
				for(let m = 0; m < coords.length; m++) {
					addCube(c, coords[m][0], coords[m][1], coords[m][2])				
				}
			}
		}
	}
}

function getCoords(i, j, k) {
	let res = [];
	if(i == 0) {
		res.push([3, dimensions - j - 1, k]);
	} else if(i == dimensions - 1) {
		res.push([1, dimensions - j - 1, dimensions - k - 1]);
	}
	if(j == 0) {
		res.push([5, dimensions - k - 1, i]);
	} else if(j == dimensions - 1) {
		res.push([4, k, i]);
	}
	if(k == 0) {
		res.push([2, dimensions - j - 1, dimensions - i - 1]);
	} else if(k == dimensions - 1) {
		res.push([0, dimensions - j - 1, i]);
	}
	return res;
}

function addCube(singleCube, face, i, j) {
	cube[face][i][j] = singleCube;
}

function addRotation(face, cw, axis, speed) {
	rotationQ.push({
		face: face,
		cw: cw,
		axis, axis,
		speed: speed,
	});
}

function rotateFace(rot) {
	if(rotating) {
		return;
	}

	rotating = true;
	currentRotation = setInterval(function() {
		if(rotationCounter < Math.PI / 2) {
			rotationCounter += Math.PI / 16;

			let axis = new THREE.Vector3(1, 0, 0);
			switch(rot.axis) {
				case "y":
					axis = new THREE.Vector3(0, 1, 0);
					break;
				case "z":
					axis = new THREE.Vector3(0, 0, 1);
					break;
			}
			let sign = rot.cw ? -1 : 1
			
			for(let i = 0; i < dimensions; i++) {
				for(let j = 0; j < dimensions; j++) {
					rot.face[i][j].rotateAroundWorldAxis(axis, sign * Math.PI / 16);
				}
			}
		} else {
			clearInterval(currentRotation);
			rotationQ.shift();
			rotating = false;
			rotationCounter = 0;
		}
	}, rot.speed);
}

function sendData(a, b, c, d, e, f, g) {
	dimensions = a;
	f0 = b;
	f1 = c;
	f2 = d;
	f3 = e;
	f4 = f;
	f5 = g;
}

function rotateClockwise(a) {
	var n=a.length;
	for (var i=0; i<n/2; i++) {
		for (var j=i; j<n-i-1; j++) {
			var tmp=a[i][j];
			a[i][j]=a[n-j-1][i];
			a[n-j-1][i]=a[n-i-1][n-j-1];
			a[n-i-1][n-j-1]=a[j][n-i-1];
			a[j][n-i-1]=tmp;
		}
	}
	return a;
}

function rotateCounterClockwise(a) {
	var n=a.length;
	for (var i=0; i<n/2; i++) {
		for (var j=i; j<n-i-1; j++) {
			var tmp=a[i][j];
			a[i][j]=a[j][n-i-1];
			a[j][n-i-1]=a[n-i-1][n-j-1];
			a[n-i-1][n-j-1]=a[n-j-1][i];
			a[n-j-1][i]=tmp;
		}
	}
	return a;
}

function getColumn(a, n) {
	let res = [];
	const size = a.length;
	for(let i = 0; i < size; i++) {
		res.push(a[i][n]);
	}
	return res;
}

function setColumn(a, n, col) {
	const size = a.length;
	for(let i = 0; i < size; i++) {
		a[i][n] = col[i];
	}
	return a;
}

function resetCamera() {
	camera.position.set(0, 0, 20);
	camera.lookAt(0, 0, 0);
}

document.addEventListener("DOMContentLoaded", init);

window.addEventListener("resize", function() {
	renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
	camera.aspect = window.innerWidth * 0.8 / window.innerHeight;
	camera.updateProjectionMatrix();
});

export { renderMove, sendData, restartScene, resetCamera };
