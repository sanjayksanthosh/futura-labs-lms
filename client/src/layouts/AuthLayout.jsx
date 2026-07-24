import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 via-primary-50/30 to-secondary-50/30 dark:from-slate-900 dark:via-primary-950/20 dark:to-secondary-950/20">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl gradient-primary shadow-lg shadow-primary-500/25">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold gradient-text">Futura Labs</h1>
                <p className="text-sm text-slate-500">Ai Tutor LMS</p>
              </div>
            </div>
          </div>
          <Outlet />
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzR2LTRoNHY0aC00em0wIDB2LTRoLTR2NGg0em0wIDB2LTRoLTR2NGg0eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="relative text-center text-white px-12 max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Empower Learning with AI</h2>
          <p className="text-xl text-white/80 mb-8">
            A complete Learning Management System designed for modern education with AI-powered features
          </p>
          <div className="grid grid-cols-2 gap-4 text-left">
            {[
              { label: 'Smart Courses', desc: 'AI-enhanced learning paths' },
              { label: 'Live Analytics', desc: 'Real-time student insights' },
              { label: 'Auto Grading', desc: 'Intelligent assessment' },
              { label: 'Certificates', desc: 'Blockchain-ready credentials' },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="font-semibold">{item.label}</p>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
