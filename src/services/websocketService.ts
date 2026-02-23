// WebSocket Service using PieSocket for real cross-user communication
// This replaces the local BroadcastChannel with a real cloud-based WebSocket relay.

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
  private socket: WebSocket | null = null;
  private handlers: Map<string, MessageHandler[]> = new Map();
  private currentRoomId: string | null = null;
  public userId: string = '';
  public userName: string = '';
  private isConnected: boolean = false;
  private onConnectionChange: ((connected: boolean) => void) | null = null;
  private instanceId: string = Math.random().toString(36).substring(2, 10);

  // Public Demo API Key for PieSocket (Cloud WebSocket Relay)
  private readonly API_KEY = 'VCXCEuvh3eb96pS6S2F2An9LInG6p0XkMhFv8E8X';
  private readonly CLUSTER = 'free.blr2';

  connect(roomId: string, userId: string, userName: string, onConnectionChange?: (connected: boolean) => void) {
    this.disconnect();

    this.currentRoomId = roomId;
    this.userId = userId;
    this.userName = userName;
    this.onConnectionChange = onConnectionChange || null;

    // Use PieSocket for real-time cloud relay
    const wsUrl = `wss://${this.CLUSTER}.piesocket.com/v3/${roomId}?api_key=${this.API_KEY}&notify_self=0`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.onConnectionChange?.(true);
        console.log(`[Cloud-WS] Connected to room: ${roomId}`);
        // Announce join to others in the cloud room
        this.send('USER_JOINED', { userName });
      };

      this.socket.onmessage = (event) => {
        try {
          const msg: WSMessage = JSON.parse(event.data);
          // Filter out our own messages sent by the relay (if notify_self was 1)
          if (msg.instanceId === this.instanceId) return;
          this.dispatchMessage(msg);
        } catch (e) {
          // Might be a non-JSON message from the server
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.onConnectionChange?.(false);
      };

      this.socket.onerror = (err) => {
        console.error('[Cloud-WS] Connection error:', err);
      };

    } catch (e) {
      console.error('[Cloud-WS] Setup error:', e);
    }

    return this;
  }

  disconnect() {
    if (this.currentRoomId && this.isConnected) {
      this.send('USER_LEFT', { userName: this.userName });
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.isConnected = false;
    this.onConnectionChange?.(false);
    this.currentRoomId = null;
    this.handlers.clear();
    console.log('[Cloud-WS] Disconnected');
  }

  subscribe(eventType: WSEventType, handler: MessageHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    return () => {
      const handlers = this.handlers.get(eventType) || [];
      const index = handlers.indexOf(handler);
      if (index > -1) handlers.splice(index, 1);
    };
  }

  send(type: WSEventType, payload: Record<string, unknown>) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN || !this.currentRoomId) return;

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
      this.socket.send(JSON.stringify(msg));
    } catch (e) {
      console.error('[Cloud-WS] Send error:', e);
    }
  }

  sendCodeUpdate(code: string) {
    this.send('CODE_UPDATE', { code });
  }

  sendCursorUpdate(line: number, col: number) {
    this.send('CURSOR_UPDATE', { line, col });
  }

  sendComment(comment: { id: string; lineNumber: number; content: string; author: string }) {
    this.send('COMMENT_ADDED', { comment });
  }

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

export const wsService = new WebSocketService();
