import { css, mount } from "~controllers/env";
import { createSubscription, subscribe } from "~lib/pubsub";
import type { Point } from "~types/diagram";

const LINE_COLOUR = "#9CA3AF";
const LINE_HOVER_COLOUR = "#EC4899";


class Line {
    public start: Point;
    public end: Point;
    public uid: string;
    
    constructor(start:Point, end:Point, uid:string){
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
    private openStartPoint:Point;
    private mousePos:Point;

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
        this.canvas = this.querySelector("canvas") || document.createElement("canvas");
        if (!this.canvas.isConnected){
            this.appendChild(this.canvas);
        }
        this.ctx = this.canvas.getContext("2d");
        createSubscription("canvas");
        subscribe("canvas", this.inbox.bind(this));
    }

    connectedCallback(){
        setTimeout(()=>{
            this.calcSize();
            this.oldTime = performance.now();
            this.eventLoop();
        }, 150);
        // this.canvas.addEventListener("mousemove", (e:MouseEvent) => {
        //     mousePos = {
        //         x: e.clientX,
        //         y: e.clientY,
        //     };
        // }, { capture: true });
        // this.canvas.addEventListener("mouseup", (e:MouseEvent) => {
        //     const line = new Line(openStartPoint, {
        //         x: e.clientX,
        //         y: e.clientY
        //     });
        //     lines.push(line);
        //     openStartPoint = null;
        // }, { capture: true });        
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

    private inbox(e){
        switch(e.type){
            case "render":
                this.calcSize();
                break;
            default:
                console.warn(`Invalid 'canvas' message type: ${e.type}`);
                break;
        }
    }

    private drawLine(startX, startY, endX, endY){
        const centerX = (startX + endX) / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        if (Math.abs(startY - endY) >= 16 && Math.abs(startX - endX) >= 16){
            const offsetY = endY >= startY ? -8 : 8;
            const offsetX = endX <= startX ? 8 : -8;
            this.ctx.lineTo((centerX + offsetX), startY);
            this.ctx.arcTo(centerX, startY, centerX, (startY + offsetY * -1), 8);
            this.ctx.lineTo(centerX, (endY + offsetY));
            this.ctx.arcTo(centerX, endY, (centerX + offsetX * -1), endY, 8);
            this.ctx.lineTo(endX, endY);
        } else {
            this.ctx.lineTo(centerX, startY);
            this.ctx.lineTo(centerX, endY);
            this.ctx.lineTo(endX, endY);
        }
        this.ctx.stroke();
    }

    private eventLoop() {
        const newTime = performance.now();
        const deltaTime = (newTime - this.oldTime) / 1000;
        this.oldTime = newTime;
        this.highlightedLines = [];
        
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    
        if (this.openStartPoint !== null){
            this.ctx.strokeStyle = LINE_COLOUR;
            const { x: startX, y: startY } = this.openStartPoint;
            const { x: endX, y: endY } = this.mousePos;
            this.drawLine(startX, startY, endX, endY);   
        }
    
        for (let i = 0; i < this.lines.length; i++){
            const { x: mouseX, y: mouseY } = this.mousePos;
            const { x: startX, y: startY } = this.lines[i].start;
            const { x: endX, y: endY } = this.lines[i].end;
            const aX = startX <= endX ? startX : endX;
            const aY = startY <= endY ? startY : endY;
            const bX = startX >= endX ? startX : endX;
            const bY = startY >= endY ? startY : endY;
            if (
                mouseX >= aX && mouseX <= bX &&
                mouseY >= aY && mouseY <= bY
            ) {
                const centerX = (startX + endX) / 2;
                const direction = startX <= endX ? -1 : 1;
                if (mouseX >= centerX - 8 && mouseX <= centerX + 8){
                    this.highlightedLines.push(this.lines[i].uid);
                }
                else if (mouseY >= startY - 8 && mouseY <= startY + 8){
                    if (direction === -1){
                        if (mouseX <= centerX){
                            this.highlightedLines.push(this.lines[i].uid);
                        }
                    } else {
                        if (mouseX >= centerX){
                            this.highlightedLines.push(this.lines[i].uid);
                        }
                    }
                }
                else if (mouseY >= endY - 8 && mouseY <= endY + 8){
                    if (direction === -1){
                        if (mouseX >= centerX){
                            this.highlightedLines.push(this.lines[i].uid);
                        }
                    } else {
                        if (mouseX <= centerX){
                            this.highlightedLines.push(this.lines[i].uid);
                        }
                    }
                }
            }
        }
        
        for (let i = 0; i < this.lines.length; i++){
            const line:Line = this.lines[i];
            const { x: startX, y: startY } = line.start;
            const { x: endX, y: endY } = line.end;
            if (this.highlightedLines.includes(line.uid)){
                this.ctx.strokeStyle = LINE_HOVER_COLOUR;
            } else {
                this.ctx.strokeStyle = LINE_COLOUR;
            }
            this.drawLine(startX, startY, endX, endY);
        }
        window.requestAnimationFrame(this.eventLoop.bind(this));
    }
}
mount("canvas-component", CanvasComponent);