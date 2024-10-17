//
//PLAYING CARD GAMES SHARED LOGIC
//
const GAME = document.getElementById('game');
const PROTO_SUIT = document.createElement('span');
PROTO_SUIT.classList.add('suit');
const PROTO_CARD = GAME.querySelector('.outer-card.prototype'); //GET THE PROTOTYPE ELEMENT
const CARD_DATA = {
    numbers : ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
    suits : ['♠️','♣️','♥️','♦️'],
    get randomNumber(){return getRandomFromArr(this.numbers);},
    get randomSuit(){return getRandomFromArr(this.suits);},
};
class Card {
    constructor(_suit, _number) {this.suit = _suit; this.number = _number;}
    createElement(){
        let clone = PROTO_CARD.cloneNode(true);
        clone.classList.remove('prototype');
        clone._cardDisplay_= clone.querySelector('.card-front-display');
        let leftCol = clone._cardDisplay_.querySelector('.column[POS="LEFT"]');
        let midCol = clone._cardDisplay_.querySelector('.column[POS="MIDDLE"]');
        let rightCol = clone._cardDisplay_.querySelector('.column[POS="RIGHT"]');
        //CREATE SUIT OBJECT BASE ON NUMBERS HERE
        let appendSuits=(l,m,r)=>{//ADD SUIT TO COLUMNS
            for(let i=0; i<l; i++){leftCol.appendChild(PROTO_SUIT.cloneNode());}
            for(let i=0; i<m; i++){midCol.appendChild(PROTO_SUIT.cloneNode());}
            for(let i=0; i<r; i++){rightCol.appendChild(PROTO_SUIT.cloneNode());}
            rotateBotSuits();
        }
        let rotateBotSuits=()=>{
            [leftCol, midCol, rightCol].forEach(innerArr=>{ //MOVE SPLIT ARRAY IN HALF TO UTIL
                let botHalfCount = Math.floor(innerArr.children.length/2);
                let slicePos = innerArr.children.length - botHalfCount;
                let botHalf = [...innerArr.children].slice(slicePos);
                [...botHalf].forEach(suit=>{suit.style.transform = 'rotate(180deg)'});
            });
        }
        let hideSuit=(col, index)=>{col.children[index].style.visibility ='hidden';}
        switch (this.number){
            case 'A':appendSuits(0,1,0);break;
            case '2':appendSuits(0,2,0);break;
            case '3':appendSuits(0,3,0);break;
            case '4':appendSuits(2,0,2);break;
            case '5':appendSuits(2,1,2);break;
            case '6':appendSuits(3,0,3);break;
            case '7':appendSuits(3,2,3); hideSuit(midCol, 1); break;
            case '8':appendSuits(3,2,3);break;
            case '9':appendSuits(4,1,4);break;
            case '10':appendSuits(4,2,4);break;
            case 'J': case 'Q': case 'K':appendSuits(2,0,2); hideSuit(leftCol, 1); hideSuit(rightCol, 0); break;
        }
        [...clone.querySelectorAll('.number')].forEach(element=>{element.innerHTML = this.number;});
        [...clone.querySelectorAll('.suit')].forEach(element=>{element.innerHTML = this.suit;});
        clone.style.color = ['♥️','♦️'].includes(this.suit) ? 'crimson' : 'black';
        return clone;
    }
}
const PLAYER_HAND = GAME.querySelector('#player-hand');
const DEALER_HAND = GAME.querySelector('#dealer-hand');
const PROTO_DECK = createDeck(); //Cache the deck, no need to loop again
var currentDeck = [...PROTO_DECK];
function createDeck(){
    var deck = [];
    for(let suit of CARD_DATA.suits)
        for(let number of CARD_DATA.numbers)
            deck.push(new Card(suit, number));
    return deck;
}
function resetCurrentDeck(){currentDeck = [...PROTO_DECK]};
function resetCardGame(){
    resetCurrentDeck();
    //ADD ANIMATION TODO
    let cards = GAME.querySelectorAll('.outer-card:not(.prototype)');
    cards.forEach(card=>{card.remove()})
}
//Event Listener Wrapper / Rename
function setSlotLogic(element){element.addEventListener('mouseenter', slotLogic)}
function setDraggableLogic(element){element.addEventListener('mousedown', draggableLogic);}

