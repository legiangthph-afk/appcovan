import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Award, Printer, Download, Sparkles, Check, Star, Calendar, UserCheck } from 'lucide-react';
import { Student, Team } from '../types';
import { OFFICIAL_TITLES, TEACHER_INFO } from '../data/initialData';
import { sound } from '../utils/soundEffects';

interface CertificateViewProps {
  students: Student[];
  teams: Team[];
  onAwardBadge: (studentId: string, badgeTitle: string) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  students,
  teams,
  onAwardBadge,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || 'HS01');
  const [selectedTitleId, setSelectedTitleId] = useState<string>(OFFICIAL_TITLES[0].id);
  const [customCitation, setCustomCitation] = useState<string>(
    'Đã có thành tích xuất sắc, chăm chỉ rèn luyện và gương mẫu tích cực trong phong trào thi đua lớp 3A5'
  );
  const [awardDate, setAwardDate] = useState<string>(
    new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];
  const currentTitle = OFFICIAL_TITLES.find((t) => t.id === selectedTitleId) || OFFICIAL_TITLES[0];
  const currentTeam = teams.find((t) => t.id === currentStudent?.teamId);

  const handlePrint = () => {
    sound.playCelebration();
    window.print();
  };

  const handleConfirmAward = () => {
    if (!currentStudent) return;
    onAwardBadge(currentStudent.id, currentTitle.title);
    sound.playCelebration();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981', '#3b82f6'],
    });
    alert(`Đã trao tặng danh hiệu "${currentTitle.title}" cho em ${currentStudent.name}! 🌟`);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white">
              📜
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                GÓC TỎA SÁNG 3A5 – MỖI EM MỘT NGÔI SAO
              </h2>
              <p className="text-xs sm:text-sm text-rose-100">
                “Tuyên dương 8 danh hiệu danh dự • Giấy khen điện tử trang trọng, in ấn trực tiếp”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-rose-950 text-xs font-black flex items-center gap-1.5 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Giấy Khen / Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Panel: Select Student & Title (Hidden when printing) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 print:hidden">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Thiết Lập Giấy Khen Điện Tử Cho Học Sinh
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Select Student */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Học Sinh Lớp 3A5:
            </label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-800 focus:outline-none"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} - {s.name} (Tổ {s.teamId})
                </option>
              ))}
            </select>
          </div>

          {/* Select Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chọn Danh Hiệu Vinh Danh (8 Danh Hiệu):
            </label>
            <select
              value={selectedTitleId}
              onChange={(e) => setSelectedTitleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-800 focus:outline-none"
            >
              {OFFICIAL_TITLES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ngày Trao Thưởng:</label>
            <input
              type="text"
              value={awardDate}
              onChange={(e) => setAwardDate(e.target.value)}
              placeholder="Ví dụ: 28/10/2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none"
            />
          </div>
        </div>

        {/* Custom Citation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Lời Khen Ngợi & Lý Do Tuyên Dương:
          </label>
          <input
            type="text"
            value={customCitation}
            onChange={(e) => setCustomCitation(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none"
          />
        </div>

        {/* 8 Titles Visual Showcase Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Danh mục 8 Danh Hiệu Tỏa Sáng:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {OFFICIAL_TITLES.map((t) => {
              const isSelected = t.id === selectedTitleId;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTitleId(t.id)}
                  className={`p-2.5 rounded-2xl text-left border-2 transition flex items-center gap-2 ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-800 truncate">{t.title}</div>
                    <div className="text-[10px] text-slate-500 truncate">{t.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button to Save to Student Profile */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleConfirmAward}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-900 to-amber-700 hover:from-rose-950 hover:to-amber-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Lưu Danh Hiệu Vào Hồ Sơ Em {currentStudent?.name}</span>
          </button>
        </div>
      </div>

      {/* THE OFFICIAL ELECTRONIC CERTIFICATE (PRINTABLE) */}
      <div className="flex justify-center">
        <div
          id="certificate-print-area"
          className="w-full max-w-3xl bg-[#fffdf8] border-[12px] border-amber-600/90 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: '0 20px 40px -15px rgba(180, 83, 9, 0.25)',
          }}
        >
          {/* Inner Golden Guilloche Border Frame */}
          <div className="border-4 border-double border-amber-400 p-6 sm:p-8 rounded-2xl relative text-center">
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 text-amber-600 text-lg">⚜️</div>
            <div className="absolute top-2 right-2 text-amber-600 text-lg">⚜️</div>
            <div className="absolute bottom-2 left-2 text-amber-600 text-lg">⚜️</div>
            <div className="absolute bottom-2 right-2 text-amber-600 text-lg">⚜️</div>

            {/* School Header */}
            <div className="mb-4">
              <h4 className="text-xs sm:text-sm font-extrabold tracking-wider text-rose-900 uppercase">
                {TEACHER_INFO.school}
              </h4>
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-widest">
                LỚP 3A5 • NIÊN KHÓA 2025 – 2026
              </p>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto my-2"></div>
            </div>

            {/* Certificate Title */}
            <div className="my-4">
              <span className="text-3xl sm:text-4xl">⭐</span>
              <h2 className="text-2xl sm:text-4xl font-black text-rose-950 tracking-wider font-serif uppercase mt-1">
                GIẤY KHEN DANH DỰ
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 italic mt-1">
                Góc Tỏa Sáng Lớp 3A5 – Vườn Sao Tri Thức
              </p>
            </div>

            {/* Student Name */}
            <div className="my-6">
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest">
                Cô Giáo Chủ Nhiệm Và Tập Thể Lớp 3A5 Trân Trọng Tuyên Dương:
              </p>
              <h3 className="text-2xl sm:text-3xl font-black text-rose-900 font-serif my-2 border-b-2 border-dotted border-amber-400 pb-2 inline-block px-8">
                {currentStudent?.name}
              </h3>
              <p className="text-xs font-bold text-slate-700">
                Mã số: {currentStudent?.id} • {currentTeam?.name}
              </p>
            </div>

            {/* Awarded Title */}
            <div className="my-5 bg-amber-100/60 border border-amber-300 rounded-2xl py-3 px-6 inline-block max-w-xl mx-auto shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                Đạt Danh Hiệu Vinh Dự
              </span>
              <span className="text-lg sm:text-2xl font-black text-rose-950 flex items-center justify-center gap-2">
                <span>{currentTitle.icon}</span>
                <span>{currentTitle.title}</span>
                <span>{currentTitle.icon}</span>
              </span>
            </div>

            {/* Citation */}
            <p className="text-xs sm:text-sm text-slate-700 italic max-w-xl mx-auto leading-relaxed my-4">
              “{customCitation}”
            </p>

            {/* Date & Signatures */}
            <div className="mt-8 pt-4 border-t border-amber-200/60 grid grid-cols-2 items-end text-xs">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-1 border-2 border-dashed border-rose-400 rounded-full flex items-center justify-center text-rose-800 font-black text-[10px] uppercase leading-tight bg-rose-50/50">
                  DẤU SAO<br />3A5<br />CHĂM NGOAN
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase">
                  Chứng Nhận Lớp 3A5
                </span>
              </div>

              <div className="text-center">
                <p className="italic text-slate-600 text-[11px] mb-1">
                  Hà Nội, ngày {awardDate}
                </p>
                <p className="font-bold text-slate-800 uppercase text-[11px]">
                  Giáo Viên Chủ Nhiệm
                </p>
                {/* Simulated signature */}
                <div className="font-serif italic font-bold text-rose-900 text-lg sm:text-xl my-2">
                  Kiều Thị Vân
                </div>
                <p className="font-extrabold text-slate-800 text-xs">{TEACHER_INFO.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
