"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  FolderIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  Squares2X2Icon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export default function WorkflowListPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    fetchWorkflows();
    fetchProjects();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data);
    } catch (error) {
      console.error('Error fetching workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const handleDelete = async (workflowId: number, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete workflow "${workflowName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the deleted workflow from the list
        setWorkflows(workflows.filter(wf => wf.id !== workflowId));
        alert('Workflow deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error deleting workflow: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  // Filter workflows based on selected project
  const filteredWorkflows = selectedProject === 'all' 
    ? workflows 
    : workflows.filter(wf => wf.project?.projectCode === selectedProject);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {showSidebar && (
            <div className="flex items-center gap-2">
              <FolderIcon className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-800">Projects</h2>
            </div>
          )}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
            title={showSidebar ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {showSidebar ? (
              <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto">
          {/* All Projects Option */}
          <button
            onClick={() => setSelectedProject('all')}
            className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
              selectedProject === 'all' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            {showSidebar ? (
              <div className="flex items-center gap-3">
                <Squares2X2Icon className="w-5 h-5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium">All Projects</div>
                  <div className="text-xs text-gray-500">{workflows.length} workflows</div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Squares2X2Icon className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xs">All</div>
              </div>
            )}
          </button>

          {/* Individual Projects */}
          {projects.map((project) => {
            const projectWorkflows = workflows.filter(wf => wf.project?.projectCode === project.projectCode);
            return (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project.projectCode)}
                className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedProject === project.projectCode ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
                }`}
              >
                {showSidebar ? (
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="w-5 h-5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium">{project.projectCode}</div>
                      <div className="text-xs text-gray-500">{project.projectName}</div>
                      <div className="text-xs text-gray-400">{projectWorkflows.length} workflows</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <DocumentTextIcon className="w-5 h-5 mx-auto mb-1" />
                    <div className="text-xs">{project.projectCode}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto py-10 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Workflow List</h1>
              {selectedProject !== 'all' && (
                <p className="text-gray-600 mt-1">
                  Filtered by: {projects.find(p => p.projectCode === selectedProject)?.projectName}
                </p>
              )}
            </div>
            <Link href="/workflow/new">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                + New Workflow
              </button>
            </Link>
          </div>

          {loading ? (
            <div>Loading...</div>
          ) : filteredWorkflows.length === 0 ? (
            <div className="text-gray-500">
              {selectedProject === 'all' ? 'No workflows found.' : 'No workflows found for this project.'}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredWorkflows.map((wf) => (
                <div key={wf.id} className="border rounded p-4 flex justify-between items-center hover:bg-gray-50 transition-colors bg-white">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">{wf.name}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(wf.createdAt).toLocaleString()}
                      {wf.project && (
                        <span className="ml-4 text-blue-600">
                          Project: {wf.project.projectCode} - {wf.project.projectName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/workflow/${wf.id}?mode=view`}>
                      <button className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs">
                        View
                      </button>
                    </Link>
                    <Link href={`/workflow/${wf.id}`}>
                      <button className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                        Edit
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(wf.id, wf.name)}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
