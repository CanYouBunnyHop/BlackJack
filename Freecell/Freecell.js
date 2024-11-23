import {resetCardGame, Card, getSuitColor, getNeigbourRanks, CARD_DATA} from '../modules/PlayingCards.js';
import Vector2 from '../modules/Vector2.js';
import { setAllElementWithLogic, popRandomFromArr, getCSSDeclaredValue } from '../modules/MyMiscUtil.js';
import{ requestFrame, timer, restartCSSAnimation } from '../modules/CSSAnimationUtil.js';
import {startDrag, slotLogic} from '../modules/MyDraggables.js';
import { Memento, Caretaker } from '../modules/UndoPattern.js';
//free cell //one deck
//tableus, alternating colors
//command pattern with undo
//with seed generation //use PRNG to determines deals?

//52! possible combinations, 
//out of 8.6 billion deals, 102,075 deals are impossible

//The number of sequenced cards you can move is equivalent to the number of open free cells plus one. For example:
// If there are four free cells open, you can move five cards.
// If there are three free cells open, you can move four cards.
// If there are two free cells open, you can move three cards.
// If there is one free cell open, you can move two cards.
// If there are no free cells open, you can move one card.

//There is one exception to this. 

// If you have an open column in addition to free cells, 
// you can move double the number of cards you can move normally. 
// For example, if you have 1 free cell open and 1 empty tableau column, 
// you can effectively move 4 cards (2 cards for the 1 free cell, multiplied by two). 
// This applies as long as you are not moving cards into the actual empty column, 
// in which case you are unable to take advantage of the doubling.

const GAME = document.getElementById('game');
const PROTO_CARD_CONTAINER = document.createElement('div');
PROTO_CARD_CONTAINER.classList.add('card-container', 'draggable', 'slot'); //set dragging parent to card-container

function createCard(_suit, _rank){
    let containerClone = PROTO_CARD_CONTAINER.cloneNode(true);
    containerClone.appendChild(new Card(_suit, _rank).createElement());
    //DEBUG
    containerClone.setAttribute('suit', _suit); containerClone._suit_ = _suit;
    containerClone.setAttribute('rank', _rank); containerClone._rank_ = _rank;

    //set rankdown and rankup
    let o_ranks = getNeigbourRanks(_rank);
    containerClone._rankUp_ = o_ranks.rankUp;
    containerClone._rankDown_ = o_ranks.rankDown;
    
    containerClone.setAttribute('capacity', 2); //2 because holds 1 outer-card and 1 card-container
    return containerClone;
}
//
// For calculating valid moves
//
function getSlotType(_slot){
    const SLOT_TYPE = ['cell','foundation','cascade'].find(type=>_slot.getAttribute('slot-type') === type);
    if (SLOT_TYPE !== undefined) return SLOT_TYPE;
    console.error('INVALID SLOT TYPE', SLOT_TYPE);
    return 'error';
}
function getInnerCount(_startSlot){
    //go outwards then go inwards
    let curSlot = _startSlot;
    let count = _startSlot.classList.contains('ancestor') ? -1 : 0;
    while(curSlot.classList.contains('slot')){
        count++;
        if(curSlot.lastElementChild === null) break;
        curSlot = curSlot.lastElementChild;
    }
    return count;
}
function appendCardToSlot(_slot, _card){
    const SLOT_TYPE = getSlotType(_slot);
    //set attribute need to also travel inwards
    let curCard = _card;
    while(curCard.classList.contains('slot')){
        curCard.setAttribute('slot-type', SLOT_TYPE);   
        curCard = curCard.lastElementChild; //go inwards
    }
    _slot.appendChild(_card);        
}
function isValidCascade(_startCard){
    let curCard = _startCard;
    let output = true;
    let continueLoop = (cur, next)=>{
        if(!next.classList.contains('card-container')) return false;
        let isNextOppositeColor = getSuitColor(cur?._suit_) !== getSuitColor(next._suit_);
        let isNextRankDown = next._rank_ === cur._rankDown_;
        output = isNextOppositeColor && isNextRankDown;
        return output;
    }
    //going inwards and check for validity 
    while(continueLoop(curCard, curCard.lastElementChild)){
        if(curCard.lastElementChild === null) break;
        curCard = curCard.lastElementChild;
    }
    return output;
}
function getAllowedDragCount(){
    const cells = GAME.querySelectorAll('.cell.slot.ancestor');
    const cascades = GAME.querySelectorAll('.cascade.slot.ancestor');
    let emptyCells = [...cells].filter(cell=>!cell.lastElementChild?.classList.contains('card-container'), 0);
    let emptyCascades = [...cascades].filter(cas=>!cas.lastElementChild?.classList.contains('card-container'),0);
    let canMove = emptyCells.length + emptyCascades.length;
    //console.log(emptyCells, emptyCascades);
    if(emptyCascades.length >= 1) return canMove * 2;
    return canMove + 1;
}
//
// FreeCell Logics
//
//const __ANIM_MOVE_INITIAL_TRANSITION = getCSSDeclaredValue(GAME, '--anim-move-initial-transition', false);
const __ANIM_MOVE_TIME = getCSSDeclaredValue(GAME, '--anim-move-time', true);
const __CARD_HEIGHT = getCSSDeclaredValue(GAME, '--card-height', true);
const __CARD_CASCADE_GAP = getCSSDeclaredValue(GAME,'--card-cascade-gap', true);
const __SLOT_BORDER_SIZE = getCSSDeclaredValue(GAME,'--slot-border-size', true);

