type Env = { GEMINI_API_KEY?: string; GEMINI_MODEL?: string };
const reply = (body: object, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store'}});
export async function onRequestPost({request, env}: {request: Request; env: Env}) {
  if (!env.GEMINI_API_KEY) return reply({success:false,error:'Sunucuda Gemini API anahtarı tanımlanmamış.'},503);
  let body: {imageBase64?: string; mode?: string; sensors?: { frontCm?: number; rightCm?: number; leftCm?: number; capturedAt?: number }};
  try { body = await request.json(); } catch { return reply({success:false,error:'Geçersiz istek.'},400); }
  const match = typeof body?.imageBase64 === 'string' && body.imageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[2].length > 8250000) return reply({success:false,error:'Geçersiz veya çok büyük görüntü.'},400);
  const sensor = body.sensors;
  const fresh = typeof sensor?.capturedAt === 'number' && Math.abs(Date.now()-sensor.capturedAt) <= 2000;
  const readings = fresh ? (['frontCm','rightCm','leftCm'] as const).flatMap(k => { const v = sensor?.[k]; return typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 1000 ? [k+': '+v+' cm'] : []; }) : [];
  const sensorContext = readings.length ? ' Harici cihazın bildirdiği doğrulanmamış sensör okumaları: '+readings.join(', ')+'. Bunları kamera nesnelerine kesin olarak eşleme; ölçüm yönünü ve belirsizliği belirt.' : ' Güncel fiziksel sensör ölçümü yok.';
  let available: string[] = [];
  try {
    const list = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=100', {headers:{'x-goog-api-key':env.GEMINI_API_KEY},signal:AbortSignal.timeout(5000)});
    if(list.ok) {
      const data = await list.json() as {models?: {name:string;supportedGenerationMethods?:string[]}[]};
      available = (data.models || []).filter(m=>m.supportedGenerationMethods?.includes('generateContent') && /gemini.*flash/i.test(m.name) && !/image|audio|tts|live|embedding|robotics/i.test(m.name)).map(m=>m.name.replace(/^models\//,''));
      available.sort((a,b)=>Number(!/lite/.test(a))-Number(!/lite/.test(b)));
    }
  } catch { /* Retain configured fallbacks. */ }
  const models = [...new Set([env.GEMINI_MODEL, ...available.filter(m=>!/^gemini-2\.5-/.test(m)), 'gemini-3.1-flash-lite', 'gemini-flash-latest'].filter(Boolean))].slice(0,3);
  const deadline = Date.now()+12000;
  const failures: string[] = [];
  for (const model of models) {
    const remaining = deadline-Date.now();
    if (remaining <= 0) break;
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model!)+':generateContent',{
        method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        signal:AbortSignal.timeout(Math.min(remaining,6000)),
        body:JSON.stringify({systemInstruction:{parts:[{text:'Görme engelli kullanıcıya Türkçe, kısa ve açık çevre tarifi ver. Ana anlatım sırası yakından uzağa olsun: önce hemen yakındaki ve ayak hizasındaki nesneler, sonra orta mesafedeki, en son uzaktaki nesneler. Her mesafe grubunda önce ön, sonra sağ, sonra sol yönü belirt. Acil görünen tehlikeleri her zaman ilk sırada bildir. Mesafe belirsizse uydurma; yönleri kamera bakışına göre belirt.  Her yönde yakın engelleri ve olası tehlikeleri önceliklendir; acil görünen tehlikeyi geciktirme. Yönler kamera bakışına göredir; kameranın kullanıcıyla hizalı olduğunu varsayma. Görsel ölçek ipucu yeterliyse yalnızca kaba ve belirsiz yaklaşık mesafe aralığı ver; yeterli değilse mesafe tahmin edilemiyor de. Ölçüm sağlanmadığında mesafe sensörü verisi yoktur; kesin mesafe, güvenli geçiş veya engelsiz yol iddiasında bulunma. Önce görüntünün alt kısmını ve hemen yakındaki nesneleri incele; ayak hizasındaki engelleri, basamakları ve çok yakın nesneleri uzak nesnelerden önce bildir. Görüş dışındaki alanlar hakkında tahmin yürütme. Yazı okuma modunda okunabilir metni aktar.'+sensorContext}]},contents:[{parts:[{inlineData:{mimeType:match[1],data:match[2]}},{text:body.mode === 'read' ? 'Görüntüde okunabilen yazıları olduğu gibi aktar. Okunamayan yerleri belirt.' : body.mode === 'detail' ? 'Görüntüyü ayrıntılı tarif et; olası tehlikeleri önce belirt.' : 'En fazla üç kısa cümleyle görüntüyü tarif et; olası tehlikeleri önce belirt.'}]}]})
      });
      if(response.status===401 || response.status===403) return reply({success:false,error:'Gemini API anahtarı veya erişim izni geçersiz.'},502);
      if(!response.ok) { failures.push(model+': HTTP '+response.status); continue; }
      const data = await response.json() as {candidates?: {content?: {parts?: {text?:string;thought?:boolean}[]}}[]};
      const narration = data.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join(' ').trim();
      if(narration) return reply({success:true,narration});
      failures.push(model+': boş yanıt');
    } catch { failures.push(model+': bağlantı veya zaman aşımı'); }
  }
  console.warn('Gemini failures:', failures); return reply({success:false,error:'Çevre şu anda tarif edilemiyor. Lütfen tekrar deneyin.'},502);
}
