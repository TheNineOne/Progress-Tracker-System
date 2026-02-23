import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Code2,
  Plus,
  Users,
  MessageSquare,
  Check,
  X,
  Clock,
  Copy,
  LogIn,
  Wifi,
  WifiOff,
  Download,
  Trash2,
  Send,
  ArrowLeft,
  Radio,
  Hash,
  Terminal,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { cn } from '../../utils/cn';
import type { CodeRoom as CodeRoomType, CodeComment, ActivityLogEntry, Participant } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { wsService, type WSMessage } from '../../services/websocketService';
import Editor from '@monaco-editor/react';

const SAMPLE_SNIPPETS: Record<string, { code: string; lang: string }> = {
  java: {
    lang: 'Java',
    code: `// Java Spring Boot Controller
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody @Valid User user) {
        User savedUser = userService.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
  },
  python: {
    lang: 'Python',
    code: `# Python FastAPI Example
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="DevElevate API")

class User(BaseModel):
    id: Optional[int] = None
    name: str
    email: str
    role: str = "developer"

users_db: List[User] = []

@app.get("/users", response_model=List[User])
async def get_users():
    return users_db

@app.post("/users", response_model=User, status_code=201)
async def create_user(user: User):
    user.id = len(users_db) + 1
    users_db.append(user)
    return user

@app.get("/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = next((u for u in users_db if u.id == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user`,
  },
  javascript: {
    lang: 'JavaScript',
    code: `// Node.js Express REST API
const express = require('express');
const router = express.Router();

// Middleware
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    // Verify JWT token here
    next();
};

// GET all users
router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.findAll({
            where: { isActive: true },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create user
router.post('/users', async (req, res) => {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    res.status(201).json(user);
});

module.exports = router;`,
  },
};

