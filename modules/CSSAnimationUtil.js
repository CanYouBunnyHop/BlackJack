export async function requestFrame(callback=()=>{}, frameDelay=1){
    let requestOneFrame = (callback=()=>{})=>{
        return new Promise(resolve => {
            requestAnimationFrame(resolve);
        }) 
    }
    for(let i=0; i<frameDelay; i++){
        await requestOneFrame();
    }
    return callback();
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
