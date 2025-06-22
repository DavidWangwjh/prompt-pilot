import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const MODEL_NAME = "gemini-2.0-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

export interface PromptAnalysis {
  clarity: number;
  engagement: number;
  creativity: number;
  effectiveness: number;
  specificity: number;
}

export interface JudgeResult {
  feedback: string;
  scores: {
    promptA: PromptAnalysis;
    promptB: PromptAnalysis;
  };
  winner: string;
  reasoning: string;
  recommendations: {
    promptA: string[];
    promptB: string[];
  };
  overallAssessment: string;
}

export class AIJudgeAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: MODEL_NAME });
  }

  async analyzePrompts(promptA: string, promptB: string, responseA: string, responseB: string): Promise<JudgeResult> {
    const judgePrompt = this.buildJudgePrompt(promptA, promptB, responseA, responseB);
    
    try {
      const result = await this.model.generateContent(judgePrompt);
      const text = result.response.text();
      return this.parseJudgeResponse(text);
    } catch (error) {
      console.error("AI Judge analysis failed:", error);
      return this.getFallbackResult(promptA, promptB, responseA, responseB);
    }
  }

  private buildJudgePrompt(promptA: string, promptB: string, responseA: string, responseB: string): string {
    return `You are an expert AI Prompt Engineering Judge with deep expertise in evaluating prompt effectiveness and AI response quality. Your role is to provide comprehensive analysis of two competing prompts and their generated responses.

ANALYSIS FRAMEWORK:
1. Clarity (0-100): How clear, specific, and unambiguous the prompt is
2. Engagement (0-100): How engaging, compelling, and interesting the response is
3. Creativity (0-100): How original, innovative, and creative the response is
4. Effectiveness (0-100): How well the prompt achieves its intended goal
5. Specificity (0-100): How specific and detailed the prompt instructions are

EVALUATION CRITERIA:
- Prompt Structure: Is the prompt well-structured with clear instructions?
- Response Quality: Is the AI response relevant, coherent, and valuable?
- User Experience: Would this prompt consistently produce good results?
- Creativity and Originality: Does the response show unique insights?
- Goal Achievement: Does the response fulfill the prompt's intended purpose?

TASK:
Analyze the following two prompts and their responses:

PROMPT A: "${promptA}"
RESPONSE A: "${responseA}"

PROMPT B: "${promptB}"
RESPONSE B: "${responseB}"

Provide a comprehensive analysis including:
1. Detailed scoring for each prompt across all dimensions
2. Comparative analysis of strengths and weaknesses
3. Specific recommendations for improvement for each prompt
4. Clear winner recommendation with detailed reasoning
5. Overall assessment of both prompts

Return your analysis as a valid JSON object with this exact structure:
{
  "feedback": "Your detailed analysis and recommendation here...",
  "scores": {
    "promptA": { "clarity": <score>, "engagement": <score>, "creativity": <score>, "effectiveness": <score>, "specificity": <score> },
    "promptB": { "clarity": <score>, "engagement": <score>, "creativity": <score>, "effectiveness": <score>, "specificity": <score> }
  },
  "winner": "promptA" or "promptB",
  "reasoning": "Detailed explanation of why this prompt won",
  "recommendations": {
    "promptA": ["recommendation 1", "recommendation 2"],
    "promptB": ["recommendation 1", "recommendation 2"]
  },
  "overallAssessment": "Overall assessment of both prompts and their effectiveness"
}

IMPORTANT: Return ONLY the JSON object. No additional text, markdown, or explanations.`;
  }

  private parseJudgeResponse(text: string): JudgeResult {
    try {
      const startIndex = text.indexOf('{');
      const endIndex = text.lastIndexOf('}') + 1;
      const jsonString = text.substring(startIndex, endIndex);
      const parsed = JSON.parse(jsonString);
      
      // Validate and normalize the response
      if (!this.isValidJudgeResult(parsed)) {
        throw new Error("Invalid response structure");
      }
      
      return this.normalizeJudgeResult(parsed);
    } catch (error) {
      console.error("Failed to parse AI Judge response:", text, error);
      throw new Error("The AI judge returned an invalid response format");
    }
  }

  private isValidJudgeResult(result: any): boolean {
    return result.feedback && 
           result.scores && 
           result.scores.promptA && 
           result.scores.promptB &&
           result.winner && 
           result.reasoning;
  }

  private normalizeJudgeResult(result: any): JudgeResult {
    // Ensure all scores are numbers and within 0-100 range
    const normalizeScores = (scores: any): PromptAnalysis => ({
      clarity: Math.min(100, Math.max(0, Number(scores.clarity) || 0)),
      engagement: Math.min(100, Math.max(0, Number(scores.engagement) || 0)),
      creativity: Math.min(100, Math.max(0, Number(scores.creativity) || 0)),
      effectiveness: Math.min(100, Math.max(0, Number(scores.effectiveness) || 0)),
      specificity: Math.min(100, Math.max(0, Number(scores.specificity) || 0))
    });

    return {
      feedback: result.feedback || "Analysis completed",
      scores: {
        promptA: normalizeScores(result.scores.promptA),
        promptB: normalizeScores(result.scores.promptB)
      },
      winner: result.winner || "promptB",
      reasoning: result.reasoning || "Analysis completed",
      recommendations: {
        promptA: Array.isArray(result.recommendations?.promptA) ? result.recommendations.promptA : [],
        promptB: Array.isArray(result.recommendations?.promptB) ? result.recommendations.promptB : []
      },
      overallAssessment: result.overallAssessment || "Both prompts show potential with room for improvement"
    };
  }

  private getFallbackResult(promptA: string, promptB: string, responseA: string, responseB: string): JudgeResult {
    // Simple fallback analysis based on response length and content
    const scoreA = this.calculateFallbackScore(responseA);
    const scoreB = this.calculateFallbackScore(responseB);
    
    return {
      feedback: "The AI judge encountered an issue with detailed analysis. Here's a basic comparison:\n\nBoth prompts generated responses successfully. Consider testing with different variations to find the optimal prompt for your use case.",
      scores: {
        promptA: { clarity: 75, engagement: 70, creativity: 65, effectiveness: 70, specificity: 75 },
        promptB: { clarity: 70, engagement: 75, creativity: 70, effectiveness: 75, specificity: 70 }
      },
      winner: scoreB > scoreA ? "promptB" : "promptA",
      reasoning: scoreB > scoreA ? "Slightly higher engagement and effectiveness scores" : "Slightly higher clarity and specificity scores",
      recommendations: {
        promptA: ["Consider adding more specific instructions", "Try varying the tone or style"],
        promptB: ["Add more context or background information", "Consider being more explicit about the desired output format"]
      },
      overallAssessment: "Both prompts show potential. The winner was determined by overall response quality and engagement."
    };
  }

  private calculateFallbackScore(response: string): number {
    // Simple scoring based on response characteristics
    let score = 50; // Base score
    
    // Length factor
    if (response.length > 200) score += 10;
    if (response.length > 500) score += 10;
    
    // Content quality indicators
    if (response.includes('"') || response.includes('"')) score += 5; // Dialogue
    if (response.includes('!') || response.includes('?')) score += 5; // Emotional punctuation
    if (response.split('.').length > 3) score += 5; // Multiple sentences
    
    return Math.min(100, score);
  }
}

export const aiJudgeAgent = new AIJudgeAgent(); 