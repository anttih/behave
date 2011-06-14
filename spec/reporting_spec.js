var Reporter = require('behave').SpecReporter;
var vows = require('vows');
var assert = require('assert');

function new_stream() {
    return {
        data: '',
        write: function (data) {
            this.data += data;
        }
    };
}

vows.describe("Spec reporter").addBatch({
    'specs' : {
        'prints context as topic': function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic'], 'test name');
            assert.equal(stream.data, 'Topic\n- test name');
        },
    }
}).export(module);
