alert('loaded index.js');
import Vector2 from "../modules/Vector2.js";
import { Card, getSuitColor, getNeigbourRanks, CARD_DATA } from "../modules/PlayingCards.js";
//import { setAllElementWithLogic, popRandomFromArr, getCSSDeclaredValue, convertCSSPropertyToNumeric } from "../modules/MyMiscUtil.js";
//import { requestFrame, timer } from "../modules/CSSAnimationUtil.js";
//import { startDrag, slotLogic } from "../modules/MyDraggables.js";
//import { Memento, Caretaker } from "../modules/UndoPattern.js";

// const divs = document.body.querySelectorAll('div');
// divs[0].innerHTML = `
// <div class="outer-card" id="proto-card" lock="false">
//     <div class="inner-card flippable">
//         <div class="front-face">
//             <span class="rank" CORNER="TOP">A</span>
//             <span class="suit" CORNER="TOP"></span>
//             <span class="card-front-display">
//                 <span class="column" POS="LEFT"></span>
//                 <span class="column" POS="MIDDLE"></span>
//                 <span class="column" POS="RIGHT"></span>
//             </span><!--end card-front-display-->
//             <span class="suit" CORNER="BOT"></span>
//             <span class="rank" CORNER="BOT">A</span>
//         </div><!--end front-face-->
//         <div class="back-face">
//             <span class="card-back-display">CARD</span>
//         </div><!--end back-face-->
//     </div><!--end inner-card-->
// </div><!--end outer-card-->`;
// alert(divs[0].innerHTML);

// divs[1].innerHTML = `<div class="outer-card" id="proto-card" lock="false"></div>`;
// alert(divs[1].innerHTML);

// divs[2].innerHTML = `<div class="inner-card flippable"></div>`;
// alert(divs[2].innerHTML);

// divs[3].innerHTML = `<div class="front-face"></div>`;
// alert(divs[3].innerHTML);

// divs[4].innerHTML = `<span class="rank" CORNER="TOP">A</span>`;
// alert(divs[4].innerHTML);

// divs[5].innerHTML = `<span class="suit" CORNER="TOP"></span>`;
// alert(divs[5].innerHTML);

// divs[6].innerHTML = `
// <span class="card-front-display">
//     <span class="column" POS="LEFT"></span>
//     <span class="column" POS="MIDDLE"></span>
//     <span class="column" POS="RIGHT"></span>
// </span>`;
// alert(divs[6].innerHTML);

// divs[7].innerHTML = `<span class="suit" CORNER="BOT"></span>`;
// alert(divs[7].innerHTML);

// divs[8].innerHTML = `<span class="rank" CORNER="BOT">A</span>`;
// alert(divs[8].innerHTML);

// divs[9].innerHTML = `
// <div class="back-face">
//     <span class="card-back-display">CARD</span>
// </div>`;
// alert(divs[9].innerHTML);