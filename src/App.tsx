import { LiveCameraNarration } from './components/LiveCameraNarration';
import { OfflineIndicator } from './components/OfflineIndicator';
export default function App() {
  return <div className="app-shell">
    <header><h1>Gözüm Kulağımda</h1></header>
    <OfflineIndicator />
    <main id="main"><LiveCameraNarration /></main>
  </div>;
}
