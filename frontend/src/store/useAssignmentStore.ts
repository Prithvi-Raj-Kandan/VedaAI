import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface AssignmentStore {
  socket: Socket | null;
  activeAssignmentId: string | null;
  assignmentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'idle';
  generatedData: any | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
  setActiveAssignment: (id: string) => void;
  reset: () => void;
  setGeneratedData: (data: any, status: 'pending' | 'processing' | 'completed' | 'failed') => void;
}

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  socket: null,
  activeAssignmentId: null,
  assignmentStatus: 'idle',
  generatedData: null,
  
  connectSocket: () => {
    if (get().socket) return;
    const newSocket = io('http://localhost:8000');
    
    newSocket.on('connect', () => {
      console.log('Socket connected');
      const activeId = get().activeAssignmentId;
      if (activeId) {
        newSocket.emit('joinAssignment', activeId);
      }
    });

    newSocket.on('assignment-updated', (data) => {
      console.log('Received update:', data);
      set({ 
        assignmentStatus: data.status,
        generatedData: data.assignment?.generatedPaper || get().generatedData
      });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  setActiveAssignment: (id: string) => {
    const socket = get().socket;
    if (socket && socket.connected) {
      socket.emit('joinAssignment', id);
    }
    set({ activeAssignmentId: id, assignmentStatus: 'pending', generatedData: null });
  },

  setGeneratedData: (data: any, status: 'pending' | 'processing' | 'completed' | 'failed') => {
    set({ generatedData: data, assignmentStatus: status });
  },

  reset: () => set({ activeAssignmentId: null, assignmentStatus: 'idle', generatedData: null }),
}));
