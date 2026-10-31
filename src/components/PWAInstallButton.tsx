import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { sound } from '../utils/audio';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    sound.playTap();
    await install();
  };

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={handleInstall}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer animate-pulse"
      >
        <Download className="w-3.5 h-3.5" />
        <span>앱 설치 (오프라인 가능)</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => {
            sound.playTap();
            setShowIOSGuide(true);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/50 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span>iOS 앱 설치 안내</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="relative w-full max-w-sm rounded-2xl bg-slate-900 border border-indigo-500/30 p-6 shadow-2xl">
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 mb-3">
                  <Smartphone className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-100">iPhone / iPad 앱 설치</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  Safari 브라우저에서 아래 단계를 따라 홈 화면에 추가하면 오프라인에서도 즐기실 수 있습니다.
                </p>
              </div>

              <div className="space-y-4 bg-slate-950/50 rounded-xl p-4 border border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">1</div>
                  <p className="text-xs text-slate-300">Safari 하단 툴바의 <strong>공유(Share)</strong> 버튼을 누릅니다.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">2</div>
                  <p className="text-xs text-slate-300">리스트를 내려 <strong>'홈 화면에 추가'</strong>를 탭합니다.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold">3</div>
                  <p className="text-xs text-slate-300">우측 상단의 <strong>'추가'</strong>를 눌러 완료합니다.</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition-colors"
              >
                알겠습니다
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
