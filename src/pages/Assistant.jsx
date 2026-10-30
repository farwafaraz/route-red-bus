import { useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Trash2 } from 'lucide-react';
import { Shell } from '../components/Shell';
import { ChatMessage } from '../components/ChatMessage';
import { useAllBuses } from '../hooks/useAllBuses';
import { useDemoSimulation } from '../hooks/useDemoSimulation';
import { routes } from '../data/routes';
import { answerQuestion } from '../utils/assistantEngine';
import { shouldStartInDemoMode } from '../config';

const starter = { role: 'assistant', text: 'Hi, I can help with live buses, routes and approximate arrival times.' };
const suggestions = ['Where is my bus?', 'When will it arrive?', 'Which buses are active?', 'What is the next stop?', 'What is the R9 route?'];

export function Assistant() {
  const { freshActiveBuses } = useAllBuses();
  const demoMode = shouldStartInDemoMode();
  const { position: demoR9 } = useDemoSimulation(routes[0], demoMode);
  const { position: demoR4 } = useDemoSimulation(routes[1], demoMode);
  const [messages, setMessages] = useState([starter]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [lastBus, setLastBus] = useState(null);
  const [lastRoute, setLastRoute] = useState(null);
  const chatRef = useRef(null);
  const demoBuses = {
    ...(demoR9 ? { BUS001: { ...demoR9, busId: 'BUS001', routeId: 'R9' } } : {}),
    ...(demoR4 ? { BUS007: { ...demoR4, busId: 'BUS007', routeId: 'R4' } } : {}),
  };
  const assistantBuses = demoMode ? demoBuses : freshActiveBuses;
  const savedBoarding = localStorage.getItem('routvia-boarding-stop');

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const ask = (question = input) => {
    const trimmed = question.trim();
    if (!trimmed || typing) return;
    setMessages((current) => [...current, { role: 'user', text: trimmed }]);
    setInput('');
    setTyping(true);
    window.setTimeout(() => {
      const text = answerQuestion(trimmed, {
        routes,
        buses: assistantBuses,
        demoMode,
        now: Date.now(),
        savedBoarding,
        lastBus,
        lastRoute,
      });
      const busMatch = text.match(/Bus (BUS\d+)/);
      const routeMatch = text.match(/Route (R\d+)/);
      if (busMatch) setLastBus(busMatch[1]);
      if (routeMatch) setLastRoute(routeMatch[1]);
      setMessages((current) => [...current, { role: 'assistant', text }]);
      setTyping(false);
    }, 500);
  };

  const clear = () => {
    setMessages([starter]);
    setLastBus(null);
    setLastRoute(null);
  };

  return (
    <Shell title="RoutVia AI Assistant" subtitle="Your guide to Karachi Red Bus">
      <main className="assistant-page">
        <div className="assistant-hero">
          <div className="assistant-avatar"><Sparkles size={22} /></div>
          <div><p className="eyebrow">Always here to help</p><h1>RoutVia AI Assistant</h1><span>Answers from your live network</span></div>
          <button className="clear-chat" onClick={clear} aria-label="Clear chat"><Trash2 size={16} /></button>
          <span className="online-label"><span className="pulse-dot" /> Online</span>
        </div>
        <div className="suggestions">{suggestions.map((question) => <button key={question} onClick={() => ask(question)}>{question}</button>)}</div>
        <div className="chat-window" ref={chatRef}>
          {messages.map((message, index) => <ChatMessage key={`${message.role}-${index}`} role={message.role} text={message.text} />)}
          {typing && <div className="typing-indicator"><span /><span /><span /> RoutVia is thinking…</div>}
        </div>
        <form className="chat-input" onSubmit={(e) => { e.preventDefault(); ask(); }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about a bus or route…" />
          <button aria-label="Send question" disabled={typing}><Send size={18} /></button>
        </form>
        <p className="assistant-disclaimer">RoutVia AI uses real network data when available. All arrival times are approximate.</p>
      </main>
    </Shell>
  );
}
