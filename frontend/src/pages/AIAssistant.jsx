import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import api from '../utils/api';
import {
  Sparkles,
  Send,
  Cpu,
  Bot,
  User,
  Trash2,
  AlertTriangle,
  Zap,
  Info,
  Calendar,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  BookOpen,
  ArrowRight
} from 'lucide-react';

const AIAssistant = () => {
  const { user } = useSelector((state) => state.auth);
  const userRole = user?.role;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello **${user?.name || 'User'}**! I am your SE-LMS AI assistant. I have loaded context for your role as a **${userRole}**. 

How can I help you use the LMS today? Ask me about assignments, grades, notice boards, timetables, or online lectures!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [isMockEnv, setIsMockEnv] = useState(false);

  // Auto-Scheduler states
  const [scheduling, setScheduling] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState('');
  const [scheduleError, setScheduleError] = useState('');

  const chatEndRef = useRef(null);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // Load starter prompt templates based on role
  const getPromptStarters = () => {
    switch (userRole) {
      case 'student':
        return [
          'What courses am I enrolled in?',
          'How do I view my sessional results?',
          'Where is my class timetable?',
          'How do I join online lectures?'
        ];
      case 'teacher':
        return [
          'How do I mark attendance?',
          'Where can I manage sessional scores?',
          'How do I start an online lecture meeting?',
          'Show me my taught courses'
        ];
      case 'admin':
      case 'hod':
        return [
          'How does the auto-scheduler work?',
          'Show available classrooms in the department',
          'Explain how to manage courses and users',
          'Auto-generate weekly timetable'
        ];
      default:
        return ['How do I use this LMS?'];
    }
  };

  // Send message to AI
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || sending) return;

    // Clear input if sending from the input box
    if (!textToSend) setInputText('');

    // Append user message
    const newMsg = { sender: 'user', text, timestamp: new Date() };
    setMessages((prev) => [...prev, newMsg]);
    setSending(true);

    try {
      // Gather chat history (limit context size)
      const chatHistory = messages.map(m => ({ sender: m.sender, text: m.text }));

      const res = await api.post('/ai/chat', {
        message: text,
        history: chatHistory
      });

      const reply = res.data.reply;
      setIsMockEnv(res.data.isMock || false);

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: reply,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚠️ *System Error: Could not connect to AI service.* Make sure the backend server is running and try again.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  // Trigger Automatic Timetable Solver (Admin only)
  const handleAutoSchedule = async () => {
    if (!window.confirm('WARNING: Auto-generating the timetable will delete all currently scheduled slots and replace them with a brand-new, conflict-free weekly schedule. Are you sure you want to overwrite the timetable?')) return;
    
    setScheduling(true);
    setScheduleSuccess('');
    setScheduleError('');

    // Append user notification to chat
    setMessages((prev) => [
      ...prev,
      {
        sender: 'user',
        text: 'Generate the weekly department timetable automatically.',
        timestamp: new Date()
      }
    ]);

    try {
      const res = await api.post('/timetable/generate-auto');
      const data = res.data;

      setScheduleSuccess(data.message);

      // Append bot summary response to chat log
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `⚡ **Department Weekly Timetable Generated successfully!**

I have resolved all resources and compiled a conflict-free department schedule. Here is the summary:
- **Total Allocations**: ${data.count} lectures scheduled
- **Working Days**: Monday to Friday
- **Classrooms Used**: Room 101, Room 102, Room 103, Room 104, Lab 1, Lab 2, Seminar Room
- **Daily Slots**: 5 standard periods (08:30 to 16:20)

*All teacher overlaps, classroom overlaps, and class timetable conflicts are fully resolved. You can now view and edit the slots in the "Class Timetable" or "Manage Timetable" panel!*`,
          timestamp: new Date()
        }
      ]);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Solver engine failed during constraints satisfaction analysis.';
      setScheduleError(errMsg);
      
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `❌ **Failed to generate timetable:** ${errMsg}`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setScheduling(false);
    }
  };

  // Clear chat log
  const handleClearChat = () => {
    if (!window.confirm('Reset conversation log?')) return;
    setMessages([
      {
        sender: 'bot',
        text: `Chat reset. I am ready to help you navigate your portal. Ask me anything!`,
        timestamp: new Date()
      }
    ]);
  };

  // Handle format markdown bolding and bullet lists
  const renderMessageText = (text) => {
    return text.split('\n').map((line, idx) => {
      // Bold text formatting **text**
      let formatted = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const inlineCodeRegex = /`(.*?)`/g;

      // Replace bold markdown
      formatted = formatted.replace(boldRegex, '<strong>$1</strong>');
      // Replace inline code markdown
      formatted = formatted.replace(inlineCodeRegex, '<code class="bg-slate-200/80 px-1 rounded text-red-600 font-mono text-xs">$1</code>');

      // Check if line is bullet list
      const isBullet = line.startsWith('- ');
      if (isBullet) {
        return (
          <li
            key={idx}
            className="ml-5 list-disc mt-1 text-xs md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted.substring(2) }}
          />
        );
      }

      // Check if line is numbered list
      const isNum = /^\d+\.\s/.test(line);
      if (isNum) {
        const dotIdx = line.indexOf('. ');
        return (
          <li
            key={idx}
            className="ml-5 list-decimal mt-1 text-xs md:text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formatted.substring(dotIdx + 2) }}
          />
        );
      }

      // Render paragraph
      return (
        <p
          key={idx}
          className={`${line.trim() === '' ? 'h-2' : ''} text-xs md:text-sm leading-relaxed`}
          dangerouslySetInnerHTML={{ __html: formatted }}
        />
      );
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-2">
      {/* Page Header */}
      <div>
        <h1 className="page-title text-3xl font-extrabold text-slate-800 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-indigo-650 animate-pulse" />
          LMS AI Assistant
        </h1>
        <p className="page-subtitle text-sm text-slate-500 mt-1">
          Chat with the localized LMS agent to retrieve grades, schedule courses, and ask support questions.
        </p>
      </div>

      {/* Offline API Key warning banner */}
      {isMockEnv && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs md:text-sm rounded-2xl animate-fade-in shadow-sm">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700 block">Offline Simulation Mode</span>
            <p className="leading-relaxed">
              The `GEMINI_API_KEY` is not configured in the backend environment. The assistant is running in offline helper mode. 
              Configure the API key in the backend `.env` file to activate advanced generative conversations.
            </p>
          </div>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Admin Timetable Tool (Visible ONLY to Admin) */}
        {userRole === 'admin' && (
          <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
            <div className="card p-6 bg-white border border-slate-150 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Cpu className="h-5 w-5 text-indigo-600" />
                <h2 className="text-base font-bold text-slate-800">Auto-Scheduler</h2>
              </div>

              <p className="text-xs text-slate-550 leading-relaxed">
                The constraint-based solver automatically creates a conflict-free department weekly timetable.
              </p>

              {/* Status messages */}
              {scheduleSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] rounded-xl flex gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{scheduleSuccess}</span>
                </div>
              )}

              {scheduleError && (
                <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 text-[11px] rounded-xl flex gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <button
                onClick={handleAutoSchedule}
                disabled={scheduling}
                className="w-full btn-primary bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-2.5 text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {scheduling ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Solving Constraints...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
                    Auto-Generate Timetable
                  </>
                )}
              </button>
            </div>

            {/* Timetable guide info */}
            <div className="card p-6 bg-slate-50 border border-slate-150 rounded-2xl text-xs space-y-3">
              <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
                <Info className="h-4.5 w-4.5 text-indigo-650" />
                Solver Rules
              </h3>
              <ul className="space-y-2 text-slate-550">
                <li className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Schedules 2 slots/course weekly</span>
                </li>
                <li className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Avoids overlapping classrooms</span>
                </li>
                <li className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Guarantees teachers are never double-booked</span>
                </li>
                <li className="flex items-start gap-1">
                  <ArrowRight className="h-3 w-3 text-indigo-500 shrink-0 mt-0.5" />
                  <span>Ensures zero class clashes per semester</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Right column: Chat Log (Full width if not Admin, 3 cols if Admin) */}
        <div className={`lg:col-span-${userRole === 'admin' ? '3' : '4'} flex flex-col h-[680px] bg-white border border-slate-150 rounded-2xl shadow-sm overflow-hidden order-1 lg:order-2`}>
          
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                <Bot className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm">SE-LMS Local Agent</h3>
                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Online Assistance
                </span>
              </div>
            </div>

            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
              title="Reset Chat History"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>

          {/* Messages Log area */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
            {messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  {/* Bubble Avatar */}
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-xs ${
                      isBot
                        ? 'bg-gradient-to-tr from-indigo-850 to-indigo-650'
                        : 'bg-indigo-600'
                    }`}
                  >
                    {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Speech bubble */}
                  <div
                    className={`px-4.5 py-3 rounded-2xl text-slate-800 shadow-sm border transition-all ${
                      isBot
                        ? 'bg-white border-slate-150 rounded-tl-none'
                        : 'bg-indigo-600 border-indigo-650 text-white rounded-tr-none'
                    }`}
                  >
                    <div className="space-y-1.5">
                      {isBot ? renderMessageText(m.text) : <p className="text-xs md:text-sm">{m.text}</p>}
                    </div>
                    <span
                      className={`text-[9px] mt-1.5 block text-right font-medium opacity-50 ${
                        isBot ? 'text-slate-400' : 'text-indigo-200'
                      }`}
                    >
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* AI thinking state indicator */}
            {sending && (
              <div className="flex gap-3 mr-auto max-w-[85%] animate-pulse">
                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-slate-400" />
                </div>
                <div className="px-4.5 py-3 rounded-2xl rounded-tl-none bg-white border border-slate-150 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-100" />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce delay-200" />
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Quick prompts section */}
          <div className="px-5 py-2.5 border-t border-slate-100/80 bg-white flex flex-wrap gap-2 items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Suggestions:</span>
            {getPromptStarters().map((p, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(p)}
                disabled={sending || scheduling}
                className="text-[11px] px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-650 hover:bg-indigo-50 hover:border-indigo-150 transition-all font-medium whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input form */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder={`Ask AI Assistant...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={sending || scheduling}
                className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-450 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending || scheduling}
                className="btn-primary px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAssistant;
