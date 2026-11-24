import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { LiveCameraNarration } from './components/LiveCameraNarration';
import { TestLab } from './components/TestLab';
import { StatisticsCharts } from './components/StatisticsCharts';
import { ProjectOverview } from './components/ProjectOverview';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'live' | 'lab' | 'charts' | 'project'>('live');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'live' && <LiveCameraNarration />}
        {activeTab === 'lab' && <TestLab />}
        {activeTab === 'charts' && <StatisticsCharts />}
        {activeTab === 'project' && <ProjectOverview />}
      </main>

      <OfflineIndicator />
    </div>
  );
}
