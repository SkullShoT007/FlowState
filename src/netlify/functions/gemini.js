exports.handler = async function(event, context) {
  try {
    const { prompt } = JSON.parse(event.body);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing GEMINI_API_KEY server env var" }),
      };
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const text = await response.text();
    const data = (() => {
      try { return JSON.parse(text); } catch { return { raw: text }; }
    })();

    if (!response.ok) {
      console.error("Gemini API error", { status: response.status, data });
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data?.error?.message || "Gemini API request failed", status: response.status }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
