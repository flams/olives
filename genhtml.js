/**
 * @license Emily http://flams.github.com/emily
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2012-2013 Olivier Scherrer <pode.fr@gmail.com>
 */

// Showdown for concerting markup
var showdown = require("showdown"),

// Jsdom for manipulating the output html
jsdom = require("jsdom"),

// fs for reading/writing files
fs = require("fs");


// create the .md -> .html converter
var converter = new showdown.converter,

// read readme fiel
readme = fs.readFileSync("README.md") +'',

// read index.html
index = fs.readFileSync("index.html") + '',

// convert to html
output = converter.makeHtml(readme);



function Helpers(window) {

	var document = window.document;

	this.getDom = function getDom(query) {
		return document.querySelectorAll(query);
	};

	this.replaceContent = function replaceContent(content) {
		this.getDom("#replaceContent")[0].innerHTML = content;
	};

	this.addLinkToTop = function addLinkToTop(addTo) {
		addTo.innerHTML += '<a href="#top">top</a>';
		return addTo;
	};

	this.generateMenu = function generateMenu() {
		var modules = this.getDom("h2, h3"),
			menu = this.getDom(".menu")[0],
			generatedMenu = '<ul><li><a href="release/Emily-1.3.5.tgz">Download Emily</a></li>';

		[].slice.call(modules, 0).forEach(function (title) {
			generatedMenu += '<li class="' + title.nodeName +  '"><a href="#' + title.id + '">' + title.innerHTML + '</a></li>\n';
			this.addLinkToTop(title);
		}, this);

		generatedMenu += '</ul>\n';

		generatedMenu += '<ul>\n \
			<li><a href="tests.html" target="_blank">Test your browser</a></li>\n \
			<li><a href="docs/latest/index.html" target="_blank">JsDoc</a></li>\n \
		 </ul>\n';

		menu.innerHTML = generatedMenu;
	}
}


jsdom.env(index, [], function (errors, window) {
	var helpers = new Helpers(window);

	helpers.replaceContent(output);
	helpers.generateMenu();

	fs.writeFileSync("index.html", "<!doctype html>\n" + window.document.innerHTML);
});



