import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, LogOut, ArrowLeft, Reply, Bell } from 'lucide-react';

// Types
interface User {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
}

interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  created_at: string;
  is_read: boolean;
  parent_msg_id?: number;
}

interface ApiResponse<T> {
  success?: boolean;
  error?: string;
  token?: string;
  user?: User;
  users?: User[];
  messages?: Message[];
  message?: Message;
  replies?: Message[];
}

interface Database {
  users: User[];
  exampleMessages: Message[];
  messages: Message[];
}

// Simulated database
const db: Database = {
  users: [
    { id: 1, username: 'test', email: 'test@example.com', password_hash: '' },
    { id: 2, username: 'anna', email: 'anna@example.com', password_hash: btoa('anna123') },
    { id: 3, username: 'péter', email: 'peter@example.com', password_hash: btoa('peter123') },
    { id: 4, username: 'kata', email: 'kata@example.com', password_hash: btoa('kata123') }
  ],
  exampleMessages: [
    { id: 1, sender_id: 1, recipient_id: 2, content: 'Szia Anna!', created_at: new Date().toISOString(), is_read: false },
    { id: 2, sender_id: 2, recipient_id: 1, content: 'Szia! Hogy vagy?', created_at: new Date().toISOString(), is_read: false },
    { id: 3, sender_id: 1, recipient_id: 3, content: 'Helló Péter!', created_at: new Date().toISOString(), is_read: false },
    { id: 4, sender_id: 3, recipient_id: 1, content: 'Szia! Miben segíthetek?', created_at: new Date().toISOString(), is_read: false }
  ],
  messages: []
};

function saveDB() {
  localStorage.setItem("db", JSON.stringify(db));
}

function loadDB() {
  const raw = localStorage.getItem("db");
  if (raw) {
    const parsed = JSON.parse(raw);
    db.users = parsed.users ?? [];
    db.messages = parsed.messages ?? [];
  }
}

loadDB();

// Simulated API and WebSocket
class ChatAPI {
  currentUser: User | null = null;
  token: string | null = null;
  listeners: Set<(message: Message) => void> = new Set();
  messageIdCounter: number = 1;

  register(username: string, email: string, password: string): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!username || !email) {
          resolve({ error: 'A felhasználónév és email megadása kötelező' });
          return;
        }
        const existingUser = db.users.find(u => u.username === username || u.email === email);
        if (existingUser) {
          resolve({ error: 'A felhasználónév vagy email már létezik' });
        } else {
          const user: User = {
            id: db.users.length + 1,
            username,
            email,
            password_hash: password ? btoa(password) : ''
          };
          db.users.push(user);
          saveDB();
          
          resolve({ success: true, user: { id: user.id, username: user.username, email: user.email } });
        }
      }, 300);
    });
  }

  login(username: string, password: string): Promise<ApiResponse<User>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = db.users.find(u => u.username === username);
        if (user && (password === '' || btoa(password) === user.password_hash)) {
          this.currentUser = user;
          this.token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
          resolve({ success: true, token: this.token, user: { id: user.id, username: user.username, email: user.email } });
        } else {
          resolve({ error: 'Hibás felhasználónév vagy jelszó' });
        }
      }, 300);
    });
  }

  getUsers(): Promise<ApiResponse<User[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const users = db.users.filter(u => u.id !== this.currentUser!.id).map(u => ({
            id: u.id,
            username: u.username,
            email: u.email
          }));
          resolve({ success: true, users });
        }
      }, 200);
    });
  }

  sendMessage(recipientId: number, content: string): Promise<ApiResponse<Message>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const message: Message = {
            id: this.messageIdCounter++,
            sender_id: this.currentUser.id,
            recipient_id: recipientId,
            content,
            created_at: new Date().toISOString(),
            is_read: false
          };
          db.messages.push(message);
          saveDB();

          // Simulate WebSocket broadcast
          this.broadcastMessage(message);
          
          resolve({ success: true, message });
        }
      }, 200);
    });
  }

  getMessages(): Promise<ApiResponse<Message[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const messages = db.messages.filter(m => 
            m.sender_id === this.currentUser!.id || m.recipient_id === this.currentUser!.id
          );
          resolve({ success: true, messages });
        }
      }, 200);
    });
  }

  getConversation(userId: number): Promise<ApiResponse<Message[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const messages = db.messages.filter(m => 
            (m.sender_id === this.currentUser!.id && m.recipient_id === userId) ||
            (m.sender_id === userId && m.recipient_id === this.currentUser!.id)
          ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          
          // Mark messages as read
          messages.forEach(m => {
            if (m.recipient_id === this.currentUser!.id) {
              m.is_read = true;
            }
          });
          
          resolve({ success: true, messages });
        }
      }, 200);
    });
  }

  getThread(messageId: number): Promise<ApiResponse<Message[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const replies = db.messages.filter(m => m.parent_msg_id === messageId)
          .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        resolve({ success: true, replies });
      }, 200);
    });
  }

  replyToMessage(messageId: number, recipientId: number, content: string): Promise<ApiResponse<Message>> {
    return this.sendMessage(recipientId, content);
  }

  subscribeToMessages(callback: (message: Message) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcastMessage(message: Message): void {
    this.listeners.forEach(callback => callback(message));
  }

  logout(): void {
    this.currentUser = null;
    this.token = null;
  }
}

const api = new ChatAPI();

