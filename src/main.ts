
import * as log from './logger';
import { Loader } from './loader';
import { Game } from './game';

var elements = document.getElementsByClassName('game-link');
for (var i=0; i<elements.length; i++) {
    var el = elements[i];
    el.addEventListener("click", click);
}

async function click(e: any){
    var name = e.target.firstChild.nodeValue;
    var loader = new Loader(name);
    var g = new Game(loader, name);
    try{
        await g.Run();
    }catch(e){
        log.error(e);
    }
}