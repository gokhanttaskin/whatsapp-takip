// import React from 'react';
// import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
// import AuthPage from './pages/AuthPage.tsx';
// import DashboardPage from './pages/DashboardPage.tsx';
// import AppLayout from './components/Layout/AppLayout.tsx';
// import NotFoundPage from './pages/404Page.tsx';

// const App = () => {
//   const isAuthenticated = !!localStorage.getItem('token');

//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/" element={
//           isAuthenticated ? 
//           <Navigate to="/dashboard" /> : 
//           <AuthPage />
//         }/>
        
//         <Route path="/dashboard" element={
//           isAuthenticated ? 
//           <AppLayout><DashboardPage /></AppLayout> : 
//           <Navigate to="/" />
//         }/>

//         <Route path="*" element={<NotFoundPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import AppLayout from './components/Layout/AppLayout.tsx';
import NotFoundPage from './pages/404Page.tsx';

const App = () => {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace /> // replace ile geçmiş temizleme
            ) : (
              <AuthPage />
            )
          }
        />
        
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;