import { send } from "~controllers/ws";
import CursorComponent from "~components/cursor-component/cursor-component";

interface Cursor {
    x: number,
    y: number,
    uid: string,
    name: string,
}

class CursorController {
    private cursors: Array<Cursor>;
      
    constructor(){
        this.cursors = [];
        window.addEventListener("mousemove", this.handleMouseMove);
        this.render();
    }
    
    private handleMouseMove:EventListener = (e:MouseEvent) => {
        send("mouse-move", {
            x: e.clientX,
            y: e.clientY,
        });
    }
      
    public addCursor(cursor:Cursor){
        this.cursors.push(cursor);  
    }
      
    public removeCursor(uid:string){
        for (let i = 0; i < this.cursors.length; i++){
            if (this.cursors[i].uid === uid){
                const cursor = document.body.querySelector(`cursor-component[data-uid="${this.cursors[i].uid}"]`);
                if (cursor){
                    cursor.remove();                                
                }
                this.cursors.splice(i, 1);
                break;
            }
        }
    }
      
    public moveCursor({x, y, uid}){
          for (let i = 0; i < this.cursors.length; i++){
              if (this.cursors[i].uid === uid){
                  this.cursors[i].x = x;
                  this.cursors[i].y = y;
                  break;
              }
          }
    }
                                                  
    private render(){
        for (let i = 0; i < this.cursors.length; i++){
            const cursor = document.body.querySelector(`cursor-component[data-uid="${this.cursors[i].uid}"]`) || new CursorComponent(this.cursors[i]);
            if (!cursor.isConnected){
                document.body.appendChild(cursor);
            }
            console.log("render");
            cursor.style.transform = `translate(${this.cursors[i].x}px, ${this.cursors[i].y}px);`;
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
}
const cursorController = new CursorController();
export default cursorController;
