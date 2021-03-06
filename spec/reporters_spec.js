var Reporter = require('behave/reporters').SpecReporter;
var DotsReporter = require('behave/reporters').DotsReporter;
var SummaryReporter = require('behave/reporters').SummaryReporter;
var IndentingLineWriter = require('behave/reporters').IndentingLineWriter;
var assert = require('assert');
var AssertionError = require('assert').AssertionError;

function new_stream() {
    return {
        data: '',
        write: function (data) {
            this.data += data;
        }
    };
}

describe('Reporters', function () {
    var stream, reporter;
    describe('Spec reporter', function () {
        before_each(function () {
            stream = new_stream();
            reporter = new Reporter(new IndentingLineWriter(stream));
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

            it('does not print context names that have already been printed', function () {
                reporter.ok(['Topic'], 'test name');
                reporter.ok(['Topic', 'name'], 'test name');
                var expect = '\nTopic\n'
                           + '  test name\n'
                           + '  name\n'
                           + '    test name\n';
                assert.equal(stream.data, expect);
            });

            it('prints a newline before each top-level context', function () {
                reporter.ok(['Context'], 'first');
                reporter.ok(['Context 2'], 'second');
                var expect = '\nContext\n'
                           + '  first\n'
                           + '\nContext 2\n'
                           + '  second\n';
                assert.equal(stream.data, expect);
            });
        });

        describe('Failing test', function () {
            it('prints failure name and message', function () {
                reporter.failure(['Topic'], 'test name', new AssertionError({
                    message: 'Message',
                    expected: 'some',
                    actual: 'other'
                }));

                var expect = '\nTopic\n  test name\n'
                           + '    Failure: Message\n'
                           + '      expected: "some"\n'
                           + '      got:      "other"\n';
                assert.equal(stream.data, expect);
            });
        });

        describe('Erroring test', function () {
            it('prints error name and message', function () {
                reporter.error(['Topic'], 'test name', new Error('Message'));
                assert.equal(stream.data, '\nTopic\n  test name\n    Error: Message\n');
            });
        });


        describe('colors', function () {
            before_each(function () {
                stream = new_stream();
                reporter = new Reporter(new IndentingLineWriter(stream), {color: true});
            });


            it('prints passing tests with green', function () {
                reporter.ok(['Topic'], 'passing test');
                assert.equal(stream.data, '\nTopic\n  \033[32;mpassing test\033[0;m\n');
            });
        });
    });

    describe('Dots reporter', function () {
        before_each(function () {
            stream = new_stream();
            reporter = new DotsReporter(stream);
        });

        it('prints a dot for a passing test', function () {
            reporter.ok(['Topic'], 'test name');
            assert.equal(stream.data, '.');
        });

        it('prints a newline after the 80th test', function () {
            var count = 82;
            while(count--) {
                reporter.ok(['Topic'], 'test');
            }
            assert.ok(/^\.{80}\n\.{2}/.test(stream.data));
        });

        it('prints a newline after the 80th test including failures and errors', function () {
            var count = 80;
            reporter.failure(['topic'], 'failure', {});
            reporter.error(['topic'], 'error', {});
            while(count--) {
                reporter.ok(['Topic'], 'test');
            }
            assert.ok(/^FE\.{78}\n\.{2}/.test(stream.data));
        });

        it('prints the letter F for a failing test', function () {
            reporter.failure(['Topic'], 'test name', new AssertionError({message: 'msg'}));
            assert.equal(stream.data, 'F');
        });

        it('prints the letter E for an erroring test', function () {
            reporter.error(['Topic'], 'test name', new Error());
            assert.equal(stream.data, 'E');
        });
    });

    describe('Summary reporter', function () {
        before_each(function () {
            stream = new_stream();
            reporter = new SummaryReporter(stream);
        });

        it('has 1 example, 0 failures and 0 errors when one passing test', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.summary();
            assert.equal(stream.data, "\n\n1 examples, 0 failures, 0 errors\n");
        });

        it('has 2 examples, 0 failures and 0 errors when two passing tests', function () {
            reporter.ok(['Topic'], 'test name');
            reporter.ok(['Topic'], 'test name');
            reporter.summary();
            assert.equal(stream.data, "\n\n2 examples, 0 failures, 0 errors\n");
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

        describe('colors enabled', function () {
            before_each(function () {
                stream = new_stream();
                reporter = new SummaryReporter(stream, {color: true});
            });

            it('prints summary with green when all pass', function () {
                reporter.ok(['Topic'], 'name');
                reporter.summary();
                assert.ok(/\033\[32;m1 examples, 0 failures, 0 errors\033\[0;m/.test(stream.data));
            });

            it('print summary with red when not all pass', function () {
                reporter.failure(['Topic'], 'name', new AssertionError({message: "Msg"}));
                reporter.summary();
                assert.ok(/\033\[31;m1 examples, 1 failures, 0 errors\033\[0;m/.test(stream.data));
            });
        });
    });
    
    describe('line writer', function () {
        var writer;
        describe('with no colors', function () {
            before_each(function () {
                stream = new_stream();
                writer = new IndentingLineWriter(stream);
            });

            it('can write lines', function () {
                writer.write_line(0, 'hello');
                assert.equal(stream.data, 'hello\n');
            });

            it('can indent lines', function () {
                writer.write_line(1, 'hello');
                writer.write_line(2, 'hello');
                assert.equal(stream.data, '  hello\n    hello\n');
            });
        });
    });
});