const MOVE_MANAGER = new Caretaker();
const SOLITAIRE_DECK = createSolitaireDeck(); 
window.onload =()=>{
    dealCards();
    const foundations = document.querySelectorAll('.foundation.slot.ancestor');
    foundations.forEach(el=>el._rankUp_='A');
    setAllElementWithLogic('.slot', 'mouseover', (ev)=>slotLogic(ev, 'mouseout'));
    setAllElementWithLogic('.draggable', 'mousedown', solitaireStartDrag);
};
function createSolitaireDeck(){
    let deck = [];
    for(let suit of CARD_DATA.suits){
        for(let rank of CARD_DATA.ranks){
            deck.push(createCard(suit, rank));
        }
    }
    return deck;
}
//TESTING DEAL//['♠️','♣️','♥️','♦️']
function dealCards(){
    let cascades = [...GAME.querySelectorAll('.cascade.slot.ancestor')];
    let i = 0;
    while(SOLITAIRE_DECK.length > 0){
        if(i > cascades.length-1) i = 0; //loop around back to start
        let randomCard = popRandomFromArr(SOLITAIRE_DECK);
        appendCardToSlot(cascades[i], randomCard);
        cascades[i] = randomCard; //change target slot to the card
        i++;
    }
}

// const tempSlot = document.querySelector('.cascade.slot.ancestor');
// appendCardToSlot(tempSlot, createCard('♠️', 'A'));
// appendCardToSlot(tempSlot.lastChild, createCard('♠️', '2'));
// appendCardToSlot(tempSlot.lastChild.lastChild, createCard('♠️', '3'));
// appendCardToSlot(tempSlot.lastChild.lastChild.lastChild, createCard('♥️', '2'));



function solitaireStartDrag(mdownEvent){
    mdownEvent.stopPropagation();
    let dTarget = mdownEvent.target.closest('.draggable');
    
    let dragCount = getInnerCount(dTarget);
    let allowedDragCount = getAllowedDragCount();

    let allowDrag = isValidCascade(dTarget) && dragCount <= allowedDragCount;
    startDrag(mdownEvent, GAME, __ANIM_MOVE_TIME, ()=>{} , releaseDrag, ()=>{} , allowDrag);
}


