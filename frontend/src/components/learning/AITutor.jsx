import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Sparkles, BookOpen, ShieldCheck, 
  Pill, Maximize2, Minimize2, X, Plus, Trash2, Clock, 
  History, PanelLeftClose, PanelLeft, Copy, Check, 
  FlaskConical, Flame, Award, MessageSquare, Volume2, VolumeX,
  ThumbsUp, ThumbsDown, Share2, RotateCcw, MoreHorizontal, SquarePen, Search
} from 'lucide-react';
import { askTutor, rateInteraction } from '../../services/gemini';
import { logUserActivity } from '../../utils/activityTracker';
import './AITutor.css';

const SESSIONS_STORAGE_KEY = 'ayurveda_ai_chat_sessions';

/**
 * Parses inline markdown like **bold**, *italic*, `code`, and [Source] chips
 */
const renderInlineMarkdown = (text) => {
  if (!text) return null;

  const parts = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[(?:G\s|Google|Charaka|Sushruta|Rasa)[^\]]+\])/g;
  let lastIdx = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.substring(lastIdx, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      const inner = token.slice(2, -2);
      parts.push(<strong key={match.index} className="chatgpt-bold">{inner}</strong>);
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(<code key={match.index} className="chatgpt-code">{token.slice(1, -1)}</code>);
    } else if (token.startsWith('[') && token.endsWith(']')) {
      const sourceName = token.slice(1, -1);
      parts.push(
        <span key={match.index} className="chatgpt-source-chip">
          <span className="source-dot">G</span>
          <span>{sourceName.replace(/^G\s+/, '')}</span>
        </span>
      );
    }
    lastIdx = regex.lastIndex;
  }

  if (lastIdx < text.length) {
    parts.push(text.substring(lastIdx));
  }

  return parts.length > 0 ? parts : text;
};

/**
 * ChatGPT-Style Message Formatter with Callout Quotes & Ranking Badges
 */
