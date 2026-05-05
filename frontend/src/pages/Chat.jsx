import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserHook, setSelectedUserHook] = useState(null);
  const [messages, setMessages] = useState([]);

  const setSelectedUser = (u) => {
    setSelectedUserHook(u);
    setMessages([]); // clear old messages
  };
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/chat/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch chat users', err);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUserHook) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chat/conversation/${selectedUserHook._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Only update if messages changed to prevent unnecessary re-renders
      if (JSON.stringify(messages) !== JSON.stringify(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    fetchMessages(); // initial fetch
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedUserHook, messages]); // re-run if selectedUserHook changes

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserHook) return;

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat/send', {
        receiverId: selectedUserHook._id,
        content: newMessage
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '0', display: 'flex', height: 'calc(100vh - 60px)', marginTop: '-20px' }}>

      {/* Sidebar - Users List */}
      <div style={{ width: '300px', borderRight: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
          <h2 style={{ fontSize: '1.2rem', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} color="var(--primary)" />
            Conversations
          </h2>
          <input 
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {users.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              {searchQuery ? 'No matching users.' : 'No other users found.'}
            </div>
          ) : (
            users
              .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
              .map(u => (
                <div
                  key={u._id}
                  onClick={() => setSelectedUser(u)}
                  style={{
                    padding: '15px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer',
                    background: selectedUserHook?._id === u._id ? 'var(--bg)' : 'transparent',
                    borderLeft: selectedUserHook?._id === u._id ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  className="chat-user-item"
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                  }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{u.username}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg)', padding: '2px 6px', borderRadius: '10px' }}>
                      {u.role}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {selectedUserHook ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
              }}>
                <UserIcon size={20} />
              </div>
              <h3 style={{ margin: 0 }}>{selectedUserHook.username}</h3>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender === user._id || msg.sender === user.id; // handle possible id mismatches
                  return (
                    <div key={msg._id} style={{
                      alignSelf: isMine ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      background: isMine ? 'var(--primary)' : 'var(--surface)',
                      color: isMine ? 'white' : 'var(--text-main)',
                      padding: '12px 16px',
                      borderRadius: isMine ? '20px 20px 0px 20px' : '20px 20px 20px 0px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                      position: 'relative'
                    }}>
                      <div style={{ fontSize: '0.95rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {msg.content}
                      </div>
                      <div style={{
                        fontSize: '0.65rem',
                        marginTop: '5px',
                        textAlign: 'right',
                        opacity: isMine ? 0.8 : 0.5
                      }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '20px', background: 'var(--surface)', borderTop: '1px solid var(--border)' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '12px 15px',
                    borderRadius: '25px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontSize: '0.95rem'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  style={{
                    width: '45px', height: '45px', borderRadius: '50%', border: 'none',
                    background: (!newMessage.trim() || loading) ? 'var(--border)' : 'var(--primary)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: (!newMessage.trim() || loading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} style={{ marginLeft: '2px' }} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={60} style={{ opacity: 0.1, marginBottom: '20px' }} />
            <h2>Welcome to Chat</h2>
            <p>Select a user from the sidebar to start messaging.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
