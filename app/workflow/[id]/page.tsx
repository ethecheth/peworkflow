"use client";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import React from 'react';

const Workflow = dynamic(() => import('../../workflow'), { ssr: false });

export default function WorkflowEditorPage({ params }: { params: any }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { id } = React.use(params) as { id: string };
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);
  
  // Check if this is view mode (from URL parameter)
  const isViewMode = searchParams.get('mode') === 'view';

  useEffect(() => {
    if (id === 'new') {
      setLoading(false);
      setWorkflow(null);
      return;
    }
    fetch(`/api/workflows/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setWorkflow(data))
      .catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return <div className="p-8 text-center">Loading workflow...</div>;
  }

  return <Workflow initialWorkflow={workflow} isViewMode={isViewMode} />;
} 