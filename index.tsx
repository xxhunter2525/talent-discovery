
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Compass, 
  Target, 
  Zap, 
  Search, 
  Layers, 
  RefreshCcw,
  User,
  Quote
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types & Constants ---

enum AppState {
  WELCOME,
  EXCAVATING,
  ANALYZING,
  RESULTS
}

interface Question {
  id: number;
  text: string;
  placeholder: string;
  description: string;
}

interface TalentResult {
  manifesto: string;
  atomicAbilities: Array<{
    name: string;
    description: string;
  }>;
  specificKnowledge: string;
  futureCareers: Array<{
    title: string;
    description: string;
    leverage: string;
  }>;
  roadmap: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "回溯到 10 岁左右，你最擅长解决哪类麻烦？",
    description: "这是你最原始、未受干扰的高效率处理本能。",
    placeholder: "例如：协调伙伴关系、拆解复杂零件、虚构引人入胜的故事..."
  },
  {
    id: 2,
    text: "在没有报酬时，你对什么事情展现了不计成本的偏执？",
    description: "这就是 Naval 所说的：你在玩，而别人在工作的事情。",
    placeholder: "描述那些让你进入深度心流，忘记时间与外界的时刻..."
  },
  {
    id: 3,
    text: "哪些事情是你做起来轻而易举，但别人却觉得异常痛苦？",
    description: "天赋是某种极高效率的信息处理路径。",
    placeholder: "例如：从混乱中提取规律、长达数小时的细节打磨..."
  },
  {
    id: 4,
    text: "如果你账户里有一亿美元，未来一年你依然会坚持做什么？",
    description: "剥离生存压力后的纯粹价值动作。",
    placeholder: "你必须通过它来向世界表达什么的那个核心行为？"
  },
  {
    id: 5,
    text: "当你嫉妒别人时，你嫉妒的是哪一种具体的“能力”？",
    description: "嫉妒是灵魂的罗盘，指出了你最渴望被释放的潜能。",
    placeholder: "嫉妒他的逻辑严密性？对色彩的直觉？还是对人性的煽动力？"
  },
  {
    id: 6,
    text: "如果写一本改变世界的书，你会在哪个领域提供独特的洞察？",
    description: "这种“不同政见”通常是你特殊知识的萌芽。",
    placeholder: "你对这个世界的哪个既定规则感到极度不耐烦？"
  },
  {
    id: 7,
    text: "你希望通过解决什么样的复杂问题来获得最终的尊重？",
    description: "天赋需要社会契约的认可。你的战场在哪？",
    placeholder: "例如：消除数字世界的孤独感、构建极简的生产力系统..."
  }
];

const SYSTEM_INSTRUCTION = `你是一位融合了 Dan Koe, Naval Ravikant 与 Steve Jobs 灵魂的天赋考古学家。
任务：分析用户的7个回答，通过第一性原理拆解出他们的“原子级天赋”。

输出要求：
1. manifesto: 一段震撼人心、具备乔布斯美学、极简有力的产品宣言（100字内）。
2. atomicAbilities: 3个剥离行业术语、直击本质的底层原子能力。
3. specificKnowledge: 对用户“特殊知识”的深层定义。
4. futureCareers: 3个具备数字杠杆、非传统的未来职业。
5. roadmap: 3个极其具体的行动建议。

审美：极简、高屋建瓴、清新、充满启发感。`;

// --- Services ---

