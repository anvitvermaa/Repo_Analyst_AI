import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// We have REMOVED Draggable
import ReactMarkdown from 'react-markdown';
// We have REMOVED ReactDiffViewer
import { 
  User, FileText, Search, Wifi, Volume2, Clock, Loader2, X, Minus, Square, 
  Flower, Dog, Smile, PersonStanding, BrainCircuit, Send, ShieldCheck, Wand2, LogOut
} from 'lucide-react';

// --- API Config ---
const AI_API_URL = 'http://127.0.0.1:8000/api/v1'; 
const AUTH_API_URL = 'http://127.0.0.1:5000/api'; 

// --- Image & Font Assets (USING LOCAL PATHS) ---
const XP_WALLPAPER_URL = "/bliss.jpg";
const XP_BOOT_LOGO_URL = "/xp_boot_logo.png";
const XP_MS_LOGO_URL = "/ms_logo.png";

// --- 1. Main App (The "OS") ---
export default function App() {
  const [authStatus, setAuthStatus] = useState('loading'); 
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${AUTH_API_URL}/auth/me`, {
          withCredentials: true,
        });
        if (data && data.id) {
          setUser(data);
          setAuthStatus('auth');
        } else {
          setAuthStatus('no-auth');
        }
      } catch (err) {
        console.log("Not authenticated");
        setAuthStatus('no-auth');
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    window.location.href = `${AUTH_API_URL}/auth/login/google`;
  };

  const handleLogout = () => {
    window.location.href = `${AUTH_API_URL}/auth/logout`;
  };

  if (authStatus === 'loading') {
    return <BootScreen />;
  }

  if (authStatus === 'no-auth') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (authStatus === 'auth') {
    return <Desktop user={user} onLogout={handleLogout} />;
  }
}

// --- 2. Boot Screen (Page 1) ---
function BootScreen() {
  return (
    <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white font-sans">
      <img src={XP_MS_LOGO_URL} alt="Microsoft" className="h-16" />
      <img src={XP_BOOT_LOGO_URL} alt="Windows XP" className="w-96" />
      <div className="h-12"> {/* Spacer */} </div>
      <div className="xp-loading-bar">
        <div className="xp-loading-bar-inner"></div>
      </div>
      <p className="text-gray-400 text-xs absolute bottom-10">Copyright © Microsoft Corporation</p>
    </div>
  );
}

// --- 3. Login Screen (Page 2) ---
function LoginScreen({ onLogin }) {
  const xpBlue = "linear-gradient(to bottom, #004e94, #00418c 18%, #00418c 82%, #002d6b 100%)";
  return (
    <div className="h-screen w-screen flex flex-col" style={{ background: xpBlue, fontFamily: "'Trebuchet MS', sans-serif" }}>
      <div className="flex justify-between items-center p-6">
        <h1 className="text-white text-5xl drop-shadow-lg">welcome</h1>
        <svg width="60" height="60" viewBox="0 0 100 100">
          <rect width="48" height="48" fill="#F35622"/><rect x="52" width="48" height="48" fill="#80C342"/>
          <rect y="52" width="48" height="48" fill="#00ADEF"/><rect x="52" y="52" width="48" height="48" fill="#FFC211"/>
        </svg>
      </div>
      <p className="text-white text-xl ml-6 -mt-4 drop-shadow-md">Click on your user name to begin</p>
      <div className="flex-grow flex items-center justify-center">
        <div className="w-[800px] h-[300px] bg-white/20 border-t border-white/50 border-b border-black/30 backdrop-blur-sm overflow-x-auto flex items-center p-4 gap-6">
          <LoginIcon icon={<img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-12 h-12" />} label="Sign in with Google" onLogin={onLogin} />
          <LoginIcon icon={<Flower size={50} />} label="Jennifer" onLogin={() => {}} />
          <LoginIcon icon={<Dog size={50} />} label="Billy Bob" onLogin={() => {}} />
          <LoginIcon icon={<Smile size={50} />} label="Connor" onLogin={() => {}} />
        </div>
      </div>
      <div className="h-16 bg-gradient-to-t from-black/30 to-transparent border-t border-white/50 flex items-center justify-between px-6">
        <button className="text-white text-2xl drop-shadow-md">Turn off computer</button>
        <p className="text-white text-xs w-1/3 text-right">To add or change accounts, go to Control Panel.</p>
      </div>
    </div>
  );
}

function LoginIcon({ icon, label, onLogin }) {
  return (
    <div onClick={onLogin} className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-black/20 text-white min-w-[200px]">
      <div className="w-20 h-20 bg-white/90 rounded-md flex items-center justify-center text-blue-600 shadow-lg">{icon}</div>
      <span className="text-2xl font-light drop-shadow-md">{label}</span>
    </div>
  );
}

// --- 4. Desktop (Page 3) ---
function Desktop({ user, onLogout }) {
  const [readmeWindowOpen, setReadmeWindowOpen] = useState(false);
  const [pathfinderWindowOpen, setPathfinderWindowOpen] = useState(false);
  const [analystWindowOpen, setAnalystWindowOpen] = useState(false);
  const [securityWindowOpen, setSecurityWindowOpen] = useState(false);
  const [startMenuOpen, setStartMenuOpen] = useState(false);

  // We set default positions for the non-draggable windows
  const windowPositions = {
    readme: { top: '10%', left: '10%' },
    pathfinder: { top: '15%', left: '15%' },
    analyst: { top: '20%', left: '20%' },
    security: { top: '25%', left: '25%' },
  };

  const safeUser = user || { displayName: 'Guest', avatar: '' };

  return (
    <div className="h-screen w-screen bg-cover bg-center" style={{ backgroundImage: `url(${XP_WALLPAPER_URL})` }} onClick={() => setStartMenuOpen(false)}>
      <div className="absolute top-8 left-8 flex flex-col gap-6">
        <DesktopIcon icon={<FileText size={40} />} label="Readme Generator" onDoubleClick={() => setReadmeWindowOpen(true)} />
        <DesktopIcon icon={<Search size={40} />} label="Repo Pathfinder" onDoubleClick={() => setPathfinderWindowOpen(true)} />
        <DesktopIcon icon={<BrainCircuit size={40} />} label="AI Code Analyst" onDoubleClick={() => setAnalystWindowOpen(true)} />
        <DesktopIcon icon={<ShieldCheck size={40} />} label="Security Auditor" onDoubleClick={() => setSecurityWindowOpen(true)} />
      </div>

      {readmeWindowOpen && <Window title="Readme Generator" onClose={() => setReadmeWindowOpen(false)} pos={windowPositions.readme}><ReadmeGeneratorApp /></Window>}
      {pathfinderWindowOpen && <Window title="Repo Pathfinder" onClose={() => setPathfinderWindowOpen(false)} pos={windowPositions.pathfinder}><PathfinderApp /></Window>}
      {analystWindowOpen && <Window title="AI Code Analyst (Powered by RAG)" onClose={() => setAnalystWindowOpen(false)} pos={windowPositions.analyst}><RepoAnalystApp /></Window>}
      {securityWindowOpen && <Window title="Security Auditor" onClose={() => setSecurityWindowOpen(false)} pos={windowPositions.security}><SecurityAuditorApp /></Window>}
      {startMenuOpen && <StartMenu user={safeUser} onLogout={onLogout} />}
      
      <Taskbar onStartClick={() => setStartMenuOpen(s => !s)} />
    </div>
  );
}

// --- 5. Desktop Helper Components ---
function DesktopIcon({ icon, label, onDoubleClick }) {
  return (
    <div className="flex flex-col items-center w-24 text-center cursor-pointer p-2 rounded" onDoubleClick={onDoubleClick}>
      <div className="text-white drop-shadow-lg">{icon}</div>
      <span className="text-white text-sm mt-1 shadow-black [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]">{label}</span>
    </div>
  );
}

function Taskbar({ onStartClick }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000 * 30);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-b from-[#245edb] to-[#2d83f2] border-t border-[#4c90f4] flex items-center justify-between px-2 shadow-lg z-50">
      <button onClick={(e) => { e.stopPropagation(); onStartClick(); }} className="h-[30px] px-3 bg-gradient-to-b from-[#58c823] to-[#3a9e04] rounded-lg shadow-md border-t border-white/50 border-l border-white/50 border-b border-black/30 border-r border-black/30 text-white font-bold text-lg italic flex items-center gap-2 hover:brightness-110 active:brightness-95">
        <svg width="24" height="24" viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm"><path d="M15.177 11.823C13.882 10.457 12 10.354 12 10.354C12 10.354 11.234 8.657 9.474 8.657C7.714 8.657 6.463 10.354 6.463 10.354C6.463 10.354 4.118 10.457 2.823 11.823C1.402 13.313 0.823 15 0.823 15H17.177C17.177 15 16.598 13.313 15.177 11.823ZM4.01 7.203C4.01 8.214 4.819 9.034 5.819 9.034C6.819 9.034 7.629 8.214 7.629 7.203C7.629 6.192 6.819 5.372 5.819 5.372C4.819 5.372 4.01 6.192 4.01 7.203ZM12.181 9.034C13.181 9.034 13.99 8.214 13.99 7.203C13.99 6.192 13.181 5.372 12.181 5.372C11.181 5.372 10.371 6.192 10.371 7.203C10.371 8.214 11.181 9.034 12.181 9.034ZM10.371 3.518C10.371 4.529 11.181 5.349 12.181 5.349C13.181 5.349 13.99 4.529 13.99 3.518C13.99 2.507 13.181 1.687 12.181 1.687C11.181 1.687 10.371 2.507 10.371 3.518ZM5.819 5.349C6.819 5.349 7.629 4.529 7.629 3.518C7.629 2.507 6.819 1.687 5.819 1.687C4.819 1.687 4.01 2.507 4.01 3.518C4.01 4.529 4.819 5.349 5.819 5.349Z"/></svg>
        <span className="drop-shadow-sm">start</span>
      </button>
      <div className="h-[30px] bg-blue-300/40 border border-white/30 rounded-md px-2 flex items-center gap-2 text-white text-xs shadow-md">
        <Wifi size={16} /><Volume2 size={16} /><Clock size={16} />
        <span className="drop-shadow-sm">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
}

// --- 6. Draggable Window Component (SIMPLIFIED) ---
// We have removed Draggable and nodeRef.
function Window({ title, children, onClose, style = {}, pos }) {
  const windowStyles = {
    width: style.width || 640,
    height: style.height || 480,
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    borderTop: '1px solid #c0c0c0',
    borderLeft: '1px solid #c0c0c0',
    borderRight: '1px solid #404040',
    borderBottom: '1px solid #404040',
    borderRadius: '8px 8px 0 0',
    overflow: 'hidden',
    resize: style.resize || 'both',
    minWidth: '300px',
    minHeight: '200px',
    position: 'absolute', // Now using absolute positioning
    top: pos.y,
    left: pos.x,
  };

  return (
    // We removed the Draggable wrapper
    <div className="flex flex-col" style={windowStyles}> 
      {/* Title Bar (REMOVED CURSOR-MOVE) */}
      <div className="title-bar h-8 bg-gradient-to-b from-[#0058d0] to-[#2c81f0] flex items-center justify-between px-2 border-b border-black/50">
        <span className="text-white font-bold text-sm drop-shadow-sm">{title}</span>
        <div className="flex gap-1">
          <WindowButton><Minus size={16} /></WindowButton>
          <WindowButton><Square size={16} /></WindowButton>
          <WindowButton onClick={onClose} isClose={true}><X size={16} /></WindowButton>
        </div>
      </div>
      <div className="w-full flex-grow overflow-y-auto xp-window-body">{children}</div>
    </div>
  );
}

function WindowButton({ children, onClick, isClose = false }) {
  const S_CLASS = isClose ? "bg-red-500 hover:bg-red-400 active:bg-red-600" : "bg-blue-600 hover:bg-blue-500 active:bg-blue-700";
  return (
    <button onClick={onClick} className={`w-6 h-6 border-t border-white/70 border-l border-white/70 border-b border-black/30 border-r border-black/30 rounded-sm shadow-md text-white font-bold flex items-center justify-center text-xs ${S_CLASS}`}>
      {children}
    </button>
  );
}

// --- 7. NEW Start Menu Component ---
function StartMenu({ user, onLogout }) {
  return (
    <div 
      className="absolute bottom-[40px] left-0 w-96 h-[500px] bg-[#2d83f2] border border-black/50 shadow-2xl rounded-tr-lg flex flex-col z-[100]"
      onClick={(e) => e.stopPropagation()} 
    >
      <div className="h-20 bg-gradient-to-b from-[#0058d0] to-[#2c81f0] flex items-center p-4 gap-3">
        {user.avatar ? (
          <img src={user.avatar} alt="User Avatar" className="w-14 h-14 rounded-md border-2 border-white/50" />
        ) : (
          <div className="w-14 h-14 rounded-md border-2 border-white/50 bg-gray-200 flex items-center justify-center">
            <User size={40} className="text-gray-600" />
          </div>
        )}
        <span className="text-white text-2xl font-bold drop-shadow-md">{user.displayName}</span>
      </div>
      <div className="flex-grow bg-white p-2">
        <p className="text-gray-700 p-2">My Jobs (Coming Soon...)</p>
      </div>
      <div className="h-12 bg-gradient-to-b from-[#245edb] to-[#2d83f2] border-t border-[#4c90f4] flex items-center justify-end px-4 gap-4">
        <button onClick={onLogout} className="flex items-center gap-2 text-white text-lg drop-shadow-sm hover:opacity-80">
          <LogOut size={24} />
          Log Off
        </button>
      </div>
    </div>
  );
}

// --- 8. The Readme Generator App ---
function ReadmeGeneratorApp() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null); 
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null); setJobId(null);
    try {
      const response = await axios.post(
        `${AI_API_URL}/readme/generate`, 
        { repo_url: url },
        { withCredentials: true } 
      );
      setJobId(response.data.job_id); 
    } catch (err) { console.error(err); setError(err.response?.data?.detail || 'An unknown error occurred.'); }
    setIsLoading(false);
  };
  return (
    <div className="p-2 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 p-2">
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter public GitHub repo URL..." className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border"/>
        <button type="submit" disabled={isLoading} className="px-4 py-1 bg-[#245edb] text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Generate'}
        </button>
      </form>
      <div className="mt-2 p-2 border-t border-gray-400/50 flex-grow h-0">
        {isLoading && <div className="flex flex-col items-center justify-center h-full text-gray-700"><Loader2 size={30} className="animate-spin text-blue-600" /><p className="mt-2">Submitting job to queue...</p></div>}
        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><span className="font-bold">Error:</span> {error}</div>}
        {jobId && <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><span className="font-bold">Success!</span> Job queued with ID:<br /><code className="text-xs">{jobId}</code><p className="mt-2">The agent is now working in the background.</p></div>}
      </div>
    </div>
  );
}

// --- 9. The Repo Pathfinder App ---
function PathfinderApp() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportContent, setReportContent] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null); setReportContent('');
    try {
      const response = await axios.post(
        `${AI_API_URL}/pathfinder/find`, 
        { query: query },
        { withCredentials: true }
      );
      setReportContent(response.data.report);
    } catch (err) { console.error(err); setError(err.response?.data?.detail || 'An unknown error occurred.'); }
    setIsLoading(false);
  };
  return (
    <div className="p-2 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 p-2">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Enter a topic (e.g., react data grid)..." className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border"/>
        <button type="submit" disabled={isLoading} className="px-4 py-1 bg-[#245edb] text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Search'}
        </button>
      </form>
      <div className="mt-2 p-2 border-t border-gray-400/50 flex-grow h-0">
        {isLoading && <div className="flex flex-col items-center justify-center h-full text-gray-700"><Loader2 size={30} className="animate-spin text-blue-600" /><p className="mt-2">Agent is searching...</p></div>}
        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><span className="font-bold">Error:</span> {error}</div>}
        {reportContent && <div className="p-3 h-full overflow-auto bg-white xp-inset-border"><article className="markdown-body text-black"><ReactMarkdown>{reportContent}</ReactMarkdown></article></div>}
      </div>
    </div>
  );
}


// --- 10. The AI Code Analyst App (with Refactor) ---
function RepoAnalystApp() {
  const [stage, setStage] = useState('input');
  const [repoUrl, setRepoUrl] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const chatLogRef = useRef(null);
  const [refactorModalOpen, setRefactorModalOpen] = useState(false);
  const [codeToRefactor, setCodeToRefactor] = useState('');

  useEffect(() => { if (chatLogRef.current) { chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight; } }, [messages]);

  const handleStartSession = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null);
    try {
      const response = await axios.post(
        `${AI_API_URL}/analyst/start-session`,
        { repo_url: repoUrl },
        { withCredentials: true }
      );
      setSessionId(response.data.session_id);
      setMessages([{ sender: 'ai', text: `Successfully loaded and indexed '${repoUrl}'. You can ask me questions about the code now.` }]);
      setStage('chat');
    } catch (err) { console.error(err); setError(err.response?.data?.detail || 'An unknown error occurred.'); }
    setIsLoading(false);
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault(); if (!question.trim()) return;
    const userMessage = { sender: 'user', text: question };
    setMessages(prev => [...prev, userMessage, { sender: 'ai', text: '' }]);
    const currentQuestion = question;
    setQuestion('');
    setIsLoading(true);
    try {
      const response = await fetch(`${AI_API_URL}/analyst/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question: currentQuestion }),
      });
      if (!response.ok) { const errText = await response.text(); throw new Error(errText || 'Failed to fetch'); }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          lastMsg.text += chunk;
          return [...prev.slice(0, -1), lastMsg];
        });
      }
    } catch (err) {
      console.error(err);
      const errorText = err.message.includes("detail") ? JSON.parse(err.message).detail : err.message;
      setMessages(prev => {
        const lastMsg = prev[prev.length - 1];
        lastMsg.text = `Error: ${errorText || 'Failed to get response.'}`;
        return [...prev.slice(0, -1), lastMsg];
      });
    }
    setIsLoading(false);
  };

  const handleOpenRefactor = (codeString) => {
    setCodeToRefactor(codeString);
    setRefactorModalOpen(true);
  };

  if (stage === 'input') {
    return (
      <div className="p-4 h-full flex flex-col items-center justify-center text-center">
        <BrainCircuit size={40} className="text-blue-600 mb-4" />
        <h2 className="text-lg font-bold mb-2">Load a Repository</h2>
        <p className="text-sm text-gray-600 mb-4">Enter a public GitHub URL to load it into the agent's memory. This may take several minutes.</p>
        <form onSubmit={handleStartSession} className="w-full flex gap-2">
          <input type="text" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} placeholder="https://github.com/user/repo" className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border"/>
          <button type="submit" disabled={isLoading} className="px-4 py-1 bg-[#245edb] text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400">
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Load'}
          </button>
        </form>
        {error && <div className="mt-4 p-3 w-full bg-red-100 border border-red-400 text-red-700 rounded-md text-left"><span className="font-bold">Error:</span> {error}</div>}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {refactorModalOpen && (
        <RefactorModal 
          originalCode={codeToRefactor}
          onClose={() => setRefactorModalOpen(false)}
        />
      )}
      <div ref={chatLogRef} className="flex-grow h-0 overflow-y-auto p-4 bg-white xp-inset-border">
        <div className="flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                <ReactMarkdown
                  components={{
                    code({node, inline, className, children, ...props}) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      return !inline && match ? (
                        <div className="relative my-2">
                          <pre className="p-3 bg-gray-800 text-white rounded-md overflow-x-auto" {...props}>
                            <code>{children}</code>
                          </pre>
                          <button onClick={() => handleOpenRefactor(codeString)} className="absolute top-2 right-2 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-500">
                            <Wand2 size={14} />
                          </button>
                        </div>
                      ) : ( <code className={className} {...props}>{children}</code> )
                    }
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length - 1].sender === 'user' && (
            <div className="flex justify-start"><div className="max-w-[80%] p-3 rounded-lg bg-gray-200 text-black"><Loader2 size={20} className="animate-spin" /></div></div>
          )}
        </div>
      </div>
      <form onSubmit={handleSubmitQuestion} className="flex gap-2 p-2 border-t border-gray-400/50">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question about the code..." className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border" disabled={isLoading} />
        <button type="submit" disabled={isLoading} className="px-4 py-1 bg-[#245edb] text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400">
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}

