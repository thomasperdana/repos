import { NextRequest, NextResponse } from 'next/server';
// @ts-expect-error - No types available for pdf-parse-fixed
import pdf from 'pdf-parse-fixed';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let content = '';
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      const pdfData = await pdf(buffer);
      content = pdfData.text;
    } else if (fileType === 'text/plain') {
      content = buffer.toString('utf-8');
    } else if (fileType === 'application/json') {
      content = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    return NextResponse.json({
      name: file.name,
      type: fileType,
      content: content.trim(),
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}