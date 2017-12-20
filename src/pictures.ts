import { Entry } from "./baseEntry";
import { Screen } from "./screen";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class Picture extends Entry {
    private visual: Screen;
    private priority: Screen;
    private priEnabled: boolean;
    private vizEnabled: boolean;
    private priColor: number;
    private vizColor: number;

    public async Draw(visual: Screen, priority: Screen) {
        this.visual = visual;
        this.priority = priority;
        this.visual.Clear(0x0f);
        this.priority.Clear(0x04);

        var dat = await this.Data();
        var idx = 0;
        var take = function (): number {
            idx++;
            return dat[idx - 1];
        }
        this.priEnabled = true;
        this.vizEnabled = true;
        this.priColor = 0;
        this.vizColor = 0;
        while (idx < dat.length) {
            var op = take()
            await sleep(5);
            switch (op) {
                case 0xf0:
                    this.vizEnabled = true;
                    this.vizColor = take();
                    console.log("visual = ", this.vizColor)
                    break;
                case 0xf1:
                    this.vizEnabled = false;
                    break;
                case 0xf2:
                    this.priEnabled = true;
                    this.priColor = take();
                    console.log("priority = ", this.vizColor)
                    break;
                case 0xf3:
                    this.priEnabled = false;
                    break;
                case 0xf6:
                    //absolute line
                    console.log("absline")
                    var x0 = take();
                    var y0 = take();
                    while (dat[idx] < 0xf0) {
                        var x1 = take();
                        var y1 = take();
                        this.drawLine(x0, y0, x1, y1);
                        x0 = x1;
                        y0 = y1;
                    }
                    break;
                case 0xf8:
                    //fill
                    console.log("fill");
                    while (dat[idx] < 0xf0) {
                        var x = take();
                        var y = take();
                        this.fill(x, y);
                    }
                    break;
                case 0xfa:
                    console.log("plot");
                    while (dat[idx] < 0xf0) {
                        var x = take();
                        var y = take();
                        this.setPixel(x, y);
                    }
                    break
                case 0xff:
                    console.log("done!");
                    return;
                default:
                    throw ("Unkown Picture OP: 0x" + op.toString(16))
            }
        }
    }
    private setPixel(x: number, y: number, drawViz: boolean = true, drawPri: boolean = true) {
        if (this.vizEnabled && drawViz) {
            this.visual.Set(x, y, this.vizColor);
        }
        if (this.priEnabled && drawPri) {
            this.priority.Set(x, y, this.priColor);
        }
    }
    private round(aNumber: number, dirn: number): number {
        if (dirn < 0)
            return ((aNumber - Math.floor(aNumber) <= 0.501) ?
                Math.floor(aNumber) : Math.ceil(aNumber));
        return ((aNumber - Math.floor(aNumber) < 0.499) ?
            Math.floor(aNumber) : Math.ceil(aNumber));
    }
    private drawLine(x1: number, y1: number, x2: number, y2: number): void {
        var x: number, y: number;
        var height: number = y2 - y1;
        var width: number = x2 - x1;
        var addX: number = (height == 0 ? height : width / Math.abs(height));
        var addY: number = (width == 0 ? width : height / Math.abs(width));

        if (Math.abs(width) > Math.abs(height)) {
            y = y1;
            addX = (width == 0 ? 0 : width / Math.abs(width));
            for (x = x1; x != x2; x += addX) {
                this.setPixel(this.round(x, addX), this.round(y, addY));
                y += addY;
            }
            this.setPixel(x2, y2);
        } else {
            x = x1;
            addY = (height == 0 ? 0 : height / Math.abs(height));
            for (y = y1; y != y2; y += addY) {
                this.setPixel(this.round(x, addX), this.round(y, addY));
                x += addX;
            }
            this.setPixel(x2, y2);
        }
    }
    private fill(x: number, y: number) {
        var q = [x, y];
        while (q.length) {
            x = q[0];
            y = q[1];
            q = q.slice(2);
            if (this.vizEnabled) {
                if (this.visual.Get(x, y) != 0x0f) {
                    continue;
                }
                this.setPixel(x, y, true, false);
            }
            if (this.priEnabled) {
                if (this.priority.Get(x, y) != 0x04) {
                    continue;
                }
                this.setPixel(x, y, false, true);
            }
            if (x > 0) {
                q.push(x - 1); q.push(y);
            }
            if (x < this.visual.width) {
                q.push(x + 1); q.push(y);
            }
            if (y > 0) {
                q.push(x); q.push(y - 1);
            }
            if (y < this.visual.height) {
                q.push(x); q.push(y + 1);
            }
        }
    }
}