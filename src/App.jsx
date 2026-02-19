import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DreamProvider } from './context/DreamContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Upload from './components/Upload';
import LogList from './components/LogList';
import LogDetail from './components/LogDetail';

export default function App() {
  return (
    <DreamProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/logs" element={<LogList />} />
            <Route path="/logs/:filename" element={<LogDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </DreamProvider>
  );
}
