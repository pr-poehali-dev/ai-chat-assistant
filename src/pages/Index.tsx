import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const CHAT_URL = func2url.chat;

type View = "chat" | "settings";
type Tab = "profile" | "chat-params";

interface Message {
  id: number;
  role: "user" | "ai";
  text: string;
  time: string;
}

const DEMO_MESSAGES: Message[] = [
  {
    id: 1,
    role: "ai",
    text: "Привет! Я готов помочь. Чем займёмся сегодня?",
    time: "14:00",
  },
  {
    id: 2,
    role: "user",
    text: "Напиши короткое стихотворение о космосе.",
    time: "14:01",
  },
  {
    id: 3,
    role: "ai",
    text: "Среди холодных звёздных рек,\nгде свет теряет счёт векам,\nлетит вперёд один человек —\nнавстречу новым берегам.",
    time: "14:01",
  },
];

const getTime = () =>
  new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

export default function Index() {
  const [view, setView] = useState<View>("chat");
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState({
    name: "Александр",
    email: "alex@example.com",
    avatar: "АЛ",
  });

  const [chatParams, setChatParams] = useState({
    model: "gpt-4o",
    temperature: 0.7,
    maxTokens: 2048,
    language: "ru",
    systemPrompt: "Ты полезный ИИ-ассистент. Отвечай по-русски.",
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: input.trim(),
      time: getTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.text,
          systemPrompt: chatParams.systemPrompt,
        }),
      });
      const data = await res.json();
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "ai",
        text: data.reply || "Не удалось получить ответ.",
        time: getTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: "Ошибка соединения. Попробуйте ещё раз.", time: getTime() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-background font-golos overflow-hidden">
      {/* Sidebar */}
      <aside className="w-16 flex flex-col items-center py-6 gap-4 border-r border-border bg-[hsl(var(--sidebar-background))] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-blue-sm mb-4">
          <Icon name="Sparkles" size={18} className="text-primary-foreground" />
        </div>

        <NavBtn
          icon="MessageSquare"
          label="Чат"
          active={view === "chat"}
          onClick={() => setView("chat")}
        />
        <NavBtn
          icon="Settings2"
          label="Настройки"
          active={view === "settings"}
          onClick={() => setView("settings")}
        />

        <div className="flex-1" />

        <button
          onClick={() => setView("settings")}
          className="w-9 h-9 rounded-full bg-[hsl(var(--chat-user-bg))] border border-primary/30 flex items-center justify-center text-xs font-semibold text-primary hover:border-primary/60 transition-all"
        >
          {profile.avatar}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {view === "chat" ? (
          <>
            <header className="h-14 flex items-center px-5 border-b border-border shrink-0 gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center">
                <Icon name="Bot" size={15} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">ИИ-Ассистент</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="text-xs text-muted-foreground">онлайн · {chatParams.model}</span>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <MessageBubble msg={msg} />
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 px-4 py-4 border-t border-border">
              <div className="flex items-end gap-2 bg-[hsl(var(--card))] border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 transition-all">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Напишите сообщение..."
                  rows={1}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[24px] max-h-[120px] leading-6"
                  style={{ fontFamily: "inherit" }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shrink-0 glow-blue-sm"
                >
                  <Icon name="ArrowUp" size={15} className="text-primary-foreground" />
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2 opacity-50">
                Enter — отправить · Shift+Enter — новая строка
              </p>
            </div>
          </>
        ) : (
          <SettingsView
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            profile={profile}
            setProfile={setProfile}
            chatParams={chatParams}
            setChatParams={setChatParams}
          />
        )}
      </main>
    </div>
  );
}

