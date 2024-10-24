export function requestFrame(callback=()=>{}){
    return new Promise(resolve => {
        requestAnimationFrame(()=>{
            let result = callback();
            resolve(result);
        })
    }) 
}
export function timer(s = 0){
    return new Promise( resolve => { setTimeout( resolve, s * 1000) } );
}
export function restartCSSAnimation(_element){
    return requestFrame(()=>{
        _element.style.animation = 'none';
    }).then(()=>{return requestFrame(()=>{
        _element.style.animation = null;
    })})
}