export interface OpenMap {
    [id: string]: boolean;
}

export interface TreeState {
    open: OpenMap;
    selected: string | null;
}

export interface Action {
    type: string;
    id: string;
}
