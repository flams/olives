/*
 Olives http://flams.github.com/olives
 The MIT License (MIT)
 Copyright (c) 2012 Olivier Scherrer <pode.fr@gmail.com> - Olivier Wietrich <olivier.wietrich@gmail.com>
*/
define("Olives/DomUtils",function(){return{getNodes:function(e,g){return this.isAcceptedType(e)?(e.parentNode||document.createDocumentFragment().appendChild(e),e.parentNode.querySelectorAll(g||"*")):false},getDataset:function(e){var g=0,i,j={},d,a;if(this.isAcceptedType(e))if(e.hasOwnProperty("dataset"))return e.dataset;else{for(i=e.attributes.length;g<i;g++)d=e.attributes[g].name.split("-"),d.shift()=="data"&&(j[a=d.join("-")]=e.getAttribute("data-"+a));return j}else return false},isAcceptedType:function(e){return e instanceof
HTMLElement||e instanceof SVGElement?true:false}}});define("Olives/Event-plugin",function(){return function(e){this.listen=function(g,i,j,d){g.addEventListener(i,function(a){e[j].call(e,a,g)},d=="true")}}});
define("Olives/LocalStore",["Store","Tools"],function(e,g){function i(){var e=null,d=localStorage,a=function(){d.setItem(e,this.toJSON())};this.setLocalStorage=function(c){return c&&c.setItem instanceof Function?(d=c,true):false};this.getLocalStorage=function(){return d};this.sync=function(c){return typeof c=="string"?(e=c,c=JSON.parse(d.getItem(c)),g.loop(c,function(c,a){this.has(a)||this.set(a,c)},this),a.call(this),this.watch("added",a,this),this.watch("updated",a,this),this.watch("deleted",a,
this),true):false}}return function(j){i.prototype=new e(j);return new i}});
define("Olives/Model-plugin",["Store","Observable","Tools","Olives/DomUtils"],function(e,g,i,j){return function(d,a){var c=null,f={},k={};this.observers={};this.setModel=function(l){return l instanceof e?(c=l,true):false};this.getModel=function(){return c};this.ItemRenderer=function(l,a){var b=null,f=null,d=null,k=null,g=null;this.setRenderer=function(a){b=a;return true};this.getRenderer=function(){return b};this.setRootNode=function(b){return j.isAcceptedType(b)?(d=b,b=d.querySelector("*"),this.setRenderer(b),
b&&d.removeChild(b),true):false};this.getRootNode=function(){return d};this.setPlugins=function(b){f=b;return true};this.getPlugins=function(){return f};this.items=new e([]);this.setStart=function(b){return k=parseInt(b,10)};this.getStart=function(){return k};this.setNb=function(b){return g=b=="*"?b:parseInt(b,10)};this.getNb=function(){return g};this.addItem=function(b){var a;return typeof b=="number"&&!this.items.get(b)?(a=this.create(b))?((b=this.getNextItem(b))?d.insertBefore(a,b):d.appendChild(a),
true):false:false};this.getNextItem=function(b){return this.items.alter("slice",b+1).filter(function(b){if(j.isAcceptedType(b))return true})[0]};this.removeItem=function(b){var a=this.items.get(b);return a?(d.removeChild(a),this.items.set(b),true):false};this.create=function(a){if(c.has(a)){var l=b.cloneNode(true),h=j.getNodes(l);i.toArray(h).forEach(function(b){b.setAttribute("data-"+f.name+"_id",a)});this.items.set(a,l);f.apply(l);return l}};this.render=function(){var b=g=="*"?c.getNbItems():g,
a=[];if(g!==null&&k!==null){this.items.loop(function(l,h){(h<k||h>=k+b||!c.has(h))&&a.push(h)},this);a.sort(i.compareNumbers).reverse().forEach(this.removeItem,this);for(var l=k,h=b+k;l<h;l++)this.addItem(l);return true}else return false};this.setPlugins(l);this.setRootNode(a)};this.setItemRenderer=function(a,h){k[a||"default"]=h};this.getItemRenderer=function(a){return k[a]};this.foreach=function(a,h,b,d){var f=new this.ItemRenderer(this.plugins,a);f.setStart(b||0);f.setNb(d||"*");f.render();c.watch("added",
f.render,f);c.watch("deleted",function(b){f.render();this.observers[b]&&this.observers[b].forEach(function(b){c.unwatchValue(b)},this);delete this.observers[b]},this);this.setItemRenderer(h,f)};this.updateStart=function(a,h){var b=this.getItemRenderer(a);return b?(b.setStart(h),true):false};this.updateNb=function(a,h){var b=this.getItemRenderer(a);return b?(b.setNb(h),true):false};this.refresh=function(a){return(a=this.getItemRenderer(a))?(a.render(),true):false};this.bind=function(a,h,b){var b=b||
"",f=a.getAttribute("data-"+this.plugins.name+"_id"),d=b.split("."),e=f||d.shift(),k=f?b:d.join("."),f=i.getNestedProperty(c.get(e),k),g=i.toArray(arguments).slice(3);if(f||f===0||f===false)this.execBinding.apply(this,[a,h,f].concat(g))||(a[h]=f);this.hasBinding(h)||a.addEventListener("change",function(){c.has(e)&&(k?c.update(e,b,a[h]):c.set(e,a[h]))},true);this.observers[e]=this.observers[e]||[];this.observers[e].push(c.watchValue(e,function(b){this.execBinding.apply(this,[a,h,i.getNestedProperty(b,
k)].concat(g))||(a[h]=i.getNestedProperty(b,k))},this))};this.set=function(a){return j.isAcceptedType(a)&&a.name?(c.set(a.name,a.value),true):false};this.form=function h(h){if(h&&h.nodeName=="FORM"){var b=this;h.addEventListener("submit",function(a){i.toArray(h.querySelectorAll("[name]")).forEach(b.set,b);a.preventDefault()},true);return true}else return false};this.addBinding=function(a,b){return a&&typeof a=="string"&&typeof b=="function"?(f[a]=b,true):false};this.execBinding=function(a,b){return this.hasBinding(b)?
(f[b].apply(a,Array.prototype.slice.call(arguments,2)),true):false};this.hasBinding=function(a){return f.hasOwnProperty(a)};this.getBinding=function(a){return f[a]};this.addBindings=function(a){return i.loop(a,function(a,f){this.addBinding(f,a)},this)};this.setModel(d);this.addBindings(a)}});
define("Olives/OObject",["StateMachine","Store","Olives/Plugins","Olives/DomUtils","Tools"],function(e,g,i,j,d){return function(a){var c=function(a){var b=k||document.createElement("div");if(a.template){typeof a.template=="string"?b.innerHTML=a.template.trim():j.isAcceptedType(a.template)&&b.appendChild(a.template);if(b.childNodes.length>1)throw Error("UI.template should have only one parent node");else a.dom=b.childNodes[0];a.plugins.apply(a.dom)}else throw Error("UI.template must be set prior to render");
},f=function b(a,b,f){b&&(f?b.insertBefore(a.dom,f):b.appendChild(a.dom),k=b)},k=null,l=new e("Init",{Init:[["render",c,this,"Rendered"],["place",function(a,e){c(a);f.apply(null,d.toArray(arguments))},this,"Rendered"]],Rendered:[["place",f,this],["render",c,this]]});this.model=a instanceof g?a:new g;this.plugins=new i;this.dom=this.template=null;this.place=function(a,f){l.event("place",this,a,f)};this.render=function(){l.event("render",this)};this.setTemplateFromDom=function(a){return j.isAcceptedType(a)?
(this.template=a,true):false};this.alive=function(a){return j.isAcceptedType(a)?(this.setTemplateFromDom(a),this.place(a.parentNode,a.nextElementSibling),true):false}}});
define("Olives/Plugins",["Tools","Olives/DomUtils"],function(e,g){return function(){var i={},j=function(a){return a.trim()},d=function(a,c,f){c.split(";").forEach(function(c){var d=c.split(":"),c=d[0].trim(),d=d[1]?d[1].split(",").map(j):[];d.unshift(a);i[f]&&i[f][c]&&i[f][c].apply(i[f],d)})};this.add=function(a,c){var f=this;return typeof a=="string"&&typeof c=="object"&&c?(i[a]=c,c.plugins={name:a,apply:function(){return f.apply.apply(f,arguments)}},true):false};this.addAll=function(a){return e.loop(a,
function(a,f){this.add(f,a)},this)};this.get=function(a){return i[a]};this.del=function(a){return delete i[a]};this.apply=function(a){var c;return g.isAcceptedType(a)?(c=g.getNodes(a),e.loop(e.toArray(c),function(a){e.loop(g.getDataset(a),function(c,e){d(a,c,e)})}),a):false}}});
define("Olives/Transport",["Observable","Tools"],function(e,g){return function(i,j){var d=null,a=null,c=new e;this.setIO=function(f){return f&&typeof f.connect=="function"?(a=f,true):false};this.getIO=function(){return a};this.connect=function(f){return typeof f=="string"?(d=a.connect(f),true):false};this.getSocket=function(){return d};this.on=function(a,c){d.on(a,c)};this.once=function(a,c){d.once(a,c)};this.emit=function(a,c,e){d.emit(a,c,e)};this.request=function(a,c,e,h){var b=Date.now()+Math.floor(Math.random()*
1E6),g=function(){e&&e.apply(h||null,arguments)};d[c.__keepalive__?"on":"once"](b,g);c.__eventId__=b;d.emit(a,c);if(c.__keepalive__)return function(){d.emit("disconnect-"+b);d.removeListener(b,g)}};this.listen=function(a,d,e,h){var b=a+"/"+d.path,i,j;c.hasTopic(b)||(g.mixin({method:"GET",__keepalive__:true},d),j=this.request(a,d,function(a){c.notify(b,a)},this));i=c.watch(b,e,h);return function(){c.unwatch(i);c.hasTopic(b)||j()}};this.getListenObservable=function(){return c};this.setIO(i);this.connect(j)}});
define("Olives/UI-plugin",["Olives/OObject","Tools"],function(e,g){return function(i){var j={};this.place=function(d,a){if(j[a]instanceof e)j[a].place(d);else throw Error(a+" is not an OObject UI in place:"+a);};this.set=function(d,a){return typeof d=="string"&&a instanceof e?(j[d]=a,true):false};this.setAll=function(d){g.loop(d,function(a,c){this.set(c,a)},this)};this.get=function(d){return j[d]};this.setAll(i)}});
