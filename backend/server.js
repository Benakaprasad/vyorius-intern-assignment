import express from "express";
import {createServer} from "http";
import {Server} from "socket.io";
import cors from "cors";
import {v4 as uuidv4} from "uuid";
import mongoose  from "mongoose";

if (process.env.NODE_ENV !== 'production') {
  const { default: dotenv } = await import('dotenv');
  dotenv.config();
}

const port = process.env.PORT || 5000;
const app = express();
const server = createServer(app);
app.use(cors());
app.use(express.json());
const io = new Server(server,
{
  cors: {origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"]},
  pingTimeout: 60000,
  pingInterval: 25000,
});

const connectDB = async() =>
{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`database connection successful`);
  }
  catch(error)
  {
    console.error(`database connection failed`, error);
    process.exit(1);
  }
};
connectDB();

const VALID_COLUMNS = ['todo', 'inprogress', 'done'];
const VALID_PRIORITES = ['low', 'medium', 'high'];
const VALID_CATEGORIES = ['bug', 'feature', 'enhancement'];

const validateTask = (data) =>
{
  if(!data.title || typeof data.title !== 'string' ) return "title required";
  if(!VALID_COLUMNS.includes(data.column)) return "invalid column";
  if(data.priority && !VALID_PRIORITES.includes(data.priority)) return "invalid priority";
  if(data.category && !VALID_CATEGORIES.includes(data.category)) return "invalid category";
  return null;
};

const tasks = new Map();

io.on('connection', (socket) =>
{
  console.log(`socket is connected: ${socket.id}`);
  socket.emit('sync:tasks', Array.from(tasks.values()));

  socket.on('task:create', (data) =>
  {
    const err = validateTask(data);
    if(err) return socket.emit('error', {code: 400, message:err})
    const task = {
    id: uuidv4(),
    title: data.title.trim(),
    description: data.description || '',
    priority: data.priority || 'medium',
    category: data.category || 'feature',
    column: data.column || 'todo',
    attachments: data.attachments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
      };
   tasks.set(task.id, task);
   io.emit('task:created', task);
  });

  socket.on('task:update', (data) =>
  {
    const task = tasks.get(data.id);
    if(!task) return socket.emit('error', {code: 404, message: 'task not found'});
    const allowed = ['title', 'description', 'priority', 'category', 'attachments'];
    allowed.forEach(k => {if(data[k] !==  undefined) task[k] = data[k]; });
    task.updatedAt = new Date().toISOString();
    io.emit('task:updated', task);
  });

  socket.on('task:move', (data) =>
  {
    const task = tasks.get(data.id);
    if(!task) return socket.emit('error', {code: 404, message: 'task not found'});
    if(!VALID_COLUMNS.includes(data.column)) return socket.emit('error', {code: 400, message: 'invalid columns'})
    task.column = data.column;
    task.updatedAt =new Date().toISOString();
    io.emit('task:updated', task);
  });
  
  socket.on('task:delete', (data) =>
  {
    if(!tasks.has(data.id))
      return socket.emit('error', {code: 404, message: 'task not found'});
    tasks.delete(data.id);
    io.emit('task:deleted', {id: data.id});

  });
});

app.get('/health', (req, res) =>
{
  res.json({status: 'ok'});
});

server.listen(port, () =>
{
  console.log(`server running on port http://localhost:${port}`);
});