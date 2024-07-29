import{html as d,render as u}from"./lit-html.js";import c from"./column-component.js";import l from"./env.js";import{publish as m,subscribe as r}from"./pubsub.js";import i from"./diagram-controller.js";import p from"./component.js";import{parseDataset as v}from"./general.js";import"./overflow-button.js";import b from"./sortablejs.js";import f from"./context-menu.js";class h extends p{constructor(){super();this.handleMouseEnter=e=>{e.preventDefault(),e.stopImmediatePropagation(),m("canvas",{type:"highlight",ref:this.model.uid})};this.handleMouseLeave=e=>{e.preventDefault(),e.stopImmediatePropagation(),m("canvas",{type:"clear-highlight",ref:this.model.uid})};this.mouseDown=e=>{this.isMoving=!0,e instanceof MouseEvent?(this.pos3=e.clientX,this.pos4=e.clientY):e instanceof TouchEvent&&(this.pos3=e.touches[0].clientX,this.pos4=e.touches[0].clientY)};this.mouseUp=e=>{e instanceof MouseEvent&&this.isMoving&&(this.isMoving=!1,this.wasMoved=!1)};this.mouseMove=e=>{if(this.isMoving){if(e.preventDefault(),e.stopImmediatePropagation(),e instanceof MouseEvent)this.pos1=this.pos3-e.clientX,this.pos2=this.pos4-e.clientY,this.pos3=e.clientX,this.pos4=e.clientY;else if(e instanceof TouchEvent)this.pos1=this.pos3-e.touches[0].clientX,this.pos2=this.pos4-e.touches[0].clientY,this.pos3=e.touches[0].clientX,this.pos4=e.touches[0].clientY;else return;this.wasMoved=!0;let o=Math.round(parseInt(this.dataset.left)-this.pos1/this.zoom),s=Math.round(parseInt(this.dataset.top)-this.pos2/this.zoom);this.move(o,s)}};this.handleKeyboard=e=>{if(e instanceof KeyboardEvent&&document.activeElement===this){e.preventDefault();let o=!1,s=!1,t=0;switch(e.key){case"ArrowUp":s=!0,t=-1;break;case"ArrowDown":s=!0,t=1;break;case"ArrowLeft":o=!0,t=-1;break;case"ArrowRight":o=!0,t=1;break;case"Delete":i.deleteTable(this.model.uid),this.remove();break;case"d":(e.ctrlKey||e.metaKey)&&i.cloneTable(this.model.uid);break;default:break}if(e.shiftKey&&(t*=10),o){const n=parseInt(this.dataset.left)+t,a=parseInt(this.dataset.top);this.wasMoved=!0,this.move(n,a),this.pos1=n,this.pos2=a}else if(s){const n=parseInt(this.dataset.left),a=parseInt(this.dataset.top)+t;this.wasMoved=!0,this.move(n,a),this.pos1=n,this.pos2=a}}};this.renameTable=e=>{document.activeElement?.blur();const o=prompt(`New name for table ${this.model.name}?`);o.length&&(this.set({name:o}),i.renameTable(this.model.uid,o))};this.handleContextMenu=e=>{if(e.preventDefault(),e instanceof MouseEvent){const o=e.clientX,s=e.clientY;document.body.querySelectorAll("brixi-context-menu").forEach(t=>t.remove()),new f({items:[{label:"Rename",callback:()=>{const t=prompt(`New name for table ${this.model.name}?`);t.length&&(this.set({name:t}),i.renameTable(this.model.uid,t))}},{label:"Duplicate",hotkey:"Ctrl+d",callback:()=>{i.cloneTable(this.model.uid)}},{label:"Add column",callback:()=>{i.createColumn(this.model.uid),this.render(),this.focusLastColumn()}},{label:"Change color",callback:()=>{const t=document.createElement("input");t.type="color",t.value=this.model.color,t.onchange=n=>{this.set({color:t.value}),i.changeTableColor(this.model.uid,t.value)},t.click()}},null,{label:"Delete",hotkey:"delete",callback:()=>{i.deleteTable(this.model.uid),this.remove()}}],x:o,y:s})}};this.firstRender=!0,this.zoom=1,this.wasMoved=!1,this.pos1=0,this.pos2=0,this.pos3=0,this.pos4=0,this.isMoving=!1,this.model={uid:"",name:"",color:"",x:0,y:0},r("move",this.moveInbox.bind(this)),r("zoom",this.zoomInbox.bind(this)),r("diagram",this.diagramInbox.bind(this))}diagramInbox({type:e,data:o}){switch(e){case"reset":this.remove();break;default:break}}static get observedAttributes(){return["data-uid"]}zoomInbox(e){this.zoom=e}moveInbox({x:e,y:o,uid:s}){s===this.model.uid&&this.move(e,o)}async connected(){this.tabIndex=0,this.setAttribute("aria-label",`use arrow keys to nudge table ${this.model.name}`),window.addEventListener("keydown",this.handleKeyboard,{passive:!1,capture:!0}),window.addEventListener("mousemove",this.mouseMove,{passive:!1,capture:!0}),window.addEventListener("mouseup",this.mouseUp,{passive:!0,capture:!0}),await l.css(["table-component","overflow-menu"]);const e=v(this.dataset,this.model),o=i.getTable(e.uid);this.pos1=o.x,this.pos2=o.y,this.dataset.left=`${this.pos1}`,this.dataset.top=`${this.pos2}`,this.firstRender=!0,this.set(o)}move(e,o){this.style.transform=`translate(${e}px, ${o}px)`,this.dataset.top=`${o}`,this.dataset.left=`${e}`,i.updateTablePosition(this.model.uid,e,o)}focusLastColumn(){setTimeout(()=>{const e=this.querySelector("column-component:last-of-type input");e&&(document.activeElement?.blur(),e.focus())},80)}async render(){this.style.transform=`translate(${this.dataset.left}px, ${this.dataset.top}px)`;const e=d`
            <header style="border-top-color: ${this.model.color};" @mousedown=${this.mouseDown} @mouseenter=${this.handleMouseEnter} @mouseleave=${this.handleMouseLeave} @contextmenu=${this.handleContextMenu}>
            <h4 @dblclick=${this.renameTable} title="${this.model.name}">${this.model.name}</h4>
            </header>
            <columns-container></columns-container>
        `;u(e,this),this.firstRender&&(this.firstRender=!1,new b(this.querySelector("columns-container"),{animation:150,group:"columns",ghostClass:"is-disabled",onUpdate:s=>{let t=i.getColumnsByTable(this.model.uid);const n=t.splice(s.oldIndex,1)[0];t.splice(s.newIndex,0,n),i.reorderColumns(t)},onAdd:s=>{i.moveColumn(s.item.dataset.uid,this.model.uid),s.item.updateData()},onRemove:s=>{Array.from(this.querySelectorAll("column-component")).length===0&&(i.deleteTable(this.model.uid),this.remove())}}));const o=this.querySelector("columns-container");i.getColumnsByTable(this.model.uid).map(s=>{const t=o.querySelector(`column-component[data-uid="${s.uid}"]`)||new c;t.isConnected||(t.dataset.uid=s.uid,o.appendChild(t))})}}l.bind("table-component",h);export{h as default};
