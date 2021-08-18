import { css, mount } from "~controllers/env";
import { createSubscription, subscribe, unsubscribe } from "~lib/pubsub";
import type { Point } from "~types/diagram";
import { v4 as uuid } from "uuid";
import debounce from "../../utils/debounce";

const LINE_COLOUR = "#9CA3AF";
const LINE_HOVER_COLOUR = "#EC4899";

interface StartPoint extends Point {
    id: string,
    tableID: string,
}

class Line {
    public start: string;
    public end: string;
    public uid: string;
    
    constructor(start:string, end:string, uid:string){
        this.start = start;
        this.end = end;
        this.uid = uid;
    }
}

export default class CanvasComponent extends HTMLElement{
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private w: number;
    private h: number;
    private oldTime: number;
    private lines:Array<Line>;
    private highlightedLines:Array<string>;
    private openStartPoint:StartPoint;
    private mousePos:Point;
    private ticketID: string;

    constructor(){
        super();
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.highlightedLines = [];
        this.lines = [];
        this.openStartPoint = null;
        this.mousePos = null;
        css(["canvas-component"]);
        createSubscription("canvas");
        this.ticketID = subscribe("canvas", this.inbox.bind(this));
    }

    connectedCallback(){
        this.canvas = this.querySelector("canvas") || document.createElement("canvas");
            if (!this.canvas.isConnected){
                this.appendChild(this.canvas);
            }
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight - 64;
            this.ctx = this.canvas.getContext("2d");
            window.addEventListener("mousemove", this.handleMouseMove);
            window.addEventListener("mouseup", this.endMouseMove);
            window.addEventListener("resize", debounce(()=>{
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight - 64;
            }, 300));
            this.oldTime = performance.now();
            this.eventLoop();   
    }

    disconnectedCallback(){
        this.eventLoop = async ()=>{};
        unsubscribe(this.ticketID);
        window.removeEventListener("mousemove", this.handleMouseMove);
        window.removeEventListener("mouseup", this.endMouseMove);
    }

    private endMouseMove:EventListener = (e:MouseEvent) => {
        this.openStartPoint = null;
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        this.mousePos = {
            x: e.clientX,
            y: e.clientY,
        };
    }

    private startNewLine(x:number, y:number, id:string, tableID:string){
        this.openStartPoint = {
            x: x,
            y: y,
            id: id,
            tableID: tableID,
        };
        this.mousePos = {
            x: x,
            y: y,
        };
    }

    private endLine(id:string, tableID:string){
        if (this.openStartPoint !== null && id !== this.openStartPoint.id && tableID !== this.openStartPoint.tableID){
            this.lines.push({
                start: this.openStartPoint.id,
                end: id,
                uid: uuid(),
            });
            this.openStartPoint = null;
        }
    }

    private inbox(e){
        switch(e.type){
            case "start":
                this.startNewLine(e.x, e.y, e.id, e.tableID);
                break;
            case "end":
                this.endLine(e.id, e.tableID);
                break;
            default:
                console.warn(`Invalid 'canvas' message type: ${e.type}`);
                break;
        }
    }

