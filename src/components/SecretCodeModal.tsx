import React, { useState } from 'react';
import { Sparkles, Key, CheckCircle, AlertCircle, X, Shield, Star, Award } from 'lucide-react';
import { sound } from '../utils/audio';

interface SecretCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRedeem: (code: string) => { success: boolean; message: string; cardName?: string };
}

export const SecretCodeModal: React.FC<SecretCodeModalProps> = ({
  isOpen,
  onClose,
  onRedeem,
}) => {
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setFeedback({
        type: 'error',
        message: '시크릿 코드를 입력해 주세요.',
      });
      sound.playError();
      return;
    }

    const result = onRedeem(code.trim());
    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message,
      });
      sound.playFanfare();
      setCode('');
      // Delay closing so the user sees success and then results modal triggers
      setTimeout(() => {
        onClose();
        setFeedback({ type: null, message: '' });
      }, 1200);
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      });
      sound.playError();
    }
  };

  const handleQuickFill = (presetCode: string) => {
    setCode(presetCode);
    sound.playTap();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-purple-950/60 border border-purple-500/50 shadow-2xl shadow-purple-500/20 p-6 overflow-hidden">
        {/* Celestial background ambient aura */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-fuchsia-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-fuchsia-500 via-purple-500 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/30 mb-3">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Key className="w-7 h-7 text-fuchsia-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-300 via-purple-200 to-indigo-300 font-cinzel">
            천상의 시크릿 비전 코드
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
            비밀 암호를 입력하여 극악의 0.00000001% 확률을 가진{' '}
            <span className="text-fuchsia-300 font-bold">천상(CELESTIAL)</span> 등급 카드를
            소환하세요!
          </p>
        </div>

        {/* Reward Preview Card */}
        <div className="mb-6 rounded-xl bg-purple-950/40 border border-purple-500/40 p-3.5 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-400 to-purple-600 text-white shadow-md shadow-fuchsia-500/30">
                <Award className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 text-[10px] font-black tracking-wider rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40">
                    CELESTIAL 천상 등급
                  </span>
                  <span className="text-[11px] text-fuchsia-200/80 font-mono-num font-semibold">
                    100억분의 1 확정
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-200 mt-0.5">
                  천상성제 루미나스 / 카시오페아 / 우리엘 / 오르페우스
                </p>
              </div>
            </div>
            <Sparkles className="w-5 h-5 text-fuchsia-400 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              비전 코드 입력 (Code)
            </label>
            <div className="relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (feedback.type) setFeedback({ type: null, message: '' });
                }}
                placeholder="시크릿 코드 6자리 입력 (예: 998807)"
                className="w-full px-4 py-3 bg-slate-900/90 border border-slate-700 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-500/30 rounded-xl text-center text-lg font-mono tracking-widest text-white placeholder-slate-500 outline-none transition-all"
                autoFocus
                maxLength={20}
              />
            </div>
          </div>

          {/* Preset Helper */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>추천 시크릿 코드:</span>
            <button
              type="button"
              onClick={() => handleQuickFill('998807')}
              className="px-2.5 py-1 rounded-md bg-purple-900/50 hover:bg-purple-800/70 text-purple-200 border border-purple-500/40 font-mono font-bold transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              998807 (천상코드 자동입력)
            </button>
          </div>

          {/* Feedback messages */}
          {feedback.type === 'error' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}

          {feedback.type === 'success' && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{feedback.message}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                sound.playTap();
                onClose();
              }}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all cursor-pointer"
            >
              닫기
            </button>
            <button
              type="submit"
              className="flex-2 py-3 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>코드 등록 및 천상 소환</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
