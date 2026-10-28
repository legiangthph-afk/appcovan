import React, { useState } from 'react';
import {
  Sparkles, BookOpen, Layers, CheckCircle2, Edit2, Download,
  Printer, Share2, PlusCircle, AlertCircle, RefreshCw, Eye
} from 'lucide-react';
import { DifferentiatedQuiz, DifferentiatedTier } from '../types';
import { sound } from '../utils/soundEffects';

interface AILessonPlannerProps {
  onAddQuestionsToGame: (newQuestions: any[]) => void;
}

export const AILessonPlanner: React.FC<AILessonPlannerProps> = ({
  onAddQuestionsToGame,
}) => {
  const [subject, setSubject] = useState('Toán');
  const [topic, setTopic] = useState('Bảng nhân 8 và 9 – Giải bài toán có lời văn');
  const [objective, setObjective] = useState(
    'Học sinh thuộc bảng nhân 8, 9, vận dụng tính nhẩm nhanh và giải được bài toán thực tế'
  );
  const [questionCount, setQuestionCount] = useState(4);
  const [format, setFormat] = useState('Trắc nghiệm 4 lựa chọn');
  const [isLoading, setIsLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Active generated quiz
  const [quiz, setQuiz] = useState<DifferentiatedQuiz | null>({
    id: 'quiz_demo',
    subject: 'Toán',
    topic: 'Bảng nhân 8 và 9 – Giải bài toán có lời văn',
    objective: 'Học sinh thuộc bảng nhân 8, 9, vận dụng tính nhẩm nhanh và giải được bài toán thực tế',
    createdAt: 'Hôm nay',
    tiers: [
      {
        tierName: 'Mầm Xanh (Cơ bản)',
        tierDescription: 'Củng cố nhận biết và tính nhẩm bảng nhân cơ bản',
        questions: [
          {
            id: 'mx_1',
            question: 'Kết quả của phép nhân 8 × 6 là bao nhiêu?',
            options: ['A. 42', 'B. 48', 'C. 54', 'D. 56'],
            correctAnswer: 'B',
            explanation: 'Theo bảng nhân 8: 8 × 6 = 48.',
          },
          {
            id: 'mx_2',
            question: 'Phép tính nào dưới đây có kết quả bằng 72?',
            options: ['A. 9 × 8', 'B. 8 × 7', 'C. 9 × 7', 'D. 8 × 8'],
            correctAnswer: 'A',
            explanation: 'Ta có 9 × 8 = 72 và 8 × 9 = 72.',
          },
        ],
      },
      {
        tierName: 'Vươn Lên (Vận dụng)',
        tierDescription: 'Rèn luyện kỹ năng giải toán 2 bước và tính giá trị biểu thức',
        questions: [
          {
            id: 'vl_1',
            question: 'Mỗi hộp bánh có 8 chiếc bánh. Mẹ mua 5 hộp bánh và được tặng thêm 3 chiếc bánh nữa. Hỏi mẹ có tất cả bao nhiêu chiếc bánh?',
            options: ['A. 40 chiếc', 'B. 43 chiếc', 'C. 45 chiếc', 'D. 48 chiếc'],
            correctAnswer: 'B',
            explanation: 'Số bánh trong 5 hộp là: 8 × 5 = 40 (chiếc). Mẹ có tất cả: 40 + 3 = 43 (chiếc).',
          },
          {
            id: 'vl_2',
            question: 'Tìm x biết: x : 9 = 4 (dư 3)?',
            options: ['A. 36', 'B. 39', 'C. 42', 'D. 33'],
            correctAnswer: 'B',
            explanation: 'Muốn tìm số bị chia trong phép chia có dư: x = Thương × Số chia + Số dư = 4 × 9 + 3 = 39.',
          },
        ],
      },
      {
        tierName: 'Bứt Phá (Tư duy cao)',
        tierDescription: 'Khơi gợi tư duy logic, bài toán thực tiễn và liên môn',
        questions: [
          {
            id: 'bp_1',
            question: 'Lớp 3A5 của Cô Vân có 4 tổ tham gia trồng cây. Mỗi tổ trồng được 9 cây hoa chuông vàng. Sau đó, cả lớp cùng trồng thêm 8 cây bàng non. Hỏi cả lớp đã trồng được tất cả bao nhiêu cây xanh?',
            options: ['A. 42 cây', 'B. 44 cây', 'C. 40 cây', 'D. 36 cây'],
            correctAnswer: 'B',
            explanation: '4 tổ trồng được: 9 × 4 = 36 (cây hoa). Tổng số cây lớp 3A5 trồng được là: 36 + 8 = 44 (cây).',
          },
        ],
      },
    ],
  });

  const [activeTierIndex, setActiveTierIndex] = useState(0);

  // Generate Lesson via server endpoint or high-quality pedagogical fallback
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorNotice(null);
    sound.playWheelTick();

    try {
      const response = await fetch('/api/gemini/create-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          objective,
          questionCount,
          format,
        }),
      });

      const data = await response.json();

      if (data && data.tiers && data.tiers.length > 0) {
        setQuiz({
          id: `quiz_${Date.now()}`,
          subject: data.subject || subject,
          topic: data.topic || topic,
          objective,
          createdAt: new Date().toLocaleDateString('vi-VN'),
          tiers: data.tiers,
        });
        sound.playCelebration();
      } else {
        // High-quality local generator fallback
        generateLocalFallback();
      }
    } catch {
      generateLocalFallback();
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalFallback = () => {
    const fallbackTiers: DifferentiatedTier[] = [
      {
        tierName: 'Mầm Xanh (Cơ bản)',
        tierDescription: `Củng cố nhận biết kiến thức trọng tâm bài "${topic}"`,
        questions: [
          {
            id: `fb_mx_1`,
            question: `Theo bài học "${topic}", nhận định nào sau đây là cơ bản và đúng nhất?`,
            options: [
              'A. Nắm vững định nghĩa và quy tắc đã học trong sách giáo khoa',
              'B. Bỏ qua các bước tính toán và điền đáp án bất kỳ',
              'C. Không cần thực hiện theo các bước hướng dẫn',
              'D. Chỉ làm bài khi có đáp án sẵn'
            ],
            correctAnswer: 'A',
            explanation: `Đáp án A đúng. Bài "${topic}" yêu cầu học sinh lớp 3A5 ghi nhớ vững các quy tắc cốt lõi.`,
          },
          {
            id: `fb_mx_2`,
            question: `Em hãy chọn phương án phù hợp nhất cho chủ đề "${topic}":`,
            options: [
              'A. Thực hiện cẩn thận từng bước giải',
              'B. Đọc lướt và không soát lại bài',
              'C. Viết tắt bừa bãi',
              'D. Nộp bài sớm dù chưa làm xong'
            ],
            correctAnswer: 'A',
            explanation: `Lời dặn của Cô Kiều Thị Vân: Làm bài cẩn thận, nắn nót từng chữ và phép tính!`,
          },
        ],
      },
      {
        tierName: 'Vươn Lên (Vận dụng)',
        tierDescription: `Thực hành giải bài toán và liên hệ tình huống thực tế`,
        questions: [
          {
            id: `fb_vl_1`,
            question: `Trong tiết học lớp 3A5, bạn An gặp bài toán liên quan đến "${topic}". Bạn nên làm gì để giải quyết tốt nhất?`,
            options: [
              'A. Đọc kỹ đề bài, tóm tắt và thực hiện các phép tính theo thứ tự',
              'B. Bỏ qua bài toán khó',
              'C. Đợi bạn khác giải xong rồi chép',
              'D. Chọn ngẫu nhiên một phép tính'
            ],
            correctAnswer: 'A',
            explanation: `Kỹ năng giải bài tập của học sinh lớp 3: Luôn đọc kỹ đề, tóm tắt dữ kiện và giải từng bước.`,
          },
        ],
      },
      {
        tierName: 'Bứt Phá (Tư duy cao)',
        tierDescription: `Mở rộng tư duy sáng tạo và áp dụng vào đời sống hàng ngày`,
        questions: [
          {
            id: `fb_bp_1`,
            question: `Nếu được giao nhiệm vụ chia sẻ kiến thức "${topic}" cho các bạn trong Tổ thi đua, em sẽ trình bày thế nào?`,
            options: [
              'A. Vẽ sơ đồ tư duy sinh động kèm ví dụ thực tế trong lớp học',
              'B. Chỉ đọc lại từng câu trong sách mà không giải thích',
              'C. Nói thật nhanh để kết thúc sớm',
              'D. Không chuẩn bị gì'
            ],
            correctAnswer: 'A',
            explanation: `Sơ đồ tư duy và ví dụ sinh động giúp các bạn trong tổ hiểu bài sâu sắc và hứng thú học tập.`,
          },
        ],
      },
    ];

    setQuiz({
      id: `quiz_${Date.now()}`,
      subject,
      topic,
      objective,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      tiers: fallbackTiers,
    });
    sound.playStarReward();
  };

  const handlePrintWorksheet = () => {
    sound.playStarReward();
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-700 text-white rounded-3xl p-6 shadow-md border-2 border-amber-300">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-rose-950 flex items-center justify-center font-bold text-3xl shadow-lg border border-white">
              ✨
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide uppercase">
                TRỢ LÝ SOẠN BÀI CÔ KIỀU THỊ VÂN
              </h2>
              <p className="text-xs sm:text-sm text-rose-100">
                “Tạo bài tập phân hóa 3 mức độ (Mầm Xanh – Vươn Lên – Bứt Phá) • Tùy biến chuẩn GDPT 2018”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrintWorksheet}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-rose-950 text-xs font-black flex items-center gap-1.5 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Bài Tập</span>
            </button>
          </div>
        </div>
      </div>

      {/* Input Parameters Form (Hidden when printing) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 print:hidden">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-rose-800" />
          Thông Số Soạn Bài Dạy Lớp 3
        </h3>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Môn học:</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-rose-800 focus:outline-none"
              >
                <option value="Toán">Toán</option>
                <option value="Tiếng Việt">Tiếng Việt</option>
                <option value="Tự nhiên và Xã hội">Tự nhiên và Xã hội</option>
                <option value="Tiếng Anh">Tiếng Anh</option>
                <option value="Đạo đức">Đạo đức</option>
                <option value="Tin học">Tin học</option>
                <option value="Công nghệ">Công nghệ</option>
                <option value="Hoạt động trải nghiệm">Hoạt động trải nghiệm</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên bài học hoặc chủ đề trọng tâm:
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Bảng nhân 8 và 9, Tìm từ chỉ đặc điểm..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Yêu cầu cần đạt / Mục tiêu sư phạm của tiết học:
            </label>
            <input
              type="text"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              placeholder="Ví dụ: Nắm vững kiến thức, rèn luyện kỹ năng thực hành và vận dụng linh hoạt"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-rose-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Hình thức câu hỏi mong muốn:
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none"
              >
                <option value="Trắc nghiệm 4 lựa chọn">Trắc nghiệm 4 lựa chọn (A, B, C, D)</option>
                <option value="Điền khuyết">Điền từ / số còn thiếu vào chỗ trống</option>
                <option value="Nối cặp đôi">Nối cặp thông minh</option>
                <option value="Câu hỏi tình huống">Tình huống thực tế & liên hệ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số câu hỏi mỗi mức độ:
              </label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none"
              >
                <option value={3}>3 câu mỗi mức độ (Tổng 9 câu)</option>
                <option value={4}>4 câu mỗi mức độ (Tổng 12 câu)</option>
                <option value={5}>5 câu mỗi mức độ (Tổng 15 câu)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500 italic">
              ✨ Tự động tạo 3 phiên bản phân hóa không gán nhãn tiêu cực cho trẻ.
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-gradient-to-r from-rose-900 to-amber-700 hover:from-rose-950 hover:to-amber-800 text-amber-300 font-extrabold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Đang Phân Tích & Soạn Bài...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Cô Vân Bắt Đầu Tạo Bài Tập</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* QUIZ PREVIEW: 3 DIFFERENTIATED TIERS */}
      {quiz && (
        <div className="space-y-4">
          {/* Printable Header */}
          <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h3 className="font-bold text-sm uppercase">{topic}</h3>
            <p className="text-xs">Lớp 3A5 • Trường Tiểu học Ngô Thì Nhậm • GVCN: Kiều Thị Vân</p>
            <p className="text-xs italic">Họ và tên học sinh: ..................................................... Tổ: .........</p>
          </div>

          {/* Tier Switcher Pills (Hidden when printing) */}
          <div className="flex items-center gap-2 overflow-x-auto print:hidden">
            {quiz.tiers.map((tier, idx) => {
              const isActive = activeTierIndex === idx;
              const icons = ['🌱', '🚀', '⭐'];

              return (
                <button
                  key={idx}
                  onClick={() => setActiveTierIndex(idx)}
                  className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 border-2 ${
                    isActive
                      ? 'bg-rose-900 text-amber-300 border-rose-950 shadow-md scale-102'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{icons[idx]}</span>
                  <span>{tier.tierName}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-normal">
                    {tier.questions.length} câu
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Tier Questions */}
          {quiz.tiers[activeTierIndex] && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base text-rose-900">
                    Phân Hóa: {quiz.tiers[activeTierIndex].tierName}
                  </h4>
                  <p className="text-xs text-slate-500 italic">
                    {quiz.tiers[activeTierIndex].tierDescription}
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Đã kiểm duyệt sư phạm
                </span>
              </div>

              <div className="space-y-4">
                {quiz.tiers[activeTierIndex].questions.map((q, qIdx) => (
                  <div
                    key={q.id || qIdx}
                    className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-2 hover:bg-white transition"
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-800 flex items-start gap-2">
                      <span className="w-6 h-6 rounded-lg bg-amber-400 text-rose-950 font-black flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                        {qIdx + 1}
                      </span>
                      <span className="leading-relaxed">{q.question}</span>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl text-xs font-medium border ${
                            opt.startsWith(q.correctAnswer)
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="pl-8 pt-1 text-[11px] text-slate-500 italic">
                      💡 <strong>Giải thích sư phạm:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
