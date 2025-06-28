import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflow ID' },
        { status: 400 }
      );
    }
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        edges: true,
      },
    });
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(workflow, { status: 200 });
  } catch (error) {
    console.error('Error fetching workflow:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflow ID' },
        { status: 400 }
      );
    }
    const data = await request.json();
    // Check if workflow exists
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    // Delete all nodes and edges first
    await prisma.edge.deleteMany({ where: { workflowId } });
    await prisma.node.deleteMany({ where: { workflowId } });
    // 1. Create nodes and map client id to db id
    const clientIdToDbId: Record<string, number> = {};
    console.log('NODES:', data.nodes);
    for (const node of data.nodes || []) {
      const created = await prisma.node.create({
        data: {
          workflowId,
          type: node.type,
          data: node.data || {},
          positionX: node.positionX,
          positionY: node.positionY,
        },
      });
      clientIdToDbId[node.id?.toString() || ''] = created.id;
    }
    console.log('clientIdToDbId:', clientIdToDbId);
    // 2. Create edges using mapped db ids
    console.log('EDGES:', data.edges);
    console.log('edge mapping:', data.edges?.map(e => ({
      source: e.source, dbSource: clientIdToDbId[e.source?.toString()],
      target: e.target, dbTarget: clientIdToDbId[e.target?.toString()]
    })));
    for (const edge of data.edges || []) {
      const dbSource = clientIdToDbId[edge.source?.toString()];
      const dbTarget = clientIdToDbId[edge.target?.toString()];
      if (dbSource && dbTarget) {
        await prisma.edge.create({
          data: {
            workflowId,
            source: dbSource,
            target: dbTarget,
            label: edge.label || null,
            sourceHandle: edge.sourceHandle || null,
            targetHandle: edge.targetHandle || null,
          },
        });
      }
    }
    // Update workflow name if changed
    await prisma.workflow.update({
      where: { id: workflowId },
      data: { name: data.name || existingWorkflow.name },
    });
    // Return updated workflow
    const updatedWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { nodes: true, edges: true },
    });
    return NextResponse.json(updatedWorkflow, { status: 200 });
  } catch (error) {
    console.error('Error updating workflow:', error);
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: any }
) {
  try {
    const { id } = await params;
    const workflowId = parseInt(id);
    if (isNaN(workflowId)) {
      return NextResponse.json(
        { error: 'Invalid workflow ID' },
        { status: 400 }
      );
    }
    // Check if workflow exists
    const existingWorkflow = await prisma.workflow.findUnique({
      where: { id: workflowId }
    });
    if (!existingWorkflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }
    // Delete workflow (cascade will handle nodes and edges)
    await prisma.workflow.delete({
      where: { id: workflowId }
    });
    return NextResponse.json(
      { message: 'Workflow deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting workflow:', error);
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
      { status: 500 }
    );
  }
} 