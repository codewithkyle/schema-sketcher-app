import l from"./supercomponent.js";import{html as h,render as d}from"./lit-html.js";import"./main-menu.js";import a from"./diagram-controller.js";import r from"./env.js";import v from"./table-component.js";import"./editor-controls.js";import{createSubscription as u,publish as m,subscribe as p}from"./pubsub.js";import"./canvas-component.js";import f from"./context-menu.js";import M from"./modals.js";class c extends l{constructor(){super();this.handleKeyDown=e=>{if(e instanceof KeyboardEvent){const n=e.key;n===" "?(this.canMove=!0,this.setCursor("hand")):n==="Escape"&&document.activeElement?.blur()}};this.handleKeyUp=e=>{e instanceof KeyboardEvent&&e.key===" "&&(this.canMove=!1,this.setCursor("auto"))};this.handleScroll=e=>{const i=e.deltaY*-1*.001,o=this.querySelector(".anchor");let s=this.scale+i;s<.125?s=.125:s>1&&(s=1),o.style.transform=`matrix(${s}, 0, 0, ${s}, ${this.x}, ${this.y})`,this.scale=s,m("zoom",s)};this.handleMouseDown=e=>{e instanceof MouseEvent&&(this.canMove||this.forceMove)&&(this.isMoving=!0,this.setCursor("hand"))};this.handleMouseUp=e=>{e instanceof MouseEvent&&this.isMoving&&(this.isMoving=!1,this.setCursor("hand"))};this.handleMouseMove=e=>{if(e instanceof MouseEvent&&this.isMoving&&(this.canMove||this.forceMove)){const n=this.querySelector(".anchor");this.setCursor("grabbing");const t=this.x+e.movementX,i=this.y+e.movementY;n.style.transform=`matrix(${this.scale}, 0, 0, ${this.scale}, ${t}, ${i})`,this.x=t,this.y=i}};this.handleMove=e=>{e.detail?.isMoving?(this.isMoving=!0,this.forceMove=!0,this.setCursor("hand")):(this.isMoving=!1,this.forceMove=!1,this.setCursor("auto"))};this.handleContextMenu=e=>{if(e.preventDefault(),e instanceof MouseEvent){const n=e.clientX,t=e.clientY,o=this.querySelector(".anchor").getBoundingClientRect();this.placeX=n-o.x,this.placeY=t-o.y,document.body.querySelectorAll("brixi-context-menu").forEach(s=>s.remove()),new f({items:[{label:"Create table",callback:()=>{this.spawn("table")}},null,{label:"Save",hotkey:"Ctrl+S",callback:()=>{const s=document.querySelector("main-menu");s&&s.save()}},{label:"Reset",callback:()=>{M.dangerous({title:"Reset the canvas?",message:"This will remove all of your work and cannot be undone.",confirm:"Reset",cancel:"Cancel",callbacks:{confirm:()=>{a.reset()}}})}}],x:n,y:t})}};this.onScale=e=>{const n=this.querySelector(".anchor");let t=e.detail;t<.125?t=.125:t>1&&(t=1),n.style.transform=`matrix(${t}, 0, 0, ${t}, ${this.x}, ${this.y})`,this.scale=t};this.x=window.innerWidth/2,this.y=(window.innerHeight-64)/2,this.scale=1,this.isMoving=!1,this.forceMove=!1,u("zoom"),p("diagram",this.diagramInbox.bind(this))}async connected(){window.addEventListener("wheel",this.handleScroll,{passive:!0}),window.addEventListener("keydown",this.handleKeyDown),window.addEventListener("keyup",this.handleKeyUp),window.addEventListener("mousedown",this.handleMouseDown),window.addEventListener("mouseup",this.handleMouseUp),window.addEventListener("mousemove",this.handleMouseMove),this.addEventListener("zoom",this.onScale),this.addEventListener("move",this.handleMove),await r.css(["editor-page"]);const e=await a.createDiagram();this.uid=e.uid,this.render()}diagramInbox({type:e,data:n}){switch(e){case"load":this.render();break;default:break}}setCursor(e){this.querySelector("canvas-component").setAttribute("cursor",e)}spawn(e){switch(e){case"table":a.createTable(this.placeX,this.placeY),this.render();break;default:break}}getCursorType(){let e="auto";return this.isMoving?e="grab":this.forceMove&&(e="hand"),e}async render(){const e=h`
            <canvas-component @contextmenu=${this.handleContextMenu}></canvas-component>
            <div class="anchor" style="transform: ${`matrix(${this.scale}, 0, 0, ${this.scale}, ${this.x}, ${this.y})`}"></div>
            <main-menu></main-menu>
            <editor-controls @move=${this.handleMove} data-is-moving="${this.isMoving}" data-scale="${this.scale}"></editor-controls>
        `;d(e,this);const n=this.querySelector(".anchor");a.getTables().map(t=>{const i=n.querySelector(`[data-uid="${t.uid}"]`)||new v;i.isConnected||(i.dataset.uid=t.uid,n.appendChild(i))})}}r.bind("editor-page",c);export{c as default};
