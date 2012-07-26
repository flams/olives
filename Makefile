#########
# NAMES #
#########

PROJECT_NAME = "Olives"

#########
# PATHS #
#########

SRC_DIR = "src"
DOCS_DIR = "docs"
BUILD_DIR = "build"

#########
# TOOLS #
#########

SRC = $(shell find src -name "*.js" -type f)
JARJSDOC = $(shell find tools -name "jsrun.jar" -type f)
JSJSDOC = $(shell find tools -name "run.js" -type f)
JSDOCTEMPLATE = $(shell find tools -name "jsdoc" -type d)

all: docs build

docs: clean-docs
	@java -jar $(JARJSDOC) \
		$(JSJSDOC) $(SRC_DIR) \
		-r=2 \
		-d=$(DOCS_DIR) \
		-t=$(JSDOCTEMPLATE)
		
clean-docs:
	@rm -rf $(DOCS_DIR)
	
clean-build:
	@rm -rf $(BUILD_DIR)/*

build: Olives.js Olives.min.js
	
Olives.js: $(SRC)
	@cat  LICENSE-MINI $(SRC) > $(BUILD_DIR)/$@
	
Olives.min.js: Olives.js
	@java -jar tools/GoogleCompiler/compiler.jar \
		--js build/Olives.js \
		--js_output_file build/Olives.min.js \
		--create_source_map build/Olives-map
	
.PHONY: docs clean-docs clean-build build