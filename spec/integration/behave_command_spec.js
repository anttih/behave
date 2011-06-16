var vows = require('vows');
var assert = require('assert');
var exec = require('child_process').exec;
var fs = require('fs');

var CMD = "NODE_PATH=" + process.cwd() + " " + process.cwd() + '/bin/behave';

vows.describe("Behave command").addBatch({
    'running without path ': {
        topic: function () {
            var data = "describe('Context', function () {"
                     + " it('test name', function () {}); "
                     + "});";

            fs.writeFileSync("spec/integration/data/spec/test_spec.js", data);
            exec(CMD, {cwd: __dirname + '/data'}, this.callback);
        },
        "runs tests in spec/": function (err, stdout, stderr) {
            assert.equal(stdout, '\nContext\n- test name\n\n1 examples, 0 failures, 0 errors\n');
        }
    }
}).export(module);
