import React, { useState } from 'react';
import { Activity, Plus, Trash2, CheckCircle, Clock, ShieldAlert, Award, FileSpreadsheet } from 'lucide-react';

interface TestRecord {
  id: string;
  objectName: string;
  angle: '0°' | '15°' | '30°';
  distance: '1m' | '2m' | '3m';
  successCount: number; // out of 3
  avgTimeSec: number;
  difficulty: 'Normal' | 'Loş Işık' | 'Küçük Nesne';
  notes: string;
}

const DEFAULT_OBJECTS = [
  'Kapı',
  'Sandalye',
  'Masa',
  'Basamak',
  'Pencere',
  'Çanta',
  'Kutu',
  'Duvar / Engel',
];

export const TestLab: React.FC = () => {
  const [records, setRecords] = useState<TestRecord[]>([
    {
      id: '1',
      objectName: 'Kapı',
      angle: '15°',
      distance: '2m',
      successCount: 3,
      avgTimeSec: 1.2,
      difficulty: 'Normal',
      notes: 'Kolye kılıfı 15° açıda kapıyı net algıladı.',
    },
    {
      id: '2',
      objectName: 'Sandalye',
      angle: '15°',
      distance: '1m',
      successCount: 3,
      avgTimeSec: 0.9,
      difficulty: 'Normal',
      notes: 'Yakın mesafede çok hızlı bildirim.',
    },
    {
      id: '3',
      objectName: 'Basamak',
      angle: '30°',
      distance: '1m',
      successCount: 2,
      avgTimeSec: 1.8,
      difficulty: 'Loş Işık',
      notes: 'Loş ışıkta tanıma süresi biraz uzadı.',
    },
  ]);

  const [objectName, setObjectName] = useState(DEFAULT_OBJECTS[0]);
  const [angle, setAngle] = useState<'0°' | '15°' | '30°'>('15°');
  const [distance, setDistance] = useState<'1m' | '2m' | '3m'>('2m');
  const [successCount, setSuccessCount] = useState<number>(3);
  const [avgTimeSec, setAvgTimeSec] = useState<number>(1.2);
  const [difficulty, setDifficulty] = useState<'Normal' | 'Loş Işık' | 'Küçük Nesne'>('Normal');
  const [notes, setNotes] = useState('');

  const addRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: TestRecord = {
      id: Date.now().toString(),
      objectName,
      angle,
      distance,
      successCount,
      avgTimeSec,
      difficulty,
      notes: notes || 'Standart test koşulu.',
    };
    setRecords([newRec, ...records]);
    setNotes('');
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter((r) => r.id !== id));
  };

  // Calculate stats
  const totalTests = records.length;
  const avgSuccessRate = totalTests > 0 ? Math.round((records.reduce((acc, r) => acc + (r.successCount / 3) * 100, 0) / totalTests)) : 0;
  const overallAvgTime = totalTests > 0 ? (records.reduce((acc, r) => acc + r.avgTimeSec, 0) / totalTests).toFixed(2) : '0';

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-900/40 via-indigo-900/30 to-slate-900 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-bold">
              <Activity className="w-4 h-4 text-violet-400" />
              <span>Metot & Test Laboratuvarı</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Açı ve Mesafe Test Laboratuvarı</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              0°, 15° ve 30° kamera açılarında 1m, 2m ve 3m mesafelerdeki 8 temel nesnenin doğru tanıma sayılarını ve bildirim sürelerini kaydedin.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
            <div>
              <p className="text-xs text-slate-400">Toplam Test</p>
              <p className="text-lg font-black text-white">{totalTests}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Başarı Oranı</p>
              <p className="text-lg font-black text-emerald-400">%{avgSuccessRate}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Ort. Süre</p>
              <p className="text-lg font-black text-indigo-400">{overallAvgTime}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Record Form & Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-6 shadow-xl">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            <span>Yeni Test Verisi Kaydet</span>
          </h3>

          <form onSubmit={addRecord} className="space-y-4">
            {/* Object name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Test Edilen Nesne</label>
              <select
                value={objectName}
                onChange={(e) => setObjectName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                {DEFAULT_OBJECTS.map((obj) => (
                  <option key={obj} value={obj}>{obj}</option>
                ))}
              </select>
            </div>

            {/* Angle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Kamera Açısı</label>
              <div className="grid grid-cols-3 gap-2">
                {(['0°', '15°', '30°'] as const).map((a) => (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setAngle(a)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      angle === a ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Mesafe</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1m', '2m', '3m'] as const).map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => setDistance(d)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      distance === d ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Success Count (out of 3) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Doğru Tanıma Sayısı (3 Denemede)</label>
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    type="button"
                    key={num}
                    onClick={() => setSuccessCount(num)}
                    className={`py-2 rounded-xl text-xs font-bold border transition ${
                      successCount === num ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-950 text-slate-300 border-slate-800'
                    }`}
                  >
                    {num} / 3
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Time */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-300">Ortalama Bildirim Süresi</span>
                <span className="text-indigo-400 font-bold">{avgTimeSec} sn</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="3.0"
                step="0.1"
                value={avgTimeSec}
                onChange={(e) => setAvgTimeSec(parseFloat(e.target.value))}
                className="w-full accent-indigo-500 bg-slate-950"
              />
            </div>

            {/* Difficulty */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Ortam Şartı / Zorluk</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
              >
                <option value="Normal">Normal Aydınlatma</option>
                <option value="Loş Işık">Loş Işık (Zorluk)</option>
                <option value="Küçük Nesne">Küçük Nesne</option>
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Test Notları</label>
              <input
                type="text"
                placeholder="Örn: 15° açıda en yüksek doğruluk elde edildi."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition"
            >
              Test Verisini Kaydet
            </button>
          </form>
        </div>

        {/* Records Table / Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                <span>Kaydedilen Test Sonuçları ({records.length})</span>
              </h3>
              <span className="text-xs text-slate-400">MEB Proje Raporlama Formatı</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {records.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">Henüz kayıtlı test verisi bulunmuyor.</div>
              ) : (
                records.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-indigo-500/40 transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{rec.objectName}</span>
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                          {rec.angle} Açı
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 text-[10px] font-bold">
                          {rec.distance}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                          rec.difficulty === 'Normal' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {rec.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{rec.notes}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{rec.successCount} / 3 Doğru</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{rec.avgTimeSec} sn tepki</span>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteRecord(rec.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
