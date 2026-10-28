import React, { useState } from 'react';
import {
  Users, Search, UserPlus, FileSpreadsheet, ArrowRightLeft,
  Crown, Star, CheckCircle, Clock, AlertTriangle, Edit3, Trash2,
  FileDown, Check, Sparkles, Filter, Plus, Palette, RefreshCw, X, AlertCircle
} from 'lucide-react';
import { Student, Team, TeamId, StudentRole, AttendanceStatus } from '../types';
import { sound } from '../utils/soundEffects';
import { INITIAL_STUDENTS, INITIAL_TEAMS } from '../data/initialData';

interface ClassroomManagerProps {
  students: Student[];
  teams: Team[];
  onUpdateStudents: (newStudents: Student[]) => void;
  onUpdateTeams: (newTeams: Team[]) => void;
  onOpenStarAward: (student: Student) => void;
  onOpenMultiAward: (selectedStudents: Student[]) => void;
  isTeacherMode: boolean;
  onOpenTeacherProfile: () => void;
}

interface ConfirmModalState {
  isOpen: boolean;
  type: 'delete_student' | 'batch_delete' | 'delete_team' | 'reset_30' | 'clear_all';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  teamId?: TeamId;
  teamName?: string;
  count?: number;
}

export const ClassroomManager: React.FC<ClassroomManagerProps> = ({
  students,
  teams,
  onUpdateStudents,
  onUpdateTeams,
  onOpenStarAward,
  onOpenMultiAward,
}) => {
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [activeViewMode, setActiveViewMode] = useState<'grid' | 'table' | 'attendance'>('grid');

  // In-app Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // In-app Confirmation Modal (Replaces window.confirm for iframe safety)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'delete_student',
    title: '',
    message: '',
  });

  // Modal states for adding/editing student
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Partial<Student> | null>(null);

  // Modal states for Team Management (Add / Edit Team)
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Partial<Team> | null>(null);

  // Filter students
  const filteredStudents = students.filter((st) => {
    const matchTeam = selectedTeamFilter === 'all' || st.teamId === selectedTeamFilter;
    const matchSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTeam && matchSearch;
  });

  // Toggle selection
  const toggleSelect = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // Quick Attendance Setter
  const handleSetAttendance = (studentId: string, status: AttendanceStatus) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, attendance: status } : s));
    onUpdateStudents(updated);
    sound.playWheelTick();
  };

  // Mark all present in morning roll call
  const handleMarkAllPresent = () => {
    const updated = students.map((s) => ({ ...s, attendance: 'present' as AttendanceStatus }));
    onUpdateStudents(updated);
    sound.playCorrect();
    showToast('Đã điểm danh Có mặt cho cả lớp!');
  };

  // Trigger Delete Single Student
  const promptDeleteStudent = (studentId: string, studentName?: string) => {
    const name = studentName || students.find((s) => s.id === studentId)?.name || studentId;
    setConfirmModal({
      isOpen: true,
      type: 'delete_student',
      title: 'Xóa Học Sinh Khỏi Lớp 3A5',
      message: `Cô có chắc chắn muốn xóa học sinh "${name}" (${studentId}) khỏi danh sách lớp không? Dữ liệu của em sẽ được xóa vĩnh viễn.`,
      studentId,
      studentName: name,
    });
  };

  // Trigger Batch Delete
  const promptBatchDelete = () => {
    if (selectedStudentIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'batch_delete',
      title: 'Xóa Hàng Loạt Học Sinh',
      message: `Cô có chắc chắn muốn xóa đồng loạt ${selectedStudentIds.length} học sinh đang được tích chọn khỏi danh sách lớp 3A5 không?`,
      count: selectedStudentIds.length,
    });
  };

  // Trigger Reset to Default 30 Students
  const promptResetToDefault30 = () => {
    setConfirmModal({
      isOpen: true,
      type: 'reset_30',
      title: 'Đặt Lại Danh Sách 30 Học Sinh Mẫu',
      message: 'Hệ thống sẽ khôi phục lại danh sách chuẩn 30 học sinh (HS01 - HS30) của 4 tổ ban đầu. Bạn có đồng ý không?',
    });
  };

  // Trigger Clear All
  const promptClearAll = () => {
    setConfirmModal({
      isOpen: true,
      type: 'clear_all',
      title: 'Xóa Toàn Bộ Danh Sách Học Sinh',
      message: 'CẢNH BÁO: Thao tác này sẽ xóa trắng tất cả học sinh hiện tại để cô có thể nhập danh sách lớp mới từ đầu hoặc nhập từ file Excel. Bạn có chắc chắn muốn tiếp tục?',
    });
  };

  // Trigger Delete Team
  const promptDeleteTeam = (teamId: TeamId, teamName: string) => {
    if (teams.length <= 1) {
      showToast('Phải giữ lại ít nhất 1 tổ trong lớp!');
      return;
    }
    const count = students.filter((s) => s.teamId === teamId).length;
    setConfirmModal({
      isOpen: true,
      type: 'delete_team',
      title: `Xóa ${teamName}`,
      message: count > 0
        ? `Tổ "${teamName}" hiện có ${count} học sinh. Khi xóa tổ này, các em sẽ tự động được chuyển sang tổ khác an toàn. Bạn có muốn xóa không?`
        : `Bạn có chắc chắn muốn xóa "${teamName}" không?`,
      teamId,
      teamName,
      count,
    });
  };

  // Execute Confirmation Action
  const executeConfirmAction = () => {
    if (confirmModal.type === 'delete_student' && confirmModal.studentId) {
      const id = confirmModal.studentId;
      const updated = students.filter((s) => s.id !== id);
      onUpdateStudents(updated);
      setSelectedStudentIds((prev) => prev.filter((item) => item !== id));
      sound.playGentleBoing();
      setIsEditModalOpen(false);
      setEditingStudent(null);
      showToast(`Đã xóa học sinh ${confirmModal.studentName || id}!`);
    } else if (confirmModal.type === 'batch_delete') {
      const updated = students.filter((s) => !selectedStudentIds.includes(s.id));
      const deletedCount = selectedStudentIds.length;
      onUpdateStudents(updated);
      setSelectedStudentIds([]);
      sound.playGentleBoing();
      showToast(`Đã xóa thành công ${deletedCount} học sinh!`);
    } else if (confirmModal.type === 'reset_30') {
      onUpdateStudents(INITIAL_STUDENTS);
      onUpdateTeams(INITIAL_TEAMS);
      setSelectedStudentIds([]);
      sound.playCelebration();
      showToast('Đã thiết lập lại danh sách chuẩn 30 học sinh lớp 3A5!');
    } else if (confirmModal.type === 'clear_all') {
      onUpdateStudents([]);
      setSelectedStudentIds([]);
      sound.playGentleBoing();
      showToast('Đã xóa trắng danh sách học sinh.');
    } else if (confirmModal.type === 'delete_team' && confirmModal.teamId !== undefined) {
      const teamId = confirmModal.teamId;
      const remaining = teams.filter((t) => t.id !== teamId);
      const fallbackTeamId = remaining[0]?.id || 1;
      const updatedStudents = students.map((s) =>
        s.teamId === teamId ? { ...s, teamId: fallbackTeamId } : s
      );
      onUpdateStudents(updatedStudents);
      onUpdateTeams(remaining);
      if (selectedTeamFilter === teamId) {
        setSelectedTeamFilter('all');
      }
      sound.playGentleBoing();
      showToast(`Đã xóa tổ ${confirmModal.teamName}!`);
    }

    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  // Save Student (Add / Edit)
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent?.name?.trim()) {
      showToast('Vui lòng nhập họ và tên học sinh!');
      return;
    }

    if (editingStudent.id) {
      // Edit existing
      const updated = students.map((s) =>
        s.id === editingStudent.id ? ({ ...s, ...editingStudent } as Student) : s
      );
      onUpdateStudents(updated);
      sound.playCorrect();
      showToast(`Đã cập nhật thông tin em ${editingStudent.name}!`);
    } else {
      // Add new student
      let nextId = editingStudent.id?.trim();
      if (!nextId) {
        const nextNum = students.length + 1;
        nextId = `HS${nextNum < 10 ? '0' + nextNum : nextNum}`;
        let counter = nextNum;
        while (students.some((s) => s.id === nextId)) {
          counter++;
          nextId = `HS${counter < 10 ? '0' + counter : counter}`;
        }
      }

      const defaultTeamId = teams[0]?.id || 1;
      const newStudent: Student = {
        id: nextId,
        name: editingStudent.name.trim(),
        gender: editingStudent.gender || 'nam',
        teamId: (editingStudent.teamId as TeamId) || defaultTeamId,
        role: (editingStudent.role as StudentRole) || 'Thành viên',
        stars: editingStudent.stars !== undefined ? editingStudent.stars : 15,
        weeklyStars: 0,
        monthlyStars: editingStudent.stars !== undefined ? editingStudent.stars : 15,
        attendance: 'present',
        badges: ['Ngôi Sao Tiến Bộ'],
        notes: editingStudent.notes || '',
      };
      onUpdateStudents([...students, newStudent]);
      sound.playStarReward();
      showToast(`Đã thêm học sinh ${newStudent.name} (${newStudent.id}) vào lớp!`);
    }
    setIsEditModalOpen(false);
    setEditingStudent(null);
  };

  // Open Team Editor
  const handleOpenAddTeam = () => {
    const nextTeamId = teams.length > 0 ? Math.max(...teams.map((t) => t.id)) + 1 : 1;
    setEditingTeam({
      id: nextTeamId,
      name: `Tổ ${nextTeamId}: `,
      slogan: 'Đoàn kết – Chăm ngoan – Tỏa sáng',
      icon: '⭐',
      color: '#f59e0b',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-400',
      textColor: 'text-amber-700',
      totalStars: 0,
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenEditTeam = (team: Team) => {
    setEditingTeam(team);
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam?.name?.trim()) {
      showToast('Vui lòng nhập tên tổ!');
      return;
    }

    const color = editingTeam.color || '#f59e0b';

    if (teams.some((t) => t.id === editingTeam.id)) {
      // Edit existing
      const updatedTeams = teams.map((t) =>
        t.id === editingTeam.id
          ? ({
              ...t,
              ...editingTeam,
              name: editingTeam.name!.trim(),
              slogan: editingTeam.slogan || 'Đoàn kết – Chăm ngoan',
              icon: editingTeam.icon || '⭐',
              color,
            } as Team)
          : t
      );
      onUpdateTeams(updatedTeams);
      sound.playCorrect();
      showToast(`Đã cập nhật ${editingTeam.name}!`);
    } else {
      // Add new
      const newTeam: Team = {
        id: editingTeam.id || Date.now(),
        name: editingTeam.name.trim(),
        slogan: editingTeam.slogan || 'Đoàn kết – Tự tin',
        icon: editingTeam.icon || '⭐',
        color,
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-400',
        textColor: 'text-amber-700',
        totalStars: 0,
      };
      onUpdateTeams([...teams, newTeam]);
      sound.playStarReward();
      showToast(`Đã tạo mới ${newTeam.name}!`);
    }
    setIsTeamModalOpen(false);
    setEditingTeam(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã HS,Họ và Tên,Giới tính,Tổ,Chức vụ,Số Sao,Chuyên cần,Ghi chú riêng'];
    const rows = students.map((s) => {
      const teamName = teams.find((t) => t.id === s.teamId)?.name || `Tổ ${s.teamId}`;
      const genderStr = s.gender === 'nam' ? 'Nam' : 'Nữ';
      const cleanNotes = (s.notes || '').replace(/,/g, ' - ');
      return `"${s.id}","${s.name}","${genderStr}","${teamName}","${s.role}","${s.stars}","${s.attendance}","${cleanNotes}"`;
    });
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Lop_3A5_Co_Kieu_Thi_Van_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    sound.playStarReward();
  };

  // Import CSV
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length <= 1) {
          showToast('Tệp CSV trống hoặc không đúng cấu trúc!');
          return;
        }

        const newParsedStudents: Student[] = [];
        for (let i = 1; i < lines.length; i++) {
          const parts = lines[i].split(',').map((p) => p.replace(/^"|"$/g, '').trim());
          if (parts.length >= 2 && parts[1]) {
            const id = parts[0] || `HS${i < 10 ? '0' + i : i}`;
            const name = parts[1];
            const gender = parts[2]?.toLowerCase().includes('nữ') ? 'nu' : 'nam';
            let teamId: TeamId = teams[0]?.id || 1;
            for (const t of teams) {
              if (parts[3]?.includes(String(t.id)) || parts[3]?.includes(t.name)) {
                teamId = t.id;
                break;
              }
            }

            newParsedStudents.push({
              id,
              name,
              gender,
              teamId,
              role: (parts[4] as StudentRole) || 'Thành viên',
              stars: parseInt(parts[5], 10) || 15,
              weeklyStars: 0,
              monthlyStars: parseInt(parts[5], 10) || 15,
              attendance: 'present',
              badges: ['Ngôi Sao Tiến Bộ'],
              notes: parts[7] || '',
            });
          }
        }

        if (newParsedStudents.length > 0) {
          onUpdateStudents(newParsedStudents);
          showToast(`Đã nhập thành công ${newParsedStudents.length} học sinh từ tệp CSV!`);
          sound.playCelebration();
        }
      } catch {
        showToast('Có lỗi khi đọc tệp CSV. Vui lòng kiểm tra định dạng.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 relative">
      {/* IN-APP TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-fade-in text-xs sm:text-sm font-bold">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* SECTION: TEAMS HEADER & MANAGEMENT */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🏆</span>
              <h3 className="font-extrabold text-base text-slate-800">
                Các Tổ Thi Đua Lớp 3A5 ({teams.length} Tổ)
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Bấm vào tổ để lọc học sinh • Bạn có thể <strong>Sửa tổ</strong>, <strong>Xóa tổ</strong> hoặc <strong>Thêm tổ mới</strong> tự do.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleOpenAddTeam}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-rose-950 font-black text-xs shadow-sm flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Thêm Tổ Mới</span>
            </button>
            <button
              onClick={promptResetToDefault30}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
              title="Khôi phục lại danh sách chuẩn 30 học sinh"
            >
              <RefreshCw className="w-3.5 h-3.5 text-rose-800" />
              <span>Đặt lại 30 HS mẫu</span>
            </button>
          </div>
        </div>

        {/* Dynamic Teams Grid Cards with Edit & Delete */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {teams.map((team) => {
            const teamStudents = students.filter((s) => s.teamId === team.id);
            const leader = teamStudents.find((s) => s.role === 'Tổ trưởng');
            const viceLeader = teamStudents.find((s) => s.role === 'Tổ phó');
            const totalStars = teamStudents.reduce((sum, s) => sum + s.stars, 0);

            return (
              <div
                key={team.id}
                className={`p-4 rounded-3xl border-2 transition-all shadow-sm hover:shadow-md flex flex-col justify-between ${
                  selectedTeamFilter === team.id
                    ? 'border-rose-900 bg-white ring-2 ring-rose-900/20 scale-102'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => setSelectedTeamFilter(selectedTeamFilter === team.id ? 'all' : team.id)}
                      className="text-2xl cursor-pointer hover:scale-110 transition"
                      title="Bấm để lọc học sinh tổ này"
                    >
                      {team.icon}
                    </button>
                    <div className="flex items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {totalStars} sao
                      </span>
                      {/* Edit Team Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEditTeam(team);
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                        title="Chỉnh sửa tổ này"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete Team Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          promptDeleteTeam(team.id, team.name);
                        }}
                        className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        title="Xóa tổ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h4
                    onClick={() => setSelectedTeamFilter(selectedTeamFilter === team.id ? 'all' : team.id)}
                    className="font-extrabold text-sm text-slate-800 line-clamp-1 cursor-pointer hover:text-rose-900"
                  >
                    {team.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 italic mb-2 line-clamp-1">{team.slogan}</p>

                  <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Sĩ số:</span>
                      <span className="font-bold text-slate-800">{teamStudents.length} em</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Tổ trưởng:</span>
                      <span className="font-semibold text-rose-900 truncate max-w-[110px]">
                        {leader?.name || 'Chưa chọn'}
                      </span>
                    </div>
                    {viceLeader && (
                      <div className="flex justify-between text-[11px]">
                        <span>Tổ phó:</span>
                        <span className="font-semibold text-blue-900 truncate max-w-[110px]">
                          {viceLeader.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedTeamFilter(selectedTeamFilter === team.id ? 'all' : team.id)}
                  className={`mt-3 w-full py-1 rounded-xl text-[11px] font-bold transition text-center ${
                    selectedTeamFilter === team.id
                      ? 'bg-rose-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {selectedTeamFilter === team.id ? '✓ Đang xem tổ này' : 'Xem học sinh tổ'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Bar: Filter, Search, View Mode, Actions */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên hoặc mã HS (HS01...)"
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-800"
            />
          </div>

          {/* Team Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            <button
              onClick={() => setSelectedTeamFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                selectedTeamFilter === 'all'
                  ? 'bg-rose-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Toàn Lớp ({students.length})
            </button>
            {teams.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeamFilter(t.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex-shrink-0 flex items-center gap-1 ${
                  selectedTeamFilter === t.id
                    ? 'bg-rose-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.name.split(':')[0]}</span>
              </button>
            ))}
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveViewMode('grid')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeViewMode === 'grid' ? 'bg-white shadow-sm text-rose-900' : 'text-slate-600'
              }`}
            >
              Thẻ Lưới
            </button>
            <button
              onClick={() => setActiveViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeViewMode === 'table' ? 'bg-white shadow-sm text-rose-900' : 'text-slate-600'
              }`}
            >
              Danh Sách
            </button>
            <button
              onClick={() => setActiveViewMode('attendance')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeViewMode === 'attendance' ? 'bg-white shadow-sm text-emerald-800' : 'text-slate-600'
              }`}
            >
              Điểm Danh Sáng
            </button>
          </div>
        </div>

        {/* Action Row: Selection Actions, Direct Add Student, Batch Delete */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={selectAllFiltered}
              className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1 rounded-lg hover:bg-slate-100"
            >
              {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0
                ? 'Bỏ chọn tất cả'
                : `Chọn tất cả (${filteredStudents.length})`}
            </button>

            {selectedStudentIds.length > 0 && (
              <>
                <button
                  onClick={() => {
                    const selected = students.filter((s) => selectedStudentIds.includes(s.id));
                    onOpenMultiAward(selected);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-rose-950 font-extrabold text-xs shadow flex items-center gap-1.5 hover:brightness-110 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Tặng sao ({selectedStudentIds.length} em)</span>
                </button>

                {/* BATCH DELETE SELECTED STUDENTS BUTTON */}
                <button
                  onClick={promptBatchDelete}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition active:scale-95"
                  title="Xóa vĩnh viễn các học sinh đã được chọn"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                  <span>XÓA ({selectedStudentIds.length} HỌC SINH ĐÃ CHỌN)</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activeViewMode === 'attendance' && (
              <button
                onClick={handleMarkAllPresent}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Điểm danh đủ cả lớp
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200"
              title="Xuất danh sách ra tệp Excel / CSV"
            >
              <FileDown className="w-3.5 h-3.5 text-rose-800" />
              <span>Xuất Excel/CSV</span>
            </button>

            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-200 cursor-pointer">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Nhập CSV</span>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>

            {/* DIRECT ADD STUDENT BUTTON */}
            <button
              onClick={() => {
                setEditingStudent({
                  gender: 'nam',
                  teamId: teams[0]?.id || 1,
                  role: 'Thành viên',
                  stars: 15,
                });
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-950 hover:to-rose-900 text-amber-300 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>+ THÊM HỌC SINH MỚI</span>
            </button>

            {/* CLEAR ALL STUDENTS BUTTON */}
            <button
              onClick={promptClearAll}
              className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 transition flex items-center gap-1"
              title="Xóa trắng danh sách để nhập lớp mới từ đầu"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Hết Danh Sách</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: GRID VIEW (CARD) WITH PROMINENT DELETE BUTTON */}
      {activeViewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStudents.length === 0 ? (
            <div className="col-span-full bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 text-slate-500 space-y-3">
              <Users className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700 text-base">Chưa có học sinh nào trong danh sách</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Bấm nút <strong>"+ THÊM HỌC SINH MỚI"</strong> hoặc tải lên danh sách qua nút <strong>"Nhập CSV"</strong>, hoặc bấm <strong>"Đặt lại 30 HS mẫu"</strong>.
              </p>
              <button
                onClick={() => {
                  setEditingStudent({ gender: 'nam', teamId: teams[0]?.id || 1, role: 'Thành viên', stars: 15 });
                  setIsEditModalOpen(true);
                }}
                className="px-5 py-2.5 bg-rose-900 text-amber-300 font-bold text-xs rounded-xl shadow inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Học Sinh Đầu Tiên</span>
              </button>
            </div>
          ) : (
            filteredStudents.map((st) => {
              const team = teams.find((t) => t.id === st.teamId);
              const isSelected = selectedStudentIds.includes(st.id);

              return (
                <div
                  key={st.id}
                  className={`relative bg-white rounded-3xl p-4 border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 ring-2 ring-amber-300 bg-amber-50/20'
                      : 'border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {/* Card Top: Checkbox, ID, Role Badge, Quick Delete Button */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(st.id)}
                          className="w-4 h-4 rounded text-rose-800 accent-rose-800 cursor-pointer"
                        />
                        <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {st.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {st.role === 'Tổ trưởng' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 border border-amber-300">
                            <Crown className="w-3 h-3 text-amber-600" />
                            Tổ trưởng
                          </span>
                        )}
                        {st.role === 'Tổ phó' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                            Tổ phó
                          </span>
                        )}

                        {/* Direct Delete Button right at top corner */}
                        <button
                          onClick={() => promptDeleteStudent(st.id, st.name)}
                          className="w-7 h-7 rounded-lg text-rose-500 hover:text-white hover:bg-rose-600 flex items-center justify-center transition border border-rose-200 ml-1"
                          title={`Xóa học sinh ${st.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Student Avatar & Name */}
                    <div className="flex items-center gap-3 my-2">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border ${
                          st.gender === 'nu'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {st.gender === 'nu' ? '👧' : '👦'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm hover:text-rose-900">
                          {st.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {team?.name || `Tổ ${st.teamId}`} • {st.gender === 'nu' ? 'Nữ' : 'Nam'}
                        </p>
                      </div>
                    </div>

                    {/* Badges / Danh hiệu */}
                    <div className="flex flex-wrap gap-1 my-2 min-h-[24px]">
                      {st.badges?.slice(0, 2).map((badge, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium truncate max-w-[150px]"
                        >
                          🏅 {badge}
                        </span>
                      ))}
                    </div>

                    {st.notes && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl mb-2 line-clamp-2 border border-slate-100">
                        📝 {st.notes}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Star Score & Action Buttons */}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
                        <span className="text-lg font-black text-slate-800">{st.stars}</span>
                        <span className="text-[10px] text-slate-500">sao</span>
                      </div>

                      {/* Attendance Indicator */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          st.attendance === 'present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : st.attendance === 'late'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {st.attendance === 'present'
                          ? 'Có mặt'
                          : st.attendance === 'late'
                          ? 'Đi muộn'
                          : 'Nghỉ'}
                      </span>
                    </div>

                    {/* Action Buttons: Tặng sao, Sửa, Xóa */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onOpenStarAward(st)}
                        className="py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-rose-950 font-extrabold text-xs shadow-sm flex items-center justify-center gap-1 transition"
                        title="Tặng sao khen thưởng"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+Sao</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingStudent(st);
                          setIsEditModalOpen(true);
                        }}
                        className="py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition border border-slate-200"
                        title="Chỉnh sửa thông tin"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      {/* Explicit Red Delete Button */}
                      <button
                        onClick={() => promptDeleteStudent(st.id, st.name)}
                        className="py-1.5 rounded-xl bg-rose-100 hover:bg-rose-600 text-rose-800 hover:text-white font-extrabold text-xs flex items-center justify-center gap-1 transition border border-rose-300"
                        title="Xóa học sinh này khỏi lớp"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW WITH DIRECT DELETE BUTTON */}
      {activeViewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={selectAllFiltered}
                      className="rounded accent-rose-800"
                    />
                  </th>
                  <th className="p-3">Mã HS</th>
                  <th className="p-3">Họ và Tên</th>
                  <th className="p-3">Giới tính</th>
                  <th className="p-3">Tổ</th>
                  <th className="p-3">Vai trò</th>
                  <th className="p-3 text-center">Tổng Sao</th>
                  <th className="p-3">Chuyên cần</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => {
                  const team = teams.find((t) => t.id === st.teamId);
                  const isSelected = selectedStudentIds.includes(st.id);

                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(st.id)}
                          className="rounded accent-rose-800"
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-500">{st.id}</td>
                      <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                        <span>{st.gender === 'nu' ? '👧' : '👦'}</span>
                        <span>{st.name}</span>
                      </td>
                      <td className="p-3 text-slate-600">
                        {st.gender === 'nu' ? 'Nữ' : 'Nam'}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-slate-700">
                          {team?.name || `Tổ ${st.teamId}`}
                        </span>
                      </td>
                      <td className="p-3">
                        {st.role === 'Tổ trưởng' ? (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-xs">
                            👑 Tổ trưởng
                          </span>
                        ) : st.role === 'Tổ phó' ? (
                          <span className="bg-sky-100 text-sky-900 font-bold px-2 py-0.5 rounded-full text-xs">
                            Tổ phó
                          </span>
                        ) : (
                          <span className="text-slate-500">Thành viên</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          {st.stars}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            st.attendance === 'present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : st.attendance === 'late'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {st.attendance === 'present'
                            ? 'Có mặt'
                            : st.attendance === 'late'
                            ? 'Đi muộn'
                            : 'Nghỉ'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenStarAward(st)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-rose-950 font-bold text-xs rounded-lg transition"
                          >
                            + Sao
                          </button>
                          <button
                            onClick={() => {
                              setEditingStudent(st);
                              setIsEditModalOpen(true);
                            }}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                            title="Sửa thông tin"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {/* Direct Red Delete Button in Table */}
                          <button
                            onClick={() => promptDeleteStudent(st.id, st.name)}
                            className="p-1 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition border border-rose-200"
                            title="Xóa học sinh này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: ATTENDANCE ROLL CALL VIEW */}
      {activeViewMode === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-800">
                Sổ Điểm Danh Sáng Nay – Lớp 3A5
              </h3>
              <p className="text-xs text-slate-500">
                Nhấn chọn nhanh trạng thái của học sinh: Có mặt • Đi muộn • Nghỉ có phép • Không phép
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                Có mặt: {students.filter((s) => s.attendance === 'present').length}
              </span>
              <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                Đi muộn: {students.filter((s) => s.attendance === 'late').length}
              </span>
              <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl">
                Nghỉ: {students.filter((s) => s.attendance === 'excused' || s.attendance === 'unexcused').length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {filteredStudents.map((st) => (
              <div
                key={st.id}
                className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="text-[11px] font-bold text-slate-400">{st.id}</div>
                  <div className="text-xs font-bold text-slate-800">{st.name}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleSetAttendance(st.id, 'present')}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                      st.attendance === 'present'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Có mặt"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleSetAttendance(st.id, 'late')}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                      st.attendance === 'late'
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Đi muộn"
                  >
                    M
                  </button>
                  <button
                    onClick={() => handleSetAttendance(st.id, 'excused')}
                    className={`w-7 h-7 rounded-lg font-bold text-xs flex items-center justify-center transition ${
                      st.attendance === 'excused'
                        ? 'bg-rose-600 text-white shadow'
                        : 'bg-white text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Nghỉ phép"
                  >
                    P
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IN-APP CONFIRMATION MODAL (SAFE, ACCESSIBLE, NEVER SUPPRESSED BY IFRAME) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-rose-500 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{confirmModal.title}</h3>
                <p className="text-xs text-rose-600 font-bold">Xác nhận thao tác</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {confirmModal.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={executeConfirmAction}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Đồng Ý Thực Hiện</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT STUDENT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-amber-300">
            <div className="bg-gradient-to-r from-rose-900 to-rose-800 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                <span>{editingStudent?.id ? `Sửa Thông Tin Học Sinh (${editingStudent.id})` : 'Thêm Học Sinh Mới Vào Lớp 3A5'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingStudent(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent?.name || ''}
                  onChange={(e) =>
                    setEditingStudent((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ví dụ: Nguyễn Minh An"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mã học sinh:</label>
                  <input
                    type="text"
                    value={editingStudent?.id || ''}
                    onChange={(e) =>
                      setEditingStudent((prev) => ({ ...prev, id: e.target.value.trim().toUpperCase() }))
                    }
                    placeholder="Tự động (HS01...)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính:</label>
                  <select
                    value={editingStudent?.gender || 'nam'}
                    onChange={(e) =>
                      setEditingStudent((prev) => ({
                        ...prev,
                        gender: e.target.value as 'nam' | 'nu',
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none"
                  >
                    <option value="nam">Nam 👦</option>
                    <option value="nu">Nữ 👧</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phân vào tổ:</label>
                  <select
                    value={editingStudent?.teamId || teams[0]?.id || 1}
                    onChange={(e) =>
                      setEditingStudent((prev) => ({
                        ...prev,
                        teamId: parseInt(e.target.value, 10) as TeamId,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none font-semibold text-rose-900"
                  >
                    {teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Vai trò trong tổ:</label>
                  <select
                    value={editingStudent?.role || 'Thành viên'}
                    onChange={(e) =>
                      setEditingStudent((prev) => ({
                        ...prev,
                        role: e.target.value as StudentRole,
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none"
                  >
                    <option value="Thành viên">Thành viên</option>
                    <option value="Tổ phó">Tổ phó</option>
                    <option value="Tổ trưởng">Tổ trưởng 👑</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số sao tích lũy ban đầu:</label>
                <input
                  type="number"
                  min="0"
                  value={editingStudent?.stars ?? 15}
                  onChange={(e) =>
                    setEditingStudent((prev) => ({
                      ...prev,
                      stars: parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none font-bold text-amber-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nhận xét riêng của Cô Kiều Thị Vân:
                </label>
                <textarea
                  rows={2}
                  value={editingStudent?.notes || ''}
                  onChange={(e) =>
                    setEditingStudent((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Ghi chú về tính cách, năng khiếu hoặc điểm cần lưu ý..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-rose-800 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingStudent?.id ? (
                  <button
                    type="button"
                    onClick={() => promptDeleteStudent(editingStudent.id!, editingStudent.name)}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1 border border-rose-300 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa học sinh này</span>
                  </button>
                ) : (
                  <div></div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingStudent(null);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-900 to-rose-800 hover:from-rose-950 hover:to-rose-900 text-amber-300 font-bold rounded-xl text-xs shadow"
                  >
                    {editingStudent?.id ? 'Lưu Thay Đổi' : 'Thêm Học Sinh'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TEAM MANAGEMENT (ADD / EDIT TEAM) */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-amber-300">
            <div className="bg-gradient-to-r from-rose-900 to-amber-700 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-base flex items-center gap-2">
                <span>{editingTeam?.icon || '🏆'}</span>
                <span>
                  {teams.some((t) => t.id === editingTeam?.id)
                    ? 'Chỉnh Sửa Tổ Học Sinh'
                    : 'Thêm Tổ Mới Cho Lớp 3A5'}
                </span>
              </h3>
              <button
                onClick={() => {
                  setIsTeamModalOpen(false);
                  setEditingTeam(null);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeam} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên tổ: <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingTeam?.name || ''}
                  onChange={(e) =>
                    setEditingTeam((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Ví dụ: Tổ 1: SAO CHĂM CHỈ ⭐"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khẩu hiệu / Slogan của tổ:
                </label>
                <input
                  type="text"
                  value={editingTeam?.slogan || ''}
                  onChange={(e) =>
                    setEditingTeam((prev) => ({ ...prev, slogan: e.target.value }))
                  }
                  placeholder="Ví dụ: Chăm ngoan học giỏi – Tỏa sáng mỗi ngày"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Biểu tượng / Emoji:
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={editingTeam?.icon || '⭐'}
                      onChange={(e) =>
                        setEditingTeam((prev) => ({ ...prev, icon: e.target.value }))
                      }
                      className="w-14 text-center px-2 py-2 rounded-xl border border-slate-300 text-xl font-bold"
                    />
                    <div className="flex gap-1">
                      {['⭐', '☀️', '🌈', '🌱', '🚀', '🦁'].map((em) => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setEditingTeam((prev) => ({ ...prev, icon: em }))}
                          className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-sm flex items-center justify-center"
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Màu sắc nhận diện:
                  </label>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { hex: '#f59e0b', label: 'Vàng' },
                      { hex: '#0284c7', label: 'Xanh dương' },
                      { hex: '#7c3aed', label: 'Tím' },
                      { hex: '#16a34a', label: 'Xanh lá' },
                      { hex: '#e11d48', label: 'Đỏ' },
                      { hex: '#ea580c', label: 'Cam' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setEditingTeam((prev) => ({ ...prev, color: col.hex }))}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          editingTeam?.color === col.hex ? 'border-slate-900 scale-110 shadow' : 'border-white'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsTeamModalOpen(false);
                    setEditingTeam(null);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-900 text-amber-300 font-bold rounded-xl text-xs shadow hover:bg-rose-950"
                >
                  {teams.some((t) => t.id === editingTeam?.id) ? 'Lưu Thay Đổi' : 'Tạo Tổ Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
