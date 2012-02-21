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
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(f,h){return f instanceof HTMLElement?(f.parentNode||document.createDocumentFragment().appendChild(f),f.parentNode.querySelectorAll(h||"*")):false}}});define("Olives/Event-plugin",function(){return function(f){this.listen=function(h,d,g,i){h.addEventListener(d,function(a){f[g].call(f,a,h)},i=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(f,h,d,g){return function(i,a){var c=null,e={};this.observers={};this.setModel=function(a){return a instanceof f?(c=a,true):false};this.getModel=function(){return c};this.ItemRenderer=function(a){var b=null;this.set=function(a){b=a;return true};this.get=function(){return b};this.associate=function(a,c){var l=b.cloneNode(true),e=g.getNodes(l);d.toArray(e).forEach(function(b){b.dataset[c+"_id"]=a});return l};this.set(a)};
this.foreach=function(a){var b,e=a.querySelector("*"),d=new this.ItemRenderer(e);b=document.createDocumentFragment();c.loop(function(a,c){b.appendChild(this.plugins.apply(d.associate(c,this.plugins.name)))},this);a.replaceChild(b,e);c.watch("added",function(b){a.insertBefore(this.plugins.apply(d.associate(b,this.plugins.name)),a.childNodes[b])},this);c.watch("deleted",function(b){a.removeChild(a.childNodes[b]);this.observers[b].forEach(function(b){c.unwatchValue(b)},this);delete this.observers[b]},
this)};this.bind=function(a,b,j){var f=function(b,a,c){e.hasOwnProperty(a)?e[a].call(b,c):b[a]=c},j=j||"",i=a.dataset[this.plugins.name+"_id"],h=j.split("."),g=i||h.shift(),k=i?j:h.join(".");if((i=d.getNestedProperty(c.get(g),k))||i===0||i===false)f(a,b,i),!e[b]&&a.addEventListener("change",function(){if(k){var e=c.get(g);d.setNestedProperty(e,j,a[b]);c.set(g,e)}else c.set(g,a[b])},true);this.observers[g]=this.observers[g]||[];this.observers[g].push(c.watchValue(g,function(c){f(a,b,d.getNestedProperty(c,
k))}))};this.set=function(a){return a instanceof HTMLElement&&a.name?(c.set(a.name,a.value),true):false};this.form=function b(b){if(b&&b.nodeName=="FORM"){var a=this;b.addEventListener("submit",function(c){d.toArray(b.querySelectorAll("[name]")).forEach(a.set,a);c.preventDefault()},true);return true}else return false};this.addBinding=function(b,a){return b&&typeof b=="string"&&typeof a=="function"?(e[b]=a,true):false};this.getBinding=function(b){return e[b]};this.addBindings=function(b){return d.loop(b,
function(b,a){this.addBinding(a,b)},this)};this.setModel(i);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(f,h,d,g,i){return function(a){var c=function(b){b=b.UI;if(b.template)typeof b.template=="string"?b.dom.innerHTML=b.template:b.template instanceof HTMLElement&&b.dom.appendChild(b.template),b.plugins.apply(b.dom),b.onRender&&b.onRender();else throw Error("UI.template must be set prior to render");},e=function(b){var a=b.UI;if(b.params)i.toArray(a.dom.childNodes).forEach(function(a){b.params.appendChild(a)}),
a.dom=b.params;a.onPlace&&a.onPlace()},g=new f("Init",{Init:[["render",c,this,"Rendered"],["place",function(b){c(b);e(b)},this,"Rendered"]],Rendered:[["place",e,this],["render",c,this]]});this.model=a instanceof h?a:new h;this.plugins=new d;this.template=null;this.setTemplateFromDom=function(b){return b instanceof HTMLElement?(this.template=b.innerHTML,b.innerHTML="",true):false};this.dom=document.createElement("div");this.onRender=function(){};this.action=function(b,a){g.event(b,{UI:this,params:a})};
this.onPlace=function(){};this.alive=function(a){this.setTemplateFromDom(a);this.action("place",a)}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(f,h){return function(){var d={},g=function(a){return a.trim()},i=function(a,c,e){c.split(";").forEach(function(c){var b=c.split(":"),c=b[0].trim(),b=b[1]?b[1].split(",").map(g):[];b.unshift(a);d[e]&&d[e][c]&&d[e][c].apply(d[e],b)})};this.add=function(a,c){var e=this;return typeof a=="string"&&typeof c=="object"&&c?(d[a]=c,c.plugins={name:a,apply:function(){return e.apply.apply(e,arguments)}},true):false};this.addAll=function(a){return f.loop(a,
function(a,e){this.add(e,a)},this)};this.get=function(a){return d[a]};this.del=function(a){return delete d[a]};this.apply=function(a){var c;return a instanceof HTMLElement?(c=h.getNodes(a),f.loop(f.toArray(c),function(a){f.loop(a.dataset,function(c,b){i(a,c,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(f,h){return function(d){var g={};this.place=function(d,a){if(g[a]instanceof f)g[a].action("place",d);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(d,a){return typeof d=="string"&&a instanceof f?(g[d]=a,true):false};this.setAll=function(d){h.loop(d,function(a,c){this.set(c,a)},this)};this.get=function(d){return g[d]};this.setAll(d)}});
