//FUTURE REWRITE FOR DRAWING CARDS 
//USING EITHER SVG 
//OR CANVAS RATHER THAN EMOJI
//FOR CONSISTENTCY ACROSS PLATFORMS

function drawQueen(ctx){//TEMP HOLDS OLD QUEEN CODE TO BE CONVERTED
    //region DRAWING QUEEN
    //DRAW CROWN
    const crownSpikes = [
        new P(45,10), 
        new P(65,10), 
        new P(85,10),
    ];
    ctx.beginPath();
    crownSpikes.forEach((p, idx)=>{
        //DRAW JEWELS 'O O O'
        ctx.moveTo(p.x,p.y);
        ctx.arc(p.x, p.y, x(3), 0, (2*Math.PI));
        ctx.moveTo(p.x,p.y);
        //DRAW CROWN ARCS 'UU'
        if(idx !== crownSpikes.length-1){
            let next = crownSpikes[idx+1]
            let btwnX = p.x + (next.x-p.x)/2;
            let curveDepth = p.y+y(30);
            ctx.quadraticCurveTo(btwnX, curveDepth, next.x, next.y);
        }
    });
    //DRAW CROWN BOTTOM '|_|'
    let startCorner = crownSpikes[0];
    let endCorner = crownSpikes[crownSpikes.length-1];
    let crownHeight = y(35);
    let crownFit = x(5);
    ctx.lineTo(endCorner.x-crownFit, crownHeight);
    ctx.lineTo(startCorner.x+crownFit, crownHeight);
    ctx.lineTo(startCorner.x, startCorner.y);
    ctx.strokeStyle='black'; ctx.stroke();
    ctx.fillStyle='white'; ctx.fill();

    //DRAW BACKGROUND HAIR
    let hairBang = new P(50, 35);
    let hairDown = new P(70, 90);
    let bhairCP1 = new P(35, 40);
    let bhairCP2 = new P(45, 70); 
    ctx.beginPath();
    ctx.moveTo(hairBang.x, hairBang.y);
    ctx.bezierCurveTo(bhairCP1.x, bhairCP2.y, bhairCP2.x, bhairCP2.y, hairDown.x, hairDown.y);
    ctx.stroke();
    ctx.fillStyle = 'white'; ctx.fill();

    //DRAW HEAD
    let headStart = new P(50, 35);
    let foreHead = new P(50, 40)
    let noseCurve = new P(55, 50);
    let nosePoint = new P(50, 55);
    let chin = new P(60,70);
    let headEnd = new P(80,35);
    ctx.beginPath();
    ctx.moveTo(headStart.x, headStart.y);
    ctx.lineTo(foreHead.x, foreHead.y);
    ctx.quadraticCurveTo(noseCurve.x, noseCurve.y, nosePoint.x, nosePoint.y)
    ctx.lineTo(chin.x, chin.y);
    ctx.lineTo(chin.x+x(15), chin.y);
    ctx.lineTo(headEnd.x, headEnd.y);
    ctx.strokeStyle='black'; ctx.stroke();
    ctx.closePath();
    ctx.fillStyle='white'; ctx.fill();
    //DRAW EYE
    ctx.beginPath();
    let eyeStart = new P(56, 50); //almost same as nose  curve
    let eyeLength = x(6);
    let eyeCurve = y(2);
    ctx.moveTo(eyeStart.x, eyeStart.y);
    ctx.quadraticCurveTo(eyeStart.x+eyeLength/2, eyeStart.y+eyeCurve, eyeStart.x+eyeLength, eyeStart.y);
    ctx.lineWidth = 5;ctx.stroke();ctx.lineWidth = 10;

    //Mouth
    ctx.beginPath()
    ctx.moveTo(chin.x-x(4), chin.y-y(5));
    ctx.lineTo(chin.x, chin.y-y(6));
    ctx.lineWidth=5;ctx.stroke();ctx.lineWidth=10;

    //SET FOREGROUND HAIR
    let hairTail = new P(70,100);
    let hairCP1 = new P(110, 90);
    let hairCP2 = new P(90, 40);
    let hairCorner = new P(80, 35);//same as crown r corner
    let hairInnerCP1= new P(70, 35);
    let hairInnerCP2= new P(85, 100);
    let hairEnd = new P(30, 100);

    //DRAW HAND
    let handStart = new P(14, y(78))
    ctx.beginPath();
    ctx.roundRect(handStart.x, y(80), x(30), y(12), [15,0,0,15]);
    ctx.stroke();ctx.fillStyle='white'; ctx.fill();
    //DRAW STAFF
    ctx.beginPath();
    ctx.moveTo(handStart.x+x(3), handStart.y);
    ctx.lineTo(handStart.x+x(3), y(50));
    ctx.lineWidth=6; ctx.stroke(); ctx.beginPath();
    ctx.moveTo(x(100)-(handStart.x+x(3)), y(100));
    ctx.lineTo(x(100)-(handStart.x+x(3)), y(70));
    ctx.lineWidth=6; ctx.stroke(); ctx.beginPath();
    ctx.arc(handStart.x+x(3), y(50), x(3), 0, (2*Math.PI));
    ctx.lineWidth=10; ctx.stroke(); 
    ctx.fillStyle = 'white'; ctx.fill();
    //DRAW FINGER
    ctx.beginPath();
    ctx.roundRect(handStart.x-x(8), y(78), x(15), y(3), [15,15,15,15]);
    ctx.roundRect(handStart.x-x(6), y(82), x(13), y(3), [15,15,15,15]);
    ctx.roundRect(handStart.x-x(4), y(86), x(11), y(3), [15,15,15,15]);
    ctx.roundRect(handStart.x-x(2), y(90), x(9), y(3), [15,15,15,15]);
    ctx.stroke(); ctx.fillStyle='white'; ctx.fill();
    //DRAW THUMB
    ctx.beginPath();
    ctx.moveTo(handStart.x + x(15), y(80)); //WRIST
    ctx.lineTo(handStart.x + x(10), y(75)); //THUMB JOINT
    ctx.lineTo(handStart.x - x(3), y(75)); //THUMB POINT
    ctx.quadraticCurveTo( 
        handStart.x - x(3), y(78), //THUMB MEAT CURVE
        handStart.x + x(8), y(78));//INNER THUMB JOINT
    ctx.quadraticCurveTo(
        handStart.x + x(10), y(95), //THUMB PALM MEAT CURVE
        handStart.x+ x(40), y(80)); //INSIDE SLEEVE
    ctx.closePath(); ctx.stroke(); 
    ctx.fillStyle='white'; ctx.fill();

    //DRAW SLEEVE
    ctx.beginPath();
    ctx.roundRect(handStart.x+x(16), y(80), x(50), y(15), [0,0,0,30]);
    ctx.fillStyle='white'; ctx.stroke();ctx.fill();
    
    //DRAW FOREGROUND HAIR
    ctx.beginPath();
    ctx.moveTo(hairTail.x, hairTail.y);
    ctx.bezierCurveTo(
        hairCP1.x, hairCP1.y, 
        hairCP2.x, hairCP2.y, 
        hairCorner.x, hairCorner.y);
    ctx.lineTo(hairBang.x, hairBang.y);
    ctx.bezierCurveTo(
        hairInnerCP1.x, hairInnerCP1.y, 
        hairInnerCP2.x, hairInnerCP2.y, 
        hairEnd.x, hairEnd.y);
    // ctx.bezierCurveTo(
    //     hairCurveCP1.x,hairCurveCP1.y,
    //     hairCurveCP2.x,hairCurveCP2.y,
    //     hairEnd.x,hairEnd.y);
    ctx.strokeStyle='black';
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle='white'; ctx.fill();
//endregion
}
function draw(canvas, ...instructions){
    canvas.style.zIndex = '3'; //TEMP FOR DRAWING
    //FIXING ASPECT RATIO
    let m = canvas.width/100;
    let ctx = canvas.getContext('2d'); //returns a drawing context on the canvas
    ctx.scale(1,1);
    //MATH RELATED, GET PERCENTAGE
    console.log(canvas.width, canvas.height); //SIZE IS 300 WIDTH 150 HEIGHT
    let x=(x)=>{return x*m};
    let y=(y)=>{return y*m};
    function P(_x=0,_y=0){this.x = x(_x);this.y = y(_y);}
    //UNIVERSAL STYLE
    ctx.lineWidth = 10;
    //ctx.lineJoin = 'round'; //mitter, round, bevel
    ctx.lineCap = 'round';//butt, round, square
}
