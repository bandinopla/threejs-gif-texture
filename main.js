/***
 * Example of how to use...
 */

import * as THREE from 'three';  
import {THREE_GetGifTexture} from "./src/THREE_GifTexture";

const width = window.innerWidth;
const height = window.innerHeight;

/**
 * @type {THREE.Vector3}
 */
let cameraPosition;

let zoom = 0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc); 
 
  
const MAXFOV = 40;
const camera = new THREE.PerspectiveCamera( 0, width / height, 0.1, 1000 ); 
camera.setFocalLength(MAXFOV);

const renderer = new THREE.WebGLRenderer(); 
 renderer.setSize( width, height );
 //renderer.toneMapping = THREE.ACESFilmicToneMapping;
 renderer.toneMapping = THREE.NoToneMapping;
document.body.appendChild( renderer.domElement );
  
 
const boxWidth = .5
const boxHeight = .5
const boxDepth = .5
//const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth)

THREE_GetGifTexture("/lara.gif").then( texture => {

    const geometry = new THREE.BoxGeometry(.3,.3,.3);

    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = THREE.SRGBColorSpace; 
    
    const cube = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ map:texture, toneMapped:false }));
    scene.add(cube)
    cube.rotateX(30)

    //texture.play = false;
    //texture.frame = 33; 

    function rotate() {
        requestAnimationFrame( rotate ); 
    
        cube.rotateY(-0.01)
    }
    rotate();

});




camera.position.x = 0; 
camera.position.y = 3; 
camera.position.z = 1; 
cameraPosition = camera.position.clone();

camera.lookAt(0,0,0);
//--------------------------------------------------------------------------------------------------------------
 
 
const clock = new THREE.Clock();
 

const pmremGenerator = new THREE.PMREMGenerator( renderer );
	  pmremGenerator.compileEquirectangularShader();
  

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize( width, height ); 

}
 

window.addEventListener( 'resize', onWindowResize );
  

function animate() {
	requestAnimationFrame( animate ); 

    renderer.render(scene, camera)  
}

animate();

//**************************************************************** */ 
 