import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User, FileText, Search, Wifi, Volume2, Clock, Loader2, 
  BrainCircuit, Send, ShieldCheck, DollarSign, Power, LogOut
} from 'lucide-react';

const XP_WALLPAPER_URL = `${import.meta.env.BASE_URL}bliss.jpg`;

// --- 1. Main App (The "OS") ---
export default function App() {
  const [user, setUser] = useState({
    displayName: 'Guest',
    avatar: '' 
  });
  
  const [appState, setAppState] = useState('desktop'); 

  const handleLogout = () => {
    setAppState('shutdown');
  };
  
  if (appState === 'shutdown') {
    return <ShutDownAnimation onRestart={() => setAppState('desktop')} />
  }
  
  return <Desktop user={user} onLogout={handleLogout} />;
}


// --- 2. Desktop ---
function Desktop({ user, onLogout }) {
  const [windows, setWindows] = useState({
    readme: { id: 'readme', title: 'Readme Generator', icon: <FileText size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 50, y: 50 }, zIndex: 1, content: <ReadmeGeneratorApp /> },
    pathfinder: { id: 'pathfinder', title: 'Repo Pathfinder', icon: <Search size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 100, y: 100 }, zIndex: 1, content: <PathfinderApp /> },
    analyst: { id: 'analyst', title: 'AI Code Analyst (RAG)', icon: <BrainCircuit size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 150, y: 150 }, zIndex: 1, content: <RepoAnalystApp /> },
    security: { id: 'security', title: 'Security Auditor', icon: <ShieldCheck size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 200, y: 200 }, zIndex: 1, content: <SecurityAuditorApp /> },
    
    // --- FUNDING WINDOW (Persistent) ---
    funding: { 
      id: 'funding', 
      title: 'Demo Information', 
      icon: <DollarSign size={16} />, 
      isOpen: true, // Starts open!
      isMinimized: false, 
      isMaximized: false, 
      // Positioned top-rightish. Checks if window exists to prevent SSR errors
      pos: { x: typeof window !== 'undefined' ? Math.max(100, window.innerWidth - 550) : 600, y: 40 }, 
      zIndex: 2, 
      content: <FundProjectApp /> 
    },
    
    shutdown: { id: 'shutdown', title: 'Turn Off Computer', icon: <Power size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 300, y: 200 }, zIndex: 100, content: <ShutDownWindow /> }
  });

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [zIndexCounter, setZIndexCounter] = useState(10);

  // --- Window Handlers ---
  const bringToFront = (id) => {
    const newZIndex = zIndexCounter + 1;
    setZIndexCounter(newZIndex);
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: newZIndex, isMinimized: false }
    }));
  };

  const openWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: true, isMinimized: false }
    }));
    bringToFront(id);
  };

  const closeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
  };

  const minimizeWindow = (id) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true }
    }));
  };

  const maximizeWindow = (id) => {
    const willBeMaximized = !windows[id].isMaximized;
    const newWindows = { ...windows };
    
    if (willBeMaximized) {
      // If we are maximizing this window, un-maximize others
      for (const key in newWindows) {
        if (key !== id) newWindows[key] = { ...newWindows[key], isMaximized: false };
      }
    }
    newWindows[id] = { ...newWindows[id], isMaximized: willBeMaximized };
    setWindows(newWindows);
    bringToFront(id);
  };

  const handleDrag = (id, newPos) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], pos: newPos }
    }));
  };
  
  // Logic to hide the Funding window if another app takes up the screen
  const isAnyOtherWindowMaximized = Object.values(windows).some(
    win => win.id !== 'funding' && win.id !== 'shutdown' && win.isMaximized
  );

  return (
    <div className="desktop" style={{ backgroundImage: `url(${XP_WALLPAPER_URL})` }} onClick={() => setStartMenuOpen(false)}>
      
      {/* Desktop Icons */}
      <div className="desktop-icon-container">
        <DesktopIcon icon={<FileText size={40} />} label="Readme Generator" onDoubleClick={() => openWindow('readme')} />
        <DesktopIcon icon={<Search size={40} />} label="Repo Pathfinder" onDoubleClick={() => openWindow('pathfinder')} />
        <DesktopIcon icon={<BrainCircuit size={40} />} label="AI Code Analyst" onDoubleClick={() => openWindow('analyst')} />
        <DesktopIcon icon={<ShieldCheck size={40} />} label="Security Auditor" onDoubleClick={() => openWindow('security')} />
      </div>

      {/* Window Rendering Loop */}
      {Object.values(windows).map(win => {
        // Special logic: Hide Funding window if another app is maximized
        if (win.id === 'funding' && win.isOpen && isAnyOtherWindowMaximized) {
          return null;
        }

        if (win.isOpen && !win.isMinimized) {
          return (
            <Window
              key={win.id}
              id={win.id}
              title={win.title}
              isMaximized={win.isMaximized}
              pos={win.pos}
              zIndex={win.zIndex}
              onClose={() => closeWindow(win.id)}
              onMinimize={() => minimizeWindow(win.id)}
              onMaximize={() => maximizeWindow(win.id)}
              onFocus={() => bringToFront(win.id)}
              onDrag={handleDrag}
            >
              {win.content}
            </Window>
          );
        }
        return null;
      })}
      
      {startMenuOpen && <StartMenu user={user} onLogout={onLogout} />}
      
      <Taskbar 
        windows={windows} 
        onTabClick={bringToFront} 
        onStartClick={() => setStartMenuOpen(s => !s)} 
      />
    </div>
  );
}

