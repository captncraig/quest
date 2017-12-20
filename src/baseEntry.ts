import * as log from './logger';
import { Loader } from "./loader";

export class Entry{
    public constructor(public VolNum: number, public Offset: number, protected loader: Loader){

    }
    private bytes: Uint8Array;

    public async Data():Promise<Uint8Array>{
        if (this.bytes){
            return this.bytes;
        }
        log.verbose(`Loading Vol.${this.VolNum}@${this.Offset}`)
        var vol = await this.loader.load(`VOL.${this.VolNum}`); //TODO: v3 volname nonsense
        vol = vol.slice(this.Offset);
        var errHeader = `Bad resource in vol ${this.VolNum} offset ${this.Offset}:` 
        if (vol[0] != 0x12 || vol[1] != 0x34){
            throw(`${errHeader} signature not found`)
        }
        //TODO: v3 has compression
        var fullSize = vol[3] | (vol[4]<<8);
        log.verbose(`${fullSize} bytes`);
        vol = vol.slice(5, fullSize+5);
        this.bytes = vol;
        return vol
    }
}