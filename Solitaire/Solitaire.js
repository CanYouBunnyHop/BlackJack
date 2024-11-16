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
//suits : ['♠️','♣️','♥️','♦️']
const __ANIM_MOVE_INITIAL_TRANSITION = getCSSDeclaredValue(GAME, '--anim-move-initial-transition', false);


function solitaireStartDrag(mdownEvent){
    //startDrag(mdownEvent, GAME, __ANIM_MOVE_TIME, afterStartDrag, releaseDragInHand, dragEndTransition);
    startDrag(mdownEvent, GAME)
}
function releaseDragInCardContainer(){

}


//TESTING
const tempSlot = document.querySelector('.cascade');
tempSlot.appendChild(createCard('♠️', 'A'));
tempSlot.lastChild.appendChild(createCard('♠️', '2'));

window.onload =()=>{ //for testing
    setAllElementWithLogic('.slot', 'mouseover', (ev)=>slotLogic(ev, 'mouseout'));
    setAllElementWithLogic('.draggable', 'mousedown', (startEvent)=>startDrag(startEvent, GAME));
}; 


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