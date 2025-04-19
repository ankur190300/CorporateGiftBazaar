import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Function to generate a response from OpenAI
export async function generateHamperSuggestion(userMessages: string[]): Promise<{ 
  message: string;
  hamper?: {
    name: string;
    description: string;
    items: string[];
    price: number;
  }
}> {
  try {
    // First, we'll create a system message to guide the AI
    const systemMessage = `You are a helpful corporate gift hamper assistant. Help users create customized gift hampers for corporate occasions.
    When appropriate, suggest complete gift hampers based on the user's requests and preferences.
    When suggesting a hamper, include a JSON response in the following format:
    {
      "name": "Name of the hamper",
      "description": "Brief description of the hamper",
      "items": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"],
      "price": number in cents (e.g., 15000 for $150)
    }`;

    // Format conversation history
    const messages = [
      { role: "system", content: systemMessage },
      ...userMessages.map((msg, index) => {
        // Alternate between user and assistant messages
        return { 
          role: index % 2 === 0 ? "user" : "assistant",
          content: msg
        };
      })
    ];

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 800
    });

    // Extract the message content
    const messageContent = response.choices[0].message.content || "";

    // Parse JSON if it exists in the response
    let hamper = null;
    const jsonMatch = messageContent.match(/\{[\s\S]*?\}/);
    
    if (jsonMatch) {
      try {
        const jsonStr = jsonMatch[0];
        hamper = JSON.parse(jsonStr);
      } catch (err) {
        console.error("Failed to parse JSON from OpenAI response:", err);
      }
    }

    // Clean the message content by removing JSON
    const cleanMessage = messageContent.replace(/\{[\s\S]*?\}/, "").trim();

    return {
      message: cleanMessage,
      hamper: hamper
    };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate hamper suggestion. Please try again later.");
  }
}