const _cardStyle = getComputedStyle(GAME);
const CARD_STYLE = {};
const CARD_STYLE_PROPERTIES = {
    __card_width: '--card-width',
    __card_height:'--card-height',
    __hand_card_offset: '--hand-card-offset',
    __anim_select_dist: '--anim-select-dist',
    __anim_insert_dist:'--anim-insert-dist',
    __anim_time_scale: '--anim-time-scale',
    __anim_flippable_time:'--anim-flippable-time',
    __anim_select_time : '--anim-select-time',
    __anim_move_time : '--anim-move-time',
    RAW__anim_move_initial_transition : '--anim-move-initial-transition', //RAW means don't convert to numeric
};
//Get the values set in css
Object.keys(CARD_STYLE_PROPERTIES).forEach(key=>{
    Object.defineProperty(CARD_STYLE, key, {
    get: ()=>{
        let value = _cardStyle.getPropertyValue(CARD_STYLE_PROPERTIES[key]);
        if(key.startsWith('RAW')) return value;
        return convertCSSPropertyToNumeric(value);
    }});
});
//Destructuring card style Doesnt work on getters, assign them manually
const __CARD_WIDTH = CARD_STYLE.__card_width, 
    __CARD_HEIGHT = CARD_STYLE.__card_height, 
    __HAND_CARD_OFFSET = CARD_STYLE.__hand_card_offset,
    __ANIM_SELECT_DIST = CARD_STYLE.__anim_select_dist,
    __ANIM_INSERT_DIST = CARD_STYLE.__anim_insert_dist,
    __ANIM_TIME_SCALE = CARD_STYLE.__anim_time_scale,
    __ANIM_FLIPPABLE_TIME = CARD_STYLE.__anim_flippable_time,
    __ANIM_SELECT_TIME = CARD_STYLE.__anim_select_time,
    __ANIM_MOVE_TIME = CARD_STYLE.__anim_move_time,
    __ANIM_MOVE_INITIAL_TRANSITION = CARD_STYLE.RAW__anim_move_initial_transition;
