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
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(f,h){return f instanceof HTMLElement?(f.parentNode||document.createDocumentFragment().appendChild(f),f.parentNode.querySelectorAll(h||"*")):false}}});define("Olives/Event-plugin",function(){return function(f){this.listen=function(h,g,i,e){h.addEventListener(g,function(a){f[i].call(f,a,h)},e=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(f,h,g,i){return function(e,a){var c=null,d={};this.observers={};this.setModel=function(a){return a instanceof f?(c=a,true):false};this.getModel=function(){return c};this.ItemRenderer=function(a){var b=null;this.set=function(a){b=a;return true};this.get=function(){return b};this.associate=function(a,c){var k=b.cloneNode(true),d=i.getNodes(k);g.toArray(d).forEach(function(b){b.dataset[c+"_id"]=a});return k};this.set(a)};
this.foreach=function(a){var b,j=a.querySelector("*"),d=new this.ItemRenderer(j);b=document.createDocumentFragment();c.loop(function(a,c){b.appendChild(this.plugins.apply(d.associate(c,this.plugins.name)))},this);a.replaceChild(b,j);c.watch("added",function(b){a.insertBefore(this.plugins.apply(d.associate(b,this.plugins.name)),a.childNodes[b])},this);c.watch("deleted",function(b){a.removeChild(a.childNodes[b]);this.observers[b].forEach(function(b){c.unwatchValue(b)},this);delete this.observers[b]},
this)};this.bind=function(a,b,j){var j=j||"",d=a.dataset[this.plugins.name+"_id"],f=j.split("."),e=d||f.shift(),h=d?j:f.join(".");if((d=g.getNestedProperty(c.get(e),h))||d===0||d===false)this.execBinding(a,b,d)||(a[b]=d);this.hasBinding(b)||a.addEventListener("change",function(){if(h){var d=c.get(e);g.setNestedProperty(d,j,a[b]);c.set(e,d)}else c.set(e,a[b])},true);this.observers[e]=this.observers[e]||[];this.observers[e].push(c.watchValue(e,function(d){this.execBinding(a,b,g.getNestedProperty(d,
h))||(a[b]=g.getNestedProperty(d,h))},this))};this.set=function(a){return a instanceof HTMLElement&&a.name?(c.set(a.name,a.value),true):false};this.form=function b(b){if(b&&b.nodeName=="FORM"){var a=this;b.addEventListener("submit",function(d){g.toArray(b.querySelectorAll("[name]")).forEach(a.set,a);d.preventDefault()},true);return true}else return false};this.addBinding=function(b,a){return b&&typeof b=="string"&&typeof a=="function"?(d[b]=a,true):false};this.execBinding=function(b,a,c){return this.hasBinding(a)?
(d[a].call(b,c),true):false};this.hasBinding=function(b){return d.hasOwnProperty(b)};this.getBinding=function(b){return d[b]};this.addBindings=function(b){return g.loop(b,function(b,a){this.addBinding(a,b)},this)};this.setModel(e);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(f,h,g,i,e){return function(a){var c=function(b){b=b.UI;if(b.template)typeof b.template=="string"?b.dom.innerHTML=b.template:b.template instanceof HTMLElement&&b.dom.appendChild(b.template),b.plugins.apply(b.dom),b.onRender&&b.onRender();else throw Error("UI.template must be set prior to render");},d=function(b){var a=b.UI;if(b.params)e.toArray(a.dom.childNodes).forEach(function(a){b.params.appendChild(a)}),
a.dom=b.params;a.onPlace&&a.onPlace()},i=new f("Init",{Init:[["render",c,this,"Rendered"],["place",function(b){c(b);d(b)},this,"Rendered"]],Rendered:[["place",d,this],["render",c,this]]});this.model=a instanceof h?a:new h;this.plugins=new g;this.template=null;this.setTemplateFromDom=function(b){return b instanceof HTMLElement?(this.template=b.innerHTML,b.innerHTML="",true):false};this.dom=document.createElement("div");this.onRender=function(){};this.action=function(b,a){i.event(b,{UI:this,params:a})};
this.onPlace=function(){};this.alive=function(b){this.setTemplateFromDom(b);this.action("place",b)}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(f,h){return function(){var g={},i=function(a){return a.trim()},e=function(a,c,d){c.split(";").forEach(function(c){var b=c.split(":"),c=b[0].trim(),b=b[1]?b[1].split(",").map(i):[];b.unshift(a);g[d]&&g[d][c]&&g[d][c].apply(g[d],b)})};this.add=function(a,c){var d=this;return typeof a=="string"&&typeof c=="object"&&c?(g[a]=c,c.plugins={name:a,apply:function(){return d.apply.apply(d,arguments)}},true):false};this.addAll=function(a){return f.loop(a,
function(a,d){this.add(d,a)},this)};this.get=function(a){return g[a]};this.del=function(a){return delete g[a]};this.apply=function(a){var c;return a instanceof HTMLElement?(c=h.getNodes(a),f.loop(f.toArray(c),function(a){f.loop(a.dataset,function(c,b){e(a,c,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(f,h){return function(g){var i={};this.place=function(e,a){if(i[a]instanceof f)i[a].action("place",e);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(e,a){return typeof e=="string"&&a instanceof f?(i[e]=a,true):false};this.setAll=function(e){h.loop(e,function(a,c){this.set(c,a)},this)};this.get=function(e){return i[e]};this.setAll(g)}});
