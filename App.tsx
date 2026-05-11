
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Sparkles, Image as ImageIcon, Copy, CheckCircle2, 
  AlertCircle, BarChart3, Loader2, Clock, Map as MapIcon, 
  ArrowRightCircle, Component, Columns, Download, Newspaper,
  LayoutGrid, UserCircle, LayoutDashboard, Palette, Maximize, Settings2,
  FileSearch, Send, X, RotateCcw, ArrowLeft, GraduationCap
} from 'lucide-react';
import { 
  InfographicData, InfographicItem, GenerationStatus, 
  InfographicType, InfographicTheme, AspectRatio 
} from './types';
import { GeminiService } from './services/geminiService';

const TYPE_CONFIG = {
  [InfographicType.STATISTICAL]: { icon: BarChart3, label: 'إحصائي' },
  [InfographicType.TIMELINE]: { icon: Clock, label: 'زمني' },
  [InfographicType.GEOGRAPHICAL]: { icon: MapIcon, label: 'جغرافي' },
  [InfographicType.PROCESS]: { icon: ArrowRightCircle, label: 'عمليات' },
  [InfographicType.ANATOMY]: { icon: Component, label: 'تشريحي' },
  [InfographicType.COMPARISON]: { icon: Columns, label: 'مقارنة' },
  [InfographicType.LISTICLE]: { icon: LayoutGrid, label: 'قائمة/تبسيط' },
  [InfographicType.BIO_PROFILE]: { icon: UserCircle, label: 'سيرة ذاتية' },
  [InfographicType.DASHBOARD]: { icon: LayoutDashboard, label: 'لوحة بيانات' },
  [InfographicType.EDUCATIONAL]: { icon: GraduationCap, label: 'تعليمي' },
};

const THEME_CONFIG = {
  [InfographicTheme.DARK_MODERN]: { label: 'داكن حديث', color: 'bg-slate-900' },
  [InfographicTheme.CLEAN_WHITE]: { label: 'أبيض نظيف', color: 'bg-white text-slate-900' },
  [InfographicTheme.TECH_FUTURISTIC]: { label: 'تقني مستقبلي', color: 'bg-blue-950' },
  [InfographicTheme.RETRO_VINTAGE]: { label: 'كلاسيكي ريترو', color: 'bg-amber-50 text-amber-900' },
  [InfographicTheme.MINIMALIST]: { label: 'تبسيط مطلق', color: 'bg-zinc-100 text-zinc-900' },
  [InfographicTheme.ISOMETRIC_3D]: { label: 'ثلاثي الأبعاد', color: 'bg-indigo-900' },
};

const ASPECT_RATIOS = [
  { value: AspectRatio.SQUARE, label: 'مربع (1:1)', desc: 'Instagram' },
  { value: AspectRatio.LANDSCAPE, label: 'عرضي (16:9)', desc: 'Twitter/TV' },
  { value: AspectRatio.PORTRAIT, label: 'طولي (9:16)', desc: 'Stories/TikTok' },
];

const INITIAL_DATA: InfographicData = {
  type: InfographicType.STATISTICAL,
  theme: InfographicTheme.DARK_MODERN,
  aspectRatio: AspectRatio.PORTRAIT,
  title: 'أكبر مصدري الغاز المسال في العالم',
  imageDescription: 'ناقلة غاز طبيعي مسال ضخمة تبحر في المحيط ليلاً مع إضاءة خافتة',
  unit: 'مليار متر مكعب',
  source: 'بلومبيرغ 2024',
  brand: 'صحيفة اليوم',
  customInstructions: '',
  items: [{ id: '1', label: 'قطر', value: '83' }, { id: '2', label: 'أستراليا', value: '81' }],
};

