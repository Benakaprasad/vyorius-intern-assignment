import { describe, it, expect } from 'vitest';
import { taskReducer, initialState } from '../../reducers/taskReducer';
import { render, screen } from '@testing-library/react';
import LoadingIndicator from '../../components/LoadingIndicator';
import ProgressChart from '../../components/ProgressChart';

// Reducer unit tests 

const mockTask = {
  id: '1',
  title: 'Test Task',
  column: 'todo',
  priority: 'medium',
  category: 'feature',
  description: '',
  attachments: [],
};

describe('taskReducer', () => {

  it('has correct initial state', () => {
    expect(initialState.tasks).toEqual([]);
    expect(initialState.loading).toBe(true);
    expect(initialState.error).toBeNull();
  });

  it('SYNC — replaces tasks and sets loading to false', () => {
    const next = taskReducer(initialState, { type: 'SYNC', payload: [mockTask] });
    expect(next.tasks).toHaveLength(1);
    expect(next.loading).toBe(false);
  });

  it('ADD — appends a new task', () => {
    const base = { ...initialState, tasks: [mockTask] };
    const newTask = { ...mockTask, id: '2', title: 'New Task' };
    const next = taskReducer(base, { type: 'ADD', payload: newTask });
    expect(next.tasks).toHaveLength(2);
    expect(next.tasks[1].title).toBe('New Task');
  });

  it('UPDATE — mutates only the matching task', () => {
    const base = { ...initialState, tasks: [mockTask] };
    const updated = { ...mockTask, title: 'Updated Title' };
    const next = taskReducer(base, { type: 'UPDATE', payload: updated });
    expect(next.tasks[0].title).toBe('Updated Title');
  });

  it('UPDATE — does not affect other tasks', () => {
    const task2 = { ...mockTask, id: '2', title: 'Other Task' };
    const base = { ...initialState, tasks: [mockTask, task2] };
    const next = taskReducer(base, { type: 'UPDATE', payload: { ...mockTask, title: 'Changed' } });
    expect(next.tasks[1].title).toBe('Other Task');
  });

  it('DELETE — removes the matching task', () => {
    const base = { ...initialState, tasks: [mockTask] };
    const next = taskReducer(base, { type: 'DELETE', payload: { id: '1' } });
    expect(next.tasks).toHaveLength(0);
  });

  it('DELETE — does not remove wrong task', () => {
    const task2 = { ...mockTask, id: '2' };
    const base = { ...initialState, tasks: [mockTask, task2] };
    const next = taskReducer(base, { type: 'DELETE', payload: { id: '1' } });
    expect(next.tasks).toHaveLength(1);
    expect(next.tasks[0].id).toBe('2');
  });

  it('SET_ERROR — stores error in state', () => {
    const next = taskReducer(initialState, { type: 'SET_ERROR', payload: { message: 'fail' } });
    expect(next.error.message).toBe('fail');
  });

  it('unknown action — returns state unchanged', () => {
    const next = taskReducer(initialState, { type: 'UNKNOWN' });
    expect(next).toEqual(initialState);
  });

});

// Component unit tests 

describe('LoadingIndicator', () => {
  it('renders loading text', () => {
    render(<LoadingIndicator />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Connecting to server...')).toBeInTheDocument();
  });
});

describe('ProgressChart', () => {
  it('renders with empty tasks', () => {
    render(<ProgressChart tasks={[]} />);
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
  });

  it('shows 100% when all tasks are done', () => {
    const tasks = [
      { ...mockTask, id: '1', column: 'done' },
      { ...mockTask, id: '2', column: 'done' },
    ];
    render(<ProgressChart tasks={tasks} />);
    expect(screen.getByText(/100% complete/)).toBeInTheDocument();
  });

  it('shows 0% when no tasks are done', () => {
    const tasks = [{ ...mockTask, id: '1', column: 'todo' }];
    render(<ProgressChart tasks={tasks} />);
    expect(screen.getByText(/0% complete/)).toBeInTheDocument();
  });
});