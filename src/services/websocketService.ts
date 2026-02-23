// WebSocket Service using BroadcastChannel API for real-time cross-tab communication
// In a real app, this would connect to a Spring Boot WebSocket server via STOMP

export type WSEventType =
  | 'USER_JOINED'
  | 'USER_LEFT'
  | 'CODE_UPDATE'
  | 'COMMENT_ADDED'
  | 'REVIEW_APPROVED'
  | 'CHANGES_REQUESTED'
  | 'CURSOR_UPDATE'
  | 'ROOM_CREATED'
  | 'PING'
  | 'PONG';

export interface WSMessage {
  type: WSEventType;
  roomId: string;
  senderId: string;
  senderName: string;
  instanceId: string;
  payload: Record<string, unknown>;
  timestamp: number;
}

type MessageHandler = (msg: WSMessage) => void;

class WebSocketService {
  private channel: BroadcastChannel | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private currentRoomId: string | null = null;
  public userId: string = '';
  public userName: string = '';
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected: boolean = false;
  private onConnectionChange: ((connected: boolean) => void) | null = null;
  private instanceId: string = Math.random().toString(36).substring(2, 10); // Unique to this tab

  // Simulate WebSocket connection to a room
  connect(roomId: string, userId: string, userName: string, onConnectionChange?: (connected: boolean) => void) {
    this.disconnect(); // Clean up previous connection

    this.currentRoomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.onConnectionChange = onConnectionChange || null;

    // BroadcastChannel simulates WebSocket server broadcast
    // Each room gets its own channel (like a WebSocket topic in STOMP)
    this.channel = new BroadcastChannel(`devElevate_room_${roomId}`);

    this.channel.onmessage = (event: MessageEvent<WSMessage>) => {
      const msg: WSMessage = event.data;
      // Don't process our own messages (simulate server echo filtering per connection/tab)
      if (msg.instanceId === this.instanceId) return;
      this.dispatchMessage(msg);
    };

    this.isConnected = true;
    this.onConnectionChange?.(true);

    // Simulate WebSocket heartbeat (like STOMP PING/PONG)
    this.pingInterval = setInterval(() => {
      this.send('PING', {});
    }, 5000);

    // Announce join
    this.send('USER_JOINED', { userName });

    console.log(`[WS] Connected to room: ${roomId} as ${userName}`);
    return this;
  }

  disconnect() {
    if (this.currentRoomId && this.isConnected) {
      this.send('USER_LEFT', { userName: this.userName });
    }

    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    this.isConnected = false;
    this.onConnectionChange?.(false);
    this.currentRoomId = null;
    this.handlers.clear();
    console.log('[WS] Disconnected');
  }

  // Subscribe to specific event types (like STOMP topic subscription)
  subscribe(eventType: WSEventType, handler: MessageHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  // Send message to all room participants (like STOMP SEND)
  send(type: WSEventType, payload: Record<string, unknown>) {
    if (!this.channel || !this.currentRoomId) return;

    const msg: WSMessage = {
      type,
      roomId: this.currentRoomId,
      senderId: this.userId,
      senderName: this.userName,
      instanceId: this.instanceId,
      payload,
      timestamp: Date.now(),
    };

    try {
      this.channel.postMessage(msg);
    } catch (e) {
      console.error('[WS] Send error:', e);
    }
  }

  // Broadcast code update (throttled in component)
  sendCodeUpdate(code: string) {
    this.send('CODE_UPDATE', { code });
  }

  // Broadcast cursor position
  sendCursorUpdate(line: number, col: number) {
    this.send('CURSOR_UPDATE', { line, col });
  }

  // Broadcast new comment
  sendComment(comment: { id: string; lineNumber: number; content: string; author: string }) {
    this.send('COMMENT_ADDED', { comment });
  }

  // Broadcast review status
  sendApproval() {
    this.send('REVIEW_APPROVED', {});
  }

  sendRequestChanges() {
    this.send('CHANGES_REQUESTED', {});
  }

  get connected() {
    return this.isConnected;
  }

  get roomId() {
    return this.currentRoomId;
  }

  private dispatchMessage(msg: WSMessage) {
    const handlers = this.handlers.get(msg.type) || [];
    handlers.forEach((h) => h(msg));
  }
}

// Singleton instance (like a single WebSocket connection)
export const wsService = new WebSocketService();
