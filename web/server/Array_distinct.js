Array.prototype.distinct = function () {
    var known = {};
    var result = [];

    this.forEach(item =>  {
            if (!known[item]) {
                known[item] = true;
                result.push(item);
            }
        });

    return result;
};
