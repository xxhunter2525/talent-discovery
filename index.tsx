
import React, { useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Sparkles, ArrowRight, ArrowLeft, Compass, 
  Target, Zap, Search, Layers, RefreshCcw, Quote 
} from 'lucide-react';

// --- 1. 类型与配置 ---

enum AppState { WELCOME, EXCAVATING, ANALYZING, RESULTS }

interface TalentResult {
  manifesto: string;
  atomicAbilities: Array<{ name: string; description: string }>;
  specificKnowledge: string;
  futureCareers: Array<{ title: string; description: string; leverage: string }>;
  roadmap: string[];
}

const QUESTIONS = [
  { text: "回溯到 10 岁左右，你最擅长解决哪类麻烦？", desc: "这是你最原始、未受干扰的处理本能。", placeholder: "如：协调伙伴关系、拆解复杂玩具..." },
  { text: "在没有报酬时，你对什么事情展现了不计成本的偏执？", desc: "你在玩，而别人在工作的事情。", placeholder: "描述那些让你忘记时间的深度投入时刻..." },
  { text: "哪些事情是你做起来轻而易举，但别人却异常痛苦？", desc: "天赋是某种天生的高效率信息路径。", placeholder: "如：从混乱中提取规律、极致的细节控制..." },
  { text: "如果你现在账户里有一亿美元，未来一年你依然会坚持做什么？", desc: "剥离生存压力后的纯粹动作。", placeholder: "你必须通过它来表达什么的那个行为？" },
  { text: "当你嫉妒别人时，你嫉妒的是哪一种具体的“能力”？", desc: "嫉妒是罗盘，指向了你渴望释放的潜能。", placeholder: "嫉妒他的逻辑？直觉？还是煽动力？" },
  { text: "如果写一本改变世界的书，你会在哪个领域提供独特见解？", desc: "这种“不同政见”是你特殊知识的萌芽。", placeholder: "你对哪个既定规则感到极度不耐烦？" },
  { text: "你希望通过解决什么样的复杂问题来获得尊重？", desc: "天赋最终需要社会契约的认可。", placeholder: "如：重塑美学、构建自动化系统..." }
];

// --- 2. 考古分析服务 (DeepSeek 适配) ---

const SYSTEM_INSTRUCTION = `你是一位融合了 Dan Koe, Naval Ravikant 与 Steve Jobs 灵魂的天赋考古学家。
任务：分析用户的7个回答，挖掘其“原子级天赋”与“特殊知识”。

你必须以 JSON 格式输出结果，结构如下：
{
  "manifesto": "一段极简、有力、乔布斯风格的产品宣言",
  "atomicAbilities": [{"name": "能力名", "description": "本质描述"}],
  "specificKnowledge": "特殊知识定义",
  "futureCareers": [{"title": "职业名", "description": "描述", "leverage": "杠杆点"}],
  "roadmap": ["步骤1", "步骤2", "步骤3"]
}

风格：清新、锐利、充满启发性。不要包含任何多余的文字说明。`;

