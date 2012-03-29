#!/bin/bash

VERSION=$1

#update generated documentation
git checkout master docs

#update specs files
git checkout master specs

#update tests
git checkout master tools/Jasmine
git checkout master tests.html

#update libs
git checkout master lib

#update build files
git checkout master build

#generate Olives archive
cp -rf build Olives-${VERSION}
tar czf Olives.tgz Olives-${VERSION}
rm -rf Olives-${VERSION}