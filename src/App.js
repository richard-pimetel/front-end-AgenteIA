import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Zap,
  StopCircle,
  RefreshCw,
  MessageSquarePlus,
  Wifi,
  WifiOff,
  Share2,
  Sun,
  Moon
} from 'lucide-react';
import './App.css';

const API_URL = 'https://backend-agente-ia-2.onrender.com/api';

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
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Recomendado)' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Rápido)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B' }
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
  const [selectedModel, setSelectedModel] = useState('llama-3.3-70b-versatile');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [darkMode, setDarkMode] = useState(true);
  const [includePreview, setIncludePreview] = useState(true);
  const [currentConversationId, setCurrentConversationId] = useState(() => Date.now().toString());

  const messagesEndRef = useRef(null);
  const streamingMessageRef = useRef('');
  const abortControllerRef = useRef(null);
  const inputRef = useRef(null);
  const messageIdCounterRef = useRef(0);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load settings and history on mount
  useEffect(() => {
    loadHistory();
    loadSettings();

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }

    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (input.trim() && !loading) {
          document.querySelector('[data-testid="send-btn"]')?.click();
        }
      }
      // Ctrl/Cmd + K to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Ctrl/Cmd + L to clear chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        if (messages.length > 0) {
          setMessages([]);
          showToast('Chat limpo');
        }
      }
      // Escape to stop generation
      if (e.key === 'Escape' && streaming && abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setStreaming(false);
        setLoading(false);
        showToast('Geração interrompida', 'info');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [input, loading, streaming, messages.length]);

  // Save settings when changed
  useEffect(() => {
    try {
      localStorage.setItem('richardev-settings', JSON.stringify({
        language: selectedLanguage,
        model: selectedModel,
        darkMode
      }));
    } catch (error) {
      console.log('Erro ao salvar configurações');
    }
  }, [selectedLanguage, selectedModel, darkMode]);

  // Apply dark mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

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

  const loadSettings = () => {
    try {
      const settings = localStorage.getItem('richardev-settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed.language) setSelectedLanguage(parsed.language);
        if (parsed.model) setSelectedModel(parsed.model);
        if (parsed.darkMode !== undefined) setDarkMode(parsed.darkMode);
      }
    } catch (error) {
      console.log('Erro ao carregar configurações');
    }
  };

  const generateMessageId = useCallback(() => {
    messageIdCounterRef.current += 1;
    return `msg-${Date.now()}-${messageIdCounterRef.current}`;
  }, []);

  const saveToHistory = useCallback((convId, allMessages, language, model) => {
    // Pega o primeiro prompt do usuário como título da conversa
    const firstUserMsg = allMessages.find(m => m.type === 'user');
    const lastUserMsg = [...allMessages].reverse().find(m => m.type === 'user');
    const lastAiMsg = [...allMessages].reverse().find(m => m.type === 'ai');

    if (!firstUserMsg || !lastAiMsg) return;

    const newItem = {
      _id: convId,
      prompt: firstUserMsg.content,
      lastPrompt: lastUserMsg?.content || firstUserMsg.content,
      code: lastAiMsg.content,
      messages: allMessages.filter(m => m.type !== 'error').map(m => ({
        id: m.id,
        type: m.type,
        content: m.content,
        language: m.language,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      })),
      language,
      model,
      timestamp: new Date().toISOString()
    };

    setHistory(prev => {
      // Substitui o item existente de mesma conversa, ou adiciona no topo
      const filtered = prev.filter(item => item._id !== convId);
      const updatedHistory = [newItem, ...filtered].slice(0, 50);
      localStorage.setItem('richardev-history', JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setStreaming(false);
      setLoading(false);
      showToast('Geração interrompida', 'info');
    }
  };

  const clearChat = () => {
    if (messages.length > 0) {
      setMessages([]);
      // Gera um novo ID de conversa ao limpar o chat
      setCurrentConversationId(Date.now().toString());
      showToast('Chat limpo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!isOnline) {
      showToast('Sem conexão com a internet', 'error');
      return;
    }

    const userMsgId = generateMessageId();
    const aiMsgId = generateMessageId();

    const userMessage = {
      id: userMsgId,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;

    // Ajusta o prompt enviado para o backend em alguns casos
    let promptForBackend = currentInput;

    // Quando a linguagem selecionada for HTML, força geração de página avançada com CSS embutido (system prompt forte)
    if (selectedLanguage === 'html') {
      promptForBackend =
        'Você é um especialista sênior em UI/UX e CSS moderno. Seu objetivo é gerar páginas HTML altamente refinadas, ' +
        'no nível de um portfólio premium de designer/desenvolvedor.\n\n' +
        'Nível de qualidade esperado: uma landing page de portfólio com tema dark sofisticado, tipografia display + body, ' +
        'paleta com cores neon/gradientes (por exemplo: verde, ciano, roxo), cursor customizado, orbs com blur, fundo com grid/ruído, ' +
        'seções bem definidas (hero, skills, projetos, depoimentos, contato), animações de entrada, hover com transform/box-shadow, ' +
        'counters animados, scroll reveal e layout responsivo usando Flexbox + CSS Grid.\n\n' +
        'Regras obrigatórias:\n' +
        '1) Gere SEMPRE um ÚNICO arquivo HTML completo com <!DOCTYPE html>, <html>, <head>, <body>.\n' +
        'Inclua TODO o CSS dentro de uma tag <style> no <head> e, se necessário, JavaScript inline em <script> no final do <body>.\n' +
        '2) NÃO use layout corporativo simples (header cinza, fundo cinza, caixas retangulares básicas).\n' +
        'Use tipografia display forte, muito espaço em branco, hierarquia visual clara, efeitos modernos (glassmorphism, sombras profundas, cards flutuantes, orbs com blur, gradientes e ruído de fundo).\n' +
        '3) Mobile-first: use media queries para adaptar bem em mobile, tablet e desktop.\n' +
        '4) Organize o CSS em blocos (variáveis, base, layout, componentes, utilitários) e não use arquivos CSS externos nem blocos separados de CSS.\n' +
        '5) Na saída, retorne APENAS um bloco de código marcado como ```html contendo TODO o HTML, CSS (em <style>) e JS (se houver), sem explicações fora do bloco.\n\n' +
        'Depois de aplicar TODAS essas regras, atenda ao pedido específico do usuário abaixo:\n\n' +
        currentInput;
    }
    setInput('');
    setLoading(true);
    setStreaming(true);
    streamingMessageRef.current = '';

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    // Add empty AI message for streaming
    setMessages(prev => [...prev, {
      id: aiMsgId,
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
          prompt: promptForBackend,
          language: selectedLanguage,
          model: selectedModel,
          detailLevel: 'pro',
          preview: includePreview
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Limite de requisições atingido. Aguarde um momento.');
        }
        throw new Error(`Erro do servidor: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Processa qualquer pedaço restante no buffer
          const remaining = buffer.trim();
          if (remaining.startsWith('data: ')) {
            try {
              const data = JSON.parse(remaining.slice(6));
              if (data.content) {
                streamingMessageRef.current += data.content;
              }
            } catch {
              // ignora último pedaço mal formatado ao encerrar
            }
          }

          setStreaming(false);
          const finalContent = streamingMessageRef.current;
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: finalContent,
              streaming: false
            };
            saveToHistory(currentConversationId, updated, selectedLanguage, selectedModel);
            return updated;
          });
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // mantém a última linha (possivelmente incompleta) no buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(line.slice(6));

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.content) {
              streamingMessageRef.current += data.content;

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
              const finalContent = streamingMessageRef.current;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (updated[lastIdx]?.type === 'ai') {
                  updated[lastIdx] = { ...updated[lastIdx], content: finalContent, streaming: false };
                  saveToHistory(currentConversationId, updated, selectedLanguage, selectedModel);
                }
                return updated;
              });
            }
          } catch (parseError) {
            if (parseError.name !== 'SyntaxError') {
              throw parseError;
            }
            // linhas cortadas serão completadas em próximos chunks via buffer
          }
        }
      }

    } catch (error) {
      setStreaming(false);

      if (error.name === 'AbortError') {
        // Request was cancelled, don't show error
        setMessages(prev => {
          const updated = [...prev];
          if (updated[updated.length - 1]?.streaming) {
            updated[updated.length - 1].streaming = false;
          }
          return updated;
        });
        return;
      }

      // Remove empty streaming message and add error
      setMessages(prev => {
        const updated = prev.slice(0, -1);
        return [...updated, {
          id: generateMessageId(),
          type: 'error',
          content: error.message || 'Falha na conexão com o servidor',
          originalPrompt: currentInput,
          timestamp: new Date()
        }];
      });

      showToast(error.message || 'Erro na requisição', 'error');
    } finally {
      setLoading(false);
      // Reset ref DEPOIS de tudo, evitando race condition com saveToHistory
      setTimeout(() => {
        streamingMessageRef.current = '';
        abortControllerRef.current = null;
      }, 0);
    }
  };

  const retryLastMessage = (originalPrompt) => {
    setInput(originalPrompt);
    // Remove error message
    setMessages(prev => prev.slice(0, -1));
    // Focus input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const copyToClipboard = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      showToast('Código copiado!');
    } catch (error) {
      showToast('Erro ao copiar', 'error');
    }
  };

  const copyEntireResponse = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      showToast('Resposta copiada!');
    } catch (error) {
      showToast('Erro ao copiar', 'error');
    }
  };

  const shareCode = async (code, language) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Código ${language} - RichardEv`,
          text: code
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          copyToClipboard(code);
        }
      }
    } else {
      copyToClipboard(code);
    }
  };

  const downloadCode = (code, language) => {
    const extensions = {
      javascript: 'js',
      python: 'py',
      typescript: 'ts',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      csharp: 'cs',
      go: 'go',
      rust: 'rs',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      sql: 'sql',
      html: 'html',
      shell: 'sh'
    };

    const ext = extensions[language] || 'txt';
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `code_${timestamp}.${ext}`;

    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Download iniciado!');
  };

  const loadFromHistory = (item) => {
    // Restaura conversa completa se disponível, senão cria par simples
    if (item.messages && item.messages.length > 0) {
      const restored = item.messages.map(m => ({
        ...m,
        id: m.id || generateMessageId(),
        timestamp: m.timestamp ? new Date(m.timestamp) : new Date(item.timestamp)
      }));
      setMessages(restored);
    } else {
      const userMessage = {
        id: generateMessageId(),
        type: 'user',
        content: item.prompt,
        timestamp: new Date(item.timestamp)
      };
      const aiMessage = {
        id: generateMessageId(),
        type: 'ai',
        content: item.code,
        language: item.language,
        timestamp: new Date(item.timestamp)
      };
      setMessages([userMessage, aiMessage]);
    }

    // Define o conversationId como o da conversa carregada
    // Isso evita que novas mensagens sejam salvas sob outros IDs
    setCurrentConversationId(item._id);

    setSelectedLanguage(item.language || 'auto');
    if (item.model) {
      setSelectedModel(item.model);
    }

    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }

    showToast('Conversa carregada');
  };

  const deleteHistoryItem = (e, itemId) => {
    e.stopPropagation();
    const updatedHistory = history.filter(item => item._id !== itemId);
    setHistory(updatedHistory);
    localStorage.setItem('richardev-history', JSON.stringify(updatedHistory));
    showToast('Item removido');
  };

  const clearHistory = () => {
    if (window.confirm('Deseja limpar todo o histórico?')) {
      setHistory([]);
      localStorage.removeItem('richardev-history');
      showToast('Histórico limpo!');
    }
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `richardev_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Histórico exportado!');
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {/* Connection Status */}
      {!isOnline && (
        <div className="offline-banner">
          <WifiOff size={16} />
          <span>Sem conexão com a internet</span>
        </div>
      )}

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

        {/* New Chat Button */}
        <div className="new-chat-section">
          <button
            className="new-chat-btn"
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <MessageSquarePlus size={18} />
            Nova Conversa
          </button>
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

          <div className="settings-group">
            <label className="settings-label">Pré-visualização</label>
            <button
              type="button"
              className={`theme-toggle-btn${includePreview ? ' active' : ''}`}
              onClick={() => setIncludePreview(!includePreview)}
              title="Incluir seção de pré-visualização na resposta"
            >
              <Sparkles size={18} />
              <span>{includePreview ? 'Ativada' : 'Desativada'}</span>
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="settings-group theme-toggle-group">
            <label className="settings-label">Tema</label>
            <button
              className="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              <span>{darkMode ? 'Claro' : 'Escuro'}</span>
            </button>
          </div>
        </div>

        {/* History Section */}
        <div className="sidebar-content">
          <div className="section-title">
            <div className="section-title-content">
              <History size={14} />
              <span>Histórico ({history.length})</span>
            </div>
            <div className="history-actions">
              {history.length > 0 && (
                <>
                  <button
                    className="history-action-btn"
                    onClick={exportHistory}
                    title="Exportar histórico"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    className="history-action-btn danger"
                    onClick={clearHistory}
                    title="Limpar histórico"
                    data-testid="clear-history-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="history-list">
            {history.length === 0 ? (
              <p className="empty-history">Nenhum histórico ainda</p>
            ) : (
              history.map((item, index) => {
                const isActive = item._id === currentConversationId;
                const msgCount = item.messages ? Math.floor(item.messages.length / 2) : 1;
                const displayPrompt = item.lastPrompt || item.prompt;
                return (
                  <motion.div
                    key={item._id || index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`history-item${isActive ? ' history-item-active' : ''}`}
                    onClick={() => loadFromHistory(item)}
                    data-testid={`history-item-${index}`}
                  >
                    <p className="history-prompt">{displayPrompt}</p>
                    <div className="history-meta">
                      <span className="history-language">{item.language}</span>
                      <span>•</span>
                      <span>{new Date(item.timestamp).toLocaleDateString('pt-BR')}</span>
                      {msgCount > 1 && (
                        <>
                          <span>•</span>
                          <span>{msgCount} trocas</span>
                        </>
                      )}
                      {isActive && <span className="history-active-badge">ativa</span>}
                    </div>
                    <button
                      className="history-delete-btn"
                      onClick={(e) => deleteHistoryItem(e, item._id)}
                      title="Remover"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="shortcuts-section">
          <p className="shortcuts-title">Atalhos</p>
          <div className="shortcuts-list">
            <span><kbd>Ctrl</kbd>+<kbd>Enter</kbd> Enviar</span>
            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Focar</span>
            <span><kbd>Esc</kbd> Parar</span>
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
            {isOnline ? (
              <Wifi size={16} className="online-indicator" />
            ) : (
              <WifiOff size={16} className="offline-indicator" />
            )}
          </div>
          <div className="header-actions">
            {messages.length > 0 && (
              <button
                className="header-btn"
                onClick={clearChat}
                title="Limpar chat"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
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
                    onClick={() => setInput('criar função para validar CPF')}
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

                <motion.div
                  className="tips"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="tips-title">💡 Dicas</p>
                  <ul>
                    <li>Selecione "Auto-detectar" para o agente escolher a melhor linguagem</li>
                    <li>Use <kbd>Ctrl</kbd>+<kbd>Enter</kbd> para enviar rapidamente</li>
                    <li>Pressione <kbd>Esc</kbd> para parar a geração a qualquer momento</li>
                  </ul>
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id || `msg-fallback-${index}`}
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
                        <div className="message-header">
                          <div className="message-label">
                            <Bot size={18} />
                            <span>RichardEv</span>
                          </div>
                          {msg.content && !msg.streaming && (
                            <div className="message-actions">
                              <button
                                className="message-action-btn"
                                onClick={() => copyEntireResponse(msg.content)}
                                title="Copiar resposta"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                        {msg.content && (
                          <div className="ai-response">
                            <ReactMarkdown
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const rawCode = String(children).replace(/\n$/, '');

                                  if (!inline && match) {
                                    const lang = match[1];
                                    const isHtmlLike = ['html', 'html5', 'xml'].includes(lang.toLowerCase());
                                    const fullContent = msg.content || '';

                                    // Se houver bloco CSS separado, monta HTML completo com <style> embutido
                                    let combinedCode = rawCode;
                                    if (isHtmlLike) {
                                      const cssMatch = fullContent.match(/```css([\s\S]*?)```/i);
                                      const cssCode = cssMatch ? cssMatch[1].trim() : '';

                                      if (cssCode) {
                                        combinedCode = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Prévia</title>
    <style>
${cssCode}
    </style>
  </head>
  <body>
${rawCode}
  </body>
</html>`;
                                      }
                                    }

                                    const openHtmlPreview = () => {
                                      const html = combinedCode;
                                      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                                      const url = URL.createObjectURL(blob);
                                      window.open(url, '_blank', 'noopener,noreferrer');
                                      setTimeout(() => URL.revokeObjectURL(url), 30000);
                                    };

                                    return (
                                      <div className="code-block">
                                        <div className="code-header">
                                          <span className="code-language">
                                            <Code2 size={15} />
                                            {lang}
                                          </span>
                                          <div className="code-actions">
                                            <button
                                              className="code-action-btn"
                                              onClick={() => copyToClipboard(combinedCode)}
                                              title="Copiar código"
                                            >
                                              <Copy size={14} />
                                              Copiar
                                            </button>
                                            <button
                                              className="code-action-btn"
                                              onClick={() => shareCode(combinedCode, lang)}
                                              title="Compartilhar"
                                            >
                                              <Share2 size={14} />
                                            </button>
                                            <button
                                              className="code-action-btn"
                                              onClick={() => downloadCode(combinedCode, lang)}
                                              title="Baixar arquivo"
                                            >
                                              <Download size={14} />
                                              Baixar
                                            </button>
                                            {isHtmlLike && (
                                              <button
                                                className="code-action-btn"
                                                onClick={openHtmlPreview}
                                                title="Abrir prévia em nova aba"
                                              >
                                                <Terminal size={14} />
                                                Prévia
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                        <div className="code-content">
                                          <SyntaxHighlighter
                                            style={vscDarkPlus}
                                            language={lang}
                                            PreTag="div"
                                            customStyle={{
                                              margin: 0,
                                              background: 'transparent',
                                              padding: '1.25rem'
                                            }}
                                            {...props}
                                          >
                                            {rawCode}
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
                            <button
                              className="stop-btn"
                              onClick={stopGeneration}
                              title="Parar geração (Esc)"
                            >
                              <StopCircle size={14} />
                              Parar
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {msg.type === 'error' && (
                      <div className="error-container">
                        <div className="message-content error">
                          <p>⚠️ {msg.content}</p>
                        </div>
                        {msg.originalPrompt && (
                          <button
                            className="retry-btn"
                            onClick={() => retryLastMessage(msg.originalPrompt)}
                          >
                            <RefreshCw size={14} />
                            Tentar novamente
                          </button>
                        )}
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
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isOnline ? "Descreva o código que você quer gerar..." : "Sem conexão..."}
                disabled={loading || !isOnline}
                autoFocus
                data-testid="chat-input"
              />
              {streaming ? (
                <button
                  type="button"
                  className="stop-btn-main"
                  onClick={stopGeneration}
                  title="Parar geração"
                >
                  <StopCircle size={22} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="send-btn"
                  disabled={loading || !input.trim() || !isOnline}
                  data-testid="send-btn"
                >
                  {loading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <SendHorizontal size={22} />
                  )}
                </button>
              )}
            </form>
            <p className="input-hint">
              Pressione <kbd>Ctrl</kbd>+<kbd>Enter</kbd> para enviar
            </p>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={`toast toast-${toast.type || 'success'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Check size={18} />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
