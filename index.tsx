
import React, { useState, useCallback, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Sparkles, ArrowRight, ArrowLeft, Compass, 
  Target, Zap, Search, Layers, RefreshCcw, Quote 
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- 1. 配置与类型定义 ---

enum AppState { WELCOME, EXCAVATING, ANALYZING, RESULTS }

interface Question {
  id: number;
  text: string;
  placeholder: string;
  description: string;
}

interface TalentResult {
  manifesto: string;
  atomicAbilities: Array<{ name: string; description: string }>;
  specificKnowledge: string;
  futureCareers: Array<{ title: string; description: string; leverage: string }>;
  roadmap: string[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: "回溯到 10 岁左右，你最擅长解决哪类麻烦？",
    description: "这是你最原始、未受社交修饰的高效率处理本能。",
    placeholder: "例如：协调伙伴争端、拆解钟表机械、虚构精彩的探险故事..."
  },
  {
    id: 2,
    text: "在没有报酬的情况下，你对什么事情展现了不计成本的偏执？",
    description: "正如 Naval 所言：你在玩，而别人在工作的事情。",
    placeholder: "描述那些让你忘记时间，甚至忘记生理需求的瞬间..."
  },
  {
    id: 3,
    text: "哪些事情是你做起来轻而易举，但别人却觉得异常痛苦的？",
    description: "天赋是某种天生的高效率信息处理路径。",
    placeholder: "例如：从海量噪音中提取规律、长达数小时的枯燥打磨、极致的细节控制..."
  },
  {
    id: 4,
    text: "如果你账户里有一亿美元，未来一年你依然会坚持做哪个动作？",
    description: "剥离生存压力，寻找那个能给你带来纯粹存在感的内核。",
    placeholder: "你必须通过它来向世界表达什么的那个核心动作？"
  },
  {
    id: 5,
    text: "当你嫉妒别人时，你嫉妒的是哪一种具体的“能力”？",
    description: "嫉妒是灵魂的罗盘，指出了你最渴望被释放但尚未挖掘的潜能。",
    placeholder: "嫉妒他的煽动性？嫉妒他的逻辑严密？还是他对美的绝对直觉？"
  },
  {
    id: 6,
    text: "如果要写一本改变世界的书，你会在哪个领域提供连专家都忽略的洞察？",
    description: "这种“不同政见”通常是你特殊知识的萌芽。",
    placeholder: "你对这个世界的哪个既定规则感到极度不耐烦？"
  },
  {
    id: 7,
    text: "你希望通过解决什么样的复杂问题来获得最终的尊重？",
    description: "天赋需要社会契约的认可。你的终极战场在哪里？",
    placeholder: "例如：消除数字世界的孤独感、构建最高效的自动化系统..."
  }
];

// --- 2. AI 考古服务 ---

const SYSTEM_PROMPT = `你是一位融合了 Dan Koe, Naval Ravikant 与 Steve Jobs 灵魂的天赋考古学家。
任务：分析用户的7个回答，通过第一性原理拆解出他们的“原子级天赋”。

输出要求（JSON格式）：
1. manifesto: 一段震撼人心、攻击平庸、充满乔布斯美学的极简宣言（80字内）。
2. atomicAbilities: 3个剥离职业标签的底层原子能力（如：系统构建直觉）。
3. specificKnowledge: 对用户“特殊知识”的定义。
4. futureCareers: 3个具备数字杠杆、跨学科的未来职业。
5. roadmap: 3个具体的转型建议。

视觉调性：清新、明快、极简、高屋建瓴。`;

const performArchaeology = async (answers: string[]): Promise<TalentResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `分析这些考古碎片，提取核心特殊知识：\n${answers.map((a, i) => `碎片${i+1}: ${a}`).join('\n')}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
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

    const result = JSON.parse(response.text);
    return result as TalentResult;
  } catch (error) {
    console.error("Archaeology Error:", error);
    throw new Error("挖掘深度不足，地层过于坚硬，请稍后重试。");
  }
};

// --- 3. UI 组件库 ---

const Welcome: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center animate-in">
    <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-emerald-200 ring-8 ring-emerald-50">
      <Sparkles className="text-white w-12 h-12" />
    </div>
    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
      TALENT<br/><span className="text-emerald-500">ARCHAEOLOGIST</span>
    </h1>
    <p className="max-w-lg text-slate-500 text-lg md:text-xl mb-12 font-medium leading-relaxed">
      天赋不是一种奢侈，而是被掩埋的“特殊知识”。<br/>
      通过第一性原理，我们将挖掘出你足以撬动未来的数字杠杆。
    </p>
    <button 
      onClick={onStart}
      className="group flex items-center gap-3 px-12 py-5 bg-slate-900 text-white font-bold tracking-widest hover:bg-emerald-600 transition-all rounded-full shadow-xl hover:shadow-emerald-200 uppercase text-sm"
    >
      开启挖掘计划
      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
    </button>
  </div>
);

const QuestionStep: React.FC<{
  idx: number;
  onNext: (ans: string) => void;
  onBack: () => void;
  isLast: boolean;
}> = ({ idx, onNext, onBack, isLast }) => {
  const [val, setVal] = useState('');
  const q = QUESTIONS[idx];

  const proceed = () => { if (val.trim().length >= 3) { onNext(val); setVal(''); } };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 animate-in">
      <div className="w-full max-w-2xl glass rounded-[3rem] p-8 md:p-14">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-100">
              {idx + 1}
            </div>
            <span className="text-slate-400 font-bold text-sm tracking-widest uppercase">/ 7 碎片</span>
          </div>
          <div className="flex-1 max-w-[120px] h-1.5 bg-slate-100 rounded-full ml-4 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${((idx + 1)/7)*100}%` }} />
          </div>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">{q.text}</h2>
        <p className="text-slate-500 mb-10 font-medium text-lg leading-relaxed">{q.description}</p>

        <textarea
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={q.placeholder}
          className="w-full bg-white/50 border-2 border-slate-100 rounded-2xl p-6 text-xl h-48 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all placeholder:text-slate-300 font-medium"
        />

        <div className="mt-12 flex justify-between items-center">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-900 font-bold flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-5 h-5" /> 返回
          </button>
          <button 
            onClick={proceed}
            disabled={val.trim().length < 3}
            className={`flex items-center gap-3 px-10 py-4 rounded-full font-bold transition-all shadow-lg ${
              val.trim().length >= 3 
              ? 'bg-emerald-500 text-white hover:scale-105 shadow-emerald-100' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
            }`}
          >
            {isLast ? "解析天赋图谱" : "存入碎片"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Report: React.FC<{ data: TalentResult; onReset: () => void }> = ({ data, onReset }) => (
  <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 animate-in">
    <div className="text-center mb-24">
      <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-xs font-bold tracking-widest uppercase mb-10 shadow-sm">
        <Zap className="w-4 h-4 fill-emerald-500" /> 考古成果：特殊知识报告
      </div>
      <div className="relative inline-block">
        <Quote className="absolute -top-12 -left-12 w-24 h-24 text-emerald-100 -z-10" />
        <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-tight mb-8 italic tracking-tighter">
          {data.manifesto}
        </h1>
      </div>
      <div className="h-2 w-24 bg-emerald-500 mx-auto rounded-full mt-8" />
    </div>

    <div className="grid md:grid-cols-3 gap-8 mb-20">
      <div className="md:col-span-2 space-y-8">
        <section className="glass rounded-[3rem] p-10 md:p-14">
          <h3 className="flex items-center gap-4 text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-12">
            <Layers className="w-6 h-6 text-emerald-500" /> 原子级能力 / ATOMIC
          </h3>
          <div className="grid sm:grid-cols-2 gap-12">
            {data.atomicAbilities.map((item, i) => (
              <div key={i} className="group">
                <div className="text-5xl font-black text-emerald-50 mb-[-1.5rem] select-none transition-colors group-hover:text-emerald-100">0{i+1}</div>
                <h4 className="text-2xl font-bold text-slate-800 mb-3 relative z-10">{item.name}</h4>
                <p className="text-slate-500 leading-relaxed font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-[3rem] p-10 md:p-14">
          <h3 className="flex items-center gap-4 text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-12">
            <Target className="w-6 h-6 text-emerald-500" /> 增长路径 / ROADMAP
          </h3>
          <div className="space-y-6">
            {data.roadmap.map((step, i) => (
              <div key={i} className="flex items-center gap-6 p-6 bg-white/40 rounded-3xl hover:bg-white/80 transition-all border border-transparent hover:border-emerald-100">
                <span className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-emerald-500 text-white rounded-2xl font-black text-xl shadow-lg shadow-emerald-100">
                  {i+1}
                </span>
                <span className="text-xl font-bold text-slate-700">{step}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-8">
        <section className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          <h3 className="flex items-center gap-3 text-xs font-black text-emerald-500 uppercase tracking-widest mb-8">
            <Compass className="w-5 h-5" /> 特殊知识
          </h3>
          <p className="text-2xl leading-relaxed font-bold italic text-emerald-50">
            "{data.specificKnowledge}"
          </p>
        </section>

        <section className="glass rounded-[3rem] p-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-10 text-center">未来职业坐标</h3>
          <div className="space-y-10">
            {data.futureCareers.map((c, i) => (
              <div key={i} className="relative pl-6 border-l-2 border-emerald-100 hover:border-emerald-500 transition-colors">
                <h4 className="text-xl font-bold text-slate-800 mb-2">{c.title}</h4>
                <p className="text-sm text-slate-500 mb-4 font-medium">{c.description}</p>
                <div className="inline-flex text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-widest border border-emerald-100">
                  杠杆: {c.leverage}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>

    <div className="flex flex-col items-center gap-10 pt-16 border-t border-emerald-100">
      <button 
        onClick={onReset}
        className="group flex items-center gap-3 text-slate-400 hover:text-emerald-600 font-black transition-all uppercase tracking-[0.3em] text-xs"
      >
        <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" /> 开启新次元考古
      </button>
      <p className="text-sm text-slate-400 font-medium italic opacity-60">
        "Specific knowledge is found by following your genuine intellectual curiosity."
      </p>
    </div>
  </div>
);

// --- 4. 主程序入口 ---

const App = () => {
  const [state, setState] = useState(AppState.WELCOME);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currQ, setCurrQ] = useState(0);
  const [result, setResult] = useState<TalentResult | null>(null);

  const handleNext = async (ans: string) => {
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    if (currQ < QUESTIONS.length - 1) {
      setCurrQ(currQ + 1);
      window.scrollTo(0, 0);
    } else {
      setState(AppState.ANALYZING);
      window.scrollTo(0, 0);
      try {
        const data = await performArchaeology(newAnswers);
        setResult(data);
        setState(AppState.RESULTS);
      } catch (e: any) {
        alert(e.message);
        reset();
      }
    }
  };

  const reset = () => {
    setState(AppState.WELCOME);
    setAnswers([]);
    setCurrQ(0);
    setResult(null);
  };

  return (
    <div className="min-h-screen">
      {state === AppState.WELCOME && <Welcome onStart={() => setState(AppState.EXCAVATING)} />}
      {state === AppState.EXCAVATING && (
        <QuestionStep 
          idx={currQ} 
          onNext={handleNext} 
          onBack={() => currQ === 0 ? setState(AppState.WELCOME) : setCurrQ(currQ - 1)}
          isLast={currQ === QUESTIONS.length - 1}
        />
      )}
      {state === AppState.ANALYZING && (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center animate-in">
          <div className="relative w-32 h-32 mb-12">
            <div className="absolute inset-0 border-8 border-emerald-50 rounded-[2.5rem]" />
            <div className="absolute inset-0 border-8 border-emerald-500 rounded-[2.5rem] border-t-transparent animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-10 h-10 text-emerald-500" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-800 tracking-tight animate-pulse mb-4">正在进行地层扫描与基因提取...</p>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">第一性原理分析中</p>
        </div>
      )}
      {state === AppState.RESULTS && result && <Report data={result} onReset={reset} />}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
