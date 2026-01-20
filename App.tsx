
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  ExternalLink,
  Zap,
  MessageSquare,
  Database,
  Cpu,
  Facebook,
  CheckCircle2,
  Loader2,
  AlertCircle,
  X,
  Info,
  Check
} from 'lucide-react';
import { AppState, LifeManualData, AspectRatio } from './types';
import { analyzePhoto } from './services/gemini';
import ScanningEffect from './components/ScanningEffect';
import html2canvas from 'html2canvas';

// Toast Component for high-tech feedback
const HudToast: React.FC<{ 
  message: string; 
  type: 'success' | 'fail' | 'info'; 
  onClose: () => void 
}> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-green-500/50 text-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]',
    fail: 'border-red-500/50 text-red-400 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]',
    info: 'border-blue-500/50 text-blue-400 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4" />,
    fail: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />
  };

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 ${colors[type]}`}>
      <div className="shrink-0 animate-pulse">{icons[type]}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-orbitron font-black tracking-[0.3em] uppercase opacity-70">
          {type === 'success' ? 'SYSTEM_SYNC_OK' : type === 'fail' ? 'PROTOCOL_ERROR' : 'SYSTEM_NOTICE'}
        </span>
        <span className="text-[12px] font-bold tracking-[0.1em] whitespace-nowrap">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      {/* Progress bar effect */}
      <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/20 overflow-hidden rounded-full">
        <div className={`h-full animate-[progress_4s_linear] ${type === 'success' ? 'bg-green-500' : type === 'fail' ? 'bg-red-500' : 'bg-blue-500'}`} />
      </div>
      <style>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('IDLE');
  const [image, setImage] = useState<string | null>(null);
  const [data, setData] = useState<LifeManualData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
  const [shareStatus, setShareStatus] = useState<'idle' | 'processing' | 'success' | 'fail'>('idle');
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'fail' | 'info' } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        triggerAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAnalysis = async (imgData: string) => {
    setState('ANALYZING');
    setError(null);
    try {
      const [result] = await Promise.all([
        analyzePhoto(imgData),
        new Promise(resolve => setTimeout(resolve, 1500))
      ]);
      setData(result);
      setState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError("連線失效：數據頻譜異常");
      setState('IDLE');
      setToast({ message: "神經網路連結中斷，請重新嘗試", type: "fail" });
    }
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#000000',
        scale: 4, 
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `Spec_Report_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setToast({ message: "分析報告已導出至本地存儲", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "導出失敗：渲染引擎異常", type: "fail" });
    }
  };

  const handleShare = async () => {
    if (!resultRef.current || shareStatus === 'processing') return;
    
    setShareStatus('processing');
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;

    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        useCORS: true,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          setShareStatus('fail');
          setToast({ message: "核心封包生成失敗", type: "fail" });
          return;
        }
        
        const file = new File([blob], 'life-report.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: '《還活著就算資產》人力校準報告',
              text: '我的靈魂殘餘量分析報告已生成，快來看看你的剩餘價值。',
              files: [file],
            });
            setShareStatus('success');
            setToast({ message: "協議發送成功：數據已同步", type: "success" });
            setTimeout(() => setShareStatus('idle'), 3000);
            return;
          } catch (e) {
            console.log('Share aborted');
            setShareStatus('idle');
          }
        }

        if (navigator.clipboard && window.ClipboardItem) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            setShareStatus('success');
            setToast({ message: "圖片已複製！請在 FB 直接貼上分享", type: "success" });
            window.open(fbShareUrl, '_blank');
            setTimeout(() => setShareStatus('idle'), 3000);
            return;
          } catch (e) {
            console.error('Clipboard failed', e);
          }
        }

        setShareStatus('fail');
        window.open(fbShareUrl, '_blank');
        setToast({ message: "環境限制：建議先下載圖片後上傳", type: "info" });
        setTimeout(() => setShareStatus('idle'), 3000);
      });
    } catch (err) {
      setShareStatus('fail');
      setToast({ message: "同步失敗：外部連線逾時", type: "fail" });
      setTimeout(() => setShareStatus('idle'), 3000);
    }
  };

  const reset = () => {
    setState('IDLE');
    setImage(null);
    setData(null);
    setError(null);
    setShareStatus('idle');
  };

  const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '3:4': return 'aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-[3/4]';
    }
  };

  const labelText = "text-[6px] tracking-[0.55em] uppercase font-bold text-slate-400 opacity-80";
  const descText = "text-[7px] tracking-[0.12em] leading-[1.9] text-slate-300 font-medium";
  const podStyle = "bg-black/95 backdrop-blur-3xl border border-white/10 rounded-xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.85)] transition-all hover:border-white/20";

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 flex flex-col items-center p-6 md:p-12 selection:bg-orange-500/40 font-jetbrains">
      {/* HUD Header */}
      <header className="w-full max-w-4xl mb-12 flex justify-between items-center border-b border-white/5 pb-10">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Cpu className="text-orange-500 w-8 h-8 animate-pulse" />
            <div className="absolute inset-0 bg-orange-500 blur-2xl opacity-40" />
          </div>
          <div>
            <h1 className="text-2xl font-orbitron font-black text-white tracking-[0.8em] uppercase">LifeSpec.v2</h1>
            <p className="text-[10px] tracking-[0.45em] text-orange-500/80 font-bold mt-1 uppercase">《還活著就算資產》人力校準計畫</p>
          </div>
        </div>
        {state === 'RESULT' && (
          <button onClick={reset} className="group relative text-[10px] font-bold text-orange-500 border border-orange-500/30 px-8 py-3 rounded-full hover:bg-orange-500/10 transition-all tracking-[0.4em] uppercase overflow-hidden">
            <span className="relative z-10">重啟協議</span>
            <div className="absolute inset-0 bg-orange-500/5 translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        )}
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center flex-grow">
        {state === 'IDLE' && (
          <div className="glass-panel w-full max-w-md p-14 rounded-[3rem] border border-white/5 flex flex-col items-center text-center shadow-inner relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-30" />
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10 hover:border-orange-500/40 transition-all cursor-pointer group shadow-2xl" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-9 h-9 text-slate-600 group-hover:text-orange-500 transition-colors group-hover:scale-110 duration-500" />
            </div>
            <h2 className="text-xl font-bold mb-4 tracking-[0.6em] uppercase text-white">上傳實驗體</h2>
            <p className="text-[10px] text-slate-500 mb-12 tracking-[0.3em] uppercase opacity-70">請掃描目標面部以提取殘餘靈魂數據</p>
            <div className="flex gap-4 mb-14">
              {(['1:1', '3:4', '4:3'] as AspectRatio[]).map((ratio) => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-6 py-3 rounded-xl text-[10px] border transition-all tracking-[0.3em] ${aspectRatio === ratio ? 'border-orange-500 text-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.2)]' : 'border-white/5 text-slate-600 hover:border-white/20'}`}>
                  {ratio}
                </button>
              ))}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-black font-black py-6 rounded-2xl tracking-[0.8em] text-[11px] hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.5)] uppercase">
              數據導入
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        )}

        {state === 'ANALYZING' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className={`w-full relative ${getAspectClass(aspectRatio)} rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)]`}>
              <img src={image!} className="w-full h-full object-cover grayscale brightness-50 opacity-40 scale-105" />
              <ScanningEffect />
            </div>
            <div className="mt-14 space-y-4 flex flex-col items-center text-center">
              <p className="text-[9px] font-orbitron text-orange-500 animate-pulse font-black tracking-[1.5em] uppercase">深度神經網路分析中...</p>
              <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
              <p className="text-[7px] text-slate-600 tracking-[0.5em] uppercase">正在解構核心社會性殘骸</p>
            </div>
          </div>
        )}

        {state === 'RESULT' && data && image && (
          <div className="w-full flex flex-col items-center gap-14">
            {/* Infographic Dashboard */}
            <div ref={resultRef} className={`relative w-full max-w-md ${getAspectClass(aspectRatio)} rounded-[3.5rem] overflow-hidden bg-black select-none border border-white/10 shadow-[0_0_150px_rgba(0,0,0,0.95)]`}>
              
              <img src={image} className="absolute inset-0 w-full h-full object-cover saturate-[1.1] brightness-[0.7] contrast-[1.15]" />
              
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.95)_130%)] z-10" />

              <div className="absolute top-10 left-10 w-6 h-6 border-t border-l border-white/30 z-10" />
              <div className="absolute top-10 right-10 w-6 h-6 border-t border-r border-white/30 z-10" />
              <div className="absolute bottom-10 left-10 w-6 h-6 border-b border-l border-white/30 z-10" />
              <div className="absolute bottom-10 right-10 w-6 h-6 border-b border-r border-white/30 z-10" />

              <div className={`absolute top-2 left-2 z-20 w-40 ${podStyle}`}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className={labelText}>分析值 / 殘量</span>
                  <span className="text-2xl font-orbitron font-black text-orange-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]">{data.score}%</span>
                </div>
                <div className={`${descText} border-t border-white/5 pt-2`}>
                  {data.scoreMessage}
                </div>
              </div>

              <div className={`absolute top-2 right-2 z-20 w-32 ${podStyle} border-cyan-500/20`}>
                 <div className={`${labelText} text-cyan-400 mb-2 block border-b border-cyan-500/10 pb-1`}>系統脈搏</div>
                 <div className="h-4 w-full flex items-center justify-center">
                    <svg viewBox="0 0 100 50" className="w-full h-full stroke-cyan-500 stroke-[2] fill-none">
                       <path d="M 0 35 Q 10 -5, 20 45 T 40 -5 T 60 45 T 100 35" className="animate-pulse" />
                    </svg>
                 </div>
              </div>

              <div className={`absolute top-[42%] left-2 z-20 w-32 ${podStyle} border-cyan-500/10`}>
                 <div className={`${labelText} text-cyan-400 mb-3 text-center`}>精神解構</div>
                 <div className="relative w-12 h-12 mx-auto mb-3">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="24" cy="24" r="22" fill="transparent" stroke="rgba(34,211,238,0.1)" strokeWidth="1" />
                      <circle cx="24" cy="24" r="22" fill="transparent" stroke="#22d3ee" strokeWidth="2" strokeDasharray="138" strokeDashoffset={138 - (138 * (data.brainContents[0]?.percentage / 100 || 0.6))} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
                    </svg>
                 </div>
                 <div className="space-y-2">
                    {data.brainContents.slice(0, 3).map((bc, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-[6px] tracking-[0.2em] font-bold text-slate-500 uppercase">{bc.label}</span>
                        <span className="text-[7px] font-black text-cyan-400">{bc.percentage}%</span>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="absolute top-[42%] right-2 z-20 flex flex-col gap-4 items-end">
                {data.callouts.slice(0, 3).map((call, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <div className="bg-black/95 border-r-4 border-orange-500/80 p-2.5 rounded-l-2xl shadow-2xl text-right max-w-[130px] transform group-hover:-translate-x-1 transition-transform">
                      <span className={`${labelText} text-white block mb-0.5`}>{call.title}</span>
                      <span className={`${descText} block italic leading-tight text-[6.5px] opacity-80`}>{call.desc}</span>
                    </div>
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_15px_#f97316] animate-pulse shrink-0" />
                  </div>
                ))}
              </div>

              <div className={`absolute bottom-2 left-2 z-20 w-44 ${podStyle} border-cyan-500/10`}>
                <div className={`${labelText} text-cyan-400 mb-3 border-b border-cyan-500/10 pb-1 flex justify-between`}>
                  <span>生理負荷</span>
                  <Zap className="w-2.5 h-2.5 animate-bounce" />
                </div>
                <div className="space-y-3">
                  {data.bodyStatus.slice(0, 3).map((status, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[6.5px] text-slate-400 tracking-[0.3em] font-bold">{status.label}</span>
                        <span className={`text-[6.5px] font-black ${status.color === 'red' ? 'text-red-500' : 'text-cyan-400'}`}>{status.value}</span>
                      </div>
                      <div className="w-full h-[1.5px] bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${status.color === 'red' ? 'bg-red-500 shadow-[0_0_5px_red]' : 'bg-cyan-500 shadow-[0_0_5px_cyan]'}`} style={{ width: `${status.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`absolute bottom-2 right-2 z-20 w-52 ${podStyle} border-cyan-500/10`}>
                <div className={`${labelText} text-cyan-400 mb-3 flex items-center gap-2`}>
                  <Database className="w-2.5 h-2.5" /> 核心裝備規格
                </div>
                <div className="space-y-3">
                  {data.equipments.slice(0, 3).map((eq, i) => (
                    <div key={i} className="flex flex-col border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <span className="text-[7px] text-white tracking-[0.45em] font-black mb-1 uppercase">{eq.name}</span>
                      <span className={`${descText} italic leading-snug opacity-80 text-[6.5px]`}>{eq.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {data.thoughtBubbles.slice(0, 2).map((text, i) => (
                <div key={i} className={`absolute z-30 max-w-[130px] ${i === 0 ? 'top-[22%] left-6' : 'bottom-[28%] right-6'}`}>
                  <div className="bg-black/80 backdrop-blur-3xl border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border-l-4 border-l-orange-500/50">
                    <MessageSquare className="w-3 h-3 text-orange-500/40 shrink-0" />
                    <span className="text-[6.5px] text-slate-200 tracking-[0.1em] font-medium leading-relaxed italic">{text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Post-Result Actions */}
            <div className="flex flex-col md:flex-row gap-6 justify-center w-full max-w-md">
               <button 
                 onClick={handleDownload} 
                 disabled={shareStatus === 'processing'}
                 className="flex-1 flex items-center justify-center gap-4 px-8 py-5 bg-white text-black rounded-3xl font-black tracking-[0.6em] text-[11px] hover:bg-orange-500 hover:text-white transition-all shadow-2xl active:scale-95 uppercase group disabled:opacity-50"
               >
                 <Download className="w-5 h-5 group-hover:bounce" /> 輸出報告
               </button>
               
               <button 
                 onClick={handleShare} 
                 disabled={shareStatus === 'processing'}
                 className={`flex-1 flex items-center justify-center gap-4 px-8 py-5 border border-white/10 text-white rounded-3xl font-black tracking-[0.6em] text-[11px] transition-all active:scale-95 uppercase relative overflow-hidden group disabled:opacity-50 ${shareStatus === 'processing' ? 'bg-blue-900/20' : 'hover:bg-blue-600/10'}`}
               >
                 {shareStatus === 'processing' ? (
                   <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                 ) : shareStatus === 'success' ? (
                   <CheckCircle2 className="w-5 h-5 text-green-500" />
                 ) : shareStatus === 'fail' ? (
                   <AlertCircle className="w-5 h-5 text-red-500" />
                 ) : (
                   <Facebook className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                 )}
                 <span className="relative z-10">
                   {shareStatus === 'processing' ? '核心傳輸中' : 
                    shareStatus === 'success' ? '傳輸已完成' : 
                    shareStatus === 'fail' ? '請重試' : '分享至 FB'}
                 </span>
                 
                 {shareStatus === 'success' && (
                   <div className="absolute inset-0 bg-green-600/20 animate-pulse" />
                 )}
               </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-20 flex flex-col items-center gap-12 w-full max-w-4xl border-t border-white/5">
        <div className="glass-panel p-14 rounded-[3.5rem] border border-white/5 w-full max-w-xl text-center shadow-3xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-orange-500/15 via-transparent to-cyan-500/15 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           <h4 className="text-orange-500 font-orbitron text-[13px] mb-6 font-black tracking-[0.6em] uppercase whitespace-nowrap">NEURAL INTERFACE LAB</h4>
           <a href="https://ai-assistant-workshop-registration-268131299876.us-west1.run.app/" target="_blank" rel="noopener noreferrer" className="relative z-10 inline-flex items-center gap-6 px-16 py-6 bg-white text-black rounded-2xl font-black tracking-[0.7em] text-[10px] uppercase hover:bg-orange-500 hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95">
             升級您的核心模組 <ExternalLink className="w-4 h-4" />
           </a>
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="text-[10px] font-mono text-slate-700 tracking-[1.8em] uppercase opacity-40 font-bold">
            © 2024 NEURAL-LIFE SYSTEMS // PERIPHERAL_SYNC_COMPLETED
          </div>
          <div className="flex gap-4 opacity-20 text-[8px] tracking-[0.4em] text-slate-500 font-mono">
             <span>SECURE_DATA_NODE: 0xFF-291</span>
             <span>LINK_STABILITY: 99.9%</span>
          </div>
        </div>
      </footer>

      {/* Global Toast */}
      {toast && (
        <HudToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;
