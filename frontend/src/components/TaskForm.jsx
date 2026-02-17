import { useState } from 'react';
import Select from 'react-select';

const priorityOptions = [
    { value: 'low',    label: 'Low'    },
    { value: 'medium', label: 'Medium' },
    { value: 'high',   label: 'High'   },
];

const categoryOptions = [
    { value: 'bug',         label: 'Bug'         },
    { value: 'feature',     label: 'Feature'     },
    { value: 'enhancement', label: 'Enhancement' },
];

export default function TaskForm({ onSubmit }) {
    const [title,       setTitle]       = useState('');
    const [description, setDescription] = useState('');
    const [priority,    setPriority]    = useState(priorityOptions[1]);
    const [category,    setCategory]    = useState(categoryOptions[1]);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onSubmit({
            title:       title.trim(),
            description,
            priority:    priority.value,
            category:    category.value,
            column:      'todo',
        });
        setTitle('');
        setDescription('');
    };

    return (
        <div className="task-form" data-testid="task-form">
            <input
                className="form-input"
                placeholder="Task title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
            <textarea
                className="form-textarea"
                placeholder="Description (optional)"
                value={description}
                onChange={e => setDescription(e.target.value)}
            />
            <div className="form-selects">
                <Select options={priorityOptions} value={priority} onChange={setPriority} placeholder="Priority" />
                <Select options={categoryOptions} value={category} onChange={setCategory} placeholder="Category" />
            </div>
            <button className="btn-add" onClick={handleSubmit}>Add Task</button>
        </div>
    );
}