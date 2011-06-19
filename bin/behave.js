#!/usr/bin/env node

var main = function (global) {
	var fs = require('fs'),
		nomnom = require('nomnom'),
		Runner = require('behave/runner').Runner,
		reporters = require('behave/reporters'),
		Collector = require('behave/collectors').SugarCollector;

	var options = nomnom.opts({
		reporter: {
			string: '-r REPORTER, --reporter=REPORTER',
			help: 'Which test reporter to use',
		}
	});
	var args = options.parseArgs();

	if (args.reporter == 'd') {
		var writer = new reporters.IndentingLineWriter(process.stdout);
		var reporter = new reporters.SpecReporter(writer, {color: true});
	} else {
		var reporter = new reporters.DotsReporter(process.stdout, {color: true});
	}

	var collector = new Collector();
	var runner = new Runner();

	runner.on('ok',      reporter.ok.bind(reporter));
	runner.on('failure', reporter.failure.bind(reporter));
	runner.on('error',   reporter.error.bind(reporter));

    var summary = new reporters.SummaryReporter(process.stdout, {color: true});

	runner.on('ok',      summary.ok.bind(summary));
	runner.on('failure', summary.failure.bind(summary));
	runner.on('error',   summary.error.bind(summary));

	collector.suite(function (suite) {
		runner.run(suite);
	});

	collector.start(global);

	var dir = args._[0] || 'spec';

	var files = fs.readdirSync(process.cwd() + '/' + dir);
	files.forEach(function (file) {
		if (/_spec.js$/.test(file)) {
			var path = process.cwd() + '/' + dir + '/' + file;
			require(path);
		}
	});

	summary.summary();

	collector.stop();
};

main(global);

