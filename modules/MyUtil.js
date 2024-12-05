export function setAllElementWithLogic(selector='.className', eventName='mouseenter', logic=ev=>{}){
    let elmnts = document.querySelectorAll(selector);
    [...elmnts].forEach(el=>{el.addEventListener(eventName, logic)});
}
export function popRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr.splice(i, 1)[0];
}
export function getRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr[i];
}