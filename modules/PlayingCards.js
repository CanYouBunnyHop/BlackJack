const PROTO_SUIT = document.createElement('span'); PROTO_SUIT.classList.add('suit');
const PROTO_CARD_CONTAINER = document.createElement('div'); PROTO_CARD_CONTAINER.classList.add('prototype');
PROTO_CARD_CONTAINER.innerHTML = `
<div class="outer-card" id='proto-card' lock="false">
    <div class="inner-card flippable">
        <div class="front-face">
            <span class="number"CORNER='TOP'>A</span>
            <span class="suit"CORNER='TOP'></span>
            <span class="card-front-display">
                <span class="column"POS='LEFT'></span>
                <span class="column"POS='MIDDLE'></span>
                <span class="column"POS='RIGHT'></span>
            </span><!--end card-front-display-->
            <span class="suit"CORNER='BOT'></span>
            <span class="number"CORNER='BOT'>A</span>
        </div><!--end front-face-->
        <div class="back-face">
            <span class="card-back-display">CARD</span>
        </div><!--end back-face-->
    </div><!--end inner-card-->
</div><!--end outer-card-->`;
export const PROTO_CARD = PROTO_CARD_CONTAINER.querySelector('#proto-card'); //GET THE PROTOTYPE ELEMENT
export const CARD_DATA = {
    numbers : ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
    suits : ['♠️','♣️','♥️','♦️'],
};
export class Card {
    constructor(_suit, _number) {this.suit = _suit; this.number = _number;}
    createElement(){
        let clone = PROTO_CARD.cloneNode(true);
        clone.classList.remove('prototype'); clone.id=null;
        clone._cardDisplay_= clone.querySelector('.card-front-display');
        clone._number_ = this.number; // for easy access later for calculating points
        clone._suit_ = this.suit;
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
const PROTO_DECK = createDeck(); //Cache the deck, no need to loop again
export var currentDeck = [...PROTO_DECK];
function createDeck(){
    var deck = [];
    for(let suit of CARD_DATA.suits)
        for(let number of CARD_DATA.numbers)
            deck.push(new Card(suit, number));
    return deck;
}
function resetCurrentDeck(){currentDeck = [...PROTO_DECK]};
export function resetCardGame(){
    resetCurrentDeck();
    //ADD ANIMATION? TODO
    let cards = document.querySelectorAll('.outer-card:not(.prototype)');
    cards.forEach(card=>{card.remove()})
}
