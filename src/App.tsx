import React, { useState } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';
import AppRoutes from './AppRoutes';
import Button from './components/Button';

const AppContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation(); // Hook to get the current URL

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // // Determine if the current page is the AuthPage (login)
  // const isAuthPage = location.pathname === '/login';

  // // Adjust main content styling based on whether it's the AuthPage
  // const mainClassName = `flex-1 overflow-y-auto ${isAuthPage ? 'flex items-center justify-center' : ''}`;

  // return (
  //   <div className="flex flex-col h-screen bg-gray-100 antialiased overflow-hidden">
  //     <header className="bg-indigo-600 text-white shadow-md">
  //       <nav className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
  //         <h1 className="text-2xl font-bold">
  //           <Link to={user ? "/todos" : "/login"} className="text-white hover:text-indigo-100">
  //             My Todo App
  //           </Link>
  //         </h1>
  //         {user && (
  //           <>
  //             <div className="sm:hidden">
  //               <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label="Toggle menu">
  //                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
  //                 </svg>
  //               </button>
  //             </div>
  //             <ul className={`sm:flex items-center sm:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} sm:block absolute sm:static top-16 left-0 right-0 bg-indigo-600 sm:bg-transparent p-4 sm-p-0`}>
  //               <li className="text-sm hidden sm:block">
  //                 {user.email}
  //               </li>
  //               <li>
  //                 <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
  //               </li>
  //             </ul>
  //           </>
  //         )}
  //       </nav>
  //     </header>
      
  //     <main className={mainClassName}>
  //       <AppRoutes />
  //     </main>
  //   </div>
  // );


  
  // If we are on the login page, center the content. Otherwise, use the standard layout.
  const isAuthPage = location.pathname === '/login';
  const mainContainerClasses = isAuthPage 
    ? "flex-grow grid place-items-center" 
    : "flex-grow";

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 antialiased">
      {/* Hide header on the authentication page*/}
      {!isAuthPage && (
        <header className="bg-indigo-600 text-white shadow-md">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
            <h1 className="text-2xl font-bold">
              <Link to={user ? "/todos" : "/login"} className="text-white hover:text-indigo-100">
                My React Todo App
              </Link>
            </h1>
            {user && (
              <>
                <div className="sm:hidden">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label="Toggle menu">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                    </svg>
                  </button>
                </div>
                <ul className={`sm:flex items-center sm:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} sm:block absolute sm:static top-16 left-0 right-0 bg-indigo-600 sm:bg-transparent p-4 sm:p-0`}>
                  <li className="text-sm hidden sm:block">
                    {user.email}
                  </li>
                  <li>
                    <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                  </li>
                </ul>
              </>
            )}
          </nav>
        </header>
      )}
      
      <main className={mainContainerClasses}>
        <AppRoutes />
      </main>
    </div>
  );
};

const AppWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default AppWrapper;

