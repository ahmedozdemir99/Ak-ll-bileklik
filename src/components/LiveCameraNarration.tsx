import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Volume2, VolumeX, Sparkles, Sliders, CheckCircle2, AlertTriangle, Headphones, RefreshCw } from 'lucide-react';

export const LiveCameraNarration: React.FC = () => {
  const [selectedAngle, setSelectedAngle] = useState<'0' | '15' | '30'>('15');
  const [selectedDistance, setSelectedDistance] = useState<'1' | '1.5' | '2' | '3'>('1.5');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [narrationResult, setNarrationResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tarayıcınız kamera erişimini desteklemiyor.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      setImageBase64(null);

      // Wait a tick for video element to mount
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((e) => console.log('Auto-play prevented:', e));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Kamera açılamadı. Lütfen tarayıcı izinlerini kontrol edin veya hazır sahnelerden birini seçin.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const captureAndAnalyze = async () => {
    let base64 = imageBase64;

    if (cameraActive && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        base64 = canvas.toDataURL('image/jpeg', 0.85);
        setImageBase64(base64);
      }
    }

    if (!base64) {
      setError('Lütfen önce kamerayı açın veya bir görsel yükleyin.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/describe-environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          angle: selectedAngle,
          distance: selectedDistance,
          customPrompt: `Önümdeki çevreyi görme engelli bir kullanıcı için Bluetooth kulaklıktan dinlenecek şekilde, nesneleri ve mesafeleri (${selectedDistance}m) belirterek Türkçe ve net bir cümleyle tarif et.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNarrationResult(data.narration);
        speakText(data.narration);
      } else {
        setError(data.error || 'Tarif oluşturulurken bir hata oluştu.');
      }
    } catch (err: any) {
      console.error('API call error:', err);
      setError('Sunucu bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      if (cameraActive) stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'tr-TR';
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const trVoice = voices.find((v) => v.lang.includes('tr') || v.lang.includes('TR'));
    if (trVoice) utterance.voice = trVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const loadPreset = (type: 'room' | 'door' | 'stairs' | 'chair') => {
    if (cameraActive) stopCamera();
    const maps = {
      room: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#1e293b"/><text x="300" y="200" fill="#fff" font-size="20" text-anchor="middle">Oturma Odası ve Sehpa (1.5m)</text></svg>`,
      door: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#0f172a"/><text x="300" y="200" fill="#38bdf8" font-size="20" text-anchor="middle">Açık Kapı ve Koridor (2m)</text></svg>`,
      stairs: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#334155"/><text x="300" y="200" fill="#facc15" font-size="20" text-anchor="middle">Dikkat: İniş Basamakları (1m)</text></svg>`,
      chair: `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#475569"/><text x="300" y="200" fill="#a5b4fc" font-size="20" text-anchor="middle">Sandalye ve Masa (1.5m)</text></svg>`,
    };
    const b64 = `data:image/svg+xml;base64,${btoa(maps[type])}`;
    setImageBase64(b64);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      
      {/* Compact Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <span>Gözüm Kulağımda Asistanı</span>
          </h2>
          <p className="text-xs text-slate-400">Kolye kameradan Bluetooth kulaklığa sesli çevre tarifi</p>
        </div>

        <div className="flex items-center gap-2">
          {cameraActive ? (
            <button onClick={stopCamera} className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 text-xs font-bold border border-rose-500/30">
              Kamerayı Kapat
            </button>
          ) : (
            <button onClick={startCamera} className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 shadow-md">
              Kamerayı Aç
            </button>
          )}

          <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold cursor-pointer hover:bg-slate-700 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Fotoğraf Yükle</span>
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Compact Settings & Viewfinder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Settings Column */}
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Kamera Açısı</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['0', '15', '30'] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAngle(a)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedAngle === a ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {a}°
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Test Mesafesi</label>
            <div className="grid grid-cols-4 gap-1.5">
              {(['1', '1.5', '2', '3'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDistance(d)}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                    selectedDistance === d ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                  }`}
                >
                  {d}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-xs font-bold text-slate-400">Hazır Test Sahneleri</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button onClick={() => loadPreset('room')} className="p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 hover:bg-slate-800 text-left">🛋️ Oda</button>
              <button onClick={() => loadPreset('door')} className="p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 hover:bg-slate-800 text-left">🚪 Kapı</button>
              <button onClick={() => loadPreset('stairs')} className="p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 hover:bg-slate-800 text-left">⚠️ Basamak</button>
              <button onClick={() => loadPreset('chair')} className="p-1.5 rounded-lg bg-slate-950 text-xs text-slate-300 hover:bg-slate-800 text-left">🪑 Masa</button>
            </div>
          </div>
        </div>

        {/* Viewfinder Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center">
            {cameraActive ? (
              <video ref={videoRef} playsInline muted autoPlay className="w-full h-full object-cover" />
            ) : imageBase64 ? (
              <img src={imageBase64} alt="Önizleme" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center p-6 space-y-2">
                <Camera className="w-8 h-8 text-indigo-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400">Kamera kapalı veya görsel seçilmedi.</p>
              </div>
            )}
          </div>

          <button
            onClick={captureAndAnalyze}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg hover:bg-indigo-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Çevre Tarif Ediliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Çevreyi Sesli Tarif Et</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Error & Narration Output */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400">
            <Headphones className="w-4 h-4" />
            <span>Bluetooth Kulaklık Çıktısı</span>
          </div>
          {narrationResult && (
            <button
              onClick={() => (isSpeaking ? stopSpeaking() : speakText(narrationResult))}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                isSpeaking ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-500'
              }`}
            >
              {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isSpeaking ? 'Durdur' : 'Tekrar Dinle'}</span>
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs sm:text-sm min-h-[60px] flex items-center">
          {narrationResult ? (
            <p>"{narrationResult}"</p>
          ) : (
            <p className="text-slate-500 italic">"Kamerayı açıp tarifi alın veya hazır sahne seçin."</p>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
