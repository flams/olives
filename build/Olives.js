function Olives(c){this.define=function(a,b,d){return c.declare("Olives."+a,typeof b=="string"?"Olives."+b:b,d)};this.create=function(a){return Object.create(c.require("Olives."+a))}}Olives=new Olives(Emily);Olives.define("Text","_base",function(){});
Olives.define("_base",function(c){this.model=c.require("TinyStore").create();this.template="";this.place=function(a){a.innerHTML=this.template;Array.prototype.forEach.call(a.querySelectorAll("*[data-bind]"),function(b){this.model.set(b.getAttribute("data-bind"),b.innerHTML);this.model.watch(b.getAttribute("data-bind"),function(a){b.innerHTML=a})},this);return this}});
