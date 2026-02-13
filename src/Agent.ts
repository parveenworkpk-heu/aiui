import { OPENROUTER_MODEL, getOpenRouterApiKey } from '@/config/openrouter';

const MODEL = OPENROUTER_MODEL;

interface ReasoningMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  reasoning_details?: any;
}

export interface AgentResponse {
  plan?: any;
  code?: string;
  explanation?: string;
  reasoning?: any;
  error?: string;
}

export interface GenerationProgress {
  stage: 'planning' | 'generating' | 'explaining' | 'complete' | 'error';
  message: string;
  data?: any;
}

export class TrinityAgent {
  private messages: ReasoningMessage[] = [];
  private apiKey: string;

  constructor(apiKey?: string) {
    const resolved = apiKey || getOpenRouterApiKey();
    if (!resolved) {
      throw new Error('OpenRouter API key is not configured. Set VITE_OPENROUTER_API_KEY in your environment.');
    }
    this.apiKey = resolved;
  }

  private async callAPI(messages: ReasoningMessage[], reasoning: boolean = true): Promise<any> {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "PraveenAI"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        reasoning: { enabled: reasoning },
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(error.error?.message || `API Error: ${response.status}`);
    }

    return response.json();
  }

  async plan(userRequest: string): Promise<{ plan: any; reasoning: any }> {
    this.messages = [{
      role: 'system',
      content: `You are an expert UI architect. You create JSON layout plans for React components.
You can ONLY use these 8 components: Button, Input, Card, Modal, Sidebar, Navbar, Table, Chart.
Always output valid JSON that follows this structure exactly.`
    }, {
      role: 'user',
      content: `Create a detailed JSON layout plan for this UI request: "${userRequest}"

Requirements:
- Use ONLY these components: Button, Input, Card, Modal, Sidebar, Navbar, Table, Chart
- Structure: { "layout": { "type": "container", "className": "...", "children": [...] }, "components": [...] }
- Each component needs: { "type": "ComponentName", "props": { ... }, "children": [...] }
- Use Tailwind classes for styling (className prop)
- Include realistic props (labels, placeholders, data, etc.)
- For Table: include headers array and data array with sample data
- For Chart: include data array with { label, value, color? } objects
- Make it professional and complete

Respond with ONLY the JSON plan, no markdown code blocks or explanations.`
    }];

    const result = await this.callAPI(this.messages, true);
    const assistantMsg = result.choices[0].message;

    this.messages.push({
      role: 'assistant',
      content: assistantMsg.content,
      reasoning_details: assistantMsg.reasoning_details
    });

    return {
      plan: this.extractJSON(assistantMsg.content),
      reasoning: assistantMsg.reasoning_details
    };
  }

  async generateCode(jsonPlan: any): Promise<{ code: string; reasoning: any }> {
    this.messages.push({
      role: 'user',
      content: `Convert this JSON plan to a complete React + TypeScript component.

JSON Plan: ${JSON.stringify(jsonPlan, null, 2)}

Requirements:
- Create a function component called "GeneratedUI"
- Import each component used from '@/components/ui/[ComponentName]' (e.g., import { Button } from '@/components/ui/Button')
- Use TypeScript with proper types
- Use Tailwind CSS for layout (flex, grid, gap, p-4, etc.)
- Include all mock data directly in the component
- Add useState hooks for any interactive state (modal open/close, form values, etc.)
- Make it fully functional and interactive
- Export as default: export default function GeneratedUI() { ... }

Return ONLY the TypeScript code, no markdown code blocks or explanations.`
    });

    const result = await this.callAPI(this.messages, true);
    const assistantMsg = result.choices[0].message;

    this.messages.push({
      role: 'assistant',
      content: assistantMsg.content,
      reasoning_details: assistantMsg.reasoning_details
    });

    return {
      code: this.extractCode(assistantMsg.content),
      reasoning: assistantMsg.reasoning_details
    };
  }

  async explain(plan: any, _code: string): Promise<string> {
    this.messages.push({
      role: 'user',
      content: `Explain this UI in 2-3 simple sentences for a non-technical user.

The UI includes these components: ${this.getComponentList(plan)}

Requirements:
- Friendly, casual tone
- Mention what the user can do with this UI
- Keep it brief and helpful`
    });

    const result = await this.callAPI(this.messages, false);
    return result.choices[0].message.content;
  }

  async modifyCode(currentCode: string, modification: string): Promise<{ code: string; reasoning: any }> {
    this.messages = [{
      role: 'system',
      content: `You are an expert React developer. You modify existing React components based on user requests.
You can ONLY use these components: Button, Input, Card, Modal, Sidebar, Navbar, Table, Chart from '@/components/ui/'.`
    }, {
      role: 'user',
      content: `Modify this React component based on the user's request.

Current Code:
${currentCode}

User Request: "${modification}"

Requirements:
- Keep the component name as "GeneratedUI"
- Maintain existing functionality unless explicitly asked to change it
- Use the same import pattern: import { X } from '@/components/ui/X'
- Use Tailwind CSS for styling
- Return the complete modified component

Return ONLY the TypeScript code, no markdown code blocks or explanations.`
    }];

    const result = await this.callAPI(this.messages, true);
    const assistantMsg = result.choices[0].message;

    return {
      code: this.extractCode(assistantMsg.content),
      reasoning: assistantMsg.reasoning_details
    };
  }

  async *generateWithProgress(userRequest: string, onProgress: (progress: GenerationProgress) => void): AsyncGenerator<GenerationProgress> {
    try {
      // Stage 1: Planning
      onProgress({ stage: 'planning', message: '📐 Creating UI layout plan...' });
      yield { stage: 'planning', message: '📐 Creating UI layout plan...' };
      
      const { plan, reasoning: planReasoning } = await this.plan(userRequest);
      
      if (plan.error) {
        throw new Error('Failed to parse plan: ' + plan.raw);
      }
      
      onProgress({ stage: 'planning', message: '✅ Plan created', data: { plan, reasoning: planReasoning } });
      yield { stage: 'planning', message: '✅ Plan created', data: { plan, reasoning: planReasoning } };

      // Stage 2: Generating Code
      onProgress({ stage: 'generating', message: '🔧 Generating React code...' });
      yield { stage: 'generating', message: '🔧 Generating React code...' };
      
      const { code, reasoning: codeReasoning } = await this.generateCode(plan);
      
      onProgress({ stage: 'generating', message: '✅ Code generated', data: { code, reasoning: codeReasoning } });
      yield { stage: 'generating', message: '✅ Code generated', data: { code, reasoning: codeReasoning } };

      // Stage 3: Explaining
      onProgress({ stage: 'explaining', message: '💬 Creating explanation...' });
      yield { stage: 'explaining', message: '💬 Creating explanation...' };
      
      const explanation = await this.explain(plan, code);
      
      onProgress({ stage: 'complete', message: '✨ Complete!', data: { plan, code, explanation } });
      yield { stage: 'complete', message: '✨ Complete!', data: { plan, code, explanation } };

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress({ stage: 'error', message: errorMsg });
      yield { stage: 'error', message: errorMsg };
      throw error;
    }
  }

  private extractJSON(content: string): any {
    try {
      // Try to extract JSON from code blocks first
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       content.match(/```\s*([\s\S]*?)\s*```/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }

      // Try to find JSON object directly
      const objectMatch = content.match(/\{[\s\S]*\}/);
      if (objectMatch) {
        return JSON.parse(objectMatch[0]);
      }

      return JSON.parse(content);
    } catch (e) {
      console.error('JSON Parse Error:', e, 'Content:', content);
      return { error: "Failed to parse JSON", raw: content };
    }
  }

  private extractCode(content: string): string {
    // Try to extract from code blocks
    const codeMatch = content.match(/```(?:tsx?|jsx?|typescript|javascript)?\s*([\s\S]*?)\s*```/);
    if (codeMatch) {
      return codeMatch[1].trim();
    }
    
    // Return content directly if no code blocks found
    return content.trim();
  }

  private getComponentList(plan: any): string {
    const components = new Set<string>();
    
    const extract = (obj: any) => {
      if (!obj) return;
      if (obj.type && typeof obj.type === 'string') {
        components.add(obj.type);
      }
      if (obj.children && Array.isArray(obj.children)) {
        obj.children.forEach(extract);
      }
      if (obj.components && Array.isArray(obj.components)) {
        obj.components.forEach(extract);
      }
      if (obj.layout) {
        extract(obj.layout);
      }
    };
    
    extract(plan);
    return Array.from(components).join(', ') || 'various components';
  }
}

export const createAgent = (apiKey?: string) => new TrinityAgent(apiKey);
