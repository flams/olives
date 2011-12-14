var requirejs = require("requirejs"),
	jasmine = require("jasmine-node"),
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


	requirejs("./Jakeconfig.js");
	requirejs.config({
		baseUrl: PROJECT_SRC_DIR,
		nodeRequire: require
	});

namespace("docs", function () {
	task("clean", [], function () {
		// Delete previous files first.
	});
	
	desc("Generate " + PROJECT_NAME + "'s documentation");
	task("generate", ["docs:clean"], function () {
		var cmd = "java -jar " + JSDOC + " " +
				JSDOC_DIR + "/app/run.js " + 
				PROJECT_SRC_DIR +
				" -r=2" +
				" -d=" + DOCS_DIR +
				" -t=" + JSDOC_DIR + "/templates/jsdoc";

		_execCommand(cmd);
	});
});

namespace("build", function () {
	task("clean", [], function () {
		// Delete previous files first.
		fs.unlink(BUILD_DIR + "/" + PROJECT_NAME + ".js");
		fs.unlink(BUILD_DIR + "/" + PROJECT_NAME + "-map.js");
		fs.unlink(TEMP_DIR + "/concat.js");
	});
	
	task("concat", ["build:clean"], function () {
		var files = _getFiles(PROJECT_SRC_DIR),
			concat = "";
		
		files.forEach(function (file) {
			concat += fs.readFileSync(PROJECT_SRC_DIR + "/" + file,"utf8");
		});
		
		fs.writeFile(TEMP_DIR + "/concat.js", concat, function (err) {
			if (err) {
				throw err;
			}
		});
	});
	
	task("minify", ["build:concat"], function () {
		var cmd = "java -jar " + GCOMPILER +
				" --js " + TEMP_DIR + "/concat.js" +
				" --js_output_file " + BUILD_DIR + "/" + PROJECT_NAME + ".js" +
				" --create_source_map " + BUILD_DIR + "/" + PROJECT_NAME + "-map";
		
		_execCommand(cmd);
	});
});

namespace("tests", function () {
	task("jstd_conf", [], function () {
		var conf = "",
			prop,
			file = JSTD_CONFIG.configFile;
		
		for (prop in file) {
			if (file.hasOwnProperty(prop)) {
				conf += prop + ": ";
				if (["number", "string"].indexOf(typeof file[prop]) >= 0) {
					conf += file[prop] + "\n"; 
				} else if (file[prop].forEach) {
					conf += "\n";
					file[prop].forEach(function (line) {
						conf += " - " + line + "\n";
					});
				}
				conf += "\n";
			}
		}
		
		fs.writeFile("jsTestDriver.conf", conf, function (err) {
			if (err) {
				throw err;
			}
		});
		
	});
	
	task("jstd", ["tests:jstd_conf"], function () {
		var cmd = "java -jar " + JSTD +
				" --port " + JSTD_PORT +
				" --browser " + JSTD_CONFIG.browsers.join() +
				" --tests all" +
				" --testOutput " + REPORTS_DIR;
		
		_execCommand(cmd);
		
	});
	
	task("node", [], function () {
		
		LIBS_LOADING_ORDER.forEach(_requireList);
		PROJECT_LOADING_ORDER.forEach(_requireList);
		SPECS_LOADING_ORDER.forEach(_requireList);
		jasmine.getEnv().addReporter(new TerminalReporter({}));
		jasmine.getEnv().execute();
	});
	
	task("all", ["tests:jstd", "tests:node"], function () {});
});

desc("This is the default task");
task("default", ["tests:all", "docs:generate", "build:minify"], function () {
	console.log(arguments);
});
