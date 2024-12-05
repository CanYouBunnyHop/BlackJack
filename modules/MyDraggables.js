import Vector2 from "./Vector2.js";
import { timer, requestFrame} from "./CSSAnimationUtil.js";

export function slotLogic(event, unhoverEvent='mouseleave'){
    let slot = event.target;
    let capacity = slot.getAttribute('capacity') ?? Infinity;
    if(slot.children.length >= capacity) return;
    slot.classList.add('active-slot');
    document.querySelectorAll('.active-slot').forEach(el=>{if(el!==slot)el.classList.remove('active-slot')});
    slot.addEventListener(unhoverEvent, async _event=>{
        await requestFrame(()=>{},2); 
        slot.classList.remove('active-slot');
    });
}
export function hoveredLogic(event){
    let item = event.target;
    item.classList.add('hover');
    document.querySelectorAll('.hover').forEach(el=>{if(el!==item)el.classList.remove('hover')});
    item.addEventListener('pointerleave', ()=>item.classList.remove('hover')); //pointerleave works on mobile
    document.addEventListener('mouseup', ()=>item.classList.remove('hover')); //fixes some desktop mouse input bugs
}
export async function startDrag(mdownEvent, targetParentElement, animationTime = 0,
    afterStartDrag = async (_startOut)=>{return {..._startOut}},
    releaseDrag = async(_b4ReleaseOut)=>{return {..._b4ReleaseOut}}, 
    endTransition= async(_releaseOut)=>{return {..._releaseOut}}, _allowsDrag = true){//start drag chain function
        const DRAG_TARGET = mdownEvent.target.closest('.draggable');
        const DRAG_START_SLOT = DRAG_TARGET.parentElement.closest('.slot');
        const dragLock = (DRAG_TARGET.getAttribute('lock') ?? 'false')==='true';
        if(!DRAG_START_SLOT || document.body.getAttribute('transitioning') === 'true' || dragLock || !_allowsDrag) 
            return null;

        requestFrame(()=>document.body.setAttribute('drag-active', true), 2); //delayed here for blackJack css to function properly

        const INITIAL_TRANSITION = DRAG_TARGET.style.transition;
        requestFrame(()=>{
            DRAG_TARGET.style.transition = `left 0s, top 0s, margin ${animationTime}s`;
            DRAG_TARGET.classList.add('dragging');
        }); //delayed for css animation
        let _rect = DRAG_TARGET.getBoundingClientRect();
        const START_OUT = {
            DRAG_TARGET, 
            DRAG_START : {
                SLOT : DRAG_START_SLOT,
                POS : new Vector2(_rect.x, _rect.y), 
                MPOS : new Vector2(mdownEvent.clientX, mdownEvent.clientY),
                INDEX : [...DRAG_START_SLOT.children].indexOf(DRAG_TARGET),
                NEIGHBOUR : { L: DRAG_TARGET.previousElementSibling, R: DRAG_TARGET.nextElementSibling}
            }
        }
        targetParentElement.appendChild(DRAG_TARGET);
        afterStartDrag(START_OUT);
        onDrag(mdownEvent, START_OUT);
        const DRAGGING_REF = (moveEvent) => onDrag(moveEvent, START_OUT);
        //when mouse is moving and when scrolling
        document.addEventListener('mousemove', DRAGGING_REF);
        //ReleaseDrag
        const ON_MOUSE_UP_REF = onMouseUp;
        document.addEventListener('mouseup', ON_MOUSE_UP_REF);
        async function onMouseUp(releaseEvent){
            document.removeEventListener('mouseup', ON_MOUSE_UP_REF);
            document.body.setAttribute('drag-active', false);
            document.removeEventListener('mousemove', DRAGGING_REF);
            DRAG_TARGET.style.transition = INITIAL_TRANSITION;
            requestFrame(()=>DRAG_TARGET.classList.remove('dragging'));
            const B4RELEASE_OUT = await beforeReleaseDrag(releaseEvent, START_OUT);
            const RELEASE_OUT = await releaseDrag(B4RELEASE_OUT); //parse in stuff? //Move position here
            await timer(animationTime);
            await endTransition(RELEASE_OUT); //parse in stuff
            document.body.setAttribute('transitioning', false);
        } 
}
function onDrag(moveEvent, _startOut){
    const{DRAG_TARGET, DRAG_START} = _startOut;
    //moveEvent.preventDefault();
    let curMPos = new Vector2(moveEvent.clientX, moveEvent.clientY);
    let mPosDelta = curMPos.subtract(DRAG_START.MPOS);
    let followPos = DRAG_START.POS.add(mPosDelta);
    //console.log(followPos);
    //follow mouse
    DRAG_TARGET.style.position = 'fixed';
    DRAG_TARGET.style.left = `${followPos.x}px`;
    DRAG_TARGET.style.top = `${followPos.y}px`;
    if(followPos.x!==DRAG_START.POS.x||followPos.y!==DRAG_START.POS.y)
        document.body.setAttribute('transitioning', true);
    // else document.body.setAttribute('transitioning', false);

    //scroll document automatically when dragging
    //  if(moveEvent.clientY < 50){
    //     document.dispatchEvent(new WheelEvent('wheel', {
    //     deltaY: -100 // adjust the value to control scroll speed
    //   }));}
    //  else if (moveEvent.clientY > window.screenY - 50){
    //     document.dispatchEvent(new WheelEvent('wheel', {
    //     deltaY: 100 // adjust the value to control scroll speed
    // }));}
}
async function beforeReleaseDrag(releaseEvent, _startOut){
    const{DRAG_START} = _startOut;
    const ACTIVE_SLOT = document.body.querySelector('.active-slot:not(.dragging)');
    const DESTINATION_SLOT = ACTIVE_SLOT ?? DRAG_START.SLOT; 
    //console.log(DESTINATION_SLOT);
    return { //B4RELEASE
        ..._startOut,
        IS_SAME_SLOT : DESTINATION_SLOT === DRAG_START.SLOT, 
        DRAG_RELEASE : {
            MPOS : new Vector2(releaseEvent.pageX, releaseEvent.pageY),
            DESTINATION_SLOT, //ACTIVE_SLOT ?? DRAG_START.SLOT; 
            ACTIVE_SLOT, //document.body.querySelector('.active-slot:not(.dragging)');
            HOVERED_SIB : DESTINATION_SLOT?.querySelector('.draggable:hover:not(.dragging)'), 
            FIRST_CHILD : DESTINATION_SLOT?.firstElementChild, 
            LAST_CHILD : DESTINATION_SLOT?.lastElementChild, 
        },
    };
}
export function touchToMouseEvent(event) {
    if (event.touches.length > 1) return; //allow default multi-touch gestures to work
    var touch = event.changedTouches[0];
    var type = "";
    switch (event.type) {
        case "touchstart":type ="mousedown"; break;
        case "touchmove":type="mousemove"; break;
        case "touchend":type="mouseup"; break;
        default: return;
    }
    var simulatedEvent = new MouseEvent(type, {
        bubbles: true,
        cancelable: false,
        view: window,
        screenX: touch.screenX,
        screenY: touch.screenY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0, // usually 0 for the left mouse button
        buttons: 1, // indicates the left mouse button is being pressed
    });
    event.stopPropagation();
    event.preventDefault();
    touch.target.dispatchEvent(simulatedEvent);
};