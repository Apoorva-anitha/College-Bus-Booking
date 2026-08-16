import React, { useState } from 'react';
import { SPRING_BOOT_ARTIFACTS, SpringBootFile } from '../services/springBootArtifacts';
import { 
  Code2, 
  Database, 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  Cpu, 
  FolderTree, 
  ShieldCheck,
  Terminal
} from 'lucide-react';

export const SpringBootCodeViewer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<SpringBootFile>(SPRING_BOOT_ARTIFACTS[3]); // Default to V7__create_bookings.sql or BookingService
  const [copied, setCopied] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Flyway SQL', 'Service', 'Security', 'Test', 'Config', 'Docker'];

  const filteredFiles = activeCategory === 'ALL'
    ? SPRING_BOOT_ARTIFACTS
    : SPRING_BOOT_ARTIFACTS.filter(f => f.category === activeCategory);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Java 21 • Spring Boot 3 • PostgreSQL Flyway Engine</h2>
              <p className="text-xs text-slate-400">
                Production-grade backend architecture, Flyway migrations (V1 to V11), transactional locks, and Docker files.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopyCode}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center space-x-1.5 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Current File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: File List on Left, Code Editor on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* File Navigator */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 max-h-[600px] overflow-y-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 mb-2 flex items-center space-x-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            <span>Project Source Tree</span>
          </h3>

          {filteredFiles.map((file) => {
            const isSelected = selectedFile.path === file.path;
            return (
              <div
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                  isSelected
                    ? 'bg-slate-800/90 border-blue-500 text-white shadow-sm'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-slate-200 truncate pr-2">{file.path.split('/').pop()}</span>
                  <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {file.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate mt-1">{file.path}</p>
              </div>
            );
          })}
        </div>

        {/* Code Preview Stage */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Editor Header Bar */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono text-white font-bold">{selectedFile.path}</span>
            </div>
            <span className="text-[11px] text-slate-400">{selectedFile.description}</span>
          </div>

          {/* Code Textarea */}
          <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[550px] select-text">
            <code>{selectedFile.content}</code>
          </pre>

        </div>

      </div>

    </div>
  );
};
