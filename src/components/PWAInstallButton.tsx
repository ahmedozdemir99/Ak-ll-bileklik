import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
        <Smartphone className="w-3.5 h-3.5" />
        <span>Uygulama Yüklü</span>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-violet-500 transition active:scale-95"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>Uygulamayı İndir (PWA)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25 transition"
        >
          <Smartphone className="w-4 h-4" />
          <span>iOS'e Yükle</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-indigo-400" />
                  <span>iPhone / iPad'e Yükleme</span>
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
                <li>Safari tarayıcısının altındaki <strong className="text-indigo-400">Paylaş</strong> simgesine dokunun.</li>
                <li>Açılan menüde aşağı kaydırarak <strong className="text-indigo-400">Ana Ekrana Ekle</strong> seçeneğini seçin.</li>
                <li>Sağ üst köşeden <strong className="text-indigo-400">Ekle</strong> butonuna basarak uygulamayı telefonunuza yükleyin.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
      <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
      <span>Tarayıcı Menüsünden Yükleyin</span>
    </div>
  );
};