const FormattedChatGPTMessage = ({ text, onRegenerate, interactionId, citations }) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [shared, setShared] = useState(false);

  if (!text) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const cleanSpeech = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'Ayurveda AI Insight', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const blocks = [];
  let currentList = null;

  rawLines.forEach((line) => {
    const isRankedEmoji = line.match(/^([🥇🥈🥉4️⃣5️⃣6️⃣7️⃣8️⃣9️⃣🔟\d+️⃣]+)\s+(.*)/);
    const isNumbered = line.match(/^(\d+)\.\s+(.*)/);
    const isBullet = line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ');
    const isHeading = line.startsWith('### ') || line.startsWith('## ') || line.startsWith('# ');

    if (isRankedEmoji) {
      if (!currentList || currentList.type !== 'ranked') {
        currentList = { type: 'ranked', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push({ badge: isRankedEmoji[1], content: isRankedEmoji[2] });
    } else if (isNumbered) {
      if (!currentList || currentList.type !== 'numbered') {
        currentList = { type: 'numbered', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push({ num: isNumbered[1], content: isNumbered[2] });
    } else if (isBullet) {
      const content = line.replace(/^[\*\-•]\s+/, '');
      if (!currentList || currentList.type !== 'bullet') {
        currentList = { type: 'bullet', items: [] };
        blocks.push(currentList);
      }
      currentList.items.push({ content });
    } else {
      currentList = null;
      if (isHeading) {
        blocks.push({ type: 'heading', content: line.replace(/^#+\s+/, '') });
      } else {
        blocks.push({ type: 'paragraph', content: line });
      }
    }
  });

  return (
    <div className="chatgpt-response-wrapper">
      <div className="chatgpt-content-body">
        {blocks.map((block, bIdx) => {
          if (block.type === 'ranked') {
            return (
              <div key={bIdx} className="chatgpt-callout-block">
                {block.items.map((item, iIdx) => (
                  <div key={iIdx} className="chatgpt-ranked-row">
                    <span className="ranked-badge-icon">{item.badge}</span>
                    <span className="ranked-text">{renderInlineMarkdown(item.content)}</span>
                  </div>
                ))}
              </div>
            );
          }

          if (block.type === 'numbered') {
            return (
              <div key={bIdx} className="chatgpt-callout-block">
                <ol className="chatgpt-numbered-list">
                  {block.items.map((item, iIdx) => (
                    <li key={iIdx} className="chatgpt-numbered-row">
                      <span className="row-number">{item.num}.</span>
                      <span className="row-text">{renderInlineMarkdown(item.content)}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          }

          if (block.type === 'bullet') {
            return (
              <ul key={bIdx} className="chatgpt-bullet-list">
                {block.items.map((item, iIdx) => (
                  <li key={iIdx} className="chatgpt-bullet-row">
                    <span className="row-bullet">•</span>
                    <span className="row-text">{renderInlineMarkdown(item.content)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          if (block.type === 'heading') {
            return (
              <h4 key={bIdx} className="chatgpt-heading">
                {renderInlineMarkdown(block.content)}
              </h4>
            );
          }

          return (
            <p key={bIdx} className="chatgpt-paragraph">
              {renderInlineMarkdown(block.content)}
            </p>
          );
        })}
      </div>

      {/* Classical Samhita / Kalpana Citation Pill (Task 4 RAG Grounding) */}
      {citations && (
        <div style={{
          marginTop: '0.6rem',
          marginBottom: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '8px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          color: '#065f46',
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          width: 'fit-content',
        }}>
          <BookOpen size={13} style={{ flexShrink: 0, color: '#059669' }} />
          <span><strong>Classical Authority:</strong> {citations}</span>
        </div>
      )}

      {/* ChatGPT-style Bottom Action Toolbar */}
      <div className="chatgpt-action-toolbar">
        <button 
          className={`toolbar-btn ${copied ? 'active' : ''}`} 
          onClick={handleCopy} 
          title="Copy response"
        >
          {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
        </button>

        <button 
          className={`toolbar-btn ${isSpeaking ? 'active-speaking' : ''}`} 
          onClick={handleSpeak} 
          title={isSpeaking ? "Stop reading" : "Read aloud"}
        >
          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>

        <button 
          className={`toolbar-btn ${liked ? 'active-thumb' : ''}`} 
          onClick={() => { 
            const newLiked = !liked;
            setLiked(newLiked); 
            setDisliked(false);
            if (newLiked && interactionId) {
              rateInteraction(interactionId, 5);
            }
          }} 
          title="Good response"
        >
          <ThumbsUp size={14} />
        </button>

        <button 
          className={`toolbar-btn ${disliked ? 'active-thumb' : ''}`} 
          onClick={() => { 
            const newDisliked = !disliked;
            setDisliked(newDisliked); 
            setLiked(false);
            if (newDisliked && interactionId) {
              rateInteraction(interactionId, 1);
            }
          }} 
          title="Bad response"
        >
          <ThumbsDown size={14} />
        </button>

        <button 
          className={`toolbar-btn ${shared ? 'active' : ''}`} 
          onClick={handleShare} 
          title="Share response"
        >
          {shared ? <Check size={14} className="text-green" /> : <Share2 size={14} />}
        </button>

        {onRegenerate && (
          <button 
            className="toolbar-btn" 
            onClick={onRegenerate} 
            title="Regenerate response"
          >
            <RotateCcw size={14} />
          </button>
        )}

        <button className="toolbar-btn" title="More options">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
};

const AITutor = ({ 
  currentExperiment, 
  isDrawer = false, 
  onClose, 
  isFullPage = false, 
  onToggleFullPage 
}) => {
  const getDefaultGreeting = (expTitle) => expTitle
    ? `For your study on **${expTitle}**, here is the analytical breakdown. What specific stage or classical reference would you like to explore?`
    : 'Welcome to the Ayurvedic AI Virtual Lab. Ask any question regarding practical compounding, classical Shlokas, or laboratory procedures.';

  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load chat sessions from localStorage:', e);
    }
    const initialId = 'session_' + Date.now();
    return [{
      id: initialId,
      title: currentExperiment?.title ? `${currentExperiment.title}` : 'General Laboratory Study',
      experimentTitle: currentExperiment?.title || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [{ 
        role: 'bot', 
        text: getDefaultGreeting(currentExperiment?.title)
      }]
    }];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id || 'session_' + Date.now());
  const [isHistoryOpen, setIsHistoryOpen] = useState(isFullPage);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isFullPage) {
      setIsHistoryOpen(true);
    }
  }, [isFullPage]);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0] || {
    id: 'session_' + Date.now(),
    title: 'Ayurveda Lab Chat',
    messages: [{ 
      role: 'bot', 
      text: getDefaultGreeting(currentExperiment?.title)
    }]
  };

  const messages = activeSession.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save chat sessions to localStorage:', e);
    }
  }, [sessions]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (currentExperiment?.title) {
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === activeSessionId);
        if (idx !== -1 && prev[idx].messages.length <= 1) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            title: `${currentExperiment.title}`,
            experimentTitle: currentExperiment.title,
            messages: [{ 
              role: 'bot', 
              text: getDefaultGreeting(currentExperiment.title)
            }]
          };
          return updated;
        }
        return prev;
      });
    }
  }, [currentExperiment?.title, activeSessionId]);

  const handleNewChat = () => {
    const newSessionId = 'session_' + Date.now();
    const newSession = {
      id: newSessionId,
      title: currentExperiment?.title ? `${currentExperiment.title} Query` : 'New Laboratory Session',
      experimentTitle: currentExperiment?.title || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [{ 
        role: 'bot', 
        text: getDefaultGreeting(currentExperiment?.title)
      }]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    if (!isFullPage && window.innerWidth < 640) {
      setIsHistoryOpen(false);
    }
  };

  const handleSelectSession = (sessionId) => {
    setActiveSessionId(sessionId);
    if (!isFullPage && window.innerWidth < 640) {
      setIsHistoryOpen(false);
    }
  };

  const handleDeleteSession = (e, sessionId) => {
    e.stopPropagation();
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = 'session_' + Date.now();
        const freshSession = {
          id: freshId,
          title: currentExperiment?.title ? `${currentExperiment.title}` : 'General Laboratory Study',
          experimentTitle: currentExperiment?.title || null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [{ 
            role: 'bot', 
            text: getDefaultGreeting(currentExperiment?.title)
          }]
        };
        setActiveSessionId(freshId);
        return [freshSession];
      }
      if (activeSessionId === sessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  const sendQuestion = async (userMessage) => {
    if (!userMessage || !userMessage.trim() || isLoading) return;

    logUserActivity({
      type: 'tutor',
      colorClass: 'blue',
      title: 'AI Tutor Session',
      detail: `Asked: "${userMessage.slice(0, 35)}${userMessage.length > 35 ? '...' : ''}"`,
      link: '/learning'
    });

    // Extract prior multi-turn conversation history
    const previousHistory = messages
      .filter(m => m.text && m.text.trim())
      .slice(-10)
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text.trim()
      }));

    const isFirstUserMessage = messages.filter(m => m.role === 'user').length === 0;
    const generatedTitle = isFirstUserMessage 
      ? userMessage.slice(0, 32) + (userMessage.length > 32 ? '...' : '')
      : activeSession.title;

    const updatedMessages = [
      ...messages,
      { role: 'user', text: userMessage },
      { role: 'bot', text: '' }
    ];

    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: generatedTitle,
          updatedAt: Date.now(),
          messages: updatedMessages
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);

    try {
      await askTutor(
        userMessage,
        (chunkText) => {
          setIsLoading(false);
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              const currentMsgs = [...s.messages];
              if (currentMsgs.length > 0) {
                const prevMsg = currentMsgs[currentMsgs.length - 1];
                currentMsgs[currentMsgs.length - 1] = { 
                  ...prevMsg,
                  role: 'bot', 
                  text: chunkText 
                };
              }
              return {
                ...s,
                updatedAt: Date.now(),
                messages: currentMsgs
              };
            }
            return s;
          }));
        },
        previousHistory,
        currentExperiment?.title || activeSession.experimentTitle || '',
        ({ interactionId, citations }) => {
          setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
              const currentMsgs = [...s.messages];
              if (currentMsgs.length > 0) {
                const prevMsg = currentMsgs[currentMsgs.length - 1];
                currentMsgs[currentMsgs.length - 1] = {
                  ...prevMsg,
                  interactionId: interactionId || prevMsg.interactionId,
                  citations: citations || prevMsg.citations,
                };
              }
              return {
                ...s,
                messages: currentMsgs,
              };
            }
            return s;
          }));
        }
      );
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          const currentMsgs = [...s.messages];
          if (currentMsgs.length > 0) {
            currentMsgs[currentMsgs.length - 1] = { 
              role: 'bot', 
              text: "An error occurred while communicating with the AI service. Please try asking again." 
            };
          }
          return {
            ...s,
            updatedAt: Date.now(),
            messages: currentMsgs
          };
        }
        return s;
      }));
    }
  };

  const handleRegenerateLast = () => {
    const userMsgs = messages.filter(m => m.role === 'user');
    if (userMsgs.length > 0) {
      const lastUserMsg = userMsgs[userMsgs.length - 1].text;
      sendQuestion(lastUserMsg);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendQuestion(input);
  };

  const isNewSession = messages.length <= 1;

  return (
    <div className={`ai-tutor ${isDrawer ? 'in-drawer' : ''} ${isFullPage ? 'full-page-mode' : ''}`}>
      {/* ====================================================
       * Header Bar: Minimalist ChatGPT Style
       * ==================================================== */}
      <div className="tutor-header">
        <div className="header-left">
          {/* ChatGPT-style Icon-Only Sidebar Slider Button */}
          <button 
            type="button" 
            className={`gpt-sidebar-slider-btn ${isHistoryOpen ? 'active' : ''}`}
            onClick={() => setIsHistoryOpen(prev => !prev)}
            title={isHistoryOpen ? "Close sidebar" : "Open sidebar"}
          >
            {isHistoryOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>

          <div className="header-title-block">
            <div className="title-row">
              <h3>Ayurvedic AI Tutor</h3>
              {currentExperiment?.title && (
                <span className="focus-pill" title={currentExperiment.title}>
                  🔬 {currentExperiment.title}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="header-actions">
          {isDrawer && onToggleFullPage && (
            <button 
              type="button" 
              className={`header-icon-btn ${isFullPage ? 'active-full' : ''}`} 
              onClick={onToggleFullPage} 
              title={isFullPage ? "Exit Full Page Mode" : "Cover Whole Page (Full Screen)"}
            >
              {isFullPage ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}

          {isDrawer && onClose && (
            <button 
              type="button" 
              className="header-icon-btn close" 
              onClick={onClose} 
              title="Close AI Tutor"
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ====================================================
       * Main Body: ChatGPT-Style Sidebar + Canvas
       * ==================================================== */}
      <div className="tutor-body-layout">
        {/* Left ChatGPT-Style Sidebar */}
        <div className={`history-sidebar ${isHistoryOpen ? 'open' : 'closed'}`}>
          {/* Top Brand & Actions in Sidebar */}
          <div className="sidebar-top-bar">
            <div className="sidebar-brand">
              <Sparkles size={16} className="brand-star" />
              <span>Ayurveda AI</span>
            </div>
            <button 
              className="sidebar-close-mini-btn" 
              onClick={() => setIsHistoryOpen(false)}
              title="Close sidebar"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* ChatGPT-Style Prominent "New chat" button */}
          <div className="sidebar-new-chat-container">
            <button 
              type="button" 
              className="gpt-new-chat-btn" 
              onClick={handleNewChat} 
              title="Start a new chat"
            >
              <SquarePen size={15} />
              <span>New chat</span>
            </button>
          </div>

          {/* Quick Laboratory Prompt Chips placed inside Sidebar */}
          <div className="sidebar-quick-prompts-section">
            <span className="sidebar-section-title">Quick Topics</span>
            <div className="sidebar-chips-list">
              <button 
                type="button" 
                className="sidebar-chip-btn prompt-purple"
                onClick={() => sendQuestion(currentExperiment?.title ? `What are the key preparation stages and Siddhi Lakshana for ${currentExperiment.title}?` : 'What are the signs of proper Taila Siddhi (Lakshana)?')} 
              >
                <span>✦ Siddhi Lakshana</span>
              </button>
              <button 
                type="button" 
                className="sidebar-chip-btn prompt-green"
                onClick={() => sendQuestion(currentExperiment?.title ? `What is the classical Sanskrit Shloka and reference for ${currentExperiment.title}?` : 'What are the main classical texts referenced in this lab?')} 
              >
                <BookOpen size={13} />
                <span>Shloka & Source</span>
              </button>
              <button 
                type="button" 
                className="sidebar-chip-btn prompt-amber"
                onClick={() => sendQuestion(currentExperiment?.title ? `What are the key precautions and safety guidelines for ${currentExperiment.title}?` : 'What are the general safety precautions in Rasa Shastra?')} 
              >
                <ShieldCheck size={13} />
                <span>Precautions</span>
              </button>
              <button 
                type="button" 
                className="sidebar-chip-btn prompt-blue"
                onClick={() => sendQuestion(currentExperiment?.title ? `What are the therapeutic indications (Rogaghnata) and dosage for ${currentExperiment.title}?` : 'Explain the concept of Anupana and Matra.')} 
              >
                <Pill size={13} />
                <span>Indications & Dose</span>
              </button>
            </div>
          </div>

          {/* Recents Chat History (ChatGPT Style) */}
          <div className="sidebar-history-section">
            <span className="sidebar-section-title">Recents</span>
            <div className="history-sessions-list">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;

                return (
                  <div 
                    key={sess.id} 
                    className={`gpt-history-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectSession(sess.id)}
                  >
                    <MessageSquare size={14} className="gpt-item-icon" />
                    <span className="gpt-item-title">{sess.title}</span>
                    <button 
                      className="gpt-delete-btn" 
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Chat Canvas */}
        <div className="chat-canvas">
          <div className="messages-container" ref={scrollRef}>
            {isNewSession && (
              <div className="welcome-suggestion-hero">
                <div className="hero-badge">
                  <span className="hero-sparkle">✦</span> Ayurvedic Intelligence
                </div>
                <h4>Namaste! What formulation or experiment would you like to explore?</h4>
                <p>Choose a quick topic from the sidebar or message below:</p>
                
                <div className="hero-topic-grid">
                  <button 
                    type="button" 
                    className="hero-topic-card"
                    onClick={() => sendQuestion(currentExperiment?.title ? `What are the prioritized stages and Siddhi Lakshana for ${currentExperiment.title}?` : 'What are the prioritized signs of proper Taila Siddhi (Lakshana)?')}
                  >
                    <FlaskConical size={16} className="topic-icon purple" />
                    <div className="topic-info">
                      <span className="topic-title">Siddhi Lakshana</span>
                      <span className="topic-desc">Signs of proper preparation</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    className="hero-topic-card"
                    onClick={() => sendQuestion(currentExperiment?.title ? `What are the main ingredients and proportions for ${currentExperiment.title}?` : 'What are the main ingredients of Sitopaladi Churna?')}
                  >
                    <BookOpen size={16} className="topic-icon amber" />
                    <div className="topic-info">
                      <span className="topic-title">Ingredients & Ratio</span>
                      <span className="topic-desc">Component proportions</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    className="hero-topic-card"
                    onClick={() => sendQuestion(currentExperiment?.title ? `What are the critical heating and temperature precautions for ${currentExperiment.title}?` : 'What are the essential heating precautions in Rasa Shastra?')}
                  >
                    <Flame size={16} className="topic-icon red" />
                    <div className="topic-info">
                      <span className="topic-title">Safety & Agni</span>
                      <span className="topic-desc">Precautions & temperature</span>
                    </div>
                  </button>

                  <button 
                    type="button" 
                    className="hero-topic-card"
                    onClick={() => sendQuestion(currentExperiment?.title ? `What are the therapeutic indications and dosage for ${currentExperiment.title}?` : 'What are the therapeutic indications and dosage of Agnitundi Vati?')}
                  >
                    <Pill size={16} className="topic-icon blue" />
                    <div className="topic-info">
                      <span className="topic-title">Indications & Dose</span>
                      <span className="topic-desc">Therapeutic usage (Matra)</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isLastBotMsg = msg.role === 'bot' && idx === messages.length - 1;
              return (
                <div key={idx} className={`message-bubble ${msg.role}`}>
                  <div className="bubble-icon">
                    {msg.role === 'bot' ? (
                      <div className="sparkle-bubble-icon">
                        <span className="sparkle-star">✦</span>
                      </div>
                    ) : (
                      <div className="user-bubble-icon">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <div className="bubble-body">
                    {msg.role === 'bot' ? (
                      <FormattedChatGPTMessage 
                        text={msg.text} 
                        interactionId={msg.interactionId}
                        citations={msg.citations}
                        onRegenerate={isLastBotMsg ? handleRegenerateLast : null} 
                      />
                    ) : (
                      <div className="user-message-wrapper">
                        <p className="user-message-text">{msg.text}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="message-bubble bot thinking-state-wrapper">
                <div className="bubble-icon">
                  <div className="sparkle-bubble-icon pulsing-glow">
                    <span className="sparkle-star glowing-star">✦</span>
                  </div>
                </div>
                <div className="bubble-body thinking-bubble-body">
                  <div className="thinking-header-row">
                    <Loader2 size={16} className="ai-spin-icon" />
                    <span className="shimmering-text">Generating insights from classical texts</span>
                    <div className="typing-dots-wave">
                      <span className="wave-dot dot-1"></span>
                      <span className="wave-dot dot-2"></span>
                      <span className="wave-dot dot-3"></span>
                    </div>
                  </div>
                  <div className="thinking-skeleton-bars">
                    <div className="skeleton-bar bar-long"></div>
                    <div className="skeleton-bar bar-medium"></div>
                    <div className="skeleton-bar bar-short"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Clean Input Area */}
          <form className="tutor-input-area" onSubmit={handleSend}>
            <div className="input-wrapper">
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder={currentExperiment?.title ? `Ask about ${currentExperiment.title}...` : "Message AI Ayurveda Tutor..."}
                disabled={isLoading}
              />
              <span className="input-hint-badge">↵ Enter</span>
            </div>
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()} 
              className="btn-send" 
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AITutor;