    private drawLine(startX, startY, endX, endY, startSide, endSide){
        let centerX = (startX + endX) / 2;
        let centerY = (startY + endY) / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        if (startSide === "left" && endSide === "left"){
            if (startX <= endX){
                centerX = startX - 16;
            }
            else {
                centerX = endX - 16;
            }
            if (Math.abs(startY - endY) >= 32){
                let offsetY;
                let offsetX;
                if (endX <= startX){
                    offsetY = endY >= startY ? -8 : 8;
                    offsetX = endX <= startX ? 8 : -8;
                }
                else {
                    offsetY = endY >= startY ? -8 : 8;
                    offsetX = endX <= startX ? -8 : 8;
                }
                this.ctx.lineTo(centerX + offsetX, startY);
                this.ctx.arcTo(centerX, startY, centerX, (startY - offsetY), 8);
                this.ctx.lineTo(centerX, endY + offsetY);
                this.ctx.arcTo(centerX, endY, (centerX + offsetX), endY, 8);
                this.ctx.lineTo(endX, endY);
            } else {
                this.ctx.lineTo(centerX, startY);
                this.ctx.lineTo(centerX, endY);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "right" && endSide === "right"){
            if (startX >= endX){
                centerX = startX + 16;
            }
            else {
                centerX = endX + 16;
            }
            if (Math.abs(startY - endY) >= 32){
                let offsetY;
                let offsetX;
                if (endX <= startX){
                    offsetY = endY >= startY ? -8 : 8;
                    offsetX = endX <= startX ? -8 : 8;
                }
                else {
                    offsetY = endY >= startY ? -8 : 8;
                    offsetX = endX <= startX ? 8 : -8;
                }
                this.ctx.lineTo(centerX + offsetX, startY);
                this.ctx.arcTo(centerX, startY, centerX, (startY - offsetY), 8);
                this.ctx.lineTo(centerX, endY + offsetY);
                this.ctx.arcTo(centerX, endY, (centerX + offsetX), endY, 8);
                this.ctx.lineTo(endX, endY);
            } else {
                this.ctx.lineTo(centerX, startY);
                this.ctx.lineTo(centerX, endY);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "left" && endSide === "right" && startX <= endX){
            if (startX <= endX){
                centerX = startX - 16;
            }
            else {
                centerX = endX - 16;
            }
            if (startY <= endY){
                this.ctx.lineTo(centerX + 8, startY);
                this.ctx.arcTo(centerX, startY, centerX, startY + 8, 8);
                this.ctx.lineTo(centerX, centerY - 8);
                this.ctx.arcTo(centerX, centerY, centerX + 8, centerY, 8);
                this.ctx.lineTo(endX + 8, centerY);
                this.ctx.arcTo(endX + 16, centerY, endX + 16, centerY + 8, 8);
                this.ctx.lineTo(endX + 16, endY - 8);
                this.ctx.arcTo(endX + 16, endY, endX - 8, endY, 8);
                this.ctx.lineTo(endX, endY);
            }
            else {
                this.ctx.lineTo(centerX + 8, startY);
                this.ctx.arcTo(centerX, startY, centerX, startY - 8, 8);
                this.ctx.lineTo(centerX, centerY + 8);
                this.ctx.arcTo(centerX, centerY, centerX + 8, centerY, 8);
                this.ctx.lineTo(endX + 8, centerY);
                this.ctx.arcTo(endX + 16, centerY, endX + 16, centerY - 8, 8);
                this.ctx.lineTo(endX + 16, endY + 8);
                this.ctx.arcTo(endX + 16, endY, endX - 8, endY, 8);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "right" && endSide === "left" && endX <= startX){
            if (startX >= endX){
                centerX = startX + 16;
            }
            else {
                centerX = endX + 16;
            }
            if (startY <= endY){
                this.ctx.lineTo(centerX - 8, startY);
                this.ctx.arcTo(centerX, startY, centerX, startY + 8, 8);
                this.ctx.lineTo(centerX, centerY - 8);
                this.ctx.arcTo(centerX, centerY, centerX - 8, centerY, 8);
                this.ctx.lineTo(endX - 8, centerY);
                this.ctx.arcTo(endX - 16, centerY, endX - 16, centerY + 8, 8);
                this.ctx.lineTo(endX - 16, endY - 8);
                this.ctx.arcTo(endX - 16, endY, endX + 8, endY, 8);
                this.ctx.lineTo(endX, endY);
            }
            else {
                this.ctx.lineTo(centerX - 8, startY);
                this.ctx.arcTo(centerX, startY, centerX, startY - 8, 8);
                this.ctx.lineTo(centerX, centerY + 8);
                this.ctx.arcTo(centerX, centerY, centerX - 8, centerY, 8);
                this.ctx.lineTo(endX - 8, centerY);
                this.ctx.arcTo(endX - 16, centerY, endX - 16, centerY - 8, 8);
                this.ctx.lineTo(endX - 16, endY + 8);
                this.ctx.arcTo(endX - 16, endY, endX + 8, endY, 8);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "right" && endSide === "left" || startSide === "left" && endSide === "right") {
            if (Math.abs(startY - endY) >= 16 && Math.abs(startX - endX) >= 16){
                // round
                const offsetY = endY >= startY ? -8 : 8;
                const offsetX = endX <= startX ? 8 : -8;
                this.ctx.lineTo((centerX + offsetX), startY);
                this.ctx.arcTo(centerX, startY, centerX, (startY + offsetY * -1), 8);
                this.ctx.lineTo(centerX, (endY + offsetY));
                this.ctx.arcTo(centerX, endY, (centerX + offsetX * -1), endY, 8);
                this.ctx.lineTo(endX, endY);
            } else {
                // square
                this.ctx.lineTo(centerX, startY);
                this.ctx.lineTo(centerX, endY);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "bottom" && endSide === "top"){
            const centerY = (endY + startY) / 2;
            if (Math.abs(startX - endX) >= 16){
                if (endX < startX){
                    this.ctx.lineTo(startX, centerY - 8);
                    this.ctx.arcTo(startX, centerY, startX - 8, centerY, 8);
                    this.ctx.lineTo(endX + 8, centerY);
                    this.ctx.arcTo(endX, centerY, endX, centerY + 8, 8);
                    this.ctx.lineTo(endX, endY);
                }
                else {
                    this.ctx.lineTo(startX, centerY - 8);
                    this.ctx.arcTo(startX, centerY, startX + 8, centerY, 8);
                    this.ctx.lineTo(endX - 8, centerY);
                    this.ctx.arcTo(endX, centerY, endX, centerY + 8, 8);
                    this.ctx.lineTo(endX, endY);
                }
            }
            else {
                this.ctx.lineTo(startX, centerY);
                this.ctx.lineTo(endX, centerY);
                this.ctx.lineTo(endX, endY);
            }
            
        }
        else if (startSide === "top" && endSide === "bottom"){
            const centerY = (startY + endY) / 2;
            if (Math.abs(startX - endX) >= 16){
                if (endX >= startX){
                    this.ctx.lineTo(startX, centerY + 8);
                    this.ctx.arcTo(startX, centerY, startX + 8, centerY, 8);
                    this.ctx.lineTo(endX - 8, centerY);
                    this.ctx.arcTo(endX, centerY, endX, centerY - 8, 8);
                    this.ctx.lineTo(endX, endY);
                }
                else {
                    this.ctx.lineTo(startX, centerY + 8);
                    this.ctx.arcTo(startX, centerY, startX - 8, centerY, 8);
                    this.ctx.lineTo(endX + 8, centerY);
                    this.ctx.arcTo(endX, centerY, endX, centerY - 8, 8);
                    this.ctx.lineTo(endX, endY);
                }
            }
            else {
                this.ctx.lineTo(startX, centerY);
                this.ctx.lineTo(endX, centerY);
                this.ctx.lineTo(endX, endY);
            }
        }
        else if (startSide === "right" && endSide === "top"){
            this.ctx.lineTo(endX - 8, startY);
            this.ctx.arcTo(endX, startY, endX, startY + 8, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "right" && endSide === "bottom"){
            this.ctx.lineTo(endX - 8, startY);
            this.ctx.arcTo(endX, startY, endX, startY - 8, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "left" && endSide === "top"){
            this.ctx.lineTo(endX + 8, startY);
            this.ctx.arcTo(endX, startY, endX, startY + 8, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "left" && endSide === "bottom"){
            this.ctx.lineTo(endX + 8, startY);
            this.ctx.arcTo(endX, startY, endX, startY - 8, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "bottom" && endSide === "left"){
            this.ctx.lineTo(startX, endY - 8);
            this.ctx.arcTo(startX, endY, endX - 8, endY, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "bottom" && endSide === "right"){
            this.ctx.lineTo(startX, endY - 8);
            this.ctx.arcTo(startX, endY, endX + 8, endY, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "top" && endSide === "left"){
            this.ctx.lineTo(startX, endY - 8);
            this.ctx.arcTo(startX, endY, endX - 8, endY, 8);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "top" && endSide === "left"){
            this.ctx.lineTo(startX, endY - 8);
            this.ctx.arcTo(startX, endY, endX + 8, endY, 8);
            this.ctx.lineTo(endX, endY);
        }
        else {
            this.ctx.lineTo(endX, endY);
            console.warn(`missing type: ${startSide} ${endSide}`);
        }
        this.ctx.stroke();
    }

    private getElement(id:string):HTMLElement{
        let el = document.body.querySelector(id);
        return el as HTMLElement;
    }

    private eventLoop() {
        const newTime = performance.now();
        const deltaTime = (newTime - this.oldTime) / 1000;
        this.oldTime = newTime;
        this.highlightedLines = [];
        
        try {
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            const bounds = this.canvas.getBoundingClientRect();
            this.ctx.lineWidth = 1;
        
            if (this.openStartPoint !== null){
                this.ctx.strokeStyle = LINE_COLOUR;
                const startColumnEl:HTMLElement = this.getElement(`#${this.openStartPoint.id}`); 
                const startColumnBounds = startColumnEl.getBoundingClientRect();
                const { x: endX, y: endY } = this.mousePos;
                let startSide;
                let endSide;
                if (endX <= startColumnBounds.x){
                    startSide = "left";
                    endSide = "left";
                }
                else if (endX >= startColumnBounds.x && endX <= startColumnBounds.x + startColumnBounds.width){
                    if (endX >= startColumnBounds.x + startColumnBounds.width / 2){
                        startSide = "right";
                        endSide = "right";
                    } else {
                        startSide = "left";
                        endSide = "left";
                    }
                }
                else if (endX > startColumnBounds.x + startColumnBounds.width) {
                    startSide = "right";
                    endSide = "left";
                }
                else{
                    startSide = "left";
                    endSide = "right";
                }
                const startEl:HTMLElement = this.getElement(`#${this.openStartPoint.id}_${startSide}`);
                const startBounds = startEl.getBoundingClientRect();
                const startX = startBounds.x - bounds.x + startBounds.width / 2;
                const startY = startBounds.y - bounds.y + startBounds.height / 2;
                this.drawLine(startX, startY, endX - bounds.x, endY - bounds.y, startSide, endSide);
            }
        
            const lines = [];
            for (let i = 0; i < this.lines.length; i++){
                const startColumnEL:HTMLElement = this.getElement(`#${this.lines[i].start}`);
                const endColumnEL:HTMLElement = this.getElement(`#${this.lines[i].end}`);

                const startColumnBounds = startColumnEL.getBoundingClientRect();
                const endColumnBounds = endColumnEL.getBoundingClientRect();

                let startSide;
                let endSide;

                if (startColumnEL.tagName === "NODE-COMPONENT" && endColumnEL.tagName === "NODE-COMPONENT"){
                    if (endColumnBounds.x + endColumnBounds.width <= startColumnBounds.x){
                        startSide = "left";
                    }
                    else if (endColumnBounds.x >= startColumnBounds.x + startColumnBounds.width){
                        startSide = "right"
                    }
                    else if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height / 2){
                        startSide = "top";   
                    }
                    else {
                        startSide = "bottom";
                    }
                    if (endColumnBounds.x >= startColumnBounds.x + startColumnBounds.width){
                        endSide = "left";
                    }
                    else if (endColumnBounds.x + endColumnBounds.width <= startColumnBounds.x){
                        endSide = "right";
                    }
                    else if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height / 2){
                        endSide = "bottom";   
                    }
                    else {
                        endSide = "top";
                    }
                }
                else if (startColumnEL.tagName === "NODE-COMPONENT" && endColumnEL.tagName === "COLUMN-COMPONENT"){
                    if (endColumnBounds.x >= startColumnBounds.x + startColumnBounds.width && Math.abs(endColumnBounds.x - (startColumnBounds.width + startColumnBounds.x)) >= 64){
                        startSide = "right";
                        endSide = "left";
                    }
                    else if (endColumnBounds.x + endColumnBounds.width <= startColumnBounds.x && Math.abs(endColumnBounds.x + endColumnBounds.width - startColumnBounds.x) >= 64){
                        startSide = "left";
                        endSide = "right";
                    }
                    else if (endColumnBounds.x + endColumnBounds.width / 2 >= startColumnBounds.x + startColumnBounds.width / 2){
                        endSide = "left";
                        startSide = "left";
                    }
                    else {
                        endSide = "right";
                        startSide = "right";
                    }
                }
                else if (startColumnEL.tagName === "COLUMN-COMPONENT" && endColumnEL.tagName === "NODE-COMPONENT"){
                    if (endColumnBounds.x >= startColumnBounds.x + startColumnBounds.width){
                        startSide = "right";
                        if (Math.abs(startColumnBounds.y - endColumnBounds.y) >= 64){
                            if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height / 2) {
                                endSide = "bottom";
                            }
                            else {
                                endSide = "top";
                            }
                        }
                        else {
                            endSide = "left";
                        }
                    }
                    else if (endColumnBounds.x - 16 <= startColumnBounds.x){
                        startSide = "left";
                        if (Math.abs(startColumnBounds.y - endColumnBounds.y) >= 64){
                            if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height / 2) {
                                endSide = "bottom";
                            }
                            else {
                                endSide = "top";
                            }
                        }
                        else {
                            endSide = "right";
                        }
                    }
                    else if (endColumnBounds.x <= startColumnBounds.x + startColumnBounds.width / 2){
                        startSide = "left";
                        endSide = "left";
                    }
                    else {
                        startSide = "right";
                        endSide = "right";
                    }
                }
                else if (startColumnEL.tagName === "COLUMN-COMPONENT" && endColumnEL.tagName === "COLUMN-COMPONENT"){
                    if (endColumnBounds.x >= startColumnBounds.x && endColumnBounds.x <= startColumnBounds.x + startColumnBounds.width){
                        if (endColumnBounds.x > startColumnBounds.x + startColumnBounds.width / 2){
                            startSide = "right";
                            endSide = "left";
                        }
                        else {
                            startSide = "right";
                            endSide = "right";
                        }
                    }
                    else if (startColumnBounds.x >= endColumnBounds.x && startColumnBounds.x <= endColumnBounds.x + endColumnBounds.width){
                        if (startColumnBounds.x > endColumnBounds.x + endColumnBounds.width / 2){
                            startSide = "left";
                            endSide = "right";
                        }
                        else {
                            startSide = "left";
                            endSide = "left";
                        }
                    }
                    else if (startColumnBounds.x + startColumnBounds.width >= endColumnBounds.x){
                        startSide = "left";
                        endSide = "right";
                    }
                    else {
                        startSide = "right";
                        endSide = "left";
                    }
                }
                else {
                    startSide = "NO-CONNECTION";
                    endSide = "NO-CONNECTION"
                }

                const startEl:HTMLElement = this.getElement(`#${this.lines[i].start}_${startSide}`);
                const endEL:HTMLElement = this.getElement(`#${this.lines[i].end}_${endSide}`);

                const startBounds = startEl.getBoundingClientRect();
                const endBounds = endEL.getBoundingClientRect();
                const start = {
                    x: startBounds.x + (startBounds.width / 2) - bounds.x,
                    y: startBounds.y + (startBounds.height / 2) - bounds.y,
                },
                end = {
                    x: endBounds.x + (endBounds.width / 2) - bounds.x,
                    y: endBounds.y + (endBounds.height / 2) - bounds.y,
                };
                
                lines.push({
                    start: start,
                    end: end,
                    uid: this.lines[i].uid,
                    startSide: startSide,
                    endSide: endSide,
                });
                // Highlight logic
                // const mouseX = this.mousePos.x - bounds.x;
                // const mouseY = this.mousePos.y - bounds.y;
                // const { x: startX, y: startY } = start;
                // const { x: endX, y: endY } = end;
                // const aX = startX <= endX ? startX : endX;
                // const aY = startY <= endY ? startY : endY;
                // const bX = startX >= endX ? startX : endX;
                // const bY = startY >= endY ? startY : endY;
                // if (
                //     mouseX >= aX && mouseX <= bX &&
                //     mouseY >= aY && mouseY <= bY
                // ) {
                //     const centerX = (startX + endX) / 2;
                //     const direction = startX <= endX ? -1 : 1;
                //     if (mouseX >= centerX - 8 && mouseX <= centerX + 8){
                //         this.highlightedLines.push(this.lines[i].uid);
                //     }
                //     else if (mouseY >= startY - 8 && mouseY <= startY + 8){
                //         if (direction === -1){
                //             if (mouseX <= centerX){
                //                 this.highlightedLines.push(this.lines[i].uid);
                //             }
                //         } else {
                //             if (mouseX >= centerX){
                //                 this.highlightedLines.push(this.lines[i].uid);
                //             }
                //         }
                //     }
                //     else if (mouseY >= endY - 8 && mouseY <= endY + 8){
                //         if (direction === -1){
                //             if (mouseX >= centerX){
                //                 this.highlightedLines.push(this.lines[i].uid);
                //             }
                //         } else {
                //             if (mouseX <= centerX){
                //                 this.highlightedLines.push(this.lines[i].uid);
                //             }
                //         }
                //     }
                // }
            }
            
            for (let i = 0; i < lines.length; i++){
                const line = lines[i];
                const { x: startX, y: startY } = line.start;
                const { x: endX, y: endY } = line.end;
                if (this.highlightedLines.includes(line.uid)){
                    this.ctx.strokeStyle = LINE_HOVER_COLOUR;
                } else {
                    this.ctx.strokeStyle = LINE_COLOUR;
                }
                this.drawLine(startX, startY, endX, endY, line.startSide, line.endSide);
            }            
        } catch(e) {
            console.error(e);
            console.log("Something went wrong, skipping frame.");
        }

        window.requestAnimationFrame(this.eventLoop.bind(this));
    }
}
mount("canvas-component", CanvasComponent);
