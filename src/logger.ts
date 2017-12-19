
export var lerror = 2;
export var linfo = 3;
export var ldebug = 4;
export var lverbose = 5;

var logLevel = lverbose;

export function level(i: number){
    logLevel = i
}

export function debug(s: string){
    if (logLevel >= ldebug){
        console.log('%c %s','background: #eee; color: #00', s);
    }
}

export function verbose(s: string){
    if (logLevel >= lverbose){
        console.log('%c %s','background: white; color: black', s);
    }
}

export function info(s: string){
    if (logLevel >= linfo){
        console.log('%c %s','background: lightblue; color: black', s);
    }
}

export function error(s: string){
    if (logLevel >= lerror){
        console.log('%c %s','background: red; color: yellow', s);
    }
}