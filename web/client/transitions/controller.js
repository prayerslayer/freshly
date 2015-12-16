import SearchTransition from './SearchTransition';

class Controller {
    constructor() {
        console.log('Controller::init()');

        this._path = window.location.pathname;
        this._transitions = [];

        this._transitions.push(new SearchTransition());

        window.onpopstate = this.popState.bind(this);
    }

    popState(event) {
        let transition = this._transitions.find(t => t.appliesTo(this._path, window.location.pathname));
        if (!transition) {
            console.log(`no transition for: ${this._path} → ${window.location.pathname}`);
            window.location.reload();
        } else {
            console.log('running transition!');
            transition.run();
        }
    }
}

export default new Controller();
