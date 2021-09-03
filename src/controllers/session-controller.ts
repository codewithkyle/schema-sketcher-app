class SessionController {
    public room: string;
    public diagram: string;
    public requiresPassword: bool;

    constructor(){
        this.room = null;
        this.diagram = null;
        this.requiresPassword = false;
    }

    public createSession(room, diagram, requiresPassword){
        this.room = room;
        this.diagram = diagram;
        this.requiresPassword = requiresPassword;
    }

    public getURL(){
        return `${location.origin}/session/${diagram}/${room}${requirePassword ? "?auth=pwd" : ""}`;
    }
}
const session = new SessionController();
export default session;
