import React, { useState } from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, UserCheck, Sparkles, BookOpen } from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { TEACHER_INFO } from '../data/initialData';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenTeacherProfile: () => void;
  isTeacherMode: boolean;
  setIsTeacherMode: (val: boolean) => void;
  studentCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenTeacherProfile,
  isTeacherMode,
  studentCount = 30,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      sound.playStarReward();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const navTabs = [
    { id: 'classroom', label: 'Lớp 3A5 & Các Tổ', icon: '🏫', badge: `${studentCount} HS` },
    { id: 'stars', label: 'Tích Sao Mỗi Ngày', icon: '⭐', badge: 'Điểm sao' },
    { id: 'leaderboard', label: 'Bảng Sao Tỏa Sáng', icon: '🏆', badge: 'Thi đua' },
    { id: 'certificates', label: 'Góc Tỏa Sáng 3A5', icon: '📜', badge: 'Giấy khen' },
    { id: 'games', label: 'Kho Trò Chơi Lớp 3', icon: '🎮', badge: '10 trò' },
    { id: 'ai-planner', label: 'Trợ Lý Soạn Bài Cô Vân', icon: '✨', badge: 'AI Soạn' },
    { id: 'chatbot', label: 'Bạn Sao Thông Thái', icon: '💬', badge: 'Hỏi đáp' },
    { id: 'tools', label: 'Tiện Ích & Đổi Quà', icon: '🧰', badge: 'Vòng quay' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-300 shadow-md">
      {/* Top Banner with Vietnamese Traditional Crimson & Gold Accent */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white px-3 sm:px-6 py-2 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          {/* Main Title & Logo Area */}
          <div className="flex items-center gap-3">
            {/* Custom SVG Logo: Star + Open Book + Tree of Knowledge */}
            <div className="relative w-12 h-12 flex-shrink-0 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-2xl p-1.5 shadow-lg border-2 border-amber-200 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow">
                {/* Knowledge Tree Trunk & Branches */}
                <path d="M50 78 L50 48 M45 62 Q35 50 32 40 M55 60 Q65 48 68 38" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
                {/* Tree Foliage / Cloud */}
                <circle cx="34" cy="36" r="11" fill="#10b981" opacity="0.9" />
                <circle cx="66" cy="34" r="11" fill="#10b981" opacity="0.9" />
                <circle cx="50" cy="28" r="14" fill="#059669" opacity="0.95" />
                {/* Shining Golden Star at the top */}
                <polygon points="50,6 53,19 66,19 55,27 59,40 50,31 41,40 45,27 34,19 47,19" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
                {/* Open Book Base */}
                <path d="M22 84 Q50 74 50 82 Q50 74 78 84 L74 92 Q50 82 50 90 Q50 82 26 92 Z" fill="#ffffff" stroke="#991b1b" strokeWidth="2" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-yellow-400 border border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-wide text-amber-200 drop-shadow uppercase font-sans">
                  VƯỜN SAO TRI THỨC 3A5
                </h1>
                <span className="bg-amber-400 text-rose-950 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  Lớp 3A5
                </span>
                <span className="hidden sm:inline-block bg-white/20 text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {TEACHER_INFO.school}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-100 flex-wrap">
                <span className="font-semibold text-yellow-300">
                  Giáo viên chủ nhiệm: {TEACHER_INFO.name}
                </span>
                <span className="hidden md:inline">•</span>
                <span className="italic text-amber-100 hidden md:inline">
                  “{TEACHER_INFO.slogan}”
                </span>
              </div>
            </div>
          </div>

          {/* Quick Classroom Control Actions */}
          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition border border-white/20 shadow-sm"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Âm thanh: Tắt' : 'Âm thanh: Bật'}</span>
            </button>

            {/* Presentation / Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium flex items-center gap-1.5 transition border border-white/20 shadow-sm"
              title="Chế độ Trình chiếu Bảng lớp"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4 text-yellow-300" />}
              <span className="hidden lg:inline">{isFullscreen ? 'Thu nhỏ' : 'Trình chiếu bảng'}</span>
            </button>

            {/* Teacher Private Profile / Admin Login */}
            <button
              onClick={onOpenTeacherProfile}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-rose-950 text-xs font-bold flex items-center gap-1.5 transition shadow-md border border-amber-200"
              title="Hồ sơ quản trị Cô Kiều Thị Vân"
            >
              <UserCheck className="w-4 h-4" />
              <span>Hồ sơ Cô Vân</span>
              {isTeacherMode && (
                <span className="w-2 h-2 rounded-full bg-emerald-700 animate-pulse"></span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Slogan ticker for small screens */}
      <div className="md:hidden bg-amber-50 border-b border-amber-200 px-3 py-1 text-center text-xs font-medium text-amber-900">
        ✨ “{TEACHER_INFO.slogan}” ✨
      </div>

      {/* Navigation Bar */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-4 py-2 overflow-x-auto scrollbar-none flex gap-1 sm:gap-2">
        {navTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                sound.playWheelTick();
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 ${
                isActive
                  ? 'bg-rose-900 text-amber-300 shadow-md scale-102 border border-rose-950'
                  : 'bg-slate-100/80 hover:bg-rose-50 text-slate-700 hover:text-rose-900 border border-slate-200/80'
              }`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    isActive ? 'bg-amber-400 text-rose-950' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
