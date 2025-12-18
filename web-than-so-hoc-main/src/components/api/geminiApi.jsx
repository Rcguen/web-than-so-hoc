const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;

export async function callGemini(prompt) {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await res.json();

    // 🔥 LOG TOÀN BỘ RESPONSE
    console.log("🧠 Gemini full response:", data);

    // ❌ Nếu Gemini trả error
    if (data.error) {
      console.error("❌ Gemini error:", data.error);
      return null;
    }

    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text || null
    );
  } catch (err) {
    console.error("❌ Gemini fetch error:", err);
    return null;
  }
}