// --- 11. The Security Auditor App ---
function SecurityAuditorApp() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobId, setJobId] = useState(null); 
  const handleSubmit = async (e) => {
    e.preventDefault(); setIsLoading(true); setError(null); setJobId(null);
    try {
      const response = await axios.post(
        `${AI_API_URL}/security/scan`, 
        { repo_url: url },
        { withCredentials: true }
      );
      setJobId(response.data.job_id); 
    } catch (err) { console.error(err); setError(err.response?.data?.detail || 'An unknown error occurred.'); }
    setIsLoading(false);
  };
  return (
    <div className="p-2 h-full flex flex-col">
      <form onSubmit={handleSubmit} className="flex gap-2 p-2">
        <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Enter public GitHub repo URL..." className="flex-grow p-2 border border-gray-400 rounded-sm focus:outline-blue-500 xp-inset-border"/>
        <button type="submit" disabled={isLoading} className="px-4 py-1 bg-[#245edb] text-white rounded-sm xp-outset-border hover:brightness-110 active:brightness-95 disabled:bg-gray-400">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Scan'}
        </button>
      </form>
      <div className="mt-2 p-2 border-t border-gray-400/50 flex-grow h-0">
        {isLoading && <div className="flex flex-col items-center justify-center h-full text-gray-700"><Loader2 size={30} className="animate-spin text-red-600" /><p className="mt-2">Submitting job to queue...</p></div>}
        {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><span className="font-bold">Error:</span> {error}</div>}
        {jobId && <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md"><span className="font-bold">Success!</span> Job queued with ID:<br /><code className="text-xs">{jobId}</code><p className="mt-2">The agent is now working in the background.</p></div>}
      </div>
    </div>
  );
}

