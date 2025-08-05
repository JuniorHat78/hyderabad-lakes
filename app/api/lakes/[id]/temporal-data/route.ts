import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: lakeId } = await params;
  
  // In the split architecture, this should be handled by the API server
  // For now, return a placeholder response
  return NextResponse.json({ 
    error: 'Temporal data API not available in client. Please ensure the API server is running.',
    lakeId,
    note: 'This endpoint should be accessed through the API server on port 3001'
  }, { status: 503 });
}