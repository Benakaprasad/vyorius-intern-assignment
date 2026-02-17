import { useReducer, useCallback, useMemo } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { taskReducer, initialState } from '../reducers/taskReducer';
import { useSocket } from '../hooks/socket';
import KanbanColumn      from './KanbanColumn';
import TaskForm          from './TaskForm';
import ProgressChart     from './ProgressChart';
import LoadingIndicator  from './LoadingIndicator';

const COLUMNS = [
    { id: 'todo',       label: 'To Do'       },
    { id: 'inprogress', label: 'In Progress' },
    { id: 'done',       label: 'Done'        },
];

export default function KanbanBoard() {
    const [state, dispatch] = useReducer(taskReducer, initialState);

    const handleEvent = useCallback((event, data) => {
        switch (event) {
            case 'sync:tasks':   dispatch({ type: 'SYNC',      payload: data }); break;
            case 'task:created': dispatch({ type: 'ADD',       payload: data }); break;
            case 'task:updated': dispatch({ type: 'UPDATE',    payload: data }); break;
            case 'task:deleted': dispatch({ type: 'DELETE',    payload: data }); break;
            case 'error':        dispatch({ type: 'SET_ERROR', payload: data }); break;
        }
    }, []);

    const { emit } = useSocket(handleEvent);

    const tasksByColumn = useMemo(() =>
        Object.fromEntries(COLUMNS.map(col => [
            col.id,
            state.tasks.filter(t => t.column === col.id)
        ])),
    [state.tasks]);

    const onDragEnd = useCallback((result) => {
        if (!result.destination) return;
        if (result.destination.droppableId === result.source.droppableId) return;
        emit('task:move', {
            id:     result.draggableId,
            column: result.destination.droppableId,
        });
    }, [emit]);

    if (state.loading) return <LoadingIndicator />;

    return (
        <div className="kanban-root">
            {state.error && (
                <div className="error-banner" data-testid="error-banner">
                    ⚠️ {state.error.message}
                </div>
            )}
            <TaskForm onSubmit={data => emit('task:create', data)} />
            <ProgressChart tasks={state.tasks} />
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="kanban-board">
                    {COLUMNS.map(col => (
                        <KanbanColumn
                            key={col.id}
                            column={col}
                            tasks={tasksByColumn[col.id] || []}
                            onUpdate={(id, data) => emit('task:update', { id, ...data })}
                            onDelete={id => emit('task:delete', { id })}
                        />
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
}