export const initialState = { tasks : [], loading: true, error: null};

export function taskReducer(state, action) {
    switch (action.type)
    {
        case 'SYNC':
            return { ...state, tasks: action.payload, loading: false};
        case 'ADD':
            return { ...state, tasks: [...state.tasks, action.payload]};
        case 'UPDATE':
            return { ...state, tasks: state.tasks.map(
                t => t.id === action.payload.id ? action.payload : t
            )};
        case 'DELETE':
            return { ...state, tasks: state.tasks.filter(
                t => t.id !== action.payload.id
            )};
        case 'SET_ERROR':
            return { ...state, error: action.payload};
        default:
            return state;
    }
}