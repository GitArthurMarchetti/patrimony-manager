// components/GraphView.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Network, DataSet, Node, Edge } from 'vis-network/standalone';

interface GraphViewProps {
  nodesData: Node[];
  edgesData: Edge[];
  onNodeClick?: (nodeId: string | number) => void;
}

export default function GraphView({ nodesData, edgesData, onNodeClick }: GraphViewProps) {
  const networkRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);

  useEffect(() => {
    if (networkRef.current) {
      const nodes = new DataSet<Node>(nodesData);
      const edges = new DataSet<Edge>(edgesData);

      const data = { nodes, edges };
      const options = {
        nodes: {
          shape: 'dot',
          size: 28,
          font: {
            color: '#2C3E50',
            size: 15,
            face: 'Inter, sans-serif',
            align: 'center',
            multi: true,
          },
          borderWidth: 3,
          shadow: {
            enabled: true,
            color: 'rgba(0, 0, 0, 0.1)',
            size: 6,
            x: 1,
            y: 1,
          },
          color: {
            border: '#BDC3C7',
            background: '#ECF0F1',
            highlight: {
              border: '#95A5A6',
              background: '#DCE4E6',
            },
            hover: {
              border: '#95A5A6',
              background: '#DCE4E6',
            }
          },
        },
        edges: {
          width: 1.5,
          color: {
            color: '#B0B0B0',
            highlight: '#7F8C8D',
            hover: '#7F8C8D',
            inherit: false,
            opacity: 0.8,
          },
          arrows: {
            to: {
              enabled: true,
              scaleFactor: 0.4,
            },
          },
          smooth: {
            enabled: true,
            type: 'continuous',
            roundness: 0.5,
          },
        },
        physics: {
          enabled: true,
          barnesHut: {
            gravitationalConstant: -10000,
            centralGravity: 0.05,
            springLength: 200,
            springConstant: 0.04,
            damping: 0.25,
            avoidOverlap: 0.9,
          },
          minVelocity: 0.75,
          solver: 'barnesHut',
          stabilization: {
            enabled: true,
            iterations: 2000,
            updateInterval: 25,
            fit: true,
          },
        },
        interaction: {
          hover: true,
          zoomView: true,
          dragNodes: true, 
          dragView: true,
          tooltipDelay: 200,
          selectConnectedEdges: false, 
          multiselect: false,          
                  },
        layout: {
          randomSeed: 42,
        },
      };

      if (networkInstance.current) {
        networkInstance.current.destroy();
      }

      networkInstance.current = new Network(networkRef.current, data, options);

      // --- AJUSTADO: Lógica do clique para ser mais robusta ---
      networkInstance.current.on("click", (params) => {
        // Verifica se algum nó foi clicado
        if (params.nodes.length > 0) {
          const clickedNodeId = params.nodes[0];
          // Log para depuração: verifique o ID do nó clicado
          console.log("Nó clicado:", clickedNodeId);

          // Chamamos onNodeClick se ele existe e o nó clicado não é o nó central
          // A verificação 'startsWith("cat_")' é crucial para as categorias
          if (onNodeClick && typeof clickedNodeId === 'string' && clickedNodeId.startsWith('cat_')) {
            onNodeClick(clickedNodeId); // Passa o ID completo (ex: 'cat_123')
          }
        }
      });
      // --------------------------------------------------------

      networkInstance.current.on("doubleClick", () => {
        if (networkInstance.current) {
          networkInstance.current.fit({
            animation: {
              duration: 500,
              easingFunction: 'easeOutQuart'
            }
          });
        }
      });

      return () => {
        if (networkInstance.current) {
          networkInstance.current.destroy();
          networkInstance.current = null;
        }
      };
    }
  }, [nodesData, edgesData, onNodeClick]);

  return <div ref={networkRef} style={{ width: '100%', height: '100%', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', overflow: 'hidden' }} />;
}