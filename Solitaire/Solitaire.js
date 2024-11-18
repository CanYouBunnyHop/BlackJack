import {currentDeck, resetCardGame, Card, CARD_DATA} from '../modules/PlayingCards.js';
import Vector2 from '../modules/Vector2.js';
import { setAllElementWithLogic, popRandomFromArr, getCSSDeclaredValue } from '../modules/MyMiscUtil.js';
import{ requestFrame, timer, restartCSSAnimation } from '../modules/CSSAnimationUtil.js';
import {startDrag, slotLogic} from '../modules/MyDraggables.js';
//free cell //one deck
//tableus, alternating colors
//command pattern with undo
//with seed generation //use PRNG to determines deals?

//52! possible combinations, 
//out of 8.6 billion deals, 102,075 deals are impossible
const GAME = document.getElementById('game');
const PROTO_CARD_CONTAINER = document.createElement('div');
PROTO_CARD_CONTAINER.classList.add('card-container', 'draggable', 'slot'); //set dragging parent to card-container

function createCard(_suit, _number){
    let containerClone = PROTO_CARD_CONTAINER.cloneNode(true);
    containerClone.appendChild(new Card(_suit, _number).createElement());
    //DEBUG
    containerClone.setAttribute('suit', _suit); containerClone._suit_ = _suit;
    containerClone.setAttribute('number', _number); containerClone._number_ = _number;
    return containerClone;
}
function getSlotType(_slot){
    const SLOT_TYPE = ['cell','foundation','cascade'].find(type=>_slot.getAttribute('slot-type') === type);
    if (SLOT_TYPE !== undefined) return SLOT_TYPE;
    else {
        console.log('INVALID SLOT TYPE', SLOT_TYPE);
        return 'error';
    }
}
function appendCardToSlot(_slot, _card){
    const SLOT_TYPE = getSlotType(_slot);
    _card.setAttribute('slot-type', SLOT_TYPE);  
    _slot.appendChild(_card);        
}
//suits : ['♠️','♣️','♥️','♦️']
const __ANIM_MOVE_INITIAL_TRANSITION = getCSSDeclaredValue(GAME, '--anim-move-initial-transition', false);
const __ANIM_MOVE_TIME = getCSSDeclaredValue(GAME, '--anim-move-time', true);
const __CARD_HEIGHT = getCSSDeclaredValue(GAME, '--card-height', true);
const __CARD_CASCADE_GAP = getCSSDeclaredValue(GAME,'--card-cascade-gap', true);
const __SLOT_BORDER_SIZE = getCSSDeclaredValue(GAME,'--slot-border-size', true);


function solitaireStartDrag(mdownEvent){
    mdownEvent.stopPropagation();
    startDrag(mdownEvent, GAME, __ANIM_MOVE_TIME, afterStartDrag, releaseDrag, endTransition);
}



//TESTING
const tempSlot = document.querySelector('.cascade');
appendCardToSlot(tempSlot, createCard('♠️', 'A'));
appendCardToSlot(tempSlot.lastChild, createCard('♠️', '2'));


