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
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(f,g){return f instanceof HTMLElement?(f.parentNode||document.createDocumentFragment().appendChild(f),f.parentNode.querySelectorAll(g||"*")):false}}});define("Olives/Event-plugin",function(){return function(f){this.listen=function(g,e,j,h){g.addEventListener(e,function(b){f[j].call(f,b,g)},h=="true")}}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(f,g,e,j){return function(h,b){var d=null,c={};this.observers={};this.setModel=function(b){return b instanceof f?(d=b,true):false};this.getModel=function(){return d};this.ItemRenderer=function(b,a){var i=null,k=null,c=null;this.setRenderer=function(a){i=a;return true};this.getRenderer=function(){return i};this.setRootNode=function(a){return a instanceof HTMLElement?(c=a,a=c.querySelector("*"),this.setRenderer(a),
c.removeChild(a),true):false};this.getRootNode=function(){return c};this.setPlugins=function(a){k=a;return true};this.getPlugins=function(){return k};this.items=new f([]);this.addItem=function(a){var b;return typeof a=="number"?(b=this.create(a))?(c.insertBefore(this.create(a),this.items.get(a+1)),true):false:false};this.removeItem=function(a){return this.items.has(a)?(c.removeChild(this.items.get(a)),this.items.del(a),true):false};this.create=function(a){if(d.has(a)){var b=i.cloneNode(true),c=j.getNodes(b);
e.toArray(c).forEach(function(b){b.dataset[k.name+"_id"]=a});this.items.set(a,b);k.apply(b);return b}};this.setPlugins(b);this.setRootNode(a)};this.foreach=function(b,a,i,c){for(var e=new this.ItemRenderer(this.plugins,b),i=i||0,c=c||d.getNbItems(),b=c+i;i<b;i++)e.addItem(i);d.watch("added",function(a){e.addItem(a)},this);d.watch("deleted",function(a){e.removeItem(a);this.observers[a].forEach(function(a){d.unwatchValue(a)},this);delete this.observers[a]},this)};this.bind=function(b,a,i){var i=i||
"",c=b.dataset[this.plugins.name+"_id"],f=i.split("."),h=c||f.shift(),g=c?i:f.join(".");if((c=e.getNestedProperty(d.get(h),g))||c===0||c===false)this.execBinding(b,a,c)||(b[a]=c);this.hasBinding(a)||b.addEventListener("change",function(){if(g){var c=d.get(h);e.setNestedProperty(c,i,b[a]);d.set(h,c)}else d.set(h,b[a])},true);this.observers[h]=this.observers[h]||[];this.observers[h].push(d.watchValue(h,function(c){this.execBinding(b,a,e.getNestedProperty(c,g))||(b[a]=e.getNestedProperty(c,g))},this))};
this.set=function(b){return b instanceof HTMLElement&&b.name?(d.set(b.name,b.value),true):false};this.form=function a(a){if(a&&a.nodeName=="FORM"){var b=this;a.addEventListener("submit",function(c){e.toArray(a.querySelectorAll("[name]")).forEach(b.set,b);c.preventDefault()},true);return true}else return false};this.addBinding=function(a,b){return a&&typeof a=="string"&&typeof b=="function"?(c[a]=b,true):false};this.execBinding=function(a,b,d){return this.hasBinding(b)?(c[b].call(a,d),true):false};
this.hasBinding=function(a){return c.hasOwnProperty(a)};this.getBinding=function(a){return c[a]};this.addBindings=function(a){return e.loop(a,function(a,b){this.addBinding(b,a)},this)};this.setModel(h);this.addBindings(b)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(f,g,e,j,h){return function(b){var d=function(a){a=a.UI;if(a.template)typeof a.template=="string"?a.dom.innerHTML=a.template:a.template instanceof HTMLElement&&a.dom.appendChild(a.template),a.plugins.apply(a.dom),a.onRender&&a.onRender();else throw Error("UI.template must be set prior to render");},c=function(a){var b=a.UI;if(a.params)h.toArray(b.dom.childNodes).forEach(function(b){a.params.appendChild(b)}),
b.dom=a.params;b.onPlace&&b.onPlace()},j=new f("Init",{Init:[["render",d,this,"Rendered"],["place",function(a){d(a);c(a)},this,"Rendered"]],Rendered:[["place",c,this],["render",d,this]]});this.model=b instanceof g?b:new g;this.plugins=new e;this.template=null;this.setTemplateFromDom=function(a){return a instanceof HTMLElement?(this.template=a.innerHTML,a.innerHTML="",true):false};this.dom=document.createElement("div");this.onRender=function(){};this.action=function(a,b){j.event(a,{UI:this,params:b})};
this.onPlace=function(){};this.alive=function(a){this.setTemplateFromDom(a);this.action("place",a)}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(f,g){return function(){var e={},j=function(b){return b.trim()},h=function(b,d,c){d.split(";").forEach(function(d){var a=d.split(":"),d=a[0].trim(),a=a[1]?a[1].split(",").map(j):[];a.unshift(b);e[c]&&e[c][d]&&e[c][d].apply(e[c],a)})};this.add=function(b,d){var c=this;return typeof b=="string"&&typeof d=="object"&&d?(e[b]=d,d.plugins={name:b,apply:function(){return c.apply.apply(c,arguments)}},true):false};this.addAll=function(b){return f.loop(b,
function(b,c){this.add(c,b)},this)};this.get=function(b){return e[b]};this.del=function(b){return delete e[b]};this.apply=function(b){var d;return b instanceof HTMLElement?(d=g.getNodes(b),f.loop(f.toArray(d),function(b){f.loop(b.dataset,function(d,a){h(b,d,a)})}),b):false}}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(f,g){return function(e){var j={};this.place=function(e,b){if(j[b]instanceof f)j[b].action("place",e);else throw Error(b+" is not an OObject UI in place:"+b);};this.set=function(e,b){return typeof e=="string"&&b instanceof f?(j[e]=b,true):false};this.setAll=function(e){g.loop(e,function(b,d){this.set(d,b)},this)};this.get=function(e){return j[e]};this.setAll(e)}});
