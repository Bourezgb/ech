
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { InfographicData, InfographicType, InfographicTheme, AspectRatio } from "../types";

export class GeminiService {
  private getClient() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  private getTypeContext(type: InfographicType): string {
    const map: Record<InfographicType, string> = {
      [InfographicType.STATISTICAL]: "إنفوجرافيك إحصائي يركز على الأرقام والرسوم البيانية والمقارنات العددية.",
      [InfographicType.TIMELINE]: "إنفوجرافيك زمني يعرض تسلسلاً تاريخياً أو أحداثاً متعاقبة بشكل خطي.",
      [InfographicType.GEOGRAPHICAL]: "إنفوجرافيك جغرافي يعتمد على الخرائط لتوضيح توزيع البيانات مكانياً.",
      [InfographicType.PROCESS]: "إنفوجرافيك عمليات يشرح خطوات متسلسلة أو آلية عمل معينة.",
      [InfographicType.ANATOMY]: "إنفوجرافيك تشريحي يفكك أجزاء كائن أو نظام معين مع شرح وظيفة كل جزء.",
      [InfographicType.COMPARISON]: "إنفوجرافيك مقارنة يبرز أوجه الشبه والاختلاف بين كيانين أو أكثر.",
      [InfographicType.LISTICLE]: "إنفوجرافيك قائمة يعرض مجموعة من النصائح أو الحقائق أو النقاط الهامة بشكل جذاب.",
      [InfographicType.BIO_PROFILE]: "إنفوجرافيك سيرة ذاتية يركز على حياة شخصية عامة أو بروفايل لشركة.",
      [InfographicType.DASHBOARD]: "لوحة بيانات (Dashboard) تجمع بين أنواع مختلفة من الرسوم البيانية في شاشة واحدة.",
      [InfographicType.EDUCATIONAL]: "إنفوجرافيك تعليمي يقدم حقائق ومعلومات تعليمية شاملة حول موضوع معين بأسلوب مبسط وجذاب."
    };
    return map[type];
  }

  private getThemeInstructions(theme: InfographicTheme): string {
    const map: Record<InfographicTheme, string> = {
      [InfographicTheme.DARK_MODERN]: "نمط داكن حديث (Dark UI) مع تباين عالي وألوان نيون خفيفة.",
      [InfographicTheme.CLEAN_WHITE]: "نمط أبيض نظيف وناصع مع ظلال خفيفة وألوان باستيل احترافية.",
      [InfographicTheme.TECH_FUTURISTIC]: "نمط تقني مستقبلي مع خطوط رقمية، دوائر إلكترونية، وتأثيرات زجاجية.",
      [InfographicTheme.RETRO_VINTAGE]: "نمط كلاسيكي (Retro) يستخدم ألواناً باهتة وورقاً محبباً وخطوطاً طباعية قديمة.",
      [InfographicTheme.MINIMALIST]: "نمط تبسيط (Minimalist) يركز على الفراغات البيضاء وأقل قدر ممكن من العناصر المعقدة.",
      [InfographicTheme.ISOMETRIC_3D]: "نمط ثلاثي الأبعاد متساوي القياس (Isometric 3D) يعطي عمقاً للعناصر والرسوم."
    };
    return map[theme];
  }

  async extractDataFromArticle(articleText: string): Promise<Partial<InfographicData>> {
    const ai = this.getClient();
    const prompt = `
      بصفتك صحفي بيانات خبير، قم بتحليل المقال التالي واستخرج منه العناصر اللازمة لإنشاء إنفوجرافيك احترافي.
      يجب أن تقرر ما هو نوع الإنفوجرافيك الأنسب من هذه القائمة حصراً: STATISTICAL, TIMELINE, GEOGRAPHICAL, PROCESS, ANATOMY, COMPARISON, LISTICLE, BIO_PROFILE, DASHBOARD, EDUCATIONAL.
      
      المقال:
      "${articleText}"

      قم بإرجاع النتيجة بتنسيق JSON مع الحقول التالية:
      - type: (واحد من الأنواع المذكورة أعلاه)
      - title: عنوان جذاب وقصير للإنفوجرافيك.
      - imageDescription: وصف لمكون بصري مركزي يعبر عن محتوى المقال.
      - unit: وحدة القياس المستخدمة (مثلاً: مليار دولار، نسبة مئوية، تاريخ).
      - source: مصدر المعلومات المذكور في المقال.
      - items: مصفوفة من العناصر (بحد أقصى 10) كل منها يحتوي على label و value و subValue اختيارياً.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            title: { type: Type.STRING },
            imageDescription: { type: Type.STRING },
            unit: { type: Type.STRING },
            source: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  subValue: { type: Type.STRING },
                },
                required: ["label", "value"],
              },
            },
          },
          required: ["type", "title", "imageDescription", "items"],
        },
      },
    });

    try {
      return JSON.parse(response.text);
    } catch (e) {
      throw new Error("فشل في تحليل المقال وتحويله إلى بيانات منظمة.");
    }
  }

  async refinePrompt(data: InfographicData): Promise<string> {
    const ai = this.getClient();
    const typeCtx = this.getTypeContext(data.type);
    const themeInst = this.getThemeInstructions(data.theme);
    
    const prompt = `
      صغ برومبت (مطالبة نصية) فني مذهل باللغة العربية موجه لنموذج "Nano Banana" (Gemini 2.5 Flash Image) لإنشاء إنفوجرافيك صحفي.
      
      السياق الفني:
      - النوع: ${typeCtx}
      - النمط: ${themeInst}
      - الأبعاد: ${data.aspectRatio}
      - العنوان: ${data.title}
      - وصف الصورة المركزية: ${data.imageDescription}
      - تعليمات إضافية: ${data.customInstructions || 'لا توجد'}

      البيانات:
      ${data.items.map(i => `- ${i.label}: ${i.value} ${i.subValue ? `[${i.subValue}]` : ''}`).join('\n')}
      (الوحدة: ${data.unit} | المصدر: ${data.source})

      تعليمات الصياغة:
      1. صف المشهد بتفاصيل بصرية عميقة (إضاءة، خامات، تكوين فني).
      2. اطلب تمثيل البيانات بأسلوب Vector Art أو Flat Design احترافي.
      3. ركز على التنسيق باللغة العربية والخطوط الطباعية الحديثة.
      4. استخدم مصطلحات فنية مثل: Cinematic lighting, 8k resolution, Minimalist typography, Professional infographics.
      5. لا تضف أي نص توضيحي خارجي، فقط المطالبة النصية.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text?.trim() || "تعذر صياغة البرومبت.";
  }

  async generateInfographicImage(refinedPrompt: string): Promise<string> {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: refinedPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }

    throw new Error("لم يقم النموذج بتوليد الصورة بنجاح.");
  }
}
