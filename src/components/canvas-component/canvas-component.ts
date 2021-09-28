import { css, mount } from "~controllers/env";
import { createSubscription, subscribe, unsubscribe } from "~lib/pubsub";
import type { Connection, Point } from "~types/diagram";
import { v4 as uuid } from "uuid";
import debounce from "../../utils/debounce";
import cc from "~controllers/control-center";
import diagramController from "~controllers/diagram-controller";

const LINE_COLOUR = "#9CA3AF";
const LINE_HOVER_COLOUR = "#EC4899";

interface StartPoint extends Point {
    id: string,
    tableID: string,
    refs: Array<string>,
}

export default class CanvasComponent extends HTMLElement{
    private canvas: HTMLCanvasElement;
    private hitCanvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private hitCTX: CanvasRenderingContext2D;
    private x: number;
    private y: number;
    private w: number;
    private h: number;
    private oldTime: number;
    private lines:Array<Connection>;
    private openStartPoint:StartPoint;
    private mousePos:Point;
    private ticketID: string;
    private forceHighlight: string;

    constructor(){
        super();
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.openStartPoint = null;
        this.mousePos = null;
        this.lines = [];
        this.forceHighlight = null;
        css(["canvas-component"]);
        createSubscription("canvas");
        this.ticketID = subscribe("canvas", this.inbox.bind(this));
    }

