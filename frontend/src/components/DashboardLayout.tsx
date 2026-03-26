import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-dark)', overflow: 'hidden' }}>
      {/* Sidebar on the Left */}
      <Sidebar />
      
      {/* Main Content Area on the Right */}
      <div className="dashboard-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ padding: '2rem 4rem', position: 'relative', zIndex: 1 }}>
          <Header hideTitle={true} />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
