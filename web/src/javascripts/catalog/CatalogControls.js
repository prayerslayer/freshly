import $ from 'jquery';
import Signal from '../common/Signal';


class CatalogControls {

    constructor() {
        this.clicked = Signal.create();
    }

    render() {
        this._element = $('<div class="controls" />');
        
        this._likesValue = $('<span>0</span>').addClass('number');
        var likesElement = $('<div class="likes" />');
        var symbol = $('<i>').addClass('hearth');

        likesElement.append(symbol);
        likesElement.append(this._likesValue);
        this._element.append(likesElement);

        likesElement.on('click', () => {
             this.clicked();
        });

        return this._element;
    }
    
    update(values) {
        this._likesValue.text(values.likes);
    }
}

export default CatalogControls;
