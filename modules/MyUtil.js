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
export function getCSSDeclaredValue(_targetEl, _propertyName, _convertToNumeric = false){
    let style = getComputedStyle(_targetEl);
    let val = style.getPropertyValue(_propertyName);
    return _convertToNumeric ? convertCSSPropertyToNumeric(val) : val;
}
function convertCSSPropertyToNumeric(initVal){
    var value = initVal
        .replace(/^calc\(/,'')
        .replace(/\)$/,'');
    function removeUnits(_value, _unit){
        //ios Safari don't support look behind
        let unitRegex = new RegExp(`\\d+${_unit}\\b`, 'g');  
        let matches = _value.match(unitRegex);
        if(matches === null) return _value; //return initial value if no matches
        return matches.reduce((output, match)=>output.replace(match, match.replace(_unit, '')), _value);
    }
    value = ['px','s','em','rem'].reduce(removeUnits, value);
    return eval(value);
}