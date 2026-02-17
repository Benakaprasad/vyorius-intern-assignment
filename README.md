# 📝 WebSocket-Powered Kanban Board

## 📌 Project Overview

This project is a **real-time Kanban board** built as part of the Vyorius internship assignment. Users can **add, update, delete, move tasks between columns, upload attachments, assign priority & category, and visualize progress** — all synced in real-time across multiple clients using WebSockets.

### ✅ Technologies Used

- **React 19** — UI framework
- **Socket.IO 4** — Real-time WebSocket communication
- **Node.js + Express** — Backend server
- **MongoDB + Mongoose** — Database
- **Vitest + React Testing Library** — Unit & Integration testing
- **Playwright** — End-to-end testing
- **@hello-pangea/dnd** — Drag and drop
- **React Select** — Priority & category dropdowns
- **Recharts** — Task progress chart

---

## 📂 Project Structure

```
websocket-kanban-vitest-playwright-2026
├─ backend
│  ├─ package.json
│  └─ server.js                  # Express + Socket.IO + MongoDB
├─ frontend
│  ├─ playwright.config.js
│  ├─ vite.config.js
│  └─ src
│     ├─ App.jsx
│     ├─ App.css
│     ├─ components
│     │  ├─ KanbanBoard.jsx      # Root component — state + websocket wiring
│     │  ├─ KanbanColumn.jsx     # Droppable column
│     │  ├─ TaskCard.jsx         # Draggable task card
│     │  ├─ TaskForm.jsx         # Create task form
│     │  ├─ ProgressChart.jsx    # Recharts bar chart
│     │  └─ LoadingIndicator.jsx # Connection loading spinner
│     ├─ hooks
│     │  └─ socket.js            # Custom useSocket hook
│     ├─ reducers
│     │  └─ taskReducer.js       # Pure reducer for task state
│     └─ tests
│        ├─ unit
│        │  └─ KanbanBoard.test.jsx
│        ├─ integration
│        │  └─ WebSocketIntegration.test.jsx
│        └─ e2e
│           └─ KanbanBoard.e2e.test.js
└─ README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Git

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Benakaprasad/vyorius-intern-assignment.git
cd vyorius-intern-assignment
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
npm install uuid mongoose dotenv
```

Create a `.env` file inside `backend/`:

```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
```

Start the backend server:

```bash
npm run dev
```

> Server runs on **http://localhost:5000**  
> Health check available at **http://localhost:5000/health**

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm install @hello-pangea/dnd react-select recharts react-dropzone
```

Create a `.env` file inside `frontend/`:

```
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

> App runs on **http://localhost:3000**

---

## ✅ Features Implemented

### 🗂 Kanban Board
- Three columns — **To Do**, **In Progress**, **Done**
- Tasks are **draggable** between columns using @hello-pangea/dnd
- UI updates **in real-time** across all connected clients

### 📝 Task Management
- **Create** tasks with title and description
- **Edit** task title and description inline
- **Delete** tasks with instant sync
- **Move** tasks between columns via drag and drop

### 🎯 Priority & Category
- Each task has a **priority** — Low, Medium, High
- Each task has a **category** — Bug, Feature, Enhancement
- Both use **React Select** dropdowns with instant WebSocket sync

### 📎 File Attachments
- Upload **images and PDFs** to any task
- Image attachments show a **live preview**
- Invalid file types show an **error message**

### 📊 Progress Chart
- **Recharts BarChart** shows task count per column
- Displays **% completion** (Done vs total tasks)
- Updates **in real-time** as tasks move between columns

### 🔌 Real-time WebSocket Sync
- All connected clients see changes **instantly**
- New clients receive full task state on connection via `sync:tasks`
- **Loading indicator** shown while waiting for server sync

---

## 🔌 WebSocket Event Reference

