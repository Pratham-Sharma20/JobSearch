import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Outlet />
      </main>
      
      {/* Simple Footer */}
      <footer className="bg-surface-dark text-on-dark-soft py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-on-dark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor"/>
            </svg>
            <span className="font-display text-xl font-medium">AnthropicJobs</span>
          </div>
          <div className="text-[14px]">
            &copy; {new Date().getFullYear()} Claude Jobs Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
