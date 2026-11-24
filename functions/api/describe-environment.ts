type Env = { GEMINI_API_KEY?: string; GEMINI_MODEL?: string };
const reply = (body: object, status = 200) => Response.json(body, {status, headers: {'Cache-Control':'no-store'}});
export async function onRequestPost({request, env}: {request: Request; env: Env}) {
  if (!env.GEMINI_API_KEY) return reply({success:false,error:'Sunucuda Gemini API anahtarı tanımlanmamış.'},503);
  let body: {imageBase64?: string};
  try { body = await request.json(); } catch { return reply({success:false,error:'Geçersiz istek.'},400); }
  const match = typeof body?.imageBase64 === 'string' && body.imageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[2].length > 8500000) return reply({success:false,error:'Geçersiz veya çok büyük görüntü.'},400);
  const models = [...new Set([env.GEMINI_MODEL, 'gemini-3.1-flash-lite', 'gemini-2.5-flash'].filter(Boolean))];
  const deadline = Date.now()+35000;
  for (const model of models) {
    const remaining = deadline-Date.now();
    if (remaining <= 0) break;
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+encodeURIComponent(model!)+':generateContent',{
        method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':env.GEMINI_API_KEY},
        signal:AbortSignal.timeout(Math.min(remaining,18000)),
        body:JSON.stringify({systemInstruction:{parts:[{text:'Görme engelli kullanıcıya Türkçe, kısa ve açık çevre tarifi ver. Görünen olası tehlikeleri öncelikle belirt. Kesin mesafe veya güvenli geçiş iddiasında bulunma. Belirsizlikleri belirt.'}]},contents:[{parts:[{inlineData:{mimeType:match[1],data:match[2]}},{text:'Bu görüntüyü tarif et.'}]}]})
      });
      if(response.status===401 || response.status===403) return reply({success:false,error:'Gemini API anahtarı veya erişim izni geçersiz.'},502);
      if(!response.ok) continue;
      const data = await response.json() as {candidates?: {content?: {parts?: {text?:string;thought?:boolean}[]}}[]};
      const narration = data.candidates?.[0]?.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join(' ').trim();
      if(narration) return reply({success:true,narration});
    } catch { /* Try next configured model. */ }
  }
  return reply({success:false,error:'Gemini yanıt vermedi. Model erişimini veya kotayı kontrol edin.'},502);
}
