alert('load Freecell.js');
import {Card, getSuitColor, getNeigbourRanks, CARD_DATA, debugCardHTML} from '../modules/PlayingCards.js';
alert('import PlayingCards.js')
import Vector2 from '../modules/Vector2.js';
alert('import Vector2.js')
import { setAllElementWithLogic, popRandomFromArr, getCSSDeclaredValue, convertCSSPropertyToNumeric } from '../modules/MyMiscUtil.js';
import{ requestFrame, timer} from '../modules/CSSAnimationUtil.js';
import {startDrag, slotLogic} from '../modules/MyDraggables.js';
import { Memento, Caretaker } from '../modules/UndoPattern.js';
alert('import Other stuff')
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
//♠♣♥♦ 

//#region globals
// const GAME = document.getElementById('game');
// const PROTO_CARD_CONTAINER = document.createElement('div');
// PROTO_CARD_CONTAINER.classList.add('card-container', 'draggable', 'slot'); //set dragging parent to card-container
// //CSS
// const __CARD_SCALE = getCSSDeclaredValue(GAME,'--card-scale', true);
// const __ANIM_MOVE_TIME = getCSSDeclaredValue(GAME, '--anim-move-time', true);
// const __CARD_HEIGHT = getCSSDeclaredValue(GAME, '--card-height', true);
// const __CARD_CASCADE_GAP = getCSSDeclaredValue(GAME,'--card-cascade-gap', true);
// const __SLOT_BORDER_SIZE = getCSSDeclaredValue(GAME,'--slot-border-size', true);
// const borderOffset = new Vector2(__SLOT_BORDER_SIZE, __SLOT_BORDER_SIZE);

// const MOVE_MANAGER = new Caretaker();
// const SOLITAIRE_DECK = createSolitaireDeck();
// //node lists 
// const FOUNDATIONS = GAME.querySelectorAll('.foundation.slot.ancestor');
// const CASCADES = GAME.querySelectorAll('.cascade.slot.ancestor');
// const CELLS = GAME.querySelectorAll('.cell.slot.ancestor');
// //#endregion
// //#region Define Gameobjects
// function isValidCascade(_startSlot){
//     let curCard = _startSlot;
//     let isValid = true;
//     while(curCard._next_ && isValid){
//         let nextCard = curCard._next_;
//         //need exception for cascades
//         let isNextOppositeColor = getSuitColor(curCard._suit_) !== getSuitColor(nextCard._suit_);
//         let isNextRankDown = nextCard._rank_ === curCard._rankDown_;
//         isValid = isNextOppositeColor && isNextRankDown;
//         curCard = curCard._next_;
//     }
//     return isValid;
// }
// //functionalities card and ancestor share
// function cardAndAncestorLogic(el){
//     Object.defineProperties(el, {
//         _prev_ : {get : ()=>{
//             return el.parentElement?.classList.contains('card-container') ? 
//             el.parentElement : null;
//         }},
//         _next_ : {get : ()=>{
//             return el.lastElementChild?.classList.contains('card-container') ? 
//             el.lastElementChild : null;
//         }},
//         _toArr: {value : ()=>{
//             let curCard = el._head_;
//             let casArr = [];
//             while(curCard){
//                 casArr.push(curCard);
//                 curCard = curCard._next_;
//             }
//             return casArr;
//         }},
//         _head_ : { get : ()=>{
//             if(el.classList.contains('ancestor'))return el._next_;
//             //get furthest parent, that is still a slot?
//             let curSlot = el;
//             while(el.parentElement?.classList.contains('card-container')){curSlot = el.parentElement;}
//             return curSlot;
//         }},
//         _tail_ : { get : ()=>{
//             let cur = el;
//             while(cur._next_){cur = cur._next_;}
//             return cur;
//         }},
//         _ancestor_ : {get : ()=>{
//             return el.closest('.ancestor');
//         }},
//         _ancestorType_ :{get : ()=>{
//             return el._ancestor_.getAttribute('ancestor-type');
//         }},
//         _isValid_ : {get : ()=>{
//             let curCard = el;
//             let isValid = true;
//             while(curCard._next_ && isValid){
//                 if(curCard.classList.contains('ancestor')){
//                     curCard = curCard._next_;
//                     continue;
//                 }
//                 let nextCard = curCard._next_;
//                 //need exception for cascades
//                 let isNextOppositeColor = getSuitColor(curCard._suit_) !== getSuitColor(nextCard._suit_);
//                 let isNextRankDown = nextCard._rank_ === curCard._rankDown_;
//                 isValid = isNextOppositeColor && isNextRankDown;
//                 curCard = curCard._next_;
//             } return isValid;
//         }},
//         _appendCard : {value : (_card)=>{
//             let aType = el._ancestorType_;
//             //go inwards
//             let curCard = _card;
//             while(curCard){
//                 curCard.setAttribute('ancestor-type', aType);
//                 curCard = curCard._next_;
//             }
//             //append
//             el.appendChild(_card);
//         }}
//     });
// }
// //Tableaus logic
// [...CASCADES, ...FOUNDATIONS, ...CELLS].forEach(el=>{
//     cardAndAncestorLogic(el);
//     Object.defineProperties(el,{
//         _suit_ : { get : ()=>{return el._head_?._suit_;}},
//     });
// })
// function createCard(_suit, _rank){
//     let containerClone = PROTO_CARD_CONTAINER.cloneNode(true);
//     containerClone.appendChild(new Card(_suit, _rank).createElement());
//     //DEBUG SET ATTRIBUTE
//     containerClone._suit_ = _suit;
//     containerClone._rank_ = _rank;
//     containerClone.id = _suit+_rank;
//     //set rankdown and rankup
//     let o_ranks = getNeigbourRanks(_rank);
//     containerClone._rankUp_ = o_ranks.rankUp;
//     containerClone._rankDown_ = o_ranks.rankDown;
//     //2 because holds 1 outer-card and 1 card-container
//     containerClone.setAttribute('capacity', 2);
//     //add some logic
//     cardAndAncestorLogic(containerClone);
//     return containerClone;
// }
// //#endregion

