import{UUID as n}from"./uuid.js";import{publish as r}from"./pubsub.js";import{MYSQL_TYPES as d,POSTGRES_TYPES as g,SQLITE_TYPES as p,SQL_SERVER_TYPES as b}from"./column-types.js";import h from"./modals.js";import{html as y}from"./lit-html.js";import{COLORS as c,SHADES as u,COLOR_CODES as C}from"./colors.js";class S{constructor(){this.onSelect=t=>{const a=t.currentTarget.dataset.type;this.type=a,this.createDiagramCallback(a)};this.ID=n(),this.type=null,this.tableCount=0,this.diagram=null,this.createDiagramCallback=()=>{}}getRandomColor(){const t=this.getRandomInt(0,c.length-1),e=this.getRandomInt(0,u.length-1);return C[c[t]][u[e]]}getRandomInt(t,e){return t=Math.ceil(t),e=Math.floor(e),Math.floor(Math.random()*(e-t+1))+t}async createDiagram(){let t;await new Promise(i=>{this.createDiagramCallback=i,t=h.raw({view:y`
                    <div class="databases">
                        <button @mousedown=${this.onSelect} data-type="mysql">
                            <img src="/assets/mysql.png" alt="MySQL" />
                            <span>MySQL</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="postgresql">
                            <img src="/assets/postgresql.png" alt="PostgreSQL" />
                            <span>PostgreSQL</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="sqlite">
                            <img src="/assets/sqlite.png" alt="SQLite" />
                            <span>SQLite</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="mssql">
                            <img src="/assets/sql-server.png" alt="SQL Server" />
                            <span>SQL Server</span>
                        </button>
                    </div>
                `})}),t&&t.remove();const e=n();this.ID=e;const a={};switch(this.type){case"mysql":d.map(i=>{const s=n();a[s]={name:i,uid:s}});break;case"postgresql":g.map(i=>{const s=n();a[s]={name:i,uid:s}});break;case"sqlite":p.map(i=>{const s=n();a[s]={name:i,uid:s}});break;case"mssql":b.map(i=>{const s=n();a[s]={name:i,uid:s}});break;default:break}return this.diagram={version:1,fileName:`Untitled-${Date.now()}`,uid:e,timestamp:Date.now(),tables:{},columns:{},nodes:{},connections:{},types:a},this.diagram}async reset(){await this.createDiagram(),r("diagram",{type:"reset"})}export(){return[this.diagram,JSON.stringify(this.diagram)]}import(t){r("diagram",{type:"reset"}),this.diagram=JSON.parse(t),setTimeout(()=>{r("diagram",{type:"load"})},80)}setFileName(t){this.diagram.fileName=t}createTable(t,e){const a=n(),i={uid:a,name:`table_${++this.tableCount}`,color:this.getRandomColor(),x:t,y:e};this.diagram.tables[a]=i,this.createColumn(a,"id",!0)}createColumn(t,e="",a=!1){const i=n(),s={name:e,type:this.diagram.types[Object.keys(this.diagram.types)[0]].uid,isNullable:!1,isUnique:!1,isIndex:!1,isPrimaryKey:a,weight:0,uid:i,tableID:t};this.diagram.columns[i]=s}deleteColumn(t){Object.values(this.diagram.columns).filter(a=>a.tableID===this.diagram.columns[t].tableID).length-1===0?this.deleteTable(this.diagram.columns[t].tableID):(this.deleteElement(t),delete this.diagram.columns[t]),r("canvas",{type:"reload"})}getColumnsByTable(t){const e=Object.values(this.diagram.columns).filter(a=>a.tableID===t);return e.sort((a,i)=>a.weight-i.weight),e}getColumn(t){return this.diagram.columns[t]}reorderColumns(t){t.map((e,a)=>{this.diagram.columns[e.uid].weight=a})}moveColumn(t,e){this.diagram.columns[t].tableID=e}renameColumn(t,e){this.diagram.columns[t].name=e}changeColumnType(t,e){this.diagram.columns[t].type=e}changeColumnNullable(t,e){this.diagram.columns[t].isNullable=e}changeColumnUnique(t,e){this.diagram.columns[t].isUnique=e}changeColumnIndex(t,e){this.diagram.columns[t].isIndex=e}changeColumnPrimaryKey(t,e){this.diagram.columns[t].isPrimaryKey=e}renameTable(t,e){this.diagram.tables[t].name=e}updateTablePosition(t,e,a){this.diagram.tables[t].x=e,this.diagram.tables[t].y=a}cloneTable(t){this.tableCount++;const e=this.diagram.tables[t],a=JSON.parse(JSON.stringify(e)),i=n();a.uid=i,a.name=`${e.name}_copy`,a.x+=100,a.y+=100,a.color=this.getRandomColor(),this.diagram.tables[i]=a,Object.values(this.diagram.columns).filter(o=>o.tableID===e.uid).map(o=>{const m=n(),l=JSON.parse(JSON.stringify(o));l.uid=m,l.tableID=i,this.diagram.columns[m]=l}),r("diagram",{type:"load"})}async createNode(t,e){const a=n(),i={uid:a,text:"New node",x:t,y:e,color:"grey",icon:"function"};this.diagram.nodes[a]=i}createConnection(t,e,a){const i=n(),s={uid:i,startNodeID:t,endNodeID:e,type:"one-one",refs:a,color:this.randomRGBColor()};this.diagram.connections[i]=s}getConnections(){return Object.values(this.diagram.connections)}updateConnectionType(t,e){this.diagram.connections[t].type=e}deleteConnection(t){delete this.diagram.connections[t]}getTypes(){return Object.values(this.diagram.types)}updateType(t,e){this.diagram.types[t].name=e}deleteType(t){delete this.diagram.types[t];for(const e in this.diagram.columns)this.diagram.columns[e].type===t&&(this.diagram.columns[e].type=Object.keys(this.diagram.types)[0])}createType(t=""){const e=n(),a={name:t,uid:e};this.diagram.types[e]=a}getTables(){return this.diagram?Object.values(this.diagram.tables):[]}getTable(t){return this.diagram.tables[t]}getNodes(){return[]}deleteTable(t){delete this.diagram.tables[t],this.deleteElement(t),Object.keys(this.diagram.columns).filter(a=>this.diagram.columns[a].tableID===t).map(a=>{delete this.diagram.columns[a]}),r("canvas",{type:"reload"})}deleteNode(t){r("canvas",{type:"reload"})}deleteElement(t){document.body.querySelector(`[data-uid="${t}"]`)?.remove()}randomRGBColor(){return`rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`}}const T=new S;var j=T;export{j as default};
