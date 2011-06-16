var Reporter = require('behave').SpecReporter;
var assert = require('assert');
var AssertionError = require('assert').AssertionError;

describe('Reporters', function () {
    function new_stream() {
        return {
            data: '',
            write: function (data) {
                this.data += data;
            }
        };
    }

    describe('Passing tests', function () {
        var stream, reporter;
        before_each(function () {
            stream = new_stream();
            reporter = new Reporter(stream);
        });

        it('prints context as topic', function () {
            reporter.ok(['Topic'], 'test name');
            assert.equal(stream.data, '\nTopic\n- test name\n');
        });
        it('prints context name only once for all the tests in that context', function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic'], 'test name');
            reporter.ok(['Topic'], 'second test');
            assert.equal(stream.data, '\nTopic\n- test name\n- second test\n');
        });
        it('concatenates nested context names as one', function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.ok(['Topic', 'name'], 'test name');
            assert.equal(stream.data, '\nTopic name\n- test name\n');
        });

        describe('summary', function () {
            it('prints example counts', function () {
                reporter.ok(['Topic'], 'test name');
                reporter.summary();
                assert.equal(stream.data, '\nTopic\n- test name\n\n1 examples, 0 failures, 0 errors\n');
            });
        });
    });

    describe('Failing test', function () {
        it('prints failure name and message', function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.failure(['Topic'], 'test name', new AssertionError({message: 'Message'}));
            assert.equal(stream.data, '\nTopic\nFAIL: Message in test name\n');
        });
    });

    describe('Erroring test', function () {
        it('prints error name and message', function () {
            stream = new_stream();
            var reporter = new Reporter(stream);

            reporter.error(['Topic'], 'test name', new Error('Message'));
            assert.equal(stream.data, '\nTopic\nERROR: Message in test name\n');
        });
    });
});
