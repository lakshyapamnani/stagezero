import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { chatService, userService } from '../services/api';
import { Conversation, Message, User } from '../models/types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Send, Search, MoreVertical, Phone, Video, MessageSquare } from 'lucide-react';

export const Chat: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to conversations list
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = chatService.subscribeToConversations(currentUser.id, (convs) => {
      setConversations(convs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Handle active conversation selection
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setActiveConversation(conv);
        
        // Find other participant
        const otherId = conv.participants.find(id => id !== currentUser?.id);
        if (otherId) {
          userService.getById(otherId).then(u => setOtherUser(u));
        }
      }
    } else if (conversations.length > 0 && !conversationId) {
      // Default to first if none selected
      navigate(`/chat/${conversations[0].id}`);
    }
  }, [conversationId, conversations, currentUser, navigate]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;

    const unsubscribe = chatService.subscribeToMessages(activeConversation.id, (msgs) => {
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [activeConversation]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !currentUser) return;

    try {
      await chatService.sendMessage(activeConversation.id, currentUser.id, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message', error);
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {/* Sidebar - Conversations List */}
      <Card className="md:col-span-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-secondary-text" />
            <Input className="pl-9" placeholder="Search messages..." />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => {
            const otherId = conv.participants.find(id => id !== currentUser.id);
            // In a real app, we'd cache these users or fetch them in bulk
            // For now, we'll just show the ID or a placeholder if we haven't fetched the user
            // Ideally, the conversation object should denormalize the participant names/avatars
            
            return (
              <div 
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-surface/50 transition-colors ${
                  activeConversation?.id === conv.id ? 'bg-surface border-l-4 border-l-accent' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-semibold text-primary-text">Conversation</h4>
                  <span className="text-xs text-secondary-text whitespace-nowrap">
                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-secondary-text truncate">{conv.lastMessage}</p>
              </div>
            );
          })}
          
          {conversations.length === 0 && (
            <div className="p-8 text-center text-secondary-text">
              No conversations yet.
            </div>
          )}
        </div>
      </Card>

      {/* Main Chat Area */}
      <Card className="md:col-span-2 lg:col-span-3 flex flex-col overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-surface/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
                  {otherUser ? otherUser.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-primary-text">{otherUser ? otherUser.name : 'Loading...'}</h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span className="text-xs text-secondary-text">Online</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm"><Phone className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Video className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMe 
                          ? 'bg-accent text-white rounded-tr-none' 
                          : 'bg-surface border border-border text-primary-text rounded-tl-none'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <div className={`text-[10px] mt-1 ${isMe ? 'text-white/70' : 'text-secondary-text'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border bg-surface/30">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-secondary-text">
            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </Card>
    </div>
  );
};
