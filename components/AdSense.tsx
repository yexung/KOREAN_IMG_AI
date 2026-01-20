import React, { useEffect } from 'react';

export const AdSense: React.FC = () => {
  useEffect(() => {
    try {
      // Push the ad to the adsbygoogle array when the component mounts
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("AdSense Error:", e);
    }
  }, []);

  return (
    <div className="my-8 w-full flex justify-center">
      <div className="w-full max-w-[728px] min-h-[90px] bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200 relative overflow-hidden">
         {/* 
            [중요] data-ad-slot 값은 애드센스 대시보드에서 생성한 실제 광고 단위 ID로 변경해야 합니다.
         */}
         <ins className="adsbygoogle"
             style={{ display: 'block', width: '100%' }}
             data-ad-client="ca-pub-7888794105202539"
             data-ad-slot="0000000000"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
         
         {/* 개발 중 확인용 텍스트 (광고가 로드되면 가려집니다) */}
         <span className="text-xs text-slate-400 absolute pointer-events-none">
           Google AdSense 영역<br/>(Slot ID 설정 필요)
         </span>
      </div>
    </div>
  );
};