// Main App Component
export default function LiveChatApp() {
  const [view, setView] = useState<'login' | 'register' | 'users' | 'chat'>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // WebSocket listener
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = api.subscribeToMessages((message) => {
        // Show notification for incoming messages
        if (message.recipient_id === currentUser.id) {
          const sender = users.find(u => u.id === message.sender_id);
          showNotification(`Új üzenet ${sender?.username || 'Ismeretlen'} felhasználótól`);
          
          // Update messages if viewing the conversation
          if (selectedUser && message.sender_id === selectedUser.id) {
            setMessages(prev => [...prev, message]);
          }
        }
        
        // Update if we sent the message
        if (message.sender_id === currentUser.id && selectedUser && message.recipient_id === selectedUser.id) {
          setMessages(prev => [...prev, message]);
        }
      });

      return unsubscribe;
    }
  }, [currentUser, selectedUser, users]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const showNotification = (text: string) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (username: string, password: string) => {
    const result = await api.login(username, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      setView('users');
      loadUsers();
    } else {
      alert(result.error);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    setValidationErrors({});
    
    const errors: Record<string, string> = {};
    if (!username.trim()) errors.username = 'A felhasználónév megadása kötelező';
    if (!email.trim()) errors.email = 'Az email megadása kötelező';
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    const result = await api.register(username, email, password);
    if (result.success) {
      alert('Sikeres regisztráció! Most bejelentkezhetsz.');
      setView('login');
      setValidationErrors({});
    } else {
      setValidationErrors({ general: result.error || 'Hiba történt' });
    }
  };

  const loadUsers = async () => {
    const result = await api.getUsers();
    if (result.success && result.users) {
      setUsers(result.users);
    }
  };

  const loadConversation = async (user: User) => {
    setSelectedUser(user);
    setView('chat');
    const result = await api.getConversation(user.id);
    if (result.success && result.messages) {
      setMessages(result.messages);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser) return;

    await api.sendMessage(selectedUser.id, messageInput);
    setMessageInput('');
    
    // Keep focus on input
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setView('login');
    setUsers([]);
    setSelectedUser(null);
    setMessages([]);
  };

  // Login View
  const LoginView = () => {
    const [username, setUsername] = useState('test');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Live Chat</h1>
          </div>
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Bejelentkezés</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Felhasználónév"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin(username, password)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleLogin(username, password)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Bejelentkezés
            </button>
            <button
              onClick={() => setView('register')}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Regisztráció
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Demo: username "test", jelszó nélkül
          </p>
        </div>
      </div>
    );
  };

  // Register View
  const RegisterView = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <MessageSquare className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-800">Live Chat</h1>
          </div>
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-700">Regisztráció</h2>
          
          {validationErrors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {validationErrors.general}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Felhasználónév"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 border ${validationErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${validationErrors.username ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 ${validationErrors.email ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>
            
            <input
              type="password"
              placeholder="Jelszó"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleRegister(username, email, password)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Regisztráció
            </button>
            <button
              onClick={() => {
                setView('login');
                setValidationErrors({});
              }}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Vissza a bejelentkezéshez
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Users List View
  const UsersView = () => (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-2" />
            <h1 className="text-xl font-bold">Felhasználók</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm">Bejelentkezve mint: {currentUser?.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Kilépés
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md">
          {users.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nincsenek más felhasználók
            </div>
          ) : (
            <div className="divide-y">
              {users.map(user => (
                <div
                  key={user.id}
                  className="p-4 hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <button
                    onClick={() => loadConversation(user)}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Üzenet küldése
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Chat View
  const ChatView = () => {
    const getMessageSender = (msg: Message): User | undefined => {
      if (msg.sender_id === currentUser?.id) return currentUser;
      return users.find(u => u.id === msg.sender_id) || selectedUser || undefined;
    };

    const getReplyPreview = (messageId: number): string | null => {
      const original = messages.find(m => m.id === messageId);
      if (!original) return null;
      return original.content.substring(0, 50) + (original.content.length > 50 ? '...' : '');
    };

    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-blue-600 text-white p-4 shadow-md">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setView('users');
                  setSelectedUser(null);
                  setMessages([]);
                }}
                className="mr-4 hover:bg-blue-700 p-2 rounded transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <MessageSquare className="w-6 h-6 mr-2" />
              <h1 className="text-xl font-bold">Chat: {selectedUser?.username}</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500 px-3 py-2 rounded hover:bg-red-600 transition"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Kilépés
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-hidden flex flex-col">
          <div className="flex-1 bg-white rounded-lg shadow-md overflow-y-auto p-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Még nincsenek üzenetek. Kezdj el beszélgetni!
              </div>
            ) : (
              <div className="space-y-4">
                {messages.filter(m => !m.parent_msg_id).map(msg => {
                  const sender = getMessageSender(msg);
                  const isOwn = msg.sender_id === currentUser?.id;
                  const hasReplies = messages.some(m => m.parent_msg_id === msg.id);

                  return (
                    <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3 shadow`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold">{sender?.username}</span>
                          <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {msg.parent_msg_id && (
                          <div className={`text-xs ${isOwn ? 'bg-blue-700' : 'bg-gray-300'} rounded p-2 mb-2 italic`}>
                            Válasz: {getReplyPreview(msg.parent_msg_id)}
                          </div>
                        )}
                        <p className="text-sm break-words">{msg.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex space-x-2">
              <input
                ref={messageInputRef}
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Írj egy üzenetet..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {view === 'login' && <LoginView />}
      {view === 'register' && <RegisterView />}
      {view === 'users' && <UsersView />}
      {view === 'chat' && <ChatView />}
      
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse z-50">
          <Bell className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}