/*
 Olives

 The MIT License (MIT)

 Copyright (c) 2012 Olivier Scherrer - Olivier Wietrich

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
 and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial 
 portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 IN THE SOFTWARE.
*/
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(c,f){return c instanceof HTMLElement?(c.parentNode||document.createDocumentFragment().appendChild(c),c.parentNode.querySelectorAll(f||"*")):false}}});define("Olives/Event-plugin",function(){return function(c){this.listen=function(f,e,g,i){f.addEventListener(e,function(a){c[g].call(c,a,f)},i=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(c,f,e,g){return function(i,a){var d=null,h={};this.observers={};this.setModel=function(a){return a instanceof c?(d=a,true):false};this.getModel=function(){return d};this.ItemRenderer=function(a){var b=null;this.set=function(a){b=a;return true};this.get=function(){return b};this.associate=function(a,d){var k=b.cloneNode(true),h=g.getNodes(k);e.toArray(h).forEach(function(b){b.dataset[d+"_id"]=a});return k};this.set(a)};
this.foreach=function(a){var b,h=a.querySelector("*"),e=new this.ItemRenderer(h);b=document.createDocumentFragment();d.loop(function(a,d){b.appendChild(this.plugins.apply(e.associate(d,this.plugins.name)))},this);a.replaceChild(b,h);d.watch("added",function(b){a.insertBefore(this.plugins.apply(e.associate(b,this.plugins.name)),a.childNodes[b])},this);d.watch("deleted",function(b){a.removeChild(a.childNodes[b]);this.observers[b].forEach(function(b){d.unwatchValue(b)},this);delete this.observers[b]},
this)};this.bind=function(a,b,j){var j=j||"",c=a.dataset[this.plugins.name+"_id"],i=j.split("."),f=c||i.shift(),g=c?j:i.join(".");if((c=e.getNestedProperty(d.get(f),g))||c===0||c===false)h[b]?h[b].call(a,c):(a[b]=c,a.addEventListener("change",function(){if(g){var c=d.get(f);e.setNestedProperty(c,j,a[b]);d.set(f,c)}else d.set(f,a[b])},true));this.observers[f]=this.observers[f]||[];this.observers[f].push(d.watchValue(f,function(d){h[b]?h[b].call(a,e.getNestedProperty(d,g)):a[b]=e.getNestedProperty(d,
g)}))};this.set=function(a){return a instanceof HTMLElement&&a.name?(d.set(a.name,a.value),true):false};this.form=function b(b){if(b&&b.nodeName=="FORM"){var a=this;b.addEventListener("submit",function(d){e.toArray(b.querySelectorAll("[name]")).forEach(a.set,a);d.preventDefault()},true);return true}else return false};this.addBinding=function(b,a){return b&&typeof b=="string"&&typeof a=="function"?(h[b]=a,true):false};this.getBinding=function(b){return h[b]};this.addBindings=function(b){return e.loop(b,
function(b,a){this.addBinding(a,b)},this)};this.setModel(i);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(c,f,e,g,i){return function(a){var d=function(b){b=b.UI;if(b.template)typeof b.template=="string"?b.dom.innerHTML=b.template:b.template instanceof HTMLElement&&b.dom.appendChild(b.template),b.plugins.apply(b.dom),b.onRender&&b.onRender();else throw Error("UI.template must be set prior to render");},h=function(b){var a=b.UI;if(b.params)i.toArray(a.dom.childNodes).forEach(function(a){b.params.appendChild(a)}),
a.dom=b.params;a.onPlace&&a.onPlace()},g=new c("Init",{Init:[["render",d,this,"Rendered"],["place",function(b){d(b);h(b)},this,"Rendered"]],Rendered:[["place",h,this],["render",d,this]]});this.model=a instanceof f?a:new f;this.plugins=new e;this.template=null;this.setTemplateFromDom=function(b){return b instanceof HTMLElement?(this.template=b.innerHTML,b.innerHTML="",true):false};this.dom=document.createElement("div");this.onRender=function(){};this.action=function(b,a){g.event(b,{UI:this,params:a})};
this.onPlace=function(){};this.alive=function(b){this.setTemplateFromDom(b);this.action("place",b)}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(c,f){return function(){var e={},g=function(a){return a.trim()},i=function(a,d,c){d.split(";").forEach(function(d){var b=d.split(":"),d=b[0].trim(),b=b[1]?b[1].split(",").map(g):[];b.unshift(a);e[c]&&e[c][d]&&e[c][d].apply(e[c],b)})};this.add=function(a,d){var c=this;return typeof a=="string"&&typeof d=="object"&&d?(e[a]=d,d.plugins={name:a,apply:function(){return c.apply.apply(c,arguments)}},true):false};this.addAll=function(a){return c.loop(a,
function(a,c){this.add(c,a)},this)};this.get=function(a){return e[a]};this.del=function(a){return delete e[a]};this.apply=function(a){var d;return a instanceof HTMLElement?(d=f.getNodes(a),c.loop(c.toArray(d),function(a){c.loop(a.dataset,function(d,b){i(a,d,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(c,f){return function(e){var g={};this.place=function(e,a){if(g[a]instanceof c)g[a].action("place",e);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(e,a){return typeof e=="string"&&a instanceof c?(g[e]=a,true):false};this.setAll=function(c){f.loop(c,function(a,d){this.set(d,a)},this)};this.get=function(c){return g[c]};this.setAll(e)}});
