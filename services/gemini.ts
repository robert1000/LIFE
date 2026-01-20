import { GoogleGenAI, Type } from "@google/genai";
import { LifeManualData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function analyzePhoto(base64Image: string): Promise<LifeManualData> {
  const base64Data = base64Image.split(',')[1] || base64Image;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Data,
          },
        },
        {
          text: `你是一個冷酷精準、帶有極致「黑色幽默」與「職場毒舌感」的生命數據分析 AI。請分析受測者照片並生成其「人生說明書」。

要求：
1. 語言：必須使用**繁體中文**。
2. 風格：硬核科技感、冷酷、充滿社畜自嘲與黑色幽默。
3. **內容過濾：請絕對避開「房貸」、「房租」、「債務」、「欠錢」等直接財務負擔話題。** 請專注於「熬夜」、「加班」、「靈魂乾枯」、「夢想殘骸」、「咖啡因依賴」等精神與職場狀態。
4. **字數限制（絕對嚴格執行）**：
   - 標題 (label, title, name): 2-4 個字。
   - 敘述 (desc, description, scoreMessage): 必須嚴格控制在 **14-16 個繁體中文字**以內。
5. 架構：
   - score: 0-100。
   - scoreMessage: 毒舌狀態短評 (14-16字)。
   - brainContents: 3個成分。
   - bodyStatus: 3個生理指標。
   - equipments: 3個虛構裝備及功能描述 (14-16字)。
   - callouts: 3個部位標註及異常描述 (14-16字)。
   - thoughtBubbles: 2個潛意識獨白 (14-16字)。

請只返回純 JSON，不要包含 Markdown 格式代碼塊。`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          scoreMessage: { type: Type.STRING },
          brainContents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                percentage: { type: Type.NUMBER },
              },
              required: ["label", "percentage"]
            }
          },
          bodyStatus: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                value: { type: Type.STRING },
                percentage: { type: Type.NUMBER },
                color: { type: Type.STRING, enum: ["cyan", "orange", "red"] },
              },
              required: ["label", "value", "percentage", "color"]
            }
          },
          equipments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["name", "description"]
            }
          },
          callouts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                point: { type: Type.STRING, enum: ["head", "eyes", "neck", "chest", "hands"] },
                title: { type: Type.STRING },
                desc: { type: Type.STRING },
              },
              required: ["point", "title", "desc"]
            }
          },
          thoughtBubbles: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
        },
        required: ["score", "scoreMessage", "brainContents", "bodyStatus", "equipments", "callouts", "thoughtBubbles"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI 回傳內容為空");
  return JSON.parse(text) as LifeManualData;
}