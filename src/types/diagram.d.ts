export type ConnectionType = "one-one" | "one-many" | "many-one" | "many-many";

export interface Connection {
    startNodeID: string,
    endNodeID: string,
    type: ConnectionType,
}

export interface Column {
    name: string,
    type: string,
    isNullable: boolean,
    isUnique: boolean,
    isIndex: boolean,
    isPrimaryKey: boolean,
    order: number,
    uid: string,
}

export interface ColumnType {
    name: string,
}

export interface Table {
    uid: string,
    color: string,
    name: string,
    x: number,
    y: number,
    columns: {
        [uid:string]: Column,
    }
}

export interface Node {
    uid: string,
    color: string,
    text: string,
    x: number,
    y: number,
    icon: string,
}

export interface Diagram{
    name: string,
    timestamp: number,
    uid: string,
    tables: {
        [uid:string]: Table,
    },
    types: {
        [uid:string]: string,
    },
    connections: {
        [uid:string]: Connection,
    },
    nodes: {
        [uid:string]: Node,
    }
}

export type Point = {
    x:number,
    y:number,
}