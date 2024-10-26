export class BaseState {
    constructor(_enter=()=>{}, _during=()=>{}, _exit=()=>{}){
        this.enter = _enter;
        this.during = _during;
        this.exit = _exit;
    }
}
export class BaseStateMachine{
    _curState = undefined;
    constructor(_initState){this._curState = _initState; this._curState.enter()};
    get currentState(){return this._curState};
    set currentState(_otherState){
        this._curState.exit();
        this._curState = _otherState;
       _otherState.enter();
    }
}