// --- 3. Desktop Helper Components ---
function DesktopIcon({ icon, label, onDoubleClick }) {
  return (
    <div className="desktop-icon" onDoubleClick={onDoubleClick}>
      <div className="desktop-icon-image">{icon}</div>
      <span className="desktop-icon-label">{label}</span>
    </div>
  );
}

function Taskbar({ onStartClick, windows, onTabClick }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  const activeWindowId = Object.values(windows).reduce(
    (active, win) => (win.isOpen && !win.isMinimized && win.zIndex > (windows[active]?.zIndex || 0) ? win.id : active),
    null
  );

  return (
    <div className="taskbar">
      <button onClick={(e) => { e.stopPropagation(); onStartClick(); }} className="start-button">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="white" className="start-button-icon"><path d="M15.177 11.823C13.882 10.457 12 10.354 12 10.354C12 10.354 11.234 8.657 9.474 8.657C7.714 8.657 6.463 10.354 6.463 10.354C6.463 10.354 4.118 10.457 2.823 11.823C1.402 13.313 0.823 15 0.823 15H17.177C17.177 15 16.598 13.313 15.177 11.823ZM4.01 7.203C4.01 8.214 4.819 9.034 5.819 9.034C6.819 9.034 7.629 8.214 7.629 7.203C7.629 6.192 6.819 5.372 5.819 5.372C4.819 5.372 4.01 6.192 4.01 7.203ZM12.181 9.034C13.181 9.034 13.99 8.214 13.99 7.203C13.99 6.192 13.181 5.372 12.181 5.372C11.181 5.372 10.371 6.192 10.371 7.203C10.371 8.214 11.181 9.034 12.181 9.034ZM10.371 3.518C10.371 4.529 11.181 5.349 12.181 5.349C13.181 5.349 13.99 4.529 13.99 3.518C13.99 2.507 13.181 1.687 12.181 1.687C11.181 1.687 10.371 2.507 10.371 3.518ZM5.819 5.349C6.819 5.349 7.629 4.529 7.629 3.518C7.629 2.507 6.819 1.687 5.819 1.687C4.819 1.687 4.01 2.507 4.01 3.518C4.01 4.529 4.819 5.349 5.819 5.349Z"/></svg>
        <span className="start-button-text">start</span>
      </button>
      
      <div className="taskbar-tabs-container">
        {Object.values(windows).map(win => (
          win.isOpen && (
            <button
              key={win.id}
              onClick={() => onTabClick(win.id)}
              className={`taskbar-tab ${activeWindowId === win.id && !win.isMinimized ? 'active' : ''} ${win.isMinimized ? 'minimized' : ''}`}
            >
              <span className="taskbar-tab-icon">{win.icon}</span>
              <span className="taskbar-tab-label">{win.title}</span>
            </button>
          )
        ))}
      </div>
      
      <div className="clock-area">
        <Wifi size={16} /><Volume2 size={16} /><Clock size={16} />
        <span className="clock-area-text">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}

// --- 5. Window Component ---
function Window({ 
  id, title, children, onClose, onMinimize, onMaximize, 
  onFocus, onDrag, pos, zIndex, isMaximized 
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (isMaximized) return;
    onFocus();
    const windowEl = e.currentTarget.parentElement;
    const rect = windowEl.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); 
      onDrag(id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };
    const handleMouseUp = () => setIsDragging(false);
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onDrag, id]);

  const windowClasses = `window-wrapper ${isMaximized ? 'maximized' : ''}`;
  const windowStyles = {
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    zIndex: zIndex,
    width: '640px', 
    height: '480px', 
  };
  
  if (id === 'shutdown') {
    windowStyles.width = '420px';
    windowStyles.height = '240px';
  }
  if (id === 'funding') {
    windowStyles.width = '520px';
    windowStyles.height = '420px';
  }

  return (
    <div className={windowClasses} style={!isMaximized ? windowStyles : { zIndex: zIndex }}>
      <div 
        className="title-bar" 
        onMouseDown={handleMouseDown}
        onDoubleClick={id !== 'funding' && id !== 'shutdown' ? onMaximize : undefined} 
      >
        <span className="title-bar-label">{title}</span>
        <div className="title-bar-buttons">
          {/* Don't show min/max on shutdown window */}
          {id !== 'shutdown' && id !== 'funding' && (
            <>
              {/* --- UPDATED MINIMIZE BUTTON --- */}
              <button className="window-button minimize" onClick={onMinimize}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="5" y="11" width="8" height="2" fill="white"/>
                </svg>
              </button>
              {/* --- UPDATED MAXIMIZE BUTTON --- */}
              <button className="window-button maximize" onClick={onMaximize}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="5" y="5" width="8" height="8" stroke="white" strokeWidth="2" fill="none"/>
                </svg>
              </button>
            </>
          )}
          {/* FUNDING: Only Minimize */}
           {id === 'funding' && (
             <button className="window-button minimize" onClick={onMinimize}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <rect x="5" y="11" width="8" height="2" fill="white"/>
                </svg>
             </button>
           )}

          {/* CLOSE BUTTON (X) */}
          {id !== 'funding' && (
             <button className="window-button close" onClick={onClose}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M5 5L13 13M13 5L5 13" stroke="white" strokeWidth="2"/>
                </svg>
             </button>
          )}
        </div>
      </div>
      <div className="w-full flex-grow overflow-y-auto xp-window-body">{children}</div>
    </div>
  );
}

