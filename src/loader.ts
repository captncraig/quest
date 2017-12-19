
export class Loader {

    private cache: {[name: string]: Uint8Array} = {};

    public async load(filename: string): Promise<Uint8Array>{
        if (this.cache[filename]){
            return this.cache[filename];
        }
        var resp = await fetch(`/games/${this.gameName}/${filename}`)
        var buf = await resp.arrayBuffer();
        var arr = new Uint8Array(buf);
        this.cache[filename] = arr;
        return arr;
    }

    public async loadText(filename: string): Promise<string>{
        var arr = await this.load(filename);
        return new TextDecoder("utf-8").decode(arr);
    }

    public constructor(private gameName: string){
    }
}