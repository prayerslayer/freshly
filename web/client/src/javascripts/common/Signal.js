class Signal {
    constructor(onConnect) {
        this.onConnect = onConnect;

        this.handlers = [];
        this.nextIndex = 0;
        this.handlersByParam = {
            handlers: [],
            values: {}
        };
    }

    signal() {
        var byParam = this.handlersByParam;
        var handlerIndexes = [].concat(byParam.handlers);
        for (var i = 0; i < arguments.length; ++i) {
            var value = arguments[i];
            byParam = byParam.values[value];
            if (!byParam) {
                break;
            }

            handlerIndexes = handlerIndexes.concat(byParam.handlers);
        }

        for (i = 0; i < handlerIndexes.length; ++i) {
            if (this.handlers[handlerIndexes[i]]) {
                var item = this.handlers[handlerIndexes[i]];
                item.handler.apply(null, arguments);
            }
        }
    }

    connect(matchParams, handler) {
        if (! handler) {
            throw 'missing handler!';
        }

        var self = this;

        var index = self.nextIndex++;
        self.handlers[index] = {
            handler: handler
        };

        var byParam = self.handlersByParam;
        for (var i = 0; i < matchParams.length; ++i) {
            var value = matchParams[i];
            if (!byParam.values[value]) {
                byParam.values[value] = {
                    handlers: [],
                    values: {}
                };
            }

            byParam = byParam.values[value];
        }
        byParam.handlers.push(index);

        if (self.onConnect) {
            self.onConnect(self, handler, matchParams);
        }

        return function detach() {
            if (self.handlers) {
                delete self.handlers[index];
                byParam.handlers.splice(byParam.handlers.indexOf(index), 1);
            }
        };
    }

    destroy() {
        this.handlers = null;
        this.handlersByParam = null;
    }
}

Signal.create = function (onConnect) {
    var signal = new Signal(onConnect);

    function signalHandle() {
        signal.signal.apply(signal, arguments);
    }

    signalHandle.connect = function () {
        var matchParams = [];
        for (var i = 0; i < (arguments.length - 1); ++i) {
            matchParams.push(arguments[i]);
        }

        var handler = arguments[arguments.length - 1];

        return signal.connect(matchParams, handler);
    };

    // mostly only for debugging
    signalHandle.signal = signal;

    return signalHandle;
};

export default Signal;
