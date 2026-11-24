import { useEffect, useRef, useState } from 'react';
import { Camera, Upload, Volume2, VolumeX, ScanEye } from 'lucide-react';

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
    setActive(false);
  }
  async function openCamera() {
    setOpening(true); setError('');
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280}},audio:false});
      if (!mounted.current) { s.getTracks().forEach(t=>t.stop()); return; }
      stream.current = s;
      if (video.current) { video.current.srcObject = s; await video.current.play(); }
      setImage(''); setResult(''); setActive(true);
    } catch { stopCamera(); setError('Kamera açılamadı. Kamera iznini ve güvenli bağlantıyı kontrol edin.'); }
    finally { if(mounted.current) setOpening(false); }
  }
  function stopSpeech() { window.speechSynthesis?.cancel(); setSpeaking(false); }
  function speak(text: string) {
    if (!window.speechSynthesis) { setError('Bu tarayıcı seslendirmeyi desteklemiyor. Ekran okuyucuyu kullanabilirsiniz.'); return; }
    stopSpeech();
    const u = new SpeechSynthesisUtterance(text);
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
      const scale = Math.min(1,1280/v.videoWidth);
      c.width = Math.round(v.videoWidth*scale); c.height = Math.round(v.videoHeight*scale);
      const ctx = c.getContext('2d');
      if (!ctx) { setError('Görüntü alınamadı.'); return; }
      ctx.drawImage(v,0,0,c.width,c.height); data = c.toDataURL('image/jpeg',.85);
    }
    if (!data) { setError('Önce kamerayı açın veya fotoğraf seçin.'); return; }
    const controller = new AbortController(); request.current = controller; setBusy(true);
    const timeout = window.setTimeout(()=>controller.abort(),45000);
    try {
      const res = await fetch('/api/describe-environment',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({imageBase64:data,angle:'15',distance:'1.5',customPrompt:'Görüntüyü Türkçe, kısa ve açık tarif et. Gönderilen açı ve mesafe test varsayımlarıdır, gerçek ölçüm değildir. Kesin mesafe veya güvenli geçiş iddiasında bulunma. Görünen olası tehlikeleri ve belirsizlikleri belirt.'})});
      const body = await res.json();
      if (!res.ok || !body.success || typeof body.narration !== 'string' || !body.narration.trim()) throw new Error();
      if (mounted.current) { setResult(body.narration); speak(body.narration); }
    } catch { if(mounted.current) setError('Tarif alınamadı. İnternet bağlantısını kontrol edip tekrar deneyin.'); }
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
      <button className="module" disabled={opening||busy} onClick={active?stopCamera:openCamera}><Camera aria-hidden="true"/>{active?'Kamerayı kapat':'Kamerayı aç'}</button>
      <button className="module" disabled={opening||busy} onClick={()=>fileInput.current?.click()}><Upload aria-hidden="true"/>Fotoğraf seç</button>
      <button className="module primary" disabled={busy||opening||(!active&&!image)} onClick={analyze}><ScanEye aria-hidden="true"/>{busy?'Tarif hazırlanıyor':'Çevreyi tarif et'}</button>
      <button className="module" disabled={!result&&!speaking} onClick={()=>speaking?stopSpeech():speak(result)}>{speaking?<VolumeX aria-hidden="true"/>:<Volume2 aria-hidden="true"/>}{speaking?'Sesi durdur':'Tekrar dinle'}</button>
    </div>
    <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{upload(e.target.files?.[0]);e.target.value='';}}/>
    <video ref={video} muted playsInline autoPlay aria-label="Kamera önizlemesi" className={active?'w-full max-h-48 object-contain':'absolute w-px h-px opacity-0 pointer-events-none'} />
    {!active&&image&&<img src={image} alt="Seçilen fotoğraf" className="w-full max-h-48 object-contain"/>}
    {error&&<p role="alert" className="notice">{error}</p>}
    {result&&<section className="notice" aria-label="Son çevre tarifi"><h2 className="font-bold">Son tarif</h2><p>{result}</p></section>}
    <p className="text-sm">Yapay zekâ tarifi hatalı olabilir. Baston veya rehber köpek yerine kullanmayın. Ses, cihazınızın seçili ses çıkışından gelir.</p>
  </section>;
}
