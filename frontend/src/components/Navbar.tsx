import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/Button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Jobs', path: '/jobs' },
    { name: 'Saved', path: '/saved' },
    { name: 'Alerts', path: '/alerts' },
  ];

  return (
    <header className="bg-canvas border-b border-hairline sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-ink">
            <path d="M12 2L14 10L22 12L14 14L12 22L10 14L2 12L10 10L12 2Z" fill="currentColor"/>
          </svg>
          <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
            ClaudeJobs
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6 text-[14px] font-medium text-ink">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`hover:text-primary transition-colors ${location.pathname === link.path ? 'text-primary' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="font-medium text-primary hover:underline text-[14px]">
              Sign in
            </Link>
            <Link to="/register">
              <Button variant="primary">Create account</Button>
            </Link>
          </div>
        </nav>

        {/* Mobile Nav Toggle */}
        <button 
          className="md:hidden text-ink"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <div className="md:hidden bg-canvas border-b border-hairline absolute w-full left-0 top-16 px-4 py-4 flex flex-col gap-4 shadow-lg">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className="text-base font-medium text-ink py-2 border-b border-hairline-soft"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-3 mt-2">
            <Link to="/login" onClick={() => setIsOpen(false)}>
              <Button variant="secondary" className="w-full">Sign in</Button>
            </Link>
            <Link to="/register" onClick={() => setIsOpen(false)}>
              <Button variant="primary" className="w-full">Create account</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
