var vows = require('vows');
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');

var CMD = "NODE_PATH=$NODE_PATH:" + process.cwd() + " " + process.cwd() + '/bin/behave.js';

vows.describe("Behave command").addBatch({
    'suite with one test inside a context' : {
        topic: function () {
            var data = "describe('Context', function () {"
                     + " it('test name', function () {}); "
                     + "});";

            fs.writeFile("spec/integration/data/spec/test_spec.js", data, this.callback);
        },
        'running with no params': {
            topic: function () {
                exec(CMD, {cwd: __dirname + '/data'}, this.callback);
            },

            "prints progress with dots and a summary": function (err, stdout, stderr) {
                assert.equal(stdout, '.\n\033[32;m1 examples, 0 failures, 0 errors\033[0;m\n');
            }
        },

        'running without path using the spec reporter': {
            topic: function () {
                exec(CMD + ' -r d', {cwd: __dirname + '/data'}, this.callback);
            },
            "prints topic, test name and summary": function (err, stdout, stderr) {
                assert.equal(
                    stdout,
                    '\nContext\n  \033[32;mtest name\033[0;m\n\n'
                    + '\033[32;m1 examples, 0 failures, 0 errors\033[0;m\n');
            }
        }
    }
}).export(module);
