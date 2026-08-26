'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

type Tool = 'highlighter' | 'pen' | 'eraser' | 'bookmark' | null;

export default function Toolkit({ articleId }: { articleId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<Tool>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleToolSelect = (tool: Tool) => {
    if (tool === 'bookmark') {
      setBookmarked(!bookmarked);
      showToast(bookmarked ? '🔖 Removed from Bookshelf' : '🔖 Saved to your Personal Bookshelf');
      return;
    }
    if (activeTool === tool) {
      setActiveTool(null);
      showToast('Tool deactivated');
    } else {
      setActiveTool(tool);
      showToast(
        tool === 'highlighter'
          ? '🖊️ Highlighter Active: Select text to highlight'
          : tool === 'pen'
          ? '✏️ Pen Active: Draw annotations directly on page'
          : '🧹 Eraser Active: Click and drag to erase'
      );
    }
  };

  // Canvas drawing handlers
  const startDraw = useCallback((e: MouseEvent) => {
    if (activeTool !== 'pen' && activeTool !== 'eraser') return;
    isDrawing.current = true;
    lastPoint.current = { x: e.clientX, y: e.clientY };
  }, [activeTool]);

  const draw = useCallback((e: MouseEvent) => {
    if (!isDrawing.current || !lastPoint.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(e.clientX, e.clientY);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 30;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    ctx.stroke();
    lastPoint.current = { x: e.clientX, y: e.clientY };
  }, [activeTool]);

  const stopDraw = useCallback(() => {
    isDrawing.current = false;
    lastPoint.current = null;
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', startDraw);
    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDraw);
    return () => {
      document.removeEventListener('mousedown', startDraw);
      document.removeEventListener('mousemove', draw);
      document.removeEventListener('mouseup', stopDraw);
    };
  }, [startDraw, draw, stopDraw]);

  return (
    <>
      {/* Freehand Drawing Overlay Canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 z-40 pointer-events-none ${
          activeTool === 'pen' || activeTool === 'eraser' ? '!pointer-events-auto' : ''
        }`}
        style={{
          cursor: activeTool === 'pen' ? 'crosshair' : activeTool === 'eraser' ? 'cell' : 'default',
        }}
      />

      {/* Right Edge VisionOS / Android Style Quick Bar Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 group cursor-pointer"
        title="Open User Annotation Toolkit"
      >
        <div className="w-3.5 hover:w-5 h-28 bg-gradient-to-b from-cyan-400 via-violet-500 to-pink-500 rounded-l-2xl shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all duration-300 flex items-center justify-center">
          <span className="text-[9px] font-mono font-bold text-black rotate-90 select-none">TOOLS</span>
        </div>
      </div>

      {/* Slide-out Liquid Glass Toolkit Console */}
      <div
        className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 transition-all duration-500 ease-out ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[140%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="rounded-[28px] p-3.5 bg-[#0a0a14]/90 backdrop-blur-3xl border border-white/[0.18] shadow-[0_20px_60px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.3)] flex flex-col gap-2.5 w-16 items-center">
          
          <div className="text-[8px] font-mono uppercase tracking-widest text-white/40 pb-1 border-b border-white/10 w-full text-center">
            KIT
          </div>

          {/* Highlighter */}
          <button
            onClick={() => handleToolSelect('highlighter')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
              activeTool === 'highlighter'
                ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.6)] scale-105'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
            title="Highlighter"
          >
            <span className="text-sm">🖊️</span>
            <span className="text-[8px] font-mono font-bold">HL</span>
          </button>

          {/* Pen */}
          <button
            onClick={() => handleToolSelect('pen')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
              activeTool === 'pen'
                ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(0,240,255,0.6)] scale-105'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
            title="Pen / Draw"
          >
            <span className="text-sm">✏️</span>
            <span className="text-[8px] font-mono font-bold">DRAW</span>
          </button>

          {/* Eraser */}
          <button
            onClick={() => handleToolSelect('eraser')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
              activeTool === 'eraser'
                ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-105'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
            title="Eraser"
          >
            <span className="text-sm">🧹</span>
            <span className="text-[8px] font-mono font-bold">ERASE</span>
          </button>

          {/* Bookshelf Bookmark */}
          <button
            onClick={() => handleToolSelect('bookmark')}
            className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
              bookmarked
                ? 'bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.6)] scale-105'
                : 'bg-white/[0.05] hover:bg-white/[0.1] text-white/70 hover:text-white border border-white/[0.08]'
            }`}
            title="Save to Bookshelf"
          >
            <span className="text-sm">{bookmarked ? '🔖' : '📑'}</span>
            <span className="text-[8px] font-mono font-bold">SAVE</span>
          </button>

          {/* Close */}
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-white/[0.1] text-white/40 hover:text-white text-xs mt-1 transition-colors flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Floating System Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#090912]/95 backdrop-blur-2xl border border-white/20 text-white font-mono text-xs px-4 py-2.5 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMsg}
        </div>
      )}
    </>
  );
}
