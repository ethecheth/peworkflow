import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { NodeType } from '@prisma/client';

// Input validation schemas
interface CreateWorkflowData {
  name: string;
  projectCode?: string;
  nodes: Array<{
    id?: string | number;
    type: string;
    data?: any;
    positionX: number;
    positionY: number;
  }>;
  edges: Array<{
    source: number;
    target: number;
    label?: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
}

// Valid node types from the enum
const VALID_NODE_TYPES = Object.values(NodeType);

function validateWorkflowData(data: any): data is CreateWorkflowData {
  if (!data || typeof data !== 'object') return false;
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) return false;
  if (data.projectCode && typeof data.projectCode !== 'string') return false;
  if (!Array.isArray(data.nodes)) return false;
  if (!Array.isArray(data.edges)) return false;
  
  // Validate nodes
  for (const node of data.nodes) {
    if (!node.type || typeof node.type !== 'string') return false;
    if (!VALID_NODE_TYPES.includes(node.type as NodeType)) return false;
    if (typeof node.positionX !== 'number' || typeof node.positionY !== 'number') return false;
  }
  
  // Validate edges
  for (const edge of data.edges) {
    if (
      (typeof edge.source !== 'string' && typeof edge.source !== 'number') ||
      (typeof edge.target !== 'string' && typeof edge.target !== 'number')
    ) return false;
    if (edge.label && typeof edge.label !== 'string') return false;
  }
  
  return true;
}

export async function GET() {
  try {
    const workflows = await prisma.workflow.findMany({
      include: { 
        nodes: true, 
        edges: true,
        project: {
          select: {
            projectCode: true,
            projectName: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(workflows, { status: 200 });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    // Validate input data
    if (!validateWorkflowData(data)) {
      return NextResponse.json(
        { error: 'Invalid workflow data provided' },
        { status: 400 }
      );
    }
    // Check if workflow name already exists
    const existingWorkflow = await prisma.workflow.findFirst({
      where: { name: data.name.trim() }
    });
    if (existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow with this name already exists' },
        { status: 409 }
      );
    }
    // 1. Create workflow (without nodes/edges)
    const workflow = await prisma.workflow.create({
      data: {
        name: data.name.trim(),
        projectCode: data.projectCode?.trim() || null,
      },
    });
    // 2. Create nodes and map client id to db id
    const clientIdToDbId: Record<string, number> = {};
    for (const node of data.nodes || []) {
      const created = await prisma.node.create({
        data: {
          workflowId: workflow.id,
          type: node.type as NodeType,
          data: node.data || {},
          positionX: node.positionX,
          positionY: node.positionY,
        },
      });
      clientIdToDbId[node.id?.toString() || ''] = created.id;
    }
    // 3. Create edges using mapped db ids
    for (const edge of data.edges || []) {
      const dbSource = clientIdToDbId[edge.source?.toString()];
      const dbTarget = clientIdToDbId[edge.target?.toString()];
      if (dbSource && dbTarget) {
        await prisma.edge.create({
          data: {
            workflowId: workflow.id,
            source: dbSource,
            target: dbTarget,
            label: edge.label || null,
            sourceHandle: edge.sourceHandle || null,
            targetHandle: edge.targetHandle || null,
          },
        });
      }
    }
    // 4. Return workflow with nodes and edges
    const fullWorkflow = await prisma.workflow.findUnique({
      where: { id: workflow.id },
      include: { nodes: true, edges: true, project: { select: { projectCode: true, projectName: true } } },
    });
    return NextResponse.json(fullWorkflow, { status: 201 });
  } catch (error) {
    console.error('Error creating workflow:', error);
    // Handle Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Workflow with this name already exists' },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    );
  }
}
