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
define("Olives/DomUtils",["Tools"],function(){return{getNodes:function(f,j){return f instanceof HTMLElement?(f.parentNode||document.createDocumentFragment().appendChild(f),f.parentNode.querySelectorAll(j||"*")):false}}});define("Olives/Event-plugin",function(){return function(f){this.listen=function(j,g,h,e){j.addEventListener(g,function(a){f[h].call(f,a,j)},e=="true")}}});
define("Olives/LocalStore",["Store","Tools"],function(f,j){function g(){var g=null,e=function(){localStorage.setItem(g,this.toJSON())};this.sync=function(a){return typeof a=="string"?(g=a,a=JSON.parse(localStorage.getItem(a)),j.loop(a,function(c,a){this.has(a)||this.set(a,c)},this),e.call(this),true):false};this.watch("added",e,this);this.watch("updated",e,this);this.watch("deleted",e,this)}return function(h){g.prototype=new f(h);return new g}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(f,j,g,h){return function(e,a){var c=null,d={},i={};this.observers={};this.setModel=function(b){return b instanceof f?(c=b,true):false};this.getModel=function(){return c};this.ItemRenderer=function(b,a){var d=null,e=null,i=null,l=null,j=null;this.setRenderer=function(b){d=b;return true};this.getRenderer=function(){return d};this.setRootNode=function(b){return b instanceof HTMLElement?(i=b,b=i.querySelector("*"),
this.setRenderer(b),b&&i.removeChild(b),true):false};this.getRootNode=function(){return i};this.setPlugins=function(b){e=b;return true};this.getPlugins=function(){return e};this.items=new f([]);this.setStart=function(b){return l=parseInt(b,10)};this.getStart=function(){return l};this.setNb=function(b){return j=b=="*"?b:parseInt(b,10)};this.getNb=function(){return j};this.addItem=function(b){var a;return typeof b=="number"&&!this.items.get(b)?(a=this.create(b))?(i.insertBefore(a,this.getNextItem(b)),
true):false:false};this.getNextItem=function(b){return this.items.alter("slice",b+1).filter(function(b){if(b instanceof HTMLElement)return true})[0]};this.removeItem=function(b){var a=this.items.get(b);return a?(i.removeChild(a),this.items.set(b),true):false};this.create=function(b){if(c.has(b)){var a=d.cloneNode(true),k=h.getNodes(a);g.toArray(k).forEach(function(a){a.dataset[e.name+"_id"]=b});this.items.set(b,a);e.apply(a);return a}};this.render=function(){var b=j=="*"?c.getNbItems():j,a=[];if(j!==
null&&l!==null){this.items.loop(function(k,d){(d<l||d>=l+b||!c.has(d))&&a.push(d)},this);a.sort().reverse().forEach(this.removeItem,this);for(var k=l,d=b+l;k<d;k++)this.addItem(k);return true}else return false};this.setPlugins(b);this.setRootNode(a)};this.setItemRenderer=function(b,a){i[b||"default"]=a};this.getItemRenderer=function(b){return i[b]};this.foreach=function(b,a,d,e){var i=new this.ItemRenderer(this.plugins,b);i.setStart(d||0);i.setNb(e||"*");i.render();c.watch("added",i.render,i);c.watch("deleted",
function(b){i.render();this.observers[b]&&this.observers[b].forEach(function(b){c.unwatchValue(b)},this);delete this.observers[b]},this);this.setItemRenderer(a,i)};this.updateStart=function(b,a){var c=this.getItemRenderer(b);return c?(c.setStart(a),true):false};this.updateNb=function(b,a){var c=this.getItemRenderer(b);return c?(c.setNb(a),true):false};this.refresh=function(b){return(b=this.getItemRenderer(b))?(b.render(),true):false};this.bind=function(b,a,d){var d=d||"",i=b.dataset[this.plugins.name+
"_id"],e=d.split("."),f=i||e.shift(),h=i?d:e.join("."),i=g.getNestedProperty(c.get(f),h),j=g.toArray(arguments).slice(3);if(i||i===0||i===false)this.execBinding.apply(this,[b,a,i].concat(j))||(b[a]=i);this.hasBinding(a)||b.addEventListener("change",function(){if(h){var i=c.get(f);g.setNestedProperty(i,d,b[a]);c.set(f,i)}else c.set(f,b[a])},true);this.observers[f]=this.observers[f]||[];this.observers[f].push(c.watchValue(f,function(c){this.execBinding.apply(this,[b,a,g.getNestedProperty(c,h)].concat(j))||
(b[a]=g.getNestedProperty(c,h))},this))};this.set=function(b){return b instanceof HTMLElement&&b.name?(c.set(b.name,b.value),true):false};this.form=function k(k){if(k&&k.nodeName=="FORM"){var a=this;k.addEventListener("submit",function(c){g.toArray(k.querySelectorAll("[name]")).forEach(a.set,a);c.preventDefault()},true);return true}else return false};this.addBinding=function(a,c){return a&&typeof a=="string"&&typeof c=="function"?(d[a]=c,true):false};this.execBinding=function(a,c){return this.hasBinding(c)?
(d[c].apply(a,Array.prototype.slice.call(arguments,2)),true):false};this.hasBinding=function(a){return d.hasOwnProperty(a)};this.getBinding=function(a){return d[a]};this.addBindings=function(a){return g.loop(a,function(a,c){this.addBinding(c,a)},this)};this.setModel(e);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(f,j,g){return function(h){var e=function(a){var b=c||document.createElement("div");if(a.template){typeof a.template=="string"?b.innerHTML=a.template.trim():a.template instanceof HTMLElement&&b.appendChild(a.template);if(b.childNodes.length>1)throw Error("UI.template should have only one parent node");else a.dom=b.childNodes[0];a.alive(a.dom)}else throw Error("UI.template must be set prior to render");
},a=function b(a,b){b&&(b.appendChild(a.dom),c=b)},c=null,d=new f("Init",{Init:[["render",e,this,"Rendered"],["place",function(b,c){e(b);a(b,c)},this,"Rendered"]],Rendered:[["place",a,this],["render",e,this]]});this.model=h instanceof j?h:new j;this.plugins=new g;this.dom=this.template=null;this.place=function(a){d.event("place",this,a)};this.render=function(){d.event("render",this)};this.alive=function(a){return a instanceof HTMLElement?(this.plugins.apply(a),true):false}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(f,j){return function(){var g={},h=function(a){return a.trim()},e=function(a,c,d){c.split(";").forEach(function(c){var b=c.split(":"),c=b[0].trim(),b=b[1]?b[1].split(",").map(h):[];b.unshift(a);g[d]&&g[d][c]&&g[d][c].apply(g[d],b)})};this.add=function(a,c){var d=this;return typeof a=="string"&&typeof c=="object"&&c?(g[a]=c,c.plugins={name:a,apply:function(){return d.apply.apply(d,arguments)}},true):false};this.addAll=function(a){return f.loop(a,
function(a,d){this.add(d,a)},this)};this.get=function(a){return g[a]};this.del=function(a){return delete g[a]};this.apply=function(a){var c;return a instanceof HTMLElement?(c=j.getNodes(a),f.loop(f.toArray(c),function(a){f.loop(a.dataset,function(c,b){e(a,c,b)})}),a):false}}});
define("Olives/Transport",["Observable"],function(f){return function(j,g){var h=null,e=null,a=new f;this.setIO=function(a){return a&&typeof a.connect=="function"?(e=a,true):false};this.getIO=function(){return e};this.connect=function(a){return typeof a=="string"?(h=e.connect(a),true):false};this.getSocket=function(){return h};this.on=function(a,d){h.on(a,d)};this.once=function(a,d){h.once(a,d)};this.emit=function(a,d,e){h.emit(a,d,e)};this.request=function(a,d,e,b){var f=Date.now()+Math.floor(Math.random()*
1E6),g=function(){e&&e.apply(b||null,arguments)};h[d.keptAlive?"on":"once"](f,g);d.__eventId__=f;h.emit(a,d);if(d.keptAlive)return function(){h.removeListener(f,g)}};this.listen=function(c,d,e,b){var f=c+"/"+d,g,h;a.hasTopic(f)||(h=this.request(c,{path:d,method:"GET",keptAlive:true},function(b){a.notify(f,b)},this));g=a.watch(f,e,b);return{stop:function(){a.unwatch(g);a.hasTopic(f)||h()}}};this.getListenObservable=function(){return a};this.setIO(j);this.connect(g)}});
define("Olives/Type-plugin",["Olives/OObject","Tools"],function(f,j){return function(g){var h={};this.place=function(e,a){if(h[a]instanceof f)h[a].place(e);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(e,a){return typeof e=="string"&&a instanceof f?(h[e]=a,true):false};this.setAll=function(e){j.loop(e,function(a,c){this.set(c,a)},this)};this.get=function(e){return h[e]};this.setAll(g)}});
