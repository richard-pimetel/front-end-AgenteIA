import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  SendHorizontal, 
  Copy, 
  Download, 
  History, 
  Trash2, 
  Menu, 
  X,
  Loader2,
  Code2,
  Sparkles,
  Check,
  Terminal,
  Braces,
  FileCode,
  ChevronDown,
  Zap
} from 'lucide-react';
import './App.css';

const API_URL = 'https://backend-agente-ia-1.onrender.com/api';

// Linguagens disponíveis
const LANGUAGES = [
  { value: 'auto', label: 'Auto-detectar' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML/CSS' },
  { value: 'shell', label: 'Shell/Bash' }
];

// Modelos disponíveis
const MODELS = [
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (Padrão)' },
  { value: 'llama3-70b-8192', label: 'Llama 3 70B' },
  { value: 'llama3-8b-8192', label: 'Llama 3 8B' },
  { value: 'gemma-7b-it', label: 'Gemma 7B' }
];

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [history, setHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b-32768');
  const messagesEndRef = useRef(null);
  const streamingMessageRef = useRef('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadHistory();
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  }, []);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('richardev-history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Erro ao carregar histórico');
    }
  };

  const saveToHistory = (prompt, code, language, model) => {
    const newItem = {
      _id: Date.now().toString(),
      prompt,
      code,
      language,
      model,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [newItem, ...history].slice(0, 20);
    setHistory(updatedHistory);
    localStorage.setItem('richardev-history', JSON.stringify(updatedHistory));
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);
    setStreaming(true);
    streamingMessageRef.current = '';

    // Adiciona mensagem de IA vazia para streaming
    const aiMessageIndex = messages.length + 1;
    setMessages(prev => [...prev, {
      type: 'ai',
      content: '',
      language: selectedLanguage,
      streaming: true,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch(`${API_URL}/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentInput,
          language: selectedLanguage,
          model: selectedModel
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setStreaming(false);
          // Atualiza a última mensagem removendo o flag de streaming
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              streaming: false
            };
            return updated;
          });
          
          // Salva no histórico
          saveToHistory(currentInput, streamingMessageRef.current, selectedLanguage, selectedModel);
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.content) {
                streamingMessageRef.current += data.content;
                
                // Atualiza a mensagem de IA com o conteúdo acumulado
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: streamingMessageRef.current
                  };
                  return updated;
                });
              }

              if (data.done) {
                setStreaming(false);
              }
            } catch (parseError) {
              console.log('Error parsing SSE data:', parseError);
            }
          }
        }
      }

    } catch (error) {
      setStreaming(false);
      
      // Remove a mensagem de streaming vazia e adiciona mensagem de erro
      setMessages(prev => {
        const updated = prev.slice(0, -1);
        return [...updated, {
          type: 'error',
          content: `Erro: ${error.message || 'Falha na conexão com o servidor'}`,
          timestamp: new Date()
        }];
      });
    } finally {
      setLoading(false);
      streamingMessageRef.current = '';
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado!');
  };

  const downloadCode = (code, language) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      typescript: 'ts',
      java: 'java',
      cpp: 'cpp',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift'
    };
    
    const ext = extensions[language] || 'txt';
    const filename = `code.${ext}`;
    
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download iniciado!');
  };

  const loadFromHistory = (item) => {
    const userMessage = {
      type: 'user',
      content: item.prompt,
      timestamp: new Date(item.timestamp)
    };

    const aiMessage = {
      type: 'ai',
      content: item.code,
      language: item.language,
      timestamp: new Date(item.timestamp)
    };

    setMessages([userMessage, aiMessage]);
    setSelectedLanguage(item.language);
    if (item.model) {
      setSelectedModel(item.model);
    }
    
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico?')) {
      setHistory([]);
      localStorage.removeItem('richardev-history');
      showToast('Histórico limpo!');
    }
  };

  return (
    <div className="app">
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} data-testid="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">
              <Bot size={26} />
            </div>
            <div className="logo-text">
              <h1>RichardEv</h1>
              <span>Agente de Código IA</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="settings-section">
          <div className="settings-group">
            <label className="settings-label">Linguagem</label>
            <div className="select-wrapper">
              <select 
                className="settings-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                data-testid="language-select"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>

          <div className="settings-group">
            <label className="settings-label">Modelo IA</label>
            <div className="select-wrapper">
              <select 
                className="settings-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                data-testid="model-select"
              >
                {MODELS.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="select-icon" />
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="sidebar-content">
          <div className="section-title">
            <div className="section-title-content">
              <History size={14} />
              <span>Histórico</span>
            </div>
            {history.length > 0 && (
              <button 
                className="clear-history-btn"
                onClick={clearHistory} 
                title="Limpar histórico"
                data-testid="clear-history-btn"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          
          <div className="history-list">
            {history.length === 0 ? (
              <p className="empty-history">Nenhum histórico ainda</p>
            ) : (
              history.map((item, index) => (
                <motion.div
                  key={item._id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="history-item"
                  onClick={() => loadFromHistory(item)}
                  data-testid={`history-item-${index}`}
                >
                  <p className="history-prompt">{item.prompt}</p>
                  <div className="history-meta">
                    <span className="history-language">{item.language}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleDateString('pt-BR')}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="mobile-menu-btn"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-title">
            <Sparkles size={20} />
            <span>Gerador de Código com IA</span>
          </div>
          <div style={{ width: 40 }} />
        </header>

        {/* Messages */}
        <div className="messages-container">
          <div className="messages-wrapper">
            {messages.length === 0 ? (
              <div className="welcome">
                <motion.div 
                  className="welcome-icon"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Bot size={48} />
                </motion.div>
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Olá, eu sou RichardEv
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Seu assistente de IA para geração de código em tempo real. Escolha a linguagem e o modelo, e vamos criar algo incrível!
                </motion.p>
                <motion.div 
                  className="examples"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <button 
                    className="example-btn" 
                    onClick={() => setInput('criar função para validar CPF em JavaScript')}
                    data-testid="example-cpf"
                  >
                    <Terminal size={18} />
                    Validar CPF
                  </button>
                  <button 
                    className="example-btn" 
                    onClick={() => setInput('criar API REST com autenticação JWT')}
                    data-testid="example-api"
                  >
                    <Braces size={18} />
                    API REST
                  </button>
                  <button 
                    className="example-btn" 
                    onClick={() => setInput('criar componente React de formulário de login')}
                    data-testid="example-react"
                  >
                    <FileCode size={18} />
                    Componente React
                  </button>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`message message-${msg.type}`}
                  >
                    {msg.type === 'user' && (
                      <div className="message-content">
                        <p>{msg.content}</p>
                      </div>
                    )}

                    {msg.type === 'ai' && (
                      <>
                        <div className="message-label">
                          <Bot size={18} />
                          <span>RichardEv</span>
                        </div>
                        {msg.content && (
                          <div className="ai-response">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeString = String(children).replace(/\n$/, '');
                                  
                                  if (!inline && match) {
                                    return (
                                      <div className="code-block">
                                        <div className="code-header">
                                          <span className="code-language">
                                            <Code2 size={15} />
                                            {match[1]}
                                          </span>
                                          <div className="code-actions">
                                            <button 
                                              className="code-action-btn"
                                              onClick={() => copyToClipboard(codeString)}
                                            >
                                              <Copy size={14} />
                                              Copiar
                                            </button>
                                            <button 
                                              className="code-action-btn"
                                              onClick={() => downloadCode(codeString, match[1])}
                                            >
                                              <Download size={14} />
                                              Baixar
                                            </button>
                                          </div>
                                        </div>
                                        <div className="code-content">
                                          <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={match[1]}
                                            PreTag="div"
                                            customStyle={{ 
                                              margin: 0, 
                                              background: 'transparent',
                                              padding: '1.25rem'
                                            }}
                                            {...props}
                                          >
                                            {codeString}
                                          </SyntaxHighlighter>
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return (
                                    <code className="inline-code" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                        {msg.streaming && (
                          <div className="streaming-indicator">
                            <Zap size={14} />
                            Gerando código em tempo real...
                          </div>
                        )}
                      </>
                    )}

                    {msg.type === 'error' && (
                      <div className="message-content">
                        <p>{msg.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && !streaming && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="message message-ai"
              >
                <div className="message-label">
                  <Loader2 size={18} className="animate-spin" />
                  <span>RichardEv está pensando...</span>
                </div>
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="input-container">
          <div className="input-wrapper">
            <form onSubmit={handleSubmit} className="input-form">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Descreva o código que você quer gerar..."
                disabled={loading}
                autoFocus
                data-testid="chat-input"
              />
              <button 
                type="submit" 
                className="send-btn"
                disabled={loading || !input.trim()}
                data-testid="send-btn"
              >
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <SendHorizontal size={22} />
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={18} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
