import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import KanbanBoard from '../../components/KanbanBoard';

const listeners = {};
const mockSocket = {
  on:         (ev, fn) => { listeners[ev] = fn; },
  off:        vi.fn(),
  emit:       vi.fn((ev, data) => {
    if (ev === 'task:create') {
      listeners['task:created']?.({ id: 'uuid-1', ...data });
    }
    if (ev === 'task:delete') {
      listeners['task:deleted']?.({ id: data.id });
    }
    if (ev === 'task:update') {
      listeners['task:updated']?.({ id: data.id, ...data });
    }
    if (ev === 'task:move') {
      listeners['task:updated']?.({ id: data.id, column: data.column });
    }
  }),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: () => mockSocket,
}));

// Tests 

describe('KanbanBoard integration', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(listeners).forEach(k => delete listeners[k]);
  });

  it('shows loading indicator before sync:tasks fires', () => {
    render(<KanbanBoard />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  it('renders all 3 columns after sync:tasks', async () => {
    render(<KanbanBoard />);
    act(() => { listeners['sync:tasks']?.([]); });
    await waitFor(() => {
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });
  });

  it('renders tasks received from sync:tasks', async () => {
    const tasks = [
      { id: '1', title: 'Task One', column: 'todo', priority: 'low', category: 'bug', description: '', attachments: [] },
    ];
    render(<KanbanBoard />);
    act(() => { listeners['sync:tasks']?.(tasks); });
    await waitFor(() => {
      expect(screen.getByText('Task One')).toBeInTheDocument();
    });
  });

  it('adds a task when task:created is received', async () => {
  render(<KanbanBoard />);
  
  await act(async () => { listeners['sync:tasks']?.([]); });
  
  await act(async () => {
    listeners['task:created']?.({
      id: 'uuid-2', title: 'New Task', column: 'todo',
      priority: 'medium', category: 'feature', description: '', attachments: [],
    });
  });

  await waitFor(() => {
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });
});

  it('removes a task when task:deleted is received', async () => {
  const tasks = [
    { id: '1', title: 'To Delete', column: 'todo', priority: 'low', 
      category: 'bug', description: '', attachments: [] },
  ];
  
  render(<KanbanBoard />);
  
  await act(async () => { listeners['sync:tasks']?.(tasks); });
  await waitFor(() => expect(screen.getByText('To Delete')).toBeInTheDocument());
  
  await act(async () => { listeners['task:deleted']?.({ id: '1' }); });
  
  await waitFor(() => {
    expect(screen.queryByText('To Delete')).not.toBeInTheDocument();
  });
});

  it('emits task:create when form is submitted', async () => {
    render(<KanbanBoard />);
    act(() => { listeners['sync:tasks']?.([]); });
    await waitFor(() => screen.getByPlaceholderText('Task title'));
    fireEvent.change(screen.getByPlaceholderText('Task title'), {
      target: { value: 'Integration Task' },
    });
    fireEvent.click(screen.getByText('Add Task'));
    expect(mockSocket.emit).toHaveBeenCalledWith('task:create', expect.objectContaining({
      title: 'Integration Task',
      column: 'todo',
    }));
  });

  it('emits task:delete when delete button is clicked', async () => {
    const tasks = [
      { id: '99', title: 'Delete Me', column: 'todo', priority: 'low', category: 'bug', description: '', attachments: [] },
    ];
    render(<KanbanBoard />);
    act(() => { listeners['sync:tasks']?.(tasks); });
    await waitFor(() => screen.getByText('Delete Me'));
    fireEvent.click(screen.getAllByText('Delete')[0]);
    expect(mockSocket.emit).toHaveBeenCalledWith('task:delete', { id: '99' });
  });

  it('shows error banner when error event received', async () => {
    render(<KanbanBoard />);
    act(() => { listeners['sync:tasks']?.([]); });
    act(() => { listeners['error']?.({ message: 'task not found' }); });
    await waitFor(() => {
      expect(screen.getByTestId('error-banner')).toBeInTheDocument();
    });
  });

});