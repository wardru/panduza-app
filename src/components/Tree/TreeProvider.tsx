import { createContext, useContext } from 'react';
import { TreeApi } from './TreeApi';
import TreeProps from './TreeProps';
import { TreeState, Action } from './TreeState';
import { OpenMap } from './TreeState';
import TreeData from './TreeData';

import { useReducer } from 'react';

interface TreeProviderProps {
    treeProps: TreeProps;
    children: React.ReactNode;
}

const TreeContext = createContext<TreeApi | null>(null);

const reducer = (state: TreeState, action: Action): TreeState => {
    switch (action.type) {
        case 'open': {
            return {
                ...state,
                open: {
                    ...state.open,
                    [action.id]: true,
                },
            };
        }
        case 'close': {
            return {
                ...state,
                open: {
                    ...state.open,
                    [action.id]: false,
                },
            };
        }

        case 'select': {
            return {
                ...state,
                selected: action.id,
            };
        }

        default:
            return state;
    }
};

export const TreeProvider: React.FC<TreeProviderProps> = ({ treeProps, children }) => {
    const createInitialOpenState = () => {
        const fillItem = (item: TreeData) => {
            map[item.id] = true;
            item.children?.forEach(fillItem);
        };

        const map: OpenMap = {};

        if (treeProps.openByDefault === false) return {};

        treeProps.items.forEach(fillItem);
        return map;
    };

    const initialState = {
        open: createInitialOpenState(),
        selected: null,
    };
    const [state, dispatch] = useReducer(reducer, initialState);
    const api = new TreeApi(treeProps, state, dispatch);

    return <TreeContext.Provider value={api}>{children}</TreeContext.Provider>;
};

export const useTreeApi = () => {
    const context = useContext(TreeContext);

    if (!context) {
        throw new Error('useTreeApi must be used inside a TreeProvider');
    }
    return context;
};
