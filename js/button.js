import{html as e,render as n}from"./lit-html.js";import{unsafeHTML as r}from"./unsafe-html.js";import a from"./component.js";import i from"./env.js";import{parseDataset as l}from"./general.js";i.css(["button"]);class s extends a{constructor(){super();this.handleClick=()=>{this.model.disabled||this.dispatchClick()};this.handleKeydown=t=>{if(t instanceof KeyboardEvent&&t.key.toLowerCase()===" "){if(t.stopImmediatePropagation(),this.model.disabled)return;this.classList.add("is-active")}};this.handleKeyup=t=>{if(t instanceof KeyboardEvent&&t.key.toLowerCase()===" "){if(t.stopImmediatePropagation(),this.model.disabled)return;this.classList.remove("is-active"),this.dispatchClick()}};this.model={label:null,kind:"solid",color:"grey",shape:"default",size:"default",icon:"",iconPosition:"left",disabled:!1,type:"button"}}static get observedAttributes(){return["data-label","data-icon","data-icon-position","data-kind","data-color","data-shape","data-size","data-disabled","data-type"]}async connected(){const t=l(this.dataset,this.model);this.set(t),this.addEventListener("keydown",this.handleKeydown),this.addEventListener("keyup",this.handleKeyup),this.addEventListener("click",this.handleClick)}renderIcon(){let t="";return this.model.icon.length?t=e`${r(this.model.icon)}`:t="",t}renderLabel(){let t="";return this.model.label!=null?t=e`<span>${this.model.label}</span>`:t="",t}dispatchClick(){this.dispatchEvent(new CustomEvent("action",{bubbles:!0,cancelable:!0}))}render(){const t=e` ${this.renderIcon()} ${this.renderLabel()} `;this.setAttribute("role","button"),this.tabIndex=0,this.setAttribute("color",this.model.color),this.setAttribute("size",this.model.size),this.setAttribute("kind",this.model.kind),this.setAttribute("shape",this.model.shape),this.setAttribute("type",this.model.type),this.model.icon.length&&this.setAttribute("icon",this.model.iconPosition),this.setAttribute("sfx","button"),this.model.disabled?this.setAttribute("disabled","true"):this.removeAttribute("disabled"),n(t,this)}}i.bind("brixi-button",s);export{s as default};
