import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User, FileText, Search, Wifi, Volume2, Clock, Loader2, X, Minus, Square, 
  BrainCircuit, Send, ShieldCheck, Wand2, LogOut,
  DollarSign, Power, Github, Linkedin // <-- NEW ICONS
} from 'lucide-react';

// --- Image & Font Assets (USING LOCAL PATHS) ---
// IMPORTANT: Make sure 'bliss.jpg' is in your 'frontend/public/' folder!
const XP_WALLPAPER_URL = "/bliss.jpg";

// --- 1. Main App (The "OS") ---
// This component now *only* renders the Desktop.
// All boot screen and login logic has been removed.
export default function App() {
  const [user, setUser] = useState({
    displayName: 'Guest',
    avatar: '' // You can put a default avatar URL here
  });

  const handleLogout = () => {
    // This is handled by the StartMenu opening the 'shutdown' window
    console.log("Log Off clicked");
  };
  
  return <Desktop user={user} onLogout={handleLogout} />;
}


// --- 2. Desktop (Page 3) ---
function Desktop({ user, onLogout }) {
  // This is the new master state for all windows
  const [windows, setWindows] = useState({
    readme: { id: 'readme', title: 'Readme Generator', icon: <FileText size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 100, y: 100 }, zIndex: 1, content: <ReadmeGeneratorApp /> },
    pathfinder: { id: 'pathfinder', title: 'Repo Pathfinder', icon: <Search size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 150, y: 150 }, zIndex: 1, content: <PathfinderApp /> },
    analyst: { id: 'analyst', title: 'AI Code Analyst (RAG)', icon: <BrainCircuit size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 200, y: 200 }, zIndex: 1, content: <RepoAnalystApp /> },
    security: { id: 'security', title: 'Security Auditor', icon: <ShieldCheck size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 250, y: 250 }, zIndex: 1, content: <SecurityAuditorApp /> },
    funding: { id: 'funding', title: 'Project Funding', icon: <DollarSign size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 300, y: 300 }, zIndex: 1, content: <FundProjectApp /> },
    // --- THIS IS THE NEW SHUTDOWN WINDOW ---
    shutdown: { id: 'shutdown', title: 'Turn Off Computer', icon: <Power size={16} />, isOpen: false, isMinimized: false, isMaximized: false, pos: { x: 300, y: 200 }, zIndex: 1, content: <ShutDownWindow /> }
  });

  const [startMenuOpen, setStartMenuOpen] = useState(false);
  // This counter ensures the most-clicked window is always on top
  const [zIndexCounter, setZIndexCounter] = useState(10);

  // --- Window Management Functions ---

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
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized }
    }));
    bringToFront(id);
  };

  const handleDrag = (id, newPos) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], pos: newPos }
    }));
  };
  
  const safeUser = user || { displayName: 'Guest', avatar: '' };

  return (
    // We use the new 'desktop' class
    <div className="desktop" style={{ backgroundImage: `url(${XP_WALLPAPER_URL})` }} onClick={() => setStartMenuOpen(false)}>
      {/* We use the new 'desktop-icon-container' class */}
      <div className="desktop-icon-container">
        <DesktopIcon icon={<FileText size={40} />} label="Readme Generator" onDoubleClick={() => openWindow('readme')} />
        <DesktopIcon icon={<Search size={40} />} label="Repo Pathfinder" onDoubleClick={() => openWindow('pathfinder')} />
        <DesktopIcon icon={<BrainCircuit size={40} />} label="AI Code Analyst" onDoubleClick={() => openWindow('analyst')} />
        <DesktopIcon icon={<ShieldCheck size={40} />} label="Security Auditor" onDoubleClick={() => openWindow('security')} />
        <DesktopIcon icon={<DollarSign size={40} />} label="Fund Project" onDoubleClick={() => openWindow('funding')} />
      </div>

      {/* Render all open, non-minimized windows */}
      {Object.values(windows).map(win => (
        win.isOpen && !win.isMinimized && (
          <Window
            key={win.id}
            id={win.id}
            title={win.title}
            // Pass all state and handlers
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
        )
      ))}
      
      {/* THIS IS THE FIX: The 'onLogout' prop now opens the 'shutdown' window */}
      {startMenuOpen && <StartMenu user={safeUser} onLogout={() => openWindow('shutdown')} />}
      
      {/* The Taskbar now receives all window info */}
      <Taskbar 
        windows={windows} 
        onTabClick={bringToFront} // Use bringToFront to restore minimized windows
        onStartClick={() => setStartMenuOpen(s => !s)} 
      />
    </div>
  );
}

