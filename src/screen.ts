
// Screen is a single set of pixels.
export class Screen{
    private data: Uint8Array;
    public constructor(public width: number, public height: number){
        this.data = new Uint8Array(width * height);
    }

    public ctx2d: CanvasRenderingContext2D;

    public Set(x: number, y: number, c: number){
        this.data[x + y*this.width] = c;
        if(this.ctx2d){
            this.ctx2d.fillStyle = palette[c];
            this.ctx2d.fillRect(x*2, y, 2, 1);
        }
    }

    public Get(x: number, y: number): number{
        return this.data[x + y*this.width];
    }

    public Clear(c: number){
        for (var x = 0; x<this.width; x++){
            for(var y = 0; y<this.height; y++){
                this.data[x + y*this.width] = c;
                if(this.ctx2d){
                    this.ctx2d.fillStyle = palette[c];
                    this.ctx2d.fillRect(x*2, y, 2, 1);
                }
            }
        }
    }
}

var palette = [
    "#000000",
    "#0000AA",
    "#00AA00",
    "#00AAAA",
    "#AA0000",
    "#AA00AA",
    "#AA5500",
    "#AAAAAA",
    "#555555",
    "#5555FF",
    "#55FF55",
    "#55FFFF",
    "#FF5555",
    "#FF55FF",
    "#FFFF55",
    "#FFFFFF",
]