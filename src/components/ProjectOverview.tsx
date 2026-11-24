import React from 'react';
import { BookOpen, Target, CheckCircle2, Shield, Users, Layers } from 'lucide-react';

export const ProjectOverview: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-violet-950 border border-indigo-500/20 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Proje 13: MEB / Teknoloji ve Tasarım</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Gözüm Kulağımda: Görme Engelliler İçin Kolye Kameradan Bluetooth Kulaklığa Sesli Çevre Tarifi
          </h2>
          <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
            Boyna takılan kolye kılıfındaki kameranın gördüklerini Bluetooth kulaklığa sesli aktaran, mevcut akıllı telefon ve yapay zeka teknolojisi kullanan masrafsız, yenilikçi ve erişilebilir yaşam sistemi.
          </p>
        </div>
      </div>

      {/* Project Card Image Preview */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span>Orijinal Proje Bilgi Kartı</span>
        </h3>
        <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex justify-center p-2">
          <img
            src="/public/assets/aistudio/IMG-20261124-WA0005_c041a3a3.jpg"
            alt="Proje Bilgi Kartı"
            className="max-h-[500px] object-contain rounded-xl"
          />
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Amaç */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Projenin Amacı</h3>
              <p className="text-xs text-slate-400">Temel Hedef ve Kapsam</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Görme engelli bireylerin çevrelerindeki nesneleri fark etmelerine yardımcı olmak için, boyna takılan kolye kılıfındaki kameranın gördüklerini Bluetooth kulaklığa sesli aktaran, ek masraf yaratmayan akıllı ve erişilebilir bir sistem tasarlamak ve test etmektir.
          </p>
        </div>

        {/* Yöntem */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tasarım ve Yöntem</h3>
              <p className="text-xs text-slate-400">Karton-Kumaş Kılıf & Tek Kulaklık</p>
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            Karton-kumaştan dikilen "kolye kılıfı" içinde telefon göğüs hizasında taşınır. Kamera öne bakar. Tek kulaklıktan sesli bildirim dinlenirken, çevre sesleri duyulmaya devam eder. Açı ayarları (0°, 15°, 30°) ve 8 farklı nesne ile test edilir.
          </p>
        </div>

      </div>

      {/* Beklenen Sonuçlar */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Beklenen Sonuçlar ve Bilimsel Çıktılar</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-indigo-400">1. Optimum Açı</h4>
            <p className="text-xs text-slate-300 leading-relaxed">En iyi tanıma sonucunu veren kamera açısı (15°) belirlenir ve kılıf bu açıyı sabitleyecek şekilde iyileştirilir.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-indigo-400">2. Tamamlayıcı Destek</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Sistemin bastonun yerini almadığı, güvenli yürüyüşü destekleyen mükemmel bir tamamlayıcı yardımcı olduğu kanıtlanır.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-indigo-400">3. Empati & Deneyim</h4>
            <p className="text-xs text-slate-300 leading-relaxed">Öğrencilerin empati yeteneği gelişir; kolye kılıfı ve grafikler fuar alanında ziyaretçilerin deneyimine sunulur.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
