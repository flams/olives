#!/bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

ME=`basename $0`

[ "$#" -eq 1 ] || die "you should provide a version number like: ./${ME} 1.1.2"

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

#update version in homepage
sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
rm index.html.bak

#update build files
git checkout master build

#generate Olives archive
cp -rf build Olives-${VERSION}
tar czf Olives.tgz Olives-${VERSION}
rm -rf Olives-${VERSION}