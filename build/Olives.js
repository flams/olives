/*
 Olives

 The MIT License (MIT)

 Copyright(c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>

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
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(c,g){return c instanceof HTMLElement?(c.parentNode||document.createDocumentFragment().appendChild(c),c.parentNode.querySelectorAll(g||"*")):false}}});define("Olives/Event-plugin",function(){return function(c){this.listen=function(g,e,f,j){g.addEventListener(e,function(a){c[f].call(c,a,g)},j=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(c,g,e,f){return function(j,a){var h=null,d={};this.observers={};this.setModel=function(i){return i instanceof c?(h=i,true):false};this.getModel=function(){return h};this.ItemRenderer=function(i,b){var a=null,k=null,d=null;this.setRenderer=function(b){a=b;return true};this.getRenderer=function(){return a};this.setRootNode=function(b){return b instanceof HTMLElement?(d=b,b=d.querySelector("*"),this.setRenderer(b),
d.removeChild(b),true):false};this.getRootNode=function(){return d};this.setPlugins=function(b){k=b;return true};this.getPlugins=function(){return k};this.items=new c([]);this.addItem=function(b){var a;return typeof b=="number"?(a=this.create(b))?(d.insertBefore(this.create(b),this.items.get(b+1)),true):false:false};this.removeItem=function(b){return this.items.has(b)?(d.removeChild(this.items.get(b)),this.items.del(b),true):false};this.create=function(b){if(h.has(b)){var i=a.cloneNode(true),d=f.getNodes(i);
e.toArray(d).forEach(function(i){i.dataset[k.name+"_id"]=b});this.items.set(b,i);k.apply(i);return i}};this.setPlugins(i);this.setRootNode(b)};this.foreach=function(i,b,a,d){for(var e=new this.ItemRenderer(this.plugins,i),a=a||0,d=d||h.getNbItems(),i=d+a;a<i;a++)e.addItem(a);h.watch("added",function(b){e.addItem(b)},this);h.watch("deleted",function(b){e.removeItem(b);this.observers[b].forEach(function(b){h.unwatchValue(b)},this);delete this.observers[b]},this)};this.bind=function(a,b,d){var d=d||
"",c=a.dataset[this.plugins.name+"_id"],j=d.split("."),f=c||j.shift(),g=c?d:j.join(".");if((c=e.getNestedProperty(h.get(f),g))||c===0||c===false)this.execBinding(a,b,c)||(a[b]=c);this.hasBinding(b)||a.addEventListener("change",function(){if(g){var c=h.get(f);e.setNestedProperty(c,d,a[b]);h.set(f,c)}else h.set(f,a[b])},true);this.observers[f]=this.observers[f]||[];this.observers[f].push(h.watchValue(f,function(d){this.execBinding(a,b,e.getNestedProperty(d,g))||(a[b]=e.getNestedProperty(d,g))},this))};
this.set=function(a){return a instanceof HTMLElement&&a.name?(h.set(a.name,a.value),true):false};this.form=function b(b){if(b&&b.nodeName=="FORM"){var a=this;b.addEventListener("submit",function(d){e.toArray(b.querySelectorAll("[name]")).forEach(a.set,a);d.preventDefault()},true);return true}else return false};this.addBinding=function(b,a){return b&&typeof b=="string"&&typeof a=="function"?(d[b]=a,true):false};this.execBinding=function(b,a,c){return this.hasBinding(a)?(d[a].call(b,c),true):false};
this.hasBinding=function(b){return d.hasOwnProperty(b)};this.getBinding=function(b){return d[b]};this.addBindings=function(b){return e.loop(b,function(b,a){this.addBinding(a,b)},this)};this.setModel(j);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(c,g,e){return function(f){var j=function(a){var b=h||document.createElement("div");if(a.template){typeof a.template=="string"?b.innerHTML=a.template.trim():a.template instanceof HTMLElement&&b.appendChild(a.template);if(b.childNodes.length>1)throw Error("UI.template should have only one parent node");else a.dom=b.childNodes[0];a.alive(a.dom)}else throw Error("UI.template must be set prior to render");
},a=function b(a,b){b&&(b.appendChild(a.dom),h=b)},h=null,d=new c("Init",{Init:[["render",j,this,"Rendered"],["place",function(b,d){j(b);a(b,d)},this,"Rendered"]],Rendered:[["place",a,this],["render",j,this]]});this.model=f instanceof g?f:new g;this.plugins=new e;this.dom=this.template=null;this.place=function(b){d.event("place",this,b)};this.render=function(){d.event("render",this)};this.alive=function(b){return b instanceof HTMLElement?(this.plugins.apply(b),true):false}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(c,g){return function(){var e={},f=function(a){return a.trim()},j=function(a,c,d){c.split(";").forEach(function(c){var b=c.split(":"),c=b[0].trim(),b=b[1]?b[1].split(",").map(f):[];b.unshift(a);e[d]&&e[d][c]&&e[d][c].apply(e[d],b)})};this.add=function(a,c){var d=this;return typeof a=="string"&&typeof c=="object"&&c?(e[a]=c,c.plugins={name:a,apply:function(){return d.apply.apply(d,arguments)}},true):false};this.addAll=function(a){return c.loop(a,
function(a,d){this.add(d,a)},this)};this.get=function(a){return e[a]};this.del=function(a){return delete e[a]};this.apply=function(a){var e;return a instanceof HTMLElement?(e=g.getNodes(a),c.loop(c.toArray(e),function(a){c.loop(a.dataset,function(c,b){j(a,c,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(c,g){return function(e){var f={};this.place=function(e,a){if(f[a]instanceof c)f[a].place(e);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(e,a){return typeof e=="string"&&a instanceof c?(f[e]=a,true):false};this.setAll=function(c){g.loop(c,function(a,c){this.set(c,a)},this)};this.get=function(c){return f[c]};this.setAll(e)}});