async function releaseDrag(b4ReleaseOut){
    //need to somehow prevent drag if cascade down is not valid
    const {DRAG_START, DRAG_TARGET, IS_SAME_SLOT} = b4ReleaseOut;
    let {DRAG_RELEASE : drag_release} = b4ReleaseOut;
    let {DESTINATION_SLOT : dest} = drag_release;
    let dest_type = getSlotType(dest);

    let dragCount = getInnerCount(DRAG_TARGET);
    let ancestorInnerCount = getInnerCount(dest.closest('.slot.ancestor')); 
    const IS_VALID_MOVE = (()=>{
        //return true if is foundation ancestor
        let isDestAncestor = dest.classList.contains('ancestor');
        switch(dest_type){
            case 'cell': 
                return dragCount === 1 && ancestorInnerCount === 0;
            case 'foundation':
                let isSameSuit = isDestAncestor ? true : DRAG_TARGET._suit_ === dest._suit_; 
                let isRankUp = DRAG_TARGET._rank_ === dest._rankUp_;
                return dragCount === 1 && isSameSuit && isRankUp; //DragTarget needs to be same suit, one rank up
            case 'cascade':
                let isRankDown = isDestAncestor ? true : DRAG_TARGET._rank_ === dest._rankDown_;
                let isDiffColor = isDestAncestor ? true : getSuitColor(dest._suit_) !== getSuitColor(DRAG_TARGET._suit_);
                //lose the multiplier if placing into empty ancestor cascade
                let allowedDragCount = isDestAncestor ? getAllowedDragCount()/2 : getAllowedDragCount(); 
                return isRankDown && isDiffColor && dragCount <= allowedDragCount;
            case _: return false;
        }
    })(); 
    console.log('VALID MOVE',IS_VALID_MOVE);

    const NEW_DESTINATION_SLOT = IS_VALID_MOVE ? dest : DRAG_START.SLOT;
    //save start position if move is valid and is not same slot
    if(IS_VALID_MOVE && !IS_SAME_SLOT)
        MOVE_MANAGER.remember(new Memento(DRAG_TARGET, DRAG_START.POS, DRAG_START.SLOT));
    //cascade, card-container, cell, foundation
    const IS_DEST_CARD_CON = NEW_DESTINATION_SLOT.classList.contains('card-container');
    const DESTINATION_SLOT_TYPE = getSlotType(NEW_DESTINATION_SLOT);
    
    const MOVE_OFFSET = (()=>{//Immediate invoke
        const borderOffset = new Vector2(__SLOT_BORDER_SIZE, __SLOT_BORDER_SIZE);
        switch(DESTINATION_SLOT_TYPE){
            case 'cell': return borderOffset;
            case 'foundation': return IS_DEST_CARD_CON ? Vector2.zero : borderOffset;
            case 'cascade': 
                let _cascadeOffset = __CARD_HEIGHT + __CARD_CASCADE_GAP;
                return IS_DEST_CARD_CON? new Vector2(0, _cascadeOffset+4): borderOffset;//magic number 4
    }})();////Immediate invoke ends
    let _destRect = NEW_DESTINATION_SLOT.getBoundingClientRect();
    const MOVE_POS = new Vector2(_destRect.x, _destRect.y).add(MOVE_OFFSET); 
    moveCardWithTransition(DRAG_TARGET, MOVE_POS, NEW_DESTINATION_SLOT);
    return {...b4ReleaseOut, NEW_DESTINATION_SLOT}
}
async function moveCardWithTransition(_card, _movePosition, _destSlot){
    let startRect =  _card.getBoundingClientRect();
    let startPos = new Vector2(startRect.x, startRect.y);
    _card.style.position = 'fixed';
    _card.style.left = `${startPos.x}px`;
    _card.style.top = `${startPos.y}px`;
    GAME.appendChild(_card);
    requestFrame(()=>{
        _card.style.left = `${_movePosition.x}px`;
        _card.style.top = `${_movePosition.y}px`;
    });
    await timer(__ANIM_MOVE_TIME);
    _card.style.position = 'relative';
    _card.style.left = '0px';
    _card.style.top = '0px';
    appendCardToSlot(_destSlot, _card);
}

//TESTING
window.testUndo = ()=>{
    let moveUndo = MOVE_MANAGER.undo();
    moveCardWithTransition(...moveUndo.data);
} 




//
//Util 2
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