| Event | Direction | Description |
|---|---|---|
| `sync:tasks` | Server → Client | Sends all tasks to newly connected client |
| `task:create` | Client → Server | Create a new task |
| `task:update` | Client → Server | Update task fields |
| `task:move` | Client → Server | Move task to another column |
| `task:delete` | Client → Server | Delete a task |
| `task:created` | Server → All Clients | Broadcast confirmed new task |
| `task:updated` | Server → All Clients | Broadcast updated task |
| `task:deleted` | Server → All Clients | Broadcast deleted task id |
| `error` | Server → Client | Validation or not-found error |

---

## 🧪 Running Tests

### Unit & Integration Tests (Vitest + React Testing Library)

```bash
cd frontend
npm test
```

Expected output:

```
✓ src/tests/unit/KanbanBoard.test.jsx          (13 tests)
✓ src/tests/integration/WebSocketIntegration.test.jsx   (8 tests)

Test Files  2 passed (2)
     Tests  21 passed (21)
```

### End-to-End Tests (Playwright)

Make sure **both servers are running** first, then:

```bash
cd frontend
npm run test:e2e
```

Playwright will open a real browser and run the full test suite including:
- Task creation and deletion
- Drag and drop between columns
- Priority and category dropdown selection
- File upload validation
- Progress chart updates

---

## 📊 Evaluation Criteria

| **Criteria** | **Weightage** | **Status** |
|---|---|---|
| **WebSocket Implementation** | 10% | ✅ All 5 events implemented with validation and error handling |
| **React Component Structure** | 10% | ✅ Custom hooks, reducer pattern, reusable components |
| **Testing** | 50% | ✅ 21 unit/integration tests passing + full E2E suite |
| **Code Quality & Best Practices** | 20% | ✅ ESLint, useMemo, useCallback, .env, .gitignore |
| **UI & UX** | 10% | ✅ Responsive layout, loading states, error banners |

---

## 🔮 Proposed Next Step — Multi-tenant Organisation Boards with RBAC

### 🔍 Problem Identified

The current implementation is **publicly accessible** — any user with the URL can view and modify all tasks with no restrictions. In a real organisation this creates two critical issues:

- **Security risk** — Sensitive project tasks are exposed to anyone
- **Data integrity risk** — Any user can modify or delete another team's work without permission

### 💡 Proposed Solution

Implement **Multi-tenancy with Role-Based Access Control (RBAC)** as the next major milestone. This transforms the board from a public demo into a production-ready tool that organisations can safely use internally.

### 🏗 What This Involves

**1. Authentication**
- Users register and log in with email/password or Google OAuth
- JWT tokens issued on login and verified on every WebSocket connection

**2. Organisations**
- Each company creates their own Organisation
- A board belongs to one Organisation only
- Users from other Organisations cannot access it

**3. Role-Based Permissions**

| Role | Permissions |
|---|---|
| **Admin** | Full access — invite members, manage roles, delete board |
| **Member** | Create, update, move, and delete tasks |
| **Viewer** | Read-only — can see the board but cannot modify anything |

**4. Invite System**
- Admin sends an invite link scoped to their Organisation
- Link expires after 24 hours for security
- New member joins directly into the correct Organisation

**5. Audit Log**
- Every action logged with user name and timestamp
- Admin can view full history of who created, moved, or deleted what

### 🛠 Proposed Tech

| Feature | Technology |
|---|---|
| Authentication | JWT + bcrypt |
| OAuth | Passport.js with Google strategy |
| Database | MongoDB — Organisation, User, Board collections |
| WebSocket Auth | JWT verification in Socket.IO middleware |

### 💼 Why This Matters

This directly addresses the real-world concerns of **data privacy**, **team isolation**, and **accountability** — the same problems that enterprise tools like Jira and Trello solve at scale. Implementing this would make the Kanban board a viable internal SaaS product for any organisation.

---

## 👨‍💻 Author

**Benakaprasad**  
GitHub: [vyorius-intern-assignment](https://github.com/Benakaprasad/vyorius-intern-assignment)