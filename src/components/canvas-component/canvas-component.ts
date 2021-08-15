import { css, mount } from "~controllers/env";
import { createSubscription, subscribe, unsubscribe } from "~lib/pubsub";
import type { Point } from "~types/diagram";
import { v4 as uuid } from "uuid";

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
        console.log(tableID, this.openStartPoint.tableID)
        if (this.openStartPoint !== null && id !== this.openStartPoint.id && tableID !== this.openStartPoint.tableID){
            console.log(`Create line from ${this.openStartPoint.id} to ${id}`);
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
        else {
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
        this.ctx.stroke();
    }

    private async getElement(id:string):Promise<HTMLElement>{
        let el = document.body.querySelector(id);
        if (!el){
            await new Promise((resolve) => {
                while(!el){
                    console.log(`looking for ${id}`);
                    el = document.body.querySelector(id);
                }
                // @ts-ignore
                resolve();
            });
        }
        return el as HTMLElement;
    }

    private async eventLoop() {
        const newTime = performance.now();
        const deltaTime = (newTime - this.oldTime) / 1000;
        this.oldTime = newTime;
        this.highlightedLines = [];
        
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        const bounds = this.canvas.getBoundingClientRect();
        this.ctx.lineWidth = 1;
    
        if (this.openStartPoint !== null){
            this.ctx.strokeStyle = LINE_COLOUR;
            const startColumnEl:HTMLElement = document.body.querySelector(`#${this.openStartPoint.id}`); 
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
            const startEl:HTMLElement = await this.getElement(`#${this.openStartPoint.id}_${startSide}`);
            const startBounds = startEl.getBoundingClientRect();
            const startX = startBounds.x - bounds.x + startBounds.width / 2;
            const startY = startBounds.y - bounds.y + startBounds.height / 2;
            this.drawLine(startX, startY, endX - bounds.x, endY - bounds.y, startSide, endSide);
        }
    
        const lines = [];
        for (let i = 0; i < this.lines.length; i++){
            const startColumnEL:HTMLElement = await this.getElement(`#${this.lines[i].start}`);
            const endColumnEL:HTMLElement = await this.getElement(`#${this.lines[i].end}`);

            const startColumnBounds = startColumnEL.getBoundingClientRect();
            const endColumnBounds = endColumnEL.getBoundingClientRect();

            let startSide;
            let endSide;
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
            else if (startColumnBounds.x < endColumnBounds.x){
                startSide = "right";
                endSide = "left";
            }
            else {
                startSide = "left";
                endSide = "right";
            }

            const startEl:HTMLElement = await this.getElement(`#${this.lines[i].start}_${startSide}`);
            const endEL:HTMLElement = await this.getElement(`#${this.lines[i].end}_${endSide}`);

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
        window.requestAnimationFrame(this.eventLoop.bind(this));
    }
}
mount("canvas-component", CanvasComponent);