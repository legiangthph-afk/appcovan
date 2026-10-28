import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ClassroomManager } from './components/ClassroomManager';
import { StarAwardModal } from './components/StarAwardModal';
import { LeaderboardView } from './components/LeaderboardView';
import { CertificateView } from './components/CertificateView';
import { GamesHub } from './components/GamesHub';
import { AILessonPlanner } from './components/AILessonPlanner';
import { AIChatbot } from './components/AIChatbot';
import { ClassroomTools } from './components/ClassroomTools';
import { TeacherProfileModal } from './components/TeacherProfileModal';
import { Student, Team, StarTransaction, TeamId } from './types';
import { INITIAL_STUDENTS, INITIAL_TEAMS, TEACHER_INFO } from './data/initialData';
import { sound } from './utils/soundEffects';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('classroom');

  // Teacher Profile & Admin Mode
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(false);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState<boolean>(false);

  // Core Data State (with localStorage persistence)
  const [students, setStudents] = useState<Student[]>(() => {
    const v30 = localStorage.getItem('vuon_sao_3a5_v30_active');
    if (!v30) {
      localStorage.setItem('vuon_sao_3a5_v30_active', 'true');
      localStorage.setItem('vuon_sao_3a5_students', JSON.stringify(INITIAL_STUDENTS));
      return INITIAL_STUDENTS;
    }
    const saved = localStorage.getItem('vuon_sao_3a5_students');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return INITIAL_STUDENTS;
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('vuon_sao_3a5_teams');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TEAMS;
  });

  const [recentTransactions, setRecentTransactions] = useState<StarTransaction[]>(() => {
    const saved = localStorage.getItem('vuon_sao_3a5_txs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return [];
  });

  // Modal State for Awarding Stars
  const [isStarModalOpen, setIsStarModalOpen] = useState(false);
  const [starAwardTargets, setStarAwardTargets] = useState<Student[]>([]);

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('vuon_sao_3a5_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('vuon_sao_3a5_teams', JSON.stringify(teams));
  }, [teams]);

  useEffect(() => {
    localStorage.setItem('vuon_sao_3a5_txs', JSON.stringify(recentTransactions));
  }, [recentTransactions]);

  // Recalculate team star totals whenever students change
  useEffect(() => {
    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        const teamTotal = students
          .filter((s) => s.teamId === t.id)
          .reduce((sum, s) => sum + s.stars, 0);
        return { ...t, totalStars: teamTotal };
      })
    );
  }, [students]);

  // Star Awarding Handler
  const handleAwardStars = (
    studentIds: string[],
    delta: number,
    reason: string,
    category: string
  ) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const newTxs: StarTransaction[] = [];

    // Update students
    setStudents((prev) =>
      prev.map((s) => {
        if (studentIds.includes(s.id)) {
          const newStars = Math.max(0, s.stars + delta);
          const newWeekly = Math.max(0, s.weeklyStars + delta);
          const newMonthly = Math.max(0, s.monthlyStars + delta);

          newTxs.push({
            id: `tx_${Date.now()}_${s.id}`,
            studentId: s.id,
            studentName: s.name,
            teamId: s.teamId,
            delta,
            reason,
            category,
            timestamp: nowStr,
            performer: 'Cô Kiều Thị Vân',
            undone: false,
          });

          return {
            ...s,
            stars: newStars,
            weeklyStars: newWeekly,
            monthlyStars: newMonthly,
          };
        }
        return s;
      })
    );

    setRecentTransactions((prev) => [...newTxs, ...prev].slice(0, 50));
  };

  // Undo transaction handler
  const handleUndoTransaction = (txId: string) => {
    const tx = recentTransactions.find((t) => t.id === txId);
    if (!tx || tx.undone) return;

    // Reverse star on student
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === tx.studentId) {
          return {
            ...s,
            stars: Math.max(0, s.stars - tx.delta),
            weeklyStars: Math.max(0, s.weeklyStars - tx.delta),
            monthlyStars: Math.max(0, s.monthlyStars - tx.delta),
          };
        }
        return s;
      })
    );

    // Mark as undone
    setRecentTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, undone: true } : t))
    );

    sound.playGentleBoing();
    alert(`Đã hoàn tác thao tác tặng sao cho em ${tx.studentName}!`);
  };

  // Single Student Star Trigger
  const handleOpenSingleAward = (student: Student) => {
    setStarAwardTargets([student]);
    setIsStarModalOpen(true);
  };

  // Multi Students Star Trigger
  const handleOpenMultiAward = (selected: Student[]) => {
    if (selected.length === 0) return;
    setStarAwardTargets(selected);
    setIsStarModalOpen(true);
  };

  // Bonus star from games
  const handleBonusStar = (studentId: string, delta: number, reason: string) => {
    handleAwardStars([studentId], delta, reason, 'Trò chơi học tập');
  };

  const handleBonusTeamStar = (teamId: TeamId, delta: number, reason: string) => {
    const teamStudents = students.filter((s) => s.teamId === teamId);
    if (teamStudents.length > 0) {
      handleAwardStars(
        teamStudents.map((s) => s.id),
        delta,
        reason,
        'Thi đua nhóm'
      );
    }
  };

  // Award Title / Badge
  const handleAwardBadge = (studentId: string, badgeTitle: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const currentBadges = s.badges || [];
          if (!currentBadges.includes(badgeTitle)) {
            return { ...s, badges: [badgeTitle, ...currentBadges] };
          }
        }
        return s;
      })
    );
  };

  // Deduct stars for star shop
  const handleDeductStarsForShop = (studentId: string, cost: number, itemTitle: string) => {
    handleAwardStars([studentId], -cost, `Đổi quà: ${itemTitle}`, 'Cửa hàng sao');
  };

  // Restore all data from JSON backup
  const handleRestoreAllData = (backupData: any) => {
    if (backupData.students) setStudents(backupData.students);
    if (backupData.teams) setTeams(backupData.teams);
    if (backupData.recentTransactions) setRecentTransactions(backupData.recentTransactions);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-200 selection:text-rose-950 font-sans">
      {/* Header with Navigation and Branding */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenTeacherProfile={() => setIsTeacherProfileModalOpen(true)}
        isTeacherMode={isTeacherMode}
        setIsTeacherMode={setIsTeacherMode}
        studentCount={students.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-20">
        {activeTab === 'classroom' && (
          <ClassroomManager
            students={students}
            teams={teams}
            onUpdateStudents={setStudents}
            onUpdateTeams={setTeams}
            onOpenStarAward={handleOpenSingleAward}
            onOpenMultiAward={handleOpenMultiAward}
            isTeacherMode={isTeacherMode}
            onOpenTeacherProfile={() => setIsTeacherProfileModalOpen(true)}
          />
        )}

        {activeTab === 'stars' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white">
                    ⭐
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                      HỆ THỐNG TÍCH SAO MỖI NGÀY
                    </h2>
                    <p className="text-xs sm:text-sm text-rose-100">
                      Ghi nhận sự chuyên cần, nỗ lực và ý thức trách nhiệm của {students.length} học sinh lớp 3A5
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenMultiAward(students)}
                  className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-rose-950 text-xs font-black flex items-center gap-1.5 shadow-md transition"
                >
                  <span>✨ Tặng Sao Cả Lớp 3A5</span>
                </button>
              </div>
            </div>

            {/* Quick Star Award Interface directly accessible */}
            <ClassroomManager
              students={students}
              teams={teams}
              onUpdateStudents={setStudents}
              onUpdateTeams={setTeams}
              onOpenStarAward={handleOpenSingleAward}
              onOpenMultiAward={handleOpenMultiAward}
              isTeacherMode={isTeacherMode}
              onOpenTeacherProfile={() => setIsTeacherProfileModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            students={students}
            teams={teams}
            isTeacherMode={isTeacherMode}
            onOpenStarAward={handleOpenSingleAward}
          />
        )}

        {activeTab === 'certificates' && (
          <CertificateView
            students={students}
            teams={teams}
            onAwardBadge={handleAwardBadge}
          />
        )}

        {activeTab === 'games' && (
          <GamesHub
            students={students}
            teams={teams}
            onBonusStar={handleBonusStar}
            onBonusTeamStar={handleBonusTeamStar}
          />
        )}

        {activeTab === 'ai-planner' && (
          <AILessonPlanner
            onAddQuestionsToGame={() => {
              setActiveTab('games');
            }}
          />
        )}

        {activeTab === 'chatbot' && <AIChatbot />}

        {activeTab === 'tools' && (
          <ClassroomTools
            students={students}
            teams={teams}
            onDeductStarsForShop={handleDeductStarsForShop}
            onRestoreAllData={handleRestoreAllData}
            fullAppState={{
              students,
              teams,
              recentTransactions,
              teacher: TEACHER_INFO,
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500 space-y-1 print:hidden">
        <div className="font-bold text-slate-700">
          VƯỜN SAO TRI THỨC 3A5 – CÔ KIỀU THỊ VÂN
        </div>
        <div>
          Lớp 3A5 • {TEACHER_INFO.school} • “{TEACHER_INFO.slogan}”
        </div>
        <div className="text-[11px] text-slate-400">
          Sản phẩm chuyên biệt phục vụ công tác chủ nhiệm, dạy học tương tác và chuyển đổi số giáo dục tiểu học 2026.
        </div>
      </footer>

      {/* Modals */}
      <TeacherProfileModal
        isOpen={isTeacherProfileModalOpen}
        onClose={() => setIsTeacherProfileModalOpen(false)}
        isTeacherMode={isTeacherMode}
        setIsTeacherMode={setIsTeacherMode}
      />

      <StarAwardModal
        isOpen={isStarModalOpen}
        onClose={() => {
          setIsStarModalOpen(false);
          setStarAwardTargets([]);
        }}
        targetStudents={starAwardTargets}
        onAwardStars={handleAwardStars}
        recentTransactions={recentTransactions}
        onUndoTransaction={handleUndoTransaction}
      />
    </div>
  );
}
