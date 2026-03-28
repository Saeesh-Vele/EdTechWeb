export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export const generateQuestions = async (
  domain: string,
  skill: string,
  difficulty: "Easy" | "Medium" | "Hard"
): Promise<QuizQuestion[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const prompt = `You are an expert ${domain} instructor. Generate exactly 5 relevant ${difficulty} difficulty multiple-choice questions about "${skill}" within the domain of "${domain}".
Each question should be structured with 4 clear options, the correct answer, and a short explanation.

Return the result STRICTLY as a JSON array of objects with the following keys and no extra text or markdown formatting:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The exact text of the correct option",
    "explanation": "Brief explanation of why"
  }
]`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to generate questions. Server responded with status ${response.status}`);
  }

  const data = await response.json();

  if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    throw new Error("Invalid response format received from Gemini API.");
  }

  let textPart = data.candidates[0].content.parts[0].text;

  try {
    const parsedData = JSON.parse(textPart);
    if (!Array.isArray(parsedData) || parsedData.length !== 5) {
      throw new Error("Gemini did not return exactly 5 questions.");
    }
    return parsedData as QuizQuestion[];
  } catch (error) {
    console.error("Failed to parse JSON response:", textPart);
    throw new Error("Failed to parse the generated questions from the AI.");
  }
};
