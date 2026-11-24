import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Volume2, VolumeX, ScanEye } from 'lucide-react';

function plainNarration(text: string) {
  return text.normalize('NFC')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, ' ')
    .replace(/(\d+(?:[.,]\d+)?)\s*%/g, 'yüzde $1')
    .replace(/%(\d+)/g, 'yüzde $1')
    .replace(/(\d)\s*°/g, '$1 derece')
    .replace(/[*_\x60]/g, '')
    .replace(/[^\p{L}\p{M}\p{N}\s.,!?;:]/gu, ' ')
    .replace(/[.,!?;:]{2,}/g, '.')
    .replace(/\s+/g, ' ').trim();
}

export function LiveCameraNarration() {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const mounted = useRef(false);
  const [active, setActive] = useState(false);
  const [opening, setOpening] = useState(false);
  const [image, setImage] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [automatic, setAutomatic] = useState(false);
  const [mode, setMode] = useState('short');
  const [voice, setVoice] = useState(false);
  const recognition = useRef<any>(null);
  const latest = useRef<() => void>(() => {});
  latest.current = () => { if (!busy && !opening && (active || image)) void analyze(); };
  useEffect(() => {
    if (!automatic || !active) return;
    const timer = window.setInterval(() => { if (!document.hidden && !window.speechSynthesis?.speaking) latest.current(); }, 15000);
    return () => window.clearInterval(timer);
  }, [automatic, active]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.code === 'F8' && !e.repeat && !e.altKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); latest.current(); }
    };
    window.addEventListener('keydown', key);
    return () => { window.removeEventListener('keydown', key); recognition.current?.abort(); };
  }, []);
  function voiceCommand() {
    if (voice) { recognition.current?.abort(); setVoice(false); return; }
    const w = window as any;
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) { setError('Bu tarayıcı sesli komutu desteklemiyor.'); return; }
    try {
      const rec = new Recognition(); recognition.current = rec;
      rec.lang = 'tr-TR'; rec.continuous = false;
      rec.onresult = (e: any) => { const phrase = e.results[0][0].transcript.toLocaleLowerCase('tr'); if (/tarif|anlat|çevre/.test(phrase)) latest.current(); else setError('Çevreyi tarif et deyin.'); };
      rec.onend = () => setVoice(false);
      rec.onerror = () => { setVoice(false); setError('Sesli komut alınamadı. Mikrofon iznini kontrol edin.'); };
      rec.start(); setVoice(true);
    } catch { setError('Sesli komut başlatılamadı.'); }
  }
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stream.current?.getTracks().forEach(t => t.stop());
      request.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);
  function stopCamera() {
    stream.current?.getTracks().forEach(t => t.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
    setActive(false); setAutomatic(false);
  }
  async function openCamera() {
    setOpening(true); setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1920},height:{ideal:1080},aspectRatio:{ideal:16/9},resizeMode:{ideal:'none'} as ConstrainDOMString},audio:false});
      if (!mounted.current) { s.getTracks().forEach(t=>t.stop()); return; }
      stream.current = s;
      const track = s.getVideoTracks()[0];
      const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & {zoom?: {min:number;max:number}}) | undefined;
      if (caps?.zoom && Number.isFinite(caps.zoom.min)) {
        try { await track.applyConstraints({advanced:[{zoom:caps.zoom.min} as MediaTrackConstraintSet]}); } catch { /* Device may not support zoom control. */ }
      }
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setImage(''); setResult(''); setActive(true);
    } catch { stopCamera(); setError('Kamera açılamadı. Kamera iznini ve güvenli bağlantıyı kontrol edin.'); }
    finally { if(mounted.current) setOpening(false); }
  }
  function stopSpeech() { window.speechSynthesis?.cancel(); setSpeaking(false); }
  function speak(text: string) {
    if (!window.speechSynthesis) { setError('Bu tarayıcı seslendirmeyi desteklemiyor. Ekran okuyucuyu kullanabilirsiniz.'); return; }
    stopSpeech();
    const u = new SpeechSynthesisUtterance(plainNarration(text));
    u.lang = 'tr-TR';
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true); window.speechSynthesis.speak(u);
  }
  async function analyze() {
    if (request.current) return;
    setError(''); setResult(''); stopSpeech();
    let data = image;
    if (active) {
      const v = video.current;
      if (!v || !v.videoWidth || v.readyState < 2) { setError('Kamera henüz hazır değil. Tekrar deneyin.'); return; }
      const c = document.createElement('canvas');
      const scale = Math.min(1,(mode === 'read' ? 1600 : 960)/Math.max(v.videoWidth,v.videoHeight));
      c.width = Math.round(v.videoWidth*scale); c.height = Math.round(v.videoHeight*scale);
      const ctx = c.getContext('2d');
      if (!ctx) { setError('Görüntü alınamadı.'); return; }
      ctx.drawImage(v,0,0,c.width,c.height); data = c.toDataURL('image/jpeg',mode === 'read' ? .85 : .72);
    }
    if (!data) { setError('Önce kamerayı açın veya fotoğraf seçin.'); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true); navigator.vibrate?.(60);
    const timeout = window.setTimeout(()=>controller.abort(),18000);
    try {
      const res = await fetch('/api/describe-environment',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({imageBase64:data,mode,customPrompt:'Görüntüyü Türkçe, kısa ve açık tarif et. Ana anlatım sırası yakından uzağa olsun: önce hemen yakındaki ve ayak hizasındaki nesneler, sonra orta mesafedeki, en son uzaktaki nesneler. Her mesafe grubunda önce ön, sonra sağ, sonra sol yönü belirt. Acil görünen tehlikeleri her zaman ilk sırada bildir. Mesafe belirsizse uydurma; yönleri kamera bakışına göre belirt.  Her yönde yakın engelleri ve olası tehlikeleri önceliklendir; acil görünen tehlikeyi geciktirme. Yönler kamera bakışına göredir; kameranın kullanıcıyla hizalı olduğunu varsayma. Görsel ölçek ipucu yeterliyse yalnızca kaba ve belirsiz yaklaşık mesafe aralığı ver; yeterli değilse mesafe tahmin edilemiyor de. Mesafe sensörü yoktur; kesin mesafe, güvenli geçiş veya engelsiz yol iddiasında bulunma. Görüş dışındaki alanlar hakkında tahmin yürütme. Yazı okuma modunda okunabilir metni aktar.'})});
      if (!res.headers.get('content-type')?.includes('application/json')) throw new Error('Cloudflare API işlevi bulunamadı veya yeni dağıtım henüz etkin değil. HTTP '+res.status);
      const body = await res.json();
      if (!res.ok || !body.success || typeof body.narration !== 'string' || !body.narration.trim()) throw new Error(typeof body.error === 'string' ? body.error : 'API hatası: HTTP '+res.status);
      if (mounted.current) { const clean = plainNarration(body.narration); setResult(clean); navigator.vibrate?.([60,80,60]); speak(clean); }
    } catch (err) { if(mounted.current) { console.warn(err); const message = 'Çevre şu anda tarif edilemiyor. Lütfen tekrar deneyin.'; setError(message); speak(message); setAutomatic(false); } }
    finally { window.clearTimeout(timeout); request.current=null; if(mounted.current) setBusy(false); }
  }
  function upload(file?: File) {
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 6*1024*1024) { setError('En fazla 6 MB boyutunda JPEG, PNG veya WebP seçin.'); return; }
    const reader = new FileReader();
    reader.onload = () => { if(!mounted.current)return; stopCamera(); setImage(String(reader.result)); setResult(''); setError(''); };
    reader.onerror = () => setError('Fotoğraf okunamadı.');
    reader.readAsDataURL(file);
  }
  return <section aria-label="Çevre tarifi" className="flex flex-1 flex-col gap-4">
    <p role="status" aria-live="polite">{busy ? 'Çevre tarif ediliyor.' : opening ? 'Kamera açılıyor.' : active ? 'Kamera açık.' : image ? 'Fotoğraf hazır.' : 'Kamera kapalı.'}</p>
    <div className="module-grid">
      <button className="module camera-module" disabled={opening||busy} onClick={active?stopCamera:openCamera}><Camera aria-hidden="true"/>{active?'Kamerayı kapat':'Kamerayı aç'}</button>
      <button className="module photo-module" disabled={opening||busy} onClick={()=>fileInput.current?.click()}><Upload aria-hidden="true"/>Fotoğraf seç</button>
      <button className="module primary" aria-busy={busy} disabled={busy||opening||(!active&&!image)} onClick={analyze}><ScanEye aria-hidden="true"/>{busy?'Tarif hazırlanıyor':'Çevreyi tarif et'}</button>
      <button className="module audio-module" disabled={!result&&!speaking} onClick={()=>speaking?stopSpeech():speak(result)}>{speaking?<VolumeX aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}{speaking?'Sesi durdur':'Tekrar dinle'}</button>
    </div>
    <div className="grid gap-3">
      <button className="module" aria-pressed={automatic} disabled={!active} onClick={()=>setAutomatic(v=>!v)}>{automatic?'Otomatik tarifi durdur':'Otomatik tarif başlat'}</button>
      <button className="module" aria-pressed={voice} onClick={voiceCommand}>{voice?'Dinlemeyi durdur':'Sesli komut'}</button>
      <label className="font-bold">Tarif türü<select className="module" value={mode} onChange={e=>setMode(e.target.value)}><option value="short">Kısa tarif</option><option value="detail">Ayrıntılı tarif</option><option value="read">Yazı oku</option></select></label>
    </div>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/>
    <video ref={video} muted playsInline autoPlay aria-label="Kamera önizlemesi" className={active?'camera-preview':'absolute w-px h-px opacity-0 pointer-events-none'} />
    {active&&<p className="text-sm">Geniş görüş için telefonu yatay tutun.</p>}
    {!active&&image&&<img src={image} alt="Seçilen fotoğraf" className="w-full max-h-48 object-contain"/>}
    {error&&<p role="alert" className="notice">{error}</p>}
    {result&&<section className="notice" aria-label="Son çevre tarifi"><h2 className="font-bold">Son tarif</h2><p>{result}</p></section>}
    <details className="text-sm"><summary>Güvenli kullanım</summary><p>Yapay zekâ tarifi hatalı olabilir. Baston veya rehber köpek yerine kullanmayın. Ses, cihazınızın seçili ses çıkışından gelir.</p></details>
  </section>;
}
