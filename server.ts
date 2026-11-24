import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API endpoint for environment narration / object recognition with model fallback
app.post('/api/describe-environment', async (req, res) => {
  const { imageBase64, customPrompt, distance, angle } = req.body;

  const systemInstruction = `Sen görme engelli bireyler için tasarlanmış "Gözüm Kulağımda" akıllı sesli çevre tarifi asistanısın. 
Görevini Bluetooth kulaklık üzerinden tek kulaktan sesli bildirim olarak alacak bir kullanıcıya hitaben yapıyorsun.
Kurallar:
1. Net, sakin ve doğrudan konuş. Görüntüden kesin mesafe veya güvenli geçiş sonucu çıkarma.
2. Açı ve mesafe parametreleri test varsayımlarıdır, gerçek sensör ölçümü değildir. Belirsizliği açıkça belirt.
3. Loş ışık veya küçük nesne zorluklarını tespit edersen bunu kibarca belirt.
4. Çevredeki potansiyel tehlikeleri (basamak, açık kapı, engel) öncelikli olarak bildir.
5. Ana anlatım sırası yakından uzağa olsun: önce hemen yakındaki ve ayak hizasındaki nesneler, sonra orta mesafedeki, en son uzaktaki nesneler. Her mesafe grubunda önce ön, sonra sağ, sonra sol yönü belirt. Acil görünen tehlikeleri her zaman ilk sırada bildir. Yeterli görsel ipucu varsa yaklaşık sayısal mesafeyi santimetre veya metre olarak seslendir, örneğin sağında yaklaşık 50 santimetre. Ölçüm ile görsel tahmini açıkça ayır. Mesafe belirsizse uydurma; yönleri kamera bakışına göre belirt.  Her yönde yakın engelleri ve olası tehlikeleri önceliklendir; acil görünen tehlikeyi geciktirme. Yönler kamera bakışına göredir; kameranın kullanıcıyla hizalı olduğunu varsayma. Görsel ölçek ipucu yeterliyse yalnızca kaba ve belirsiz yaklaşık mesafe aralığı ver; yeterli değilse mesafe tahmin edilemiyor de. Mesafe sensörü yoktur; kesin mesafe, güvenli geçiş veya engelsiz yol iddiasında bulunma. Görüş dışındaki alanlar hakkında tahmin yürütme. Yazı okuma modunda okunabilir metni aktar.
6. Yanıtı Türkçe olarak, 2-3 cümleyi aşmayacak şekilde doğrudan seslendirmeye uygun formatta ver.`;

  const contents: any[] = [];
  if (imageBase64) {
    let mimeType = 'image/jpeg';
    let data = imageBase64;
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].replace('data:', '');
      data = parts[1];
    }
    contents.push({
      inlineData: {
        mimeType,
        data,
      },
    });
  }

  contents.push({
    text: customPrompt || 'Lütfen bu çevreyi görme engelli bir kullanıcı için detaylı ve kısa bir şekilde tarif et, mesafeyi ve nesneleri belirt.',
  });

  const modelsToTry = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite', 'gemini-4-neon'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: { parts: contents },
        config: {
          systemInstruction,
        },
      });

      if (response && response.text) {
        return res.json({
          success: true,
          narration: response.text.trim(),
        });
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed:`, err.message || err);
      lastError = err;
    }
  }

  // If all models failed, return error response
  console.error('All Gemini models failed:', lastError);
  res.status(500).json({
    success: false,
    error: lastError?.message || 'Yapay zeka modelleri yoğunluk nedeniyle yanıt veremedi. Lütfen tekrar deneyin.',
  });
});

// Setup Vite middleware in development or serve static in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
