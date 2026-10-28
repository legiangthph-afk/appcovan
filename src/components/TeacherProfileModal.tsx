import React, { useState } from 'react';
import { ShieldCheck, Lock, Unlock, Mail, Phone, MapPin, Calendar, School, Users, CheckCircle2, X } from 'lucide-react';
import { TEACHER_INFO } from '../data/initialData';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isTeacherMode: boolean;
  setIsTeacherMode: (val: boolean) => void;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  isTeacherMode,
  setIsTeacherMode,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim().toLowerCase() === TEACHER_INFO.privateProfile.pin.toLowerCase()) {
      setIsTeacherMode(true);
      setPinError('');
      setPinInput('');
    } else {
      setPinError('Mã PIN chưa chính xác (Mặc định: 3a5van)');
    }
  };

  const handleLock = () => {
    setIsTeacherMode(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border-2 border-amber-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 to-rose-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-xl shadow">
              👩‍🏫
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-200">Hồ Sơ Quản Trị Giáo Viên Chủ Nhiệm</h2>
              <p className="text-xs text-rose-200">Cô Kiều Thị Vân • Lớp 3A5</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-rose-800 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Hồ Sơ Riêng Tư
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'privacy'
                ? 'border-rose-800 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Quy Định An Toàn & Bảo Mật
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
              activeTab === 'security'
                ? 'border-rose-800 text-rose-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Quyền Quản Trị (Chế độ Cô Vân)
          </button>
        </div>

        {/* Body content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <div>
              {/* Notice banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 mb-5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>Bảo vệ dữ liệu sư phạm:</strong> Thông tin cá nhân (Ngày sinh, Email, SĐT, Địa chỉ) chỉ được lưu trữ trong hồ sơ quản trị riêng tư này và <strong>không bao giờ hiển thị</strong> trên màn hình trình chiếu hoặc giao diện học sinh. Ứng dụng tuân thủ nguyên tắc không lưu số CCCD.
                </div>
              </div>

              {/* Information Cards */}
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <School className="w-3.5 h-3.5 text-rose-700" />
                      Trường & Lớp Phụ Trách
                    </div>
                    <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.className} – {TEACHER_INFO.school}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-blue-700" />
                      Sĩ Số Học Sinh
                    </div>
                    <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.totalStudents} học sinh</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      Ngày sinh Giáo viên
                    </div>
                    <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.privateProfile.birthDate}</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      Số điện thoại liên hệ
                    </div>
                    <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.privateProfile.phone}</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-700" />
                    Hòm thư điện tử (Email)
                  </div>
                  <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.privateProfile.email}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-700" />
                    Địa chỉ liên hệ
                  </div>
                  <div className="text-sm font-bold text-slate-800">{TEACHER_INFO.privateProfile.address}</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
                <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Cam Kết Nhân Văn & Sư Phạm
                </h3>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong>Không bêu tên, không hạ nhục:</strong> Không công khai điểm trừ hay danh sách học sinh điểm thấp trước lớp hoặc phụ huynh.</li>
                  <li><strong>Khích lệ tiến bộ cá nhân:</strong> Mỗi đứa trẻ là một ngôi sao, ưu tiên khen thưởng sự nỗ lực và ý thức giúp bạn.</li>
                  <li><strong>Dữ liệu mẫu chuẩn mực:</strong> 30 hồ sơ học sinh ban đầu được đánh mã HS01 – HS30, bảo đảm tính ẩn danh và an toàn tuyệt đối.</li>
                  <li><strong>Lưu trữ an toàn tại máy:</strong> Dữ liệu lớp học được đồng bộ và lưu trữ cục bộ bảo mật, cô giáo có thể sao lưu ra tệp bất cứ lúc nào.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              {isTeacherMode ? (
                <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Unlock className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-emerald-900 text-base mb-1">Đang Bật Chế Độ Cô Vân (Quản Trị Viên)</h3>
                  <p className="text-xs text-emerald-700 mb-4">
                    Cô có toàn quyền chỉnh sửa danh sách, ghi chú bảo mật, quản lý điểm sao và phân bổ tổ thi đua.
                  </p>
                  <button
                    onClick={handleLock}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Khóa Chế Độ Quản Trị (Chuyển sang Chế độ Lớp Học)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUnlock} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <Lock className="w-4 h-4 text-amber-700" />
                      Xác Thực Quyền Giáo Viên
                    </div>
                    Nhập mã PIN để mở khóa các thao tác nâng cao: Sửa tên học sinh, xóa dữ liệu, xuất tệp và lưu nhận xét riêng tư.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nhập mã PIN Giáo viên:
                    </label>
                    <input
                      type="password"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Mã PIN mặc định: 3a5van"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-800"
                    />
                    {pinError && <p className="text-xs text-rose-600 mt-1">{pinError}</p>}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // Quick teacher unlock for convenience
                        setIsTeacherMode(true);
                      }}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800"
                    >
                      Bỏ qua & Đăng nhập ngay
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-rose-900 to-rose-800 text-amber-300 font-bold rounded-xl text-xs shadow hover:brightness-110 transition"
                    >
                      Xác Nhận Mở Khóa
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
