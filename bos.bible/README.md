# AI File Assistant

A Vercel-deployed Next.js application that allows users to upload PDF, JSON, and TXT files and interact with AI about their content.

## Features

- **File Upload**: Drag & drop support for PDF, JSON, and TXT files
- **AI Chat**: Interact with AI using uploaded files as context
- **File Management**: View, remove individual files, or clear all
- **Responsive Design**: Works on desktop and mobile devices
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern, clean UI

## Supported File Types

- **PDF**: Extract text content from PDF documents
- **JSON**: Parse and use structured data
- **TXT**: Plain text files

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## AI Integration

The app includes a mock AI integration in `/src/app/api/chat/route.ts`. To connect with a real AI provider, uncomment and configure the OpenAI example:

```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: enhancedMessages,
});
```

### Environment Variables

Create a `.env.local` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

The app is optimized for Vercel's serverless platform.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts    # File processing endpoint
│   │   └── chat/route.ts      # AI chat endpoint
│   └── page.tsx               # Main page component
├── components/
│   ├── FileUpload.tsx         # File upload component
│   └── ChatInterface.tsx      # Chat interface component
└── ...
```

## Technologies Used

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **AI SDK**: AI integration
- **pdf-parse-fixed**: PDF text extraction
- **Lucide React**: Icons

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details