//
//PLAYING CARD GAMES SHARED LOGIC
//
var game = document.getElementById('game');
const protoSuit = document.createElement('span');
protoSuit.classList.add('suit');
const PROTO_CARD = game.querySelector('.outer-card'); //GET THE PROTOTYPE ELEMENT
const CARD_DATA = {
    numbers : ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
    suits : ['♠️','♣️','♥️','♦️'],
    get randomNumber(){return getRandomFromArr(this.numbers);},
    get randomSuit(){return getRandomFromArr(this.suits);},
};
var deckOfCards = [];
function Card(suit, number){this.suit = suit; this.number = number;}
function createDeck(){
    deckOfCards = [];
    for(let suit of CARD_DATA.suits)
        for(let number of CARD_DATA.numbers)
            deckOfCards.push(new Card(suit, number));
}
createDeck(); //MOVE TO WINDOW LOAD
function createCardElement(number = CARD_DATA.randomNumber, suit = CARD_DATA.randomSuit){
    let clone = PROTO_CARD.cloneNode(true);
    clone.classList.remove('prototype');
    clone._number_ = number;
    clone._suit_ = suit;
    clone._cardDisplay_= clone.querySelector('.card-front-display');
    let leftCol = clone._cardDisplay_.querySelector('.column[POS="LEFT"]');
    let midCol = clone._cardDisplay_.querySelector('.column[POS="MIDDLE"]');
    let rightCol = clone._cardDisplay_.querySelector('.column[POS="RIGHT"]');
    //CREATE SUIT OBJECT BASE ON NUMBERS HERE
    let appendSuits=(l,m,r)=>{//ADD SUIT TO COLUMNS
        for(let i=0; i<l; i++){leftCol.appendChild(protoSuit.cloneNode());}
        for(let i=0; i<m; i++){midCol.appendChild(protoSuit.cloneNode());}
        for(let i=0; i<r; i++){rightCol.appendChild(protoSuit.cloneNode());}
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
    switch (clone._number_){
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
        case 'J': case 'Q': case 'K':
            appendSuits(2,0,2);
            hideSuit(leftCol, 1);
            hideSuit(rightCol, 0);
            break;
    }
    [...clone.querySelectorAll('.number')].forEach(element=>{element.innerHTML = number;});
    [...clone.querySelectorAll('.suit')].forEach(element=>{element.innerHTML = suit;});
    clone.style.color = ['♥️','♦️'].includes(clone._suit_) ? 'crimson' : 'black';
    return clone;
}
//
// TESTING PURPOSES
//
var draggables = [];
function getDraggables(){//TODO RENAME, AND SPLIT SETTING LOGIC
    draggables = document.querySelectorAll('.draggable');
    [...draggables].forEach(element=>{element.addEventListener('mousedown', startDrag)});
}
//WHEN PAGE FINISH LOADING //PROBABLY WANT TO USE DEFERED ON THE SCRIPT INSTEAD
window.onload = function(){
    for(let i =0; i<5; i++){
            let hand = game.querySelector('.hand');//TEST
            hand.appendChild(createCardElement()); //TEST
        //game.appendChild(createCardElement());
    }
    //game.appendChild(createCardElement());
    getDraggables();
    getSlots();
};
//
//
//
const _cardStyle = getComputedStyle(game);
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
    RAW__anim_move_initial_transition : '--anim-move-initial-transition',
};
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
function setDraggableLogic(element){element.addEventListener('mousedown', startDrag);}
//
//
//
//BUG, WHEN DRAGSTART IS FIRSTCARD, INSERTING LEFT MOST, MOVE POSITION IS 1 HANDCARD WIDTH TOO MUCH
//
//
//
//
function startDrag(startEvent){ //MOUSE DOWN EVENT
    const DRAG_TARGET = startEvent.target.closest('.draggable');
    if(DRAG_TARGET.getAttribute('lock') === "true") return; //IF LOCKED RETURN
    if(game.getAttribute('transitioning') === "true") return; //OPTIONAL
    let _startSlot = startEvent.target.closest('.slot');
    if(!_startSlot) return; //THIS ALSO PREVENT SPAM CLICK
    ///////////////////////////////////////////////////////////
    //set game attribute, remove dragging class, set transition
    game.setAttribute('drag-active', true);
    DRAG_TARGET.classList.add('dragging');
    DRAG_TARGET.style.transition = `left 0s, top 0s, margin ${__ANIM_MOVE_TIME}s`;
    ///////////////////////////////////////////////////////////
    const DRAG_START = {//remember origin, child index
        mousePos: {x: startEvent.pageX, y: startEvent.pageY},
        pos: {x: DRAG_TARGET.getBoundingClientRect().x, y: DRAG_TARGET.getBoundingClientRect().y},
        index: [..._startSlot.children].indexOf(DRAG_TARGET),
        slot: _startSlot,
        startLeftSibling: getNeighborElementsInParent(DRAG_TARGET, _startSlot).leftNextdoor,
        startRightSibling: getNeighborElementsInParent(DRAG_TARGET, _startSlot).rightNextdoor
    };
    //
    //
    const HAND_CARD_WIDTH = __CARD_WIDTH + __HAND_CARD_OFFSET;
    let dragStartWasFirstCard = DRAG_START.index===1;//[...DRAG_START.slot.children].indexOf(DRAG_START.startRightSibling)!==2
    let applyInsertMarginOffset = DRAG_START.startRightSibling //&& [...DRAG_START.slot.children].indexOf(DRAG_START.startRightSibling)!==2
    if(applyInsertMarginOffset){
        DRAG_START.startRightSibling.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}, margin 0s`; //override margin
        if(dragStartWasFirstCard)
            DRAG_START.startRightSibling.style.marginLeft = `${-__ANIM_INSERT_DIST}px`;
        else DRAG_START.startRightSibling.style.marginLeft = `${HAND_CARD_WIDTH}px`;
        setTimeout(()=>{DRAG_START.startRightSibling.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;}, 1);
        //RESET ON DRAG? RELEASE?
    }
    //
    //
    DRAG_TARGET.style.marginLeft = '0px';
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', releaseDrag);
    DRAG_TARGET.style.position = 'fixed';
    //For css, disable hover animation
    DRAG_TARGET.classList.add('disable-hover-anim');
    game.appendChild(DRAG_TARGET);
    requestAnimationFrame(()=>{onDrag(startEvent)});
    function onDrag(event){
        let _mousePosDelta = {
            x: event.pageX - DRAG_START.mousePos.x, 
            y: event.pageY - DRAG_START.mousePos.y
        }
        let followPos = {
            x: DRAG_START.pos.x + _mousePosDelta.x,
            y: DRAG_START.pos.y + _mousePosDelta.y
        };
        //follow mouse
        DRAG_TARGET.style.left = `${followPos.x}px`;
        DRAG_TARGET.style.top = `${followPos.y}px`;
        
        //OPTIONAL, BLOCKS GAME TO BE ABLE TO START ANOTHER TRANSITION, USE IF BUGGY
        if(followPos.x!==DRAG_START.pos.x||followPos.y!==DRAG_START.pos.y)
            game.setAttribute('transitioning', true);
        else {game.setAttribute('transitioning', false);}
    } 
    function releaseDrag(_releaseEvent){
        const RELEASE_STATE = {LEFT_MOST: 0, MIDDLE: 1, RIGHT_MOST: 2, NONE: 3};
        ///////////////////////////////////////////////////////////
        //set game attribute, remove dragging class, set transition
        game.setAttribute('drag-active', false);//FOR CSS TO USE THE RIGHT STYLES
        DRAG_TARGET.classList.remove('dragging'); 
        DRAG_TARGET.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;//ALL was 1s __ANIM_MOVE_TIME
        ///////////////////////////////////////////////////////////
        document.removeEventListener('mousemove', onDrag);
        let _activeSlot = game.querySelector('.active-slot') ?? DRAG_START.slot;
        const SAME_SLOT = _activeSlot === DRAG_START.slot;
        const ACTIVE_SLOT = {
            slot: _activeSlot,
            hoveredSibling :  _activeSlot ? _activeSlot.querySelector('.draggable:hover:not(.dragging)'): null,
            firstChild: _activeSlot ? [..._activeSlot.children][0] : null,
            lastChild: _activeSlot ? [..._activeSlot.children].pop() : null,
        }
        let releaseState = (()=>{ //Immediate Invoke, get releaseState
            if(!ACTIVE_SLOT.slot) return RELEASE_STATE.NONE;
            if(ACTIVE_SLOT.hoveredSibling && ACTIVE_SLOT.hoveredSibling === ACTIVE_SLOT.firstChild) return RELEASE_STATE.LEFT_MOST;
            if(ACTIVE_SLOT.hoveredSibling && ACTIVE_SLOT.hoveredSibling !== ACTIVE_SLOT.lastChild) return RELEASE_STATE.MIDDLE;
            return RELEASE_STATE.RIGHT_MOST;
        })();//Immediate Invoke ENDS
        
        let _targetPos = {};
        switch (releaseState){
            case RELEASE_STATE.NONE:
                _targetPos = {
                    x: DRAG_START.pos.x,
                    y: DRAG_START.pos.y,
                    rightSibling: [...DRAG_START.slot.children][DRAG_START.index],
                    leftSibling: [...DRAG_START.slot.children][DRAG_START.index-1]
                };
            break;
            case RELEASE_STATE.LEFT_MOST:
                var targetRect = ACTIVE_SLOT.hoveredSibling.getBoundingClientRect();
                _targetPos = {
                    x: targetRect.right + 3, //MAGIC NUMBER
                    y: ACTIVE_SLOT.slot.getBoundingClientRect().top,
                    rightSibling: getNeighborElementsInParent(ACTIVE_SLOT.hoveredSibling, ACTIVE_SLOT.slot).rightNextdoor,
                    leftSibling: ACTIVE_SLOT.hoveredSibling
                };
            break;
            case RELEASE_STATE.MIDDLE:
                var targetRect = ACTIVE_SLOT.hoveredSibling.getBoundingClientRect();
                _targetPos = {
                    x: targetRect.left + HAND_CARD_WIDTH,
                    y: ACTIVE_SLOT.slot.getBoundingClientRect().top,
                    rightSibling : getNeighborElementsInParent(ACTIVE_SLOT.hoveredSibling, ACTIVE_SLOT.slot).rightNextdoor,
                    leftSibling : ACTIVE_SLOT.hoveredSibling
                };
            break;
            case RELEASE_STATE.RIGHT_MOST:
                var targetRect = ACTIVE_SLOT.lastChild.getBoundingClientRect();
                _targetPos = {
                    x: targetRect.left + HAND_CARD_WIDTH,
                    y: ACTIVE_SLOT.slot.getBoundingClientRect().top,
                    rightSibling : getNeighborElementsInParent(ACTIVE_SLOT.lastChild, ACTIVE_SLOT.slot).rightNextdoor,
                    leftSibling : ACTIVE_SLOT.lastChild
                };
            break;
        } const TARGET_POS = _targetPos;
        //OFFSET TARGETPOS.LEFTSIBLING'S MARGIN RIGHT TO MAKE SPACE FOR INSERTION
        if(TARGET_POS.leftSibling && TARGET_POS.leftSibling !== ACTIVE_SLOT.firstChild)
            TARGET_POS.leftSibling.marginRight = `${__HAND_CARD_OFFSET}px`;
        //APPLY MARGIN LEFT TO TARGET_POS.rightSibling TO MAKE SPACE FOR CARD
        if(TARGET_POS.rightSibling) TARGET_POS.rightSibling.style.marginLeft = `${HAND_CARD_WIDTH}px`;
        
        //ALSO IF INSERT POSITION IS SAME AS DRAGSTART'S
        if(DRAG_START.startRightSibling && DRAG_START.startRightSibling !== TARGET_POS.rightSibling){
            DRAG_START.startRightSibling.style.marginLeft = `0px`;
        }
        //CHECK IF STARTRIGHTSIBLING INDEX IS LATER OR EQUAL TO TARGET HOVER SIBLING
        let _activeSlotChildren = [...ACTIVE_SLOT.slot.children]
        let _offset = 0;
        let _targetLeftSibIndex = _activeSlotChildren.indexOf(TARGET_POS.leftSibling)
        if(_targetLeftSibIndex >=DRAG_START.index && dragStartWasFirstCard)
            _offset = - __ANIM_INSERT_DIST; //--double negative here, becomes potitive
        else if(_targetLeftSibIndex >= DRAG_START.index && !dragStartWasFirstCard )//is dragStart is not first, and target pos index is dragstart
            _offset = HAND_CARD_WIDTH;
        //GO TO TARGET POSITION
        setTimeout(()=>{
            DRAG_TARGET.style.left =`${TARGET_POS.x - _offset}px`;
            DRAG_TARGET.style.top = `${TARGET_POS.y}px`;
        },1);
        document.removeEventListener('mouseup', releaseDrag);
        //Using timeout instead of event because event is buggy with spam clicks;
        requestAnimationFrame(()=>{setTimeout(endTransistion, (1000*__ANIM_MOVE_TIME))});
        function endTransistion(){
            ACTIVE_SLOT.slot.insertBefore(DRAG_TARGET, TARGET_POS.rightSibling);
            //Enable hover animation again
            DRAG_TARGET.classList.remove('disable-hover-anim');
            DRAG_TARGET.style.position = 'relative';
            DRAG_TARGET.style.left =`${0}px`; 
            DRAG_TARGET.style.top = `${0}px`;
            setTimeout(()=>{game.setAttribute('transitioning', false)},1);
            //Reset Sibling margins
            if(TARGET_POS.rightSibling){
                TARGET_POS.rightSibling.style.transition = 'margin 0s';
                TARGET_POS.rightSibling.style.marginLeft = '0px';
                setTimeout(()=>{TARGET_POS.rightSibling.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`},1);
            }
            if(TARGET_POS.leftSibling){
                TARGET_POS.leftSibling.style.transition = 'margin 0s';
                TARGET_POS.leftSibling.style.marginLeft = '0px';
                setTimeout(()=>{TARGET_POS.leftSibling.style.transition = `margin ${__ANIM_MOVE_TIME}s`},1);
            }
        } //END endTransistion
    }//END releaseDrag
}//END startDrag