    async connectedCallback(){
        this.canvas = this.querySelector("canvas") || document.createElement("canvas");
        if (!this.canvas.isConnected){
            this.appendChild(this.canvas);
        }
        this.hitCanvas = this.querySelector("canvas.hit") || document.createElement("canvas");
        if (!this.hitCanvas.isConnected){
            this.hitCanvas.classList.add("hit");
            this.appendChild(this.hitCanvas);
        }
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 64;
        this.hitCanvas.width = window.innerWidth;
        this.hitCanvas.height = window.innerHeight - 64;
        this.ctx = this.canvas.getContext("2d");
        this.hitCTX = this.hitCanvas.getContext("2d");
        window.addEventListener("mousemove", this.handleMouseMove);
        window.addEventListener("mouseup", this.endMouseMove);
        window.addEventListener("resize", debounce(()=>{
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight - 64;
            this.hitCanvas.width = window.innerWidth;
            this.hitCanvas.height = window.innerHeight - 64;
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

    private startNewLine(x:number, y:number, id:string, tableID:string, refs: Array<string> = []){
        this.openStartPoint = {
            x: x,
            y: y,
            id: id,
            tableID: tableID,
            refs: refs,
        };
        this.mousePos = {
            x: x,
            y: y,
        };
    }

    private endLine(id:string, tableID:string, refs:Array<string> = []){
        if (this.openStartPoint !== null && id !== this.openStartPoint.id && tableID !== this.openStartPoint.tableID){
            diagramController.createConnection(this.openStartPoint.id, id, [...this.openStartPoint.refs, ...refs]);
            this.openStartPoint = null;
        }
    }

    private async inbox(e){
        switch(e.type){
            case "clear-highlight":
                if (e.ref === this.forceHighlight){
                    this.forceHighlight = null;
                }
                break;
            case "highlight":
                this.forceHighlight = e.ref;
                break;
            case "start":
                this.startNewLine(e.x, e.y, e.id, e.tableID, e.refs);
                break;
            case "end":
                this.endLine(e.id, e.tableID, e.refs);
                break;
            default:
                console.warn(`Invalid 'canvas' message type: ${e.type}`);
                break;
        }
    }

    private drawLine(startX, startY, endX, endY, startSide, endSide){
        let centerX = (startX + endX) * 0.5;
        let centerY = (startY + endY) * 0.5;
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
            const offsetY = endY >= startY ? -8 : 8;
            const offsetX = endX <= startX ? 8 : -8;
            if (Math.abs(startY - endY) >= 16 && Math.abs(startX - endX) >= 16){
                // round
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

                this.hitCTX.fillStyle = "red";
                this.hitCTX.fillRect(startX, startY - 8, Math.abs(startX - centerX), 16);
                this.hitCTX.fillRect(centerX, endY - 8, Math.abs(endX - centerX), 16);
                this.hitCTX.fillRect(centerX - offsetX, endY - 8, 16, Math.abs(startY - endY) + 16);
            }
        }
        else if (startSide === "bottom" && endSide === "top"){
            const centerY = (endY + startY) * 0.5;
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
            const centerY = (startY + endY) * 0.5;
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

    private async eventLoop() {
        const newTime = performance.now();
        const deltaTime = (newTime - this.oldTime) / 1000;
        this.oldTime = newTime;
        this.lines = await diagramController.getConnections();
        const highlightedLines = [];

        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
        this.hitCTX.clearRect(0,0,this.canvas.width,this.canvas.height);
        const bounds = this.canvas.getBoundingClientRect();
        this.ctx.lineWidth = 1;
        
        try {
            if (this.openStartPoint !== null){
                this.ctx.strokeStyle = LINE_COLOUR;
                const startColumnEl:HTMLElement = this.getElement(`[data-uid="${this.openStartPoint.id}"]`); 
                const startColumnBounds = startColumnEl.getBoundingClientRect();
                const { x: endX, y: endY } = this.mousePos;
                let startSide;
                let endSide;
                if (endX <= startColumnBounds.x){
                    startSide = "left";
                    endSide = "left";
                }
                else if (endX >= startColumnBounds.x && endX <= startColumnBounds.x + startColumnBounds.width){
                    if (endX >= startColumnBounds.x + startColumnBounds.width * 0.5){
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
                const startEl:HTMLElement = this.getElement(`[data-uid="${this.openStartPoint.id}_${startSide}"]`);
                const startBounds = startEl.getBoundingClientRect();
                const startX = startBounds.x - bounds.x + startBounds.width * 0.5;
                const startY = startBounds.y - bounds.y + startBounds.height * 0.5;
                this.drawLine(startX, startY, endX - bounds.x, endY - bounds.y, startSide, endSide);
            }
        }
        catch (e){
            console.error("Failed to draw temp line.", e);
        }

        const lines = [];
        for (let i = 0; i < this.lines.length; i++){
            try {
                const startColumnEL:HTMLElement = this.getElement(`[data-uid="${this.lines[i].startNodeID}"]`);
                const endColumnEL:HTMLElement = this.getElement(`[data-uid="${this.lines[i].endNodeID}"]`);

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
                    else if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height * 0.5){
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
                    else if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height * 0.5){
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
                    else if (endColumnBounds.x + endColumnBounds.width * 0.5 >= startColumnBounds.x + startColumnBounds.width * 0.5){
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
                            if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height * 0.5) {
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
                    else if (endColumnBounds.x <= startColumnBounds.x){
                        startSide = "left";
                        if (endColumnBounds.x + 32 < startColumnBounds.x){
                            if (Math.abs(startColumnBounds.y - endColumnBounds.y) >= 64){
                                if (endColumnBounds.y <= startColumnBounds.y + startColumnBounds.height * 0.5) {
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
                        else {
                            endSide = "left";
                        }
                    }
                    else if (endColumnBounds.x <= startColumnBounds.x + startColumnBounds.width * 0.5){
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
                        if (endColumnBounds.x > startColumnBounds.x + startColumnBounds.width * 0.5){
                            startSide = "right";
                            endSide = "left";
                        }
                        else {
                            startSide = "right";
                            endSide = "right";
                        }
                    }
                    else if (startColumnBounds.x >= endColumnBounds.x && startColumnBounds.x <= endColumnBounds.x + endColumnBounds.width){
                        if (startColumnBounds.x > endColumnBounds.x + endColumnBounds.width * 0.5){
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

                const startEl:HTMLElement = this.getElement(`[data-uid="${this.lines[i].startNodeID}_${startSide}"]`);
                const endEL:HTMLElement = this.getElement(`[data-uid="${this.lines[i].endNodeID}_${endSide}"]`);

                const startBounds = startEl.getBoundingClientRect();
                const endBounds = endEL.getBoundingClientRect();
                const start = {
                    x: startBounds.x + (startBounds.width * 0.5) - bounds.x,
                    y: startBounds.y + (startBounds.height * 0.5) - bounds.y,
                },
                end = {
                    x: endBounds.x + (endBounds.width * 0.5) - bounds.x,
                    y: endBounds.y + (endBounds.height * 0.5) - bounds.y,
                };
                
                lines.push({
                    start: start,
                    end: end,
                    uid: this.lines[i].uid,
                    startSide: startSide,
                    endSide: endSide,
                    refs: this.lines[i].refs,
                });
            }
            catch (e){
                console.error("Failed to get line data", this.lines[i]);
            }
        }
        
        // Set highlighted lines
        for (let i = 0; i < lines.length; i++){
            const line = lines[i];
            if (this.forceHighlight !== null && line.refs.includes(this.forceHighlight)){
                highlightedLines.push(line.uid);
            }
        }
        
        // Draw normal lines
        for (let i = 0; i < lines.length; i++){
            const line = lines[i];
            if (!highlightedLines.includes(line.uid)){
                const { x: startX, y: startY } = line.start;
                const { x: endX, y: endY } = line.end;
                this.ctx.strokeStyle = LINE_COLOUR;
                this.drawLine(startX, startY, endX, endY, line.startSide, line.endSide);
            }
        }    
        
        // Draw highlighted lines
        for (let i = 0; i < lines.length; i++){
            const line = lines[i];
            if (highlightedLines.includes(line.uid)){
                const { x: startX, y: startY } = line.start;
                const { x: endX, y: endY } = line.end;
                this.ctx.strokeStyle = LINE_HOVER_COLOUR;
                this.drawLine(startX, startY, endX, endY, line.startSide, line.endSide);
            }
        }

        window.requestAnimationFrame(this.eventLoop.bind(this));
    }
}
mount("canvas-component", CanvasComponent);
