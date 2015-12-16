import SearchField from '../common/SearchField';

class HomeView {
    constructor() {
        this.search = new SearchField($('#search'));
    }

    detach() {
        this.search.detach();
    }
}

export default HomeView;
