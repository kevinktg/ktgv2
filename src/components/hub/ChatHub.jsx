"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, Terminal, Sparkles, LineChart, Globe, Settings, 
  Send, User, Cpu, Zap, Shield, Search, Plus, X, 
  MessageSquare, Layers, Activity, Code, Database,
  BrainCircuit, Lightbulb,
  Ghost, Flame, Star, Heart, Music, Camera, Coffee,
  Briefcase, Rocket, Gamepad, Anchor, Atom, Award,
  Book, Cat, Dog, Feather, Moon, Sun, Umbrella,
  Paperclip, Cloud, Library, FileDown, Share2, Wrench, Network, Link as LinkIcon, Newspaper, Command, PenTool,  
  PanelRight, FileText, List, Trash2, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- UI Components ---
const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-none text-sm font-bold lowercase font-syne ring-offset-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
        variant === 'default' ? "bg-[#00f0ff] text-black hover:bg-[#00f0ff]/80" : "",
        variant === 'outline' ? "border border-zinc-800 bg-black hover:bg-zinc-900 hover:text-white" : "",    
        size === 'default' ? "h-10 px-4 py-2" : "",
        size === 'sm' ? "h-9 px-3" : "",
        className
      )}
      {...props}
    />
  )
})
Button.displayName = "Button"

const Switch = ({ checked, onCheckedChange, id }) => ( 
  <button
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-none border border-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-[#00f0ff]" : "bg-zinc-900"
    )}
  >
    <span
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-none bg-black shadow-none ring-0 transition-transform",      
        checked ? "translate-x-4" : "translate-x-0"
      )}
    />
  </button>
)

// --- Data Models ---
const PERSONAS = [
  { id: 'default', name: 'Helpful Assistant', icon: Bot, color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10', prompt: 'You are a helpful, respectful, and honest assistant.' },
  { id: 'coder', name: '10x Developer', icon: Terminal, color: 'text-white', bg: 'bg-white/10', prompt: 'You are an elite software engineer. Provide concise, highly optimized code. Skip pleasantries.' },
  { id: 'creative', name: 'Creative Muse', icon: Sparkles, color: 'text-zinc-300', bg: 'bg-zinc-300/10', prompt: 'You are a creative muse. Think outside the box, use vivid imagery, and inspire the user.' },
  { id: 'analyst', name: 'Data Analyst', icon: LineChart, color: 'text-zinc-400', bg: 'bg-zinc-400/10', prompt: 'You are a meticulous data analyst. Focus on facts, logic, and structured breakdowns.' },
];

const PROMPT_INJECTS = [
  { id: 'eli5', label: 'ELI5', icon: Lightbulb, instruction: 'Explain your answer as if I am 5 years old.' },   
  { id: 'concise', label: 'Ultra Concise', icon: Zap, instruction: 'Be extremely concise. Use bullet points where possible. No fluff.' },
  { id: 'stepbystep', label: 'Step-by-Step', icon: Layers, instruction: 'Think step-by-step and show your reasoning before answering.' },
];

const SKILLS = [
  { id: 'db-access', name: 'Database Access', description: 'Query local SQL snippets', icon: Database },     
];

const MCP_SERVERS = [
  { id: 'context7', name: 'Context7', description: 'Real-time documentation', icon: Library },
  { id: 'gemini-bridge', name: 'Gemini Bridge', description: 'Cross-model memory', icon: Network },
];

const MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'google' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', provider: 'anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
];

