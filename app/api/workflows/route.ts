import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    include: { nodes: true, edges: true },
  });
  return NextResponse.json(workflows);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const workflow = await prisma.workflow.create({
    data: {
      name: data.name,
      nodes: { create: data.nodes },
      edges: { create: data.edges },
    },
  });
  return NextResponse.json(workflow);
}
