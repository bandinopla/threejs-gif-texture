import * as THREE from 'three';  
import { parseGIF, decompressFrames } from 'gifuct-js'
import type { ParsedFrame, ParsedGif } from 'gifuct-js'

/**
 * Cache for the loaded gifs
 */
const $loaders: { [url:string]:GifData } = {};


const getGif = (url:string): GifData => {
    
    $loaders[url] ??= new GifData(url);

    return $loaders[url];
}

type GifEvents = {
    loaded: THREE.Event<string,GifData>; 
    error: THREE.Event<string,GifData> & { message:string }; 
};

/**
 * In charge to handle the load operation of the gif's data.
 */
class GifData extends THREE.EventDispatcher<GifEvents>
{
    private _gif : ParsedGif;
    private _frames: ParsedFrame[];
    private _failed:boolean;
    private _isLoading:boolean;
    private _promise:Promise<void>;

    constructor( public readonly url:string )
    {
        super();  
 
        this.load(); 
    }

    get isLoading() {
        return this._isLoading;
    }

    get hasFailed() {
        return this._failed;
    }

    private load() 
    {
        this._isLoading = true;
        this._failed = false;

        this._promise = fetch(this.url)
                                        .then(resp => resp.arrayBuffer())
                                        .then(buff => {

                                            this._gif = parseGIF(buff)
                                            this._frames = decompressFrames(this._gif, true);
                                            this._isLoading = false; 

                                            this.dispatchEvent({ type:"loaded", target:this });
                                        })
                                        
                                        .catch( err=> {
                                            this._failed = true;
                                            this._isLoading = false; 

                                            this.dispatchEvent({ type:"error", target:this, message:err.toString() });
                                        }) 
                                        ;
    } 

    frameAt( frame:number ) {
        return this._frames[frame];
    }

    get width() {
        return this._gif.lsd.width;
    }

    get height() {
        return this._gif.lsd.height;
    }

    get totalFrames() {
        return this._frames.length;
    }

    get parsedGif() {
        return this._gif;
    }
 
}

/**
 * Loads the gif and returns a new `GifTexture`
 * @param url the url to the .gif to load
 * @returns 
 */
export function THREE_GetGifTexture( url:string ) :Promise<GifTexture> 
{ 
    return new Promise( (resolve, reject)=>{

        const gif = getGif( url );

        const clean = ()=>{
            gif.removeEventListener("loaded",onLoaded);
            gif.removeEventListener("error",onLoaded);
        }

        const onLoaded = ev => {
            clean();

            const canvas = document.createElement('canvas');
            canvas.width = gif.width;
            canvas.height = gif.height;

            resolve(new GifTexture(canvas, gif)); 
        }

        const onError = err => {
            clean();
            reject(err);
        }

        if( gif.isLoading )
        {
            gif.addEventListener("loaded", onLoaded); 
            gif.addEventListener("error", onError);
        }
        else if( gif.hasFailed )
        {
            onError("Failed to load the gif");
        }
        else 
        {
            onLoaded(null);
        } 

    });

} 

class GifTexture extends THREE.CanvasTexture
{     
    private tempCanvas : HTMLCanvasElement;
    private ctx:CanvasRenderingContext2D;
    private tmpCtx:CanvasRenderingContext2D;
    private frameIndex:number;
    private frameImageData:ImageData;  

    /** 
     * @param c Source Canvas that will provide the texture
     * @param gif GIF handler
     * @param play true means it will play the gif frame by frame over time.
     */
    constructor( c:HTMLCanvasElement, public readonly gif:GifData, public play:boolean = true )
    { 
        super( c );   
        
        this.tempCanvas = document.createElement('canvas');
        this.tmpCtx     = this.tempCanvas.getContext("2d");  
        this.ctx        = this.canvas.getContext("2d"); 

        //--
        this.frameIndex = 0;   
 
        // starts the render loop 
        this.renderLoop();

        if( !play )
        {
            this.renderFrame();
        }
    }

    get canvas() {
        return this.source.data as HTMLCanvasElement;
    }  

    /**
     * The frame we are at. Starting from 1 not 0.
     */
    get frame() {
        return this.frameIndex+1;
    }
    set frame( frameNumber:number )
    {
        this.frameIndex = Math.min( Math.max(0, frameNumber-1), this.gif.totalFrames-1 );

        this.renderFrame();
    }
 
    /**
     * The main render loop of the gif. 
     * It will render the frame and call itself back...
     */
    private renderLoop() 
    {
        if( !this.play )
        {
            requestAnimationFrame(this.renderLoop.bind(this));
            return;
        }

        var start = new Date().getTime()

        var frame = this.renderFrame(); 
 
        this.frameIndex++;

        if (this.frameIndex >= this.gif.totalFrames) {
            this.frameIndex = 0
        } 

        var end = new Date().getTime()
        var diff = end - start;

        setTimeout( () =>
        {
            requestAnimationFrame(this.renderLoop.bind(this)) 

        }, Math.max(0, Math.floor(frame.delay - diff)));
    }
 
    /**
     * Render a frame of the gif to the canvas
     */
    private renderFrame() : ParsedFrame 
    {  
        const frame = this.gif.frameAt(this.frameIndex)

        if (frame.disposalType === 2) 
            this.ctx.clearRect(0, 0, this.gif.width, this.gif.height);

        this.drawPatch(frame); 

        this.needsUpdate = true; //<-- trigger redraw of the canvas texture

        return frame; 
    } 

    
    private drawPatch( frame:ParsedFrame )
    {
        var dims = frame.dims 

        if (
          !this.frameImageData ||
          dims.width !== this.frameImageData.width ||
          dims.height !== this.frameImageData.height
        ) {
          this.tempCanvas.width = dims.width
          this.tempCanvas.height = dims.height
          this.frameImageData = this.tmpCtx.createImageData(dims.width, dims.height)
        } 
      
        // set the patch data as an override
        this.frameImageData.data.set(frame.patch);
      
        // draw the patch back over the canvas
        this.tmpCtx.putImageData(this.frameImageData, 0, 0)
      
        this.ctx.drawImage(this.tempCanvas, dims.left, dims.top)
 
    }

    dispose(): void {  
        this.play = false;
        super.dispose();
    }


}
 