window.onload =()=>{ //for testing
    setAllElementWithLogic('.slot', 'mouseover', (ev)=>slotLogic(ev, 'mouseout'));
    setAllElementWithLogic('.draggable', 'mousedown', solitaireStartDrag);
}; 
async function afterStartDrag(){}
async function releaseDrag(b4ReleaseOut){
    // DRAG_START : {
    //     SLOT : DRAG_START_SLOT, //mdownEvent.target.closest('.slot');
    //     POS : new Vector2(_rect.x, _rect.y), 
    //     MPOS : new Vector2(mdownEvent.pageX, mdownEvent.pageY),
    //     INDEX : [...DRAG_START_SLOT.children].indexOf(DRAG_TARGET),
    //     NEIGHBOUR : { L: DRAG_TARGET.previousElementSibling, R: DRAG_TARGET.nextElementSibling}
    // }
    // DRAG_RELEASE : {
    //     MPOS : new Vector2(_releaseEvent.pageX, _releaseEvent.pageY),
    //     DESTINATION_SLOT, //ACTIVE_SLOT ?? DRAG_START.SLOT; 
    //     ACTIVE_SLOT, //document.body.querySelector('.active-slot:not(.dragging)');
    //     HOVERED_SIB : DESTINATION_SLOT?.querySelector('.draggable:hover:not(.dragging)'), 
    //     FIRST_CHILD : DESTINATION_SLOT?.firstElementChild, 
    //     LAST_CHILD : DESTINATION_SLOT?.lastElementChild, 
    // },
    const {DRAG_START, DRAG_TARGET, IS_SAME_SLOT, DRAG_RELEASE} = b4ReleaseOut;
    const {DESTINATION_SLOT} = DRAG_RELEASE;
    //cascade, card-container, cell, foundation
    const IS_DEST_CARD_CON = DESTINATION_SLOT.classList.contains('card-container');
    const DESTINATION_SLOT_TYPE = getSlotType(DESTINATION_SLOT);
    
    const MOVE_OFFSET = (()=>{
        const borderOffset = new Vector2(__SLOT_BORDER_SIZE, __SLOT_BORDER_SIZE);
        switch(DESTINATION_SLOT_TYPE){//Immediate invoke
            case 'cell': return borderOffset;
            case 'foundation': return IS_DEST_CARD_CON ? Vector2.zero : borderOffset;
            case 'cascade': 
                let _cascadeOffset = __CARD_HEIGHT + __CARD_CASCADE_GAP;
                return IS_DEST_CARD_CON? new Vector2(0, _cascadeOffset+3): borderOffset;//magic number 3
    }})();////Immediate invoke ends
   
    let _destRect = DESTINATION_SLOT.getBoundingClientRect();
    const movePos = new Vector2(_destRect.x, _destRect.y); 

    DRAG_TARGET.style.left =`${movePos.x + MOVE_OFFSET.x}px`;
    DRAG_TARGET.style.top = `${movePos.y + MOVE_OFFSET.y}px`;
    return {...b4ReleaseOut}
}
async function endTransition(releaseOut){
    const {DRAG_TARGET, DRAG_RELEASE} = releaseOut;
    const {DESTINATION_SLOT} = DRAG_RELEASE;
    //append to slot
    DRAG_TARGET.style.position = 'relative';
    DRAG_TARGET.style.left = '0px'; DRAG_TARGET.style.top = '0px';
    appendCardToSlot(DESTINATION_SLOT, DRAG_TARGET);
}


const cardRanks = {};
function getSuitColor(_suit){
    // /['♠️','♣️','♥️','♦️']
    switch(_suit){
        case '♠️': case '♣️': return 'black';
        case '♥️': case'♦️': return 'red';
    }
}
//
//Util
//
class LinkedListItem{
    constructor(_self, _next = null, _prev = null){
        this.self = _self;
        this.next = _next;
        this.prev = _prev;
    }
}
class LinkedList{
    constructor(){
        this.head = null;
        this.length = 0;
    }
    appendItem(_data){
        let newItem = new LinkedListItem(_data);
        if(!this.head) {
            this.head = newItem;
        }
        else {
            let cur = this.head;
            while(cur.next){cur = cur.next;}//find next available space
            cur.next = newItem; //current item next is new item
            newItem.prev = cur; //newItem's prev is current
        }
        this.length++;
    }
    removeItem(_position){
        if(_position < 0 || _position > this.length - 1) {
            throw new Error("Invalid index, Out of bounds");
        }
        let cur = this.head;
        let prev = null;
        for (let i = 0; i < _position; i++){//get to the target index position
            prev = cur; //current becomes previous
            cur = cur.next; //next becomes current
        }
        if(_position === 0){ this.head = cur.next;}
        else { prev.next = cur.next; }
        cur.next.prev = prev;
        this.length--;
    }
    insertItem(_position, _data){
        let newItem = new LinkedListItem(_data);
        //array pushing everything else back
        if(_position < 0 || _position > this.length - 1) {
            throw new Error("Invalid index, Out of bounds");
        }
        let cur = this.head;
        let prev = null;
        for (let i = 0; i < _position; i++){//get to the target index position
            prev = cur; //current becomes previous
            cur = cur.next; //next becomes current
        }
        if(_position === 0){ this.head = newItem;} //new head
        prev.next = newItem; cur.prev = newItem; 
        newItem.prev = prev;
        newItem.next = cur;
        this.length++;
    }
    searchAt(_position){
        if(_position < 0 || _position > this.length - 1) {
            throw new Error("Invalid index, Out of bounds");
        }
        let cur = this.head;
        for (let i = 0; i < _position; i++){//get to the target index position
            cur = cur.next; //next becomes current
        }
        return cur;
    }
    indexOf(_data){
        let cur = this.head;
        let index = 0;
        while(cur && cur.self !== _data){
            cur = cur.next;
            index++;
        }
        if(cur && cur.self === _data) return index;
        else return -1;
    }
    static arrToLinkedList(_arr){
        let newLinkedList = new LinkedList();
        for(let item of _arr){newLinkedList.appendItem(item)};
        return newLinkedList;
    }
    static toArray(){
        let arr = [];
        let cur = this.head;
        while(cur !== null){
            arr.push(cur);
        }
        return arr;
    }
}