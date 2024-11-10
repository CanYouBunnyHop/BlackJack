import Vector2 from "./Vector2.js";
import { timer } from "./CSSAnimationUtil.js";
import { getNeighborElsInParent } from "./MyMiscUtil.js";

export function setSlotLogic(element, _slotLogic = defaultSlotLogic){element.addEventListener('mouseenter', _slotLogic)};
export function defaultSlotLogic(event){
    let slot = event.target;
    slot.classList.add('active-slot');
    slot.addEventListener('mouseleave', _event=>{ slot.classList.remove('active-slot') });
}

export function startDragChain(mdownEvent, parentElement, animationTime = 0,
    afterStartDrag = async (startOut)=>{},
    releaseDragChain = async(_b4ReleaseOut)=>{return {..._b4ReleaseOut}}, 
    endTransition= async(_releaseOut)=>{return {..._releaseOut}}){//start drag chain function
        const DRAG_TARGET = mdownEvent.target.closest('.draggable');
        const START_SLOT = mdownEvent.target.closest('.slot');
        if(!START_SLOT || document.body.getAttribute('transitioning') === 'true') return Promise.reject();

        document.body.setAttribute('drag-active', true);
        const INITIAL_DRAG_TARGET_TRANSITION = DRAG_TARGET.style.transition;
        DRAG_TARGET.style.transition = `left 0s, top 0s, margin ${animationTime}s`;
        requestAnimationFrame(()=>{DRAG_TARGET.classList.add('dragging')}); //delayed for css animation

        let _rect = DRAG_TARGET.getBoundingClientRect();
        const START_OUTPUT = {
            DRAG_TARGET, START_SLOT,
            START_RECT : new Vector2(_rect.x, _rect.y), 
            START_MPOS : new Vector2(mdownEvent.pageX, mdownEvent.pageY),
            START_INDEX : [...START_SLOT.children].indexOf(DRAG_TARGET),
            START_SIBLING_L : getNeighborElsInParent(DRAG_TARGET, START_SLOT).prev,
            START_SIBLING_R : getNeighborElsInParent(DRAG_TARGET, START_SLOT).next,
        }
        parentElement.appendChild(DRAG_TARGET);
        afterStartDrag(START_OUTPUT);
        draggingLogic(mdownEvent, START_OUTPUT);
        const DRAGGING_REF = (moveEvent)=>draggingLogic(moveEvent, START_OUTPUT);
        document.addEventListener('mousemove', DRAGGING_REF);
        //ReleaseDrag
        const ON_MOUSE_UP_REF = onMouseUp;
        document.addEventListener('mouseup', ON_MOUSE_UP_REF);
        async function onMouseUp(releaseEvent){
            document.body.setAttribute('drag-active', false);
            document.removeEventListener('mousemove', DRAGGING_REF);
            DRAG_TARGET.style.transition = INITIAL_DRAG_TARGET_TRANSITION;
            
            DRAG_TARGET.classList.remove('dragging');
            const B4RELEASE_OUTPUT = await beforeReleaseDrag(releaseEvent, START_OUTPUT);
            const RELEASE_OUTPUT = await releaseDragChain(B4RELEASE_OUTPUT); //parse in stuff? //Move position here
            await timer(animationTime);
            await endTransition(RELEASE_OUTPUT); //parse in stuff
            document.body.setAttribute('transitioning', false);
            document.removeEventListener('mouseup', ON_MOUSE_UP_REF);
        } 
}
function draggingLogic(moveEvent, startOutput){
    const{DRAG_TARGET, START_RECT, START_MPOS} = startOutput;
    let curMPos = new Vector2(moveEvent.pageX, moveEvent.pageY);
    let mDelta = curMPos.subtract(START_MPOS);
    let followPos = START_RECT.add(mDelta);
    //follow mouse
    DRAG_TARGET.style.position = 'fixed';
    DRAG_TARGET.style.left = `${followPos.x}px`;
    DRAG_TARGET.style.top = `${followPos.y}px`;

    if(followPos.x!==START_RECT.x||followPos.y!==START_RECT.y)
        document.body.setAttribute('transitioning', true);
    else document.body.setAttribute('transitioning', false);
}
async function beforeReleaseDrag(_releaseEvent, startOutput){
    const{START_SLOT} = startOutput;
    const ACTIVE_SLOT = document.body.querySelector('.active-slot[lock=false]:not(.dragging)');
    const TARGET_SLOT = ACTIVE_SLOT ?? START_SLOT; 
    const IS_RETURNING = TARGET_SLOT === START_SLOT;
    const TARGET_SLOT_HOVERED_SIB = TARGET_SLOT?.querySelector('.draggable:hover:not(.dragging)');
    const TARGET_SLOT_FIRST_CHILD = TARGET_SLOT?.firstElementChild;
    const TARGET_SLOT_LAST_CHILD = TARGET_SLOT?.lastElementChild;
   
    const RELEASE_OUTPUT = {
        ...startOutput,
        RELEASE_EVENT : _releaseEvent, 
        ACTIVE_SLOT, 
        TARGET_SLOT, 
        IS_RETURNING, 
        TARGET_SLOT_HOVERED_SIB, 
        TARGET_SLOT_FIRST_CHILD, 
        TARGET_SLOT_LAST_CHILD, 
    }; return RELEASE_OUTPUT;
}




//
//  promise chain pseudocode
//
// mdown => getMdownData => addEventListeners
// mouseUp => getMUpData => move to position, apply offsets... => wait for animation time => end transistion
//