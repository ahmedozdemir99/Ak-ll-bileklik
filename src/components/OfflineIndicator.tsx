import { useOnlineStatus } from '../hooks/useOnlineStatus';
export const OfflineIndicator = () => {
  const online = useOnlineStatus();
  return <div role="status" aria-live="polite">{!online && <p className="notice">İnternet bağlantısı yok. Yeni çevre tarifi alınamaz.</p>}</div>;
};
