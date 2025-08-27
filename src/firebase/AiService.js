// src/AIService.js
import { doc, getDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore"; // your firebase init file

// Function to fetch user data
const getUserData = async (uid) => {
    const firestore = getFirestore();
  try {
    const docRef = doc(firestore, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export async function askGemini(prompt) {
  try {
    const uid = localStorage.getItem("uid");
    const userData = JSON.stringify(await getUserData(uid), null, 2);

    const systemPrompt = `
You are Flowstate AI, a personal productivity assistant.
  
Use the user’s tasks, habits, XP, and history to give motivating insights.  
If the user asks for help with productivity, reference their data to give personalized advice.
If the user asks for specific data, give them the specific data.
Keep responses short, supportive, and action-focused. Now answer the following question: ${prompt} based on this data ${userData}`;

    const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
    const functionsBase = process.env.NODE_ENV === "development" && isLocal ? "http://localhost:8888" : "";

    const response = await fetch(`${functionsBase}/.netlify/functions/gemini`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: systemPrompt })
    });

    if (!response.ok) {
      throw new Error(`Gemini function error: ${response.status}`);
    }

    const data = await response.json();

    // Netlify function returns the raw Gemini JSON; adapt to text output
    const candidates = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidates) return candidates;

    // Fallbacks for different API shapes
    const text = data?.promptFeedback?.blockReason || data?.output_text || data?.text;
    return text || "No response";
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "⚠️ Sorry, I couldn’t process that request.";
  }
}
