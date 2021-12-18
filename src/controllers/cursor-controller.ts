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
        const anchor = document.body.querySelector(".js-anchor");
        if (anchor){
            const x = e.clientX;
            const y = e.clientY;
            const bounds = anchor.getBoundingClientRect();
            const moveX = x - bounds.x;
            const moveY = y - bounds.y;
            send("mouse-move", {
                x: moveX,
                y: moveY,
            });   
        }
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
      
    public moveCursor(cursor){
        const {x, y, uid, name} = cursor;
        let found = false;
          for (let i = 0; i < this.cursors.length; i++){
              if (this.cursors[i].uid === uid){
                  this.cursors[i].x = x;
                  this.cursors[i].y = y;
                  found = true;
                  break;
              }
          }
        if (!found){
            this.addCursor(cursor);
        }
    }
                                                  
    private render(){
        const anchor = document.body.querySelector(".js-anchor");
        if (anchor){
            for (let i = 0; i < this.cursors.length; i++){
                const cursor = document.body.querySelector(`cursor-component[data-uid="${this.cursors[i].uid}"]`) || new CursorComponent(this.cursors[i]);
                if (!cursor.isConnected){
                    anchor.appendChild(cursor);
                }
                cursor.move(this.cursors[i].x, this.cursors[i].y);
            }
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
}
const cursorController = new CursorController();
export default cursorController;
