import { useEffect, useRef, useCallback } from "react";
import {io} from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useSocket(onEvent)
{
    const socketRef = useRef(null);
    useEffect(() =>
    {
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling']});
        socketRef.current = socket;
        socket.on('sync:tasks', (tasks) => onEvent('sync:tasks', tasks));
        socket.on('task:created', (task) => onEvent('task:created', task));
        socket.on('task:updated', (task) => onEvent('task:updated', task));
        socket.on('task:deleted', (data) => onEvent('task:deleted', data));
        socket.on('error', (err) => onEvent('error', err));
        return () => socket.disconnect();
    }, []);
    const emit = useCallback((event, data) =>
    {
        socketRef.current?.emit(event, data)
    }, []);
    return {emit, socket: socketRef};
}