class SessionController {
    public room: string;
    public diagram: string;
    public requiresPassword: bool;

    constructor(){
        this.room = null;
        this.diagram = null;
        this.requiresPassword = false;
    }

    public createSession(room, diagram){
        this.room = room;
        this.diagram = diagram;
    }

    public getURL(){
        return `${location.origin}/session/${diagram}/${room}${requirePassword ? "?auth=pwd" : ""}`;
    }
}
const session = new SessionController();
export default session;