const PARTICIPANT_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export function CodeRoom() {
  const { isDarkMode, codeRooms, currentRoom, addCodeRoom, updateCodeRoom, setCurrentRoom, user } = useAppStore();

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [selectedLang, setSelectedLang] = useState('java');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinError, setJoinError] = useState('');

  // Editor states
  const [code, setCode] = useState(currentRoom?.code || '');
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [lineCount, setLineCount] = useState((currentRoom?.code || '').split('\n').length || 1);

  // WebSocket / real-time states
  const [wsConnected, setWsConnected] = useState(false);
  const [liveUsers, setLiveUsers] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const editorRef = useRef<any>(null);
  const codeUpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorUpdateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    notifTimeout.current = setTimeout(() => setNotification(null), 3000);
  }, []);

  // Connect to WebSocket when room changes
  useEffect(() => {
    if (currentRoom && user) {
      setCode(currentRoom.code);
      setLineCount(currentRoom.code.split('\n').length);

      if (editorRef.current && editorRef.current.getValue() !== currentRoom.code) {
        editorRef.current.setValue(currentRoom.code);
      }

      wsService.connect(currentRoom.id, user.id, user.name, (connected) => {
        setWsConnected(connected);
      });

      // Subscribe to WebSocket events
      const unsubJoin = wsService.subscribe('USER_JOINED', (msg: WSMessage) => {
        showNotif(`🟢 ${msg.senderName} joined the room`);
        setLiveUsers(prev => [...new Set([...prev, msg.senderName])]);
        const room = useAppStore.getState().currentRoom;
        if (room) {
          const isParticipant = room.participants.some(p => p.id === msg.senderId);
          let updatedParticipants = room.participants;
          if (!isParticipant) {
            const color = PARTICIPANT_COLORS[room.participants.length % PARTICIPANT_COLORS.length];
            updatedParticipants = [...room.participants, { id: msg.senderId, name: msg.senderName, color, isOnline: true }];
          }
          updateCodeRoom(room.id, {
            participants: updatedParticipants,
            activityLog: [...(room.activityLog || []).slice(-19), {
              id: uuidv4(), type: 'join', user: msg.senderName,
              message: `${msg.senderName} joined`, timestamp: new Date()
            }]
          });
        }
      });

      const unsubLeave = wsService.subscribe('USER_LEFT', (msg: WSMessage) => {
        showNotif(`🔴 ${msg.senderName} left the room`);
        setLiveUsers(prev => prev.filter(u => u !== msg.senderName));
      });

      const unsubCode = wsService.subscribe('CODE_UPDATE', (msg: WSMessage) => {
        const newCode = msg.payload.code as string;

        // Update local React state and line counter
        setCode(newCode);
        setLineCount(newCode.split('\n').length);

        // Soft-update the editor if it differs from local model, preserving cursor!
        if (editorRef.current && editorRef.current.getValue() !== newCode) {
          const position = editorRef.current.getPosition();
          editorRef.current.setValue(newCode);
          if (position) {
            editorRef.current.setPosition(position);
          }
        }

        const room = useAppStore.getState().currentRoom;
        if (room) updateCodeRoom(room.id, { code: newCode });
      });

      const unsubComment = wsService.subscribe('COMMENT_ADDED', (msg: WSMessage) => {
        const comment = msg.payload.comment as CodeComment;
        showNotif(`💬 ${msg.senderName} commented on line ${comment.lineNumber}`);
        const room = useAppStore.getState().currentRoom;
        if (room) {
          updateCodeRoom(room.id, {
            comments: [...room.comments, comment],
            activityLog: [...(room.activityLog || []).slice(-19), {
              id: uuidv4(), type: 'comment', user: msg.senderName,
              message: `${msg.senderName} commented on line ${comment.lineNumber}`, timestamp: new Date()
            }]
          });
        }
      });

      const unsubApprove = wsService.subscribe('REVIEW_APPROVED', (msg: WSMessage) => {
        showNotif(`✅ ${msg.senderName} approved the review`);
        const room = useAppStore.getState().currentRoom;
        if (room) updateCodeRoom(room.id, { status: 'approved' });
      });

      const unsubChanges = wsService.subscribe('CHANGES_REQUESTED', (msg: WSMessage) => {
        showNotif(`⚠️ ${msg.senderName} requested changes`);
        const room = useAppStore.getState().currentRoom;
        if (room) updateCodeRoom(room.id, { status: 'changes-requested' });
      });

      return () => {
        unsubJoin();
        unsubLeave();
        unsubCode();
        unsubComment();
        unsubApprove();
        unsubChanges();
        wsService.disconnect();
        setWsConnected(false);
        setLiveUsers([]);
      };
    }
  }, [currentRoom?.id]);

  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;

    editor.onDidChangeCursorPosition((e: any) => {
      const pos = { line: e.position.lineNumber, col: e.position.column };
      setCursorPos(pos);
      if (cursorUpdateTimeout.current) clearTimeout(cursorUpdateTimeout.current);
      cursorUpdateTimeout.current = setTimeout(() => {
        wsService.sendCursorUpdate(pos.line, pos.col);
      }, 100);
    });
    editor.addAction({
      id: 'add-comment',
      label: 'Add Comment to Line',
      contextMenuGroupId: 'navigation',
      contextMenuOrder: 1.5,
      run: function (ed: any) {
        setSelectedLine(ed.getPosition().lineNumber);
      }
    });

    editor.onMouseDown((e: any) => {
      // e.target.type: 2 is the line numbers margin
      if (e.target.type === 2) {
        if (e.target.position) {
          setSelectedLine(e.target.position.lineNumber);
        }
      }
    });

    // Provide visual decorations for remote cursors if needed
  };

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    if (newCode === code) return;
    setCode(newCode);
    setLineCount(newCode.split('\n').length);

    // Throttle code broadcast (send only after 300ms of no typing)
    if (codeUpdateTimeout.current) clearTimeout(codeUpdateTimeout.current);
    codeUpdateTimeout.current = setTimeout(() => {
      wsService.sendCodeUpdate(newCode);
      const room = useAppStore.getState().currentRoom;
      if (room) {
        const activity: ActivityLogEntry = {
          id: uuidv4(), type: 'code-update', user: user?.name || 'You',
          message: `${user?.name || 'You'} updated the code`, timestamp: new Date()
        };
        updateCodeRoom(room.id, {
          code: newCode,
          activityLog: [...(room.activityLog || []).slice(-19), activity]
        });
      }
    }, 300);
  };

  const handleCreateRoom = () => {
    const lang = selectedLang;
    const snippet = SAMPLE_SNIPPETS[lang];
    const newRoom: CodeRoomType = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: roomName.trim() || 'Code Review Room',
      code: snippet.code,
      language: lang,
      participants: [{
        id: user?.id || '1',
        name: user?.name || 'Developer',
        color: PARTICIPANT_COLORS[0],
        isOnline: true,
      }],
      comments: [],
      activityLog: [{
        id: uuidv4(), type: 'join', user: user?.name || 'Developer',
        message: `${user?.name || 'Developer'} created the room`, timestamp: new Date()
      }],
      status: 'active',
      createdAt: new Date(),
    };
    addCodeRoom(newRoom);
    setCurrentRoom(newRoom);
    setShowCreateModal(false);
    setRoomName('');
  };

  const handleJoinRoom = () => {
    const id = joinRoomId.trim().toUpperCase();
    if (!id) { setJoinError('Please enter a Room ID'); return; }

    const room = codeRooms.find(r => r.id === id);
    if (!room) {
      setJoinError(`Room "${id}" not found. (Note: Rooms are local to your browser session in this demo)`);
      return;
    }

    // Add participant if not already in
    const alreadyIn = room.participants.some(p => p.id === user?.id);
    if (!alreadyIn) {
      const color = PARTICIPANT_COLORS[room.participants.length % PARTICIPANT_COLORS.length];
      const newParticipant: Participant = {
        id: user?.id || uuidv4(),
        name: user?.name || 'Developer',
        color,
        isOnline: true,
      };
      const activity: ActivityLogEntry = {
        id: uuidv4(), type: 'join', user: user?.name || 'Developer',
        message: `${user?.name || 'Developer'} joined the room`, timestamp: new Date()
      };
      updateCodeRoom(room.id, {
        participants: [...room.participants, newParticipant],
        activityLog: [...(room.activityLog || []).slice(-19), activity]
      });
    }

    setShowJoinModal(false);
    setJoinRoomId('');
    setJoinError('');
    setCurrentRoom(room);
  };

  const handleAddComment = () => {
    if (!commentText.trim() || selectedLine === null || !currentRoom) return;
    const newComment: CodeComment = {
      id: uuidv4(), lineNumber: selectedLine, content: commentText,
      author: user?.name || 'Developer', timestamp: new Date()
    };
    const activity: ActivityLogEntry = {
      id: uuidv4(), type: 'comment', user: user?.name || 'Developer',
      message: `${user?.name || 'Developer'} commented on line ${selectedLine}`, timestamp: new Date()
    };

    // Broadcast via WebSocket
    wsService.sendComment(newComment);

    updateCodeRoom(currentRoom.id, {
      comments: [...currentRoom.comments, newComment],
      activityLog: [...(currentRoom.activityLog || []).slice(-19), activity]
    });
    setCommentText('');
    setSelectedLine(null);
  };

  const handleApprove = () => {
    if (!currentRoom) return;
    wsService.sendApproval();
    const activity: ActivityLogEntry = {
      id: uuidv4(), type: 'approve', user: user?.name || 'Developer',
      message: `${user?.name || 'Developer'} approved the review`, timestamp: new Date()
    };
    updateCodeRoom(currentRoom.id, {
      status: 'approved',
      activityLog: [...(currentRoom.activityLog || []).slice(-19), activity]
    });
  };

  const handleRequestChanges = () => {
    if (!currentRoom) return;
    wsService.sendRequestChanges();
    const activity: ActivityLogEntry = {
      id: uuidv4(), type: 'request-changes', user: user?.name || 'Developer',
      message: `${user?.name || 'Developer'} requested changes`, timestamp: new Date()
    };
    updateCodeRoom(currentRoom.id, {
      status: 'changes-requested',
      activityLog: [...(currentRoom.activityLog || []).slice(-19), activity]
    });
  };

  const handleLeaveRoom = () => {
    wsService.disconnect();
    setCurrentRoom(null);
    setWsConnected(false);
  };

  const copyRoomId = () => {
    if (currentRoom) {
      navigator.clipboard.writeText(currentRoom.id);
      showNotif('📋 Room ID copied!');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    showNotif('📋 Code copied to clipboard!');
  };

  const downloadCode = () => {
    const ext: Record<string, string> = { java: 'java', python: 'py', javascript: 'js' };
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRoom?.name || 'code'}.${ext[currentRoom?.language || 'java'] || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };



  const getActivityIcon = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'join': return '🟢';
      case 'leave': return '🔴';
      case 'code-update': return '✏️';
      case 'comment': return '💬';
      case 'approve': return '✅';
      case 'request-changes': return '⚠️';
      default: return '📌';
    }
  };

  const getActivityBorder = (type: ActivityLogEntry['type']) => {
    switch (type) {
      case 'join': return 'border-emerald-500';
      case 'leave': return 'border-red-500';
      case 'approve': return 'border-green-500';
      case 'request-changes': return 'border-amber-500';
      case 'comment': return 'border-blue-500';
      default: return 'border-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn('text-3xl font-bold flex items-center gap-3', isDarkMode ? 'text-white' : 'text-gray-900')}>
            <Code2 className="w-8 h-8 text-cyan-500" />
            Real-Time Code Review
          </h1>
          <p className={cn('mt-1 flex items-center gap-2', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
            <Radio className="w-4 h-4 text-cyan-500 animate-pulse" />
            Collaborative editing powered by WebSockets — open in another tab to sync live
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!currentRoom && (
            <>
              <button
                onClick={() => { setShowJoinModal(true); setJoinError(''); }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all border',
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-violet-500'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-violet-400'
                )}
              >
                <LogIn className="w-4 h-4" />
                Join Room
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" />
                Create Room
              </button>
            </>
          )}
          {currentRoom && (
            <>
              <button onClick={handleApprove}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 transition-all font-medium">
                <Check className="w-4 h-4" /> Approve
              </button>
              <button onClick={handleRequestChanges}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600/10 border border-amber-500/30 text-amber-500 hover:bg-amber-600/20 transition-all font-medium">
                <X className="w-4 h-4" /> Request Changes
              </button>
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600/20 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Leave Room
              </button>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-gray-800 border border-gray-700 text-white text-sm font-medium shadow-2xl shadow-black/40">
            {notification}
          </div>
        </div>
      )}

      {currentRoom ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* === Main Editor Area === */}
          <div className="xl:col-span-3 space-y-4">
            {/* Room Info Bar */}
            <div className={cn(
              'flex flex-wrap items-center gap-3 p-4 rounded-2xl border',
              isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            )}>
              {/* Room Name & ID */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  'bg-gradient-to-br from-cyan-500 to-blue-600'
                )}>
                  <Terminal className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className={cn('font-bold truncate', isDarkMode ? 'text-white' : 'text-gray-900')}>
                    {currentRoom.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <Hash className="w-3 h-3 text-gray-500" />
                    <code className={cn(
                      'px-2 py-0.5 rounded-lg text-xs font-mono font-bold tracking-widest',
                      isDarkMode ? 'bg-gray-700 text-cyan-400' : 'bg-gray-100 text-cyan-600'
                    )}>{currentRoom.id}</code>
                    <button onClick={copyRoomId} title="Copy Room ID"
                      className="text-gray-500 hover:text-cyan-400 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <span className={cn('text-xs', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                      Share this ID to invite others
                    </span>
                  </div>
                </div>
              </div>

              {/* WS Status */}
              <div className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium',
                wsConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-gray-700/50 text-gray-500 border border-gray-700'
              )}>
                {wsConnected ? (
                  <><Wifi className="w-3.5 h-3.5" /><span>WebSocket Live</span></>
                ) : (
                  <><WifiOff className="w-3.5 h-3.5" /><span>Connecting...</span></>
                )}
              </div>

              {/* Review Status */}
              <div className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-semibold',
                currentRoom.status === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : currentRoom.status === 'changes-requested'
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                    : 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
              )}>
                {currentRoom.status === 'approved' ? '✅ Approved'
                  : currentRoom.status === 'changes-requested' ? '⚠️ Changes Requested'
                    : '🔍 In Review'}
              </div>

              {/* Removed buttons, moved to top header */}
            </div>

            {/* Code Editor */}
            <div className={cn(
              'rounded-2xl border overflow-hidden shadow-xl',
              isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
            )}>
              {/* Editor Title Bar */}
              <div className={cn(
                'flex items-center justify-between px-4 py-2.5 border-b',
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              )}>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500 hover:opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 hover:opacity-80" />
                  </div>
                  <span className={cn('text-sm font-medium', isDarkMode ? 'text-gray-300' : 'text-gray-600')}>
                    {currentRoom.name.toLowerCase().replace(/ /g, '-')}.{currentRoom.language === 'java' ? 'java' : currentRoom.language === 'python' ? 'py' : 'js'}
                  </span>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    isDarkMode ? 'bg-cyan-500/10 text-cyan-400' : 'bg-cyan-100 text-cyan-600'
                  )}>
                    {SAMPLE_SNIPPETS[currentRoom.language]?.lang || currentRoom.language}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Cursor stats */}
                  <span className={cn('text-xs font-mono px-2 py-1 rounded-lg', isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')}>
                    Ln {cursorPos.line} : Col {cursorPos.col}
                  </span>
                  <span className={cn('text-xs px-2 py-1 rounded-lg', isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600')}>
                    {lineCount} lines
                  </span>
                  <button onClick={copyCode}
                    className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                      isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button onClick={downloadCode}
                    className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                      isDarkMode ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200')}>
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={() => { if (editorRef.current) { editorRef.current.setValue(''); } handleEditorChange(''); }}
                    className={cn('flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors',
                      isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-600 hover:text-red-600 hover:bg-red-50')}>
                    <Trash2 className="w-3.5 h-3.5" /> Clear
                  </button>
                  {/* Live indicator */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-400 font-medium">Live</span>
                  </div>
                </div>
              </div>

              {/* Editor Body */}
              <div className="relative w-full" style={{ height: '520px' }}>
                <Editor
                  height="100%"
                  width="100%"
                  language={currentRoom.language === 'java' ? 'java' : currentRoom.language === 'python' ? 'python' : 'javascript'}
                  theme={isDarkMode ? 'vs-dark' : 'light'}
                  defaultValue={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorMount}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 24,
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    cursorSmoothCaretAnimation: 'on',
                  }}
                />
              </div>

              {/* Status Bar */}
              <div className={cn(
                'flex items-center justify-between px-4 py-1.5 border-t text-xs',
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
              )}>
                <div className="flex items-center gap-4">
                  <span className={isDarkMode ? 'text-cyan-400' : 'text-cyan-600'}>
                    {SAMPLE_SNIPPETS[currentRoom.language]?.lang || currentRoom.language}
                  </span>
                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>UTF-8</span>
                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>Tab Size: 4</span>
                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                    {code.length} chars
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
                    {currentRoom.participants.length + liveUsers.length} active
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    WebSocket Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Comment Input (appears when line is selected) */}
            {selectedLine !== null && (
              <div className={cn(
                'flex items-center gap-3 p-4 rounded-2xl border animate-pulse-glow',
                isDarkMode ? 'bg-gray-800/60 border-cyan-500/30' : 'bg-white border-cyan-300 shadow-md'
              )}>
                <div className={cn(
                  'flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold',
                  isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
                )}>
                  <MessageSquare className="w-3.5 h-3.5" />
                  Line {selectedLine}
                </div>
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddComment(); if (e.key === 'Escape') setSelectedLine(null); }}
                  placeholder="Add a comment... (Enter to submit, Esc to cancel)"
                  autoFocus
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  )}
                />
                <button onClick={handleAddComment}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500 transition-colors">
                  <Send className="w-4 h-4" /> Send
                </button>
                <button onClick={() => setSelectedLine(null)}
                  className={cn('p-2.5 rounded-xl transition-colors',
                    isDarkMode ? 'text-gray-500 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100')}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Click-to-comment hint */}
            {selectedLine === null && (
              <p className={cn('text-xs text-center', isDarkMode ? 'text-gray-600' : 'text-gray-400')}>
                💡 Click any line number to add a comment
              </p>
            )}
          </div>

          {/* === Right Sidebar === */}
          <div className="space-y-4">
            {/* Participants */}
            <div className={cn(
              'p-4 rounded-2xl border',
              isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            )}>
              <h3 className={cn('font-bold mb-3 flex items-center gap-2 text-sm', isDarkMode ? 'text-white' : 'text-gray-900')}>
                <Users className="w-4 h-4 text-cyan-500" />
                Participants ({currentRoom.participants.length})
              </h3>
              <div className="space-y-2">
                {currentRoom.participants.map((p) => (
                  <div key={p.id} className={cn(
                    'flex items-center gap-2.5 p-2.5 rounded-xl',
                    p.id === user?.id ? (isDarkMode ? 'bg-violet-500/10' : 'bg-violet-50') : ''
                  )}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: p.color }}>
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm font-medium truncate', isDarkMode ? 'text-white' : 'text-gray-900')}>
                        {p.name} {p.id === user?.id && <span className="text-xs text-violet-400">(you)</span>}
                      </p>
                    </div>
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0',
                      p.isOnline ? 'bg-emerald-500' : 'bg-gray-500')} />
                  </div>
                ))}
                {liveUsers.filter(n => !currentRoom.participants.some(p => p.name === n)).map((name) => (
                  <div key={name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-cyan-500/5">
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm text-cyan-400 flex-1 truncate">{name} <span className="text-xs opacity-60">live</span></p>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className={cn(
              'p-4 rounded-2xl border',
              isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            )}>
              <h3 className={cn('font-bold mb-3 flex items-center gap-2 text-sm', isDarkMode ? 'text-white' : 'text-gray-900')}>
                <MessageSquare className="w-4 h-4 text-amber-500" />
                Comments ({currentRoom.comments.length})
              </h3>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {currentRoom.comments.length === 0 ? (
                  <p className={cn('text-xs text-center py-4', isDarkMode ? 'text-gray-600' : 'text-gray-400')}>
                    No comments yet
                  </p>
                ) : (
                  [...currentRoom.comments].reverse().map((c) => (
                    <div key={c.id} className={cn(
                      'p-2.5 rounded-xl border-l-2 border-amber-500',
                      isDarkMode ? 'bg-gray-700/40' : 'bg-amber-50'
                    )}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('px-1.5 py-0.5 rounded text-xs font-mono font-bold',
                            isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-200 text-amber-700')}>
                            L{c.lineNumber}
                          </span>
                          <span className={cn('text-xs font-medium', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>{c.author}</span>
                        </div>
                        <span className={cn('text-xs', isDarkMode ? 'text-gray-600' : 'text-gray-400')}>
                          {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className={cn('text-xs leading-relaxed', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Activity Log */}
            <div className={cn(
              'p-4 rounded-2xl border',
              isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
            )}>
              <h3 className={cn('font-bold mb-3 flex items-center gap-2 text-sm', isDarkMode ? 'text-white' : 'text-gray-900')}>
                <Clock className="w-4 h-4 text-violet-500" />
                Activity Log
              </h3>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {[...(currentRoom.activityLog || [])].reverse().slice(0, 15).map((entry) => (
                  <div key={entry.id} className={cn('text-xs py-1.5 pl-3 border-l-2', getActivityBorder(entry.type))}>
                    <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {getActivityIcon(entry.type)} {entry.message}
                    </p>
                    <p className={cn('mt-0.5', isDarkMode ? 'text-gray-600' : 'text-gray-400')}>
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Room — Landing */
        <div className="space-y-6">
          {/* WebSocket Info Banner */}
          <div className={cn(
            'p-5 rounded-2xl border flex items-start gap-4',
            isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'
          )}>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-cyan-500" />
            </div>
            <div>
              <h3 className={cn('font-bold', isDarkMode ? 'text-white' : 'text-gray-900')}>Real-Time WebSocket Collaboration</h3>
              <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>
                Create a room and open it in another browser tab — code edits, cursor movements, comments, and review status sync live via <strong className="text-cyan-400">BroadcastChannel WebSocket API</strong>.
                In production, this connects to a <strong className="text-cyan-400">Spring Boot STOMP WebSocket</strong> server.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Your Rooms */}
            <div className={cn('p-6 rounded-2xl border', isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm')}>
              <h2 className={cn('text-xl font-bold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>
                Your Rooms ({codeRooms.length})
              </h2>
              {codeRooms.length === 0 ? (
                <div className={cn('text-center py-10', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
                  <Code2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No rooms yet. Create your first room!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {codeRooms.map((room) => (
                    <button key={room.id} onClick={() => setCurrentRoom(room)}
                      className={cn(
                        'w-full p-4 rounded-xl border text-left transition-all hover:scale-[1.01] group',
                        isDarkMode
                          ? 'bg-gray-700/40 border-gray-600 hover:border-cyan-500/50 hover:bg-gray-700/70'
                          : 'bg-gray-50 border-gray-200 hover:border-cyan-400 hover:bg-white shadow-sm'
                      )}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={cn('font-semibold', isDarkMode ? 'text-white' : 'text-gray-900')}>{room.name}</h3>
                        <code className={cn('px-2 py-0.5 rounded-lg text-xs font-mono font-bold tracking-widest',
                          isDarkMode ? 'bg-gray-600 text-cyan-400' : 'bg-gray-200 text-cyan-600')}>
                          {room.id}
                        </code>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                          👥 {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full',
                          room.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400'
                            : room.status === 'changes-requested' ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-blue-500/15 text-blue-400')}>
                          {room.status}
                        </span>
                        <span className={cn('px-2 py-0.5 rounded-full',
                          isDarkMode ? 'bg-gray-600 text-gray-400' : 'bg-gray-200 text-gray-500')}>
                          {SAMPLE_SNIPPETS[room.language]?.lang || room.language}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Start */}
            <div className={cn('p-6 rounded-2xl border', isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200 shadow-sm')}>
              <h2 className={cn('text-xl font-bold mb-4', isDarkMode ? 'text-white' : 'text-gray-900')}>Quick Start</h2>
              <div className="space-y-4">
                <button onClick={() => setShowCreateModal(true)}
                  className={cn(
                    'w-full p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01] group',
                    isDarkMode ? 'border-gray-600 hover:border-cyan-500 hover:bg-cyan-500/5' : 'border-gray-300 hover:border-cyan-400 hover:bg-cyan-50'
                  )}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-cyan-500" />
                  </div>
                  <p className={cn('font-semibold', isDarkMode ? 'text-gray-200' : 'text-gray-800')}>Create New Room</p>
                  <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-500')}>Start a collaborative session</p>
                </button>

                <button onClick={() => { setShowJoinModal(true); setJoinError(''); }}
                  className={cn(
                    'w-full p-6 rounded-2xl border-2 border-dashed transition-all hover:scale-[1.01]',
                    isDarkMode ? 'border-gray-600 hover:border-violet-500 hover:bg-violet-500/5' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50'
                  )}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <LogIn className="w-6 h-6 text-violet-500" />
                  </div>
                  <p className={cn('font-semibold', isDarkMode ? 'text-gray-200' : 'text-gray-800')}>Join Existing Room</p>
                  <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-500')}>Enter Room ID to collaborate</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== Create Room Modal ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={cn(
            'w-full max-w-md rounded-3xl border shadow-2xl',
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <div className="p-6 border-b border-gray-800">
              <h2 className={cn('text-xl font-bold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                <Plus className="w-5 h-5 text-cyan-500" />
                Create New Room
              </h2>
              <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-500')}>
                A unique Room ID will be generated for others to join
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={cn('block text-sm font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                  Room Name
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. Spring Boot Review, Backend Code"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm',
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                  )}
                />
              </div>

              <div>
                <label className={cn('block text-sm font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                  Language / Starter Template
                </label>
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm appearance-none cursor-pointer',
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    )}
                  >
                    <option value="java">☕ Java (Spring Boot)</option>
                    <option value="python">🐍 Python (FastAPI)</option>
                    <option value="javascript">🟨 JavaScript (Node.js)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium text-sm transition-colors',
                  isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRoom}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/20 transition-all"
              >
                🚀 Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Join Room Modal ===== */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={cn(
            'w-full max-w-md rounded-3xl border shadow-2xl',
            isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <div className="p-6 border-b border-gray-800">
              <h2 className={cn('text-xl font-bold flex items-center gap-2', isDarkMode ? 'text-white' : 'text-gray-900')}>
                <LogIn className="w-5 h-5 text-violet-500" />
                Join a Room
              </h2>
              <p className={cn('text-sm mt-1', isDarkMode ? 'text-gray-500' : 'text-gray-500')}>
                Enter the Room ID shared by the host
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={cn('block text-sm font-medium mb-2', isDarkMode ? 'text-gray-300' : 'text-gray-700')}>
                  Room ID
                </label>
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => { setJoinRoomId(e.target.value.toUpperCase()); setJoinError(''); }}
                  placeholder="e.g. AB12CD"
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  maxLength={8}
                  autoFocus
                  className={cn(
                    'w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono text-lg font-bold tracking-[0.3em] text-center',
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-600'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-300',
                    joinError ? 'border-red-500 ring-1 ring-red-500/30' : ''
                  )}
                />
                {joinError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <span>⚠️</span> {joinError}
                  </p>
                )}
              </div>

              {/* Available rooms hint */}
              {codeRooms.length > 0 && (
                <div className={cn('p-3 rounded-xl', isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200')}>
                  <p className={cn('text-xs font-medium mb-2', isDarkMode ? 'text-gray-400' : 'text-gray-600')}>Your existing rooms:</p>
                  <div className="flex flex-wrap gap-2">
                    {codeRooms.map(r => (
                      <button key={r.id} onClick={() => setJoinRoomId(r.id)}
                        className={cn('px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors',
                          isDarkMode ? 'bg-gray-700 text-cyan-400 hover:bg-gray-600' : 'bg-white border border-gray-200 text-cyan-600 hover:border-cyan-400')}>
                        {r.id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => { setShowJoinModal(false); setJoinRoomId(''); setJoinError(''); }}
                className={cn(
                  'flex-1 py-3 rounded-xl font-medium text-sm transition-colors',
                  isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleJoinRoom}
                disabled={!joinRoomId.trim()}
                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-500/20 transition-all"
              >
                🚪 Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
