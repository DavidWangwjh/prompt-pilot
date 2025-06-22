# PromptPilot - Intelligent Task Execution MCP

PromptPilot is an advanced Model Context Protocol (MCP) tool that intelligently analyzes user tasks, breaks them down into components, and retrieves suitable prompts from your personal vault for execution in Cursor or Claude Desktop.

## 🚀 Key Features

### **Intelligent Task Analysis**
- **Automatic Task Classification**: Identifies task types (research, writing, coding, planning, etc.)
- **Complexity Assessment**: Determines task complexity (low, medium, high)
- **Keyword Extraction**: Extracts relevant keywords for better prompt matching
- **Step Estimation**: Predicts required steps based on task complexity

### **Dynamic Prompt Retrieval**
- **Smart Matching**: Finds the most relevant prompts from your vault
- **Step-based Search**: Looks for prompts matching workflow steps
- **Keyword Matching**: Searches by extracted keywords
- **Relevance Scoring**: Ranks prompts by relevance to the task

### **Execution Planning**
- **Step-by-step Instructions**: Clear guidance for executing prompt chains
- **Time Estimates**: Predicts execution time
- **Context Building**: Each prompt builds on previous outputs
- **Cursor/Claude Ready**: Optimized for MCP clients

## 🛠️ How It Works

### 1. **Task Analysis**
When you provide a task like "research AI safety and create a summary":

1. **Pattern Recognition**: Identifies task type using regex patterns
2. **Complexity Assessment**: Analyzes task length and keyword count
3. **Step Estimation**: Determines optimal number of steps
4. **Breakdown Planning**: Maps task to workflow steps

### 2. **Prompt Retrieval**
The system searches your vault using:

- **Step Matching**: Looks for prompts matching workflow steps (background_research, deep_analysis, etc.)
- **Keyword Matching**: Finds prompts containing task keywords
- **Relevance Scoring**: Ranks prompts by match quality
- **Deduplication**: Avoids duplicate prompts

### 3. **Execution Plan Creation**
Generates a comprehensive plan with:

- **Task Analysis**: Shows detected type, complexity, keywords
- **Prompt Chain**: Ordered list of prompts to execute
- **Instructions**: Step-by-step execution guidance
- **Time Estimates**: Expected completion time

## 📋 Supported Task Types

| Task Type | Keywords | Example Tasks |
|-----------|----------|---------------|
| **Research** | research, analyze, investigate, study, explore | "research AI safety", "analyze market trends" |
| **Writing** | write, compose, create, draft, generate content | "write a blog post", "compose an email" |
| **Summary** | summarize, condense, brief, overview, recap | "summarize this document", "create a brief" |
| **Coding** | code, program, develop, debug, review code | "review this code", "implement a feature" |
| **Planning** | plan, strategy, roadmap, outline, design | "plan a project", "create a roadmap" |
| **Review** | review, evaluate, assess, critique, analyze | "review this proposal", "evaluate options" |
| **Brainstorming** | brainstorm, ideate, generate, suggest | "brainstorm solutions", "generate ideas" |
| **Problem Solving** | solve, fix, resolve, troubleshoot, debug | "solve this bug", "fix the problem" |
| **Learning** | learn, understand, explain, educate | "explain this concept", "teach me about" |
| **Creative** | creative, artistic, design, imagine | "design a logo", "create artwork" |

## 🔧 MCP Tool Specification

### Tool: `execute_task_workflow`

**Description**: Intelligently analyzes a user's task, breaks it down into components, retrieves suitable prompts from their vault, and returns an executable workflow for Cursor or Claude Desktop.

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "task": {
      "type": "string",
      "description": "The task you want to accomplish. For example: 'research AI safety and create a summary' or 'write a blog post about machine learning trends'."
    }
  },
  "required": ["task"]
}
```

**Response Format**:
```json
{
  "task": "research AI safety and create a summary",
  "analysis": {
    "primaryType": "research",
    "secondaryTypes": ["summary"],
    "complexity": "medium",
    "estimatedSteps": 3,
    "keywords": ["research", "safety", "summary"],
    "breakdown": ["background_research", "deep_analysis", "synthesis", "summary"]
  },
  "prompts": [
    {
      "id": 1,
      "title": "Background Research Prompt",
      "content": "Conduct initial research on...",
      "order": 1,
      "step": "background_research",
      "instructions": "Execute this prompt and use its output as input for the next step."
    }
  ],
  "totalSteps": 3,
  "estimatedTime": "6-9 minutes",
  "executionInstructions": "1. Execute each prompt in order... 2. Use output as context..."
}
```

## 🎯 Usage Examples

### Example 1: Research Task
**Input**: "research AI safety and create a comprehensive summary"

**Analysis**:
- Primary Type: research
- Secondary Type: summary
- Complexity: medium
- Estimated Steps: 3

**Result**: 3-step prompt chain:
1. Background Research Prompt
2. Deep Analysis Prompt
3. Summary Creation Prompt

### Example 2: Writing Task
**Input**: "write a blog post about machine learning trends in 2024"

**Analysis**:
- Primary Type: writing
- Complexity: medium
- Estimated Steps: 3

**Result**: 3-step prompt chain:
1. Outline Creation Prompt
2. Content Drafting Prompt
3. Review and Polish Prompt

### Example 3: Coding Task
**Input**: "review and optimize this Python code for performance"

**Analysis**:
- Primary Type: coding
- Secondary Type: review
- Complexity: medium
- Estimated Steps: 3

**Result**: 3-step prompt chain:
1. Code Analysis Prompt
2. Performance Review Prompt
3. Optimization Suggestions Prompt

## 🏗️ Architecture

```
User Task → MCP API → Task Analysis → Prompt Retrieval → Execution Plan
     ↓
Task Analysis Engine
├── Pattern matching for task types
├── Complexity assessment
├── Keyword extraction
└── Step estimation

Prompt Retrieval Engine
├── Step-based matching
├── Keyword-based matching
├── Relevance scoring
└── Deduplication

Execution Plan Generator
├── Prompt ordering
├── Instruction generation
├── Time estimation
└── Context building
```

## 🚀 Getting Started

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Set up Supabase**
- Configure your Supabase credentials in environment variables
- Ensure the prompts table exists with the required schema

### 3. **Add Prompts to Vault**
- Use the Vault interface to add diverse prompts
- Tag prompts appropriately for better matching
- Include prompts for different task types

### 4. **Test the MCP**
- Visit `/test-mcp` to test the workflow engine
- Try different task types to see dynamic execution plans
- Check the execution instructions and prompt chains

### 5. **Use with Cursor/Claude Desktop**
- Configure the MCP server URL in your MCP client
- Use the `execute_task_workflow` tool with your tasks
- Follow the execution plan to accomplish your goals

## 🎨 Test Interface

The test page at `/test-mcp` provides:

- **Quick Test Examples**: Pre-defined tasks to try
- **Task Input**: Text area for custom tasks
- **Task Analysis Display**: Shows detected type, complexity, keywords
- **Execution Plan**: Step-by-step instructions and time estimates
- **Prompt Chain**: Ordered list of prompts with content and instructions
- **Raw JSON**: Toggle to see the complete MCP response

## 🔮 Future Enhancements

- **AI-powered Analysis**: Use LLM for more accurate task classification
- **Learning System**: Improve matching based on successful executions
- **Custom Workflows**: Allow users to create and save custom workflows
- **Advanced Chaining**: Support conditional logic and branching
- **Integration APIs**: Connect with external tools and services
- **Collaborative Features**: Share workflows and prompts between users

## 📝 License

MIT License - see LICENSE file for details.
