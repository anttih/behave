var DotsReporter = exports.DotsReporter = function (stream) {
    this.stream = stream;
    this.total = 0;
};

DotsReporter.prototype = {
    ok: function (context, name) {
        this.total++;
        this.stream.write('.');
        this._write_newline_if_80_tests();
    },

    failure: function (context, name, e) {
        this.total++;
        this.stream.write('F');
        this._write_newline_if_80_tests();
    },

    error: function (context, name, e) {
        this.total++;
        this.stream.write('E');
        this._write_newline_if_80_tests();
    },

    _write_newline_if_80_tests: function () {
        if (this.total % 80 === 0) {
            this.stream.write('\n');
        }
    }
};

var SpecReporter = exports.SpecReporter = function (writer) {
    this.writer = writer;

    this.written_context_names = [];
    this.ok_count = 0;
    this.failure_count = 0;
    this.error_count = 0;
};

SpecReporter.prototype = {
    ok: function (context, name) {
        this.ok_count++;
        this._write_context(context);
        this._write_test_name(context.length, name);
    },

    failure: function (context, name, e) {
        var level = context.length;
        this.failure_count++;

        this._write_context(context);
        this._write_test_name(level, name);
        this.writer.write_line(level + 1, 'Failure: ' + e.message);
        this.writer.write_line(level + 2, 'expected: ' + JSON.stringify(e.expected));
        this.writer.write_line(level + 2, 'got:      ' + JSON.stringify(e.actual));
    },

    error: function (context, name, e) {
        var level = context.length;
        this.error_count++;

        this._write_context(context);
        this._write_test_name(level, name);
        this.writer.write_line(level, '  Error: ' + e.message);
    },

    summary: function () {
        var total = this.ok_count + this.failure_count + this.error_count;
        this.writer.write_line(0, '');

        var summary = total + ' examples, '
                    + this.failure_count + ' failures, '
                    + this.error_count + ' errors';

        if (this.ok_count !== total) {
            this.writer.write_error_line(0, summary);
        } else {
            this.writer.write_ok_line(0, summary);
        }
    },

    _write_test_name: function (level, name) {
        this.writer.write_ok_line(level, name);
    },

    _write_context: function (context) {
        var i, new_contexts = [];
        for (i = 0; i < context.length; i++) {
            if (this.written_context_names[i] !== context[i]) {
                new_contexts = context.slice(i);
                break;
            }
        }

        this._write_context_names(i, new_contexts);
        this.written_context_names = context;
    },

    _write_context_names: function (level, names) {
        var that = this;
        if (level === 0) {
            this.writer.write_line(0, '');
        }
        names.forEach(function (name) {
            that.writer.write_line(level, name);
            level++;
        });
    },

};

var IndentingLineWriter = exports.IndentingLineWriter = function (stream, opts) {
    this.stream = stream;
    opts = opts || {};

    this.write_ok_line = this.write_line;
    this.write_error_line = this.write_line;

    if (opts.color) {
        this.write_ok_line    = this._write_green_line;
        this.write_error_line = this._write_red_line;
    }
};

IndentingLineWriter.prototype = {

    write_line: function (level, str) {
        this.stream.write(this._indent(level) + str + '\n');
    },

    _write_green_line: function (level, str) {
        this.write_line(level, '\033[32;m' + str + '\033[0;m');
    },

    _write_red_line: function (level, str) {
        this.write_line(level, '\033[31;m' + str + '\033[0;m');
    },

    _indent: function (level) {
        var space = '';
        while (level--) {
            space += '  ';
        }
        return space;
    }
};
