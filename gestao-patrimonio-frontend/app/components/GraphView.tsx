'use client'; // Se estiver usando App Router do Next.js

import React, { useRef, useEffect } from 'react';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';

interface GraphViewProps {
  nodesData: Node[];
  edgesData: Edge[];
}

export default function GraphView({ nodesData, edgesData }: GraphViewProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    if (networkRef.current) {
      const nodes = new DataSet<Node>(nodesData);
      const edges = new DataSet<Edge>(edgesData);

      const data = { nodes, edges };
      const options = {
        // Opções para personalizar o grafo
        nodes: {
          shape: 'dot',
          size: 20,
          font: {
            color: '#333',
            size: 14,
            face: 'sans-serif',
          },
          borderWidth: 2,
          color: {
            border: '#888',
            background: '#eee',
            highlight: {
              border: '#333',
              background: '#ddd',
            },
          },
        },
        edges: {
          width: 1,
          color: {
            color: '#ccc',
            highlight: '#999',
            inherit: false,
          },
          smooth: {
            enabled: true,
            type: 'dynamic', // Ajusta a curva das linhas dinamicamente
            roundness: 0.5, // <<< ADICIONADO AQUI: A propriedade 'roundness'
          },
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.5,
          },
          solver: 'barnesHut',
        },
        interaction: {
          hover: true,
          zoomView: true,
          dragNodes: true,
          dragView: true,
        },
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      networkInstance.current = new Network(networkRef.current, data, options);

      return () => {
        if (networkInstance.current) {
          networkInstance.current.destroy();
          networkInstance.current = null;
        }
      };
    }
  }, [nodesData, edgesData]);

  return <div ref={networkRef} style={{ width: '100%', height: '500px', border: '1px solid #ccc', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }} />;
}