###############################################################################################
# Olives http://flams.github.com/olives
# The MIT License (MIT)
# Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
#
# Targets:
#
# make test: launch tests and watch for changes
#
# make docs: generates the documentation into docs/latest
# make build: generates olives.js and olives.min.js as they appear in the release
#
# make all: tests + docs + build
#
# make release VERSION=x.x.x: make all, then creates the package and pushes to github
#
# make gh-pages VERSION=x.x.x: generates the web site with latest version and pushes to github
#
################################################################################################

SRC := $(wildcard src/*.js)

all: test docs build

clean-temp:
	rm -f temp.js

clean-docs:
	-rm -rf docs/latest/

clean-build:
	-rm -rf build/

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc

test:
	watchify -r ./specs/*.js -i olives -o tests.js &
	karma start karma.config.js

jshint:
	jshint src/*.js specs/*.js

temp.js:
	browserify -r ./src/olives.js:olives -u emily -o temp.js

olives.js: temp.js
	mkdir -p build
	cat LICENSE-MINI temp.js > build/$@

olives.min.js:
	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/olives.js \
		--js_output_file build/olives.min.js \
		--create_source_map build/olives-map

clean: clean-build clean-docs clean-temp

build: clean-build clean-temp olives.js olives.min.js
	cp LICENSE build/

release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/Olives-$(VERSION)
	cp -rf build/* release/tmp/Olives-$(VERSION)

	cd release/tmp/Olives-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' Olives.js Olives.min.js; \
	rm Olives.js.bak Olives.min.js.bak

	cd release/tmp/; \
	tar czf ../Olives-$(VERSION).tgz Olives-$(VERSION)

	rm -rf release/tmp/

	cp -rf docs/latest/ docs/$(VERSION)/

	git add build docs release

	git commit -am "released version $(VERSION)"

	git push

	git tag $(VERSION)

	git push --tags

gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages

	git checkout master build Makefile docs src specs tools lib release
	git add build docs src specs tools lib release

	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/Olives.*\.tgz">#<a href="release/Olives-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"

	git push

	git checkout master


.PHONY: docs clean-docs clean-build build tests release clean gh-pages jshint