function NavBtn({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative
        ${active
          ? "bg-primary/15 text-primary glow-blue-sm"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary"
        }`}
    >
      <Icon name={icon} size={18} />
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full -ml-px" />
      )}
    </button>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold border
          ${isUser
            ? "bg-[hsl(var(--chat-user-bg))] border-primary/30 text-primary"
            : "bg-[hsl(var(--chat-ai-bg))] border-border text-muted-foreground"
          }`}
      >
        {isUser ? "Вы" : <Icon name="Bot" size={14} />}
      </div>
      <div className={`max-w-[72%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
            ${isUser
              ? "bg-[hsl(var(--chat-user-bg))] text-foreground rounded-tr-sm border border-primary/20"
              : "bg-[hsl(var(--chat-ai-bg))] text-foreground rounded-tl-sm border border-border"
            }`}
        >
          {msg.text}
        </div>
        <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-[hsl(var(--chat-ai-bg))] border border-border text-muted-foreground">
        <Icon name="Bot" size={14} />
      </div>
      <div className="bg-[hsl(var(--chat-ai-bg))] border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 0.2, 0.4].map((delay, i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse-dot"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );
}

interface SettingsProfile {
  name: string;
  email: string;
  avatar: string;
}
interface ChatParamsType {
  model: string;
  temperature: number;
  maxTokens: number;
  language: string;
  systemPrompt: string;
}

function SettingsView({
  activeTab,
  setActiveTab,
  profile,
  setProfile,
  chatParams,
  setChatParams,
}: {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  profile: SettingsProfile;
  setProfile: (p: SettingsProfile) => void;
  chatParams: ChatParamsType;
  setChatParams: (c: ChatParamsType) => void;
}) {
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="h-14 flex items-center px-6 border-b border-border shrink-0">
        <h1 className="text-sm font-semibold">Настройки</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-6 py-8">
          <div className="flex gap-1 bg-secondary rounded-xl p-1 mb-8">
            {(["profile", "chat-params"] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all
                  ${activeTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab === "profile" ? "Профиль" : "Параметры чата"}
              </button>
            ))}
          </div>

          {activeTab === "profile" ? (
            <div className="animate-fade-in flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--chat-user-bg))] border border-primary/30 flex items-center justify-center text-xl font-bold text-primary glow-blue">
                  {profile.avatar}
                </div>
                <div>
                  <p className="text-sm font-medium">{profile.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{profile.email}</p>
                </div>
              </div>

              <SettingField
                label="Имя"
                value={profile.name}
                onChange={(v) =>
                  setProfile({ ...profile, name: v, avatar: v.slice(0, 2).toUpperCase() })
                }
              />
              <SettingField
                label="Email"
                value={profile.email}
                type="email"
                onChange={(v) => setProfile({ ...profile, email: v })}
              />
            </div>
          ) : (
            <div className="animate-fade-in flex flex-col gap-6">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Модель
                </label>
                <select
                  value={chatParams.model}
                  onChange={(e) => setChatParams({ ...chatParams, model: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
                >
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Температура — {chatParams.temperature}
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={chatParams.temperature}
                  onChange={(e) =>
                    setChatParams({ ...chatParams, temperature: parseFloat(e.target.value) })
                  }
                  className="w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Точно</span>
                  <span>Творчески</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Макс. токенов — {chatParams.maxTokens}
                </label>
                <input
                  type="range"
                  min={256}
                  max={8192}
                  step={256}
                  value={chatParams.maxTokens}
                  onChange={(e) =>
                    setChatParams({ ...chatParams, maxTokens: parseInt(e.target.value) })
                  }
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Язык ответов
                </label>
                <select
                  value={chatParams.language}
                  onChange={(e) => setChatParams({ ...chatParams, language: e.target.value })}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                  <option value="auto">Авто</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  Системный промпт
                </label>
                <textarea
                  value={chatParams.systemPrompt}
                  onChange={(e) =>
                    setChatParams({ ...chatParams, systemPrompt: e.target.value })
                  }
                  rows={4}
                  className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-all resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          <button
            onClick={save}
            className={`mt-8 w-full py-2.5 rounded-xl text-sm font-semibold transition-all
              ${saved
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-primary text-primary-foreground hover:bg-primary/90 glow-blue"
              }`}
          >
            {saved ? "Сохранено ✓" : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50 transition-all"
      />
    </div>
  );
}