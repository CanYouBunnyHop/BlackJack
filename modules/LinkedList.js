export class LinkedListItem{
    constructor(_data, _next = null, _prev = null){
        this.data = _data;
        this.next = _next;
        this.prev = _prev;
    }
}
//
// To perform array functions, can covert list to arr then convert back
//
export default class LinkedList{
    constructor(){
        this.head = null;
        this.length = 0;
        this.tail = null;
    }
    appendItem(_data){
        let newItem = new LinkedListItem(_data);
        if(!this.head) { //if there is no head //meaning no items
            this.head = newItem;
        } else {
            this.tail.next = newItem;
            newItem.prev = this.tail;
            // let curItem = this.head;
            // while(curItem.next){curItem = curItem.next;}//find next available space
            // curItem.next = newItem; //current item next is new item
            // newItem.prev = curItem; //newItem's prev is current
        }
        this.tail = newItem; //update new tail
        this.length++;
    }
    removeItem(_position){
        if(_position < 0 || _position > this.length - 1)
            throw new Error("Invalid index, Out of bounds");
        //if position is tail use pop
        if(_position=== this.length-1){
            this.popItem();
            return;
        }
        let curItem = this.head;
        let prevItem = null;
        for (let i = 0; i < _position; i++){//get to the target index position
            prevItem = curItem; //current becomes previous
            curItem = curItem.next; //next becomes current
        }
        //if position is zero
        if(_position === 0)
            this.head = curItem.next;
        else 
            prevItem.next = curItem.next;
        curItem.next.prev = prevItem;
        this.length--;
    }
    popItem(){
        let output = this.tail;
        this.tail = this.tail.prev;
        this.length--;
        return output;
    }
    insertAt(_position, _data){
        let newItem = new LinkedListItem(_data);
        //array pushing everything else back
        if(_position < 0 || _position > this.length - 1) 
            throw new Error("Invalid index, Out of bounds");
        //if position is tail use appendItem
        if(_position === this.length-1){
            this.appendItem(_data);
            return;
        }
        let curItem = this.head;
        let prev = null;
        for (let i = 0; i < _position; i++){//get to the target index position
            prev = curItem; //current becomes previous
            curItem = curItem.next; //next becomes current
        }
        if(_position === 0){ this.head = newItem;} //new head
        prev.next = newItem; curItem.prev = newItem; 
        newItem.prev = prev;
        newItem.next = curItem;
        this.length++;
    }
    splitListAt(_position){ //is inclusive //mutates 
        if(_position < 0 || _position > this.length - 1)
            throw new Error("Invalid index, Out of bounds");
        let curItem = this.head; //go to position
        for (let i = 0; i < _position; i++){
            curItem = curItem.next;
        }
        //create new linked list
        let newLinkedList = new LinkedList();
        newLinkedList.length = this.length - _position;
        newLinkedList.head = curItem;
        newLinkedList.tail = this.tail;
        //remove link between lists and update tail
        let newListhead = newLinkedList.head;
        let newTail = newListhead.prev;
        newTail.next = null; newListhead.prev = null; 
        this.tail = newTail;
        //Update Length
        this.length = _position;
        return newLinkedList;
    }
    join(_LinkedListItem){ //mutates original list
        //connect items
        _LinkedListItem.prev = this.tail;
        this.tail.next = _LinkedListItem;
        this.length++;
        let curItem = _LinkedListItem;
        //update length
        while(curItem.next){
            curItem = curItem.next;
            this.length ++
        }
        //update tail
        this.tail = curItem;
    }

    searchAt(_position){
        if(_position < 0 || _position > this.length - 1)
            throw new Error("Invalid index, Out of bounds");
        let curItem = this.head;
        for (let i = 0; i < _position; i++){//get to the target index position
            curItem = curItem.next; //next becomes current
        }
        return curItem;
    }
    indexOf(_data){
        let curItem = this.head;
        let index = 0;
        while(curItem && curItem.data !== _data){
            curItem = curItem.next;
            index++;
        }
        if(curItem && curItem.data === _data) return index;
        else return -1;
    }

    static arrToLinkedList(_arr){
        let newLinkedList = new LinkedList();
        _arr.forEach(item=>newLinkedList.appendItem(item));
        return newLinkedList;
    }
    toArray(){
        let arr = [];
        let curItem = this.head;
        while(curItem !== null) {
            arr.push(curItem.data);
            curItem = curItem.next;
        };
        return arr;
    }
}