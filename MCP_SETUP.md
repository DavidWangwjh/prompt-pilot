# MCP Setup Guide for Cursor

## Quick Fix for Loading Issues

If Cursor is stuck on "loading" when trying to connect to the PromptPilot MCP, follow these steps:

### 1. **Test the MCP First**
- Start your development server: `npm run dev`
- Visit: `http://localhost:3000/test-mcp`
- Click the "Test MCP" button to verify it's working
- If this works, the MCP is functioning correctly

### 2. **Cursor MCP Configuration**

Add this to your Cursor settings (Ctrl/Cmd + ,):

```json
{
  "mcpServers": {
    "promptpilot": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-nextjs", "http://localhost:3000/api/mcp-link"],
      "env": {}
    }
  }
}
```

### 3. **Alternative Configuration**

If the above doesn't work, try this simpler approach:

```json
{
  "mcpServers": {
    "promptpilot": {
      "command": "curl",
      "args": ["-X", "POST", "-H", "Content-Type: application/json", "-d", "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}", "http://localhost:3000/api/mcp-link"],
      "env": {}
    }
  }
}
```

### 4. **Troubleshooting Steps**

1. **Check if the server is running**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \
     http://localhost:3000/api/mcp-link
   ```

2. **Test initialization**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize"}' \
     http://localhost:3000/api/mcp-link
   ```

3. **Test tool execution**:
   ```bash
   curl -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"execute_task_workflow","arguments":{"task":"test"}}}' \
     http://localhost:3000/api/mcp-link
   ```

### 5. **Common Issues and Solutions**

**Issue**: Cursor shows "loading" indefinitely
- **Solution**: Check if the development server is running on port 3000
- **Solution**: Verify the MCP endpoint responds to basic requests

**Issue**: "Connection refused" error
- **Solution**: Make sure `npm run dev` is running
- **Solution**: Check if port 3000 is available

**Issue**: "Method not found" error
- **Solution**: The MCP is working but the method name is incorrect
- **Solution**: Use `execute_task_workflow` as the method name

### 6. **Using the MCP in Cursor**

Once configured, you can use the MCP in Cursor:

1. **Open a chat in Cursor**
2. **Type a task**: "research AI safety and create a summary"
3. **The MCP will**: Analyze the task, find relevant prompts from your vault, and return an execution plan
4. **Follow the plan**: Execute the prompts in order as specified

### 7. **Example Usage**

```
User: research AI safety and create a summary

MCP Response:
- Task Analysis: Research task, medium complexity, 3 steps
- Prompt Chain: 
  1. Background Research Prompt
  2. Deep Analysis Prompt  
  3. Summary Creation Prompt
- Execution Instructions: Step-by-step guidance
- Time Estimate: 6-9 minutes
```

### 8. **Reset MCP Connection**

If you're still having issues:

1. **Restart Cursor** completely
2. **Clear MCP cache** (if available in settings)
3. **Verify server is running**: `npm run dev`
4. **Test endpoint**: Use the curl commands above
5. **Re-add MCP configuration** in Cursor settings

### 9. **Development Mode**

For development and testing:

1. **Use the test page**: `http://localhost:3000/test-mcp`
2. **Try different tasks**: Use the example buttons
3. **Check console logs**: Look for any errors in the browser console
4. **Verify database connection**: Make sure Supabase is configured correctly

The MCP should now work properly with Cursor! 