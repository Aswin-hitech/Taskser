const config = require("../config/env");

const extractJson = (content) => {
  const trimmed = String(content || "").trim();
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("The LLM response did not include valid JSON.");
  }

  return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
};

const requestGroq = async ({ messages, model }) => {
  if (!config.groqApiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to your environment to use roadmap generation.");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.25,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
};

const generateCareerRoadmap = async ({ title, topics, targetCompletionDate }) => {
  const messages = [
    {
      role: "system",
      content:
        "You organize career learning plans. Return only JSON with modules. Each module needs title, description, milestones, and every milestone needs a checklist of specific learning tasks.",
    },
    {
      role: "user",
      content: JSON.stringify({
        roadmap: title,
        topics,
        targetCompletionDate,
        schema: {
          modules: [
            {
              title: "Module name",
              description: "Short practical outcome",
              milestones: [
                {
                  title: "Milestone name",
                  checklist: ["Specific task", "Specific task"],
                },
              ],
            },
          ],
        },
      }),
    },
  ];

  try {
    return extractJson(await requestGroq({ messages, model: config.groqModel }));
  } catch (error) {
    if (!config.groqFallbackModel || config.groqFallbackModel === config.groqModel) {
      throw error;
    }

    return extractJson(await requestGroq({ messages, model: config.groqFallbackModel }));
  }
};

module.exports = {
  generateCareerRoadmap,
};