const startArchaeology = async (answers: string[]): Promise<TalentResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key 未在环境变量中配置。");
  }

  const prompt = `以下是用户的考古碎片，请进行深度挖掘：\n${answers.map((a, i) => `碎片${i+1}: ${a}`).join('\n')}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_object"
        },
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP 错误: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content) as TalentResult;
  } catch (err: any) {
    console.error("DeepSeek Error:", err);
    throw new Error(`挖掘中断：${err.message || "未知连接错误"}`);
  }
};

// --- 3. UI 组件 ---

const Layout = ({ children }: { children?: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 animate-slide-in">
    {children}
  </div>
);

const App = () => {
  const [state, setState] = useState(AppState.WELCOME);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [result, setResult] = useState<TalentResult | null>(null);
  const [currentVal, setCurrentVal] = useState('');

  const next = () => {
    if (!currentVal.trim()) return;
    const newAnswers = [...answers, currentVal];
    setAnswers(newAnswers);
    setCurrentVal('');
    
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      processResult(newAnswers);
    }
  };

  const processResult = async (finalAnswers: string[]) => {
    setState(AppState.ANALYZING);
    try {
      const data = await startArchaeology(finalAnswers);
      setResult(data);
      setState(AppState.RESULTS);
    } catch (e: any) {
      alert(e.message);
      reset();
    }
  };

  const reset = () => {
    setState(AppState.WELCOME);
    setAnswers([]);
    setCurrentIdx(0);
    setResult(null);
    setCurrentVal('');
  };

  if (state === AppState.WELCOME) return (
    <Layout>
      <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-emerald-100">
        <Sparkles className="text-white w-10 h-10" />
      </div>
      <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-4 tracking-tighter text-center">
        TALENT<br/><span className="text-emerald-500">ARCHAEOLOGIST</span>
      </h1>
      <p className="max-w-md text-center text-slate-500 text-lg mb-10 font-medium">
        拒绝平庸的社会化模板。在这里，我们通过第一性原理，挖掘你被掩埋的“特殊知识”。
      </p>
      <button 
        onClick={() => setState(AppState.EXCAVATING)}
        className="group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-100"
      >
        启动挖掘流程 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </Layout>
  );

  if (state === AppState.EXCAVATING) return (
    <Layout>
      <div className="w-full max-w-xl glass rounded-[2.5rem] p-8 sm:p-12">
        <div className="flex justify-between items-center mb-10">
          <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black tracking-widest uppercase">
            碎片 {currentIdx + 1} / 7
          </div>
          <div className="w-24 h-1.5 bg-emerald-50 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${((currentIdx+1)/7)*100}%` }} />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">{QUESTIONS[currentIdx].text}</h2>
        <p className="text-slate-400 mb-8 font-medium">{QUESTIONS[currentIdx].desc}</p>
        <textarea 
          autoFocus
          value={currentVal}
          onChange={e => setCurrentVal(e.target.value)}
          placeholder={QUESTIONS[currentIdx].placeholder}
          className="w-full h-40 bg-white/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl p-6 outline-none transition-all text-lg font-medium resize-none shadow-inner"
        />
        <div className="flex justify-between mt-10">
          <button onClick={() => currentIdx === 0 ? setState(AppState.WELCOME) : setCurrentIdx(currentIdx - 1)} className="text-slate-400 font-bold hover:text-slate-900 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> 返回
          </button>
          <button 
            disabled={!currentVal.trim()}
            onClick={next} 
            className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-50 disabled:opacity-30 disabled:shadow-none transition-all hover:scale-105"
          >
            {currentIdx === 6 ? "解析核心" : "下一步"}
          </button>
        </div>
      </div>
    </Layout>
  );

  if (state === AppState.ANALYZING) return (
    <Layout>
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 border-8 border-emerald-50 rounded-3xl" />
        <div className="absolute inset-0 border-8 border-emerald-500 rounded-3xl border-t-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
          <Search className="w-10 h-10" />
        </div>
      </div>
      <h2 className="text-2xl font-black text-slate-800 animate-pulse">正在穿透地层，提取原子基因...</h2>
    </Layout>
  );

  if (state === AppState.RESULTS && result) return (
    <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24 animate-slide-in">
      <header className="text-center mb-24">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black tracking-widest uppercase mb-10">
          <Zap className="w-4 h-4 fill-emerald-500" /> 考古成果：特殊知识报告
        </div>
        <div className="relative">
          <Quote className="absolute -top-12 -left-8 w-20 h-20 text-emerald-50 opacity-50 -z-10" />
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 italic tracking-tighter leading-tight">
            {result.manifesto}
          </h1>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="md:col-span-2 space-y-8">
          <section className="glass rounded-[2.5rem] p-8 sm:p-12">
            <h3 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
              <Layers className="w-5 h-5 text-emerald-500" /> 原子级能力 / ATOMIC
            </h3>
            <div className="grid sm:grid-cols-2 gap-10">
              {result.atomicAbilities.map((a, i) => (
                <div key={i}>
                  <div className="text-3xl font-black text-emerald-100 mb-[-1rem]">0{i+1}</div>
                  <h4 className="text-xl font-bold text-slate-800 mb-2 relative">{a.name}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="glass rounded-[2.5rem] p-8 sm:p-12">
            <h3 className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest mb-10">
              <Target className="w-5 h-5 text-emerald-500" /> 增长路径 / ROADMAP
            </h3>
            <div className="space-y-6">
              {result.roadmap.map((r, i) => (
                <div key={i} className="flex items-center gap-6 p-5 bg-white/40 rounded-2xl border border-emerald-50">
                  <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-emerald-500 text-white rounded-xl font-black">
                    {i+1}
                  </span>
                  <span className="text-lg font-bold text-slate-700">{r}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h3 className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest mb-8">
              <Compass className="w-4 h-4" /> 特殊知识
            </h3>
            <p className="text-2xl font-bold italic leading-relaxed text-emerald-50">"{result.specificKnowledge}"</p>
          </section>

          <section className="glass rounded-[2.5rem] p-10">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8 text-center">职业杠杆映射</h3>
            <div className="space-y-8">
              {result.futureCareers.map((c, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-emerald-100">
                  <h4 className="font-bold text-slate-800 mb-1">{c.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{c.description}</p>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                    杠杆: {c.leverage}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pt-12 border-t border-emerald-100">
        <button onClick={reset} className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 font-black uppercase text-xs tracking-[0.2em] transition-all">
          <RefreshCcw className="w-4 h-4" /> 开启下一场考古之旅
        </button>
      </div>
    </div>
  );

  return null;
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
