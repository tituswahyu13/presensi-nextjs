"use client";

import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { updateBagianParent } from '@/app/actions/bagian';
import { Crown, Users } from 'lucide-react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 260;
const nodeHeight = 120; // estimate

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, nodesep: 50, ranksep: 100 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode as any;
  });

  return { nodes: newNodes, edges };
};

// Custom Node component
const CustomNode = ({ data }: { data: any }) => {
  const { bagian, jabatanList } = data;
  
  return (
    <div className="bg-white rounded-xl shadow-md border-t-4 border-cyan-500 w-[260px] relative transition-transform hover:-translate-y-1 hover:shadow-lg p-4">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-cyan-500" />
      
      <h3 className="font-bold text-gray-800 text-lg mb-2 pb-2 border-b border-gray-100">{bagian}</h3>
      {jabatanList.length === 0 ? (
        <p className="text-xs text-gray-400 italic">Belum ada jabatan</p>
      ) : (
        <div className="space-y-2 text-sm text-left max-h-[150px] overflow-y-auto no-scrollbar">
          {jabatanList.map((jab: any) => (
            <div key={jab.id} className={`p-2 rounded flex items-start gap-2 ${jab.is_kepala ? 'bg-cyan-50 border border-cyan-100' : 'bg-gray-50'}`}>
              {jab.is_kepala ? <Crown className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" /> : <Users className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />}
              <div>
                <div className={`font-medium ${jab.is_kepala ? 'text-cyan-800' : 'text-gray-700'}`}>
                  {jab.jabatan}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">{jab._count?.pegawai || 0} Pegawai</div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-slate-400" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

type InteractiveOrgChartProps = {
  allBagian: any[];
};

export default function InteractiveOrgChart({ allBagian }: InteractiveOrgChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Generate nodes and edges from database records
    const initialNodes: Node[] = allBagian.map((b) => {
      const sortedJabatan = [...b.jabatan].sort((a, b) => {
        if (a.is_kepala && !b.is_kepala) return -1;
        if (!a.is_kepala && b.is_kepala) return 1;
        return 0;
      });

      return {
        id: b.id.toString(),
        type: 'custom',
        data: { label: b.bagian, bagian: b.bagian, jabatanList: sortedJabatan },
        position: { x: 0, y: 0 },
      };
    });

    const initialEdges: Edge[] = [];
    allBagian.forEach((b) => {
      if (b.parent_id) {
        initialEdges.push({
          id: `e-${b.parent_id}-${b.id}`,
          source: b.parent_id.toString(),
          target: b.id.toString(),
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      }
    });

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      initialNodes,
      initialEdges
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [allBagian, setNodes, setEdges]);

  const onConnect = useCallback(
    async (params: Connection) => {
      setLoading(true);
      
      const childId = parseInt(params.target);
      const parentId = parseInt(params.source);
      
      // Update DB
      const res = await updateBagianParent(childId, parentId);
      
      if (res.success) {
        // Optimistically update the UI
        setEdges((eds) => {
          // Remove old edge pointing to this child
          const filteredEds = eds.filter(e => e.target !== params.target);
          
          const newEds = addEdge({
            ...params,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed }
          }, filteredEds);
          
          // Re-layout
          const { nodes: newNodes, edges: layoutedEdges } = getLayoutedElements(nodes, newEds);
          setNodes(newNodes);
          return layoutedEdges;
        });
      } else {
        alert(res.message);
      }
      setLoading(false);
    },
    [nodes, setEdges, setNodes]
  );

  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div style={{ width: '100%', height: '700px' }} className="relative border border-gray-200 rounded-xl overflow-hidden bg-slate-50">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white px-4 py-2 rounded-lg shadow font-medium text-cyan-700">
            Menyimpan perubahan...
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 z-10 bg-white/90 p-3 rounded-lg shadow-sm border border-gray-200 text-sm pointer-events-none">
        <p className="font-bold text-gray-800 mb-1">Panduan Interaktif:</p>
        <ul className="list-disc pl-4 text-gray-600 space-y-1">
          <li><strong>Pindah Posisi (Pan):</strong> Klik & geser latar belakang.</li>
          <li><strong>Zoom In/Out:</strong> Gunakan scroll mouse.</li>
          <li><strong>Ubah Struktur (Drag & Drop):</strong> 
            <br />1. Klik dan tahan titik abu-abu di bagian bawah kotak Induk.
            <br />2. Tarik garis ke titik biru di bagian atas kotak Anak.
            <br />3. Lepaskan untuk menyimpan struktur baru.
          </li>
        </ul>
      </div>

      <button 
        onClick={onLayout}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-cyan-600 text-white rounded-lg shadow hover:bg-cyan-700 transition-colors font-medium text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
        Rapihkan Bagan
      </button>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        snapToGrid={true}
        snapGrid={[16, 16]}
        attributionPosition="bottom-right"
      >
        <Background gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