// --- 6. Start Menu ---
function StartMenu({ user, onLogout }) {
  const GithubIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
  );
  const LinkedinIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
  );

  return (
    <div className="start-menu-container" onClick={(e) => e.stopPropagation()}>
      <div className="start-menu-header">
        {user.avatar ? <img src={user.avatar} alt="User Avatar" className="start-menu-avatar" /> : <div className="start-menu-avatar-wrapper"><User size={40} className="text-gray-600" /></div>}
        <span className="start-menu-user">{user.displayName}</span>
      </div>
      <div className="start-menu-body">
        <a href="https://github.com/anvitvermaa" target="_blank" rel="noopener noreferrer" className="start-menu-link">
          <div className="start-menu-link-icon"><GithubIcon /></div><span className="start-menu-link-label">My GitHub</span>
        </a>
        <a href="https://www.linkedin.com/in/anvit-verma-b8133228a/" target="_blank" rel="noopener noreferrer" className="start-menu-link">
          <div className="start-menu-link-icon"><LinkedinIcon /></div><span className="start-menu-link-label">My LinkedIn</span>
        </a>
      </div>
      <div className="start-menu-footer">
        <button onClick={onLogout} className="start-menu-logout"><LogOut size={24} /> Log Off</button>
      </div>
    </div>
  );
}

