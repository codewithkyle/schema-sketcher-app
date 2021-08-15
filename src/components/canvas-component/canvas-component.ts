import { css, mount } from "~controllers/env";
import { createSubscription, subscribe, unsubscribe } from "~lib/pubsub";
import type { Point } from "~types/diagram";
import { v4 as uuid } from "uuid";

const LINE_COLOUR = "#9CA3AF";
const LINE_HOVER_COLOUR = "#EC4899";

interface StartPoint extends Point {
    id: string,
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
        setTimeout(()=>{
            this.canvas = this.querySelector("canvas") || document.createElement("canvas");
            if (!this.canvas.isConnected){
                this.appendChild(this.canvas);
            }
            this.ctx = this.canvas.getContext("2d");
            this.canvas.addEventListener("mousemove", this.handleMouseMove, { capture: true });
            this.canvas.addEventListener("mouseup", this.endMouseMove, { capture: true });
            this.calcSize();
            this.oldTime = performance.now();
            this.eventLoop();
        }, 150);      
    }

    disconnectedCallback(){
        this.eventLoop = async ()=>{};
        unsubscribe(this.ticketID);
        this.canvas.removeEventListener("mousemove", this.handleMouseMove, { capture: true });
        this.canvas.removeEventListener("mouseup", this.endMouseMove, { capture: true });
    }

    private calcSize(){
        const nodes:Array<HTMLElement> = Array.from(document.body.querySelectorAll("table-component, node-component"));
        let topX;
        let topY;
        let bottomX;
        let bottomY;
        for (let i = 0; i < nodes.length; i++){
            const node:HTMLElement = nodes[i];
            const bounds = node.getBoundingClientRect();
            if (i === 0) {
                topX = parseInt(node.dataset.left);
                topY = parseInt(node.dataset.top);
                bottomX = parseInt(node.dataset.left) + bounds.width;
                bottomY = parseInt(node.dataset.top) + bounds.height;
            }
            else {
                const tempX = parseInt(node.dataset.left);
                const tempY = parseInt(node.dataset.top);
                if (tempX < topX){
                    topX = tempX;
                }
                if (tempY < topY){
                    topY = tempY;
                }
                if (tempX + bounds.width > bottomX){
                    bottomX = tempX + bounds.width;
                }
                if (tempY + bounds.height > bottomY){
                    bottomY = tempY + bounds.height;
                }
            }
        }
        topX -= 18;
        topY -= 18;
        bottomX += 18;
        bottomY += 18;
        const width = bottomX - topX;
        const height = bottomY - topY;
        this.canvas.width = width;
        this.canvas.height = height;
        this.style.width = `${width}px`;
        this.style.height = `${height}px`;
        this.style.transform = `translate(${topX}px, ${topY}px)`;
        this.x = topX;
        this.y = topY;
        this.w = width;
        this.h = height;
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

    private startNewLine(x:number, y:number, id:string){
        this.openStartPoint = {
            x: x,
            y: y,
            id: id,
        };
        this.mousePos = {
            x: x,
            y: y,
        };
    }

    private endLine(id:string){
        console.log(id);
        if (this.openStartPoint !== null){
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
            case "render":
                this.calcSize();
                break;
            case "start":
                this.startNewLine(e.x, e.y, e.id);
                break;
            case "end":
                this.endLine(e.id);
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
                if (endX < startX){
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
                const offsetY = endY >= startY ? -8 : 8;
                const offsetX = endX <= startX ? -8 : 8;
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
            this.ctx.lineTo(centerX, startY);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.lineTo(endX + 16, centerY);
            this.ctx.lineTo(endX + 16, endY);
            this.ctx.lineTo(endX, endY);
        }
        else if (startSide === "right" && endSide === "left" && endX <= startX){
            if (startX >= endX){
                centerX = startX + 16;
            }
            else {
                centerX = endX + 16;
            }
            this.ctx.lineTo(centerX, startY);
            this.ctx.lineTo(centerX, centerY);
            this.ctx.lineTo(endX - 16, centerY);
            this.ctx.lineTo(endX - 16, endY);
            this.ctx.lineTo(endX, endY);
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
            else if (endX > startColumnBounds.x + startColumnBounds.width) {
                startSide = "right";
                endSide = "left";
            }
            else if (endX > startColumnBounds.x && endX < startColumnBounds.x + startColumnBounds.width){
                if (endX >= startColumnBounds.x + startColumnBounds.width / 2){
                    startSide = "right";
                    endSide = "right";
                } else {
                    startSide = "left";
                    endSide = "left";
                }
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
            if (endColumnBounds.x > startColumnBounds.x && endColumnBounds.x < startColumnBounds.x + startColumnBounds.width){
                if (endColumnBounds.x > startColumnBounds.x + startColumnBounds.width / 2){
                    startSide = "right";
                    endSide = "left";
                }
                else {
                    startSide = "right";
                    endSide = "right";
                }
            }
            else if (startColumnBounds.x > endColumnBounds.x && startColumnBounds.x < endColumnBounds.x + endColumnBounds.width){
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