const analyzeTalent = async (answers: string[]): Promise<TalentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `分析这些考古碎片，挖掘核心天赋：\n${answers.map((a, i) => `Q${i+1}: ${a}`).join('\n')}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            manifesto: { type: Type.STRING },
            atomicAbilities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["name", "description"]
              }
            },
            specificKnowledge: { type: Type.STRING },
            futureCareers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  leverage: { type: Type.STRING }
                },
                required: ["title", "description", "leverage"]
              }
            },
            roadmap: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["manifesto", "atomicAbilities", "specificKnowledge", "futureCareers", "roadmap"]
        }
      }
    });

    return JSON.parse(response.text || '{}') as TalentResult;
  } catch (error) {
    console.error(error);
    throw new Error("挖掘深度不足，请刷新页面重试。");
  }
};

// --- Components ---

const WelcomeView: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-slide-up">
    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-emerald-200">
      <Sparkles className="text-white w-10 h-10" />
    </div>
    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-slate-900 to-slate-500 bg-clip-text text-transparent">
      天赋考古学家
    </h1>
    <p className="max-w-xl text-slate-500 text-lg md:text-xl mb-12 font-medium leading-relaxed">
      天赋不是一种奢侈，而是一种被掩埋的<span className="text-emerald-600">特殊知识</span>。<br/>
      通过第一性原理，我们将从你的潜意识中，挖掘出足以支撑你未来的数字杠杆。
    </p>
    <button 
      onClick={onStart}
      className="group relative flex items-center gap-3 px-10 py-5 bg-slate-900 text-white font-bold tracking-wide hover:bg-emerald-600 transition-all rounded-full shadow-xl hover:shadow-emerald-200"
    >
      启动挖掘流程
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
    <div className="mt-16 flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
      <span>Dan Koe Philosophy</span>
      <span>•</span>
      <span>Naval Leverage</span>
      <span>•</span>
      <span>Jobs Aesthetic</span>
    </div>
  </div>
);

const QuestionView: React.FC<{
  questionIdx: number;
  onNext: (answer: string) => void;
  onBack: () => void;
  isLast: boolean;
}> = ({ questionIdx, onNext, onBack, isLast }) => {
  const [answer, setAnswer] = useState('');
  const question = QUESTIONS[questionIdx];

  const handleNext = () => {
    if (answer.trim().length < 3) return;
    onNext(answer);
    setAnswer('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-slide-up">
      <div className="w-full max-w-2xl glass-card rounded-3xl p-8 md:p-12">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-lg text-sm">
              碎片 {questionIdx + 1}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-400 font-medium">7</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
              style={{ width: `${((questionIdx + 1) / 7) * 100}%` }}
            />
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-800 leading-tight">
          {question.text}
        </h2>
        <p className="text-slate-500 mb-8 font-medium">
          {question.description}
        </p>

        <textarea
          autoFocus
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder={question.placeholder}
          className="w-full bg-white/50 border border-slate-200 rounded-2xl p-6 text-lg md:text-xl resize-none h-48 focus:outline-none input-focus transition-all"
        />

        <div className="mt-10 flex justify-between items-center">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回
          </button>
          <button 
            onClick={handleNext}
            disabled={answer.trim().length < 3}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all ${
              answer.trim().length >= 3 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-100' 
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isLast ? "挖掘深层核心" : "继续挖掘"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const LoadingView: React.FC = () => {
  const messages = [
    "正在提取考古碎片中的第一性原理...",
    "分析原子级能力的底层结构...",
    "寻找与 Naval 稀缺职业坐标的映射...",
    "构建基于 Jobs 美学的产品宣言...",
    "正在完成最后的考古复原..."
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messages.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-slide-up">
      <div className="relative w-24 h-24 mb-10">
        <div className="absolute inset-0 border-4 border-emerald-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Search className="w-8 h-8 text-emerald-500" />
        </div>
      </div>
      <p className="text-xl font-bold text-slate-800 tracking-tight animate-pulse">
        {messages[msgIdx]}
      </p>
      <p className="mt-4 text-slate-400 font-medium">挖掘正在深入地层...</p>
    </div>
  );
};

const ResultView: React.FC<{ result: TalentResult; onReset: () => void }> = ({ result, onReset }) => (
  <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 animate-slide-up">
    <div className="text-center mb-20">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold tracking-widest uppercase mb-8 shadow-sm">
        <Zap className="w-3 h-3 fill-emerald-500" /> 考古成果：特殊知识报告
      </div>
      <div className="relative max-w-3xl mx-auto">
        <Quote className="absolute -top-10 -left-10 w-20 h-20 text-slate-100 -z-10" />
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-8 italic">
          {result.manifesto}
        </h1>
      </div>
      <div className="h-1.5 w-24 bg-emerald-500 mx-auto rounded-full" />
    </div>

    <div className="grid md:grid-cols-3 gap-8 mb-20">
      <div className="md:col-span-2 space-y-8">
        <section className="glass-card rounded-3xl p-8 md:p-10">
          <h3 className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            <Layers className="w-5 h-5 text-emerald-500" /> 原子级能力 / ATOMIC ABILITIES
          </h3>
          <div className="grid sm:grid-cols-2 gap-10">
            {result.atomicAbilities.map((ability, i) => (
              <div key={i} className="relative">
                <div className="text-4xl font-black text-slate-50 mb-[-1.5rem] select-none">0{i+1}</div>
                <h4 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{ability.name}</h4>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{ability.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card rounded-3xl p-8 md:p-10">
          <h3 className="flex items-center gap-3 text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">
            <Target className="w-5 h-5 text-emerald-500" /> 行动路径 / ROADMAP
          </h3>
          <div className="space-y-6">
            {result.roadmap.map((step, i) => (
              <div key={i} className="flex items-center gap-5 p-4 bg-white/50 rounded-2xl hover:translate-x-1 transition-transform border border-slate-50">
                <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-100">
                  {i+1}
                </span>
                <span className="text-lg font-bold text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-2xl">
          <h3 className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
            <Compass className="w-4 h-4 text-emerald-400" /> 特殊知识定义
          </h3>
          <p className="text-xl leading-relaxed font-semibold italic text-emerald-50">
            "{result.specificKnowledge}"
          </p>
        </section>

        <section className="glass-card rounded-3xl p-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">未来职业杠杆</h3>
          <div className="space-y-6">
            {result.futureCareers.map((career, i) => (
              <div key={i} className="group cursor-default">
                <h4 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors mb-1">{career.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{career.description}</p>
                <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 inline-block px-2 py-0.5 rounded uppercase tracking-wider">
                  Leverage: {career.leverage}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>

    <div className="flex flex-col items-center gap-8 pt-10 border-t border-slate-100">
      <button 
        onClick={onReset}
        className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-bold transition-all uppercase tracking-widest text-xs"
      >
        <RefreshCcw className="w-4 h-4" /> 开启下一场考古之旅
      </button>
      <div className="text-center">
        <p className="text-xs text-slate-300 font-medium italic">
          "Specific knowledge is found by much more like a natural pursuit." — Naval Ravikant
        </p>
      </div>
    </div>
  </div>
);

// --- Main App ---

function App() {
  const [state, setState] = useState<AppState>(AppState.WELCOME);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState<TalentResult | null>(null);

  const startExcavation = () => setState(AppState.EXCAVATING);

  const handleNext = useCallback(async (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setState(AppState.ANALYZING);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const data = await analyzeTalent(newAnswers);
        setResult(data);
        setState(AppState.RESULTS);
      } catch (err: any) {
        alert(err.message || "分析中断，请刷新重试。");
        reset();
      }
    }
  }, [answers, currentQ]);

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setAnswers(answers.slice(0, -1));
    } else {
      setState(AppState.WELCOME);
    }
  };

  const reset = () => {
    setState(AppState.WELCOME);
    setAnswers([]);
    setCurrentQ(0);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="selection:bg-emerald-100 selection:text-emerald-900">
      {state === AppState.WELCOME && <WelcomeView onStart={startExcavation} />}
      {state === AppState.EXCAVATING && (
        <QuestionView 
          questionIdx={currentQ} 
          onNext={handleNext} 
          onBack={handleBack}
          isLast={currentQ === QUESTIONS.length - 1}
        />
      )}
      {state === AppState.ANALYZING && <LoadingView />}
      {state === AppState.RESULTS && result && <ResultView result={result} onReset={reset} />}
      
      {/* Branding Footer for all screens */}
      {state !== AppState.RESULTS && (
        <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none opacity-20 hidden md:block">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">
            Digital Transformation • Talent Archeology • System Aesthetics
          </p>
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
