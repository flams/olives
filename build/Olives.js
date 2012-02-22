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
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(f,h,g,i){return function(e,a){var d=null,c={};this.observers={};this.setModel=function(a){return a instanceof f?(d=a,true):false};this.getModel=function(){return d};this.ItemRenderer=function(a,b){var j=null,k=null,c=null;this.setRenderer=function(b){j=b;return true};this.getRenderer=function(){return j};this.setRootNode=function(b){return b instanceof HTMLElement?(c=b,b=c.querySelector("*"),this.setRenderer(b),
c.removeChild(b),true):false};this.getRootNode=function(){return c};this.setPlugins=function(b){k=b;return true};this.getPlugins=function(){return k};this.items=new f([]);this.addItem=function(b){return typeof b=="number"?(c.insertBefore(this.create(b),this.items.get(b+1)),true):false};this.removeItem=function(b){return this.items.has(b)?(c.removeChild(this.items.get(b)),true):false};this.create=function(b){if(d.has(b)){var a=j.cloneNode(true),l=i.getNodes(a);g.toArray(l).forEach(function(a){a.dataset[k.name+
"_id"]=b});this.items.set(b,a);k.apply(a);return a}};this.setPlugins(a);this.setRootNode(b)};this.foreach=function(a){for(var b=new this.ItemRenderer(this.plugins,a),a=0,j=d.getNbItems();a<j;a++)b.addItem(a);d.watch("added",function(a){b.addItem(a)},this);d.watch("deleted",function(a){b.removeItem(a);this.observers[a].forEach(function(b){d.unwatchValue(b)},this);delete this.observers[a]},this)};this.bind=function(a,b,j){var j=j||"",c=a.dataset[this.plugins.name+"_id"],f=j.split("."),e=c||f.shift(),
h=c?j:f.join(".");if((c=g.getNestedProperty(d.get(e),h))||c===0||c===false)this.execBinding(a,b,c)||(a[b]=c);this.hasBinding(b)||a.addEventListener("change",function(){if(h){var c=d.get(e);g.setNestedProperty(c,j,a[b]);d.set(e,c)}else d.set(e,a[b])},true);this.observers[e]=this.observers[e]||[];this.observers[e].push(d.watchValue(e,function(c){this.execBinding(a,b,g.getNestedProperty(c,h))||(a[b]=g.getNestedProperty(c,h))},this))};this.set=function(a){return a instanceof HTMLElement&&a.name?(d.set(a.name,
a.value),true):false};this.form=function b(b){if(b&&b.nodeName=="FORM"){var a=this;b.addEventListener("submit",function(c){g.toArray(b.querySelectorAll("[name]")).forEach(a.set,a);c.preventDefault()},true);return true}else return false};this.addBinding=function(b,a){return b&&typeof b=="string"&&typeof a=="function"?(c[b]=a,true):false};this.execBinding=function(b,a,d){return this.hasBinding(a)?(c[a].call(b,d),true):false};this.hasBinding=function(b){return c.hasOwnProperty(b)};this.getBinding=function(b){return c[b]};
this.addBindings=function(b){return g.loop(b,function(b,a){this.addBinding(a,b)},this)};this.setModel(e);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(f,h,g,i,e){return function(a){var d=function(b){b=b.UI;if(b.template)typeof b.template=="string"?b.dom.innerHTML=b.template:b.template instanceof HTMLElement&&b.dom.appendChild(b.template),b.plugins.apply(b.dom),b.onRender&&b.onRender();else throw Error("UI.template must be set prior to render");},c=function(b){var a=b.UI;if(b.params)e.toArray(a.dom.childNodes).forEach(function(a){b.params.appendChild(a)}),
a.dom=b.params;a.onPlace&&a.onPlace()},i=new f("Init",{Init:[["render",d,this,"Rendered"],["place",function(b){d(b);c(b)},this,"Rendered"]],Rendered:[["place",c,this],["render",d,this]]});this.model=a instanceof h?a:new h;this.plugins=new g;this.template=null;this.setTemplateFromDom=function(b){return b instanceof HTMLElement?(this.template=b.innerHTML,b.innerHTML="",true):false};this.dom=document.createElement("div");this.onRender=function(){};this.action=function(b,a){i.event(b,{UI:this,params:a})};
this.onPlace=function(){};this.alive=function(b){this.setTemplateFromDom(b);this.action("place",b)}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(f,h){return function(){var g={},i=function(a){return a.trim()},e=function(a,d,c){d.split(";").forEach(function(d){var b=d.split(":"),d=b[0].trim(),b=b[1]?b[1].split(",").map(i):[];b.unshift(a);g[c]&&g[c][d]&&g[c][d].apply(g[c],b)})};this.add=function(a,d){var c=this;return typeof a=="string"&&typeof d=="object"&&d?(g[a]=d,d.plugins={name:a,apply:function(){return c.apply.apply(c,arguments)}},true):false};this.addAll=function(a){return f.loop(a,
function(a,c){this.add(c,a)},this)};this.get=function(a){return g[a]};this.del=function(a){return delete g[a]};this.apply=function(a){var d;return a instanceof HTMLElement?(d=h.getNodes(a),f.loop(f.toArray(d),function(a){f.loop(a.dataset,function(d,b){e(a,d,b)})}),a):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(f,h){return function(g){var i={};this.place=function(e,a){if(i[a]instanceof f)i[a].action("place",e);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(e,a){return typeof e=="string"&&a instanceof f?(i[e]=a,true):false};this.setAll=function(e){h.loop(e,function(a,d){this.set(d,a)},this)};this.get=function(e){return i[e]};this.setAll(g)}});
