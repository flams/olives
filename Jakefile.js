/**
 * Olives
 * Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
 * MIT Licensed
 */

var PROJECT_NAME = "Olives";

var requirejs = require("requirejs"),
	fs = require("fs"),
	cp = require("child_process"),
	
	_filesList = {},
	_getFiles = function _getFiles(path) {
		if (!_filesList[path]) {
			_filesList[path] = fs.readdirSync(path);
			return _filesList[path];
		} else {
			return _filesList[path] || [];
		}
	},
	_requireDirectory = function _requireDirectory(dir) {
		_getFiles(dir).forEach(function (file) {
			requirejs(dir + "/" + file);
		});
	},
	_requireList = function _requireList(file) {

		var basedir = file.split("/"),
			basename = basedir.pop();
		if (basename.indexOf("*") >= 0) {

			_requireDirectory(basedir.join("/"));
		} else {

			requirejs(file);
		}

	},
	
	_execCommand = function _execCommand(cmd) {
		cp.exec(cmd, function (error, stdout, stderr) {
			 console.log(stdout);
			    if (stderr) {
				    console.log('stderr: ' + stderr);
			    }
			    if (error) {
			      console.log('exec error: ' + error);
			    }
			});
	};
	
	requirejs.config({
		baseUrl: "src",
		nodeRequire: require
	});

namespace("docs", function () {
	task("clean", [], function () {
		// Delete previous files first.
	});
	
	desc("Generate " + PROJECT_NAME + "'s documentation");
	task("generate", ["docs:clean"], function () {
		var cmd = "java -jar tools/JsDoc/jsrun.jar " +
				"tools/JsDoc/app/run.js src" +
				" -r=2" +
				" -d=docs" +
				" -t=tools/JsDoc/templates/jsdoc";

		_execCommand(cmd);
	});
});

namespace("build", function () {
	task("clean", [], function () {
		// Delete previous files first.
		fs.unlink("build/" + PROJECT_NAME + ".js");
		fs.unlink("build/" + PROJECT_NAME + "-map.js");
		fs.unlink("build/uncompressed/concat.js");
	});
	
	task("concat", ["build:clean"], function () {
		var files = _getFiles("src"),
			concat = fs.readFileSync("LICENSE-MINI","utf8");
		
		files.forEach(function (file) {
			concat += fs.readFileSync("src/" + file,"utf8");
		});
		
		fs.writeFile("build/uncompressed/concat.js", concat, function (err) {
			if (err) {
				throw err;
			}
		});
	});
	
	task("minify", ["build:concat"], function () {
		var cmd = "java -jar tools/GoogleCompiler/compiler.jar" +
				" --js build/uncompressed/concat.js" +
				" --js_output_file build/" + PROJECT_NAME + ".js" +
				" --create_source_map build/" + PROJECT_NAME + "-map";
		
		_execCommand(cmd);
	});
	
	task("copyLicense", function () {
		_execCommand("cp LICENSE build/");
	});
});

namespace("tests", function () {
	
	task("jstd", function () {
		var cmd = "java -jar tools/JsTestDriver/JsTestDriver-1.3.4-a.jar " +
				" --tests all";
				//" --testOutput reports/";
		
		_execCommand(cmd);
		
	});
	
	task("all", ["tests:jstd"], function () {});
});

desc("This is the default task");
task("default", ["tests:all", "docs:generate", "build:minify", "build:copyLicense"], function () {
	console.log(arguments);
});
