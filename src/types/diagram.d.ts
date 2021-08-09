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
}

export interface ColumnType {
    name: string,
}

export interface Table {
    color: string,
    name: string,
    x: number,
    y: number,
    columns: {
        [uid:string]: Column,
    }
}

export interface Diagram{
    name: string,
    timestamp: number,
    uid: string,
    tables: {
        [uid:string]: Table,
    },
    types: {
        [uid:string]: ColumnType,
    },
    connections: {
        [uid:string]: Connection,
    }
}