// --- 12. THE REFACTOR MODAL (SIMPLIFIED, NO DIFF) ---
function RefactorModal({ originalCode, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refactoredCode, setRefactoredCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setRefactoredCode('');

    try {
      const response = await axios.post(
        `${AI_API_URL}/analyst/refactor`, 
        { original_code: originalCode, refactor_prompt: prompt },
        { withCredentials: true } 
      );
      setRefactoredCode(response.data.refactored_code);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'An unknown error occurred.');
    }
    setIsLoading(false);
  };
  
  return (
    // This is the full-screen overlay
    <div className="absolute inset-0 bg-black/30 z-[100] flex items-center justify-center p-12">
      <Window
        title="AI Refactor Tool"
        onClose={onClose}
        isDraggable={false} // Windows are no longer draggable
        style={{ width: 900, height: 600, resize: 'none' }} 
        pos={{ top: '15%', left: '15%' }} // Center it
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

          {/* Content Area */}
          <div className="mt-2 p-2 border-t border-gray-400/50 flex-grow h-0">
            {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md"><span className="font-bold">Error:</span> {error}</div>}
            
            <div className="h-full w-full grid grid-cols-2 gap-2 overflow-auto bg-white xp-inset-border">
              {/* Original Code */}
              <div className="h-full overflow-auto">
                <h3 className="text-lg font-bold p-2 text-black">Original Code</h3>
                <textarea
                  readOnly
                  value={originalCode}
                  className="w-full h-full p-2 text-sm text-black bg-gray-100 font-mono resize-none border-none"
                />
              </div>

              {/* Refactored Code */}
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