import React from 'react';
import { BarChart3, TrendingUp, Target, Zap, ShieldCheck } from 'lucide-react';

export const StatisticsCharts: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-sky-900/40 via-indigo-900/30 to-slate-900 border border-sky-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold">
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>Bilimsel Analiz Raporu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Test İstatistikleri & Açı Doğruluk Grafikleri</h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Kamera açıları (0°, 15°, 30°) ve mesafelerin (1m, 2m, 3m) nesne tanıma başarı oranları üzerindeki deneysel analiz sonuçları.
          </p>
        </div>
      </div>

      {/* Grid of Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">En Verimli Açı</span>
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300"><Target className="w-4 h-4" /></span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white">15° Aşağı</h3>
            <p className="text-xs text-emerald-400 mt-1 font-bold">↑ %94.5 Ortalama Başarı</p>
          </div>
          <p className="text-xs text-slate-400">Boyun askısıyla göğüs hizasından yapılan çekimlerde 15° eğim, hem zemin engellerini hem de öndeki nesneleri en ideal kadrajda yakalamaktadır.</p>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">İdeal Test Mesafesi</span>
            <span className="p-2 rounded-xl bg-violet-500/20 text-violet-300"><Zap className="w-4 h-4" /></span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white">1.5 - 2 Metre</h3>
            <p className="text-xs text-emerald-400 mt-1 font-bold">⏱️ 0.9s Ortalama Tepki</p>
          </div>
          <p className="text-xs text-slate-400">1 ile 2 metre arası mesafe, görme engelli bireyin zamanında reaksiyon göstermesi ve güvenle yön değiştirmesi için en uygun erken uyarı penceresini sunar.</p>
        </div>

        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400">Sistem Avantajı</span>
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div>
            <h3 className="text-3xl font-black text-white">0 Masraf & Konfor</h3>
            <p className="text-xs text-emerald-400 mt-1 font-bold">🎧 Çevre Sesleri Duyulur</p>
          </div>
          <p className="text-xs text-slate-400">Tek kulaklık kullanımı sayesinde çevre sesleri (trafik, insan sesleri) duyulmaya devam eder; bastonun yerine geçmez, mükemmel bir tamamlayıcıdır.</p>
        </div>
      </div>

      {/* Angle Performance Breakdown */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-400" />
          <span>Kamera Açılarına Göre Başarı Oranları Karşılaştırması</span>
        </h3>

        <div className="space-y-5">
          {[
            { angle: '15° Aşağı Açı (Optimum Tasarım)', rate: 94, color: 'bg-indigo-500' },
            { angle: '0° Düz Açı (Yatay Kadraj)', rate: 78, color: 'bg-violet-500' },
            { angle: '30° Aşağı Açı (Aşırı Eğik)', rate: 65, color: 'bg-slate-600' },
          ].map((item) => (
            <div key={item.angle} className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-200">{item.angle}</span>
                <span className="text-indigo-400">%{item.rate} Başarı</span>
              </div>
              <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                  style={{ width: `${item.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
