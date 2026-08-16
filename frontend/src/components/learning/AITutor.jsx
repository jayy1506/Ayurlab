import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { askTutor } from '../../services/gemini';
import { logUserActivity } from '../../utils/activityTracker';
import './AITutor.css';

const AITutor = () => {
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Namaste! I am your AI Ayurveda Tutor. Ask me anything about practical compounding and herbs.' }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    logUserActivity({
      type: 'tutor',
      colorClass: 'blue',
      title: 'AI Tutor Session',
      detail: `Asked: "${userMessage.slice(0, 35)}${userMessage.length > 35 ? '...' : ''}"`,
      link: '/learning'
    });

    // Add user message immediately, and a blank bot message that will be streamed into
    setMessages(prev => [...prev, { role: 'user', text: userMessage }, { role: 'bot', text: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      await askTutor(userMessage, (chunkText) => {
        setIsLoading(false); // Stop thinking animation once streaming starts
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].text = chunkText;
          return updated;
        });
      });
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1].text = "I encountered an error. Please try again.";
        return updated;
      });
    }
  };

  return (
    <div className="ai-tutor glass-panel">
      <div className="tutor-header">
        <Bot size={20} color="var(--primary-color)" />
        <h3>AI Tutor</h3>
      </div>
      
      <div className="messages-container" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`message-bubble ${msg.role}`}>
            <div className="bubble-icon">
              {msg.role === 'bot' ? <Bot size={14} /> : <User size={14} />}
            </div>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble bot">
            <Loader2 size={16} className="animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <form className="tutor-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="Ask a question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default AITutor;
