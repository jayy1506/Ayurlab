import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { askTutor } from '../../services/gemini';
import { logUserActivity } from '../../utils/activityTracker';
import './AITutor.css';

const AITutor = ({ currentExperiment }) => {
  const defaultGreeting = currentExperiment?.title
    ? `Namaste! I am your AI Ayurveda Tutor. Currently assisting with ${currentExperiment.title}. Ask me anything about its Shlokas, ingredients, precautions, or indications!`
    : 'Namaste! I am your AI Ayurveda Tutor. Ask me anything about practical compounding, Shlokas, herbs, or any of the 64+ laboratory experiments.';

  const [messages, setMessages] = useState([
    { role: 'bot', text: defaultGreeting }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (currentExperiment?.title) {
      setMessages([
        {
          role: 'bot',
          text: `Namaste! I am your AI Ayurveda Tutor. Currently assisting with ${currentExperiment.title}. Ask me anything about its Shlokas, ingredients, precautions, or indications!`
        }
      ]);
    }
  }, [currentExperiment?.title]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendQuestion = async (userMessage) => {
    if (!userMessage || !userMessage.trim() || isLoading) return;

    logUserActivity({
      type: 'tutor',
      colorClass: 'blue',
      title: 'AI Tutor Session',
      detail: `Asked: "${userMessage.slice(0, 35)}${userMessage.length > 35 ? '...' : ''}"`,
      link: '/learning'
    });

    setMessages(prev => [...prev, { role: 'user', text: userMessage }, { role: 'bot', text: '' }]);
    setInput('');
    setIsLoading(true);

    const queryWithContext = currentExperiment?.title
      ? `Regarding the Ayurvedic formulation or experiment "${currentExperiment.title}": ${userMessage}`
      : userMessage;

    try {
      await askTutor(queryWithContext, (chunkText) => {
        setIsLoading(false);
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

  const handleSend = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  return (
    <div className="ai-tutor glass-panel">
      <div className="tutor-header">
        <Bot size={20} color="var(--primary-color)" />
        <h3>AI Tutor {currentExperiment?.title ? `• ${currentExperiment.title}` : ''}</h3>
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

      {/* Quick Prompts */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0.5rem 0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button 
          type="button" 
          onClick={() => sendQuestion(currentExperiment?.title ? `What is the classical Sanskrit Shloka and reference for ${currentExperiment.title}?` : 'What are the main classical texts referenced in this lab?')} 
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--primary-color)', cursor: 'pointer' }}
        >
          📜 Shloka & Source
        </button>
        <button 
          type="button" 
          onClick={() => sendQuestion(currentExperiment?.title ? `What are the key precautions and safety guidelines for ${currentExperiment.title}?` : 'What are the general safety precautions in Rasa Shastra?')} 
          style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b', cursor: 'pointer' }}
        >
          ⚠️ Precautions
        </button>
        <button 
          type="button" 
          onClick={() => sendQuestion(currentExperiment?.title ? `What are the therapeutic indications (Rogaghnata) and dosage for ${currentExperiment.title}?` : 'Explain the concept of Anupana and Matra.') 
          } style={{ fontSize: '0.72rem', padding: '0.25rem 0.5rem', borderRadius: '12px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', color: '#3b82f6', cursor: 'pointer' }}
        >
          💊 Indications & Dose
        </button>
      </div>

      <form className="tutor-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder={currentExperiment?.title ? `Ask about ${currentExperiment.title}...` : "Ask a question..."}
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
