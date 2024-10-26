

export function setAllElementWithLogic(selector='.className', eventName='mouseenter', logic=ev=>{}){
    let elmnts = document.querySelectorAll(selector);
    [...elmnts].forEach(el=>{el.addEventListener(eventName, logic)});
}

export function getNeighborElsInParent(selfElement, parentElement){
    let children = [...parentElement.children];
    let selfIndex = children.indexOf(selfElement);
    return {prev: children[selfIndex-1], next: children[selfIndex+1]};
}
export function popRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr.splice(i, 1)[0];;
}
export function getRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr[i];
}
export function convertCSSPropertyToNumeric(initVal){
    let value = initVal
        .replace(/(?<=[\d+])px/,'')//Remove units
        .replace(/(?<=[\d+])s/,'') 
        .replace(/^calc\(/,'') //Remove calc()
        .replace(/\)$/,'');
    return eval(value);
}
export function getCSSDeclaredValue(_targetEl, _propertyName, _convertToNumeric = false){
    let style = getComputedStyle(_targetEl);
    let val = style.getPropertyValue(_propertyName);
    return _convertToNumeric ? convertCSSPropertyToNumeric(val) : val;
}
