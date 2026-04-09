"use client";

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
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
  PanelRight, FileText, List, Trash2
} from 'lucide-react';
// Replace Button and Switch imports with inline components
const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'outline', size?: 'default' | 'sm' }>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-none text-sm font-bold lowercase font-[family-name:var(--font-syne)] ring-offset-black transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50",
          variant === 'default' ? "bg-[#00f0ff] text-black hover:bg-[#00f0ff]/80" : "",
          variant === 'outline' ? "border border-zinc-800 bg-black hover:bg-zinc-900 hover:text-white" : "",
          size === 'default' ? "h-10 px-4 py-2" : "",
          size === 'sm' ? "h-9 px-3" : "",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const Switch = ({ checked, onCheckedChange }: { checked: boolean, onCheckedChange: (c: boolean) => void }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-none border border-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00f0ff] focus-visible:ring-offset-1 focus-visible:ring-offset-black disabled:cursor-not-allowed disabled:opacity-50",
      checked ? "bg-[#00f0ff]" : "bg-zinc-900"
    )}
  >
    <span
      data-state={checked ? "checked" : "unchecked"}
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-none bg-black shadow-none ring-0 transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )}
    />
  </button>
)
import { cn } from '@/lib/utils';

// --- Data Models ---
const PERSONAS = [
  { id: 'default', name: 'Helpful Assistant', icon: Bot, color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10', customHex: null, prompt: 'You are a helpful, respectful, and honest assistant.', isCustom: false },
  { id: 'coder', name: '10x Developer', icon: Terminal, color: 'text-white', bg: 'bg-white/10', customHex: null, prompt: 'You are an elite software engineer. Provide concise, highly optimized code. Skip pleasantries.', isCustom: false },
  { id: 'creative', name: 'Creative Muse', icon: Sparkles, color: 'text-zinc-300', bg: 'bg-zinc-300/10', customHex: null, prompt: 'You are a creative muse. Think outside the box, use vivid imagery, and inspire the user.', isCustom: false },
  { id: 'analyst', name: 'Data Analyst', icon: LineChart, color: 'text-zinc-400', bg: 'bg-zinc-400/10', customHex: null, prompt: 'You are a meticulous data analyst. Focus on facts, logic, and structured breakdowns.', isCustom: false },
];

const AVAILABLE_ICONS: Record<string, any> = { 
  Bot, Terminal, Sparkles, LineChart, User, Cpu, Zap, Shield, 
  BrainCircuit, Lightbulb, MessageSquare, Code, Database,
  Ghost, Flame, Star, Heart, Music, Camera, Coffee, 
  Briefcase, Rocket, Gamepad, Anchor, Atom, Award, 
  Book, Cat, Dog, Feather, Moon, Sun, Umbrella,
  Command, FileText, List, Trash2
};
const AVAILABLE_COLORS = [
  { color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10', hex: 'bg-[#00f0ff]' },
  { color: 'text-white', bg: 'bg-white/10', hex: 'bg-white' },
  { color: 'text-zinc-300', bg: 'bg-zinc-300/10', hex: 'bg-zinc-300' },
  { color: 'text-zinc-400', bg: 'bg-zinc-400/10', hex: 'bg-zinc-400' },
  { color: 'text-zinc-500', bg: 'bg-zinc-500/10', hex: 'bg-zinc-500' },
  { color: 'text-zinc-600', bg: 'bg-zinc-600/10', hex: 'bg-zinc-600' },
];

const PROMPT_INJECTS = [
  { id: 'eli5', label: 'ELI5', icon: Lightbulb, instruction: 'Explain your answer as if I am 5 years old.' },
  { id: 'concise', label: 'Ultra Concise', icon: Zap, instruction: 'Be extremely concise. Use bullet points where possible. No fluff.' },
  { id: 'sarcastic', label: 'Sarcastic', icon: MessageSquare, instruction: 'Adopt a highly sarcastic and witty tone.' },
  { id: 'stepbystep', label: 'Step-by-Step', icon: Layers, instruction: 'Think step-by-step and show your reasoning before answering.' },
  { id: 'emoji', label: 'Emoji Heavy', icon: Sparkles, instruction: 'Use a lot of relevant emojis in your response.' },
  { id: 'devil', label: 'Devil\'s Advocate', icon: Shield, instruction: 'Play devil\'s advocate. Challenge the user\'s assumptions.' },
];

const SKILLS = [
  { id: 'web-search', name: 'Web Search', description: 'Enable Google Search grounding', icon: Globe },
  { id: 'code-exec', name: 'Code Execution', description: 'Run Python code (Simulated)', icon: Code },
  { id: 'db-access', name: 'Database Access', description: 'Query local SQL (Simulated)', icon: Database },
];

const MODELS = [
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', badge: 'Pro' },
  { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', badge: 'Fast' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', badge: 'Legacy' },
];

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

const IconPicker = ({ selected, onSelect }: { selected: string, onSelect: (icon: string) => void }) => {
  const [search, setSearch] = useState('');
  const filteredIcons = Object.keys(AVAILABLE_ICONS).filter(name => name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-2 border border-zinc-800 p-2 bg-black shadow-none rounded-none">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
        <input 
          type="text" 
          placeholder="Search icons..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-none pl-8 pr-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all placeholder:text-zinc-600"
        />
      </div>
      <div className="grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-800 [&::-webkit-scrollbar-thumb]:rounded-none">
        {filteredIcons.map(iconName => {
          const Icon = AVAILABLE_ICONS[iconName];
          const isSelected = selected === iconName;
          return (
            <button
              key={iconName}
              onClick={() => onSelect(iconName)}
              title={iconName}
              className={cn(
                "aspect-square rounded-none flex items-center justify-center transition-all duration-200",
                isSelected 
                  ? "bg-[#00f0ff]/10 border border-[#00f0ff] text-[#00f0ff] shadow-none" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white hover:border-zinc-700"
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        {filteredIcons.length === 0 && (
          <div className="col-span-6 text-center py-6 text-xs text-zinc-500 flex flex-col items-center gap-2">
            <Search className="h-4 w-4 opacity-50" />
            No icons found
          </div>
        )}
      </div>
    </div>
  );
};

const NAV_LINKS = [
  { id: 'chat', label: 'chat', icon: MessageSquare },
  { id: 'prompt-forge', label: 'prompt forge', icon: Wrench },
  { id: 'workflow', label: 'workflow studio', icon: Network },
  { id: 'embed-chain', label: 'embed chain', icon: LinkIcon },
  { id: 'platforms', label: 'platforms', icon: Globe },
  { id: 'google-universe', label: 'google universe', icon: Atom },
  { id: 'newsroom', label: 'newsroom', icon: Newspaper },
  { id: 'orchestration', label: 'orchestration', icon: Command },
  { id: 'content-hub', label: 'content hub', icon: PenTool },
];

export default function EpicChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: 'Welcome to the Epic Chat UI. Select a persona, configure your prompt injects, and let\'s begin.' }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [selectedPersonaId, setSelectedPersonaId] = useState('default');
  const [selectedModelId, setSelectedModelId] = useState('gemini-3.1-pro-preview');
  const [activeSkills, setActiveSkills] = useState<string[]>([]);
  const [activeInjects, setActiveInjects] = useState<string[]>([]);
  
  const [customPersonas, setCustomPersonas] = useState<any[]>([]);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [macros, setMacros] = useState<any[]>([
    { id: 'm1', name: 'summarize thread', iconName: 'FileText', prompt: 'Please summarize the entire thread above.' },
    { id: 'm2', name: 'extract action items', iconName: 'List', prompt: 'Extract all action items from this conversation.' }
  ]);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState(false);
  const [newMacro, setNewMacro] = useState({ name: '', iconName: 'Command', prompt: '' });
  const [newPersona, setNewPersona] = useState({ name: '', prompt: '', iconName: 'Bot', colorIdx: 0, customColor: '#00f0ff', kb: 'none' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('epic-chat-custom-personas');
    if (saved) {
      try { setCustomPersonas(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('epic-chat-custom-personas', JSON.stringify(customPersonas));
  }, [customPersonas]);

  useEffect(() => {
    const saved = localStorage.getItem('epic-chat-macros');
    if (saved) {
      try { setMacros(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('epic-chat-macros', JSON.stringify(macros));
  }, [macros]);

  const handleSaveMacro = () => {
    if (!newMacro.name.trim() || !newMacro.prompt.trim()) return;
    const m = {
      id: 'macro-' + Date.now(),
      name: newMacro.name.trim(),
      iconName: newMacro.iconName,
      prompt: newMacro.prompt.trim()
    };
    setMacros(prev => [...prev, m]);
    setIsMacroModalOpen(false);
    setNewMacro({ name: '', iconName: 'Command', prompt: '' });
  };

  const handleDeleteMacro = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setMacros(prev => prev.filter(m => m.id !== id));
  };

  const allPersonas = [
    ...PERSONAS,
    ...customPersonas.map(cp => ({
      id: cp.id,
      name: cp.name,
      icon: AVAILABLE_ICONS[cp.iconName] || Bot,
      color: cp.colorIdx === -1 ? '' : (AVAILABLE_COLORS[cp.colorIdx]?.color || AVAILABLE_COLORS[0].color),
      bg: cp.colorIdx === -1 ? '' : (AVAILABLE_COLORS[cp.colorIdx]?.bg || AVAILABLE_COLORS[0].bg),
      customHex: cp.colorIdx === -1 ? cp.customColor : null,
      prompt: cp.prompt,
      isCustom: true
    }))
  ];

  const selectedPersona = allPersonas.find(p => p.id === selectedPersonaId) || allPersonas[0];
  const selectedModel = MODELS.find(m => m.id === selectedModelId) || MODELS[0];

  const handleSavePersona = () => {
    if (!newPersona.name.trim() || !newPersona.prompt.trim()) return;
    const cp = {
      id: 'custom-' + Date.now(),
      name: newPersona.name.trim(),
      prompt: newPersona.prompt.trim(),
      iconName: newPersona.iconName,
      colorIdx: newPersona.colorIdx,
      customColor: newPersona.customColor,
      kb: newPersona.kb
    };
    setCustomPersonas(prev => [...prev, cp]);
    setSelectedPersonaId(cp.id);
    setIsPersonaModalOpen(false);
    setNewPersona({ name: '', prompt: '', iconName: 'Bot', colorIdx: 0, customColor: '#00f0ff', kb: 'none' });
  };

  const handleDeleteCustomPersona = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCustomPersonas(prev => prev.filter(p => p.id !== id));
    if (selectedPersonaId === id) setSelectedPersonaId('default');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleSkill = (id: string) => {
    setActiveSkills(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleInject = (id: string) => {
    setActiveInjects(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isGenerating) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      // Construct System Instruction
      let systemInstruction = selectedPersona.prompt;
      const activeInjectInstructions = PROMPT_INJECTS.filter(i => activeInjects.includes(i.id)).map(i => i.instruction);
      if (activeInjectInstructions.length > 0) {
        systemInstruction += "\n\nAdditional Modifiers:\n" + activeInjectInstructions.join("\n");
      }

      // Configure Tools
      const tools: any[] = [];
      if (activeSkills.includes('web-search')) {
        tools.push({ googleSearch: {} });
      }

      // Prepare Chat History
      const contents = messages.filter(m => m.id !== '1').map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      contents.push({ role: 'user', parts: [{ text: userMessage.text }] });

      const responseStream = await ai.models.generateContentStream({
        model: selectedModelId,
        contents: contents as any,
        config: {
          systemInstruction,
          tools: tools.length > 0 ? tools : undefined,
        }
      });

      const modelMessageId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: modelMessageId, role: 'model', text: '' }]);

      for await (const chunk of responseStream) {
        setMessages(prev => prev.map(m => 
          m.id === modelMessageId ? { ...m, text: m.text + chunk.text } : m
        ));
      }

    } catch (error) {
      console.error("Error generating response:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: '**Error:** Failed to generate response. Please check your API key and network connection.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex h-screen w-full bg-black text-zinc-50 overflow-hidden font-sans selection:bg-[#00f0ff] selection:text-black">
      
      {/* LEFT SIDEBAR: Hub Navigation */}
      <aside className="w-16 hover:w-56 group border-r border-zinc-800 bg-black flex flex-col items-start py-4 z-20 transition-all duration-300 overflow-hidden absolute h-full md:relative">
        <div className="px-4 mb-6 flex items-center gap-3 shrink-0 w-full">
          <div className="h-8 w-8 rounded-none bg-[#00f0ff] flex items-center justify-center shrink-0">
            <BrainCircuit className="h-5 w-5 text-black" />
          </div>
          <span className="font-[family-name:var(--font-syne)] font-bold lowercase text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">.ktg hub</span>
        </div>
        
        <div className="flex-1 w-full flex flex-col gap-1 px-2 overflow-y-auto no-scrollbar">
          {NAV_LINKS.map(link => (
            <button
              key={link.id}
              className={cn(
                "flex items-center gap-3 p-2.5 w-full border border-transparent transition-colors text-zinc-500 hover:text-white hover:bg-zinc-900",
                link.id === 'chat' && "bg-zinc-900 border-zinc-800 text-white"
              )}
            >
              <link.icon className="h-5 w-5 shrink-0" />
              <span className="font-[family-name:var(--font-syne)] font-bold lowercase text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{link.label}</span>
            </button>
          ))}

          <div className="w-full h-px bg-zinc-800 my-2 shrink-0" />
          <div className="px-2 py-1 shrink-0">
            <span className="text-[10px] font-[family-name:var(--font-syne)] font-bold lowercase text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Active Skills</span>
          </div>
          
          {SKILLS.map(skill => {
            const isActive = activeSkills.includes(skill.id);
            return (
              <button
                key={skill.id}
                onClick={() => toggleSkill(skill.id)}
                className={cn(
                  "flex items-center gap-3 p-2.5 w-full border border-transparent transition-colors text-zinc-500 hover:text-white hover:bg-zinc-900",
                  isActive && "text-[#00f0ff] bg-[#00f0ff]/10 border-l-[#00f0ff] border-l-2"
                )}
                title={skill.name}
              >
                <skill.icon className="h-5 w-5 shrink-0" />
                <span className="font-[family-name:var(--font-syne)] font-bold lowercase text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">{skill.name}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col relative bg-black">
        {/* Top Bar */}
        <header className="h-14 border-b border-zinc-800 flex items-center px-4 justify-between bg-black z-10">
          <div className="flex items-center gap-3">
            <div className="text-xs text-zinc-500 font-[family-name:var(--font-syne)] font-bold lowercase">.ktg</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1">
              <selectedPersona.icon className={cn("h-3.5 w-3.5", selectedPersona.color)} style={selectedPersona.customHex ? { color: selectedPersona.customHex } : undefined} />
              <select 
                value={selectedPersonaId}
                onChange={e => setSelectedPersonaId(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer appearance-none pr-4 font-[family-name:var(--font-syne)] font-bold lowercase"
              >
                {allPersonas.map(p => (
                  <option key={p.id} value={p.id} className="bg-zinc-900">{p.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setIsPersonaModalOpen(true)}
                className="ml-1 text-zinc-500 hover:text-[#00f0ff] transition-colors"
                title="Create Custom Persona"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-none px-2 py-1">
              <Cpu className="h-3.5 w-3.5 text-zinc-500" />
              <select 
                value={selectedModelId}
                onChange={e => setSelectedModelId(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 outline-none cursor-pointer appearance-none pr-4 font-[family-name:var(--font-syne)] font-bold lowercase"
              >
                {MODELS.map(model => (
                  <option key={model.id} value={model.id} className="bg-zinc-900">{model.name}</option>
                ))}
              </select>
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-none">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className={cn("h-8 w-8 p-0 border-zinc-800 rounded-none", isRightSidebarOpen ? "bg-zinc-800 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-500")}>
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-4 max-w-4xl mx-auto", msg.role === 'user' ? "flex-row-reverse" : "")}>
              <div className={cn(
                "h-10 w-10 rounded-none flex items-center justify-center shrink-0 border",
                msg.role === 'user' 
                  ? "bg-white border-white" 
                  : cn("border-zinc-800", selectedPersona.bg)
              )} style={msg.role === 'model' && selectedPersona.customHex ? { backgroundColor: selectedPersona.customHex + '1a' } : undefined}>
                {msg.role === 'user' ? <User className="h-5 w-5 text-black" /> : <selectedPersona.icon className={cn("h-5 w-5", selectedPersona.color)} style={selectedPersona.customHex ? { color: selectedPersona.customHex } : undefined} />}
              </div>
              <div className={cn(
                "px-5 py-4 rounded-none max-w-[80%] text-sm leading-relaxed",
                msg.role === 'user' 
                  ? "bg-white text-black" 
                  : "bg-zinc-900 border border-zinc-800 text-zinc-300"
              )}>
                {msg.role === 'model' ? (
                  <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-4 max-w-4xl mx-auto">
              <div className={cn("h-10 w-10 rounded-none flex items-center justify-center shrink-0 border border-zinc-800", selectedPersona.bg)} style={selectedPersona.customHex ? { backgroundColor: selectedPersona.customHex + '1a' } : undefined}>
                <selectedPersona.icon className={cn("h-5 w-5 animate-pulse", selectedPersona.color)} style={selectedPersona.customHex ? { color: selectedPersona.customHex } : undefined} />
              </div>
              <div className="px-5 py-4 rounded-none bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center gap-2">
                <div className="h-2 w-2 bg-[#00f0ff] rounded-none animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-[#00f0ff] rounded-none animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-[#00f0ff] rounded-none animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area with Prompt Injects */}
        <div className="p-4 bg-black pt-6 border-t border-zinc-800">
          <div className="max-w-4xl mx-auto relative">
            
            {/* Prompt Injects (Jewels) */}
            <div className="absolute -top-10 left-0 flex gap-2 z-20">
              {PROMPT_INJECTS.map(inject => {
                const isActive = activeInjects.includes(inject.id);
                const Icon = inject.icon;
                return (
                  <button
                    key={inject.id}
                    onClick={() => toggleInject(inject.id)}
                    className={cn(
                      "group relative h-7 w-7 rounded-none flex items-center justify-center border transition-all duration-300",
                      isActive 
                        ? "bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-[10px] text-white rounded-none opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700 font-[family-name:var(--font-syne)] font-bold lowercase">
                      {inject.label}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="relative flex flex-col gap-2 bg-black border border-zinc-800 rounded-none p-2 focus-within:border-[#00f0ff] transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="type a message... (shift+enter for new line)"
                className="w-full max-h-48 min-h-[44px] bg-transparent text-white placeholder:text-zinc-600 resize-none outline-none py-2 px-2 text-sm font-[family-name:var(--font-syne)] font-bold lowercase"
                rows={1}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-500 border-transparent bg-transparent hover:text-[#00f0ff] hover:bg-[#00f0ff]/10" title="Attach">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-500 border-transparent bg-transparent hover:text-[#00f0ff] hover:bg-[#00f0ff]/10" title="Drive">
                    <Cloud className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-500 border-transparent bg-transparent hover:text-[#00f0ff] hover:bg-[#00f0ff]/10" title="NotebookLM">
                    <Library className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-4 bg-zinc-800 mx-1 shrink-0" />
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-500 border-transparent bg-transparent hover:text-[#00f0ff] hover:bg-[#00f0ff]/10" title="Save MD">
                    <FileDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-zinc-500 border-transparent bg-transparent hover:text-[#00f0ff] hover:bg-[#00f0ff]/10" title="Share">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isGenerating}
                  className={cn(
                    "h-8 w-8 rounded-none shrink-0 transition-all duration-300 p-0",
                    input.trim() && !isGenerating 
                      ? "bg-[#00f0ff] hover:bg-[#00f0ff]/80 text-black" 
                      : "bg-zinc-900 text-zinc-500"
                  )}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="text-[10px] text-zinc-600 font-medium tracking-wide font-[family-name:var(--font-syne)] font-bold lowercase">
                epic chat ui • powered by gemini api • .ktg
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT SIDEBAR: Macros */}
      {isRightSidebarOpen && (
        <aside className="w-64 border-l border-zinc-800 bg-black flex flex-col z-20 animate-in slide-in-from-right-8 duration-300">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-syne)] font-bold lowercase text-sm tracking-tight text-white flex items-center gap-2">
              <Command className="h-4 w-4 text-[#00f0ff]" />
              Macros
            </h2>
            <button onClick={() => setIsRightSidebarOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {macros.map(macro => {
              const Icon = AVAILABLE_ICONS[macro.iconName] || Command;
              return (
                <div key={macro.id} className="relative group">
                  <button 
                    onClick={() => sendMessage(macro.prompt)}
                    className="w-full flex items-center gap-3 p-3 border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-[#00f0ff] transition-all text-left"
                  >
                    <Icon className="h-4 w-4 text-zinc-500 group-hover:text-[#00f0ff]" />
                    <span className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase text-zinc-300 group-hover:text-white">{macro.name}</span>
                  </button>
                  <button 
                    onClick={(e) => handleDeleteMacro(e, macro.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
            <button 
              onClick={() => setIsMacroModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 hover:border-[#00f0ff] hover:text-[#00f0ff] hover:bg-[#00f0ff]/5 text-zinc-500 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase">Create Macro</span>
            </button>
          </div>
        </aside>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-zinc-800 rounded-none shadow-none w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-[family-name:var(--font-syne)] font-bold lowercase text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#00f0ff]" />
                Settings
              </h2>
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-none hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                <h3 className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Manage MCPs & Skills</h3>
                <p className="text-xs text-zinc-400">Upload and configure your Model Context Protocol servers and custom skills here.</p>
                <button className="w-full flex items-center justify-center gap-2 p-4 rounded-none border border-dashed border-zinc-700 hover:border-[#00f0ff] hover:text-[#00f0ff] hover:bg-[#00f0ff]/5 text-zinc-500 transition-all group">
                  <Plus className="h-5 w-5" />
                  <span className="text-sm font-[family-name:var(--font-syne)] font-bold lowercase">Upload MCP / Skill</span>
                </button>
                <div className="space-y-2 mt-4">
                  {SKILLS.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border border-zinc-800 bg-zinc-900/50">
                      <div className="flex items-center gap-3">
                        <skill.icon className="h-4 w-4 text-zinc-500" />
                        <span className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase text-zinc-300">{skill.name}</span>
                      </div>
                      <Button variant="outline" size="sm" className="h-6 text-[10px] border-zinc-700 text-zinc-500 hover:text-red-400 hover:border-red-900 hover:bg-red-950/30 rounded-none">Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Persona Modal */}
      {isPersonaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-zinc-800 rounded-none shadow-none w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-[family-name:var(--font-syne)] font-bold lowercase text-white">Create Custom Persona</h2>
              <button 
                onClick={() => setIsPersonaModalOpen(false)}
                className="p-1.5 rounded-none hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Name</label>
                <input 
                  value={newPersona.name}
                  onChange={e => setNewPersona({...newPersona, name: e.target.value})}
                  placeholder="e.g. pirate captain"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all font-[family-name:var(--font-syne)] font-bold lowercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">System Prompt</label>
                <textarea 
                  value={newPersona.prompt}
                  onChange={e => setNewPersona({...newPersona, prompt: e.target.value})}
                  placeholder="you are a swashbuckling pirate captain. speak entirely in pirate slang..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Icon</label>
                <IconPicker 
                  selected={newPersona.iconName} 
                  onSelect={(iconName) => setNewPersona({...newPersona, iconName})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Knowledge Base</label>
                <div className="relative">
                  <select 
                    value={newPersona.kb}
                    onChange={e => setNewPersona({...newPersona, kb: e.target.value})}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all font-[family-name:var(--font-syne)] font-bold lowercase appearance-none"
                  >
                    <option value="none">No Knowledge Base</option>
                    <option value="kb1">Project Alpha Docs</option>
                    <option value="kb2">My Codebase</option>
                    <option value="kb3">Design System Guidelines</option>
                  </select>
                  <Database className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Background Color</label>
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 shrink-0">
                    <input 
                      type="color" 
                      value={newPersona.customColor}
                      onChange={e => setNewPersona({...newPersona, customColor: e.target.value, colorIdx: -1})}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <div 
                      className={cn("h-8 w-8 rounded-none border border-zinc-700 flex items-center justify-center", newPersona.colorIdx === -1 ? "ring-1 ring-white ring-offset-2 ring-offset-black" : "")}
                      style={{ backgroundColor: newPersona.customColor }}
                    >
                      {newPersona.colorIdx === -1 && <Plus className="h-4 w-4 text-black mix-blend-difference" />}
                    </div>
                  </div>
                  <div className="w-px h-6 bg-zinc-800 shrink-0" />
                  <div className="flex flex-wrap gap-3">
                    {AVAILABLE_COLORS.map((colorObj, idx) => {
                      const isSelected = newPersona.colorIdx === idx;
                      return (
                        <button
                          key={idx}
                          onClick={() => setNewPersona({...newPersona, colorIdx: idx})}
                          className={cn(
                            "h-8 w-8 rounded-none flex items-center justify-center transition-all",
                            colorObj.hex,
                            isSelected ? "ring-1 ring-white ring-offset-2 ring-offset-black scale-110" : "opacity-50 hover:opacity-100"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-zinc-800 bg-black flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPersonaModalOpen(false)} className="border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900">
                Cancel
              </Button>
              <Button 
                onClick={handleSavePersona}
                disabled={!newPersona.name.trim() || !newPersona.prompt.trim()}
              >
                Save Persona
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Macro Modal */}
      {isMacroModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-black border border-zinc-800 rounded-none shadow-none w-full max-w-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-[family-name:var(--font-syne)] font-bold lowercase text-white">Create Custom Macro</h2>
              <button 
                onClick={() => setIsMacroModalOpen(false)}
                className="p-1.5 rounded-none hover:bg-zinc-900 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Name</label>
                <input 
                  value={newMacro.name}
                  onChange={e => setNewMacro({...newMacro, name: e.target.value})}
                  placeholder="e.g. summarize thread"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all font-[family-name:var(--font-syne)] font-bold lowercase"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Prompt / Action</label>
                <textarea 
                  value={newMacro.prompt}
                  onChange={e => setNewMacro({...newMacro, prompt: e.target.value})}
                  placeholder="extract all action items from this conversation..."
                  rows={4}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-none px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] transition-all resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-[family-name:var(--font-syne)] font-bold lowercase tracking-wider text-zinc-500">Icon</label>
                <IconPicker 
                  selected={newMacro.iconName} 
                  onSelect={(iconName) => setNewMacro({...newMacro, iconName})} 
                />
              </div>
            </div>

            <div className="p-5 border-t border-zinc-800 bg-black flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsMacroModalOpen(false)} className="border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-900">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveMacro}
                disabled={!newMacro.name.trim() || !newMacro.prompt.trim()}
              >
                Save Macro
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
