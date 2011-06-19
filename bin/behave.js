#!/usr/bin/env node

var main = function (global) {
	var fs = require('fs'),
		Runner = require('behave/runner').Runner,
		reporters = require('behave/reporters'),
		Collector = require('behave/collectors').SugarCollector;

	var collector = new Collector();

	var runner = new Runner();
	var writer = new reporters.IndentingLineWriter(process.stdout, {color: true});
	var reporter = new reporters.SpecReporter(writer);

	runner.on('ok',      reporter.ok.bind(reporter));
	runner.on('failure', reporter.failure.bind(reporter));
	runner.on('error',   reporter.error.bind(reporter));

	collector.suite(function (suite) {
		runner.run(suite);
	});

	collector.start(global);

	var dir = process.argv[2] || 'spec';

	var files = fs.readdirSync(process.cwd() + '/' + dir);
	files.forEach(function (file) {
		if (/_spec.js$/.test(file)) {
			var path = process.cwd() + '/' + dir + '/' + file;
			require(path);
		}
	});
	reporter.summary();

	collector.stop();
};

main(global);