var slots = [];
function getSlots(){//TODO RENAME, AND SPLIT SETTING LOGIC
    slots = document.querySelectorAll('.slot');
    [...slots].forEach(slot=>{slot.addEventListener('mouseenter', mouseEnter)});
    function mouseEnter(e){
        let curSlot = e.target;
        curSlot.classList.add('active-slot');
        curSlot.addEventListener('mouseleave', event=>{curSlot.classList.remove('active-slot')});
    }
}


//
//BLACK JACK RELATED GAME LOGIC?
//

function popCardFromDeck(){//TEST
    const _deckRect = game.querySelector('.deck:hover').getBoundingClientRect();
    const DECK_POS = {
        x: _deckRect.left, 
        y: _deckRect.top
    }
    //testing for now
    let newCard = createCardElement();
    //set draggable logic here


    game.appendChild(newCard);
    newCard.style.left = `${DECK_POS.x}px`;
    newCard.style.top = `${DECK_POS.y}px`;
    newCard.style.position='fixed';

    //GETTING OFFSET HERE
    var hand = document.getElementById('player-hand');
    var lastChildRect = [...hand.children].pop().getBoundingClientRect();

    //TARGET
    var xOffset = lastChildRect.right - 200; //MAGIC NUMBER FROM CSS
    var yOffset = lastChildRect.top;

    //GO TO TARGET AFTER TIMEOUT
    setTimeout(()=>{
        newCard.style.left = `${xOffset}px`;
        newCard.style.top = `${yOffset}px`;
    },1);

    //use transistion end instead
    //APPEND and reset values
        setTimeout(()=>{
            console.log('frame called');
            hand.appendChild(newCard)
            newCard.style.left = `${0}px`;
            newCard.style.top = `${0}px`;
            newCard.style.position='relative';
        },1000);
}


//
//UTIL
//
function convertCSSPropertyToNumeric(initVal){
    let value = initVal
        .replace(/(?<=[\d+])px/,'')//Remove units
        .replace(/(?<=[\d+])s/,'') 
        .replace(/^calc\(/,'') //Remove calc()
        .replace(/\)$/,'');
    return eval(value);
}
function getNeighborElementsInParent(selfElement, parentElement){
    let children = [...parentElement.children];
    let selfIndex = children.indexOf(selfElement);
    return {leftNextdoor: children[selfIndex-1], rightNextdoor: children[selfIndex+1]};
}
function getRandomFromArr(arr){
    let i = Math.floor(Math.random() * arr.length);
    return arr[i];
}