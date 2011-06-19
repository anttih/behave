
var SugarCollector = exports.SugarCollector = function () {
    this.callback = null;
};

SugarCollector.prototype = {
    suite: function (f) {
        this.callback = f;
    },
    start: function (obj) {
        var suite = {},
            that = this
            stack = [];

        var get_current_context = function () {
            var i, obj = suite;
            for (i = 0; i < stack.length; i++) {
                obj = obj[stack[i]];
            }
            return obj;
        };

        var describe = function (name, block) {
            var context = get_current_context();

            stack.push(name);

            // create a new context in the suite
            context[name] = {};

            // collect child-contexts
            block();

            stack.pop();

            if (stack.length === 0) {
                that.callback(suite);
                suite = {};
            }
        };

        var it = function (name, f) {
            get_current_context()[name] = f;
        };

        var before_each = function (f) {
            get_current_context().before_each = f;
        };

        obj.describe = describe;
        obj.it = it;
        obj.before_each = before_each;
    },
    stop: function () {
    }
};
