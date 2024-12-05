const ROOT_FONT_SIZE = parseFloat(getComputedStyle(document.documentElement).fontSize.replace('px', ''));
export function pxToRem(_px){return _px / ROOT_FONT_SIZE}
export function remToPx(_rem){return _rem * ROOT_FONT_SIZE}

export function getCSSDeclaredValue(_targetEl, _propertyName, _convertToNumeric = false){
    let style = getComputedStyle(_targetEl);
    let val = style.getPropertyValue(_propertyName);
    return _convertToNumeric ? convertCSSPropertyToNumeric(val) : val;
}
function convertCSSPropertyToNumeric(initVal){
    var value = initVal.replace(/^calc\(/,'').replace(/\)$/,'');
    let removeUnits = (_value, _unit)=>{
        //ios Safari don't support look behind
        let unitRegex = new RegExp(`\\d+${_unit}\\b`, 'g');  
        let matches = _value.match(unitRegex);
        if(matches === null) return _value; //return initial value if no matches
        return matches.reduce((output, match)=>output.replace(match, match.replace(_unit, '')), _value);
    }
    value = ['px','s','em','rem'].reduce(removeUnits, value);
    return eval(value);
}