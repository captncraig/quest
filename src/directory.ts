import { Loader } from "./loader";
import * as log from './logger';
import {Entry} from './baseEntry';
import { Picture } from "./pictures";
import { Screen } from "./screen";



export class View extends Entry{
}
export class Logic extends Entry{
}
export class Sound extends Entry{
}

export class Dir{
    public Pictures: Picture[];
    public Views: View[];
    public Sounds: Sound[];
    public Logics: Logic[];

    public constructor(private loader: Loader, private v3Prefix: string){}
    public async Load(){
        if (!this.v3Prefix){
            await this.loadV2();
        }else{
            await this.loadV3();
        }
    }

    private async loadV2(){
        this.Logics = this.loadEntries(Logic, await this.loader.load("LOGDIR"));
        this.Views = this.loadEntries(View, await this.loader.load("VIEWDIR"));
        this.Pictures = this.loadEntries(Picture, await this.loader.load("PICDIR"));
        this.Sounds = this.loadEntries(Sound, await this.loader.load("SNDDIR"));

        var canvas = document.getElementById("screen") as HTMLCanvasElement;
        var ctx = canvas.getContext("2d");
        var viz = new Screen(160,200);
        viz.ctx2d = ctx;
        var prio = new Screen(160,200);
        await this.Pictures[1].Draw(viz,prio);
    }
    private loadEntries<T extends Entry>(c: {new(vnum: number, offset: number, l: Loader): T; },dat: Uint8Array): T[]{
        if (dat.length == 0 || dat.length % 3 != 0){
            throw("Invalid data length")
        }
        var arr = new Array<T>(256)
        for (var num = 0; num < dat.length / 3; num++){
            var i = num*3;
            var offset = (dat[i] << 16) | (dat[i+1] << 8) | dat[i+2];
            if (offset == 0xffffff){
                continue;
            }
            arr[num] = new c(offset >> 20, offset & 0x0fffff, this.loader);
        }
        return arr;
    }
    private async loadV3(){
        throw "LoadV3 not implemented";
    }
}