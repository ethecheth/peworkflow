import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Input validation schemas
interface CreateProjectData {
  projectCode: string;
  projectName: string;
}

function validateProjectData(data: any): data is CreateProjectData {
  if (!data || typeof data !== 'object') return false;
  if (!data.projectCode || typeof data.projectCode !== 'string' || data.projectCode.trim().length === 0) return false;
  if (!data.projectName || typeof data.projectName !== 'string' || data.projectName.trim().length === 0) return false;
  return true;
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        workflows: {
          select: {
            id: true,
            name: true,
            createdAt: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Validate input data
    if (!validateProjectData(data)) {
      return NextResponse.json(
        { error: 'Invalid project data provided' },
        { status: 400 }
      );
    }
    
    // Check if project code already exists
    const existingProject = await prisma.project.findFirst({
      where: { projectCode: data.projectCode.trim() }
    });
    
    if (existingProject) {
      return NextResponse.json(
        { error: 'Project with this code already exists' },
        { status: 409 }
      );
    }
    
    // Create project
    const project = await prisma.project.create({
      data: {
        projectCode: data.projectCode.trim(),
        projectName: data.projectName.trim(),
      },
    });
    
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    
    // Handle Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Project with this code already exists' },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
} 