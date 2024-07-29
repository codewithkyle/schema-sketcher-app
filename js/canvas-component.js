import r from"./env.js";import{createSubscription as b,subscribe as p,unsubscribe as w}from"./pubsub.js";import M from"./debounce.js";import f from"./diagram-controller.js";import E from"./context-menu.js";const g="#9CA3AF",L="#EC4899";class u extends HTMLElement{constructor(){super();this.onContextMenu=o=>{if(o.preventDefault(),this.openStartPoint===null&&this.activeLineId!==null&&o instanceof MouseEvent){const t=this.activeLineId,e=o.clientX,i=o.clientY;document.body.querySelectorAll("brixi-context-menu").forEach(n=>n.remove()),new E({items:[{label:"One-to-one",callback:()=>{f.updateConnectionType(t,"one-one")}},{label:"One-to-many",callback:()=>{f.updateConnectionType(t,"one-many")}},{label:"Many-to-one",callback:()=>{f.updateConnectionType(t,"many-one")}},{label:"Many-to-many",callback:()=>{f.updateConnectionType(t,"many-many")}},null,{label:"Delete",callback:()=>{f.deleteConnection(t)}}],x:e,y:i})}};this.endMouseMove=o=>{this.openStartPoint=null};this.handleKeyboard=o=>{o.key==="Escape"?this.openStartPoint=null:o.key==="Delete"&&this.activeLineId!==null&&f.deleteConnection(this.activeLineId)};this.handleMouseMove=o=>{this.isDirty=!0,this.mousePos={x:o.clientX,y:o.clientY};const e=this.hitCTX.getImageData(o.clientX,o.clientY,1,1).data,i=`rgb(${e[0]},${e[1]},${e[2]})`;if(i!=="rgb(0,0,0)"){const n=this.colorRef[i];n!==void 0?this.activeLineId=n:this.activeLineId=null}else this.activeLineId=null};this.x=0,this.y=0,this.w=0,this.h=0,this.openStartPoint=null,this.mousePos=null,this.lines=[],this.forceHighlight=null,this.activeLineId=null,this.colorRef={},this.isDirty=!1,r.css(["canvas-component"]),b("canvas"),this.ticketID=p("canvas",this.inbox.bind(this))}async connectedCallback(){this.canvas=this.querySelector("canvas")||document.createElement("canvas"),this.canvas.isConnected||this.appendChild(this.canvas),this.hitCanvas=this.querySelector("canvas.hit")||document.createElement("canvas"),this.hitCanvas.isConnected||(this.hitCanvas.classList.add("hit"),this.appendChild(this.hitCanvas)),this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this.hitCanvas.width=window.innerWidth,this.hitCanvas.height=window.innerHeight,this.ctx=this.canvas.getContext("2d"),this.hitCTX=this.hitCanvas.getContext("2d",{willReadFrequently:!0}),window.addEventListener("mousemove",this.handleMouseMove),window.addEventListener("keydown",this.handleKeyboard),window.addEventListener("mousedown",this.endMouseMove),window.addEventListener("contextmenu",this.onContextMenu),window.addEventListener("resize",M(()=>{this.canvas.width=window.innerWidth,this.canvas.height=window.innerHeight,this.hitCanvas.width=window.innerWidth,this.hitCanvas.height=window.innerHeight},300)),this.oldTime=performance.now(),this.eventLoop()}disconnectedCallback(){this.eventLoop=async()=>{},w(this.ticketID),window.removeEventListener("mousemove",this.handleMouseMove),window.removeEventListener("mousedown",this.endMouseMove)}startNewLine(o,t,e,i,n=[]){this.openStartPoint={x:o,y:t,id:e,tableID:i,refs:n},this.mousePos={x:o,y:t}}endLine(o,t,e=[]){this.openStartPoint!==null&&o!==this.openStartPoint.id&&t!==this.openStartPoint.tableID&&(f.createConnection(this.openStartPoint.id,o,[...this.openStartPoint.refs,...e]),this.openStartPoint=null)}async inbox(o){switch(o.type){case"clear-highlight":o.ref===this.forceHighlight&&(this.forceHighlight=null);break;case"highlight":this.forceHighlight=o.ref;break;case"start":this.startNewLine(o.x,o.y,o.id,o.tableID,o.refs);break;case"end":this.endLine(o.id,o.tableID,o.refs);break;default:console.warn(`Invalid 'canvas' message type: ${o.type}`);break}}drawLine(o,t,e,i,n,x,l,c="one-one"){let h=(o+e)*.5,s=(t+i)*.5;if(this.ctx.beginPath(),this.ctx.moveTo(o,t),n==="left"&&x==="left"){o<=e?h=o-16:h=e-16;let T,a;switch(Math.abs(t-i)>=32?(e<=o?(T=i>=t?-8:8,a=e<=o?8:-8):(T=i>=t?-8:8,a=e<=o?-8:8),this.ctx.lineTo(h+a,t),this.ctx.arcTo(h,t,h,t-T,8),this.ctx.lineTo(h,i+T),this.ctx.arcTo(h,i,h+a,i,8),this.ctx.lineTo(e,i)):(this.ctx.lineTo(h,t),this.ctx.lineTo(h,i),this.ctx.lineTo(e,i)),c){case"one-one":break;case"one-many":this.ctx.moveTo(e,i-8),this.ctx.lineTo(e-8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e-8,i);break;case"many-one":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-8,t);break;case"many-many":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(e,i-8),this.ctx.lineTo(e-8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e-8,i);break}this.hitCTX.fillStyle=l,this.hitCTX.fillRect(h,t-8,Math.abs(o-h),16),this.hitCTX.fillRect(h,i-8,Math.abs(e-h),16),i<t?this.hitCTX.fillRect(h-8,i-8,16,Math.abs(t-i)+16):this.hitCTX.fillRect(h-8,t-8,16,Math.abs(t-i)+16)}else if(n==="right"&&x==="right"){if(o>=e?h=o+16:h=e+16,Math.abs(t-i)>=32){let T,a;e<=o?(T=i>=t?-8:8,a=e<=o?-8:8):(T=i>=t?-8:8,a=e<=o?8:-8),this.ctx.lineTo(h+a,t),this.ctx.arcTo(h,t,h,t-T,8),this.ctx.lineTo(h,i+T),this.ctx.arcTo(h,i,h+a,i,8),this.ctx.lineTo(e,i)}else this.ctx.lineTo(h,t),this.ctx.lineTo(h,i),this.ctx.lineTo(e,i);switch(c){case"one-one":break;case"one-many":this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+8,i);break;case"many-one":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o+8,t);break;case"many-many":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+8,i);break}this.hitCTX.fillStyle=l,this.hitCTX.fillRect(o,t-8,Math.abs(o-h),16),this.hitCTX.fillRect(e,i-8,Math.abs(e-h),16),i<t?this.hitCTX.fillRect(h-8,i-8,16,Math.abs(t-i)+16):this.hitCTX.fillRect(h-8,t-8,16,Math.abs(t-i)+16)}else if(n==="left"&&x==="right"&&o<=e){switch(o<=e?h=o-16:h=e-16,t<=i?(this.ctx.lineTo(h+8,t),this.ctx.arcTo(h,t,h,t+8,8),this.ctx.lineTo(h,s-8),this.ctx.arcTo(h,s,h+8,s,8),this.ctx.lineTo(e+8,s),this.ctx.arcTo(e+16,s,e+16,s+8,8),this.ctx.lineTo(e+16,i-8),this.ctx.arcTo(e+16,i,e-8,i,8),this.ctx.lineTo(e,i)):(this.ctx.lineTo(h+8,t),this.ctx.arcTo(h,t,h,t-8,8),this.ctx.lineTo(h,s+8),this.ctx.arcTo(h,s,h+8,s,8),this.ctx.lineTo(e+8,s),this.ctx.arcTo(e+16,s,e+16,s-8,8),this.ctx.lineTo(e+16,i+8),this.ctx.arcTo(e+16,i,e-8,i,8),this.ctx.lineTo(e,i)),c){case"one-one":break;case"one-many":this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+8,i);break;case"many-one":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-8,t);break;case"many-many":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-8,t),this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+8,i);break}this.hitCTX.fillStyle=l,this.hitCTX.fillRect(o-16,t-8,16,16),this.hitCTX.fillRect(e,i-8,16,16),this.hitCTX.fillRect(o-24,s-8,Math.abs(e-o)+32,16),i<t?(this.hitCTX.fillRect(h-8,s-8,16,Math.abs(t-i)*.5+16),this.hitCTX.fillRect(e+8,i-8,16,Math.abs(t-i)*.5+16)):(this.hitCTX.fillRect(o-32,t-8,16,Math.abs(t-i)*.5+16),this.hitCTX.fillRect(e+8,s-8,16,Math.abs(t-i)*.5+16))}else if(n==="right"&&x==="left"&&e<=o){switch(o>=e?h=o+16:h=e+16,t<=i?(this.ctx.lineTo(h-8,t),this.ctx.arcTo(h,t,h,t+8,8),this.ctx.lineTo(h,s-8),this.ctx.arcTo(h,s,h-8,s,8),this.ctx.lineTo(e-8,s),this.ctx.arcTo(e-16,s,e-16,s+8,8),this.ctx.lineTo(e-16,i-8),this.ctx.arcTo(e-16,i,e+8,i,8),this.ctx.lineTo(e,i)):(this.ctx.lineTo(h-8,t),this.ctx.arcTo(h,t,h,t-8,8),this.ctx.lineTo(h,s+8),this.ctx.arcTo(h,s,h-8,s,8),this.ctx.lineTo(e-8,s),this.ctx.arcTo(e-16,s,e-16,s-8,8),this.ctx.lineTo(e-16,i+8),this.ctx.arcTo(e-16,i,e+8,i,8),this.ctx.lineTo(e,i)),c){case"one-one":break;case"one-many":this.ctx.moveTo(e,i-8),this.ctx.lineTo(e-8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e-8,i);break;case"many-one":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o+8,t);break;case"many-many":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o+8,t),this.ctx.moveTo(e,i-8),this.ctx.lineTo(e-8,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e-8,i);break}this.hitCTX.fillStyle=l,this.hitCTX.fillRect(o,t-8,Math.abs(o-h),16),this.hitCTX.fillRect(e-16,i-8,Math.abs(e-h),16),this.hitCTX.fillRect(e-24,s-8,Math.abs(e-o)+32,16),i<t?(this.hitCTX.fillRect(h-8,s-8,16,Math.abs(t-i)*.5+16),this.hitCTX.fillRect(e-24,i-8,16,Math.abs(t-i)*.5+16)):(this.hitCTX.fillRect(h-8,t-8,16,Math.abs(t-i)*.5+16),this.hitCTX.fillRect(e-24,s-8,16,Math.abs(t-i)*.5+16))}else if(n==="right"&&x==="left"||n==="left"&&x==="right"){const T=i>=t?-8:8,a=e<=o?8:-8;switch(Math.abs(t-i)>=16&&Math.abs(o-e)>=16?(this.ctx.lineTo(h+a,t),this.ctx.arcTo(h,t,h,t+T*-1,8),this.ctx.lineTo(h,i+T),this.ctx.arcTo(h,i,h+a*-1,i,8),this.ctx.lineTo(e,i)):(this.ctx.lineTo(h,t),this.ctx.lineTo(h,i),this.ctx.lineTo(e,i)),c){case"one-one":break;case"one-many":this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+a,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+a,i);break;case"many-one":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-a,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-a,t);break;case"many-many":this.ctx.moveTo(o,t-8),this.ctx.lineTo(o-a,t),this.ctx.moveTo(o,t+8),this.ctx.lineTo(o-a,t),this.ctx.moveTo(e,i-8),this.ctx.lineTo(e+a,i),this.ctx.moveTo(e,i+8),this.ctx.lineTo(e+a,i);break}this.hitCTX.fillStyle=l,n==="right"&&x==="left"?(this.hitCTX.fillRect(o,t-8,Math.abs(o-h),16),this.hitCTX.fillRect(h,i-8,Math.abs(e-h),16),i<t?this.hitCTX.fillRect(h+a,i-8,16,Math.abs(t-i)+16):this.hitCTX.fillRect(h+a,t-8,16,Math.abs(t-i)+16)):(this.hitCTX.fillRect(e,i-8,Math.abs(e-h),16),this.hitCTX.fillRect(h,t-8,Math.abs(o-h),16),i<t?this.hitCTX.fillRect(h-8,i-8,16,Math.abs(t-i)+16):this.hitCTX.fillRect(h-8,t-8,16,Math.abs(t-i)+16))}else this.ctx.lineTo(e,i),console.warn(`missing type: ${n} ${x}`);this.ctx.stroke()}getElement(o){return document.body.querySelector(o)}async eventLoop(){if(!this.isDirty){window.requestAnimationFrame(this.eventLoop.bind(this));return}this.lines=f.getConnections();const o=[];this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height),this.hitCTX.clearRect(0,0,this.canvas.width,this.canvas.height);const t=this.canvas.getBoundingClientRect();this.ctx.lineWidth=1,this.isDirty=!1;try{if(this.openStartPoint!==null){this.ctx.strokeStyle=g;const n=this.getElement(`[data-uid="${this.openStartPoint.id}"]`).getBoundingClientRect(),{x,y:l}=this.mousePos;let c,h;x<=n.x?(c="left",h="left"):x>=n.x&&x<=n.x+n.width?x>=n.x+n.width*.5?(c="right",h="right"):(c="left",h="left"):x>n.x+n.width?(c="right",h="left"):(c="left",h="right");const T=this.getElement(`[data-uid="${this.openStartPoint.id}_${c}"]`).getBoundingClientRect(),a=T.x-t.x+T.width*.5,m=T.y-t.y+T.height*.5;this.drawLine(a,m,x-t.x,l-t.y,c,h,"#000000")}}catch(i){console.error("Failed to draw temp line.",i)}const e=[];for(let i=0;i<this.lines.length;i++)try{const n=this.getElement(`[data-uid="${this.lines[i].startNodeID}"]`),x=this.getElement(`[data-uid="${this.lines[i].endNodeID}"]`);this.lines[i].uid in this.colorRef||(this.colorRef[this.lines[i].color]=this.lines[i].uid);const l=n.getBoundingClientRect(),c=x.getBoundingClientRect();let h,s;n.tagName==="NODE-COMPONENT"&&x.tagName==="NODE-COMPONENT"?(c.x+c.width<=l.x?h="left":c.x>=l.x+l.width?h="right":c.y<=l.y+l.height*.5?h="top":h="bottom",c.x>=l.x+l.width?s="left":c.x+c.width<=l.x?s="right":c.y<=l.y+l.height*.5?s="bottom":s="top"):n.tagName==="NODE-COMPONENT"&&x.tagName==="COLUMN-COMPONENT"?c.x>=l.x+l.width&&Math.abs(c.x-(l.width+l.x))>=64?(h="right",s="left"):c.x+c.width<=l.x&&Math.abs(c.x+c.width-l.x)>=64?(h="left",s="right"):c.x+c.width*.5>=l.x+l.width*.5?(s="left",h="left"):(s="right",h="right"):n.tagName==="COLUMN-COMPONENT"&&x.tagName==="NODE-COMPONENT"?c.x>=l.x+l.width?(h="right",Math.abs(l.y-c.y)>=64?c.y<=l.y+l.height*.5?s="bottom":s="top":s="left"):c.x<=l.x?(h="left",c.x+32<l.x?Math.abs(l.y-c.y)>=64?c.y<=l.y+l.height*.5?s="bottom":s="top":s="right":s="left"):c.x<=l.x+l.width*.5?(h="left",s="left"):(h="right",s="right"):n.tagName==="COLUMN-COMPONENT"&&x.tagName==="COLUMN-COMPONENT"?c.x>=l.x&&c.x<=l.x+l.width?c.x>l.x+l.width*.5?(h="right",s="left"):(h="right",s="right"):l.x>=c.x&&l.x<=c.x+c.width?l.x>c.x+c.width*.5?(h="left",s="right"):(h="left",s="left"):l.x+l.width>=c.x?(h="left",s="right"):(h="right",s="left"):(h="NO-CONNECTION",s="NO-CONNECTION");const T=this.getElement(`[data-uid="${this.lines[i].startNodeID}_${h}"]`),a=this.getElement(`[data-uid="${this.lines[i].endNodeID}_${s}"]`),m=T.getBoundingClientRect(),v=a.getBoundingClientRect(),C={x:m.x+m.width*.5-t.x,y:m.y+m.height*.5-t.y},y={x:v.x+v.width*.5-t.x,y:v.y+v.height*.5-t.y};e.push({start:C,end:y,uid:this.lines[i].uid,startSide:h,endSide:s,refs:this.lines[i].refs,color:this.lines[i].color,type:this.lines[i].type})}catch{console.error("Failed to get line data",this.lines[i])}for(let i=0;i<e.length;i++){const n=e[i];this.forceHighlight!==null&&n.refs.includes(this.forceHighlight)&&o.push(n.uid)}this.activeLineId!==null&&o.push(this.activeLineId);for(let i=0;i<e.length;i++){const n=e[i];if(!o.includes(n.uid)){const{x,y:l}=n.start,{x:c,y:h}=n.end;this.ctx.strokeStyle=g,this.drawLine(x,l,c,h,n.startSide,n.endSide,n.color,n.type)}}for(let i=0;i<e.length;i++){const n=e[i];if(o.includes(n.uid)){const{x,y:l}=n.start,{x:c,y:h}=n.end;this.ctx.strokeStyle=L,this.drawLine(x,l,c,h,n.startSide,n.endSide,n.color,n.type)}}window.requestAnimationFrame(this.eventLoop.bind(this))}}r.bind("canvas-component",u);export{u as default};
