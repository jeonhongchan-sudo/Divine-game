import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 z-[100] flex items-center gap-2 rounded-xl bg-amber-500/90 backdrop-blur-md px-4 py-2 text-xs font-bold text-slate-950 shadow-2xl border border-amber-400 animate-bounce">
      <WifiOff className="h-4 w-4" />
      <span>오프라인 모드 — 데이터가 로컬에 저장됩니다.</span>
    </div>
  );
};
