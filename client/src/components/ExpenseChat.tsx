import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface Message {
  id?: string;
  userId: string;
  userName: string;
  message: string;
  createdAt?: string;
}

const ExpenseChat = ({ expenseId }: { expenseId: string }) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join-expense', expenseId);

    socketRef.current.on('new-message', (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [expenseId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/expenses/${expenseId}/chat`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((m: any) => ({
          id: m.id,
          userId: m.userId,
          userName: m.user.name,
          message: m.message,
          createdAt: m.createdAt
        })));
      }
    } catch (err) {
      console.error('Error fetching chat');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      expenseId,
      userId: user!.id,
      userName: user!.name,
      message: newMessage,
    };

    try {
      // Save to DB
      await fetch(`http://localhost:5000/api/expenses/${expenseId}/chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ message: newMessage }),
      });

      // Emit to socket
      socketRef.current?.emit('send-message', messageData);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message');
    }
  };

  return (
    <div className="card" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '10px', textAlign: m.userId === user?.id ? 'right' : 'left' }}>
            <div style={{ fontSize: '12px', color: '#888' }}>{m.userName}</div>
            <div style={{ 
              display: 'inline-block', 
              padding: '8px 12px', 
              borderRadius: '15px', 
              backgroundColor: m.userId === user?.id ? '#1cc29f' : '#eee',
              color: m.userId === user?.id ? 'white' : 'black'
            }}>
              {m.message}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input 
          placeholder="Type a message..." 
          value={newMessage} 
          onChange={e => setNewMessage(e.target.value)} 
          style={{ marginBottom: 0, marginRight: '10px' }}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ExpenseChat;