// --- 3. Desktop Helper Components ---
// Updated to use new CSS classes
function DesktopIcon({ icon, label, onDoubleClick }) {
  return (
    <div className="desktop-icon" onDoubleClick={onDoubleClick}>
      <div className="desktop-icon-image">{icon}</div>
      <span className="desktop-icon-label">{label}</span>
    </div>
  );
}

// --- 4. NEW Taskbar Component ---
function Taskbar({ onStartClick, windows, onTabClick }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  // Find the window with the highest z-index (the active one)
  const activeWindowId = Object.values(windows).reduce(
    (active, win) => (win.isOpen && !win.isMinimized && win.zIndex > (windows[active]?.zIndex || 0) ? win.id : active),
    null
  );

  return (
    <div className="taskbar">
      <button onClick={(e) => { e.stopPropagation(); onStartClick(); }} className="start-button">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg" className="start-button-icon"><path d="M15.177 11.823C13.882 10.457 12 10.354 12 10.354C12 10.354 11.234 8.657 9.474 8.657C7.714 8.657 6.463 10.354 6.463 10.354C6.463 10.354 4.118 10.457 2.823 11.823C1.402 13.313 0.823 15 0.823 15H17.177C17.177 15 16.598 13.313 15.177 11.823ZM4.01 7.203C4.01 8.214 4.819 9.034 5.819 9.034C6.819 9.034 7.629 8.214 7.629 7.203C7.629 6.192 6.819 5.372 5.819 5.372C4.819 5.372 4.01 6.192 4.01 7.203ZM12.181 9.034C13.181 9.034 13.99 8.214 13.99 7.203C13.99 6.192 13.181 5.372 12.181 5.372C11.181 5.372 10.371 6.192 10.371 7.203C10.371 8.214 11.181 9.034 12.181 9.034ZM10.371 3.518C10.371 4.529 11.181 5.349 12.181 5.349C13.181 5.349 13.99 4.529 13.99 3.518C13.99 2.507 13.181 1.687 12.181 1.687C11.181 1.687 10.371 2.507 10.371 3.518ZM5.819 5.349C6.819 5.349 7.629 4.529 7.629 3.518C7.629 2.507 6.819 1.687 5.819 1.687C4.819 1.687 4.01 2.507 4.01 3.518C4.01 4.529 4.819 5.349 5.819 5.349Z"/></svg>
        <span className="start-button-text">start</span>
      </button>
      
      <div className="taskbar-tabs-container">
        {Object.values(windows).map(win => (
          win.isOpen && (
            <button
              key={win.id}
              onClick={() => onTabClick(win.id)}
              className={`taskbar-tab ${activeWindowId === win.id ? 'active' : ''} ${win.isMinimized ? 'minimized' : ''}`}
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

// --- 5. UPDATED Window Component ---
// This is now a fully draggable, minimizable, and maximizable component.
function Window({ 
  id, title, children, onClose, onMinimize, onMaximize, 
  onFocus, onDrag, pos, zIndex, isMaximized 
}) {
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // Only drag if not maximized
    if (isMaximized) return;

    // Bring to front on any click
    onFocus();
    
    // Calculate offset from top-left corner
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
      // Prevent text selection while dragging
      e.preventDefault(); 
      onDrag(id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Add listeners to the whole document
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onDrag, id]); // Added id to dependencies

  // Apply conditional styles
  // THIS IS THE FIX: Set a default size for the window
  const windowClasses = `window-wrapper ${isMaximized ? 'maximized' : ''}`;
  const windowStyles = {
    top: `${pos.y}px`,
    left: `${pos.x}px`,
    zIndex: zIndex,
    width: '640px', // Default fixed width
    height: '480px', // Default fixed height
  };
  
  // Special size for the small shutdown window
  if (id === 'shutdown') {
    windowStyles.width = '400px';
    windowStyles.height = '220px';
  }

  // Special size for funding window
  if (id === 'funding') {
    windowStyles.width = '500px';
    windowStyles.height = '350px';
  }

  return (
    <div className={windowClasses} style={!isMaximized ? windowStyles : { zIndex: zIndex }}>
      <div 
        className="title-bar" 
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize} // Double-click to maximize
      >
        <span className="title-bar-label">{title}</span>
        <div className="title-bar-buttons">
          {/* Don't show min/max on shutdown or funding window */}
          {id !== 'shutdown' && id !== 'funding' && (
            <>
              <button className="window-button" onClick={onMinimize}><Minus size={16} /></button>
              <button className="window-button" onClick={onMaximize}><Square size={16} /></button>
            </>
          )}
          <button className="window-button close" onClick={onClose}><X size={16} /></button>
        </div>
      </div>
      <div className="w-full flex-grow overflow-y-auto xp-window-body">{children}</div>
    </div>
  );
}

// --- 6. UPDATED Start Menu Component ---
function StartMenu({ user, onLogout }) {
  // THIS IS THE FIX: Added alignment classes and new links
  return (
    <div 
      className="start-menu-container"
      onClick={(e) => e.stopPropagation()} 
    >
      <div className="start-menu-header">
        {user.avatar ? (
          <img src={user.avatar} alt="User Avatar" className="start-menu-avatar" />
        ) : (
          <div className="start-menu-avatar-wrapper">
            <User size={40} className="text-gray-600" />
          </div>
        )}
        <span className="start-menu-user">{user.displayName}</span>
      </div>
      <div className="start-menu-body">
        {/* --- NEW LINKS --- */}
        <a href="https://github.com/anvitvermaa" target="_blank" rel="noopener noreferrer" className="start-menu-link">
          <Github size={32} className="start-menu-link-icon" />
          <span className="start-menu-link-label">My GitHub</span>
        </a>
        <a href="https.www.linkedin.com/in/anvit-verma-b8133228a/" target="_blank" rel="noopener noreferrer" className="start-menu-link">
          <Linkedin size={32} className="start-menu-link-icon" />
          <span className="start-menu-link-label">My LinkedIn</span>
        </a>
        {/* --- END NEW LINKS --- */}
      </div>
      <div className="start-menu-footer">
        {/* THIS IS THE FIX: 'onLogout' is now wired to open the shutdown window */}
        <button onClick={onLogout} className="start-menu-logout">
          <LogOut size={24} />
          Log Off
        </button>
      </div>
    </div>
  );
}

// --- 7. NEW HELPER COMPONENT: Overview Screen ---
// THIS IS THE FIX: Replaced Tailwind with CSS classes
function AgentDemoOverview({ icon, title, children, onStartDemo }) {
  return (
    <div className="agent-overview-container">
      <div className="agent-overview-icon">{icon}</div>
      <h2 className="agent-overview-title">{title}</h2>
      <div className="agent-overview-content">
        {children}
      </div>
      <button
        onClick={onStartDemo}
        className="agent-overview-button xp-outset-border"
      >
        Watch Demo
      </button>
    </div>
  );
}

// --- 8. NEW HELPER COMPONENT: Animated Log Demo ---
// THIS IS THE FIX: Re-styled to be a black terminal
function AnimatedLogDemo({ repoUrl, script }) {
  const [lines, setLines] = useState([`> User request: ${repoUrl}`]);
  const [isComplete, setIsComplete] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  useEffect(() => {
    let currentLine = 0;
    const timeouts = [];
    const processLine = () => {
      if (currentLine >= script.length) {
        setIsComplete(true);
        return;
      }
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
  }, [script, repoUrl]); // Added repoUrl as dependency

  return (
    <div className="terminal-window">
      <div className="terminal-log-output">
        {lines.map((line, index) => (
          <p key={index} className="terminal-log-line">
            <span className="terminal-prompt">{`$`}</span>
            {line}
          </p>
        ))}
        {!isComplete && (
          <div className="flex items-center">
            <span className="terminal-prompt">{`$`}</span>
            <span className="terminal-cursor"></span>
          </div>
        )}
        {isComplete && (
          <p className="terminal-line-complete">$ Demo complete. You can close this window.</p>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

// --- 9. NEW HELPER COMPONENT: Animated Chat Demo ---
// THIS IS THE FIX: Re-styled to be a black terminal
function AnimatedChatDemo({ repoUrl, script }) {
  const [messages, setMessages] = useState([]);
  const [isComplete, setIsComplete] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    let currentMsg = 0;
    const timeouts = [];
    const processMessage = () => {
      if (currentMsg >= script.length) {
        setIsComplete(true);
        return;
      }
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
    <div className="terminal-chat-window">
      <div className="terminal-chat-messages" ref={chatEndRef}>
        {messages.map((msg, index) => (
          <div key={index} className="terminal-chat-message">
            {msg.sender === 'user' ? (
              <p className="terminal-line-user">
                <span className="terminal-prompt">User:</span>
                {msg.text}
              </p>
            ) : (
              <div className="terminal-line-ai">
                <p><span className="terminal-prompt">AI:</span></p>
                {/* Use ReactMarkdown for AI responses to format code blocks */}
                <article className="prose prose-sm prose-tahoma">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        ))}
        {!isComplete && (
          <div className="flex items-center">
            <span className="terminal-prompt text-white">AI:</span>
            <span className="terminal-cursor"></span>
          </div>
        )}
        {isComplete && (
          <p className="terminal-line-complete">$ Demo complete. You can close this window.</p>
        )}
      </div>
      <div className="terminal-chat-input-bar">
        <input type="text" placeholder="Demo in progress... Please watch." className="terminal-chat-input" disabled={true} />
        <button type="submit" disabled={true} className="terminal-chat-button">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}


// --- 10. Readme Generator App (UPDATED SCRIPT) ---
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

function ReadmeGeneratorApp() {
  const [stage, setStage] = useState('overview');

  if (stage === 'overview') {
    return (
      <AgentDemoOverview
        icon={<FileText size={40} className="agent-overview-icon" />}
        title="Readme Generator"
        onStartDemo={() => setStage('demo')}
      >
        <p>This agent analyzes a repository's structure, dependencies, and code to automatically generate a high-quality `README.md` file.</p>
        <p><strong>Real-world steps:</strong><br />1. Clones the repo.<br />2. Analyzes dependencies (`requirements.txt`).<br />3. Scans source code for main components (`LangGraph` nodes).<br />4. Writes a full Readme with an LLM.</p>
        <p><strong>In the demo:</strong> You'll watch a simulation of the agent analyzing your **'Multi-Agent-Telecom-Optimizer'** repo.</p>
      </AgentDemoOverview>
    );
  }

  return <AnimatedLogDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={README_SCRIPT} />;
}

// --- 11. Repo Pathfinder App (UPDATED SCRIPT) ---
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

function PathfinderApp() {
  const [stage, setStage] = useState('overview');

  if (stage === 'overview') {
    return (
      <AgentDemoOverview
        icon={<Search size={40} className="agent-overview-icon" />}
        title="Repo Pathfinder"
        onStartDemo={() => setStage('demo')}
      >
        <p>This agent acts as an AI-powered GitHub search. It finds relevant repositories based on a *topic*, not just a name.</p>
        <p><strong>Real-world steps:</strong><br />1. Takes a user's query (e.g., "langgraph marketing").<br />2. Uses an LLM to find the best repos.<br />3. "Reads" each repo's Readme to write a summary.</p>
        <p><strong>In the demo:</strong> You'll watch a simulation of the agent searching for **'langgraph multi-agent marketing'**.</p>
      </AgentDemoOverview>
    );
  }

  return <AnimatedLogDemo repoUrl="N/A (Topic Search)" script={PATHFINDER_SCRIPT} />;
}


// --- 12. AI Code Analyst App (PERFECT - NO CHANGE) ---
const ANALYST_SCRIPT = [
  { sender: 'user', text: 'How does this project ensure marketing message quality?', delay: 2000 },
  { sender: 'ai', text: "It uses a stateful **LangGraph** workflow with a 'Supervisor-Review' loop. A 'Creative' agent generates the message, and a 'Supervisor' LLM (LLaMA3) reviews it for clarity and tone. If the score is below a set threshold, it's sent back to the creative agent for auto-regeneration.", delay: 4000 },
  { sender: 'user', text: 'Where does the customer data come from for personalization?', delay: 2000 },
  { sender: 'ai', text: "The system pulls customer features (like their current plan, monthly usage, and churn risk score) from a **MySQL** database. This data is combined with web-scraped promotional info using RAG to ground the agent's response, ensuring the message is both relevant and personalized.", delay: 4000 },
  { sender: 'user', text: 'How is this all evaluated?', delay: 1500 },
  { sender: 'ai', text: "The entire graph is integrated with **MLflow**. It auto-logs the prompts, the supervisor's scores, retrieval quality, and the final generated message. This allows for continuous monitoring and auditing of the agent's performance.", delay: 3000 },
];

function RepoAnalystApp() {
  const [stage, setStage] = useState('overview');

  if (stage === 'overview') {
    return (
      <AgentDemoOverview
        icon={<BrainCircuit size={40} className="agent-overview-icon" />}
        title="AI Code Analyst (RAG)"
        onStartDemo={() => setStage('demo')}
      >
        <p>This is a **Retrieval-Augmented Generation (RAG)** agent. It "reads" an entire codebase and lets you chat with it.</p>
        <p><strong>Real-world steps:</strong><br />1. User submits a repo URL.<br />2. Backend clones the repo, splits the code into chunks, and indexes it in a vector database (`ChromaDB`).<br />3. User asks a question.<br />4. The RAG agent finds relevant code chunks and uses an LLM to give a precise answer.</p>
        <p><strong>In the demo:</strong> You'll watch a simulation of a user asking questions about your **'Multi-Agent-Telecom-Optimizer'** repo.</p>
      </AgentDemoOverview>
    );
  }
  
  return <AnimatedChatDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={ANALYST_SCRIPT} />;
}

// --- 13. Security Auditor App (UPDATED SCRIPT) ---
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

function SecurityAuditorApp() {
  const [stage, setStage] = useState('overview');

  if (stage === 'overview') {
    return (
      <AgentDemoOverview
        icon={<ShieldCheck size={40} className="text-red-600" />}
        title="Security Auditor"
        onStartDemo={() => setStage('demo')}
      >
        <p>This agent scans a repository for common security vulnerabilities.</p>
        <p><strong>Real-world steps:</strong><br />1. **SAST:** Scans for "hardcoded secrets" (e.g., API keys).<br />2. **SCA:** Checks dependencies for known vulnerabilities (CVEs).<br />3. **LLM Analysis:** Scans for "insecure coding patterns" (e.g., SQL Injection).</p>
        <p><strong>In the demo:</strong> You'll watch a simulation of the agent performing a security scan on your **'Multi-Agent-Telecom-Optimizer'** repo.</p>
      </AgentDemoOverview>
    );
  }

  return <AnimatedLogDemo repoUrl="github.com/anvitvermaa/Multi-Agent-Telecom-Optimizer" script={SECURITY_SCRIPT} />;
}

// --- 14. THE REFACTOR MODAL ---
// (This is no longer used in the main flow, but we leave it)
const MOCK_REFACTOR_RESPONSE = `
// --- REFACTORED DEMO CODE ---
// The AI has added 'try...catch' blocks for error handling as requested.
try {
  const response = await axios.post(
    \`\${AI_API_URL}/analyst/refactor\`, 
    { original_code: originalCode, refactor_prompt: prompt },
    { withCredentials: true } 
  );
  setRefactoredCode(response.data.refactored_code);
} catch (err) {
  // This is the new error handling:
  console.error("Refactor failed:", err);
  setError(err.response?.data?.detail || 'An unknown error occurred.');
}
`;

function RefactorModal({ originalCode, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refactoredCode, setRefactoredCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt) {
      setError("Please enter a refactor instruction to demo.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRefactoredCode('');

    // --- MOCK API CALL ---
    console.log("PORTFOLIO MODE: Simulating AI refactor...");
    setTimeout(() => {
      setIsLoading(false);
      setRefactoredCode(MOCK_REFACTOR_RESPONSE);
    }, 3000); // Simulate a 3-second refactor
  };
 
  return (
    <div className="absolute inset-0 bg-black/30 z-[100] flex items-center justify-center p-12">
      <Window
        id="refactor"
        title="AI Refactor Tool"
        onClose={onClose}
        isDraggable={false} 
        style={{ width: 900, height: 600, resize: 'none' }} 
        pos={{ top: '15%', left: '15%' }} 
      >
        <div className="p-2 h-full flex flex-col">
          <form onSubmit={handleSubmit} className="flex gap-2 p-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Your instruction (e.g., 'Add error handling')"
              className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1 bg-green-600 text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div className="flex items-center gap-1"><Wand2 size={16} /> Refactor</div>
              )}
            </button>
          </form>

          <div className="mt-2 p-2 border-t border-gray-400/50 flex-grow h-0">
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><span className="font-bold">Error:</span> {error}</div>}
           
            <div className="h-full w-full grid grid-cols-2 gap-2 overflow-auto bg-white xp-inset-border">
              <div className="h-full overflow-auto">
                <h3 className="text-lg font-bold p-2 text-black">Original Code</h3>
                <textarea
                  readOnly
                  value={originalCode}
                  className="w-full h-full p-2 text-sm text-black bg-gray-100 font-mono resize-none border-none"
                />
              </div>
              <div className="h-full overflow-auto">
                <h3 className="text-lg font-bold p-2 text-black">Refactored Code</h3>
                {isLoading && !refactoredCode && (
                  <div className="flex items-center justify-center h-full text-gray-700">
                    <Loader2 size={30} className="animate-spin text-blue-600" />
                  </div>
                )}
                <textarea
                  readOnly
                  value={refactoredCode || "Waiting for refactor..."}
                  className="w-full h-full p-2 text-sm text-black bg-gray-100 font-mono resize-none border-none"
                />
              </div>
            </div>
          </div>
        </div>
      </Window>
    </div>
  );
}


// --- 15. UPDATED FUNDING COMPONENT ---
// This now has the new text and styles
function FundProjectApp() {
  return (
    <div className="funding-window-container">
      <DollarSign size={40} className="funding-window-icon text-green-600" />
      <h2 className="funding-window-title">Support This Project</h2>
      <p className="funding-window-text">
        This is a passion project built to demonstrate the power of AI agents.
        To bring these agents to life for everyone, the backend requires a cloud GPU server to run 24/7.
      </p>
      <p className="funding-window-text">
        If you're inspired by this demo, please consider contributing. 
        Your support helps cover server costs and fuels future development. Thank you!
      </p>
      
      <div className="funding-button-container">
        <a 
          href="https.www.patreon.com" // <-- TODO: Change this to your Patreon link
          target="_blank" 
          rel="noopener noreferrer"
          className="funding-window-button funding-button-patreon xp-outset-border"
        >
          Support on Patreon
        </a>
        <a 
          href="https.www.github.com/sponsors" // <-- TODO: Change this to your GitHub Sponsors link
          target="_blank" 
          rel="noopener noreferrer"
          className="funding-window-button funding-button-github xp-outset-border"
        >
          Sponsor on GitHub
        </a>
        <p className="text-sm text-gray-500">
          (You can also reach out about GPU grants)
        </p>
      </div>
    </div>
  );
}

// --- 16. NEW "SHUT DOWN" COMPONENT ---
// This is the new window that opens when you click "Log Off"
// It uses the new styles for alignment
function ShutDownWindow() {
  return (
    <div className="shutdown-window-container">
      <Power size={40} className="shutdown-window-icon text-red-500" />
      <h2 className="shutdown-window-title">Thank You for Visiting!</h2>
      <p className="shutdown-window-text">
        This demo is running as a static site. The full AI backend requires a cloud GPU server to run 24/7, which is expensive.
      </p>
      <p className="shutdown-window-text">
        If you'd like to help bring this project to life, please check out the **"Fund Project"** icon on the desktop.
      </p>
      <p className="text-sm text-gray-500">
        (You can close this window to return to the desktop)
      </p>
    </div>
  );
}