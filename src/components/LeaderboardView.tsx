import React, { useState } from 'react';
import { Trophy, Medal, Star, Sparkles, Eye, ShieldCheck, Flame, Award, TrendingUp } from 'lucide-react';
import { Student, Team } from '../types';

interface LeaderboardViewProps {
  students: Student[];
  teams: Team[];
  isTeacherMode: boolean;
  onOpenStarAward: (student: Student) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  students,
  teams,
  isTeacherMode,
  onOpenStarAward,
}) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'semester'>('week');
  const [displayMode, setDisplayMode] = useState<'public' | 'teacher'>('public');

  // Compute team totals
  const teamsWithScores = teams.map((team) => {
    const teamMembers = students.filter((s) => s.teamId === team.id);
    const score = teamMembers.reduce((sum, s) => {
      if (timeframe === 'week') return sum + s.weeklyStars;
      if (timeframe === 'month') return sum + s.monthlyStars;
      return sum + s.stars;
    }, 0);
    return { ...team, currentScore: score, memberCount: teamMembers.length };
  }).sort((a, b) => b.currentScore - a.currentScore);

  // Sort students by chosen timeframe
  const sortedStudents = [...students].sort((a, b) => {
    const scoreA = timeframe === 'week' ? a.weeklyStars : timeframe === 'month' ? a.monthlyStars : a.stars;
    const scoreB = timeframe === 'week' ? b.weeklyStars : timeframe === 'month' ? b.monthlyStars : b.stars;
    return scoreB - scoreA;
  });

  // Public mode: only displays top positive achievers and progress stars (NO bottom ranking to avoid negative labelling)
  const displayedStudents = displayMode === 'public'
    ? sortedStudents.slice(0, 12) // Top 12 positive stars for public classroom board
    : sortedStudents; // Full list for teacher analysis

  const maxTeamScore = Math.max(...teamsWithScores.map((t) => t.currentScore), 1);

  return (
    <div className="space-y-6">
      {/* Banner & View Mode Toggles */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                  BẢNG SAO TỎA SÁNG 3A5
                </h2>
                <span className="bg-amber-400 text-rose-950 text-xs font-bold px-2 py-0.5 rounded-full">
                  Thi Đua Tích Cực
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-100 italic">
                “Tuyên dương những nỗ lực tuyệt vời và sự gắn kết của 4 tổ lớp 3A5”
              </p>
            </div>
          </div>

          {/* Timeframe & Display Mode Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-black/20 p-1 rounded-2xl backdrop-blur-sm flex items-center border border-white/20">
              <button
                onClick={() => setTimeframe('week')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeframe === 'week'
                    ? 'bg-amber-400 text-rose-950 shadow'
                    : 'text-white hover:text-amber-200'
                }`}
              >
                Tuần Này
              </button>
              <button
                onClick={() => setTimeframe('month')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeframe === 'month'
                    ? 'bg-amber-400 text-rose-950 shadow'
                    : 'text-white hover:text-amber-200'
                }`}
              >
                Tháng Này
              </button>
              <button
                onClick={() => setTimeframe('semester')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timeframe === 'semester'
                    ? 'bg-amber-400 text-rose-950 shadow'
                    : 'text-white hover:text-amber-200'
                }`}
              >
                Toàn Diện
              </button>
            </div>

            {/* Public vs Teacher View Toggle */}
            <button
              onClick={() => setDisplayMode(displayMode === 'public' ? 'teacher' : 'public')}
              className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 border border-white/30 transition shadow-sm"
              title="Chuyển chế độ hiển thị"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{displayMode === 'public' ? 'Chế độ Trình chiếu Lớp' : 'Chế độ Phân tích Giáo viên'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode explanation banner */}
      {displayMode === 'public' ? (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Chế độ Trình chiếu Công khai:</strong> Chỉ tôn vinh các Ngôi sao dẫn đầu và gương mặt tiến bộ tiêu biểu; bảo đảm không hiển thị danh sách học sinh điểm thấp, xây dựng môi trường học đường tích cực và tự tin.
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-xs text-amber-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong>Chế độ Giáo viên Chủ nhiệm (Cô Kiều Thị Vân):</strong> Hiển thị đầy đủ số liệu {students.length} học sinh phục vụ công tác theo dõi tiến độ, bồi dưỡng học sinh và nhận xét sổ học bạ.
          </span>
        </div>
      )}

      {/* SECTION 1: 4 TEAMS RACE & COMPARISON */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <h3 className="font-extrabold text-slate-800 text-base">
              Bảng Thi Đua Các Tổ – Lớp 3A5 ({timeframe === 'week' ? 'Tuần này' : timeframe === 'month' ? 'Tháng này' : 'Toàn diện'})
            </h3>
          </div>
          <span className="text-xs text-slate-500 italic">{students.length} thành viên đoàn kết</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teamsWithScores.map((team, idx) => {
            const percent = Math.round((team.currentScore / maxTeamScore) * 100);
            const rankBadges = ['🥇 Quán Quân', '🥈 Á Quân', '🥉 Tiên Phong', '🌱 Nỗ Lực'];

            return (
              <div
                key={team.id}
                className="p-4 rounded-3xl border-2 border-slate-200 bg-slate-50 hover:bg-white hover:border-amber-300 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{team.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{team.name}</h4>
                      <p className="text-[11px] text-slate-500 italic">{team.slogan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900">
                      {rankBadges[idx]}
                    </span>
                    <div className="text-sm font-black text-rose-950 mt-0.5">
                      {team.currentScore} ⭐
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-3 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-amber-400 to-rose-600"
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TOP 3 PODIUM (INDIVIDUAL) */}
      <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border border-amber-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-xs mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Vinh Quang Ngôi Sao Dẫn Đầu
          </div>
          <h3 className="text-lg font-black text-slate-800">
            Top 3 Gương Mặt Tỏa Sáng Xuất Sắc Nhất
          </h3>
        </div>

        {/* Podium Layout */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto items-end pt-4">
          {/* Rank 2 (Silver) */}
          {sortedStudents[1] && (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-2xl shadow-md mb-2">
                🥈
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">
                {sortedStudents[1].name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Tổ {sortedStudents[1].teamId}
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-black text-xs">
                {timeframe === 'week' ? sortedStudents[1].weeklyStars : sortedStudents[1].stars} ⭐
              </div>
              <div className="w-full bg-slate-200 h-16 sm:h-20 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-500 text-lg shadow-inner">
                #2
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {sortedStudents[0] && (
            <div className="flex flex-col items-center text-center -translate-y-2">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-yellow-300 to-amber-500 border-4 border-amber-200 flex items-center justify-center text-3xl shadow-xl mb-2 animate-bounce">
                  👑
                </div>
              </div>
              <div className="font-extrabold text-xs sm:text-base text-rose-950 line-clamp-1">
                {sortedStudents[0].name}
              </div>
              <div className="text-[11px] text-amber-700 font-bold">
                Tổ {sortedStudents[0].teamId} • Thủ Lĩnh Sao
              </div>
              <div className="mt-1 px-3 py-0.5 rounded-full bg-amber-400 text-rose-950 font-black text-sm shadow">
                {timeframe === 'week' ? sortedStudents[0].weeklyStars : sortedStudents[0].stars} ⭐
              </div>
              <div className="w-full bg-gradient-to-t from-amber-400 to-yellow-300 h-24 sm:h-28 rounded-t-2xl mt-3 flex items-center justify-center font-black text-rose-950 text-2xl shadow">
                #1
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {sortedStudents[2] && (
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-md mb-2">
                🥉
              </div>
              <div className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1">
                {sortedStudents[2].name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Tổ {sortedStudents[2].teamId}
              </div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-xs">
                {timeframe === 'week' ? sortedStudents[2].weeklyStars : sortedStudents[2].stars} ⭐
              </div>
              <div className="w-full bg-amber-200 h-12 sm:h-16 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-800 text-lg shadow-inner">
                #3
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: DETAILED TABLE / CARDS */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-base text-slate-800">
            {displayMode === 'public'
              ? 'Danh Sách Ngôi Sao Tiêu Biểu Tỏa Sáng'
              : `Toàn Bộ ${students.length} Học Sinh (Bảng Điểm Giáo Viên)`}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {displayedStudents.length} học sinh
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {displayedStudents.map((st, index) => {
            const score = timeframe === 'week' ? st.weeklyStars : timeframe === 'month' ? st.monthlyStars : st.stars;

            return (
              <div
                key={st.id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-300 bg-slate-50 hover:bg-white flex items-center justify-between transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-black text-slate-400 text-xs w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      {st.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Tổ {st.teamId} • {st.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-xl font-black text-xs flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    {score}
                  </span>
                  <button
                    onClick={() => onOpenStarAward(st)}
                    className="p-1 rounded-lg bg-amber-400 hover:bg-amber-500 text-rose-950 font-bold transition text-xs"
                    title="Tặng sao thêm"
                  >
                    +⭐
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
