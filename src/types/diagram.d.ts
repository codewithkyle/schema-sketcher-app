export type ConnectionType = "one-one" | "one-many" | "many-one" | "many-many";

export interface Connection {
    uid: string,
    startNodeID: string,
    endNodeID: string,
    type: ConnectionType,
    refs: Array<string>,
    color: string,
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
    tableID: string,
}

export interface ColumnType {
    name: string,
    uid: string,
}

export interface Table {
    uid: string,
    color: string,
    name: string,
    x: number,
    y: number,
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
    fileName: string,
    version: number,
    timestamp: number,
    uid: string,
    tables: {
        [key:string]: Table,
    },
    columns: {
        [key:string]: Column,
    },
    nodes: {
        [key:string]: Node,
    },
    connections: {
        [key:string]: Connection,
    },
    types: {
        [key:string]: ColumnType,
    }
}

export interface Point {
    x:number,
    y:number,
}

export type DatabaseType = "sqlite" | "postgresql" | "mysql" | "mssql";
