var Reporter = require('behave').SpecReporter;
var assert = require('assert');
var AssertionError = require('assert').AssertionError;

describe('Reporters', function () {
    var stream, reporter;
    before_each(function () {
        stream = {
            data: '',
            write: function (data) {
                this.data += data;
            }
        };
        reporter = new Reporter(stream);
    });

    describe('Passing tests', function () {
        it('prints context as topic', function () {
            reporter.ok(['Topic'], 'test name');
            assert.equal(stream.data, '\nTopic\n  test name\n');
        });
        it('prints context name only once for all the tests in that context', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.ok(['Topic'], 'second test');
            assert.equal(stream.data, '\nTopic\n  test name\n  second test\n');
        });
        it('indents nested context names', function () {
            reporter.ok(['Topic', 'name'], 'test name');
            assert.equal(stream.data, '\nTopic\n  name\n    test name\n');
        });

    });

    describe('Failing test', function () {
        it('prints failure name and message', function () {
            reporter.failure(['Topic'], 'test name', new AssertionError({
                message: 'Message',
                expected: 'some',
                actual: 'other'
            }));

            assert.equal(
                stream.data,
                '\nTopic\n  test name\n    Failure: Message\n      expected: "some"\n      got:      "other"\n'
            );
        });
    });

    describe('Erroring test', function () {
        it('prints error name and message', function () {
            reporter.error(['Topic'], 'test name', new Error('Message'));
            assert.equal(stream.data, '\nTopic\n  test name\n    Error: Message\n');
        });
    });

    describe('summary', function () {
        it('has 1 example, 0 failures and 0 errors when one passing test', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.summary();
            assert.ok(/1 examples, 0 failures, 0 errors/.test(stream.data));
        });

        it('has 2 examples, 0 failures and 0 errors when two passing tests', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.ok(['Topic'], 'test name');
            reporter.summary();
            assert.ok(/2 examples, 0 failures, 0 errors/.test(stream.data));
        });

        it('has 1 examples, 1 failures and 0 errors when one failure', function () {
            reporter.failure(['Topic'], 'test name', new AssertionError({message: "msg"}));
            reporter.summary();
            assert.ok(/1 examples, 1 failures, 0 errors/.test(stream.data));
        });

        it('has 1 example, 0 failures and 1 error when one error', function () {
            reporter.error(['Topic'], 'test name', new Error("Moi"));
            reporter.summary();
            assert.ok(/1 examples, 0 failures, 1 errors/.test(stream.data));
        });
        it('has 3 examples, 1 failure, and 1 error when one of each', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.failure(['Topic'], 'test name', new AssertionError({message: "msg"}));
            reporter.error(['Topic'], 'test name', new Error("Moi"));
            reporter.summary();
            assert.ok(/3 examples, 1 failures, 1 errors/.test(stream.data));
        });
    });
});
