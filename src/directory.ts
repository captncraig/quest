import { Loader } from "./loader";
import * as log from './logger';

export interface Entry{
    VolNum: number;
    Offset: number;
}

export class Dir{
    public Pictures: Entry[];
    public Views: Entry[];
    public Sounds: Entry[];
    public Logics: Entry[];

    public constructor(private loader: Loader, private v3Prefix: string){}
    public async Load(){
        if (!this.v3Prefix){
            await this.loadV2();
        }else{
            await this.loadV3();
        }
    }
    private async loadV2(){
        this.Logics = this.loadEntries(await this.loader.load("LOGDIR"))
        console.log(this.Logics)
    }
    private loadEntries(dat: Uint8Array): Entry[]{
        if (dat.length == 0 || dat.length % 3 != 0){
            throw("Invalid data length")
        }
        var arr = new Array<Entry>(256)
        for (var num = 0; num < dat.length / 3; num++){
            var i = num*3;
            var offset = (dat[i] << 16) | (dat[i+1] << 8) | dat[i+2];
            if (offset == 0xffffff){
                continue;
            }
            arr[num] ={
                VolNum: offset >> 20,      // top 4 bits
                Offset: offset & 0x0fffff, // bottom 20 bits
            } 
        }
        return arr;
    }
    private async loadV3(){
        throw "LoadV3 not implemented";
    }
}