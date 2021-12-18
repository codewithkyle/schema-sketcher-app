export type ConnectionType = "one-one" | "one-many" | "many-one" | "many-many";

export interface Connection {
    uid: string,
    startNodeID: string,
    endNodeID: string,
    type: ConnectionType,
    refs: Array<string>,
    diagramID: string,
}

export interface Column {
    name: string,
    type: string,
    isNullable: boolean,
    isUnique: boolean,
    isIndex: boolean,
    isPrimaryKey: boolean,
    weight: number,
    uid: string,
    diagramID: string,
    tableID: string,
}

export interface ColumnType {
    name: string,
    uid: string,
    diagramID: string,
}

export interface Table {
    uid: string,
    color: string,
    name: string,
    x: number,
    y: number,
    diagramID: string,
}

export interface Node {
    uid: string,
    color: string,
    text: string,
    x: number,
    y: number,
    icon: string,
    diagramID: string,
}

export interface Diagram{
    name: string,
    timestamp: number,
    uid: string,
}

export interface Point {
    x:number,
    y:number,
}