export function ChatHub() {
  // --- State ---
  const [model, setModel] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('hub-model') || 'gemini-2.5-flash' : 'gemini-2.5-flash'));
  const [personaId, setPersonaId] = useState('default');
  const [activeInjects, setActiveInjects] = useState([]);
  const [activeSkills, setActiveSkills] = useState([]);
  const [activeMcps, setActiveMcps] = useState([]);
  const [enableWebSearch, setEnableWebSearch] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  const messagesEndRef = useRef(null);

  // --- AI SDK Chat ---
  const selectedPersona = PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  
  const systemPrompt = React.useMemo(() => {
    let prompt = selectedPersona.prompt;
    const activeInjectInstructions = PROMPT_INJECTS.filter(i => activeInjects.includes(i.id)).map(i => i.instruction);
    if (activeInjectInstructions.length > 0) {
      prompt += "\n\nAdditional Modifiers:\n" + activeInjectInstructions.join("\n");
    }
    return prompt;
  }, [selectedPersona, activeInjects]);

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/hub/chat',
    body: {
      model,
      systemPrompt,
      enableWebSearch,
      activeSkills,
      activeMcps
    },
    onFinish: () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hub-model', model);
    }
  }, [model]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- Handlers ---
  const toggleInject = (id) => setActiveInjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  const toggleSkill = (id) => setActiveSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleMcp = (id) => setActiveMcps(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-black text-zinc-50 overflow-hidden font-sans selection:bg-[#00f0ff] selection:text-black">

      {/* LEFT SIDEBAR: Personas */}
      <aside className="w-16 md:w-64 border-r border-zinc-800 bg-black flex flex-col py-4 z-20 shrink-0">
        <div className="px-4 mb-6 flex items-center gap-3">
          <div className="h-8 w-8 rounded-none bg-[#00f0ff] flex items-center justify-center shrink-0">
            <User className="h-5 w-5 text-black" />
          </div>
          <span className="hidden md:block font-syne font-bold lowercase text-white">Expert Personas</span>
        </div>

        <div className="flex-1 px-2 space-y-1 overflow-y-auto no-scrollbar">
          {PERSONAS.map(p => (
            <button
              key={p.id}
              onClick={() => setPersonaId(p.id)}
              className={cn(
                "flex items-center gap-3 p-2.5 w-full border border-transparent transition-colors text-zinc-500 hover:text-white hover:bg-zinc-900",
                personaId === p.id && "bg-zinc-900 border-zinc-800 text-white"
              )}
            >
              <p.icon className={cn("h-5 w-5 shrink-0", personaId === p.id ? "text-[#00f0ff]" : "")} />
              <span className="hidden md:block font-syne font-bold lowercase text-xs">{p.name}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-black min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-black/50 backdrop-blur-md z-10"> 
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">System Online</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-2 py-1"> 
              <Cpu className="h-3.5 w-3.5 text-zinc-500" />
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="bg-transparent text-[10px] text-zinc-300 outline-none cursor-pointer font-syne font-bold lowercase appearance-none pr-4"
              >
                {MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-zinc-900">{m.name}</option>
                ))}
              </select>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} 
              className={cn("h-8 w-8 p-0 border-zinc-800", isRightSidebarOpen ? "bg-zinc-800 text-white" : "text-zinc-500")}
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
              <BrainCircuit className="h-16 w-16 mb-4 text-[#00f0ff]" />
              <h2 className="font-syne text-2xl font-bold lowercase">Awaiting Input</h2>
              <p className="font-mono text-xs uppercase tracking-[0.2em] mt-2">Initialize neural connection to begin</p>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4 max-w-4xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "h-8 w-8 md:h-10 md:w-10 rounded-none flex items-center justify-center shrink-0 border",
                msg.role === 'user' ? "bg-white border-white" : "border-zinc-800 bg-[#00f0ff]/5"
              )}>
                {msg.role === 'user' ? <User className="h-5 w-5 text-black" /> : <selectedPersona.icon className="h-5 w-5 text-[#00f0ff]" />}
              </div>
              <div className={cn(
                "px-5 py-4 rounded-none max-w-[85%] text-sm leading-relaxed",
                msg.role === 'user' ? "bg-zinc-100 text-black" : "bg-zinc-900/50 border border-zinc-800 text-zinc-300"
              )}>
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-none selection:bg-[#00f0ff] selection:text-black">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-none flex items-center justify-center shrink-0 border border-zinc-800 bg-[#00f0ff]/5">
                <selectedPersona.icon className="h-5 w-5 animate-pulse text-[#00f0ff]" />
              </div>
              <div className="px-5 py-4 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                <div className="h-1.5 w-1.5 bg-[#00f0ff] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-[#00f0ff] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-[#00f0ff] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-black border-t border-zinc-800">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Prompt Injects */}
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
              {PROMPT_INJECTS.map(inject => {
                const isActive = activeInjects.includes(inject.id);
                return (
                  <button
                    key={inject.id}
                    onClick={() => toggleInject(inject.id)}
                    className={cn(
                      "h-7 px-3 rounded-none flex items-center gap-2 border transition-all text-[10px] font-syne font-bold lowercase whitespace-nowrap",
                      isActive ? "bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600"
                    )}
                  >
                    <inject.icon className="h-3 w-3" />
                    {inject.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} className="relative flex flex-col gap-2 bg-black border border-zinc-800 p-2 focus-within:border-[#00f0ff] transition-all">
              <textarea
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type a message..."
                className="w-full max-h-48 min-h-[44px] bg-transparent text-white placeholder:text-zinc-700 resize-none outline-none py-2 px-2 text-sm font-syne font-bold lowercase"
                rows={1}
              />
              <div className="flex items-center justify-between border-t border-zinc-900 pt-2">
                <div className="flex items-center gap-1">
                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-600 border-transparent hover:text-[#00f0ff]" title="Web Search">
                    <Globe className={cn("h-4 w-4", enableWebSearch && "text-[#00f0ff]")} onClick={() => setEnableWebSearch(!enableWebSearch)} />
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-600 border-transparent hover:text-[#00f0ff]" title="Code Context">
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!input?.trim() || isLoading}
                  className={cn(
                    "h-8 w-8 p-0",
                    input?.trim() && !isLoading ? "bg-[#00f0ff] text-black" : "bg-zinc-900 text-zinc-700"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: MCPs & Skills */}
      {isRightSidebarOpen && (
        <aside className="hidden lg:flex w-72 border-l border-zinc-800 bg-black flex-col py-4 z-20 animate-in slide-in-from-right-4 duration-300">
          <div className="px-4 mb-6 flex items-center gap-3">
            <div className="h-8 w-8 rounded-none bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
              <Activity className="h-5 w-5 text-[#00f0ff]" />
            </div>
            <span className="font-syne font-bold lowercase text-white">Capabilities</span>
          </div>

          <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
            {/* MCP Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">MCP Servers</h3>
                <span className="text-[9px] bg-[#00f0ff]/10 text-[#00f0ff] px-1.5 py-0.5 font-bold uppercase">SDK v6</span>
              </div>
              <div className="space-y-3">
                {MCP_SERVERS.map(mcp => (
                  <div key={mcp.id} className="group p-3 border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <mcp.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#00f0ff] transition-colors" />
                        <span className="text-xs font-syne font-bold lowercase text-zinc-200">{mcp.name}</span>
                      </div>
                      <Switch 
                        checked={activeMcps.includes(mcp.id)} 
                        onCheckedChange={() => toggleMcp(mcp.id)} 
                        id={mcp.id}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono lowercase">{mcp.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Neural Skills</h3>
              </div>
              <div className="space-y-3">
                {SKILLS.map(skill => (
                  <div key={skill.id} className="group p-3 border border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <skill.icon className="h-3.5 w-3.5 text-zinc-400 group-hover:text-[#00f0ff] transition-colors" />
                        <span className="text-xs font-syne font-bold lowercase text-zinc-200">{skill.name}</span>
                      </div>
                      <Switch 
                        checked={activeSkills.includes(skill.id)} 
                        onCheckedChange={() => toggleSkill(skill.id)} 
                        id={skill.id}
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono lowercase">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Footer */}
            <div className="pt-4 border-t border-zinc-900">
              <div className="flex items-center justify-between p-3 bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <Shield className="h-3 w-3 text-emerald-500" />
                  <span className="text-[9px] font-mono text-emerald-500 uppercase font-bold">Secure Connection</span>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
