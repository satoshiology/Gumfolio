import OpenMolt, { ToolDefinition } from 'openmolt';
import { ServerActionRegistry } from './ServerActionRegistry';

export function createServerAgent(accessToken: string, integrations: Record<string, boolean>) {
  const om = new OpenMolt({
    llmProviders: {
      google: { apiKey: process.env.GEMINI_API_KEY! },
    },
  });

  const tools: ToolDefinition[] = Array.from(ServerActionRegistry.entries())
    .filter(([id]) => integrations[id] !== false) // Only include if not explicitly disabled
    .map(([id, action]) => ({
      name: id,
      description: action.description,
      parameters: action.parameters,
      execute: async (args: any) => await action.execute(accessToken, ...Object.values(args)),
    }));

  const agent = om.createAgent({
    name: 'GumroadAgent',
    model: 'google:gemini-2.0-flash',
    instructions: `You are the Gumfolio AI Strategist. You have full administrative access to the user's Gumroad account via your tools.
    WHEN THE USER ASKS YOU TO PERFORM ACTIONS LIKE REFUNDING, ENABLING, DISABLING, ROTATING, OR INCREMENTING LICENSE USAGE, YOU MUST USE THE PROVIDED TOOLS. DO NOT ASK THE USER TO LOG IN MANUALLY.
    You are an autonomous agent capable of executing business actions on behalf of the user.`,
    tools: tools,
  });

  return agent;
}
