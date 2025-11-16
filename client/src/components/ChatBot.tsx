import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Minimize2, Maximize2, ThumbsUp, ThumbsDown, Bot, User } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  message: string;
  timestamp: Date;
  intent?: string;
  confidence?: number;
  entities?: { type: string; value: string }[];
  suggestions?: string[];
  actions?: {
    type: string;
    data: any;
  }[];
}

interface ChatBotSession {
  sessionId: string;
  messages: Message[];
  satisfaction?: number;
}

const ChatBot: React.FC = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [session, setSession] = useState<ChatBotSession | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !session) {
      startNewSession();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      const response = await api.post('/chatbot/start', {
        context: {
          location: user?.location,
          cropPreferences: [],
          experience: 'beginner'
        }
      });

      const newSession: ChatBotSession = {
        sessionId: response.data.data.sessionId,
        messages: [
          {
            id: '1',
            sender: 'bot',
            message: response.data.data.initialResponse.message,
            timestamp: new Date(),
            intent: response.data.data.initialResponse.intent,
            confidence: response.data.data.initialResponse.confidence,
            suggestions: response.data.data.initialResponse.suggestions,
            actions: response.data.data.initialResponse.actions
          }
        ]
      };

      setSession(newSession);
    } catch (error) {
      console.error('Failed to start chat session:', error);
      toast.error('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || !session || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      message: messageText,
      timestamp: new Date()
    };

    setSession(prev => ({
      ...prev!,
      messages: [...prev!.messages, userMessage]
    }));

    setMessage('');
    setIsTyping(true);

    try {
      const response = await api.post('/chatbot/message', {
        message: messageText,
        sessionId: session.sessionId
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        message: response.data.data.message,
        timestamp: new Date(),
        intent: response.data.data.intent,
        confidence: response.data.data.confidence,
        entities: response.data.data.entities,
        suggestions: response.data.data.suggestions,
        actions: response.data.data.actions
      };

      setSession(prev => ({
        ...prev!,
        messages: [...prev!.messages, botMessage]
      }));
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleAction = (action: { type: string; data: any }) => {
    switch (action.type) {
      case 'crop_recommendation':
        // Navigate to crop recommendation page
        window.location.href = '/farmer/recommendations';
        break;
      case 'schemes':
        // Navigate to schemes page
        window.location.href = '/farmer/schemes';
        break;
      case 'price_info':
        // Navigate to price prediction page
        window.location.href = '/farmer/price-prediction';
        break;
      default:
        // Send a default message about the action
        sendMessage(`Tell me more about ${action.type}`);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleFeedback = async (rating: number) => {
    if (!session) return;

    try {
      await api.patch(`/chatbot/session/${session.sessionId}/feedback`, {
        satisfaction: rating
      });

      setSession(prev => ({ ...prev!, satisfaction: rating }));
      setShowFeedback(false);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast.error('Failed to submit feedback.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(message);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 z-50 flex items-center space-x-2 group"
      >
        <Bot className="w-6 h-6" />
        <span className="hidden group-hover:inline-block font-medium">Chat with AgriBot</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-2xl z-50 transition-all duration-300 ${
      isMinimized ? 'w-80' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">AgriBot Assistant</h3>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowFeedback(false);
            }}
            className="hover:bg-white/20 p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-[450px] overflow-y-auto p-4 space-y-4">
            {session?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${
                  msg.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-lg p-3 shadow`}>
                  <div className="flex items-start space-x-2">
                    {msg.sender === 'bot' && (
                      <Bot className="w-4 h-4 mt-0.5 text-gray-600" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestion(suggestion)}
                              className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                            >
                              💡 {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.actions.map((action, index) => (
                            <button
                              key={index}
                              onClick={() => handleAction(action)}
                              className="block w-full text-left text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                            >
                              🔗 View {action.type.replace('_', ' ')}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.sender === 'user' && (
                      <User className="w-4 h-4 mt-0.5 text-gray-600" />
                    )}
                  </div>
                  <div className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-right text-gray-600' : 'text-left text-gray-500'
                  }`}>
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 rounded-lg p-3 shadow max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4" />
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Feedback Section */}
          {session && session.messages.length > 2 && !session.satisfaction && (
            <div className="px-4 pb-2">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800 mb-2">How helpful was this conversation?</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowFeedback(!showFeedback)}
                    className="text-sm text-yellow-700 hover:text-yellow-900"
                  >
                    {showFeedback ? 'Hide feedback' : 'Rate this chat'}
                  </button>
                </div>
                {showFeedback && (
                  <div className="flex items-center space-x-2 mt-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFeedback(rating)}
                        className="text-2xl hover:scale-110 transition-transform"
                        title={`${rating} star${rating > 1 ? 's' : ''}`}
                      >
                        ⭐
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                disabled={isLoading || isTyping}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading || isTyping}
                className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ChatBot;