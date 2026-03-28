const fetchWithRetry = async (url: string, options: RequestInit, maxRetries = 3): Promise<Response> => {
  let delay = 1500;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429 && i < maxRetries - 1) {
        console.warn(`Rate limit hit (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return response;
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  throw new Error("Max retries reached");
};

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
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
Each question should be structured with 4 clear options, the correct answer, a short explanation, and a specific subtopic for the question.

Return the result STRICTLY as a JSON array of objects with the following keys and no extra text or markdown formatting:
[
  {
    "question": "The question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "The exact text of the correct option",
    "explanation": "Brief explanation of why",
    "topic": "The specific short subtopic (e.g., Object-Oriented Programming)"
  }
]`;

  const response = await fetchWithRetry(
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

export interface VideoRecommendation {
  title: string;
  url: string;
}

export interface RevisionTopic {
  topic: string;
  notes: string;
  videos: VideoRecommendation[];
}

export const generateRevisionNotes = async (topics: string[]): Promise<RevisionTopic[]> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  if (!topics || topics.length === 0) return [];

  const prompt = `You are an expert instructor. Provide revision notes and relevant YouTube search links for the following topics:
${topics.map(t => `- ${t}`).join("\n")}

For each topic, provide concise, high-yield bullet point notes and exactly 2 relevant YouTube search links. 
The YouTube search links MUST be formatted like this: https://www.youtube.com/results?search_query=URL+ENCODED+SEARCH+QUERY

Return the result STRICTLY as a JSON array of objects with the following keys and no extra text or markdown formatting:
[
  {
    "topic": "The Topic Name",
    "notes": "Concise revision notes as a string...",
    "videos": [
      { "title": "A descriptive title for the video search", "url": "https://www.youtube.com/results?search_query=..." }
    ]
  }
]`;

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
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
    throw new Error(`Failed to generate revision notes. Server responded with status ${response.status}`);
  }

  const data = await response.json();
  const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textPart) {
    throw new Error("Invalid response format received from Gemini API.");
  }

  try {
    return JSON.parse(textPart) as RevisionTopic[];
  } catch (error) {
    console.error("Failed to parse JSON response:", textPart);
    throw new Error("Failed to parse the generated revision notes from the AI.");
  }
};

export const generateChatbotResponse = async (message: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env.local file.");
  }

  const prompt = `You are a Smart EdTech Assistant designed to help users identify learning gaps and guide them with structured roadmaps. Answer the user's request concisely, formatting with markdown where appropriate.\n\nUser: ${message}`;

  const response = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Gemini API Error:", errorBody);
    throw new Error(`Failed to generate chatbot response. Server responded with status ${response.status}`);
  }

  const data = await response.json();
  const textPart = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textPart) {
    throw new Error("Invalid response format received from Gemini API.");
  }

  return textPart;
};