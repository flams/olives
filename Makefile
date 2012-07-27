SRC := $(wildcard src/*.js)
JsTestDriver = $(shell find tools -name "JsTestDriver-*.jar" -type f)

all: tests docs build

clean-docs:
	-rm -rf docs/latest/

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc
		
tests:
	java -jar $(JsTestDriver) \
		--tests all
	
clean-build:
	-rm -rf build/

build: clean-build Olives.js Olives.min.js
	cp LICENSE build/
	
release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/Olives-$(VERSION)
	cp build/* release/tmp/Olives-$(VERSION)
	
	cd release/tmp/Olives-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' Olives.js Olives.min.js; \
	rm Olives.js.bak Olives.min.js.bak
	
	cd release/tmp/; \
	tar czf ../Olives-$(VERSION).tgz Olives-$(VERSION)
	
	rm -rf release/tmp/
	
	cp -rf docs/latest/ docs/$(VERSION)/
	
Olives.js: $(SRC)
	mkdir -p build
	cat LICENSE-MINI $(SRC) > build/$@
	
Olives.min.js: Olives.js
	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/Olives.js \
		--js_output_file build/Olives.min.js \
		--create_source_map build/Olives-map
		
clean: clean-build 
	
gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages
	
	git checkout master Makefile
	git checkout master docs; git add docs
	git checkout master src; git add src
	git checkout master specs; git add specs
	git checkout master tools; git add lib
	git checkout master lib; git add lib
	git checkout master release; git add release
	
	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/Olives.*\.tgz">#<a href="release/Olives-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"
	
	
.PHONY: docs clean-docs clean-build build tests release clean gh-pages	