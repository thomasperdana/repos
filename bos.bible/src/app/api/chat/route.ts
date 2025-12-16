import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages, files } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // Prepare context from uploaded files
    let fileContext = '';
    if (files && files.length > 0) {
      fileContext = '\n\nContext from uploaded files:\n';
      files.forEach((file: { name: string; type: string; content: string }, index: number) => {
        fileContext += `\n--- File ${index + 1}: ${file.name} ---\n${file.content}\n`;
      });
    }

    // Combine user message with file context
    const lastMessage = messages[messages.length - 1];
    const enhancedMessage = {
      ...lastMessage,
      content: lastMessage.content + fileContext,
    };

    const enhancedMessages = [...messages.slice(0, -1), enhancedMessage];

    // This is where you'd integrate with your AI provider
    // For example with OpenAI:
    /*
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: enhancedMessages,
    });

    return NextResponse.json({
      role: 'assistant',
      content: completion.choices[0].message.content,
    });
    */

    // For now, we'll use the enhancedMessages variable in the future AI integration
    console.log('Enhanced messages for AI:', enhancedMessages);
    // For now, returning a mock response
    const response = {
      role: 'assistant',
      content: `I've received your message and can see you have ${files?.length || 0} file(s) uploaded. This is a mock response - you'll need to integrate with an actual AI provider like OpenAI, Anthropic, or others.`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}