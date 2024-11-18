export class Memento{ //the object where it's state is being saved
    constructor(...data){
        this.data = data; 
    }
}
export class Caretaker{ //storing mementos
    mementos = [];
    //currentIndex = 0;
    constructor(){
    }
    remember(_memento){
        //split array, forget old moves
        //this.mementos = this.mementos.slice(0, this.currentIndex + 1);
        this.mementos.push(_memento);
        //this.currentIndex ++;
    }
    undo(){
        // if(this.currentIndex > 0) this.currentIndex --;
        // return this.mementos[this.currentIndex];
        if(this.mementos.length > 0) return this.mementos.pop();
        else {console.log('mementos is empty'); return null;}
    }
    // redo(){
    //     if(this.currentIndex < this.mementos.length-1) this.currentIndex ++;
    //     return this.mementos[this.currentIndex];
    // }
}