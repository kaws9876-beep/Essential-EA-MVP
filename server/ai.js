const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function classifyTask(taskDescription) {
  if (!taskDescription || taskDescription.trim().length === 0) {
    throw new Error('Task description cannot be empty');
  }

  const prompt = `You are a task classification AI for real estate brokers and executives.
Your job is to classify tasks as either "Crystal Ball" (only the broker/executive can do this) or "Bouncy Ball" (can be delegated to an EA or team member).

CONTEXT:
- Crystal Ball tasks: Decisions about offers, negotiations, client relationships, legal/compliance, team management, strategic decisions
- Bouncy Ball tasks: Admin, scheduling, data entry, social media, routine communication, follow-ups, coordination

EXAMPLES:
- "Review counter offer from seller" → Crystal Ball (broker's judgment needed)
- "Schedule team standup" → Bouncy Ball (EA can do this)
- "Review legal documents for closing" → Crystal Ball (compliance, broker's responsibility)
- "Send thank you note to client" → Bouncy Ball (EA can draft, broker approves)
- "Prepare presentation for investor meeting" → Crystal Ball (strategic, broker must do)
- "Update contact database with new leads" → Bouncy Ball (admin task)

Task to classify: "${taskDescription}"

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "classification": "crystal" or "bouncy",
  "emoji": "🔮" or "🎾",
  "urgency": "urgent", "today", "defer", or "ea_owned",
  "reason": "Brief explanation why (1-2 sentences)",
  "recommendedAction": "What to do with this task (1 sentence)",
  "confidence": 0.95
}`;

  try {
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('🤖 Calling OpenAI API...');
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a task classification AI. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    console.log('✓ OpenAI response received');
    const content = response.choices[0].message.content.trim();
    console.log('📄 Response content:', content.substring(0, 100) + '...');
    
    // Remove markdown code blocks if present
    let jsonStr = content;
    if (content.includes('```json')) {
      jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (content.includes('```')) {
      jsonStr = content.replace(/```\n?/g, '').trim();
    }

    console.log('✓ JSON parsed successfully');
    const result = JSON.parse(jsonStr);

    // Validate result structure
    if (!result.classification || !result.emoji || !result.urgency || !result.reason || !result.recommendedAction) {
      throw new Error('Invalid response structure from AI');
    }

    // Ensure confidence is between 0 and 1
    if (typeof result.confidence !== 'number') {
      result.confidence = 0.8;
    } else {
      result.confidence = Math.max(0, Math.min(1, result.confidence));
    }

    return result;
  } catch (error) {
    console.error('AI Classification Error:', error);
    throw new Error(`Failed to classify task: ${error.message}`);
  }
}

module.exports = {
  classifyTask
};
