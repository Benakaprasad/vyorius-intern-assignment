import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = { todo: '#1E88E5', inprogress: '#F5A623', done: '#43A047' };

export default function ProgressChart({ tasks }) {
    const data = [
        { name: 'To Do',       column: 'todo',       count: tasks.filter(t => t.column === 'todo').length },
        { name: 'In Progress', column: 'inprogress', count: tasks.filter(t => t.column === 'inprogress').length },
        { name: 'Done',        column: 'done',       count: tasks.filter(t => t.column === 'done').length },
    ];

    const total = tasks.length || 1;
    const pct   = Math.round((data[2].count / total) * 100);

    return (
        <div className="progress-chart" data-testid="progress-chart">
            <p className="chart-label">{pct}% complete — {data[2].count} of {tasks.length} tasks done</p>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data}>
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count">
                        {data.map(d => <Cell key={d.column} fill={COLORS[d.column]} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}