	/**
	 * These will be global.
	 * I need to find a way to make them easy to override
	 */
	 PROJECT_NAME = "Olives",
		// Directory where all .js sources are located
		SRC_DIR = "src",
		// External libs directory (like jasmine)
		LIBS_DIR = "lib",
		// The main project's js sources
		PROJECT_SRC_DIR = "src",
		// The directory where the specs are located
		PROJECT_SPECS_DIR = "specs",
		
		// The tools directory, should have compilers, doc generators...
		TOOLS_DIR = "../tools",
		// The build directory where compiled sources are located
		BUILD_DIR = "build",
		// The documentation directory where the doc is generated
		DOCS_DIR = "docs",
		// A temporary directory for building files
		TEMP_DIR = BUILD_DIR + "/temp",
		// A report directory where to put CI files
		REPORTS_DIR = BUILD_DIR + "/reports",
		
		// The JsDoc directory
		JSDOC_DIR = TOOLS_DIR + "/JsDoc",
		// The JsDoc executable
		JSDOC = JSDOC_DIR + "/jsrun.jar",
		// The Google Compiler directory
		GCOMPILER_DIR = TOOLS_DIR + "/GoogleCompiler",
		// The Google Compiler executable
		GCOMPILER = GCOMPILER_DIR + "/compiler.jar",
		// The JsTestDriver directory
		JSTD_DIR = TOOLS_DIR + "/JsTestDriver",
		// The JsTestDriver executable
		JSTD = JSTD_DIR + "/JsTestDriver-1.3.3d.jar",
		// The URL of the JsTestDriver server
		JSTD_URL = "http://localhost",
		// The port of the JsTestDriver server
		JSTD_PORT = 4224,
		
		// The order in which to load the libraries
		LIBS_LOADING_ORDER = [ 
						       LIBS_DIR + "/require.js",
						       LIBS_DIR + "/Emily.js"
						      ];
	 
	 	PROJECT_LOADING_ORDER = [  PROJECT_SRC_DIR + "/*.js"
	 	                        ];
	 
	 	// The order in which to load the spec files
	 	SPECS_LOADING_ORDER = [ PROJECT_SPECS_DIR + "/specHelper.js",
	 					        PROJECT_SPECS_DIR + "/*.js"
	 						   ];
		/**
		 * jsTestDriver's config.
		 * This JSON will simply generate a temporary jsTestDriver.conf file
		 */
		JSTD_CONFIG = {
			configFile: {
				// No trailing slash
				server: JSTD_URL + ":" + JSTD_PORT,
				load: [LIBS_DIR + "/jasmine.js",
				       LIBS_DIR + "/jasmineAdapter.js"]
					  .concat(LIBS_LOADING_ORDER)
					  .concat(PROJECT_LOADING_ORDER),
				        
				test: SPECS_LOADING_ORDER,
	
				plugin: ['name: "coverage" \n' +
				         '   jar: "../tools/JsTestDriver/coverage-1.3.3d.jar" \n' +
				         '   module: "com.google.jstestdriver.coverage.CoverageModule"'
				         ],
				
				timeout: 90	
			},
			browsers: ["/Applications/Firefox.app/Contents/MacOS/Firefox",
			           "open /Applications/Safari.app"]
		};
		