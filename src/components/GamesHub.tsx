import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Gamepad2, Play, RotateCcw, Award, CheckCircle2, XCircle,
  HelpCircle, Sparkles, Star, Clock, Compass, ShieldCheck,
  ChevronRight, Volume2
} from 'lucide-react';
import { QuizQuestion, Student, Team, TeamId } from '../types';
import { CURATED_QUESTIONS } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface GamesHubProps {
  students: Student[];
  teams: Team[];
  onBonusStar: (studentId: string, delta: number, reason: string) => void;
  onBonusTeamStar: (teamId: TeamId, delta: number, reason: string) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({
  students,
  teams,
  onBonusStar,
  onBonusTeamStar,
}) => {
  const subjects = [
    'Tất cả các môn',
    'Toán',
    'Tiếng Việt',
    'Tự nhiên và Xã hội',
    'Tiếng Anh',
    'Đạo đức',
    'Tin học',
    'Công nghệ',
    'Hoạt động trải nghiệm',
  ];

  const gameTypes = [
    { id: 'speed', title: 'Ai Nhanh Hơn?', icon: '⚡', desc: 'Đố vui tốc độ, đồng hồ đếm ngược kịch tính' },
    { id: 'wheel', title: 'Chiếc Nón Tri Thức', icon: '🎡', desc: 'Quay ô điểm thưởng và giải câu hỏi trí tuệ' },
    { id: 'doors', title: 'Ô Cửa Bí Mật', icon: '🚪', desc: 'Mở 6 ô cửa bí mật khám phá kho tàng kiến thức' },
    { id: 'bell', title: 'Rung Chuông Vàng', icon: '🔔', desc: 'Đấu trường sinh tồn qua các chặng câu hỏi' },
    { id: 'race', title: 'Đường Đua Ngôi Sao', icon: '🏎️', desc: 'Cuộc đua 4 tổ (Sao Chăm Chỉ, Mặt Trời, Cầu Vồng, Mầm Xanh)' },
    { id: 'matching', title: 'Ghép Đôi Thông Minh', icon: '🧩', desc: 'Nối khái niệm, phép tính và kết quả chuẩn xác' },
    { id: 'memory', title: 'Lật Thẻ Ghi Nhớ', icon: '🃏', desc: 'Trò chơi rèn luyện trí nhớ và phản xạ nhanh' },
    { id: 'obstacle', title: 'Vượt Chướng Ngại Vật', icon: '🧗', desc: 'Vượt qua 4 trạm câu hỏi để về đích an toàn' },
    { id: 'true_false', title: 'Đúng Hay Sai?', icon: '⚖️', desc: 'Nhận định đúng sai siêu tốc trong 10 giây' },
    { id: 'treasure', title: 'Kho Báu Tri Thức', icon: '💎', desc: 'Thu thập 3 chìa khóa vàng mở rương kho báu' },
  ];

  const [selectedSubject, setSelectedSubject] = useState<string>('Tất cả các môn');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(15);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [secretDoorsOpened, setSecretDoorsOpened] = useState<number[]>([]);
  const [wheelAngle, setWheelAngle] = useState<number>(0);
  const [wheelBonus, setWheelBonus] = useState<number>(10);
  const [isSpinningWheel, setIsSpinningWheel] = useState<boolean>(false);

  // Team race progress (0 to 5 steps)
  const [teamRacePositions, setTeamRacePositions] = useState<{ [key: number]: number }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  });

  // Filter questions
  const availableQuestions = CURATED_QUESTIONS.filter(
    (q) => selectedSubject === 'Tất cả các môn' || q.subject === selectedSubject
  );

  const currentQ = availableQuestions[currentQuestionIndex] || availableQuestions[0];

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setIsAnswerSubmitted(true);
      sound.playGentleBoing();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Start a game
  const startGame = (gameId: string) => {
    setActiveGameId(gameId);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setTimerSeconds(15);
    setIsTimerRunning(true);
    setSecretDoorsOpened([]);
    sound.playStarReward();
  };

  // Exit Game
  const exitGame = () => {
    setActiveGameId(null);
    setIsTimerRunning(false);
  };

  // Answer selection
  const handleSelectOption = (opt: string) => {
    if (isAnswerSubmitted) return;
    setSelectedOption(opt);
    setIsAnswerSubmitted(true);
    setIsTimerRunning(false);

    const isCorrect = opt.startsWith(String(currentQ.correctAnswer));
    if (isCorrect) {
      sound.playCorrect();
      setScore((prev) => prev + 1);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      sound.playGentleBoing();
    }
  };

  // Next Question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < availableQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimerSeconds(15);
      setIsTimerRunning(true);
    } else {
      // Completed game
      sound.playCelebration();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    }
  };

  // Wheel spin
  const handleSpinWheel = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    sound.playWheelTick();

    const randomDegrees = 1440 + Math.floor(Math.random() * 360);
    const newAngle = wheelAngle + randomDegrees;
    setWheelAngle(newAngle);

    const bonuses = [5, 10, 15, 20, 25, 50];
    const pickedBonus = bonuses[Math.floor(Math.random() * bonuses.length)];

    setTimeout(() => {
      setIsSpinningWheel(false);
      setWheelBonus(pickedBonus);
      sound.playCelebration();
    }, 3000);
  };

  // Move a team forward in "Đường Đua Ngôi Sao"
  const handleAdvanceTeam = (teamId: TeamId) => {
    setTeamRacePositions((prev) => {
      const nextPos = Math.min((prev[teamId] || 0) + 1, 5);
      if (nextPos === 5) {
        sound.playCelebration();
        confetti({ particleCount: 120, spread: 100 });
        alert(`Chúc mừng ${teams.find((t) => t.id === teamId)?.name} đã về đích xuất sắc! 🏁`);
      } else {
        sound.playCorrect();
      }
      return { ...prev, [teamId]: nextPos };
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white">
              🎮
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                KHO TRÒ CHƠI HỌC TẬP TƯƠNG TÁC LỚP 3
              </h2>
              <p className="text-xs sm:text-sm text-rose-100">
                “10 hình thức trò chơi phong phú • Chuẩn Chương trình GDPT 2018 • Gắn kết 4 tổ”
              </p>
            </div>
          </div>

          {activeGameId && (
            <button
              onClick={exitGame}
              className="px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thoát Trò Chơi</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Bar */}
      {!activeGameId && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Lọc theo Môn Học:</span>
            <span className="text-xs text-slate-500">
              Ngân hàng có {availableQuestions.length} câu hỏi phù hợp
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {subjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                  selectedSubject === sub
                    ? 'bg-rose-900 text-amber-300 shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME SELECTOR GRID (WHEN NO GAME IS PLAYING) */}
      {!activeGameId && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {gameTypes.map((game, idx) => (
            <div
              key={game.id}
              className="bg-white rounded-3xl p-5 border-2 border-slate-200 hover:border-amber-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl p-2.5 rounded-2xl bg-slate-100 group-hover:bg-amber-100 transition">
                    {game.icon}
                  </span>
                  <span className="text-[11px] font-black text-slate-400">#{idx + 1}</span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm group-hover:text-rose-900 mb-1">
                  {game.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {game.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  onClick={() => startGame(game.id)}
                  className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-rose-950 font-black rounded-xl text-xs shadow-sm flex items-center justify-center gap-1 transition"
                >
                  <Play className="w-3.5 h-3.5 fill-rose-950" />
                  <span>Chơi Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIVE GAME PLAYGROUND */}
      {activeGameId && (
        <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-xl p-6 sm:p-8 relative overflow-hidden animate-fade-in">
          {/* Top Status Bar: Timer, Score, Subject */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                {currentQ.subject} • {currentQ.topic}
              </span>
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                Câu {currentQuestionIndex + 1} / {availableQuestions.length}
              </span>
            </div>

            <div className="flex items-center gap-4">
              {/* Countdown Clock */}
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black shadow-inner ${
                  timerSeconds <= 5
                    ? 'bg-rose-100 text-rose-700 animate-pulse'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{timerSeconds}s</span>
              </div>

              {/* Score */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-400 text-rose-950 font-black text-xs shadow">
                <Star className="w-4 h-4 fill-rose-950" />
                <span>Điểm: {score}</span>
              </div>
            </div>
          </div>

          {/* GAME SPECIFIC INTERFACE: WHEEL OF FORTUNE */}
          {activeGameId === 'wheel' && (
            <div className="mb-6 p-4 rounded-3xl bg-amber-50 border border-amber-200 text-center">
              <h4 className="text-xs font-bold text-amber-900 mb-2">
                Quay Chiếc Nón Tri Thức Để Nhận Điểm Thưởng!
              </h4>
              <div className="flex flex-col items-center justify-center gap-3">
                <div
                  className="w-32 h-32 rounded-full border-4 border-amber-400 shadow-lg flex items-center justify-center font-black text-xl text-amber-900 bg-gradient-to-tr from-yellow-300 via-amber-200 to-yellow-400 transition-transform duration-3000 ease-out"
                  style={{ transform: `rotate(${wheelAngle}deg)` }}
                >
                  🎯 {wheelBonus} ⭐
                </div>
                <button
                  disabled={isSpinningWheel}
                  onClick={handleSpinWheel}
                  className="px-5 py-2 bg-rose-900 hover:bg-rose-950 text-amber-300 rounded-xl font-bold text-xs shadow disabled:opacity-50"
                >
                  {isSpinningWheel ? 'Đang quay...' : 'Quay Vòng Điểm'}
                </button>
              </div>
            </div>
          )}

          {/* GAME SPECIFIC INTERFACE: SECRET DOORS */}
          {activeGameId === 'doors' && (
            <div className="mb-6 p-4 rounded-3xl bg-slate-50 border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 mb-2 text-center">
                Chọn 1 Trong 6 Ô Cửa Bí Mật Để Trả Lời:
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const isOpen = secretDoorsOpened.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => {
                        if (!isOpen) {
                          setSecretDoorsOpened([...secretDoorsOpened, num]);
                          sound.playStarReward();
                        }
                      }}
                      className={`h-16 rounded-2xl font-black text-base flex flex-col items-center justify-center transition shadow-sm ${
                        isOpen
                          ? 'bg-amber-100 text-amber-800 border-2 border-amber-400'
                          : 'bg-rose-900 text-amber-200 hover:bg-rose-800 border-2 border-rose-950'
                      }`}
                    >
                      <span>{isOpen ? '🌟' : '🚪'}</span>
                      <span className="text-xs">Cửa {num}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* GAME SPECIFIC INTERFACE: 4 TEAMS RACE */}
          {activeGameId === 'race' && (
            <div className="mb-6 p-4 rounded-3xl bg-sky-50 border border-sky-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-sky-900">
                  🏁 Đường Đua Ngôi Sao 4 Tổ: Bấm nút để tiến lên khi trả lời đúng!
                </h4>
              </div>
              <div className="space-y-2">
                {teams.map((t) => {
                  const pos = teamRacePositions[t.id] || 0;
                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between bg-white p-2 rounded-2xl border border-sky-100 text-xs"
                    >
                      <span className="font-bold text-slate-800 w-32 truncate">{t.name}</span>
                      <div className="flex-1 mx-3 bg-slate-100 h-4 rounded-full relative flex items-center px-1">
                        <div
                          className="absolute text-base transition-all duration-500"
                          style={{ left: `${(pos / 5) * 85}%` }}
                        >
                          {t.icon}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAdvanceTeam(t.id)}
                        className="px-2 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-[10px]"
                      >
                        Tiến 1 bước ⏩
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MAIN QUESTION DISPLAY */}
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 text-center">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-amber-200/60 text-amber-900 mb-2">
                Mức độ: {currentQ.difficulty}
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-800 leading-relaxed">
                {currentQ.question}
              </h3>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === opt;
                const isCorrect = opt.startsWith(String(currentQ.correctAnswer));
                let optStyle =
                  'bg-white border-2 border-slate-200 text-slate-800 hover:border-amber-400 hover:bg-amber-50/20';

                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optStyle = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-900 shadow-sm';
                  } else if (isSelected && !isCorrect) {
                    optStyle = 'bg-rose-50 border-2 border-rose-500 text-rose-900';
                  } else {
                    optStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted}
                    onClick={() => handleSelectOption(opt)}
                    className={`p-4 rounded-2xl text-left text-xs sm:text-sm font-bold transition flex items-center justify-between shadow-sm ${optStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 ml-2" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Pedagogical Explanation Box */}
            {isAnswerSubmitted && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1 animate-fade-in">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-700" />
                  <span>Lời Giải Thích Của Cô Kiều Thị Vân:</span>
                </div>
                <p className="leading-relaxed italic pl-5">{currentQ.explanation}</p>
              </div>
            )}

            {/* Next Question / Finish Action */}
            {isAnswerSubmitted && (
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-900 to-amber-700 hover:from-rose-950 hover:to-amber-800 text-amber-300 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 animate-bounce"
                >
                  <span>
                    {currentQuestionIndex < availableQuestions.length - 1
                      ? 'Câu Tiếp Theo'
                      : 'Hoàn Thành Trò Chơi 🏆'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
