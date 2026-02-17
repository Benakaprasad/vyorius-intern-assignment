import { Droppable, Draggable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function KanbanColumn({ column, tasks, onUpdate, onDelete }) {
    return (
        <div className="kanban-column" data-testid={`column-${column.id}`}>
            <h2 className="column-title">
                {column.label}
                <span className="task-count">{tasks.length}</span>
            </h2>
            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`column-body ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        data-testid="task-card"
                                    >
                                        <TaskCard
                                            task={task}
                                            isDragging={snapshot.isDragging}
                                            onUpdate={onUpdate}
                                            onDelete={onDelete}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}