// //#region Freecell Main
// //
// function resizeCard(){
//     //1536 is standard default window size on desktop
//     let gameWidth = getCSSDeclaredValue(GAME, 'width', true);
//     let ratio = (gameWidth/ 1536)*__CARD_SCALE; 
//     GAME.style.setProperty('--card-scale', ratio);
// }

// debugCardHTML();
// alert('outside onload sucessful');

// var debugDiv = document.getElementById('debug');
// window.onresize = ()=>{resizeCard();}
// window.onload =()=>{
//    alert('onload sucessful');

//     //debug
//     setTimeout(()=>debugDiv.innerHTML += 'd', 1000); 

//     resizeCard();
//     dealCards();
//     //debugDeal();
//     //debugDealLong();
//     //It probably will never happen but it's possible starting deal is also winning deal
//     FOUNDATIONS.forEach(el=>el._rankUp_='A'); //foundations only take Aces at the beginning
//     setAllElementWithLogic('.slot', 'mouseover', (ev)=>slotLogic(ev, 'mouseout'));
//     setAllElementWithLogic('.draggable', 'mousedown', solitaireStartDrag);

//     let _curStyle = getComputedStyle(GAME);
//     let _curHeight = _curStyle.getPropertyValue('height');
//     let _curHeightNumeric = convertCSSPropertyToNumeric(_curHeight);
//     let totalHeight = _curHeightNumeric + (__CARD_HEIGHT + __CARD_CASCADE_GAP)*22;
//     GAME.style.height = `${totalHeight}px`; //resize game height to tallest possible, avoid resizing
// };
// //Undo button 
// window.undoButton = ()=>{
//     let moveUndo = MOVE_MANAGER.undo();
//     moveCardWithTransition(...moveUndo.data);
// } 
// function createSolitaireDeck(){
//     let deck = [];
//     for(let suit of CARD_DATA.suits){
//         for(let rank of CARD_DATA.ranks){
//             deck.push(createCard(suit, rank));
//         }
//     }
//     return deck;
// }
// function dealCardWithID(_cascadeAncestor, ..._cardIds){
//     for(let cardId of _cardIds){
//         cardId = [...cardId];
//         let suit = cardId.shift(); 
//         let rank = cardId.join('');
//         _cascadeAncestor._tail_._appendCard(createCard(suit, rank));
//     }

