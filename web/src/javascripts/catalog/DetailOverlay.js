
import ArticleDetails from './ArticleDetails';

class DetailOverlay {
  constructor() {
    this._previousScroll = 0;
  }

  render() {
    this._overlay = $('<div class="detail-overlay" />');
    this._articlesElement = $('<div class="articles" />').appendTo(this._overlay);

    return this._overlay;
  }

  toggleOverlay(likedArticles) {
    var parent = this._overlay.parent();
    var active = parent.hasClass('detail-overlay-active');

    if (! active) {
      this._previousScroll = $('body').scrollTop();
      this._overlay.css({marginTop: this._previousScroll});

      this._articlesElement.empty();

      Object.keys(likedArticles || {}).forEach((article) => {
        this.renderArticle(likedArticles[article]);
      });

      parent.addClass('detail-overlay-active');

      parent.height(this._overlay.height() + this._previousScroll);
      $('html').css({marginTop: -1 * this._previousScroll});
      $('body').scrollTop(0);
    } else {
      parent.removeClass('detail-overlay-active');
      parent.height('auto');

      $('html').css({marginTop: 0});
      $('body').scrollTop(this._previousScroll + $('body').scrollTop());

      $('body').animate({scrollTop: this._previousScroll}, 500);
    }
  }

  renderArticle(article) {
    var details = new ArticleDetails(article);

    this._articlesElement.append(details.render());
  }
}

export default  DetailOverlay;
