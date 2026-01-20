import React, { useState } from 'react';
import { Button } from './components/Button';
import { analyzeSoulmate, generateSoulmateImage } from './services/geminiService';
import { UserProfile, AppStatus } from './types';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({
    birthDate: '',
    birthTime: '',
    gender: 'female', // Default
    knowsTime: false,
  });

  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [result, setResult] = useState<{ analysis: string; image: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!profile.birthDate) {
      alert('생년월일을 입력해주세요.');
      return;
    }

    setStatus(AppStatus.ANALYZING);
    setError(null);
    setResult(null);

    try {
      // Step 1: 텍스트 분석 및 프롬프트 생성
      const analysisResult = await analyzeSoulmate(
        profile.birthDate,
        profile.birthTime,
        profile.gender,
        profile.knowsTime
      );

      setStatus(AppStatus.GENERATING_IMAGE);

      // Step 2: 이미지 생성
      const imageBase64 = await generateSoulmateImage(analysisResult.imagePrompt);

      setResult({
        analysis: analysisResult.koreanAnalysis,
        image: imageBase64,
      });
      setStatus(AppStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || '오류가 발생했습니다. 다시 시도해주세요.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleDownload = () => {
    if (!result?.image) return;
    const link = document.createElement('a');
    link.href = result.image;
    link.download = `my-soulmate-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setResult(null);
    setStatus(AppStatus.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fff0f3] text-slate-900 font-[Inter]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">☯️</span>
            <h1 className="text-xl font-bold text-slate-800">
              AI 사주 천생연분
            </h1>
          </div>
          <span className="text-xs text-slate-400 font-medium border border-slate-200 px-2 py-1 rounded-full">
            명리학 기반 분석
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Input Form Section */}
        {status === AppStatus.IDLE && !result && (
          <div className="bg-white p-8 rounded-3xl shadow-xl shadow-pink-100 border border-pink-50 animate-fade-in">
            <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">당신의 사주에 맞는 인연은?</h2>
            <p className="text-center text-slate-500 mb-8">생년월일을 통해 오행의 조화가 완벽한 천생연분을 찾아드립니다.</p>
            
            <div className="space-y-6 max-w-md mx-auto">
              {/* Birth Date */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">양력 생년월일</label>
                <input
                  type="date"
                  value={profile.birthDate}
                  onChange={(e) => setProfile({ ...profile, birthDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none"
                />
              </div>

              {/* Time Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="knowsTime"
                  checked={!profile.knowsTime}
                  onChange={(e) => setProfile({ ...profile, knowsTime: !e.target.checked })}
                  className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                />
                <label htmlFor="knowsTime" className="ml-2 text-sm text-slate-600">
                  태어난 시간을 모릅니다 (삼주만 분석)
                </label>
              </div>

              {/* Time Input */}
              <div className={`transition-all duration-300 ${!profile.knowsTime ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <label className="block text-sm font-semibold text-slate-700 mb-2">출생 시간</label>
                <input
                  type="time"
                  value={profile.birthTime}
                  onChange={(e) => setProfile({ ...profile, birthTime: e.target.value })}
                  disabled={!profile.knowsTime}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all outline-none bg-white"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">성별</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: 'male' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      profile.gender === 'male'
                        ? 'bg-blue-50 text-blue-600 border-2 border-blue-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, gender: 'female' })}
                    className={`py-3 rounded-xl font-medium transition-all ${
                      profile.gender === 'female'
                        ? 'bg-pink-50 text-pink-600 border-2 border-pink-200'
                        : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              <Button
                onClick={handleAnalyze}
                className="w-full py-4 text-lg bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 mt-4"
              >
                사주 분석 시작하기 📜
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {(status === AppStatus.ANALYZING || status === AppStatus.GENERATING_IMAGE) && (
          <div className="bg-white p-12 rounded-3xl shadow-xl shadow-pink-100 border border-pink-50 text-center animate-pulse">
            <div className="mb-6 text-6xl animate-bounce">🧧</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              {status === AppStatus.ANALYZING ? '사주팔자(四柱八字)를 분석 중입니다...' : '용신(用神)의 기운을 담아 그리는 중...'}
            </h3>
            <p className="text-slate-500">당신의 부족한 오행을 채워줄 천생연분입니다.</p>
          </div>
        )}

        {/* Error State */}
        {status === AppStatus.ERROR && (
          <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
             <div className="text-4xl mb-4">🙏</div>
             <p className="text-red-500 mb-6">{error}</p>
             <Button onClick={reset} variant="secondary">다시 시도하기</Button>
          </div>
        )}

        {/* Result Section */}
        {result && status === AppStatus.SUCCESS && (
          <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden animate-fade-in-up">
            
            {/* Image Section */}
            <div className="relative aspect-[3/4] w-full bg-slate-100 group">
              <img 
                src={result.image} 
                alt="Soulmate" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <p className="text-pink-200 font-medium mb-1 tracking-wider text-sm uppercase">Destined Match</p>
                <h2 className="text-3xl font-bold mb-4 font-serif">천생연분(天生緣分)</h2>
                <div className="flex gap-3">
                   <Button 
                      onClick={handleDownload}
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/50 text-white"
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      }
                    >
                      이미지 저장
                   </Button>
                   <Button 
                      onClick={reset}
                      className="bg-slate-800 hover:bg-slate-900 text-white border-transparent"
                    >
                      다시 분석
                   </Button>
                </div>
              </div>
            </div>

            {/* Analysis Text */}
            <div className="p-8 bg-[#fdfbf7]">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center border-b border-slate-200 pb-2">
                  <span className="text-xl mr-2">📜</span>
                  사주 명리학 분석 결과
                </h3>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg font-serif">
                  {result.analysis}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
           from { opacity: 0; transform: translateY(20px); }
           to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;