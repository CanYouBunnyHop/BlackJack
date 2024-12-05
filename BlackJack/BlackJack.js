import { currentDeck, resetCardGame, PROTO_CARD } from '../modules/PlayingCards.js';
import { BaseState, BaseStateMachine } from '../modules/StateMachinePattern.js';
import Vector2 from '../modules/Vector2.js';
import { slotLogic, startDrag, touchToMouseEvent, hoveredLogic } from '../modules/MyDraggables.js';
import { setAllElementWithLogic, popRandomFromArr} from '../modules/MyUtil.js';
import { getCSSDeclaredValue, remToPx} from '../modules/CSSUtil.js';
import { requestFrame, timer, restartCSSAnimation } from '../modules/CSSAnimationUtil.js';

PROTO_CARD.classList.add('draggable'); //set the dragging parent to outer-card
const GAME = document.getElementById('game');
const GAME_OVERLAY =  GAME.querySelector('#game-overlay');
const GAME_OVERLAY_MSG = GAME_OVERLAY.querySelector('#game-overlay-msg');
const __CARD_WIDTH = getCSSDeclaredValue(GAME, '--card-width', true);
const __HAND_CARD_OFFSET = getCSSDeclaredValue(GAME, '--hand-card-offset', true);
const __ANIM_INSERT_DIST = getCSSDeclaredValue(GAME, '--anim-insert-dist', true);
const __ANIM_FLIPPABLE_TIME = getCSSDeclaredValue(GAME, '--anim-flippable-time', true);
const __ANIM_MOVE_TIME = getCSSDeclaredValue(GAME, '--anim-move-time', true);
const __OVERLAY_FADE_TIME = getCSSDeclaredValue(GAME, '--overlay-fade-time', true);
const __ANIM_MOVE_INITIAL_TRANSITION = getCSSDeclaredValue(GAME, '--anim-move-initial-transition', false);
const HAND_CARD_WIDTH = __CARD_WIDTH + __HAND_CARD_OFFSET;
//
//#region DRAGGABLE RELATED LOGICS
//
function blackJackStartDrag(mdownEvent){ //Wrapper to add statemachine state
    if(GAME_STATE_MACHINE.currentState === GAME_STATE.playersTurn)
        startDrag(mdownEvent, GAME, __ANIM_MOVE_TIME, afterStartDrag, releaseDragInHand, dragEndTransition);
}
async function afterStartDrag(startOut){
    const {DRAG_START} = startOut;
    if(DRAG_START.NEIGHBOUR.R){//If start sibR exist, apply hand-card width Margin Offset
        DRAG_START.NEIGHBOUR.R.style.transition = 'margin 0s';
        await requestFrame(()=>{
            DRAG_START.NEIGHBOUR.R.style.marginLeft = `${HAND_CARD_WIDTH}rem`;
        });
        await requestFrame(()=>{
            DRAG_START.NEIGHBOUR.R.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;
        });
    };
    return {...startOut};
}
async function releaseDragInHand(b4ReleaseOut){
    const { DRAG_TARGET, DRAG_START, IS_SAME_SLOT, DRAG_RELEASE } = b4ReleaseOut;
    const {HOVERED_SIB, DESTINATION_SLOT} = DRAG_RELEASE;
    const RELEASE_STATE = {NONE: "None", LEFT_MOST: "L", MIDDLE: "M", RIGHT_MOST: "R"};
    let _lastChildRect = DRAG_RELEASE.LAST_CHILD.getBoundingClientRect();
    let releaseState = (()=>{ //Immediate Invoke, get releaseState
        let _isMouseRight = DRAG_RELEASE.MPOS.x > _lastChildRect.left;
        let _isHovSibFirst= HOVERED_SIB? HOVERED_SIB===DRAG_RELEASE.FIRST_CHILD: false;
        let _isHovSibLast = HOVERED_SIB? HOVERED_SIB===DRAG_RELEASE.LAST_CHILD : false;
        if((_isMouseRight || _isHovSibLast) && DRAG_RELEASE.ACTIVE_SLOT)
            return RELEASE_STATE.RIGHT_MOST;
        if(IS_SAME_SLOT && ! DRAG_RELEASE.HOVERED_SIB)
            return RELEASE_STATE.NONE;
        if(_isHovSibFirst) 
            return RELEASE_STATE.LEFT_MOST;
        return RELEASE_STATE.MIDDLE;
    })();//Immediate Invoke ENDS
    //console.log(releaseState);
    const DRAG_END = (()=>{ switch (releaseState){ //Immediate Invoke
        case RELEASE_STATE.NONE:
            return {
                //POS : DRAG_START.POS,
                NEIGHBOUR : {
                    L : [...DRAG_START.SLOT.children][DRAG_START.INDEX-1],
                    R : [...DRAG_START.SLOT.children][DRAG_START.INDEX],
                },
            };
        case RELEASE_STATE.LEFT_MOST:
            var targetRect = DRAG_RELEASE.FIRST_CHILD.getBoundingClientRect();
            return {
                //POS : new Vector2(targetRect.right + 3, DESTINATION_SLOT.getBoundingClientRect().top),
                NEIGHBOUR : {
                    L : DRAG_RELEASE.FIRST_CHILD,
                    R : DRAG_RELEASE.FIRST_CHILD.nextElementSibling,
                },
            };
        case RELEASE_STATE.MIDDLE:
            var targetRect = DRAG_RELEASE.HOVERED_SIB.getBoundingClientRect();
            return {
                //POS : new Vector2(targetRect.left + HAND_CARD_WIDTH, DESTINATION_SLOT.getBoundingClientRect().top),
                NEIGHBOUR : {
                    L : DRAG_RELEASE.HOVERED_SIB,
                    R : DRAG_RELEASE.HOVERED_SIB.nextElementSibling,
                },
            };
        case RELEASE_STATE.RIGHT_MOST:
            var targetRect = _lastChildRect; //Already defined above in state checking
            let _isLastAlsoFirst = DRAG_RELEASE.FIRST_CHILD === DRAG_RELEASE.LAST_CHILD;
            return {
                //if right most is also left most, use left most position
                // POS : new Vector2(
                //     _isLastAlsoFirst? targetRect.right + 3 : targetRect.left + HAND_CARD_WIDTH, 
                //     DESTINATION_SLOT.getBoundingClientRect().top),
                NEIGHBOUR : {
                    L : DRAG_RELEASE.LAST_CHILD,
                    R : DRAG_RELEASE.LAST_CHILD.nextElementSibling,
                },
            };
        };})(); //Immediate Invoke ENDS
    //Apply hand card offset if left sibling is a card, aka not first child
    if(DRAG_END.NEIGHBOUR.L && DRAG_END.NEIGHBOUR.L !== DRAG_RELEASE.FIRST_CHILD) 
        DRAG_END.NEIGHBOUR.L.marginRight = `${__HAND_CARD_OFFSET}rem`;

    //Make space to card on the right, for insertion
    if(DRAG_END.NEIGHBOUR.R) DRAG_END.NEIGHBOUR.R.style.marginLeft = `${HAND_CARD_WIDTH}rem`;

    //if target position's right sib is not the same as starting position's right sib, reset margin left
    if(DRAG_START.NEIGHBOUR.R && DRAG_START.NEIGHBOUR.R !== DRAG_END.NEIGHBOUR.R){
        DRAG_START.NEIGHBOUR.R.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;
        requestFrame(()=>{DRAG_START.NEIGHBOUR.R.style.marginLeft = '0rem';})
    }

    //Additional position offset applied if starting slot and target slot is the same
    let _destSibLIndex = [...DESTINATION_SLOT.children].indexOf(DRAG_END.NEIGHBOUR.L);
    let sameSlotOffset = (()=>{//Immediate Invoke
         if(IS_SAME_SLOT && _destSibLIndex >= DRAG_START.INDEX) //
             return DRAG_START.INDEX===1 ? __ANIM_INSERT_DIST - HAND_CARD_WIDTH : HAND_CARD_WIDTH;
         return 0;
    })();//Immediate Invoke ends

    //create temp slot
    let tempSlot = document.createElement('div');
    tempSlot.classList.add('outer-card', 'temp');
    DESTINATION_SLOT.insertBefore(tempSlot, DRAG_END.NEIGHBOUR.R);
    let trect = tempSlot.getBoundingClientRect();
    let movePos = new Vector2(trect.x, trect.y);
    tempSlot.remove();
    
    //move to position
    DRAG_TARGET.style.left = `${movePos.x - remToPx(sameSlotOffset)}px`;
    DRAG_TARGET.style.top = `${movePos.y}px`;

    return {
        ...b4ReleaseOut, 
        DRAG_END 
    }
}
async function dragEndTransition(releaseOut){
    const {DRAG_END, DRAG_TARGET, DRAG_RELEASE} = releaseOut;
    
    //reset sibling margins
    [DRAG_END.NEIGHBOUR.L, DRAG_END.NEIGHBOUR.R].forEach(nbour=>{if(nbour){
        nbour.style.transition = 'margin 0s';
        nbour.style.marginLeft = '0px';
        //delay frame is 2 because alr requested frame once, add one more to run consistently; 
        requestFrame(()=>{nbour.style.transition = __ANIM_MOVE_INITIAL_TRANSITION}, 2)
    }});

    await requestFrame(()=>{
        DRAG_TARGET.style.position = 'relative';
        DRAG_TARGET.style.left = '0px'; 
        DRAG_TARGET.style.top = '0px';
        DRAG_RELEASE.DESTINATION_SLOT.insertBefore(DRAG_TARGET, DRAG_END.NEIGHBOUR.R);
    }); 

    await requestFrame(()=>{
        DRAG_TARGET.style.transition = `${__ANIM_MOVE_INITIAL_TRANSITION}`;
        DRAG_TARGET.classList.remove('disable-hover-anim');
        GAME_STATE_MACHINE.currentState = GAME_STATE.playersTurn;
    });
    
}
//#endregion
//
//#region BLACK JACK RELATED GAME LOGIC
//
const PLAYER_HAND = GAME.querySelector('#player-hand');
const DEALER_HAND = GAME.querySelector('#dealer-hand');
function getCardsFromHand(hand){return [...hand.children].slice(1, undefined);}
//WHEN PAGE FINISH LOADING //PROBABLY WANT TO USE DEFERED ON THE SCRIPT INSTEAD
window.onload = ()=>{ 
    setAllElementWithLogic('.slot', 'pointerenter', (ev)=>slotLogic(ev, 'pointerleave'));
    document.ontouchmove = touchToMouseEvent;
    document.ontouchend = touchToMouseEvent;
}
function popCardFromDeck(_targetHand, _deckSelector = '.deck:hover', flipOver=true, isDraggable=true){//TEST
    if(document.body.getAttribute('transitioning') === 'true') return;
    const _deckRect = GAME.querySelector(_deckSelector).getBoundingClientRect();
    const DECK_POS = new Vector2(_deckRect.left, _deckRect.top);

    //change target Pos to temp slot
    const t = document.createElement('div'); t.classList.add('outer-card', 'temp');
    _targetHand.appendChild(t); //to the last child
    const _tempPos = t.getBoundingClientRect();
    const TARGET_POS = new Vector2(_tempPos.x, _tempPos.y);
    t.remove();

    const NEW_CARD = popRandomFromArr(currentDeck).createElement(); //create card element
    const INNER_CARD = NEW_CARD.querySelector('.flippable');

    GAME.appendChild(NEW_CARD);

    //Set starting pos, initial values
    document.body.setAttribute('transitioning', true);
    NEW_CARD.style.position = 'fixed';
    NEW_CARD.style.transition = __ANIM_MOVE_INITIAL_TRANSITION;
    NEW_CARD.style.left = `${DECK_POS.x}px`; NEW_CARD.style.top = `${DECK_POS.y}px`;
    INNER_CARD.style.transform = 'rotateY(180deg)'; //start on face back
    return requestFrame(()=>{
        NEW_CARD.style.left = `${TARGET_POS.x}px`;
        NEW_CARD.style.top = `${TARGET_POS.y}px`;
        if(flipOver) INNER_CARD.style.transform = 'rotateY(0deg)';
    }).then(()=>{return timer(__ANIM_MOVE_TIME);})
    .then(()=>{return requestFrame(()=>{
        NEW_CARD.style.position = 'relative';
        NEW_CARD.style.left = `${0}px`; NEW_CARD.style.top = `${0}px`;
        INNER_CARD.style.transform = ''; //clear overridden flip transform
        _targetHand.appendChild(NEW_CARD);
        if(isDraggable) {
            NEW_CARD.addEventListener('mousedown', blackJackStartDrag);//Set draggable logic if isDraggable is set to true
            NEW_CARD.addEventListener('touchstart', touchToMouseEvent);
            NEW_CARD.addEventListener('pointerenter', hoveredLogic);
        }
        document.body.setAttribute('transitioning', false);
    })})
}
//#endregion
//region BlackJack get buttons
const HIT_BUT = GAME.querySelector('#hit-but');
const STAND_BUT = GAME.querySelector('#stand-but');
const DEAL_BUT = GAME.querySelector('#deal-but');
//#region BlackJack StateMachine
const GAME_STATE = { 
    deal : new BaseState(
        function enterDeal(){
            HIT_BUT.disabled = true;
            STAND_BUT.disabled = true;
            DEAL_BUT.disabled = false;
            GAME_OVERLAY.style.visibility = 'hidden';
        }
    ), 
    playersTurn: new BaseState(
        function enterPTurn(){
            HIT_BUT.disabled = false;
            STAND_BUT.disabled = false;
            DEAL_BUT.disabled = true;
            if(getBlackJackCardPoints(PLAYER_HAND)>=21) GAME_STATE_MACHINE.currentState = GAME_STATE.dealersTurn;
        }
    ), 
    playerDrag: new BaseState(
        function enterPDrag(){
            HIT_BUT.disabled = true;
            STAND_BUT.disabled = true;
            DEAL_BUT.disabled = true;
        }
    ),
    dealersTurn: new BaseState(
        function enterDTurn(){
            HIT_BUT.disabled = true;
            STAND_BUT.disabled = true;
            DEAL_BUT.disabled = true;
            dealerAILogic(); //start recursion
        }
    ), 
    endTurn: new BaseState(
        function enterEndTurn(){
            endTurnLogic();
        }
    )
};
const GAME_STATE_MACHINE = new BaseStateMachine(GAME_STATE.deal);
//#endregion
//
//#region Button logic
async function dealCardsToPlayer(){
    await popCardFromDeck(PLAYER_HAND,'#universal-deck', true, true);
    return popCardFromDeck(PLAYER_HAND,'#universal-deck', true, true);
}
async function dealCardsToDealer(){
    await popCardFromDeck(DEALER_HAND,'#universal-deck', true, false);
    return popCardFromDeck(DEALER_HAND,'#universal-deck', false, false);
}
window.dealButtonLogic = async ()=>{
    if(DEAL_BUT.disabled)return;//some mobile browsers let touch ignore disabled
    await dealCardsToPlayer();
    await dealCardsToDealer();
    GAME_STATE_MACHINE.currentState = GAME_STATE.playersTurn;
}
window.hitPButtonLogic = async ()=>{
    if(HIT_BUT.disabled)return;//some mobile browsers let touch ignore disabled
    await popCardFromDeck(PLAYER_HAND,'#universal-deck', true, true);
    //get player points, if over or equal to 21, go to dealer turn
    if(getBlackJackCardPoints(PLAYER_HAND) >= 21 ) 
        GAME_STATE_MACHINE.currentState = GAME_STATE.dealersTurn;
}
window.standButtonLogic = async ()=>{
    if(STAND_BUT.disabled)return; //some mobile browsers let touch ignore disabled
    GAME_STATE_MACHINE.currentState = GAME_STATE.dealersTurn;
}
async function dealerAILogic(){
    if(getBlackJackCardPoints(DEALER_HAND) < 17){
        await popCardFromDeck(DEALER_HAND,'#universal-deck', false, false);
        dealerAILogic(); //recursion
    }
    else{ //end dealer's turn
       requestFrame(()=>{
            GAME_STATE_MACHINE.currentState = GAME_STATE.endTurn;
        })
    }
}
//#endregion
async function endTurnLogic(){
    //await flip all dealer's cards
    document.body.setAttribute('transitioning', true); //disable drag
    const unflippedDealerCards = [...DEALER_HAND.children].slice(2, undefined);
    await new Promise(resolve=>{
        unflippedDealerCards.forEach((card)=>{
            card.querySelector('.flippable').style.transform = 'rotateY(0deg)'; //flip cards over
        });
        setTimeout(resolve, __ANIM_FLIPPABLE_TIME);
    });
    const playerPoints = getBlackJackCardPoints(PLAYER_HAND);
    const dealerPoints = getBlackJackCardPoints(DEALER_HAND);
    const playerBusted = playerPoints > 21;
    const dealerBusted = dealerPoints > 21;
    
    function getGameOverMessage(){
        //win condition //if player not busted, dealer busted or while player not busted, player > dealer
        if(!playerBusted && dealerBusted || !playerBusted && (playerPoints > dealerPoints)){ 
            return 'Win';
        }
        //draw condition //if both busted or both points are equal
        else if(playerBusted && dealerBusted || playerPoints === dealerPoints){ 
            return 'Draw';
        }
        //lose condition //if player busted, dealer not busted or while dealer not busted, dealer > player
        else if(playerBusted && !dealerBusted || !dealerBusted && (dealerPoints > playerPoints)){
            return 'Lose';
        }
    }
    //for now, need a better way to show this
    await timer(1);
    GAME_OVERLAY.style.visibility = 'visible';
    GAME_OVERLAY_MSG.innerText = getGameOverMessage();
    await restartCSSAnimation(GAME_OVERLAY);
    await timer(__OVERLAY_FADE_TIME);
    await resetCardGameWithTransition();
    GAME_STATE_MACHINE.currentState = GAME_STATE.deal;
    document.body.setAttribute('transitioning', false); //enable drag for cards again
}
async function resetCardGameWithTransition(){
    const cards = GAME.querySelectorAll('.outer-card:not(.temp)');
    const deckRect = GAME.querySelector('#universal-deck').getBoundingClientRect();
    [...cards].forEach(card=>{
        let cardRect = card.getBoundingClientRect();
        requestFrame(()=>{
            card.querySelector('.flippable').style.transform = `rotateY(180deg)`;
        }).then(()=>{return requestFrame(()=>{
            card.style.position = 'fixed'
            card.style.transition = 'left 0s, top 0s';
            card.style.left = `${cardRect.x}px`;
            card.style.top = `${cardRect.y}px`;
        })}).then(()=>{return requestFrame(()=>{//flip card over
            card.style.transition = __ANIM_MOVE_INITIAL_TRANSITION;
            card.style.left = `${deckRect.x}px`;
            card.style.top = `${deckRect.y}px`;
        })});
    });
    await timer(__ANIM_MOVE_TIME); //__ANIM_MOVE_TIME
    resetCardGame();
}
function getBlackJackCardPoints(hand){ //not the most efficient way to do calculation, but most managable
    let aceCounter = 0;
    function getCardPoint(_cardEl){
        switch(_cardEl._rank_){
            case 'A': aceCounter++; return 11; //Return 11 for now, will -10 later
            case 'J': case 'Q': case 'K': return 10;
            default: return parseInt(_cardEl._rank_);
        }
    }
    const cardElements = getCardsFromHand(hand); //returns all the cards, minus the starting child
    var totalSum = cardElements.reduce((prev, cur)=>{return prev + getCardPoint(cur)}, 0); //starts with 0, so no type checking needed
    //if total is bust, and has ace in hand, -10 to total sum
    while(totalSum > 21 && aceCounter > 0){ aceCounter--; totalSum -= 10;}
    return totalSum;
}
//#endregion