// }
// function debugDeal(){
//     let cascades = [...CASCADES];
//     dealCardWithID(cascades[0],'♠K','♥Q','♠J','♥10','♠9','♥8','♠7');
//     dealCardWithID(cascades[1],'♣K','♦Q','♣J','♦10','♣9','♦8','♣7');
//     dealCardWithID(cascades[2],'♥K','♠Q','♥J','♠10','♥9','♠8','♥7');
//     dealCardWithID(cascades[3],'♦K','♣Q','♦J','♣10','♦9','♣8','♦7');
//     dealCardWithID(cascades[4],'♠6','♥5','♠4','♥3','♠2','♥A');
//     dealCardWithID(cascades[5],'♣6','♦5','♣4','♦3','♣2','♦A');
//     dealCardWithID(cascades[6],'♥6','♠5','♥4','♠3','♥2','♠A');
//     dealCardWithID(cascades[7],'♦6','♣5','♦4','♣3','♦2','♣A');
// }
// function debugDealLong(){
//     let cascades = [...CASCADES];
//     //longest possible chain that is valid
//     dealCardWithID(cascades[0],
//         '♠K','♥Q','♠J','♥10','♠9','♥8','♥K','♠Q','♥J','♠10','♥9','♠8',
//         '♥7','♠6','♥5','♠4','♥3','♠2','♥A'
//     );
// }
// function dealCards(){
//     let cascadeEnds = [...CASCADES];
//     let i = 0;
//     while(SOLITAIRE_DECK.length > 0){
//         if(i > cascadeEnds.length-1) i = 0; //loop around back to start
//         let randomCard = popRandomFromArr(SOLITAIRE_DECK);
//         cascadeEnds[i]._appendCard(randomCard);
//         cascadeEnds[i] = randomCard; //change target slot to the card
//         i++;
//     }
// }

// async function winCondition(){
//     let cells = [...CELLS];
//     let cascades = [...CASCADES];
//     let foundations = [...FOUNDATIONS];
//     //check for win-condition...
//     if(!cascades.every(f=>{return f._isValid_})) return;
//     let everyCardLeft = cells.concat(cascades).reduce((allCards, curTab)=>allCards.concat(curTab._toArr()),[]).length;
//     while(everyCardLeft > 0){
//         for(let foundation of foundations){
//             let isFoundationEmpty = foundation._head_===null ? true : false;
//             let tail =  foundation._tail_;
//             let validId = isFoundationEmpty ? ['♠A','♣A','♥A','♦A'].find(aceId=>
//                 document.getElementById(aceId)._ancestorType_ !== 'foundation') : 
//                 tail._suit_ + tail._rankUp_;
//             let validCard = document.getElementById(validId);
//             //if no validcard or valid card is not tail, continue to next foundation
//             if(validCard === null || validCard._next_ !== null) continue;
//             let mrect = foundation.getBoundingClientRect();
//             let movePos = new Vector2(mrect.x, mrect.y).add(borderOffset);
//             await requestFrame(); //delayed fixed animation, idk why
//             await moveCardWithTransition(validCard, movePos, tail);
//             everyCardLeft--;
//         }
//     }
// }
// //#endregion Freecell Main
// //
// //#region Freecell Algo
// //
// function getInnerCount(_startSlot){ //Turn to get LinkedList
//     //go outwards then go inwards
//     let curSlot = _startSlot;
//     let count = _startSlot.classList.contains('ancestor') ? -1 : 0;
//     while(curSlot.classList.contains('slot')){
//         count++;
//         if(curSlot.lastElementChild === null) break;
//         curSlot = curSlot.lastElementChild;
//     }
//     return count;
// }
// function getAllowedDragCount(){
//     let emptyCells = [...CELLS].filter(cell=>!cell._head_, 0);
//     let emptyCascades = [...CASCADES].filter(cas=>!cas._head_, 0);
//     let canMove = emptyCells.length + emptyCascades.length;
//     if(emptyCascades.length >= 1) return canMove * 2; //if has empty column advantage
//     return canMove + 1;
// }
// //#endregion

// //
// //#region Drag Logics
// //
// function solitaireStartDrag(mdownEvent){
//     mdownEvent.stopPropagation();
//     let dTarget = mdownEvent.target.closest('.draggable');
//     let dragCount = getInnerCount(dTarget);
//     let allowedDragCount = getAllowedDragCount();
//     let allowDrag = isValidCascade(dTarget) && dragCount <= allowedDragCount;
//     startDrag(mdownEvent, GAME, __ANIM_MOVE_TIME, afterStartDrag , releaseDrag, endTransition, allowDrag);
// }
// async function afterStartDrag(_startOut) {
//     const {DRAG_TARGET} = _startOut;
    
//     return {..._startOut};
// }
// async function releaseDrag(b4ReleaseOut){
//     //need to somehow prevent drag if cascade down is not valid
//     const {DRAG_START, DRAG_TARGET, IS_SAME_SLOT} = b4ReleaseOut;
//     let {DRAG_RELEASE : drag_release} = b4ReleaseOut;
//     let {DESTINATION_SLOT : dest} = drag_release;
//     let dest_type = dest._ancestorType_;

