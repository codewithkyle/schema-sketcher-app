(()=>{var Ne=(i,e)=>e.some(n=>i instanceof n),re,ie;function Re(){return re||(re=[IDBDatabase,IDBObjectStore,IDBIndex,IDBCursor,IDBTransaction])}function De(){return ie||(ie=[IDBCursor.prototype.advance,IDBCursor.prototype.continue,IDBCursor.prototype.continuePrimaryKey])}var ae=new WeakMap,F=new WeakMap,oe=new WeakMap,Q=new WeakMap,B=new WeakMap;function _e(i){let e=new Promise((n,s)=>{let t=()=>{i.removeEventListener("success",r),i.removeEventListener("error",o)},r=()=>{n(M(i.result)),t()},o=()=>{s(i.error),t()};i.addEventListener("success",r),i.addEventListener("error",o)});return e.then(n=>{n instanceof IDBCursor&&ae.set(n,i)}).catch(()=>{}),B.set(e,i),e}function $e(i){if(F.has(i))return;let e=new Promise((n,s)=>{let t=()=>{i.removeEventListener("complete",r),i.removeEventListener("error",o),i.removeEventListener("abort",o)},r=()=>{n(),t()},o=()=>{s(i.error||new DOMException("AbortError","AbortError")),t()};i.addEventListener("complete",r),i.addEventListener("error",o),i.addEventListener("abort",o)});F.set(i,e)}var V={get(i,e,n){if(i instanceof IDBTransaction){if(e==="done")return F.get(i);if(e==="objectStoreNames")return i.objectStoreNames||oe.get(i);if(e==="store")return n.objectStoreNames[1]?void 0:n.objectStore(n.objectStoreNames[0])}return M(i[e])},set(i,e,n){return i[e]=n,!0},has(i,e){return i instanceof IDBTransaction&&(e==="done"||e==="store")?!0:e in i}};function je(i){V=i(V)}function Ue(i){return i===IDBDatabase.prototype.transaction&&!("objectStoreNames"in IDBTransaction.prototype)?function(e,...n){let s=i.call(W(this),e,...n);return oe.set(s,e.sort?e.sort():[e]),M(s)}:De().includes(i)?function(...e){return i.apply(W(this),e),M(ae.get(this))}:function(...e){return M(i.apply(W(this),e))}}function Pe(i){return typeof i=="function"?Ue(i):(i instanceof IDBTransaction&&$e(i),Ne(i,Re())?new Proxy(i,V):i)}function M(i){if(i instanceof IDBRequest)return _e(i);if(Q.has(i))return Q.get(i);let e=Pe(i);return e!==i&&(Q.set(i,e),B.set(e,i)),e}var W=i=>B.get(i);function ce(i,e,{blocked:n,upgrade:s,blocking:t,terminated:r}={}){let o=indexedDB.open(i,e),a=M(o);return s&&o.addEventListener("upgradeneeded",c=>{s(M(o.result),c.oldVersion,c.newVersion,M(o.transaction))}),n&&o.addEventListener("blocked",()=>n()),a.then(c=>{r&&c.addEventListener("close",()=>r()),t&&c.addEventListener("versionchange",()=>t())}).catch(()=>{}),a}var Fe=["get","getKey","getAll","getAllKeys","count"],Qe=["put","add","delete","clear"],K=new Map;function le(i,e){if(!(i instanceof IDBDatabase&&!(e in i)&&typeof e=="string"))return;if(K.get(e))return K.get(e);let n=e.replace(/FromIndex$/,""),s=e!==n,t=Qe.includes(n);if(!(n in(s?IDBIndex:IDBObjectStore).prototype)||!(t||Fe.includes(n)))return;let r=async function(o,...a){let c=this.transaction(o,t?"readwrite":"readonly"),l=c.store;return s&&(l=l.index(a.shift())),(await Promise.all([l[n](...a),t&&c.done]))[0]};return K.set(e,r),r}je(i=>({...i,get:(e,n,s)=>le(e,n)||i.get(e,n,s),has:(e,n)=>!!le(e,n)||i.has(e,n)}));function v(i){return Array.isArray?Array.isArray(i):fe(i)==="[object Array]"}var Be=1/0;function Ve(i){if(typeof i=="string")return i;let e=i+"";return e=="0"&&1/i==-Be?"-0":e}function We(i){return i==null?"":Ve(i)}function S(i){return typeof i=="string"}function he(i){return typeof i=="number"}function Ke(i){return i===!0||i===!1||Ge(i)&&fe(i)=="[object Boolean]"}function ue(i){return typeof i=="object"}function Ge(i){return ue(i)&&i!==null}function b(i){return i!=null}function G(i){return!i.trim().length}function fe(i){return i==null?i===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(i)}var He="Incorrect 'index' type",Ye=i=>`Invalid value for key ${i}`,Xe=i=>`Pattern length exceeds max of ${i}.`,ze=i=>`Missing ${i} property in key`,Je=i=>`Property 'weight' in key '${i}' must be a positive integer`,de=Object.prototype.hasOwnProperty,pe=class{constructor(e){this._keys=[],this._keyMap={};let n=0;e.forEach(s=>{let t=ge(s);n+=t.weight,this._keys.push(t),this._keyMap[t.id]=t,n+=t.weight}),this._keys.forEach(s=>{s.weight/=n})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}};function ge(i){let e=null,n=null,s=null,t=1;if(S(i)||v(i))s=i,e=ye(i),n=H(i);else{if(!de.call(i,"name"))throw new Error(ze("name"));let r=i.name;if(s=r,de.call(i,"weight")&&(t=i.weight,t<=0))throw new Error(Je(r));e=ye(r),n=H(r)}return{path:e,id:n,weight:t,src:s}}function ye(i){return v(i)?i:i.split(".")}function H(i){return v(i)?i.join("."):i}function Ze(i,e){let n=[],s=!1,t=(r,o,a)=>{if(!!b(r))if(!o[a])n.push(r);else{let c=o[a],l=r[c];if(!b(l))return;if(a===o.length-1&&(S(l)||he(l)||Ke(l)))n.push(We(l));else if(v(l)){s=!0;for(let h=0,u=l.length;h<u;h+=1)t(l[h],o,a+1)}else o.length&&t(l,o,a+1)}};return t(i,S(e)?e.split("."):e,0),s?n:n[0]}var qe={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},et={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(i,e)=>i.score===e.score?i.idx<e.idx?-1:1:i.score<e.score?-1:1},tt={location:0,threshold:.6,distance:100},nt={useExtendedSearch:!1,getFn:Ze,ignoreLocation:!1,ignoreFieldNorm:!1},d={...et,...qe,...tt,...nt},st=/[^ ]+/g;function rt(i=3){let e=new Map,n=Math.pow(10,i);return{get(s){let t=s.match(st).length;if(e.has(t))return e.get(t);let r=1/Math.sqrt(t),o=parseFloat(Math.round(r*n)/n);return e.set(t,o),o},clear(){e.clear()}}}var $=class{constructor({getFn:e=d.getFn}={}){this.norm=rt(3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((n,s)=>{this._keysMap[n.id]=s})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,S(this.docs[0])?this.docs.forEach((e,n)=>{this._addString(e,n)}):this.docs.forEach((e,n)=>{this._addObject(e,n)}),this.norm.clear())}add(e){let n=this.size();S(e)?this._addString(e,n):this._addObject(e,n)}removeAt(e){this.records.splice(e,1);for(let n=e,s=this.size();n<s;n+=1)this.records[n].i-=1}getValueForItemAtKeyId(e,n){return e[this._keysMap[n]]}size(){return this.records.length}_addString(e,n){if(!b(e)||G(e))return;let s={v:e,i:n,n:this.norm.get(e)};this.records.push(s)}_addObject(e,n){let s={i:n,$:{}};this.keys.forEach((t,r)=>{let o=this.getFn(e,t.path);if(!!b(o)){if(v(o)){let a=[],c=[{nestedArrIndex:-1,value:o}];for(;c.length;){let{nestedArrIndex:l,value:h}=c.pop();if(!!b(h))if(S(h)&&!G(h)){let u={v:h,i:l,n:this.norm.get(h)};a.push(u)}else v(h)&&h.forEach((u,f)=>{c.push({nestedArrIndex:f,value:u})})}s.$[r]=a}else if(!G(o)){let a={v:o,n:this.norm.get(o)};s.$[r]=a}}}),this.records.push(s)}toJSON(){return{keys:this.keys,records:this.records}}};function be(i,e,{getFn:n=d.getFn}={}){let s=new $({getFn:n});return s.setKeys(i.map(ge)),s.setSources(e),s.create(),s}function it(i,{getFn:e=d.getFn}={}){let{keys:n,records:s}=i,t=new $({getFn:e});return t.setKeys(n),t.setIndexRecords(s),t}function j(i,{errors:e=0,currentLocation:n=0,expectedLocation:s=0,distance:t=d.distance,ignoreLocation:r=d.ignoreLocation}={}){let o=e/i.length;if(r)return o;let a=Math.abs(s-n);return t?o+a/t:a?1:o}function at(i=[],e=d.minMatchCharLength){let n=[],s=-1,t=-1,r=0;for(let o=i.length;r<o;r+=1){let a=i[r];a&&s===-1?s=r:!a&&s!==-1&&(t=r-1,t-s+1>=e&&n.push([s,t]),s=-1)}return i[r-1]&&r-s>=e&&n.push([s,r-1]),n}var T=32;function ot(i,e,n,{location:s=d.location,distance:t=d.distance,threshold:r=d.threshold,findAllMatches:o=d.findAllMatches,minMatchCharLength:a=d.minMatchCharLength,includeMatches:c=d.includeMatches,ignoreLocation:l=d.ignoreLocation}={}){if(e.length>T)throw new Error(Xe(T));let h=e.length,u=i.length,f=Math.max(0,Math.min(s,u)),p=r,g=f,y=a>1||c,x=y?Array(u):[],I;for(;(I=i.indexOf(e,g))>-1;){let m=j(e,{currentLocation:I,expectedLocation:f,distance:t,ignoreLocation:l});if(p=Math.min(m,p),g=I+h,y){let A=0;for(;A<h;)x[I+A]=1,A+=1}}g=-1;let O=[],C=1,D=h+u,Oe=1<<h-1;for(let m=0;m<h;m+=1){let A=0,w=D;for(;A<w;)j(e,{errors:m,currentLocation:f+w,expectedLocation:f,distance:t,ignoreLocation:l})<=p?A=w:D=w,w=Math.floor((D-A)/2+A);D=w;let ne=Math.max(1,f-w+1),P=o?u:Math.min(f+w,u)+h,N=Array(P+2);N[P+1]=(1<<m)-1;for(let E=P;E>=ne;E-=1){let _=E-1,se=n[i.charAt(_)];if(y&&(x[_]=+!!se),N[E]=(N[E+1]<<1|1)&se,m&&(N[E]|=(O[E+1]|O[E])<<1|1|O[E+1]),N[E]&Oe&&(C=j(e,{errors:m,currentLocation:_,expectedLocation:f,distance:t,ignoreLocation:l}),C<=p)){if(p=C,g=_,g<=f)break;ne=Math.max(1,2*f-g)}}if(j(e,{errors:m+1,currentLocation:f,expectedLocation:f,distance:t,ignoreLocation:l})>p)break;O=N}let U={isMatch:g>=0,score:Math.max(.001,C)};if(y){let m=at(x,a);m.length?c&&(U.indices=m):U.isMatch=!1}return U}function ct(i){let e={};for(let n=0,s=i.length;n<s;n+=1){let t=i.charAt(n);e[t]=(e[t]||0)|1<<s-n-1}return e}var Y=class{constructor(e,{location:n=d.location,threshold:s=d.threshold,distance:t=d.distance,includeMatches:r=d.includeMatches,findAllMatches:o=d.findAllMatches,minMatchCharLength:a=d.minMatchCharLength,isCaseSensitive:c=d.isCaseSensitive,ignoreLocation:l=d.ignoreLocation}={}){if(this.options={location:n,threshold:s,distance:t,includeMatches:r,findAllMatches:o,minMatchCharLength:a,isCaseSensitive:c,ignoreLocation:l},this.pattern=c?e:e.toLowerCase(),this.chunks=[],!this.pattern.length)return;let h=(f,p)=>{this.chunks.push({pattern:f,alphabet:ct(f),startIndex:p})},u=this.pattern.length;if(u>T){let f=0,p=u%T,g=u-p;for(;f<g;)h(this.pattern.substr(f,T),f),f+=T;if(p){let y=u-T;h(this.pattern.substr(y),y)}}else h(this.pattern,0)}searchIn(e){let{isCaseSensitive:n,includeMatches:s}=this.options;if(n||(e=e.toLowerCase()),this.pattern===e){let g={isMatch:!0,score:0};return s&&(g.indices=[[0,e.length-1]]),g}let{location:t,distance:r,threshold:o,findAllMatches:a,minMatchCharLength:c,ignoreLocation:l}=this.options,h=[],u=0,f=!1;this.chunks.forEach(({pattern:g,alphabet:y,startIndex:x})=>{let{isMatch:I,score:O,indices:C}=ot(e,g,y,{location:t+x,distance:r,threshold:o,findAllMatches:a,minMatchCharLength:c,includeMatches:s,ignoreLocation:l});I&&(f=!0),u+=O,I&&C&&(h=[...h,...C])});let p={isMatch:f,score:f?u/this.chunks.length:1};return f&&s&&(p.indices=h),p}},k=class{constructor(e){this.pattern=e}static isMultiMatch(e){return me(e,this.multiRegex)}static isSingleMatch(e){return me(e,this.singleRegex)}search(){}};function me(i,e){let n=i.match(e);return n?n[1]:null}var Ee=class extends k{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){let n=e===this.pattern;return{isMatch:n,score:n?0:1,indices:[0,this.pattern.length-1]}}},Ie=class extends k{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){let s=e.indexOf(this.pattern)===-1;return{isMatch:s,score:s?0:1,indices:[0,e.length-1]}}},ve=class extends k{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){let n=e.startsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,this.pattern.length-1]}}},Se=class extends k{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){let n=!e.startsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}},ke=class extends k{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){let n=e.endsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[e.length-this.pattern.length,e.length-1]}}},Ae=class extends k{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){let n=!e.endsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}},X=class extends k{constructor(e,{location:n=d.location,threshold:s=d.threshold,distance:t=d.distance,includeMatches:r=d.includeMatches,findAllMatches:o=d.findAllMatches,minMatchCharLength:a=d.minMatchCharLength,isCaseSensitive:c=d.isCaseSensitive,ignoreLocation:l=d.ignoreLocation}={}){super(e);this._bitapSearch=new Y(e,{location:n,threshold:s,distance:t,includeMatches:r,findAllMatches:o,minMatchCharLength:a,isCaseSensitive:c,ignoreLocation:l})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}},z=class extends k{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let n=0,s,t=[],r=this.pattern.length;for(;(s=e.indexOf(this.pattern,n))>-1;)n=s+r,t.push([s,n-1]);let o=!!t.length;return{isMatch:o,score:o?0:1,indices:t}}},J=[Ee,z,ve,Se,Ae,ke,Ie,X],we=J.length,lt=/ +(?=([^\"]*\"[^\"]*\")*[^\"]*$)/,ht="|";function ut(i,e={}){return i.split(ht).map(n=>{let s=n.trim().split(lt).filter(r=>r&&!!r.trim()),t=[];for(let r=0,o=s.length;r<o;r+=1){let a=s[r],c=!1,l=-1;for(;!c&&++l<we;){let h=J[l],u=h.isMultiMatch(a);u&&(t.push(new h(u,e)),c=!0)}if(!c)for(l=-1;++l<we;){let h=J[l],u=h.isSingleMatch(a);if(u){t.push(new h(u,e));break}}}return t})}var ft=new Set([X.type,z.type]),Me=class{constructor(e,{isCaseSensitive:n=d.isCaseSensitive,includeMatches:s=d.includeMatches,minMatchCharLength:t=d.minMatchCharLength,ignoreLocation:r=d.ignoreLocation,findAllMatches:o=d.findAllMatches,location:a=d.location,threshold:c=d.threshold,distance:l=d.distance}={}){this.query=null,this.options={isCaseSensitive:n,includeMatches:s,minMatchCharLength:t,findAllMatches:o,ignoreLocation:r,location:a,threshold:c,distance:l},this.pattern=n?e:e.toLowerCase(),this.query=ut(this.pattern,this.options)}static condition(e,n){return n.useExtendedSearch}searchIn(e){let n=this.query;if(!n)return{isMatch:!1,score:1};let{includeMatches:s,isCaseSensitive:t}=this.options;e=t?e:e.toLowerCase();let r=0,o=[],a=0;for(let c=0,l=n.length;c<l;c+=1){let h=n[c];o.length=0,r=0;for(let u=0,f=h.length;u<f;u+=1){let p=h[u],{isMatch:g,indices:y,score:x}=p.search(e);if(g){if(r+=1,a+=x,s){let I=p.constructor.type;ft.has(I)?o=[...o,...y]:o.push(y)}}else{a=0,r=0,o.length=0;break}}if(r){let u={isMatch:!0,score:a/r};return s&&(u.indices=o),u}}return{isMatch:!1,score:1}}},Z=[];function dt(...i){Z.push(...i)}function q(i,e){for(let n=0,s=Z.length;n<s;n+=1){let t=Z[n];if(t.condition(i,e))return new t(i,e)}return new Y(i,e)}var R={AND:"$and",OR:"$or"},ee={PATH:"$path",PATTERN:"$val"},te=i=>!!(i[R.AND]||i[R.OR]),pt=i=>!!i[ee.PATH],gt=i=>!v(i)&&ue(i)&&!te(i),xe=i=>({[R.AND]:Object.keys(i).map(e=>({[e]:i[e]}))});function Ce(i,e,{auto:n=!0}={}){let s=t=>{let r=Object.keys(t),o=pt(t);if(!o&&r.length>1&&!te(t))return s(xe(t));if(gt(t)){let c=o?t[ee.PATH]:r[0],l=o?t[ee.PATTERN]:t[c];if(!S(l))throw new Error(Ye(c));let h={keyId:H(c),pattern:l};return n&&(h.searcher=q(l,e)),h}let a={children:[],operator:r[0]};return r.forEach(c=>{let l=t[c];v(l)&&l.forEach(h=>{a.children.push(s(h))})}),a};return te(i)||(i=xe(i)),s(i)}function yt(i,{ignoreFieldNorm:e=d.ignoreFieldNorm}){i.forEach(n=>{let s=1;n.matches.forEach(({key:t,norm:r,score:o})=>{let a=t?t.weight:null;s*=Math.pow(o===0&&a?Number.EPSILON:o,(a||1)*(e?1:r))}),n.score=s})}function bt(i,e){let n=i.matches;e.matches=[],!!b(n)&&n.forEach(s=>{if(!b(s.indices)||!s.indices.length)return;let{indices:t,value:r}=s,o={indices:t,value:r};s.key&&(o.key=s.key.src),s.idx>-1&&(o.refIndex=s.idx),e.matches.push(o)})}function mt(i,e){e.score=i.score}function Et(i,e,{includeMatches:n=d.includeMatches,includeScore:s=d.includeScore}={}){let t=[];return n&&t.push(bt),s&&t.push(mt),i.map(r=>{let{idx:o}=r,a={item:e[o],refIndex:o};return t.length&&t.forEach(c=>{c(r,a)}),a})}var L=class{constructor(e,n={},s){this.options={...d,...n},this.options.useExtendedSearch,this._keyStore=new pe(this.options.keys),this.setCollection(e,s)}setCollection(e,n){if(this._docs=e,n&&!(n instanceof $))throw new Error(He);this._myIndex=n||be(this.options.keys,this._docs,{getFn:this.options.getFn})}add(e){!b(e)||(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){let n=[];for(let s=0,t=this._docs.length;s<t;s+=1){let r=this._docs[s];e(r,s)&&(this.removeAt(s),s-=1,t-=1,n.push(r))}return n}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:n=-1}={}){let{includeMatches:s,includeScore:t,shouldSort:r,sortFn:o,ignoreFieldNorm:a}=this.options,c=S(e)?S(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return yt(c,{ignoreFieldNorm:a}),r&&c.sort(o),he(n)&&n>-1&&(c=c.slice(0,n)),Et(c,this._docs,{includeMatches:s,includeScore:t})}_searchStringList(e){let n=q(e,this.options),{records:s}=this._myIndex,t=[];return s.forEach(({v:r,i:o,n:a})=>{if(!b(r))return;let{isMatch:c,score:l,indices:h}=n.searchIn(r);c&&t.push({item:r,idx:o,matches:[{score:l,value:r,norm:a,indices:h}]})}),t}_searchLogical(e){let n=Ce(e,this.options),s=(a,c,l)=>{if(!a.children){let{keyId:h,searcher:u}=a,f=this._findMatches({key:this._keyStore.get(h),value:this._myIndex.getValueForItemAtKeyId(c,h),searcher:u});return f&&f.length?[{idx:l,item:c,matches:f}]:[]}switch(a.operator){case R.AND:{let h=[];for(let u=0,f=a.children.length;u<f;u+=1){let p=a.children[u],g=s(p,c,l);if(g.length)h.push(...g);else return[]}return h}case R.OR:{let h=[];for(let u=0,f=a.children.length;u<f;u+=1){let p=a.children[u],g=s(p,c,l);if(g.length){h.push(...g);break}}return h}}},t=this._myIndex.records,r={},o=[];return t.forEach(({$:a,i:c})=>{if(b(a)){let l=s(n,a,c);l.length&&(r[c]||(r[c]={idx:c,item:a,matches:[]},o.push(r[c])),l.forEach(({matches:h})=>{r[c].matches.push(...h)}))}}),o}_searchObjectList(e){let n=q(e,this.options),{keys:s,records:t}=this._myIndex,r=[];return t.forEach(({$:o,i:a})=>{if(!b(o))return;let c=[];s.forEach((l,h)=>{c.push(...this._findMatches({key:l,value:o[h],searcher:n}))}),c.length&&r.push({idx:a,item:o,matches:c})}),r}_findMatches({key:e,value:n,searcher:s}){if(!b(n))return[];let t=[];if(v(n))n.forEach(({v:r,i:o,n:a})=>{if(!b(r))return;let{isMatch:c,score:l,indices:h}=s.searchIn(r);c&&t.push({score:l,key:e,value:r,idx:o,norm:a,indices:h})});else{let{v:r,n:o}=n,{isMatch:a,score:c,indices:l}=s.searchIn(r);a&&t.push({score:c,key:e,value:r,norm:o,indices:l})}return t}};L.version="6.4.6";L.createIndex=be;L.parseIndex=it;L.config=d;L.parseQuery=Ce;dt(Me);var Te=L;var Le=class{constructor(){this.db=null,this.tables=null,self.onmessage=this.inbox.bind(this)}async inbox(e){let{type:n,uid:s,data:t}=e.data;try{let r=null;switch(n){case"init":await this.init(t);break;case"query":let o=[];Array.isArray(t)?o=t:o=[t],r=await this.performQuery(o);break;case"sql":let a=await this.buildQueriesFromSQL(t);r=await this.performQuery(a);break;default:console.warn(`Invalid JSQL Worker message type: ${n}`);break}this.send("response",r,s)}catch(r){this.send("error",r,s)}}send(e,n=null,s=null,t=null){let r={type:e,data:n,uid:s};t?self.postMessage(r,t):self.postMessage(r)}async init(e){let n=await fetch(e,{method:"GET",headers:new Headers({Accept:"application/json"}),credentials:"include"});if(!n.ok)throw`${n.status}: ${n.statusText}`;let s=await n.json();this.tables=s.tables,this.db=await ce(s.name,s.version,{upgrade(t,r,o,a){for(let c=0;c<t.objectStoreNames.length;c++)t.deleteObjectStore(t.objectStoreNames[c]);for(let c=0;c<s.tables.length;c++){let l=s.tables[c],h={keyPath:"id",autoIncrement:!1};l?.keyPath&&(h.keyPath=l.keyPath),typeof l.autoIncrement!="undefined"&&(h.autoIncrement=l.autoIncrement);let u=t.createObjectStore(l.name,h);for(let f=0;f<l.columns.length;f++){let p=l.columns[f];u.createIndex(p.key,p.key,{unique:p?.unique??!1})}}},blocked(){console.error("This app needs to restart. Close all tabs for this app and before relaunching.")},blocking(){console.error("This app needs to restart. Close all tabs for this app and before relaunching.")}})}async performQuery(e){let n=[];for(let s=0;s<e.length;s++){let t=e[s],r=[],o=!1;t.type!=="INSERT"&&t.table!=="*"&&(t.where!==null&&t.where.length===1&&t.where[0].checks.length===1&&!Array.isArray(t.where[0].checks[0])&&t.where[0].checks[0].type==="=="?(o=!0,r=await this.db.getAllFromIndex(t.table,t.where[0].checks[0].column,t.where[0].checks[0].value)):r=await this.db.getAll(t.table));let a=[];switch(t.type){case"RESET":if(t.table==="*"){let l=[];for(let h=0;h<this.tables.length;h++)l.push(this.db.clear(this.tables[h].name));await Promise.all(l)}else await this.db.clear(t.table);break;case"UPDATE":t.where!==null&&!o&&(r=this.handleWhere(t,r));for(let l=0;l<r.length;l++){let h=!1;console.log(t.set,r);for(let u in t.set)u in r[l]&&(r[l][u]=t.set[u],h=!0);h&&a.push(this.db.put(t.table,r[l]))}await Promise.all(a);break;case"DELETE":t.where!==null&&!o&&(r=this.handleWhere(t,r));let c=this.getTableKey(t.table);for(let l=0;l<r.length;l++)a.push(this.db.delete(t.table,r[l][c]));await Promise.all(a);break;case"SELECT":t.where!==null&&!o&&(r=this.handleWhere(t,r));break;case"INSERT":for(let l of t.values)await this.db.put(t.table,l);r=t.values;break;default:break}if(t.type==="SELECT"&&(t.function!==null?r=this.handleSelectFunction(t,r):(t.uniqueOnly&&(r=this.getUnique(r,t.columns)),t.columns.length&&t.columns[0]!=="*"&&(r=this.filterColumns(t,r)),t.order!==null&&this.sort(t,r),t.limit!==null&&(r=r.splice(t.offset,t.limit)))),t.uniqueOnly){let c=[];for(let l=0;l<r.length;l++)c.push(r[l][t.columns[0]]);r=c}else t.group!==null&&(r=this.buildGroups(r,t.group));Array.isArray(r)?n=[...n,...r]:n.push(r)}return e.length===1&&e[0].group!==null&&(n=n[0]),n}buildGroups(e,n){let s={};for(let t=0;t<e.length;t++)e[t][n]in s?s[e[t][n]].push(e[t]):s[e[t][n]]=[e[t]];return s}getUnique(e,n){let s=[],t=[];for(let r=0;r<e.length;r++)t.includes(e[r][n[0]])||(t.push(e[r][n[0]]),s.push(e[r]));return s}getTableKey(e){let n="id";for(let s=0;s<this.tables.length;s++)if(this.tables[s].name===e){this.tables[s]?.keyPath&&(n=this.tables[s].keyPath);break}return n}check(e,n){let s=!1;switch(e.type){case"LIKE":new Te([n],{keys:[e.column],ignoreLocation:!0,threshold:0}).search(e.value).length&&(s=!0);break;case"INCLUDES":Array.isArray(n[e.column])&&n[e.column].includes(e.value)&&(s=!0);break;case"EXCLUDES":Array.isArray(n[e.column])&&!n[e.column].includes(e.value)&&(s=!0);break;case">=":n[e.column]>=e.value&&(s=!0);break;case">":n[e.column]>e.value&&(s=!0);break;case"<=":n[e.column]<=e.value&&(s=!0);break;case"<":n[e.column]<e.value&&(s=!0);break;case"!>=":n[e.column]<e.value&&(s=!0);break;case"!>":n[e.column]<=e.value&&(s=!0);break;case"!==":n[e.column]!==e.value&&(s=!0);break;case"!=":n[e.column]!=e.value&&(s=!0);break;case"!<=":n[e.column]>e.value&&(s=!0);break;case"!<":n[e.column]>=e.value&&(s=!0);break;case"==":n[e.column]===e.value&&(s=!0);break;case"=":n[e.column]==e.value&&(s=!0);break;default:break}return s}handleWhere(e,n){let s=[];for(let t=0;t<n.length;t++){let r=n[t],o=!1;for(let a=0;a<e.where.length;a++){let c=e.where[a],l=0,h=c.checks.length;for(let u=0;u<c.checks.length;u++){let f=c.checks[u];if(Array.isArray(f)){let p=0,g=f.length;for(let y=0;y<f.length;y++)this.check(f[y],r)&&p++;p===g&&l++}else this.check(f,r)&&l++;if(l!==0&&!c.requireAll){o=!0;break}}if(o||l===h){o=!0;break}}o&&s.push(r)}return s}handleSelectFunction(e,n){let s;switch(e.function){case"MIN":let t;for(let a=0;a<n.length;a++){let c=n[a]?.[e.columns[0]]??0;(a===0||c<t)&&(t=c)}s=t;break;case"MAX":let r;for(let a=0;a<n.length;a++){let c=n[a]?.[e.columns[0]]??0;(a===0||c>r)&&(r=c)}s=r;break;case"SUM":s=0;for(let a=0;a<n.length;a++){let c=n[a]?.[e.columns[0]]??0;(isNaN(c)||!isFinite(c))&&(c=0),s+=c}break;case"AVG":let o=0;for(let a=0;a<n.length;a++){let c=n[a]?.[e.columns[0]]??0;(isNaN(c)||!isFinite(c))&&(c=0),o+=c}s=o/n.length;break;case"COUNT":s=n.length;break;default:break}return s}sort(e,n){e.order.by==="ASC"?n.sort((s,t)=>{let r=s?.[e.order.column]??0,o=t?.[e.order.column]??0;return r>=o?1:-1}):n.sort((s,t)=>{let r=s?.[e.order.column]??0,o=t?.[e.order.column]??0;return r>=o?-1:1})}filterColumns(e,n){let s=[];for(let t=0;t<n.length;t++){let r=n[t],o={};for(let a=0;a<e.columns.length;a++)o[e.columns[a]]=r?.[e.columns[a]]??null;s.push(o)}return s}buildQueryFromStatement(e,n){let s=this.parseSegments(e),t={uniqueOnly:!1,type:null,function:null,table:null,columns:null,offset:0,limit:null,where:null,values:null,order:null,set:null,group:null};for(let r=s.length-1;r>=0;r--){let o=s[r].join(" ");if(o.indexOf("+")!==-1||o.indexOf("/")!==-1||o.indexOf("%")!==-1)throw`Invalid syntax. Arithmetic operators are not currently supported ${o}`;if(o.indexOf("&")!==-1||o.indexOf("|")!==-1||o.indexOf("^")!==-1)throw"Invalid syntax. Bitwise operators are not currently supported";switch(s[r][0].toUpperCase()){case"SET":t=this.parseSetSegment(s[r],t,n??{});break;case"VALUES":t=this.parseValues(s[r],t,n??{});break;case"OFFSET":if(s[r].length!==2)throw`Invalid syntax at: ${s[r].join(" ")}`;t.offset=parseInt(s[r][1]);break;case"LIMIT":if(s[r].length!==2)throw`Invalid syntax at: ${s[r].join(" ")}`;t.limit=parseInt(s[r][1]);break;case"GROUP":t=this.parseGroupBySegment(s[r],t);break;case"ORDER":t=this.parseOrderBySegment(s[r],t);break;case"WHERE":t=this.parseWhereSegment(s[r],t,n??{});break;case"FROM":if(s[r].length!==2)throw`Invalid syntax at: ${s[r].join(" ")}`;t.table=s[r][1];break;case"SELECT":t.type="SELECT",t=this.parseSelectSegment(s[r],t);break;case"DELETE":t.type="DELETE";break;case"INSERT":t.type="INSERT",t=this.parseInsertSegment(s[r],t);break;case"UPDATE":if(s[r].length!==2)throw`Invalid syntax at: ${s[r].join(" ")}`;t.table=s[r][1],t.type="UPDATE";break;case"RESET":if(s[r].length!==2)throw`Invalid syntax at: ${s[r].join(" ")}`;t.table=s[r][1],t.type="RESET";break;default:throw`Invalid syntax at: ${s[r].join(" ")}`}}if(t.type===null)throw"Invalid syntax: Missing SELECT, UPDATE, INSERT INTO, or DELETE statement.";if(t.table===null)throw"Invalid syntax: Missing FROM.";if(t.type==="SELECT"&&t.columns===null)throw"Invalid syntax: Missing columns.";if(t.type==="INSERT"&&t.values===null)throw"Invalid syntax: Missing VALUES.";if(t.type==="UPDATE"&&t.set===null)throw"Invalid syntax: Missing SET.";if(t.type==="UPDATE"&&t.where===null)throw"Invalid syntax: Missing WHERE.";if(isNaN(t.limit))throw"Invalid syntax: LIMIT is not a number.";if(isNaN(t.offset))throw"Invalid syntax: OFFSET is not a number.";return t}async buildQueriesFromSQL({sql:e,params:n}){e=e.replace(/\-\-.*|\;$/g,"").trim();let s=[],t=e.split(/\bUNION\b/i);for(let r=0;r<t.length;r++)s.push(this.buildQueryFromStatement(t[r],n));return s}parseSetSegment(e,n,s){if(e.length<2)throw`Invalid syntax at: ${e.join(" ")}.`;{n.set={},e.splice(0,1);let t=e.join(" ").trim().split(",");for(let r=0;r<t.length;r++){let o=t[r].trim().split("=");if(o.length!==2)throw`Invalid syntax at: ${t[r]}`;n.set[o[0].trim()]=o[1].trim().replace(/^[\"\']|[\"\']$/g,"")}}for(let t in n.set)if(n.set[t].indexOf("$")===0){let r=n.set[t].substring(1,n.set[t].length);if(r in s)n.set[t]=s[r];else throw`Invalid params. Missing key: ${r}`}return n}buildConditionCheck(e){let n;if(Array.isArray(e)){n=[];for(let s=0;s<e.length;s++){let t={column:"",type:"=",value:null};e[s]=e[s].trim().replace(/\'|\"/g,""),t.type=e[s].match(/\=|\=\=|\!\=|\!\=\=|\>|\<|\>\=|\<\=|\!\>\=|\!\<\=|\!\>|\!\<|\bLIKE\b|\bINCLUDES\b|\bEXCLUDES\b/ig).join("").trim();let r=e[s].split(t.type);t.column=r[0],t.value=r[1],n.push(t)}}else{let s={column:"",type:"=",value:null};e=e.trim().replace(/\'|\"/g,""),s.type=e.match(/\=|\=\=|\!\=|\!\=\=|\>|\<|\>\=|\<\=|\!\>\=|\!\<\=|\!\>|\!\<|\bLIKE\b|\bINCLUDES\b|\bEXCLUDES\b/ig).join("").trim();let t=e.split(s.type);s.column=t[0].trim(),s.value=t[1].trim(),n=s}return n}buildConditions(e){let n={requireAll:!0,checks:[]},s=[];if(e.search(/\bOR\b/i)!==-1){n.requireAll=!1,s=e.split(/\bOR\b/i);for(let t=0;t<s.length;t++)s[t].search(/\bAND\b/i)!==-1&&s.splice(t,1,s[t].split(/\bAND\b/i))}else s=e.split(/\bAND\b/i);for(let t=0;t<s.length;t++)n.checks.push(this.buildConditionCheck(s[t]));return n}parseWhereSegment(e,n,s){if(e.length<2)throw`Invalid syntax at: ${e.join(" ")}.`;{n.where=[],e.splice(0,1);let t=[],r=0;for(let a=e.length-1;a>=0;a--){let c=-1;switch(r+=(e[a].match(/\)/g)||[]).length,r-=(e[a].match(/\(/g)||[]).length,e[a].toUpperCase()){case"OR":r===0&&(c=a);break;default:break}c!==-1?t.push(e.splice(c,e.length)):a===0&&t.push(e.splice(0,e.length))}t.reverse();for(let a=0;a<t.length;a++)t[a][0].toUpperCase()==="OR"&&t[a].splice(0,1);for(let a=0;a<t.length;a++){let c=t[a].join(" ");c=c.trim().replace(/^\(|\)$/g,"").trim(),t.splice(a,1,c)}let o=[];for(let a=0;a<t.length;a++){let c=this.buildConditions(t[a]);o.push(c)}n.where=o;for(let a=0;a<n.where.length;a++)for(let c=0;c<n.where[a].checks.length;c++)if(Array.isArray(n.where[a].checks[c]))for(let l=0;l<n.where[a].checks[c].length;l++){let h=n.where[a].checks[c][l];if(h.value.indexOf("$")!==-1){let f=h.value.slice(1);if(f in s)n.where[a].checks[c][l].value=s[f];else throw`Invalid params. Missing key: ${f}`}}else{let l=n.where[a].checks[c];if(l.value.indexOf("$")!==-1){let u=l.value.slice(1);if(u in s)n.where[a].checks[c].value=s[u];else throw`Invalid params. Missing key: ${u}`}}return n}}parseGroupBySegment(e,n){if(e.length!==3)throw"Invalid syntax. GROUP BY only currently supports single column sorting.";if(n.uniqueOnly)throw"Invalid syntax. GROUP BY can not be used with UNIQUE or DISTINCT statements.";return n.group=e[2],n}parseOrderBySegment(e,n){if(e.length<3||e[1]!=="BY")throw`Invalid syntax at: ${e.join(" ")}.`;if(e.splice(0,2),e.length>2||e[0].indexOf(",")!==-1)throw"Invalid syntax. ORDER BY only currently supports single column sorting.";{let s="ASC";if(e?.[1]&&(s=e[1].toUpperCase(),s!=="ASC"&&s!=="DESC"))throw"Invalid syntax. ORDER BY only currently supports ASC or DESC sorting.";n.order={column:e[0],by:s}}return n}parseValues(e,n,s){if(e.length===1)throw`Invalid syntax at: ${e}.`;{n.values=[],e.splice(0,1);let t=e.join("").replace(/\(|\)|\s/g,"").split(",");for(let r=0;r<t.length;r++)if(t[r].indexOf("$")===0){let o=t[r].substring(1,t[r].length);if(o in s)n.values.push(s[o]);else throw`Invalid params. Missing key: ${o}`}else n.values.push(t[r])}return n}parseInsertSegment(e,n){if(e.length<3||e[1]!=="INTO")throw`Invalid syntax at: ${e.join(" ")}.`;if(e.length===3)n.table=e[2];else throw"Invalid syntax. Only 'INSERT INTO table_name' queries are currently supported.";return n}parseSelectSegment(e,n){if(e.includes("*")&&(n.columns=["*"]),e[1].toUpperCase()==="DISTINCT"||e[1].toUpperCase()==="UNIQUE"){if(e.includes("*"))throw"Invalid SELECT statement. DISTINCT or UNIQUE does not currently support the wildcard (*) character.";if(n.uniqueOnly=!0,e.splice(1,1),e.length>2)throw"Invalid SELECT statement. DISTINCT or UNIQUE does not currently support multiple columns."}else if(e[1].toUpperCase().search(/\bCOUNT\b/i)===0||e[1].toUpperCase().search(/\bMIN\b/i)===0||e[1].toUpperCase().search(/\bMAX\b/i)===0||e[1].toUpperCase().search(/\bAVG\b/i)===0||e[1].toUpperCase().search(/\bSUM\b/i)===0){if(e.includes("*"))throw"Invalid SELECT statement. Functions can not be used with the wildcard (*) character.";let s=e[1].match(/\w+/)[0].trim().toUpperCase(),t=e[1].match(/\(.*?\)/)[0].replace(/\(|\)/g,"").trim();n.function=s,n.columns=[t]}if(n.columns===null){if(e.length===1)throw"Invalid SELECT statement syntax.";n.columns=[];for(let s=1;s<e.length;s++)if(e[s].indexOf(",")===-1)n.columns.push(e[s]);else{let t=e[s].split(",");for(let r=0;r<t.length;r++){let o=t[r].trim();o.length&&n.columns.push(o)}}}return n}parseSegments(e){let n=e.trim().split(/\s+/),s=[];for(;n.length>0;){let t=-1;for(let r=n.length-1;r>=0;r--){switch(n[r].toUpperCase()){case"HAVING":throw"Invalid syntax: HAVING clause is not currently supported.";case"UNION":throw"Invalid syntax: UNION operator is not currently supported.";case"JOIN":throw"Invalid syntax: JOIN clause is not currently supported.";case"SET":t=r;break;case"VALUES":t=r;break;case"OFFSET":t=r;break;case"LIMIT":t=r;break;case"ORDER":t=r;break;case"WHERE":t=r;break;case"FROM":t=r;break;case"SELECT":t=r;break;case"DELETE":t=r;break;case"INSERT":t=r;break;case"UPDATE":t=r;break;case"RESET":t=r;break;case"GROUP":t=r;break;default:break}if(t!==-1)break}if(t===-1&&n.length>0)throw`Invalid syntax: ${e}`;s.push(n.splice(t,n.length))}return s}};new Le;})();