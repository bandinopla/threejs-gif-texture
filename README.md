# THREE.js GifTexture

![Logo](./demo.gif)


Load a GIF file as a texture in [three.js](https://github.com/mrdoob/three.js/) using [gifuct-js](https://github.com/matt-way/gifuct-js)

Based on a [code sandbox](https://codesandbox.io/p/sandbox/giftexture-51rmw?file=%2Fsrc%2Findex.js) written by [Pawel](https://stackoverflow.com/users/696535/pawel)

## Install
```bash
npm install threejs-gif-texture
```

## Usage
```js
import * as THREE from 'three';  
import {THREE_GetGifTexture} from "threejs-gif-texture";

...

THREE_GetGifTexture("/lara.gif").then( texture => { 
    
    const cube = new THREE.Mesh( 
        new THREE.BoxGeometry(), 
        new THREE.MeshBasicMaterial({ map:texture }));

    scene.add(cube)   

});
```

## Control
The texture returned has the following api:

```js
texture.play = true; // if it should play the gif or not
texture.frame = 1; // get/set the frame number
texture.gif; // the gif handler object
texture.gif.isLoading; //boolean. If it is loading or not...
texture.gif.hasFailed; //boolean. If it has failed to load.
texture.gif.width;
texture.gif.height;
texture.gif.totalFrames; //total number of frames of the gif 
```
To access the [gifuct-js#ParsedGif ](https://github.com/matt-way/gifuct-js/blob/b5c2fee71fc7ca92ec074e55d8d0375982e594f6/index.d.ts#L46) that loaded the gif use:

```js
texture.gif.parsedGif;
```