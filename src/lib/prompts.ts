export const prompts = [
  // Existing Prompts (ID changed to number to match DashboardContext)
  { 
    id: 1, 
    title: 'Creative Story Starter', 
    description: 'A prompt to generate an engaging opening for a fantasy novel.', 
    content: 'Write an engaging opening for a fantasy novel.', 
    tags: ['writing', 'creative', 'fantasy'], 
    likes: 120, 
    comments: 15, 
    model: 'GPT-4' 
  },
  { 
    id: 2, 
    title: 'JavaScript Code Explainer', 
    description: 'Explains a complex piece of JavaScript code in simple terms.', 
    content: 'Explain the following JavaScript code in simple terms: {{code}}', 
    tags: ['coding', 'javascript', 'education'], 
    likes: 256, 
    comments: 42, 
    model: 'GPT-4' 
  },
  { 
    id: 3, 
    title: 'Image Prompt', 
    description: 'Generates a detailed prompt for creating photorealistic sci-fi concept art.', 
    content: 'Generate a detailed prompt for GPT to create photorealistic sci-fi concept art of {{subject}}.', 
    tags: ['art', 'sci-fi'], 
    likes: 512, 
    comments: 89, 
    model: 'GPT-4' 
  },
  { 
    id: 4, 
    title: 'Marketing Copy Generator', 
    description: 'Creates compelling ad copy for a new tech gadget.', 
    content: 'Create compelling ad copy for a new tech gadget: {{product_name}}.', 
    tags: ['marketing', 'copywriting'], 
    likes: 98, 
    comments: 23, 
    model: 'Claude' 
  },
  { 
    id: 5, 
    title: 'Recipe Creator', 
    description: 'Generates a unique recipe based on a list of available ingredients.', 
    content: 'Generate a unique recipe based on the following ingredients: {{ingredients}}.', 
    tags: ['food', 'creative'], 
    likes: 310, 
    comments: 55, 
    model: 'Gemini' 
  },
  
  // New Prompts for AI Safety Workflow
  {
    id: 6,
    title: 'Information Gathering Prompt',
    description: 'Finds high-quality sources on a given topic.',
    content: 'Find 3 high-quality sources (articles, papers, blogs) on the topic: "{{query}}".\nFor each, include:\n- Source title and link\n- One-paragraph description of its core argument',
    tags: ['research', 'synthesis'],
    likes: 0,
    comments: 0,
    model: 'GPT-4',
  },
  {
    id: 7,
    title: 'Key Point Extractor',
    description: 'Extracts the most important takeaways from sources.',
    content: 'Given the following sources and summaries, extract the 3 most important takeaways from each one. Format output as:\n- Source Title\n  - Insight 1\n  - Insight 2\n  - Insight 3\n\n{{sources}}',
    tags: ['research', 'synthesis', 'analysis'],
    likes: 0,
    comments: 0,
    model: 'GPT-4',
  },
  {
    id: 8,
    title: 'Thematic Synthesizer',
    description: 'Compares insights and groups them by theme.',
    content: 'Compare the insights across all sources and group them by shared themes. Highlight any contradictions or disagreements. Structure response as:\n- Theme A: Explained...\n- Theme B: Explained...\n\n{{insights}}',
    tags: ['research', 'synthesis', 'analysis'],
    likes: 0,
    comments: 0,
    model: 'GPT-4',
  },
  {
    id: 9,
    title: 'High-Level Summary Prompt',
    description: 'Creates a concise executive summary from a thematic synthesis.',
    content: 'Based on the thematic synthesis, write a 5-bullet summary of the core ideas in plain English.\nEnd with a one-sentence prediction about the future of "{{query}}".\n\n{{synthesis}}',
    tags: ['research', 'synthesis', 'summary'],
    likes: 0,
    comments: 0,
    model: 'GPT-4',
  },
]; 