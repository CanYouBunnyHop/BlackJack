const PROTO_SUIT = document.createElement('span'); PROTO_SUIT.classList.add('suit');
const PROTO_CARD_CONTAINER = document.createElement('div');
PROTO_CARD_CONTAINER.innerHTML = `
<div class="outer-card" lock="false">
    <div class="inner-card flippable">
        <div class="card-overlay"></div>
        <div class="front-face">
            <span class="rank" CORNER="TOP">A</span>
            <span class="suit" CORNER="TOP"></span>
            <span class="card-front-display">
                <span class="column" POS="LEFT"></span>
                <span class="column" POS="MIDDLE"></span>
                <span class="column" POS="RIGHT"></span>
            </span>
            <span class="suit" CORNER="BOT"></span>
            <span class="rank" CORNER="BOT">A</span>
        </div>
        <div class="back-face">
            <span class="card-back-display">CARD</span>
        </div>
        
    </div>
</div>`;
export const PROTO_CARD = PROTO_CARD_CONTAINER.firstElementChild; //GET THE PROTOTYPE ELEMENT
export const CARD_DATA = {
    ranks : ['A','2','3','4','5','6','7','8','9','10','J','Q','K'],
    suits : ['♠','♣','♥','♦'], //♠♣♥♦ 
};
export class Card {
    constructor(_suit, _rank) {this.suit = _suit; this.rank = _rank;}
    createElement(){
        let clone = PROTO_CARD.cloneNode(true);
        clone._cardDisplay_= clone.querySelector('.card-front-display');
        // for easy access later for calculating points, attribute for css if needed
        clone.setAttribute('suit', this.suit);
        clone.setAttribute('rank', this.rank);
        clone._suit_ = this.suit;
        clone._rank_ = this.rank; 
        //for solitaire stuff;
        let leftCol = clone._cardDisplay_.querySelector('.column[POS="LEFT"]');
        let midCol = clone._cardDisplay_.querySelector('.column[POS="MIDDLE"]');
        let rightCol = clone._cardDisplay_.querySelector('.column[POS="RIGHT"]');
        //CREATE SUIT OBJECT BASE ON RANKS HERE
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
        let hideSuit=(col, ...index)=>{index.forEach(i=>col.children[i].style.visibility ='hidden');}
        switch (this.rank){
            case 'A':appendSuits(0,1,0); break;
            case '2':appendSuits(0,2,0); break;
            case '3':appendSuits(0,3,0); break;
            case '4':appendSuits(2,0,2); break;
            case '5':appendSuits(2,1,2); break;
            case '6':appendSuits(3,0,3); break;
            case '7':appendSuits(3,2,3); hideSuit(midCol,1); break;
            case '8':appendSuits(3,2,3); break;
            case '9':appendSuits(4,1,4); break;
            case '10':appendSuits(4,3,4); hideSuit(midCol,1); break;
            case 'J': case 'Q': case 'K': appendSuits(2,0,2); hideSuit(leftCol, 1); hideSuit(rightCol, 0); break;
        }
        [...clone.querySelectorAll('.rank')].forEach(element=>{element.innerHTML = this.rank;}); //==='10'? '⒑': this.rank;
        [...clone.querySelectorAll('.suit')].forEach(element=>{element.innerHTML = this.suit;});
        clone.style.color = ['♥','♦'].includes(this.suit) ? 'crimson' : 'black';
        return clone;
    }
}
const PROTO_DECK = createDeck(); //Cache the deck, no need to loop again
export var currentDeck = [...PROTO_DECK];
function createDeck(){
    var deck = [];
    for(let suit of CARD_DATA.suits)
        for(let rank of CARD_DATA.ranks)
            deck.push(new Card(suit, rank));
    return deck;
}
function resetCurrentDeck(){currentDeck = [...PROTO_DECK]};
export function resetCardGame(){
    resetCurrentDeck();
    //ADD ANIMATION? TODO
    let cards = document.querySelectorAll('.outer-card:not(.prototype)');
    cards.forEach(card=>{card.remove()})
}
//calculation for solitaire
export function getSuitColor(_suit){
    // ♠♣♥♦
    switch(_suit){
        case '♠': case '♣': return 'black';
        case '♥': case'♦': return 'red';
    }
}
export function getSuitsWithOppositeColor(_suit, _returnsOpposite = true){
    let color = getSuitColor(_suit);
    if(_returnsOpposite){
        switch(color){
            case 'black': return ['♥','♦'];
            case 'red': return ['♠','♣'];
        }
    }else{
        switch(color){
            case 'black': return ['♠','♣'];
            case 'red': return ['♥','♦'];
        }
    }
    return ['♠','♣','♥','♦']; //fallback
}
export function getNeigbourRanks(_rank, _isLooping = false){
    let i = CARD_DATA.ranks.indexOf(_rank); //['A','2','3','4','5','6','7','8','9','10','J','Q','K']
    if(i === -1) console.error('Invalid Input : Input is not a valid Card Rank')
    let lasti = CARD_DATA.ranks.length-1;
    let downIndex = _isLooping && i===0 ? lasti :  i-1;
    let upIndex = _isLooping && i===lasti ? 0 : i+1;
    return { //will be undefined if out of bounds
        rankDown : CARD_DATA.ranks[downIndex],
        rankUp : CARD_DATA.ranks[upIndex],
    }
} 
