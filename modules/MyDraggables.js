import Vector2 from "./Vector2.js";

export function setSlotLogic(element, _slotLogic = defaultSlotLogic){element.addEventListener('mouseenter', _slotLogic)};
export function defaultSlotLogic(event){
    let slot = event.target;
    slot.classList.add('active-slot');
    slot.addEventListener('mouseleave', _event=>{ slot.classList.remove('active-slot') });
}
export function setDraggableLogic(element, _draggableLogic = defaultDraggableLogic){element.addEventListener('mousedown', _draggableLogic);} 
function defaultDraggableLogic(mdownEvent){
    mdownEvent.target.classList.add('dragging');
    let mousePos = new Vector2(mdownEvent.pageX, mdownEvent.pageY);

}