import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, CheckCircle2, Loader2 } from 'lucide-react';
import { chatTree, ChatNode } from './chatTree';

interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  text: string;
}

const ChatBot: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string>('root');
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [whatsappMode, setWhatsappMode] = useState(false);
  const [whatsappInput, setWhatsappInput] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when opened for the first time
  useEffect(() => {
    if (isOpen && history.length === 0) {
      const rootNode = chatTree['root'];
      setHistory([{ id: Date.now().toString(), role: 'bot', text: rootNode.message }]);
    }
  }, [isOpen, history.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, currentNodeId, whatsappMode, isSimulating, dispatchSuccess]);

  const handleOptionClick = (label: string, nextNodeId: string) => {
    // 1. Add user's selection to history
    const userMsg: ChatMessage = { id: Date.now().toString() + '-u', role: 'user', text: label };
    
    // 2. Determine next node
    const nextNode = chatTree[nextNodeId];
    if (!nextNode) return;

    // 3. Add bot's response to history
    const botMsg: ChatMessage = { id: Date.now().toString() + '-b', role: 'bot', text: nextNode.message };
    
    setHistory(prev => [...prev, userMsg, botMsg]);
    setCurrentNodeId(nextNodeId);

    // 4. Handle WhatsApp Handoff
    if (nextNode.type === 'whatsapp') {
      setWhatsappMode(true);
      setDispatchSuccess(false);
    }
  };

  const handleWhatsappSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsappInput.trim()) return;

    // Add user message
    const userMsg: ChatMessage = { id: Date.now().toString() + '-u', role: 'user', text: whatsappInput };
    setHistory(prev => [...prev, userMsg]);
    setWhatsappInput('');
    setIsSimulating(true);

    // Simulate network delay for dispatch
    setTimeout(() => {
      setIsSimulating(false);
      setDispatchSuccess(true);
    }, 2000);
  };

  const resetChat = () => {
    setCurrentNodeId('root');
    setHistory([{ id: Date.now().toString(), role: 'bot', text: chatTree['root'].message }]);
    setWhatsappMode(false);
    setDispatchSuccess(false);
  };

  // Hide the chatbot entirely on the showroom (register) page
  if (location.pathname.includes('/register')) {
    return null;
  }

  const currentNode = chatTree[currentNodeId];

  return (
    <>
      {/* Floating Action Button - Positioned Bottom Right as requested */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          y: isOpen ? 0 : [0, -10, 0]
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center hover:bg-blue-700 transition-colors ${isOpen ? 'hidden' : 'flex'}`}
        aria-label="Open Support Chat"
      >
        <MessageSquare className="w-7 h-7" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold font-display text-lg leading-tight">SNOS Assistant</h3>
                  <span className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-950/50 scroll-smooth">
              {history.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-600/20' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Display Options for current node if not in whatsapp mode */}
              {!whatsappMode && currentNode?.options && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col gap-2 pl-11 pr-4 pt-2"
                >
                  {currentNode.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(opt.label, opt.nextNodeId)}
                      className="text-left px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/50 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-colors shadow-sm"
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* WhatsApp Loading / Success State */}
              {isSimulating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-6 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
                  <p className="text-sm font-medium">Dispatching to WhatsApp...</p>
                </motion.div>
              )}

              {dispatchSuccess && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center mx-2 mt-4">
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">Message Dispatched!</h4>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4">An agent will reply to your registered WhatsApp number shortly.</p>
                  <button onClick={resetChat} className="text-sm font-bold text-emerald-700 dark:text-emerald-400 hover:underline">
                    Return to Main Menu
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area (Only visible in WhatsApp mode and before dispatch success) */}
            {whatsappMode && !isSimulating && !dispatchSuccess && (
              <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <form onSubmit={handleWhatsappSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={whatsappInput}
                    onChange={(e) => setWhatsappInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!whatsappInput.trim()}
                    className="w-12 h-12 shrink-0 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-md"
                  >
                    <Send className="w-5 h-5 ml-1" />
                  </button>
                </form>
                <div className="text-center mt-2">
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Secure WhatsApp Integration</p>
                </div>
              </div>
            )}
            
            {/* Header reset helper if stuck */}
            {!whatsappMode && history.length > 2 && (
               <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 text-center">
                 <button onClick={resetChat} className="text-xs font-semibold text-slate-400 hover:text-blue-500 transition-colors uppercase tracking-wider">
                   Restart Conversation
                 </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBot;
