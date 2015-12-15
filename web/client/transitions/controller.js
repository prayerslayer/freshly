class Controller {
    constructor() {
        console.log('Controller::init()');

        window.onpopstate = this.popState.bind(this);
    }

    popState(event) {
        console.log('state:', event.state);
    }
}

export default new Controller();
