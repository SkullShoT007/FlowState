// src/AIService.js
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// ✅ Initialize Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

export async function askGemini(prompt) {
  try {
    const uid = localStorage.getItem("uid");
    const userData = JSON.stringify(await getUserData(uid), null, 2);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemPrompt = `
You are Flowstate AI, a personal productivity assistant.
  
Use the user’s tasks, habits, XP, and history to give motivating insights.  
If the user asks for help with productivity, reference their data to give personalized advice.
If the user asks for specific data, give them the specific data.
Keep responses short, supportive, and action-focused.  . now answer the following question: ${prompt} based on this data ${userData}`;
    const result = await model.generateContent(systemPrompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "⚠️ Sorry, I couldn’t process that request.";
  }
}
