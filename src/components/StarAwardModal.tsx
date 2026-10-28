import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Plus, Minus, History, RotateCcw, Check, X, ShieldAlert } from 'lucide-react';
import { Student, StarTransaction } from '../types';
import { STAR_PRESETS } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface StarAwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetStudents: Student[];
  onAwardStars: (
    studentIds: string[],
    delta: number,
    reason: string,
    category: string
  ) => void;
  recentTransactions: StarTransaction[];
  onUndoTransaction: (txId: string) => void;
}

export const StarAwardModal: React.FC<StarAwardModalProps> = ({
  isOpen,
  onClose,
  targetStudents,
  onAwardStars,
  recentTransactions,
  onUndoTransaction,
}) => {
  const [selectedDelta, setSelectedDelta] = useState<number>(2);
  const [reason, setReason] = useState<string>('Hoàn thành bài tập tốt');
  const [category, setCategory] = useState<string>('Học tập');
  const [customDelta, setCustomDelta] = useState<number>(1);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'award' | 'history'>('award');

  if (!isOpen || targetStudents.length === 0) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981', '#6366f1'],
    });
  };

  const handleApplyPreset = (preset: typeof STAR_PRESETS[0]) => {
    setSelectedDelta(preset.stars);
    setReason(preset.reason);
    setCategory(preset.category);
    setIsCustomMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDelta = isCustomMode ? customDelta : selectedDelta;
    if (finalDelta === 0) return;

    const ids = targetStudents.map((s) => s.id);
    onAwardStars(ids, finalDelta, reason, category);

    if (finalDelta > 0) {
      sound.playStarReward();
      triggerConfetti();
    } else {
      sound.playGentleBoing();
    }

    onClose();
  };

  const isMulti = targetStudents.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-amber-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-amber-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-2xl shadow">
              ⭐
            </div>
            <div>
              <h3 className="font-extrabold text-amber-200 text-base">
                Tích Sao Mỗi Ngày – Lớp 3A5
              </h3>
              <p className="text-xs text-rose-100">
                {isMulti
                  ? `Đang chọn ${targetStudents.length} học sinh để khen thưởng tập thể`
                  : `${targetStudents[0].name} (${targetStudents[0].id}) • Hiện có ${targetStudents[0].stars} sao`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('award')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'award'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Tặng Sao Khích Lệ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition flex items-center gap-1 ${
              activeTab === 'history'
                ? 'border-rose-900 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Nhật Ký Tặng Sao & Hoàn Tác
          </button>
        </div>

        {activeTab === 'award' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* List of target names if multiple */}
            {isMulti && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Danh sách học sinh nhận sao ({targetStudents.length}):</span>{' '}
                <span className="italic">{targetStudents.map((s) => s.name).join(', ')}</span>
              </div>
            )}

            {/* Presets List */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Chọn tiêu chí khen thưởng mẫu:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STAR_PRESETS.map((preset, idx) => {
                  const isSelected = !isCustomMode && reason === preset.reason;
                  const isPositive = preset.stars > 0;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className={`p-2.5 rounded-2xl text-left border-2 transition flex items-center justify-between text-xs font-bold ${
                        isSelected
                          ? isPositive
                            ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-sm'
                            : 'border-rose-500 bg-rose-50 text-rose-900'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{preset.icon}</span>
                        <span className="truncate">{preset.reason}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                          isPositive ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {preset.stars > 0 ? `+${preset.stars}` : preset.stars} ⭐
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Mode Toggle */}
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-xs font-bold text-rose-900 hover:underline flex items-center gap-1"
              >
                {isCustomMode ? '← Sử dụng tiêu chuẩn mẫu' : '✏️ Nhập lý do và số sao tùy chỉnh...'}
              </button>
            </div>

            {isCustomMode && (
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Điều chỉnh số sao:</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomDelta(customDelta - 1)}
                      className="w-8 h-8 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-black text-sm w-12 text-center text-slate-800">
                      {customDelta > 0 ? `+${customDelta}` : customDelta} ⭐
                    </span>
                    <button
                      type="button"
                      onClick={() => setCustomDelta(customDelta + 1)}
                      className="w-8 h-8 rounded-xl bg-amber-400 hover:bg-amber-500 text-rose-950 font-bold flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ghi rõ lý do khen ngợi / nhắc nhở:
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Ví dụ: Giúp đỡ bạn cùng tiến trong giờ Toán..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-800 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Humanistic Reminder note */}
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 italic">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span>
                Người thực hiện: <strong>Cô Kiều Thị Vân</strong> • Tôn trọng tiến bộ và tạo niềm vui cho trẻ.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-rose-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5"
              >
                <Star className="w-4 h-4 fill-rose-950" />
                <span>Xác Nhận Tích Sao ({isCustomMode ? customDelta : selectedDelta} ⭐)</span>
              </button>
            </div>
          </form>
        ) : (
          /* Transaction History & Undo Tab */
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            <div className="text-xs text-slate-500 mb-2">
              Lịch sử ghi nhận thao tác gần đây. Cô Vân có thể bấm <strong>Hoàn tác</strong> nếu lỡ thao tác nhầm:
            </div>

            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có lịch sử tặng sao nào trong phiên này.
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition ${
                    tx.undone
                      ? 'bg-slate-100 border-slate-200 opacity-60 line-through'
                      : 'bg-white border-slate-200 shadow-sm'
                  }`}
                >
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{tx.studentName}</span>
                      <span
                        className={`font-black ${
                          tx.delta > 0 ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.delta > 0 ? `+${tx.delta}` : tx.delta} ⭐
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">{tx.reason}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {tx.timestamp} • Bởi {tx.performer}
                    </div>
                  </div>

                  {!tx.undone && (
                    <button
                      type="button"
                      onClick={() => onUndoTransaction(tx.id)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-rose-200 transition"
                      title="Hoàn tác thao tác này"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Hoàn tác</span>
                    </button>
                  )}
                  {tx.undone && (
                    <span className="text-[10px] text-slate-500 italic">Đã hoàn tác</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