//
// DRAGGABLE RELATED LOGICS
// BUG: targetpos.sibR.marginleft // not fixed
function draggableLogic(startEvent){ //MOUSE DOWN EVENT
    const DRAG_TARGET = startEvent.target.closest('.draggable');
    function setDragging(boolean = true){
        GAME.setAttribute('drag-active', boolean);//FOR CSS TO USE THE RIGHT STYLES
        if(boolean){
            requestAnimationFrame(()=>{DRAG_TARGET.classList.add('dragging')});//for flipping animation
            DRAG_TARGET.style.transition = `left 0s, top 0s, margin ${__ANIM_MOVE_TIME}s`;
        }else{
            DRAG_TARGET.classList.remove('dragging'); 
            DRAG_TARGET.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;
        }
    }
    if(DRAG_TARGET.getAttribute('lock') === "true") return; //IF LOCKED RETURN
    if(GAME.getAttribute('transitioning') === "true") return; //OPTIONAL
    let _startSlot = startEvent.target.closest('.slot');
    if(!_startSlot) return; //THIS PREVENT SPAM CLICK
    DRAG_TARGET.style.marginLeft = '0px';
    let _targetRect = DRAG_TARGET.getBoundingClientRect();
    let _targetNeighbors = getNeighborElsInParent(DRAG_TARGET, _startSlot);
    const START_POS = {//remember origin, child index
        mousePos: new Vector2(startEvent.pageX, startEvent.pageY),
        x: _targetRect.x,
        y: _targetRect.y,
        index: [..._startSlot.children].indexOf(DRAG_TARGET),
        slot: _startSlot,
        sibL: _targetNeighbors.prev,
        sibR: _targetNeighbors.next
    };
    const HAND_CARD_WIDTH = __CARD_WIDTH + __HAND_CARD_OFFSET;
    let dragTargetWas1st = START_POS.index===1;
    if(START_POS.sibR){//If start sibR exist, apply hand-card width Margin Offset
        playTransition(START_POS.sibR, 'margin 0s', 
            [new PropValPair('marginLeft',`${HAND_CARD_WIDTH}px`)],
            `${__ANIM_MOVE_INITIAL_TRANSITION}`
        );
    }
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', releaseDrag);
    DRAG_TARGET.style.position = 'fixed';
    DRAG_TARGET.classList.add('disable-hover-anim'); //For css, disable hover animation
    GAME.appendChild(DRAG_TARGET); setDragging(true); 
    onDrag(startEvent);
    function onDrag(event){
        let _mDeltaX = event.pageX - START_POS.mousePos.x;
        let _mDeltaY = event.pageY - START_POS.mousePos.y;
        let followPos = new Vector2(START_POS.x + _mDeltaX, START_POS.y + _mDeltaY);
        //follow mouse
        DRAG_TARGET.style.left = `${followPos.x}px`;
        DRAG_TARGET.style.top = `${followPos.y}px`;
        //OPTIONAL, BLOCKS GAME TO BE ABLE TO START ANOTHER TRANSITION, USE IF BUGGY
        if(followPos.x!==START_POS.x||followPos.y!==START_POS.y)
            GAME.setAttribute('transitioning', true);
        else {GAME.setAttribute('transitioning', false);}
    } 
    function releaseDrag(_releaseEvent){
        const RELEASE_STATE = {NONE: "None", LEFT_MOST: "L", MIDDLE: "M", RIGHT_MOST: "R"};
        setDragging(false); //set GAME attribute, remove dragging class, set transition
        document.removeEventListener('mousemove', onDrag);
        const ACTIVE_SLOT = GAME.querySelector('.active-slot');
        let _targetSlot = ACTIVE_SLOT ?? START_POS.slot;
        const IS_SAME_SLOT = _targetSlot === START_POS.slot;
        const TARGET_SLOT = {
            slot: _targetSlot,
            hoverSib :  _targetSlot ? _targetSlot.querySelector('.draggable:hover:not(.dragging)'): null,
            firstChild: _targetSlot ? _targetSlot.firstElementChild : null,
            lastChild: _targetSlot ? _targetSlot.lastElementChild : null,
        }
        let _lastChildRect = TARGET_SLOT.lastChild.getBoundingClientRect();
        let releaseState = (()=>{ //Immediate Invoke, get releaseState
            let _isMouseRight = _releaseEvent.pageX > _lastChildRect.left;
            let _isHovSibFirst = TARGET_SLOT.hoverSib ? TARGET_SLOT.hoverSib === TARGET_SLOT.firstChild : false;
            let _isHovSibLast = TARGET_SLOT.hoverSib ? TARGET_SLOT.hoverSib === TARGET_SLOT.lastChild : false;
            if((_isMouseRight || _isHovSibLast) && ACTIVE_SLOT) 
                return RELEASE_STATE.RIGHT_MOST;
            if(IS_SAME_SLOT && ! TARGET_SLOT.hoverSib)
                return RELEASE_STATE.NONE;
            if(_isHovSibFirst) 
                return RELEASE_STATE.LEFT_MOST;
            return RELEASE_STATE.MIDDLE;
        })();//Immediate Invoke ENDS
        console.log(releaseState) //DEBUG
        let _targetPos = {};
        switch (releaseState){
            case RELEASE_STATE.NONE:
                _targetPos = {
                    x: START_POS.x,
                    y: START_POS.y,
                    sibL: [...START_POS.slot.children][START_POS.index-1],
                    sibR: [...START_POS.slot.children][START_POS.index],
                };break;
            case RELEASE_STATE.LEFT_MOST:
                var targetRect = TARGET_SLOT.firstChild.getBoundingClientRect();
                _targetPos = {
                    x: targetRect.right + 3, //MAGIC NUMBER
                    y: TARGET_SLOT.slot.getBoundingClientRect().top,
                    sibL: TARGET_SLOT.firstChild,
                    sibR: getNeighborElsInParent(TARGET_SLOT.firstChild, TARGET_SLOT.slot).next,
                };break;
            case RELEASE_STATE.MIDDLE:
                var targetRect = TARGET_SLOT.hoverSib.getBoundingClientRect();
                _targetPos = {
                    x: targetRect.left + HAND_CARD_WIDTH,
                    y: TARGET_SLOT.slot.getBoundingClientRect().top,
                    sibL : TARGET_SLOT.hoverSib,
                    sibR : getNeighborElsInParent(TARGET_SLOT.hoverSib, TARGET_SLOT.slot).next,
                };break;
            case RELEASE_STATE.RIGHT_MOST:
                var targetRect = _lastChildRect; //Already defined above in state checking
                let _isLastAlsoFirst = TARGET_SLOT.firstChild === TARGET_SLOT.lastChild;
                _targetPos = {
                    //if right most is also left most, use left most position
                    x: _isLastAlsoFirst? targetRect.right + 3 : targetRect.left + HAND_CARD_WIDTH,
                    y: TARGET_SLOT.slot.getBoundingClientRect().top,
                    sibL : TARGET_SLOT.lastChild,
                    sibR : getNeighborElsInParent(TARGET_SLOT.lastChild, TARGET_SLOT.slot).next,
                };break;
        } const TARGET_POS = _targetPos;
        //Apply hand card offset if left sibling is a card, aka not first child
        if(TARGET_POS.sibL && TARGET_POS.sibL !== TARGET_SLOT.firstChild) 
            TARGET_POS.sibL.marginRight = `${__HAND_CARD_OFFSET}px`;
        //Make space to card on the right, for insertion
        if(TARGET_POS.sibR) 
            TARGET_POS.sibR.style.marginLeft = `${HAND_CARD_WIDTH}px`;
        //if target position's right sib is not the same as starting position's right sib, reset margin left
        if(START_POS.sibR && START_POS.sibR !== TARGET_POS.sibR)
            playTransition(START_POS.sibR,`${__ANIM_MOVE_INITIAL_TRANSITION}`, [new PropValPair('marginLeft', '0px')], undefined);
        //Additional position offset applied if starting slot and target slot is the same
        let _targetSibLIndex = [...TARGET_SLOT.slot.children].indexOf(TARGET_POS.sibL);
        let sameSlotOffset = (()=>{//Immediate Invoke
            if(IS_SAME_SLOT && _targetSibLIndex >= START_POS.index) //
                return dragTargetWas1st ? - __ANIM_INSERT_DIST - HAND_CARD_WIDTH : HAND_CARD_WIDTH;
            return 0;
        })(); //End Immediate Invoke
        //GO TO TARGET POSITION
        DRAG_TARGET.style.left =`${TARGET_POS.x - sameSlotOffset}px`;
        DRAG_TARGET.style.top = `${TARGET_POS.y}px`;
        document.removeEventListener('mouseup', releaseDrag);
        //Using timeout instead of event because event is buggy with spam clicks;
        setTimeout(endTransistion, (1000*__ANIM_MOVE_TIME));
        function endTransistion(){
            //Reset Siblings margins
            [TARGET_POS.sibL, TARGET_POS.sibR].forEach(sib=>{if(sib){
                sib.style.transition = 'margin 0s';
                sib.style.marginLeft = '0px';
                setTimeout(()=>{sib.style.transition = __ANIM_MOVE_INITIAL_TRANSITION},10); //fixes inconsistencies in ffox
            }});
            //This need to wait for the foreach loop to end
            //Enable hover animation again
            playTransition(DRAG_TARGET, 'undefined',[
                new PropValPair('position', 'relative'),
                new PropValPair('left', '0px'),
                new PropValPair('top', '0px')],
                `${__ANIM_MOVE_INITIAL_TRANSITION}`, ()=>{console.log('Append insert')}
            );
            TARGET_SLOT.slot.insertBefore(DRAG_TARGET, TARGET_POS.sibR);
            requestAnimationFrame(()=>{
                DRAG_TARGET.classList.remove('disable-hover-anim');
                GAME.setAttribute('transitioning', false);
            });
           
        } //END endTransistion
    }//END releaseDrag
}//END draggableLogic
function slotLogic(event){
    let slot = event.target;
    slot.classList.add('active-slot');
    slot.addEventListener('mouseleave', _event=>{ slot.classList.remove('active-slot') });
}
function popCardFromDeck(hand){//TEST
    //pseudo code
    //get hand's last child
    //if last child is first child
    //  offset 0
    //else
    //  offset -cardWidth + hand card space
    //
    //Get random card, create element, append to deck
    //posiiton = fixed
    //Card element start from deck position
    //Go to last child left + offset
    //Go to last child top
    //
    //after set timeout 1s 
    //  reset positions to 0
    //  style position = relative  
    //  append child



    // const _deckRect = GAME.querySelector('.deck:hover').getBoundingClientRect();
    // const DECK_POS = new Vector2(_deckRect.left, _deckRect.top);
    
    // //testing for now
    // let newCard = createCardElement();
    // //set draggable logic here


    // GAME.appendChild(newCard);
    // newCard.style.left = `${DECK_POS.x}px`;
    // newCard.style.top = `${DECK_POS.y}px`;
    // newCard.style.position='fixed';

    // //GETTING OFFSET HERE
    // var hand = document.getElementById('player-hand');
    // var lastChildRect = [...hand.children].pop().getBoundingClientRect();

    // //TARGET
    // var xOffset = lastChildRect.right - 200; //MAGIC NUMBER FROM CSS
    // var yOffset = lastChildRect.top;

    // //GO TO TARGET AFTER TIMEOUT
    // setTimeout(()=>{
    //     newCard.style.left = `${xOffset}px`;
    //     newCard.style.top = `${yOffset}px`;
    // },1);

    // //use transistion end instead
    // //APPEND and reset values
    //     setTimeout(()=>{
    //         console.log('frame called');
    //         hand.appendChild(newCard)
    //         newCard.style.left = `${0}px`;
    //         newCard.style.top = `${0}px`;
    //         newCard.style.position='relative';
    //     },1000);
}
//
//
//WHEN PAGE FINISH LOADING //PROBABLY WANT TO USE DEFERED ON THE SCRIPT INSTEAD
window.onload = function(){
    for(let i =0; i<5; i++){ //For testing
        let randomCard = popRandomFromArr(currentDeck);
        let cardEl = randomCard.createElement();
        PLAYER_HAND.appendChild(cardEl);
        setDraggableLogic(cardEl);
    }
    setAllElementWithLogic('.slot', 'mouseenter', slotLogic);
};
//
//
//
//
//BLACK JACK RELATED GAME LOGIC
//


