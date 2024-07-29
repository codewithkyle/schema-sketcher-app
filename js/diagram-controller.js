import{UUID as n}from"./uuid.js";import{publish as i}from"./pubsub.js";import{MYSQL_TYPES as u,POSTGRES_TYPES as g,SQLITE_TYPES as p,SQL_SERVER_TYPES as y}from"./column-types.js";import b from"./modals.js";import{html as h}from"./lit-html.js";import{COLORS as d,SHADES as c,COLOR_CODES as C}from"./colors.js";class S{constructor(){this.onSelect=t=>{const a=t.currentTarget.dataset.type;this.type=a,this.createDiagramCallback(a)};this.ID=n(),this.type=null,this.tableCount=0,this.diagram=null,this.createDiagramCallback=()=>{}}getRandomColor(){const t=this.getRandomInt(0,d.length-1),e=this.getRandomInt(0,c.length-1);return C[d[t]][c[e]]}getRandomInt(t,e){return t=Math.ceil(t),e=Math.floor(e),Math.floor(Math.random()*(e-t+1))+t}async createDiagram(){let t;await new Promise(r=>{this.createDiagramCallback=r,t=b.raw({view:h`
                    <h1 class="block text-center font-sm font-grey-500 mt-1.5">Select a database to begin</h1>
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
                `})}),t&&t.remove();const e=n();this.ID=e;const a={};switch(this.type){case"mysql":u.map(r=>{const s=n();a[s]={name:r,uid:s}});break;case"postgresql":g.map(r=>{const s=n();a[s]={name:r,uid:s}});break;case"sqlite":p.map(r=>{const s=n();a[s]={name:r,uid:s}});break;case"mssql":y.map(r=>{const s=n();a[s]={name:r,uid:s}});break;default:break}return this.diagram={version:1,fileName:`Untitled-${Date.now()}`,uid:e,timestamp:Date.now(),tables:{},columns:{},nodes:{},connections:{},types:a},this.diagram}async reset(){await this.createDiagram(),i("diagram",{type:"reset"})}export(){return[this.diagram,JSON.stringify(this.diagram)]}import(t){i("diagram",{type:"reset"}),this.diagram=JSON.parse(t),setTimeout(()=>{i("diagram",{type:"load"})},80)}setFileName(t){this.diagram.fileName=t}createTable(t,e){const a=n(),r={uid:a,name:`table_${++this.tableCount}`,color:this.getRandomColor(),x:t,y:e};this.diagram.tables[a]=r,this.createColumn(a,"id",!0),i("diagram",{type:"dirty"})}createColumn(t,e="",a=!1){const r=n(),s={name:e,type:this.diagram.types[Object.keys(this.diagram.types)[0]].uid,isNullable:!1,isUnique:!1,isIndex:!1,isPrimaryKey:a,weight:0,uid:r,tableID:t};this.diagram.columns[r]=s,i("diagram",{type:"dirty"})}deleteColumn(t){Object.values(this.diagram.columns).filter(a=>a.tableID===this.diagram.columns[t].tableID).length-1===0?this.deleteTable(this.diagram.columns[t].tableID):(this.deleteElement(t),delete this.diagram.columns[t]),i("canvas",{type:"reload"}),i("diagram",{type:"dirty"})}getColumnsByTable(t){const e=Object.values(this.diagram.columns).filter(a=>a.tableID===t);return e.sort((a,r)=>a.weight-r.weight),e}getColumn(t){return this.diagram.columns[t]}reorderColumns(t){t.map((e,a)=>{this.diagram.columns[e.uid].weight=a}),i("diagram",{type:"dirty"})}moveColumn(t,e){this.diagram.columns[t].tableID=e,i("diagram",{type:"dirty"})}renameColumn(t,e){this.diagram.columns[t].name=e,i("diagram",{type:"dirty"})}changeColumnType(t,e){this.diagram.columns[t].type=e,i("diagram",{type:"dirty"})}changeColumnNullable(t,e){this.diagram.columns[t].isNullable=e,i("diagram",{type:"dirty"})}changeColumnUnique(t,e){this.diagram.columns[t].isUnique=e,i("diagram",{type:"dirty"})}changeColumnIndex(t,e){this.diagram.columns[t].isIndex=e,i("diagram",{type:"dirty"})}changeColumnPrimaryKey(t,e){this.diagram.columns[t].isPrimaryKey=e,i("diagram",{type:"dirty"})}renameTable(t,e){this.diagram.tables[t].name=e,i("diagram",{type:"dirty"})}updateTablePosition(t,e,a){this.diagram.tables[t].x=e,this.diagram.tables[t].y=a,i("diagram",{type:"dirty"})}changeTableColor(t,e){this.diagram.tables[t].color=e,i("diagram",{type:"dirty"})}cloneTable(t){this.tableCount++;const e=this.diagram.tables[t],a=JSON.parse(JSON.stringify(e)),r=n();a.uid=r,a.name=`${e.name}_copy`,a.x+=100,a.y+=100,a.color=this.getRandomColor(),this.diagram.tables[r]=a,Object.values(this.diagram.columns).filter(o=>o.tableID===e.uid).map(o=>{const m=n(),l=JSON.parse(JSON.stringify(o));l.uid=m,l.tableID=r,this.diagram.columns[m]=l}),i("diagram",{type:"load"}),i("diagram",{type:"dirty"})}async createNode(t,e){const a=n(),r={uid:a,text:"New node",x:t,y:e,color:"grey",icon:"function"};this.diagram.nodes[a]=r}createConnection(t,e,a){const r=n(),s={uid:r,startNodeID:t,endNodeID:e,type:"one-one",refs:a,color:this.randomRGBColor()};this.diagram.connections[r]=s,i("diagram",{type:"dirty"})}getConnections(){return Object.values(this.diagram.connections)}updateConnectionType(t,e){this.diagram.connections[t].type=e,i("diagram",{type:"dirty"})}deleteConnection(t){delete this.diagram.connections[t],i("diagram",{type:"dirty"})}getTypes(){return Object.values(this.diagram.types)}updateType(t,e){this.diagram.types[t].name=e,i("diagram",{type:"dirty"})}deleteType(t){delete this.diagram.types[t];for(const e in this.diagram.columns)this.diagram.columns[e].type===t&&(this.diagram.columns[e].type=Object.keys(this.diagram.types)[0]);i("diagram",{type:"dirty"})}createType(t=""){const e=n(),a={name:t,uid:e};this.diagram.types[e]=a,i("diagram",{type:"dirty"})}getTables(){return this.diagram?Object.values(this.diagram.tables):[]}getTable(t){return this.diagram.tables[t]}getNodes(){return[]}deleteTable(t){delete this.diagram.tables[t],this.deleteElement(t),Object.keys(this.diagram.columns).filter(a=>this.diagram.columns[a].tableID===t).map(a=>{delete this.diagram.columns[a]}),i("canvas",{type:"reload"}),i("diagram",{type:"dirty"})}deleteNode(t){i("canvas",{type:"reload"})}deleteElement(t){document.body.querySelector(`[data-uid="${t}"]`)?.remove()}randomRGBColor(){return`rgb(${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)},${Math.floor(Math.random()*255)})`}}const T=new S;var j=T;export{j as default};