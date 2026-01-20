
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  ExternalLink,
  Zap,
  Database,
  Cpu,
  Facebook,
  CheckCircle2,
  AlertCircle,
  X,
  Info,
  Eye,
  Shield,
  Activity
} from 'lucide-react';
import { AppState, LifeManualData, AspectRatio } from './types';
import { analyzePhoto } from './services/gemini';
import ScanningEffect from './components/ScanningEffect';
import html2canvas from 'html2canvas';

// 輔助函數：每 9 個字換行，確保版面整齊
const formatDescription = (text: string) => {
  if (!text) return "";
  const chars = text.split('');
  const result = [];
  for (let i = 0; i < chars.length; i += 9) {
    result.push(chars.slice(i, i + 9).join(''));
  }
  return result.join('\n');
};

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

  const labels = {
    success: '系統同步成功',
    fail: '協議執行錯誤',
    info: '系統通知'
  };

  return (
    <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 px-6 py-4 rounded-2xl border backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-8 duration-500 ${colors[type]}`}>
      <div className="shrink-0 animate-pulse">{icons[type]}</div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] font-orbitron font-black tracking-[0.3em] uppercase opacity-70">
          {labels[type]}
        </span>
        <span className="text-[12px] font-bold tracking-[0.1em] whitespace-nowrap">{message}</span>
      </div>
      <button onClick={onClose} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
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
  const [userCount, setUserCount] = useState(84291);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
      const result = await analyzePhoto(imgData);
      setData(result);
      setState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError("數據解構失敗");
      setState('IDLE');
      setToast({ message: "神經網路連結中斷，請重試", type: "fail" });
    }
  };

  const handleDownload = async () => {
    if (!resultRef.current) return;
    try {
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: '#000000',
        scale: 3, 
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `分析報告_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setToast({ message: "報告已成功下載至您的設備", type: "success" });
    } catch (err) {
      setToast({ message: "下載過程發生錯誤", type: "fail" });
    }
  };

  const reset = () => {
    setState('IDLE');
    setImage(null);
    setData(null);
  };

  const getAspectClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case '1:1': return 'aspect-square';
      case '3:4': return 'aspect-[3/4]';
      case '4:3': return 'aspect-[4/3]';
      default: return 'aspect-[3/4]';
    }
  };

  // 統一 HUD 樣式規格
  const labelText = "text-[6px] tracking-[0.6em] uppercase font-black text-slate-500 opacity-90 mb-1";
  const contentText = "text-[7.2px] tracking-[0.2em] leading-[2.6] text-slate-200 font-medium whitespace-pre-line";
  const podStyle = "bg-black/60 backdrop-blur-2xl border border-white/10 rounded-xl p-3 shadow-2xl transition-all hover:border-white/20";

  return (
    <div className="min-h-screen bg-[#010409] text-slate-300 flex flex-col items-center p-6 selection:bg-cyan-500/40 font-jetbrains">
      {/* HUD 頂部標題 */}
      <header className="w-full max-w-4xl mb-10 flex justify-between items-end border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Cpu className="text-cyan-500 w-8 h-8 animate-pulse" />
            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
          <div>
            <h1 className="text-xl font-orbitron font-black text-white tracking-[0.3em] uppercase">《還活著就算資產》人力校準計畫</h1>
            <p className="text-[9px] tracking-[0.2em] text-slate-500 font-bold uppercase mt-1">
              神經介面實驗室 // 專案資產 V2
            </p>
          </div>
        </div>
        {state === 'RESULT' && (
          <button onClick={reset} className="text-[10px] font-bold text-cyan-500 border border-cyan-500/30 px-6 py-2 rounded-full hover:bg-cyan-500/10 transition-all tracking-[0.3em] uppercase">
            重啟協議
          </button>
        )}
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center flex-grow">
        {state === 'IDLE' && (
          <div className="glass-panel w-full max-w-md p-16 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.05),transparent)] pointer-events-none" />
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-8 h-8 text-slate-500 group-hover:text-cyan-500 transition-colors" />
            </div>
            <h2 className="text-lg font-orbitron font-bold mb-3 tracking-[0.4em] uppercase text-white">上傳實驗體</h2>
            <p className="text-[10px] text-slate-500 mb-12 tracking-[0.2em] uppercase">掃描面部特徵以提取靈魂殘餘數據</p>
            
            <div className="flex gap-4 mb-12">
              {(['1:1', '3:4', '4:3'] as AspectRatio[]).map((ratio) => (
                <button key={ratio} onClick={() => setAspectRatio(ratio)} className={`px-5 py-2 rounded-lg text-[9px] border transition-all tracking-[0.2em] ${aspectRatio === ratio ? 'border-cyan-500 text-cyan-500 bg-cyan-500/5' : 'border-white/5 text-slate-600'}`}>
                  {ratio}
                </button>
              ))}
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="w-full bg-white text-black font-black py-5 rounded-2xl tracking-[0.6em] text-[10px] hover:bg-cyan-500 hover:text-white transition-all uppercase">
              啟動分析序列
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
          </div>
        )}

        {state === 'ANALYZING' && (
          <div className="w-full max-w-sm flex flex-col items-center">
            <div className={`w-full relative ${getAspectClass(aspectRatio)} rounded-[2rem] overflow-hidden border border-white/10`}>
              <img src={image!} className="w-full h-full object-cover grayscale brightness-50 opacity-40" />
              <ScanningEffect />
            </div>
            <p className="mt-12 text-[10px] font-orbitron text-cyan-500 animate-pulse tracking-[1em] uppercase">神經網路解構中...</p>
          </div>
        )}

        {state === 'RESULT' && data && image && (
          <div className="w-full flex flex-col items-center gap-12">
            {/* 主資訊圖表 */}
            <div ref={resultRef} className={`relative w-full max-w-md ${getAspectClass(aspectRatio)} rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] hud-texture`}>
              
              <img src={image} className="absolute inset-0 w-full h-full object-cover saturate-[0.9] brightness-[0.7] contrast-[1.1]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 z-10" />

              {/* 左側資訊區塊 */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-4">
                {/* 殘量分析 */}
                <div className={`${podStyle} w-[160px] border-l-4 border-l-cyan-500`}>
                  <div className={labelText}>分析值 / 殘量</div>
                  <div className="text-3xl font-orbitron font-black text-cyan-400 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]">
                    {data.score}%
                  </div>
                  <div className={contentText}>
                    {formatDescription(data.scoreMessage)}
                  </div>
                </div>

                {/* 精神解構 */}
                <div className={`${podStyle} w-[160px]`}>
                   <div className={labelText}>精神解構</div>
                   <div className="space-y-3 mt-2">
                    {data.brainContents.slice(0, 3).map((bc, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center text-[7px] font-bold text-slate-500 uppercase">
                          <span>{bc.label}</span>
                          <span className="text-cyan-400">{bc.percentage}%</span>
                        </div>
                        <div className="h-[1px] bg-white/5 w-full">
                           <div className="h-full bg-cyan-500/40" style={{ width: `${bc.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                   </div>
                </div>
              </div>

              {/* 右側生存鏈條 */}
              <div className="absolute top-4 right-4 z-20 flex flex-col gap-2.5 items-end">
                {/* 脈搏線條 */}
                <div className={`${podStyle} w-32 flex flex-col items-center py-2 border-cyan-500/20`}>
                   <Activity className="w-3 h-3 text-cyan-400 mb-1 animate-pulse" />
                   <div className="h-4 w-full px-2">
                      <svg viewBox="0 0 100 20" className="w-full h-full stroke-cyan-500/60 stroke-2 fill-none">
                         <path d="M0 10 L20 10 L25 2 L35 18 L40 10 L100 10" />
                      </svg>
                   </div>
                </div>

                {[
                  { label: "瞳孔深處", desc: "瞳孔裡僅存對於下班那份卑微的期盼", color: "orange" },
                  { label: "空洞眼神", desc: "看向螢幕的雙眼早已失去靈魂的光澤", color: "slate" },
                  { label: "頸椎僵硬", desc: "長期維持社畜姿勢導致椎間盤在尖叫", color: "red" },
                  { label: "會議超載", desc: "這場會議開了三小時內容全是廢話", color: "amber" },
                  { label: "物理排解", desc: "好想把電腦從窗戶扔出去徹底解脫", color: "rose" },
                  { label: "行政地獄", desc: "究竟誰發明了這套毫無用處的行政流程", color: "indigo" }
                ].map((item, idx) => (
                  <div key={idx} className={`${podStyle} w-36 border-l-4 border-l-${item.color}-500/60`}>
                    <div className={`${labelText} opacity-60`}>{item.label}</div>
                    <div className="text-[6.5px] tracking-[0.1em] leading-[2.2] text-slate-300 italic opacity-80">
                      {formatDescription(item.desc)}
                    </div>
                  </div>
                ))}
              </div>

              {/* 底部左側：核心規格 */}
              <div className="absolute bottom-6 left-4 z-20 w-[200px] flex flex-col gap-4">
                <div className={`${podStyle} border-l-4 border-l-slate-400`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Database className="w-3 h-3 text-cyan-400" />
                    <span className={labelText}>核心規格規格</span>
                  </div>
                  <div className="space-y-4">
                    {data.equipments.slice(0, 2).map((eq, i) => (
                      <div key={i} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-[7.5px] font-black text-white uppercase tracking-wider">{eq.name}</span>
                        <span className="text-[6.8px] text-slate-400 leading-relaxed italic">
                          {formatDescription(eq.description)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 負荷監控 */}
                <div className={`${podStyle} w-[140px]`}>
                   <div className="flex justify-between items-center mb-2">
                     <span className={labelText}>負荷監控</span>
                     <Zap className="w-2.5 h-2.5 text-cyan-400 animate-bounce" />
                   </div>
                   <div className="space-y-2.5">
                    {data.bodyStatus.slice(0, 3).map((s, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[6px] font-bold uppercase">
                          <span className="text-slate-500">{s.label}</span>
                          <span className={s.color === 'red' ? 'text-red-500' : 'text-cyan-400'}>{s.value}</span>
                        </div>
                        <div className="h-[1.5px] bg-white/5 rounded-full overflow-hidden">
                           <div className={`h-full ${s.color === 'red' ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${s.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                   </div>
                </div>
              </div>

              {/* 潛意識獨白 */}
              {data.thoughtBubbles.slice(0, 2).map((text, i) => (
                <div key={i} className={`absolute z-30 max-w-[120px] ${i === 0 ? 'top-[28%] left-4' : 'bottom-[25%] right-4'}`}>
                  <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/20 px-3 py-2 rounded-lg shadow-2xl">
                    <span className="text-[6.8px] text-slate-300 italic tracking-[0.1em] block">
                      {formatDescription(text)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 操作按鈕 */}
            <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
               <button 
                 onClick={handleDownload} 
                 className="flex-1 flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-black tracking-[0.4em] text-[10px] hover:bg-cyan-500 hover:text-white transition-all uppercase shadow-lg shadow-white/5 active:scale-95"
               >
                 <Download className="w-4 h-4" /> 下載報告
               </button>
               
               <button 
                 className="flex-1 flex items-center justify-center gap-3 py-4 border border-white/10 text-white rounded-xl font-bold tracking-[0.4em] text-[10px] hover:bg-blue-600/10 transition-all uppercase active:scale-95"
                 onClick={() => setToast({ message: "社交同步處理中...", type: "info" })}
               >
                 <Facebook className="w-4 h-4 text-blue-500" /> 社交同步
               </button>
            </div>
          </div>
        )}
      </main>

      {/* 頁尾 */}
      <footer className="mt-auto pt-16 pb-8 flex flex-col items-center gap-10 w-full max-w-4xl opacity-60">
        <div className="text-[9px] font-mono tracking-[1em] text-slate-600 uppercase">
          生命數據系統 // 校準完成
        </div>
      </footer>

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
