import { Loader } from './loader';
import * as log from './logger';
import { Dir } from './directory';

export class Game {
    private fullVersion: string;
    private agiVersion: number;

    public async Run() {
        log.info(`Starting game '${this.name}'`)
        var dat = await this.loader.loadText("AGIDATA.OVL")
        this.findVersionFromOVL(dat);
        var dir = new Dir(this.loader, this.agiVersion == 3 ? this.name : "")
        await dir.Load();
    }

    public constructor(private loader: Loader, private name: string) {

    }

    private findVersionFromOVL(ovl: string) {
        var idx = ovl.indexOf("Version ");
        if (idx == -1) {
            throw ("couldn't find version in agidata.ovl")
        }
        var vString = ovl.slice(idx + 8)
        idx = vString.indexOf("\0")
        if (idx == -1) {
            throw ("couldn't find version seperator in agidata.ovl")
        }
        this.fullVersion = vString.slice(0, idx);
        this.agiVersion = vString[0] == '3' ? 3 : 2;
        log.debug(`AGI version ${this.agiVersion} (${this.fullVersion})`)
    }
}