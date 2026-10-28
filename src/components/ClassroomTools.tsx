import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw, Sparkles, Star, Clock, ShoppingBag, BookOpen,
  Download, Upload, Play, Pause, Bell, HelpCircle, Check, Award
} from 'lucide-react';
import { Student, Team, ShopItem, DiaryEntry } from '../types';
import { INITIAL_SHOP_ITEMS, TEACHER_INFO } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface ClassroomToolsProps {
  students: Student[];
  teams: Team[];
  onDeductStarsForShop: (studentId: string, cost: number, itemTitle: string) => void;
  onRestoreAllData: (data: any) => void;
  fullAppState: any;
}

export const ClassroomTools: React.FC<ClassroomToolsProps> = ({
  students,
  teams,
  onDeductStarsForShop,
  onRestoreAllData,
  fullAppState,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'wheel' | 'timer' | 'shop' | 'diary' | 'backup' | 'guide'>('wheel');

  // --- LUCKY WHEEL STATE ---
  const [wheelTeamFilter, setWheelTeamFilter] = useState<number | 'all'>('all');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const eligibleStudents = students.filter(
    (s) => wheelTeamFilter === 'all' || s.teamId === wheelTeamFilter
  );

  const spinLuckyWheel = () => {
    if (isSpinning || eligibleStudents.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    sound.playWheelTick();

    const randomIndex = Math.floor(Math.random() * eligibleStudents.length);
    const chosen = eligibleStudents[randomIndex];

    const spinTurns = 5 + Math.floor(Math.random() * 3);
    const extraDegrees = Math.floor(Math.random() * 360);
    const totalRotation = wheelRotation + spinTurns * 360 + extraDegrees;
    setWheelRotation(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinner(chosen);
      sound.playCelebration();
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 3200);
  };

  // --- CLASSROOM TIMER STATE ---
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(5 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0 && isTimerActive) {
      setIsTimerActive(false);
      sound.playTimerBell();
      confetti({ particleCount: 70, spread: 70 });
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSecondsLeft]);

  const setTimerPreset = (mins: number) => {
    setIsTimerActive(false);
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
  };

  // --- STAR SHOP STATE ---
  const [shopItems, setShopItems] = useState<ShopItem[]>(INITIAL_SHOP_ITEMS);
  const [selectedBuyerId, setSelectedBuyerId] = useState<string>(students[0]?.id || 'HS01');

  const handleBuyReward = (item: ShopItem) => {
    const buyer = students.find((s) => s.id === selectedBuyerId);
    if (!buyer) return;

    if (buyer.stars < item.starsRequired) {
      alert(`Em ${buyer.name} hiện có ${buyer.stars} sao, cần ${item.starsRequired} sao để đổi phần quà này nhé! 🌟`);
      sound.playGentleBoing();
      return;
    }

    if (confirm(`Xác nhận đổi phần quà "${item.title}" (${item.starsRequired} sao) cho em ${buyer.name}?`)) {
      onDeductStarsForShop(buyer.id, item.starsRequired, item.title);
      sound.playCelebration();
      confetti({ particleCount: 50, spread: 60 });
      alert(`Chúc mừng em ${buyer.name} đã đổi thành công "${item.title}"! 🎁`);
    }
  };

  // --- TEACHER DIARY STATE ---
  const [diaryList, setDiaryList] = useState<DiaryEntry[]>([
    {
      id: 'd_1',
      date: '28/10/2026',
      title: 'Tiết Toán: Cả 4 tổ đều tích cực giơ tay',
      content: 'Hôm nay các con làm bài tập bảng nhân 8 rất nhanh. Tổ 1 và Tổ 4 thi đua sôi nổi, em Tuấn Kiệt và An Nhiên giải bài có lời văn rất mạch lạc.',
      mood: 'Tự hào',
      category: 'Học tập',
    },
    {
      id: 'd_2',
      date: '27/10/2026',
      title: 'Giờ ra chơi an toàn và văn hóa đọc',
      content: 'Tủ sách lớp 3A5 được các em mượn đọc nhiều. Các tổ phân công giữ gìn vệ sinh lớp rất sạch sẽ, xứng danh trường Ngô Thì Nhậm.',
      mood: 'Vui vẻ',
      category: 'Nề nếp',
    },
  ]);
  const [newDiaryTitle, setNewDiaryTitle] = useState('');
  const [newDiaryContent, setNewDiaryContent] = useState('');

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiaryTitle.trim()) return;
    const newEntry: DiaryEntry = {
      id: `d_${Date.now()}`,
      date: new Date().toLocaleDateString('vi-VN'),
      title: newDiaryTitle,
      content: newDiaryContent,
      mood: 'Tích cực',
      category: 'Ý tưởng mới',
    };
    setDiaryList([newEntry, ...diaryList]);
    setNewDiaryTitle('');
    setNewDiaryContent('');
    sound.playStarReward();
  };

  // --- BACKUP & RESTORE ---
  const handleExportBackup = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullAppState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `SaoLuu_VuonSaoTriThuc_3A5_CoKieuThiVan_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sound.playStarReward();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.teams) {
          onRestoreAllData(parsed);
          sound.playCelebration();
          alert('Đã khôi phục thành công toàn bộ dữ liệu lớp 3A5!');
        } else {
          alert('Tệp sao lưu không đúng định dạng của Vườn Sao Tri Thức 3A5.');
        }
      } catch {
        alert('Lỗi giải mã tệp sao lưu.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveSubTab('wheel')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'wheel' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎡</span>
          <span>Vòng Quay Gọi Tên</span>
        </button>
        <button
          onClick={() => setActiveSubTab('timer')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'timer' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⏱️</span>
          <span>Đồng Hồ Lớp Học</span>
        </button>
        <button
          onClick={() => setActiveSubTab('shop')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'shop' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎁</span>
          <span>Cửa Hàng Đổi Sao</span>
        </button>
        <button
          onClick={() => setActiveSubTab('diary')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'diary' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📖</span>
          <span>Nhật Ký Cô Vân</span>
        </button>
        <button
          onClick={() => setActiveSubTab('backup')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'backup' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>💾</span>
          <span>Sao Lưu & Phục Hồi</span>
        </button>
        <button
          onClick={() => setActiveSubTab('guide')}
          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0 ${
            activeSubTab === 'guide' ? 'bg-rose-900 text-amber-300 shadow' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📘</span>
          <span>Hướng Dẫn Sử Dụng</span>
        </button>
      </div>

      {/* 1. LUCKY WHEEL (VÒNG QUAY MAY MẮN) */}
      {activeSubTab === 'wheel' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-center max-w-2xl mx-auto">
          <div>
            <span className="text-4xl">🎡</span>
            <h3 className="text-xl font-black text-rose-950 uppercase mt-1">
              VÒNG QUAY GỌI TÊN CÔNG BẰNG 3A5
            </h3>
            <p className="text-xs text-slate-500">
              Chọn ngẫu nhiên bạn học sinh lên bảng phát biểu hoặc nhận phần quà bất ngờ
            </p>
          </div>

          {/* Filter by Team */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            <button
              onClick={() => setWheelTeamFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                wheelTeamFilter === 'all'
                  ? 'bg-rose-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              Cả Lớp ({students.length})
            </button>
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setWheelTeamFilter(t.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  wheelTeamFilter === t.id
                    ? 'bg-rose-900 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {t.icon} Tổ {t.id}
              </button>
            ))}
          </div>

          {/* Wheel Graphic */}
          <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
            {/* Pointer arrow at top */}
            <div className="absolute -top-3 z-20 text-rose-700 text-3xl font-black">
              ▼
            </div>

            <div
              className="w-full h-full rounded-full border-8 border-amber-400 shadow-2xl flex items-center justify-center font-black text-white transition-transform duration-3000 ease-out overflow-hidden"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                background:
                  'conic-gradient(#f59e0b 0deg 90deg, #0284c7 90deg 180deg, #7c3aed 180deg 270deg, #16a34a 270deg 360deg)',
              }}
            >
              <div className="w-20 h-20 rounded-full bg-white border-4 border-amber-300 shadow-lg flex items-center justify-center text-rose-950 font-black text-xl">
                ⭐
              </div>
            </div>
          </div>

          {/* Spin Trigger Button */}
          <div>
            <button
              disabled={isSpinning}
              onClick={spinLuckyWheel}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-rose-950 font-black rounded-2xl text-sm shadow-xl transition transform active:scale-95 disabled:opacity-50"
            >
              {isSpinning ? 'ĐANG QUAY HỒI HỘP...' : 'BẮT ĐẦU QUAY NGAY 🎯'}
            </button>
          </div>

          {/* Winner Announcement Banner */}
          {winner && (
            <div className="p-6 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-3xl border-2 border-amber-400 animate-bounce shadow-lg">
              <span className="text-3xl">🎉</span>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-widest mt-1">
                Chúc Mừng Ngôi Sao May Mắn:
              </h4>
              <div className="text-2xl sm:text-3xl font-black text-rose-950 my-1 font-serif">
                {winner.name}
              </div>
              <p className="text-xs font-bold text-amber-800">
                Mã: {winner.id} • {teams.find((t) => t.id === winner.teamId)?.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. CLASSROOM TIMER (ĐỒNG HỒ ĐẾM NGƯỢC) */}
      {activeSubTab === 'timer' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 text-center max-w-xl mx-auto">
          <div>
            <span className="text-4xl">⏱️</span>
            <h3 className="text-xl font-black text-rose-950 uppercase mt-1">
              ĐỒNG HỒ HOẠT ĐỘNG NHÓM & LÀM BÀI
            </h3>
            <p className="text-xs text-slate-500">
              Hỗ trợ quản lý thời gian thảo luận nhóm, thi đua giữa 4 tổ lớp 3A5
            </p>
          </div>

          {/* Big Digital Display */}
          <div className="p-8 bg-slate-900 text-amber-300 rounded-3xl shadow-2xl font-mono text-5xl sm:text-6xl font-black tracking-widest border-4 border-amber-400 flex items-center justify-center">
            {String(Math.floor(timerSecondsLeft / 60)).padStart(2, '0')}:
            {String(timerSecondsLeft % 60).padStart(2, '0')}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[1, 2, 3, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                onClick={() => setTimerPreset(mins)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  timerMinutes === mins && !isTimerActive
                    ? 'bg-rose-900 text-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {mins} phút
              </button>
            ))}
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsTimerActive(!isTimerActive)}
              className={`px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 ${
                isTimerActive
                  ? 'bg-amber-500 hover:bg-amber-600 text-rose-950'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isTimerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isTimerActive ? 'Tạm Dừng' : 'Bắt Đầu Đếm Ngược'}</span>
            </button>

            <button
              onClick={() => setTimerPreset(timerMinutes)}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Đặt Lại</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. STAR SHOP (CỬA HÀNG ĐỔI SAO) */}
      {activeSubTab === 'shop' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <span>🎁</span> Cửa Hàng Ngôi Sao Đổi Quà – Lớp 3A5
              </h3>
              <p className="text-xs text-slate-500">
                Quy đổi những ngôi sao chăm ngoan thành những đặc quyền và quà tặng dễ thương
              </p>
            </div>

            {/* Buyer Select */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Học sinh đổi quà:</span>
              <select
                value={selectedBuyerId}
                onChange={(e) => setSelectedBuyerId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-rose-900 focus:outline-none"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.stars} ⭐)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50/50 hover:bg-white transition flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{item.icon}</span>
                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {item.starsRequired} sao
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 mb-1">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">{item.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Còn lại: {item.stock} phần</span>
                  <button
                    onClick={() => handleBuyReward(item)}
                    className="px-3.5 py-1.5 bg-rose-900 hover:bg-rose-950 text-amber-300 font-bold text-xs rounded-xl shadow transition"
                  >
                    Đổi Quà Ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TEACHER DIARY */}
      {activeSubTab === 'diary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* New Entry Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5">
              <span>✍️</span> Ghi Nhật Ký Chủ Nhiệm
            </h4>
            <form onSubmit={handleAddDiary} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề ghi chú:</label>
                <input
                  type="text"
                  required
                  value={newDiaryTitle}
                  onChange={(e) => setNewDiaryTitle(e.target.value)}
                  placeholder="Ví dụ: Giờ sinh hoạt lớp tuần 8..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết:</label>
                <textarea
                  rows={4}
                  required
                  value={newDiaryContent}
                  onChange={(e) => setNewDiaryContent(e.target.value)}
                  placeholder="Ghi nhận nề nếp, phản ánh sự tiến bộ của học sinh..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-rose-800"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-rose-900 text-amber-300 rounded-xl font-bold text-xs shadow hover:bg-rose-950"
              >
                Lưu Nhật Ký Cô Vân
              </button>
            </form>
          </div>

          {/* Diary Entries List */}
          <div className="md:col-span-2 space-y-3">
            {diaryList.map((entry) => (
              <div
                key={entry.id}
                className="p-4 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-rose-900">{entry.title}</span>
                  <span className="text-[11px] text-slate-400 font-mono">{entry.date}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{entry.content}</p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Tâm thế: {entry.mood}</span>
                  <span>Chủ đề: {entry.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. BACKUP & RESTORE */}
      {activeSubTab === 'backup' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-xl mx-auto">
          <div className="text-center">
            <span className="text-4xl">💾</span>
            <h3 className="text-lg font-black text-slate-800 uppercase mt-1">
              SAO LƯU & PHỤC HỒI DỮ LIỆU LỚP 3A5
            </h3>
            <p className="text-xs text-slate-500">
              Xuất tệp an toàn để lưu về máy tính hoặc chuyển sang máy tính tương tác tại lớp
            </p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
            <strong>Bảo vệ dữ liệu sư phạm:</strong> Tệp sao lưu JSON chứa toàn bộ danh sách {students.length} học sinh, các tổ thi đua, điểm tích sao, lịch sử giao dịch và nhật ký lớp học. Cô Vân nên sao lưu định kỳ hàng tuần.
          </div>

          <div className="space-y-3">
            <button
              onClick={handleExportBackup}
              className="w-full py-3 bg-gradient-to-r from-rose-900 to-amber-700 hover:from-rose-950 hover:to-amber-800 text-amber-300 font-extrabold rounded-2xl text-xs shadow-md flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Tải Tệp Sao Lưu (.JSON) Về Máy Tính</span>
            </button>

            <label className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-300 cursor-pointer transition">
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Khôi Phục Dữ Liệu Từ Tệp Sao Lưu (.JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* 6. USER MANUAL & DEPLOYMENT GUIDE */}
      {activeSubTab === 'guide' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 max-w-3xl mx-auto">
          <div className="text-center border-b border-slate-100 pb-4">
            <span className="text-4xl">📘</span>
            <h3 className="text-xl font-black text-rose-950 uppercase mt-1">
              HƯỚNG DẪN GIÁO VIÊN SỬ DỤNG & TRIỂN KHAI LỚP HỌC
            </h3>
            <p className="text-xs text-slate-500">
              Ứng dụng “Vườn Sao Tri Thức 3A5 – Cô Kiều Thị Vân”
            </p>
          </div>

          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-sm text-rose-900 mb-1">
                1. Đầu giờ học: Điểm danh và khởi động
              </h4>
              <p>
                - Bật <strong>Chế độ Trình chiếu Bảng</strong> ở góc trên bên phải để tối ưu hiển thị trên tivi/màn hình tương tác.<br />
                - Vào mục <strong>Lớp 3A5 & 4 Tổ</strong>, chọn tab <strong>Điểm Danh Sáng</strong> và bấm 1 chạm “Điểm danh đủ cả lớp”.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-sm text-rose-900 mb-1">
                2. Trong tiết học: Tích sao và tổ chức trò chơi
              </h4>
              <p>
                - Sử dụng <strong>Tích Sao Mỗi Ngày</strong> để tặng sao ngay khi học sinh phát biểu, làm bài tập tốt hoặc giúp đỡ bạn bè.<br />
                - Khi tổ chức thảo luận nhóm, sử dụng <strong>Đồng Hồ Lớp Học</strong> và <strong>Vòng Quay Gọi Tên</strong> để tạo không khí công bằng, hào hứng.<br />
                - Trải nghiệm <strong>10 trò chơi tương tác</strong> chuẩn GDPT 2018 theo từng môn học.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h4 className="font-bold text-sm text-rose-900 mb-1">
                3. Cuối tuần: Tuyên dương và in giấy khen điện tử
              </h4>
              <p>
                - Mở <strong>Bảng Sao Tỏa Sáng</strong> để công bố thành tích tuần của 4 tổ.<br />
                - Vào <strong>Góc Tỏa Sáng 3A5</strong> để chọn trao 8 danh hiệu danh dự và bấm “In Giấy Khen” phát cho học sinh xuất sắc.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
