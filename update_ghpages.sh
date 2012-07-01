#!/bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

ME=`basename $0`

[ "$#" -eq 1 ] || die "you should provide a version number like: ./${ME} 1.1.2"

VERSION=$1

echo "updating generated documentation..."
git checkout master docs

echo "updating specs files for unit tests..."
git checkout master specs

echo "updating test runner..."
git checkout master tools/Jasmine
git checkout master tests.html

echo "updating libs..."
git checkout master lib

echo "updating the homepage with the version number..."
sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
sed -i .bak 's#<a href="Olives.*\.tgz">#<a href="Olives-'${VERSION}'.tgz">#' index.html
rm index.html.bak

echo "updating the built files..."
git checkout master build

echo "updating license..."
sed -i .bak 's#${VERSION}#'${VERSION}'#' build/Olives.js
rm build/Olives.js.bak

echo "removing old archive..."
rm Olives-*.tgz

echo "generating new Olives archive..."
cp -rf build Olives-${VERSION}
tar czf Olives-${VERSION}.tgz Olives-${VERSION}
rm -rf Olives-${VERSION}
git add Olives-${VERSION}.tgz