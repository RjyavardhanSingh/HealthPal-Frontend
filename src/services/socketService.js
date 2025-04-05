import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.activeConsultationId = null;
    this.messageCallbacks = new Set();
  }

  // Add this to fix socket connection issues
  connect() {
    if (this.socket && this.socket.connected) return;
    
    console.log('Connecting to socket server...');
    
    // Add connection options with explicit protocol
    const options = {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      transports: ['websocket', 'polling'] // Try websocket first, fallback to polling
    };
    
    // Use explicit protocol and port
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    this.socket = io(apiUrl, options);
    
    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket.id);
      this.isConnected = true;
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to consultation server. Please refresh the page.');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
      this.activeConsultationId = null;
    });
    
    // Set up the receive message handler ONCE
    this.socket.on('receive-message', (message) => {
      console.log('Message received:', message);
      this.messageCallbacks.forEach(callback => callback(message));
    });
  }

  joinConsultation(consultationId) {
    if (!this.socket || !this.socket.connected) {
      this.connect();
      
      // After connecting, we need to wait a bit for the connection to be established
      setTimeout(() => {
        this.emitJoinConsultation(consultationId);
      }, 1000);
    } else {
      this.emitJoinConsultation(consultationId);
    }
  }

  // Helper method to emit join event
  emitJoinConsultation(consultationId) {
    if (!consultationId) {
      console.error('No consultation ID provided');
      return;
    }
    
    // Leave previous room if any
    if (this.activeConsultationId && this.activeConsultationId !== consultationId) {
      console.log(`Leaving previous consultation: ${this.activeConsultationId}`);
      this.socket.emit('leave-consultation', this.activeConsultationId);
    }
    
    console.log(`Joining consultation room: ${consultationId}`);
    this.socket.emit('join-consultation', consultationId);
    this.activeConsultationId = consultationId;
  }

  sendMessage(consultationId, message) {
    if (!this.socket) this.connect();
    
    // Add unique ID to prevent duplicates
    const messageWithId = { 
      ...message, 
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}` 
    };
    
    this.socket.emit('send-message', { consultationId, message: messageWithId });
    return messageWithId;
  }

  // New approach: register callback without duplicates
  onMessageReceived(callback) {
    if (!this.socket) this.connect();
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  listenForMessages(consultationId, callback) {
    if (!this.socket) this.connect();
    
    // First join the consultation to ensure we're in the right room
    this.joinConsultation(consultationId);
    
    // Register the callback
    const wrappedCallback = (message) => {
      console.log('Received message in room:', consultationId, message);
      callback(message);
    };
    
    this.messageCallbacks.add(wrappedCallback);
    
    // Return a cleanup function
    return () => {
      console.log('Removing message callback');
      this.messageCallbacks.delete(wrappedCallback);
    };
  }

  disconnect() {
    if (this.socket) {
      // Leave active consultation
      if (this.activeConsultationId) {
        this.socket.emit('leave-consultation', this.activeConsultationId);
      }
      
      // Clear all callbacks
      this.messageCallbacks.clear();
      
      // Disconnect socket
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.activeConsultationId = null;
    }
  }
}

export default new SocketService();