import Signal from '../common/Signal';

class ArticleControls {
  constructor(data, isLook) {
    this._data = data;
    this._isLook = isLook;

    this.liked = Signal.create();
    this.disliked = Signal.create();
    this.openShop = Signal.create();
  }

  render() {
    this._controlsElement = $('<div>').addClass('article-controls');

    if (! this._isLook) {
        this.renderShoppingCartButton();
        this.renderDislikeButton();
    }

    this.renderLikeButton();

    this.update();

    return this._controlsElement;
  }

  update() {
    var liked = this._isLook ? this._data.lookLiked : this._data.liked;
    if (liked) {
      this._likeButton.addClass('fav');
    } else {
      this._likeButton.removeClass('fav');
    }

    if (! this._isLook) {
        if (this._data.disliked) {
          this._dislikeButton.addClass('fav');
        } else {
          this._dislikeButton.removeClass('fav');
        }
    }
  }

  renderLikeButton() {
    this._likeButton = $('<button type="button">').addClass('article-button like');
    this._likeButton.on('click', () => {
      this.liked();
    });

    var symbol = $('<i>').addClass('hearth');
    this._likeButton.append(symbol);

    this._controlsElement.append(this._likeButton);
  }

  renderDislikeButton() {
    this._dislikeButton = $( '<button type="button">').addClass('article-button dislike');
    this._dislikeButton.on('click', () => {
        this.disliked();
    });

    var symbol = $('<i>').addClass('thumps-down');
    this._dislikeButton.append(symbol);

    this._controlsElement.append(this._dislikeButton);
  }

  renderShoppingCartButton() {
    this._cartButton = $('<button type="button">').addClass('article-button cart');
    this._cartButton.on('click', () => {
       window.open(this._data.shopUrl, this._data.name,"location=yes,")
    });

    var symbol = $('<i>').addClass('packet');
    this._cartButton.append(symbol);

    this._controlsElement.append(this._cartButton);
  }
}

export default ArticleControls;
