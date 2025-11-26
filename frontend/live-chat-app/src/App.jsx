import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Users, LogOut, ArrowLeft, Reply, Bell } from 'lucide-react';

// Simulated database
const db = {
  users: [
    { id: 1, username: 'test', email: 'test@example.com', password_hash: '' },
    { id: 2, username: 'anna', email: 'anna@example.com', password_hash: btoa('anna123') },
    { id: 3, username: 'péter', email: 'peter@example.com', password_hash: btoa('peter123') },
    { id: 4, username: 'kata', email: 'kata@example.com', password_hash: btoa('kata123') }
  ],
  messages: []
};

// Simulated API and WebSocket
class ChatAPI {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.listeners = new Set();
    this.messageIdCounter = 1;
  }

  register(username, email, password) {
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
          const user = {
            id: db.users.length + 1,
            username,
            email,
            password_hash: password ? btoa(password) : ''
          };
          db.users.push(user);
          resolve({ success: true, user: { id: user.id, username: user.username, email: user.email } });
        }
      }, 300);
    });
  }

  login(username, password) {
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

  getUsers() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const users = db.users.filter(u => u.id !== this.currentUser.id).map(u => ({
            id: u.id,
            username: u.username,
            email: u.email
          }));
          resolve({ success: true, users });
        }
      }, 200);
    });
  }

  sendMessage(recipientId, content) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const message = {
            id: this.messageIdCounter++,
            sender_id: this.currentUser.id,
            recipient_id: recipientId,
            content,
            created_at: new Date().toISOString(),
            is_read: false
          };
          db.messages.push(message);
          
          // Simulate WebSocket broadcast
          this.broadcastMessage(message);
          
          resolve({ success: true, message });
        }
      }, 200);
    });
  }

  getMessages() {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const messages = db.messages.filter(m => 
            m.sender_id === this.currentUser.id || m.recipient_id === this.currentUser.id
          );
          resolve({ success: true, messages });
        }
      }, 200);
    });
  }

  getConversation(userId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (!this.currentUser) {
          resolve({ error: 'Nem vagy bejelentkezve' });
        } else {
          const messages = db.messages.filter(m => 
            (m.sender_id === this.currentUser.id && m.recipient_id === userId) ||
            (m.sender_id === userId && m.recipient_id === this.currentUser.id)
          ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          
          // Mark messages as read
          messages.forEach(m => {
            if (m.recipient_id === this.currentUser.id) {
              m.is_read = true;
            }
          });
          
          resolve({ success: true, messages });
        }
      }, 200);
    });
  }

  getThread(messageId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const replies = db.messages.filter(m => m.parent_msg_id === messageId)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        resolve({ success: true, replies });
      }, 200);
    });
  }

  replyToMessage(messageId, recipientId, content) {
    return this.sendMessage(recipientId, content, messageId);
  }

  subscribeToMessages(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcastMessage(message) {
    this.listeners.forEach(callback => callback(message));
  }

  logout() {
    this.currentUser = null;
    this.token = null;
  }
}

const api = new ChatAPI();

// Main App Component
export default function LiveChatApp() {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [notification, setNotification] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

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

  const showNotification = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = async (username, password) => {
    const result = await api.login(username, password);
    if (result.success) {
      setCurrentUser(result.user);
      setView('users');
      loadUsers();
    } else {
      alert(result.error);
    }
  };

  const handleRegister = async (username, email, password) => {
    setValidationErrors({});
    
    const errors = {};
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
      setValidationErrors({ general: result.error });
    }
  };

  const loadUsers = async () => {
    const result = await api.getUsers();
    if (result.success) {
      setUsers(result.users);
    }
  };

  const loadConversation = async (user) => {
    setSelectedUser(user);
    setView('chat');
    const result = await api.getConversation(user.id);
    if (result.success) {
      setMessages(result.messages);
    }
  };

  const sendMessage = async () => {
    if (!messageInput.trim()) return;

    await api.sendMessage(selectedUser.id, messageInput);
    setMessageInput('');
    
    // Keep focus on input
    setTimeout(() => {
      messageInputRef.current?.focus();
    }, 0);
  };

  const viewThread = async (messageId) => {
    // Thread functionality removed
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
            <span className="text-sm">Bejelentkezve: {currentUser?.username}</span>
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
    const getMessageSender = (msg) => {
      if (msg.sender_id === currentUser.id) return currentUser;
      return users.find(u => u.id === msg.sender_id) || selectedUser;
    };

    const getReplyPreview = (messageId) => {
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
                  setReplyingTo(null);
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
                  const isOwn = msg.sender_id === currentUser.id;
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
                        <div className="flex items-center justify-end space-x-2 mt-2">
                          <button
                            onClick={() => setReplyingTo(msg.id)}
                            className={`text-xs ${isOwn ? 'text-blue-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'} flex items-center`}
                          >
                            <Reply className="w-3 h-3 mr-1" />
                            Válasz
                          </button>
                          {hasReplies && (
                            <button
                              onClick={() => viewThread(msg.id)}
                              className={`text-xs ${isOwn ? 'text-blue-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                              Szál megtekintése
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            {replyingTo && (
              <div className="mb-2 p-2 bg-blue-50 rounded flex items-center justify-between">
                <span className="text-sm text-blue-700">
                  Válasz: {getReplyPreview(replyingTo)}
                </span>
                <button
                  onClick={() => setReplyingTo(null)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="flex space-x-2">
              <input
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

  // Thread View Modal
  const ThreadViewModal = () => {
    const originalMessage = messages.find(m => m.id === threadView);
    const [replyInput, setReplyInput] = useState('');

    const sendReply = async () => {
      if (!replyInput.trim()) return;
      const recipientId = originalMessage.sender_id === currentUser.id ? 
        originalMessage.recipient_id : originalMessage.sender_id;
      await api.replyToMessage(threadView, recipientId, replyInput);
      setReplyInput('');
      const result = await api.getThread(threadView);
      if (result.success) {
        setThreadMessages(result.replies);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="text-xl font-bold">Üzenet szál</h2>
            <button
              onClick={() => {
                setThreadView(null);
                setThreadMessages([]);
              }}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {originalMessage && (
              <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-600">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-blue-900">
                    {getMessageSender(originalMessage)?.username}
                  </span>
                  <span className="text-xs text-blue-600">
                    {new Date(originalMessage.created_at).toLocaleString('hu-HU')}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{originalMessage.content}</p>
              </div>
            )}

            {threadMessages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                Még nincsenek válaszok
              </div>
            ) : (
              threadMessages.map(msg => {
                const sender = getMessageSender(msg);
                const isOwn = msg.sender_id === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-md ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3 shadow`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">{sender?.username}</span>
                        <span className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {new Date(msg.created_at).toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Válasz írása..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendReply}
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

  const getMessageSender = (msg) => {
    if (msg.sender_id === currentUser.id) return currentUser;
    return users.find(u => u.id === msg.sender_id) || selectedUser;
  };

  return (
    <div className="relative">
      {view === 'login' && <LoginView />}
      {view === 'register' && <RegisterView />}
      {view === 'users' && <UsersView />}
      {view === 'chat' && <ChatView />}
      {/* {threadView && <ThreadViewModal />} */}
      
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse z-50">
          <Bell className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
}