// --- 7. Overview Screen ---
function AgentDemoOverview({ icon, title, children, onStartDemo }) {
  return (
    <div className="agent-overview-container">
      <div className="agent-overview-icon">{icon}</div>
      <h2 className="agent-overview-title">{title}</h2>
      <div className="agent-overview-content">{children}</div>
      <button onClick={onStartDemo} className="agent-overview-button xp-outset-border">Watch Demo</button>
    </div>
  );
}

// --- 8. Animated Log Demo ---
function AnimatedLogDemo({ repoUrl, script }) {
  const [lines, setLines] = useState([`> User request: ${repoUrl}`]);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  useEffect(() => {
    let currentLine = 0;
    const timeouts = [];
    const processLine = () => {
      if (currentLine >= script.length) { setIsComplete(true); return; }
      const line = script[currentLine];
      const delay = line.delay || 1000;
      const timeout = setTimeout(() => {
        setLines(prev => [...prev, line.text]);
        currentLine++;
        processLine();
      }, delay);
      timeouts.push(timeout);
    };
    const startTimeout = setTimeout(processLine, 1000);
    timeouts.push(startTimeout);
    return () => timeouts.forEach(clearTimeout);
  }, [script, repoUrl]);

  return (
    <div className="xp-inset-border" style={{height: '100%', backgroundColor: 'white', overflow: 'auto'}}>
      <div style={{padding: '10px', fontFamily: "'Courier New', Courier, monospace", fontSize: '14px', color: '#333'}}>
        {lines.map((line, index) => (
          <p key={index} style={{margin: '2px 0', whiteSpace: 'pre-wrap'}}>
            <span style={{color: 'green', marginRight: '8px'}}>{`$`}</span>{line}
          </p>
        ))}
        {!isComplete && <div style={{display: 'flex', alignItems: 'center'}}><span style={{color: 'green', marginRight: '8px'}}>{`$`}</span><span style={{animation: 'blink 1s step-end infinite', background: '#333', width: '8px', height: '16px'}}></span></div>}
        {isComplete && <p style={{color: 'blue', marginTop: '1rem'}}>$ Demo complete. You can close this window.</p>}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

// --- 9. Animated Chat Demo ---
function AnimatedChatDemo({ repoUrl, script }) {
  const [messages, setMessages] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    let currentMsg = 0;
    const timeouts = [];
    const processMessage = () => {
      if (currentMsg >= script.length) { setIsComplete(true); return; }
      const msg = script[currentMsg];
      const delay = msg.delay || (msg.sender === 'user' ? 1500 : 3000);
      const timeout = setTimeout(() => {
        setMessages(prev => [...prev, msg]);
        currentMsg++;
        processMessage();
      }, delay);
      timeouts.push(timeout);
    };
    setMessages([{ sender: 'ai', text: `Loading and indexing '${repoUrl}'... (This is a simulation)` }]);
    const startTimeout = setTimeout(processMessage, 2500);
    timeouts.push(startTimeout);
    return () => timeouts.forEach(clearTimeout);
  }, [script, repoUrl]);

  return (
    <div className="chat-window">
      <div className="chat-messages" ref={chatEndRef}>
        <div className="chat-message-container">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'ai'}`}>
              <article className="prose prose-sm prose-tahoma"><ReactMarkdown>{msg.text}</ReactMarkdown></article>
            </div>
          ))}
          {!isComplete && <div className="chat-bubble loading"><Loader2 size={24} className="animate-spin" style={{color: '#374151'}} /></div>}
          {isComplete && <p style={{textAlign: 'center', fontSize: '12px', color: '#555', marginTop: '1rem'}}>Demo complete. You can close this window.</p>}
        </div>
      </div>
      <div className="chat-input-bar">
        <input type="text" placeholder="Demo in progress... Please watch." className="chat-input" disabled={true} />
        <button type="submit" disabled={true} className="chat-send-button"><Send size={20} /></button>
      </div>
    </div>
  );
}

// --- 10. Demo Scripts (Unchanged) ---
const README_SCRIPT = [
  { text: "Cloning repository 'Multi-Agent-Telecom-Optimizer'...", delay: 1000 },
  { text: "Analyzing file structure...", delay: 1500 },
  { text: "Detected Python project. Analyzing 'requirements.txt'...", delay: 1500 },
  { text: "Found key technologies: langgraph, langchain, groq, mlflow, chromadb, sqlalchemy.", delay: 2000 },
  { text: "Scanning source code for major components...", delay: 2500 },
  { text: "Identified 3 main graphs: 'MarketingAgent', 'SupportAgent', 'WebQA'.", delay: 1000 },
  { text: "Detected stateful review loop with 'Supervisor' node.", delay: 1500 },
  { text: "Sending analysis to LLaMA3 for README generation...", delay: 1500 },
  { text: "Receiving response...", delay: 2000 },
  { text: "GENERATING README.md...", delay: 500 },
  { text: "🚀 Multi-Agent Telecom Marketing & Support Optimizer", delay: 1000 },
  { text: "Orchestrate complex workflows for marketing message generation and verification...", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "✨ Key Features", delay: 1000 },
  { text: "- Stateful Orchestration (LangGraph): Dynamic branching, reflection, and supervisor-review loops.", delay: 1000 },
  { text: "- Creative + Supervisor LLMs: LLaMA3 (via Groq) generates messages and reviews them for quality.", delay: 1000 },
  { text: "- RAG: Web scraping & ChromaDB retrieval provide context grounding for agents.", delay: 1000 },
  { text: "- Observability: Integrated with MLflow for autologging prompts, decisions, and quality metrics.", delay: 1000 },
  { text: "- Data Integration: Connects to MySQL to pull customer features (plan, usage, churn risk).", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "🔧 Tech Stack", delay: 1000 },
  { text: "LangGraph, LangChain, LLaMA3, Groq, ChromaDB, MLflow, Databricks, SQLAlchemy, Pandas", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "✅ README generation complete.", delay: 1000 },
];
const PATHFINDER_SCRIPT = [
  { text: "User query: 'langgraph multi-agent marketing'", delay: 1000 },
  { text: "Sending query to LLM for GitHub search terms...", delay: 2000 },
  { text: "Searching GitHub for 'langgraph stateful agent', 'marketing automation', 'telecom ai'", delay: 2500 },
  { text: "Found 3 relevant repositories. Analyzing READMEs...", delay: 1500 },
  { text: "Generating final report (Sorted by Stars)...", delay: 2000 },
  { text: "---", delay: 500 },
  { text: "1. ⭐️ Stars: 8,500+", delay: 1000 },
  { text: "   Repo: langchain-ai/langgraph", delay: 500 },
  { text: "   Link: github.com/langchain-ai/langgraph", delay: 500 },
  { text: "   Tech: LangChain, Python", delay: 500 },
  { text: "   Summary: The official library for building stateful, multi-agent applications.", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "2. ⭐️ Stars: 150 (Demo)", delay: 1000 },
  { text: "   Repo: anvitvermaa/Multi-Agent-Telecom-Optimizer", delay: 500 },
  { text: "   Link: github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer", delay: 500 },
  { text: "   Tech: LangGraph, LLaMA3, MLflow, ChromaDB", delay: 500 },
  { text: "   Summary: A stateful multi-agent graph for telecom marketing and support.", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "3. ⭐️ Stars: 90 (Demo)", delay: 1000 },
  { text: "   Repo: example/langgraph-crewai-examples", delay: 500 },
  { text: "   Link: github.com/example/langgraph-crewai-examples", delay: 500 },
  { text: "   Tech: LangGraph, CrewAI, Ollama", delay: 500 },
  { text: "   Summary: Examples of combining LangGraph with CrewAI for agentic workflows.", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "Done. Job successfully completed.", delay: 1000 },
];
const ANALYST_SCRIPT = [
  { sender: 'user', text: 'How does this project ensure marketing message quality?', delay: 2000 },
  { sender: 'ai', text: "It uses a stateful **LangGraph** workflow with a 'Supervisor-Review' loop. A 'Creative' agent generates the message, and a 'Supervisor' LLM (LLaMA3) reviews it for clarity and tone. If the score is below a set threshold, it's sent back to the creative agent for auto-regeneration.", delay: 4000 },
  { sender: 'user', text: 'Where does the customer data come from for personalization?', delay: 2000 },
  { sender: 'ai', text: "The system pulls customer features (like their current plan, monthly usage, and churn risk score) from a **MySQL** database. This data is combined with web-scraped promotional info using RAG to ground the agent's response, ensuring the message is both relevant and personalized.", delay: 4000 },
  { sender: 'user', text: 'How is this all evaluated?', delay: 1500 },
  { sender: 'ai', text: "The entire graph is integrated with **MLflow**. It auto-logs the prompts, the supervisor's scores, retrieval quality, and the final generated message. This allows for continuous monitoring and auditing of the agent's performance.", delay: 3000 },
];
const SECURITY_SCRIPT = [
  { text: "Cloning repository 'Multi-Agent-Telecom-Optimizer'...", delay: 1000 },
  { text: "---", delay: 500 },
  { text: "Phase 1: Static Analysis (SAST) - Secret Scanning", delay: 1000 },
  { text: "Scanning 28 files for high-entropy strings and secret patterns...", delay: 2500 },
  { text: "✅ [PASSED] No hardcoded API keys found. Project correctly uses 'os.getenv()' and '.env' file.", delay: 2000 },
  { text: "---", delay: 500 },
  { text: "Phase 2: Software Composition Analysis (SCA)", delay: 1000 },
  { text: "Analyzing 'requirements.txt' for known vulnerabilities...", delay: 2000 },
  { text: "✅ [PASSED] No high-severity vulnerabilities found in 'langgraph', 'mlflow', 'sqlalchemy', etc.", delay: 2000 },
  { text: "---", delay: 500 },
  { text: "Phase 3: Insecure Coding Pattern Analysis (LLM)", delay: 1000 },
  { text: "Scanning code for insecure patterns (SQL Injection, Insecure Deserialization)...", delay: 3000 },
  { text: "✅ [PASSED] Project uses 'SQLAlchemy' ORM with parameterized queries, preventing SQL Injection.", delay: 2000 },
  { text: "---", delay: 500 },
  { text: "Generating final security report...", delay: 1000 },
  { text: "✅ [SUCCESS] Scan complete. This is a well-secured repository.", delay: 1000 },
];

function ReadmeGeneratorApp() {
  const [stage, setStage] = useState('overview');
  if (stage === 'overview') {
    return <AgentDemoOverview icon={<FileText size={40} className="agent-overview-icon" />} title="Readme Generator" onStartDemo={() => setStage('demo')}><p>This agent analyzes a repository's structure, dependencies, and code to automatically generate a high-quality `README.md` file.</p><p><strong>Real-world steps:</strong><br />1. Clones the repo.<br />2. Analyzes dependencies (`requirements.txt`).<br />3. Scans source code for main components (`LangGraph` nodes).<br />4. Writes a full Readme with an LLM.</p><p><strong>In the demo:</strong> You'll watch a simulation of the agent analyzing your **'Multi-Agent-Telecom-Optimizer'** repo.</p></AgentDemoOverview>;
  }
  return <AnimatedLogDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={README_SCRIPT} />;
}
function PathfinderApp() {
  const [stage, setStage] = useState('overview');
  if (stage === 'overview') {
    return <AgentDemoOverview icon={<Search size={40} className="agent-overview-icon" />} title="Repo Pathfinder" onStartDemo={() => setStage('demo')}><p>This agent acts as an AI-powered GitHub search. It finds relevant repositories based on a *topic*, not just a name.</p><p><strong>Real-world steps:</strong><br />1. Takes a user's query (e.g., "langgraph marketing").<br />2. Uses an LLM to find the best repos.<br />3. "Reads" each repo's Readme to write a summary.</p><p><strong>In the demo:</strong> You'll watch a simulation of the agent searching for **'langgraph multi-agent marketing'**.</p></AgentDemoOverview>;
  }
  return <AnimatedLogDemo repoUrl="N/A (Topic Search)" script={PATHFINDER_SCRIPT} />;
}
function RepoAnalystApp() {
  const [stage, setStage] = useState('overview');
  if (stage === 'overview') {
    return <AgentDemoOverview icon={<BrainCircuit size={40} className="agent-overview-icon" />} title="AI Code Analyst (RAG)" onStartDemo={() => setStage('demo')}><p>This is a **Retrieval-Augmented Generation (RAG)** agent. It "reads" an entire codebase and lets you chat with it.</p><p><strong>Real-world steps:</strong><br />1. User submits a repo URL.<br />2. Backend clones the repo, splits the code into chunks, and indexes it in a vector database (`ChromaDB`).<br />3. User asks a question.<br />4. The RAG agent finds relevant code chunks and uses an LLM to give a precise answer.</p><p><strong>In the demo:</strong> You'll watch a simulation of a user asking questions about your **'Multi-Agent-Telecom-Optimizer'** repo.</p></AgentDemoOverview>;
  }
  return <AnimatedChatDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={ANALYST_SCRIPT} />;
}
function SecurityAuditorApp() {
  const [stage, setStage] = useState('overview');
  if (stage === 'overview') {
    return <AgentDemoOverview icon={<ShieldCheck size={40} className="text-red-600" />} title="Security Auditor" onStartDemo={() => setStage('demo')}><p>This agent scans a repository for common security vulnerabilities.</p><p><strong>Real-world steps:</strong><br />1. **SAST:** Scans for "hardcoded secrets" (e.g., API keys).<br />2. **SCA:** Checks dependencies for known vulnerabilities (CVEs).<br />3. **LLM Analysis:** Scans for "insecure coding patterns" (e.g., SQL Injection).</p><p><strong>In the demo:</strong> You'll watch a simulation of the agent performing a security scan on your **'Multi-Agent-Telecom-Optimizer'** repo.</p></AgentDemoOverview>;
  }
  return <AnimatedLogDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={SECURITY_SCRIPT} />;
}

// --- 11. Funding Component (Permanent Widget) ---
function FundProjectApp() {
  const patreonSvgIcon = (
    <svg viewBox="0 0 569 546" xmlns="http://www.w3.org/2000/svg" style={{width: '24px', height: '24px', fill: '#f96854'}}>
      <g>
        <circle cx="362.589996" cy="204.589996" r="204.589996"></circle>
        <rect height="545.799988" width="100" x="0" y="0"></rect>
      </g>
    </svg>
  );

  return (
    <div style={{padding: 0, height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="funding-window-terminal">
        <marquee className="funding-window-marquee" direction="left" scrollAmount={4}>
          This is a static demo. The full AI backend requires a cloud GPU grant to run 24/7. Please consider supporting!
        </marquee>
      </div>
      <div className="funding-window-info">
        <h3>Hi, I'm Anvit!</h3>
        <p>
          I'm an AI engineer passionate about building complex, multi-agent systems and RAG pipelines—like the ones you're demoing right now.
        </p>
        <p>
          This entire project was built to showcase what's possible with modern AI. To bring these agents to life for everyone, the backend needs to run on a powerful cloud GPU.
        </p>
        <p>
          If you're inspired by this demo, your support would mean the world! Even a contribution as small as a coffee goes directly toward paying the server bills, helping bring these locally ran agents to the internet for everyone to use.
        </p>
        
        <a 
          href="https://www.patreon.com/anvitvermaa_labs"
          target="_blank" 
          rel="noopener noreferrer"
          className="demo-info-patreon-link"
        >
          {patreonSvgIcon}
          <span>Support on Patreon</span>
        </a>
      </div>
    </div>
  );
}

// --- 12. Full Screen Shutdown Animation ---
function ShutDownAnimation({ onRestart }) {
  const canvasRef = useRef(null);
  const colors = ['#FF00FF', '#00FFFF', '#FFFF00', '#00FF00'];
  const icons = ['🚀', '✨', '⚡️', '👾', '🤖'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const createParticle = () => {
      const size = Math.random() * 20 + 20;
      return {
        x: Math.random() * (canvas.width - size * 2) + size,
        y: Math.random() * (canvas.height - size * 2) + size,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: size,
        text: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    };

    for (let i = 0; i < 10; i++) {
      particles.push(createParticle());
    }

    let animationFrameId;
    let textHue = 0;

    const draw = () => {
      ctx.fillStyle = '#0c0c0c';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x + p.size/2 > canvas.width || p.x - p.size/2 < 0) p.vx *= -1;
        if (p.y + p.size/2 > canvas.height || p.y - p.size/2 < 0) p.vy *= -1;

        ctx.font = `${p.size}px 'Pixelify Sans', sans-serif`;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fillText(p.text, p.x, p.y);
        ctx.shadowBlur = 0;
      });

      textHue = (textHue + 1) % 360;
      const color1 = `hsl(${textHue}, 100%, 70%)`;
      const color2 = `hsl(${(textHue + 120) % 360}, 100%, 70%)`;
      const color3 = `hsl(${(textHue + 240) % 360}, 100%, 70%)`;
      
      ctx.textAlign = 'center';
      
      ctx.font = "bold 48px 'Pixelify Sans', sans-serif";
      ctx.fillStyle = color1;
      ctx.shadowColor = color1;
      ctx.shadowBlur = 15;
      ctx.fillText("Thank you for visiting!", canvas.width / 2, canvas.height / 2 - 40);
      
      ctx.font = "24px 'Pixelify Sans', sans-serif";
      ctx.fillStyle = color2;
      ctx.shadowColor = color2;
      ctx.shadowBlur = 10;
      ctx.fillText("This demo AI backend requires a GPU grant to run 24/7.", canvas.width / 2, canvas.height / 2 + 20);
      
      ctx.font = "20px 'Pixelify Sans', sans-serif";
      ctx.fillStyle = color3;
      ctx.shadowColor = color3;
      ctx.shadowBlur = 10;
      ctx.fillText("(Click anywhere to restart the demo)", canvas.width / 2, canvas.height / 2 + 80);
      
      ctx.shadowBlur = 0;
      animationFrameId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="shutdown-animation-screen" onClick={onRestart}>
      <canvas ref={canvasRef} className="shutdown-animation-canvas" />
    </div>
  );
}

// --- 17. Shut Down Window (Fallback for old reference) ---
function ShutDownWindow() {
  return (
    <div className="info-window-container">
      <div className="info-window-icon"><Power size={48} className="text-red-500" /></div>
      <div className="info-window-content">
        <h2 className="info-window-title">Thank You for Visiting!</h2>
        <p className="info-window-text">This AI backend requires a cloud GPU server to run 24/7. This demo runs locally to showcase the vision.</p>
        <p className="info-window-text">If you'd like to help bring this project to life, please check out the **"Demo Information"** widget.</p>
      </div>
    </div>
  );
}