import { connect, send } from "~controllers/ws";
import diagramController from "~controllers/diagram-controller";

class SessionController {
    public room: string;
    public diagram: string;
    public requiresPassword: bool;

    constructor(){
        this.room = null;
        this.diagram = null;
        this.requiresPassword = false;
    }

    public set(room, diagram, requiresPassword){
        this.room = room;
        this.diagram = diagram;
        this.requiresPassword = requiresPassword;
    }
    
    public async create(){
        if (!this.room){
            // TODO: add user modal to get the following details
            await connect();
            send("create-room", {
                password: "",
                allowAnon: true,
                diagramID: diagramController.ID,
            });   
        }
    }
    
    public leave(){
        this.diagram = null;
        this.room = null;
        this.requiresPassword = false;
    }

    public getURL(){
        let url = "";
        if (this.room){
            url = `${location.origin}/session/${this.diagram}/${this.room}${this.requirePassword ? "?auth=pwd" : ""}`;
        }
        return url;
    }
}
const session = new SessionController();
export default session;
