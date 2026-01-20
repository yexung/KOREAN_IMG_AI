import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
당신은 사주명리학(Saju Myeongrihak)을 기반으로 천생연분의 상세 프로필을 분석해주는 AI 전문가입니다.
사용자는 자신의 천생연분에 대해 **직업, 구체적인 외모(키, 스타일), 성격, 분위기** 등 실질적인 정보를 원합니다.
추상적인 운세 풀이가 아닌, 실제로 소개팅 주선자가 상대방을 상세히 소개하듯이 설명해주세요.

분석 논리 (Internal Logic):
1. 사용자의 사주에서 부족한 오행(용신)을 찾습니다.
2. 그 오행을 직업과 물상으로 변환합니다. (예: 금(Metal) 부족 -> 금융/IT/의료 분야, 세련된 정장 스타일)
3. 외모 묘사 시 한국인의 평균적인 특징을 고려하되, 사주 기운에 맞는 구체적인 키(cm)와 인상을 제시합니다.

작성 가이드라인:
- **명확한 구분**: 성격, 외모, 직업, 특징을 명확한 헤더로 구분하여 작성합니다.
- **구체적 예시**: "성실하다"보다는 "매사 신중하고 돌다리도 두들겨 보는 성격"처럼 묘사합니다.
- **외모 디테일**: 단순 "잘생겼다"가 아닌 "쌍커풀 없는 담백한 눈매에 178cm 정도의 키"와 같이 묘사합니다.

이미지 생성 규칙:
- 반드시 "Photorealistic portrait of a Korean person..."으로 시작
- 분석된 '천생연분의 외모'와 '패션 스타일'을 영문 프롬프트에 정확히 반영
`;

export const analyzeSoulmate = async (
  birthDate: string,
  birthTime: string,
  gender: 'male' | 'female',
  knowsTime: boolean
): Promise<{ koreanAnalysis: string; imagePrompt: string }> => {
  try {
    const userGender = gender === 'male' ? '남성 (건명)' : '여성 (곤명)';
    const timeInfo = knowsTime ? `출생 시간: ${birthTime}` : '출생 시간: 정보 없음 (삼주 분석)';
    const soulmateGender = gender === 'male' ? 'Female' : 'Male';

    const prompt = `
    [사용자 정보]
    양력: ${birthDate}
    ${timeInfo}
    성별: ${userGender}

    위 사용자의 사주를 분석하여 천생연분(${soulmateGender})의 상세 프로필을 작성해주세요.
    
    [출력 요구사항 - koreanAnalysis 필드]
    다음 5가지 항목을 이모지와 함께 구분하여 작성하세요:

    1. 🔮 **나의 부족한 기운**
       - 내 사주에서 보완이 필요한 오행이나 기운 간단 요약

    2. ❤️ **천생연분의 성격**
       - 구체적인 성향 (예: 조심성, 대담함, 다정함 등)
       - 장점과 매력 포인트

    3. ✨ **천생연분의 외모 & 스타일**
       - **예상 키**: (예: 175~180cm, 아담한 편 등)
       - **인상**: (예: 강아지상, 차가운 도시 남/녀 느낌)
       - **패션**: (예: 댄디한 수트핏, 편안한 캐주얼, 모던 시크)

    4. 💼 **추천 직업군**
       - 상대방의 기운(오행)과 잘 맞는 현실적인 직업 2~3가지 (예: 공무원, 개발자, 디자이너)

    5. 🧩 **그 사람의 특징 및 분위기**
       - 함께 있을 때 느껴지는 안정감이나 에너지
       - 이 사람을 알아보는 힌트

    [이미지 프롬프트]
    위 '천생연분의 외모 & 스타일' 항목을 바탕으로 고품질 한국인 실사 이미지를 생성할 수 있는 영문 프롬프트 작성.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            koreanAnalysis: {
              type: Type.STRING,
              description: "직업, 외모, 성격 등이 항목별로 정리된 상세 분석 결과",
            },
            imagePrompt: {
              type: Type.STRING,
              description: "천생연분 실사 이미지 생성을 위한 상세 영문 프롬프트 (Korean aesthetics)",
            },
          },
          required: ["koreanAnalysis", "imagePrompt"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("분석 결과를 생성하지 못했습니다.");
    
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error("천생연분 분석 중 오류가 발생했습니다.");
  }
};

export const generateSoulmateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        // 이미지 모델 설정
      }
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("이미지를 생성하지 못했습니다.");
    }

    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("이미지 데이터가 반환되지 않았습니다.");
  } catch (error: any) {
    console.error("Image Gen Error:", error);
    throw new Error("이미지 생성 중 오류가 발생했습니다.");
  }
};