//
//UTIL
//
class Vector2 {
    constructor(_x, _y) { this.x = _x; this.y = _y; }
    add(other) { return new Vector2(this.x + other.x, this.y + other.y); }
    subtract(other) { return new Vector2(this.x - other.x, this.y - other.y); }
    scale(factor) { return new Vector2(this.x * factor, this.y * factor); }
    dot(other) { return this.x * other.x + this.y * other.y; }
}
function setAllElementWithLogic(selector='.className', eventName='mouseenter', logic=ev=>{}){
    let elmnts = document.querySelectorAll(selector);
    [...elmnts].forEach(el=>{el.addEventListener(eventName, logic)});
}
function convertCSSPropertyToNumeric(initVal){
    let value = initVal
        .replace(/(?<=[\d+])px/,'')//Remove units
        .replace(/(?<=[\d+])s/,'') 
        .replace(/^calc\(/,'') //Remove calc()
        .replace(/\)$/,'');
    return eval(value);
}
function getNeighborElsInParent(selfElement, parentElement){
    let children = [...parentElement.children];
    let selfIndex = children.indexOf(selfElement);
    return {prev: children[selfIndex-1], next: children[selfIndex+1]};
}
function popRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr.splice(i, 1)[0];;
}
function getRandomFromArr(arr=[]){
    let i = Math.floor(Math.random() * arr.length);
    return arr[i];
}
class PropValPair {
    constructor(_prop, _val) { this.prop = _prop; this.val = _val; }
}
function playTransition(targetElement, initTransition='', styleProperties=[{prop:'', val:''}],  endTransition='', endCallback=()=>{}){
    if(initTransition !== (undefined||null)) targetElement.style.transition = initTransition;
    styleProperties.forEach(pVPair => {
        targetElement.style[pVPair.prop] = pVPair.val;
    });
    requestAnimationFrame(()=>{
        if(endTransition !== (undefined||null)) targetElement.style.transition = endTransition;
        endCallback();
    });
}