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

const priorityColors = { low: '#43A047', medium: '#F5A623', high: '#E94560' };

export default function TaskCard({ task, isDragging, onUpdate, onDelete }) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle]         = useState(task.title);
    const [description, setDescription] = useState(task.description);

    const handleSave = () => {
        onUpdate(task.id, { title, description });
        setIsEditing(false);
    };

    const handlePriority = (selected) => {
        onUpdate(task.id, { priority: selected.value });
    };

    const handleCategory = (selected) => {
        onUpdate(task.id, { category: selected.value });
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only JPG, PNG and PDF files are allowed');
            return;
        }
        const url = URL.createObjectURL(file);
        onUpdate(task.id, { attachments: [...task.attachments, { name: file.name, url, type: file.type }] });
    };

    return (
        <div
            className="task-card"
            data-testid="task-card"
            style={{ boxShadow: isDragging ? '0 8px 20px rgba(0,0,0,0.2)' : undefined }}
        >
            {isEditing ? (
                <>
                    <input
                        className="edit-input"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Task title"
                    />
                    <textarea
                        className="edit-textarea"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description"
                    />
                    <div className="card-actions">
                        <button className="btn-save"   onClick={handleSave}>Save</button>
                        <button className="btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </>
            ) : (
                <>
                    <p className="task-title">{task.title}</p>
                    {task.description && <p className="task-desc">{task.description}</p>}
                </>
            )}

            {/* Priority */}
            <Select
                className="priority-select"
                options={priorityOptions}
                value={priorityOptions.find(o => o.value === task.priority)}
                onChange={handlePriority}
                isSearchable={false}
                styles={{ control: (base) => ({
                    ...base, borderColor: priorityColors[task.priority], minHeight: 30
                })}}
            />

            {/* Category */}
            <Select
                className="category-select"
                options={categoryOptions}
                value={categoryOptions.find(o => o.value === task.category)}
                onChange={handleCategory}
                isSearchable={false}
            />

            {/* File upload */}
            <div className="attachment-section">
                <label className="upload-label">
                    📎 Attach file
                    <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        data-testid="file-input"
                    />
                </label>
                {task.attachments?.map((att, i) => (
                    <div key={i} className="attachment-item">
                        {att.type.startsWith('image/') && (
                            <img src={att.url} alt={att.name} className="attachment-preview" />
                        )}
                        <span>{att.name}</span>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="card-actions">
                <button className="btn-edit"   onClick={() => setIsEditing(true)}>Edit</button>
                <button className="btn-delete" onClick={() => onDelete(task.id)}>Delete</button>
            </div>
        </div>
    );
}