export default function App() {
  const [data, setData] = useState<InfographicData>(INITIAL_DATA);
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [refinedPrompt, setRefinedPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Article Analysis States
  const [showArticleInput, setShowArticleInput] = useState(false);
  const [articleText, setArticleText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleItemChange = (id: string, field: keyof InfographicItem, value: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = () => {
    const newItem: InfographicItem = {
      id: Math.random().toString(36).substr(2, 9),
      label: '',
      value: ''
    };
    setData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (id: string) => {
    setData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const resetForm = () => {
    setData(INITIAL_DATA);
    setRefinedPrompt('');
    setImageUrl('');
    setError('');
  };

  const analyzeArticle = async () => {
    if (!articleText.trim()) return;
    try {
      setIsAnalyzing(true);
      setError('');
      const service = new GeminiService();
      const extractedData = await service.extractDataFromArticle(articleText);
      
      setData(prev => ({
        ...prev,
        ...extractedData as any,
        items: extractedData.items?.map((item: any) => ({
          ...item,
          id: Math.random().toString(36).substr(2, 9)
        })) || prev.items,
      }));
      
      setShowArticleInput(false);
      setArticleText('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'فشل تحليل المقال. تأكد من أن النص يحتوي على بيانات كافية.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generatePrompt = async () => {
    try {
      setStatus(GenerationStatus.GENERATING_PROMPT);
      setError('');
      const service = new GeminiService();
      const prompt = await service.refinePrompt(data);
      setRefinedPrompt(prompt);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء محاولة صياغة البرومبت. يرجى المحاولة لاحقاً.');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const generateImage = async () => {
    if (!refinedPrompt) return;
    try {
      setStatus(GenerationStatus.GENERATING_IMAGE);
      setError('');
      const service = new GeminiService();
      const url = await service.generateInfographicImage(refinedPrompt);
      setImageUrl(url);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err) {
      console.error(err);
      setError('فشل في توليد الصورة. قد يكون الضغط عالياً على النموذج أو أن البرومبت يحتوي على كلمات محظورة.');
      setStatus(GenerationStatus.ERROR);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refinedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 selection:bg-indigo-500/30">
      <div className="max-w-[1600px] mx-auto">
        
        {/* Top Branding Section */}
        <header className="mb-12 flex flex-col items-center text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium mb-6 animate-pulse">
            <Sparkles className="w-4 h-4" />
            توليد مدعوم بـ Gemini 2.5 Pro & Nano Banana
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-l from-indigo-400 via-purple-300 to-cyan-300">
            صانع الإنفوجرافيك الصحفي الذكي
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mb-10 leading-relaxed">
            حول المقالات الصحفية والبيانات الجافة إلى تحف بصرية عالمية المستوى بضغطة زر.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setShowArticleInput(true)}
              className="flex items-center gap-2 px-8 py-4 bg-indigo-600 border border-indigo-500 rounded-2xl hover:bg-indigo-500 transition-all text-white font-black shadow-lg shadow-indigo-600/20 group"
            >
              <FileSearch className="w-6 h-6 group-hover:scale-110 transition-transform" />
              استخراج البيانات من مقال
            </button>
            <button 
              onClick={resetForm}
              className="flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-700 rounded-2xl hover:border-slate-500 transition-all text-slate-300 font-bold"
            >
              <RotateCcw className="w-5 h-5" />
              إعادة تعيين المنصة
            </button>
          </div>
        </header>

        {/* Article Input Modal/Overlay */}
        {showArticleInput && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold flex items-center gap-3">
                  <Newspaper className="w-6 h-6 text-indigo-400" />
                  التحليل الصحفي الذكي
                </h3>
                <button onClick={() => setShowArticleInput(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-slate-500" />
                </button>
              </div>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                الصق المقال الصحفي هنا. سيقوم الذكاء الاصطناعي بتحليل النص، تحديد النوع الأنسب للإنفوجرافيك، استخلاص العناوين، وبناء قائمة البيانات تلقائياً.
              </p>
              <textarea 
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                className="w-full h-72 bg-slate-950/50 border border-slate-800 rounded-3xl px-6 py-5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none custom-scrollbar text-slate-300"
                placeholder="الصق نص المقال أو التقرير الصحفي هنا..."
              />
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={analyzeArticle}
                  disabled={isAnalyzing || !articleText.trim()}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin" /> جاري تفكيك المقال واستخراج البيانات...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6" /> بدء التحليل والاستخراج
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main Controls - Left Side */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Step 1: Visual Settings */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-600 rounded-2xl">
                  <Settings2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">1. الهوية البصرية</h2>
                  <p className="text-slate-500 text-sm">حدد نوع الإنفوجرافيك والنمط الفني المطلوب</p>
                </div>
              </div>

              <div className="space-y-10">
                {/* Infographic Type Grid */}
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-5 mr-1">نوع الإنفوجرافيك المختار</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {Object.entries(TYPE_CONFIG).map(([type, config]) => {
                      const Icon = config.icon;
                      const isActive = data.type === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setData({ ...data, type: type as InfographicType })}
                          className={`flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border transition-all duration-300 ${
                            isActive 
                            ? 'bg-indigo-600 border-indigo-400 shadow-xl shadow-indigo-600/20 scale-105 z-10' 
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                          }`}
                        >
                          <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{config.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Theme Selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-4 mr-1 flex items-center gap-2">
                      <Palette className="w-4 h-4 text-indigo-400" /> نمط التصميم (Theme)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(THEME_CONFIG).map(([theme, config]) => {
                        const isActive = data.theme === theme;
                        return (
                          <button
                            key={theme}
                            onClick={() => setData({ ...data, theme: theme as InfographicTheme })}
                            className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all ${
                              isActive 
                              ? 'bg-indigo-600 border-indigo-400 shadow-lg shadow-indigo-600/10' 
                              : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {config.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Aspect Ratio Selector */}
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-4 mr-1 flex items-center gap-2">
                      <Maximize className="w-4 h-4 text-indigo-400" /> الأبعاد والمنصة (Aspect Ratio)
                    </label>
                    <div className="space-y-2">
                      {ASPECT_RATIOS.map((ratio) => {
                        const isActive = data.aspectRatio === ratio.value;
                        return (
                          <button
                            key={ratio.value}
                            onClick={() => setData({ ...data, aspectRatio: ratio.value })}
                            className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                              isActive 
                              ? 'bg-indigo-600 border-indigo-400 shadow-lg' 
                              : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            <span className="font-bold">{ratio.label}</span>
                            <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                              {ratio.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2: Journalism Content */}
            <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-600 rounded-2xl">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">2. المحتوى التحريري</h2>
                  <p className="text-slate-500 text-sm">راجع وخصص البيانات المستخرجة أو أدخلها يدوياً</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">العنوان الرئيسي</label>
                    <input 
                      value={data.title}
                      onChange={(e) => setData({ ...data, title: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-lg"
                      placeholder="عنوان الإنفوجرافيك..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">وصف المشهد البصري</label>
                    <textarea 
                      value={data.imageDescription}
                      onChange={(e) => setData({ ...data, imageDescription: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-36 resize-none custom-scrollbar text-sm"
                      placeholder="صف المكون البصري الذي يعبر عن الخبر..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">الوحدة</label>
                      <input 
                        value={data.unit}
                        onChange={(e) => setData({ ...data, unit: e.target.value })}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="نسبة، رقم، تاريخ..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">الناشر/الشعار</label>
                      <input 
                        value={data.brand}
                        onChange={(e) => setData({ ...data, brand: e.target.value })}
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="اسم الجريدة"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">المصدر الرسمي</label>
                    <input 
                      value={data.source}
                      onChange={(e) => setData({ ...data, source: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="وكالة رويترز، البنك الدولي..."
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase mb-2 mr-2">تعليمات فنية خاصة</label>
                    <textarea 
                      value={data.customInstructions}
                      onChange={(e) => setData({ ...data, customInstructions: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none text-xs text-slate-400"
                      placeholder="مثلاً: استخدم درجات اللون الأحمر فقط للتحذير..."
                    />
                  </div>
                </div>
              </div>

              {/* Data Items List */}
              <div className="border-t border-slate-800 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    جدول البيانات المستخرجة
                  </h3>
                  <button 
                    onClick={addItem}
                    className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 font-bold text-sm"
                  >
                    <Plus className="w-5 h-5" />
                    إضافة حقل بيانات
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-3 custom-scrollbar">
                  {data.items.map((item, idx) => (
                    <div key={item.id} className="relative group bg-slate-800/40 border border-slate-700/50 p-5 rounded-[2rem] hover:border-indigo-500/30 transition-all shadow-sm">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="w-7 h-7 flex items-center justify-center bg-slate-700 text-[10px] font-black rounded-full text-slate-400">{idx + 1}</span>
                        <input 
                          value={item.label}
                          onChange={(e) => handleItemChange(item.id, 'label', e.target.value)}
                          placeholder="المسمى"
                          className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-200"
                        />
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          value={item.value}
                          onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
                          placeholder="القيمة"
                          className="flex-1 bg-slate-950/50 rounded-xl px-4 py-2 text-xs font-black text-indigo-400 outline-none border border-transparent focus:border-indigo-500/20"
                        />
                        <input 
                          value={item.subValue || ''}
                          onChange={(e) => handleItemChange(item.id, 'subValue', e.target.value)}
                          placeholder="تفصيل إضافي"
                          className="flex-1 bg-slate-950/50 rounded-xl px-4 py-2 text-xs font-bold text-emerald-400/80 outline-none border border-transparent focus:border-emerald-500/20"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: AI Action & Preview */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Generation Panel */}
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-950/50 text-white relative overflow-hidden group">
              <Sparkles className="absolute -top-6 -right-6 w-32 h-32 text-white/5 group-hover:rotate-12 transition-transform duration-700" />
              <h3 className="text-2xl font-black mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6" /> تفعيل محرك الذكاء
              </h3>
              <p className="text-indigo-100/70 text-sm mb-10 leading-relaxed font-medium">
                سيقوم Gemini Pro بصياغة مطالبة فنية مكثفة لنموذج Nano Banana لإنتاج الإنفوجرافيك فوراً.
              </p>
              
              <button 
                onClick={generatePrompt}
                disabled={status === GenerationStatus.GENERATING_PROMPT || status === GenerationStatus.GENERATING_IMAGE}
                className="w-full bg-white text-indigo-700 py-5 rounded-[2rem] font-black text-xl shadow-xl hover:translate-y-[-5px] hover:shadow-2xl transition-all active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
              >
                {status === GenerationStatus.GENERATING_PROMPT ? (
                  <span className="flex items-center justify-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin" /> جاري الصياغة...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    توليد البرومبت النهائي <ArrowLeft className="w-5 h-5" />
                  </span>
                )}
              </button>
            </div>

            {/* Prompt Result Output */}
            <div className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 transition-all duration-500 ${refinedPrompt ? 'opacity-100 scale-100' : 'opacity-40 scale-95 pointer-events-none'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> المطالبة الفنية الناتجة
                </h3>
                {refinedPrompt && (
                  <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-all text-xs font-black text-indigo-400"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'تم النسخ' : 'نسخ النص'}
                  </button>
                )}
              </div>
              
              <div className="bg-slate-950/50 rounded-3xl p-6 border border-slate-800 text-slate-400 text-sm italic leading-relaxed min-h-[140px] max-h-[300px] overflow-y-auto custom-scrollbar shadow-inner">
                {refinedPrompt || "بانتظار الضغط على زر التوليد..."}
              </div>

              {refinedPrompt && (
                <button 
                  onClick={generateImage}
                  disabled={status === GenerationStatus.GENERATING_IMAGE}
                  className="w-full mt-8 bg-slate-800 border-2 border-slate-700 hover:border-indigo-500 py-5 rounded-[2rem] font-black transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                >
                  {status === GenerationStatus.GENERATING_IMAGE ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin text-indigo-400" /> جاري التوليد البصري...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-indigo-400" />
                      معاينة الإنفوجرافيك المولد
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Error handling component */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-3xl flex items-start gap-4 text-red-400 animate-in slide-in-from-right duration-300">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <div className="text-sm font-medium leading-relaxed">{error}</div>
              </div>
            )}

            {/* Visual Preview Window */}
            {(imageUrl || status === GenerationStatus.GENERATING_IMAGE) && (
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-purple-400" /> معاينة التصميم النهائي
                  </h3>
                  {imageUrl && (
                    <a 
                      href={imageUrl} 
                      download={`${data.title}.png`}
                      className="p-3 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  )}
                </div>

                <div className={`relative bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden shadow-inner flex items-center justify-center transition-all duration-700 ${
                  data.aspectRatio === AspectRatio.SQUARE ? 'aspect-square' : 
                  data.aspectRatio === AspectRatio.LANDSCAPE ? 'aspect-video' : 'aspect-[9/16]'
                }`}>
                  {status === GenerationStatus.GENERATING_IMAGE && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-5">
                      <div className="relative">
                        <Loader2 className="w-14 h-14 text-indigo-500 animate-spin" />
                        <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
                      </div>
                      <p className="text-slate-400 text-xs animate-pulse-soft font-bold uppercase tracking-widest px-10 text-center leading-loose">
                        يتم الآن تحليل الأبعاد الجغرافية والبيانية ورسم الإنفوجرافيك...
                      </p>
                    </div>
                  )}
                  {imageUrl && (
                    <img 
                      src={imageUrl} 
                      alt="Journalism Infographic" 
                      className="w-full h-full object-contain animate-in fade-in duration-1000"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Global Footer */}
        <footer className="mt-32 pt-16 border-t border-slate-900 flex flex-col items-center gap-8 pb-16">
          <div className="flex flex-wrap justify-center gap-12 text-slate-500 text-xs font-black uppercase tracking-widest">
            <span className="flex items-center gap-2 hover:text-indigo-400 transition-colors cursor-default"><Newspaper className="w-4 h-4" /> JOURNALISM TECH</span>
            <span className="flex items-center gap-2 hover:text-purple-400 transition-colors cursor-default"><Palette className="w-4 h-4" /> ARTISTIC AI</span>
            <span className="flex items-center gap-2 hover:text-cyan-400 transition-colors cursor-default"><Maximize className="w-4 h-4" /> MULTI-RATIO</span>
          </div>
          <div className="text-center">
            <p className="text-slate-600 text-[11px] font-bold">
              © 2024 منصة الإنفوجرافيك الصحفي المتكاملة - صمم لخدمة غرف الأخبار الحديثة
            </p>
            <p className="text-slate-800 text-[9px] mt-3 uppercase tracking-[0.2em] font-black">
              Empowered by Google Gemini 2.5 Flash & Pro Intelligence
            </p>
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.4);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 20px;
          border: 2px solid #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