//     let dragCount = getInnerCount(DRAG_TARGET);
//     let ancestorInnerCount = getInnerCount(dest.closest('.slot.ancestor')); 
//     const IS_VALID_MOVE = (()=>{
//         //return true if is foundation ancestor
//         let isDestAncestor = dest.classList.contains('ancestor');
//         switch(dest_type){
//             case 'cell': 
//                 return dragCount === 1 && ancestorInnerCount === 0;
//             case 'foundation':
//                 let isSameSuit = isDestAncestor ? true : DRAG_TARGET._suit_ === dest._suit_; 
//                 let isRankUp = DRAG_TARGET._rank_ === dest._rankUp_;
//                 return dragCount === 1 && isSameSuit && isRankUp; //DragTarget needs to be same suit, one rank up
//             case 'cascade':
//                 let isRankDown = isDestAncestor ? true : DRAG_TARGET._rank_ === dest._rankDown_;
//                 let isDiffColor = isDestAncestor ? true : getSuitColor(dest._suit_) !== getSuitColor(DRAG_TARGET._suit_);
//                 //lose the multiplier if placing into empty ancestor cascade
//                 let allowedDragCount = isDestAncestor ? getAllowedDragCount()/2 : getAllowedDragCount(); 
//                 return isRankDown && isDiffColor && dragCount <= allowedDragCount;
//             case _: return false;
//         }
//     })(); console.log('VALID MOVE',IS_VALID_MOVE);

//     const NEW_DESTINATION_SLOT = IS_VALID_MOVE ? dest : DRAG_START.SLOT;
//     //save start position if move is valid and is not same slot
//     if(IS_VALID_MOVE && !IS_SAME_SLOT)
//         MOVE_MANAGER.remember(new Memento(DRAG_TARGET, DRAG_START.POS, DRAG_START.SLOT));
//     //cascade, card-container, cell, foundation
//     const IS_DEST_CARD_CON = NEW_DESTINATION_SLOT.classList.contains('card-container');
//     const DESTINATION_SLOT_TYPE = NEW_DESTINATION_SLOT._ancestorType_;
    
//     const MOVE_OFFSET = (()=>{//Immediate invoke
        
//         switch(DESTINATION_SLOT_TYPE){
//             case 'cell': return borderOffset;
//             case 'foundation': return IS_DEST_CARD_CON ? Vector2.zero : borderOffset;
//             case 'cascade': 
//                 let _cascadeOffset = __CARD_HEIGHT + __CARD_CASCADE_GAP;
//                 return IS_DEST_CARD_CON? new Vector2(0, _cascadeOffset+4): borderOffset;//magic number 4
//     }})();////Immediate invoke ends
//     let _destRect = NEW_DESTINATION_SLOT.getBoundingClientRect();
//     const MOVE_POS = new Vector2(_destRect.x, _destRect.y).add(MOVE_OFFSET); 
//     moveCardWithTransition(DRAG_TARGET, MOVE_POS, NEW_DESTINATION_SLOT);
//     const START_CAS_ANCESTOR = DRAG_START.SLOT.closest('.cascade.slot.ancestor');
//     const DEST_CAS_ANCESTOR = NEW_DESTINATION_SLOT.closest('.cascade.slot.ancestor');
//     return {...b4ReleaseOut, NEW_DESTINATION_SLOT, START_CAS_ANCESTOR, DEST_CAS_ANCESTOR}
// }
// //NOTE: can move to draggable module
// async function moveCardWithTransition(_card, _movePosition, _destSlot){ 
//     let startRect =  _card.getBoundingClientRect();
//     let startPos = new Vector2(startRect.x, startRect.y);
//     _card.style.position = 'fixed';
//     _card.style.left = `${startPos.x}px`;
//     _card.style.top = `${startPos.y}px`;
//     GAME.appendChild(_card);
//     requestFrame(()=>{
//         _card.style.left = `${_movePosition.x}px`;
//         _card.style.top = `${_movePosition.y}px`;
//     });
//     await timer(__ANIM_MOVE_TIME);
//     _card.style.position = 'relative';
//     _card.style.left = '0px';
//     _card.style.top = '0px';
//     _destSlot._appendCard(_card);
// }
// async function endTransition(_releaseOut){//after transition ends
//     const{START_CAS_ANCESTOR, DEST_CAS_ANCESTOR} = _releaseOut;
//     await winCondition();
// }
// //#endregion

// //
// //#region Util 2
// //

// //#endregion