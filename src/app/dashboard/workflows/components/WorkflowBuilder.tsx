"use client"

import React, { useState, useCallback, useRef } from "react"
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Handle,
  Position,
  useReactFlow,
  OnSelectionChangeParams,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

const nodeTypes = {
  trigger: ({ data }: any) => (
    <div style={{ border: "2px solid purple", background: "white", padding: 10, borderRadius: 5 }}>
      <div className="wf-name">✉️ When someone messages</div>
      <div className="wf-meta">{data.pattern || "Set a keyword →"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  ),
  sendText: ({ data }: any) => (
    <div style={{ border: "2px solid blue", background: "white", padding: 10, borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} />
      <div className="wf-name">💬 Reply with message</div>
      <div className="wf-meta">{data.text ? data.text.substring(0, 20) + (data.text.length > 20 ? "..." : "") : "Write your reply →"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  ),
  sendTemplate: ({ data }: any) => (
    <div style={{ border: "2px solid green", background: "white", padding: 10, borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} />
      <div className="wf-name">📋 Send template</div>
      <div className="wf-meta">{data.templateName || "Set template name →"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  ),
  delay: ({ data }: any) => (
    <div style={{ border: "2px solid gray", background: "white", padding: 10, borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} />
      <div className="wf-name">⏳ Wait</div>
      <div className="wf-meta">{data.delayMinutes ? `${data.delayMinutes} minutes` : "Set delay →"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  ),
  condition: ({ data }: any) => (
    <div style={{ border: "2px solid orange", background: "white", padding: 10, borderRadius: 5 }}>
      <Handle type="target" position={Position.Left} />
      <div className="wf-name">🔀 Split flow</div>
      <div className="wf-meta">Matches ↗  No match ↘</div>
      <Handle type="source" position={Position.Right} id="matches" style={{ top: 10 }} />
      <Handle type="source" position={Position.Right} id="nomatch" style={{ top: 30 }} />
    </div>
  ),
}

const getId = () => `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export default function WorkflowBuilder({
  initialData,
  onSave,
  onDelete,
}: {
  initialData?: any
  onSave: (data: any) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialData?.nodes?.canvasNodes || [])
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialData?.nodes?.canvasEdges || [])
  const { screenToFlowPosition } = useReactFlow()

  const [name, setName] = useState(initialData?.name || "")
  const [platforms, setPlatforms] = useState<string[]>(initialData?.platforms || [])
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const type = event.dataTransfer.getData("application/reactflow")
      if (typeof type === "undefined" || !type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      const newNode: Node = {
        id: getId(),
        type,
        position,
        data: {
          triggerType: type === "trigger" ? "keyword" : undefined,
          platform: type === "trigger" ? "instagram" : undefined,
          pattern: type === "trigger" ? "" : undefined,
          text: type === "sendText" ? "" : undefined,
          templateName: type === "sendTemplate" ? "" : undefined,
          delayMinutes: type === "delay" ? 0 : undefined,
        },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition, setNodes]
  )


  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: OnSelectionChangeParams) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0])
      } else {
        setSelectedNode(null)
      }
    },
    []
  )

  const updateNodeData = (key: string, value: any) => {
    if (!selectedNode) return
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === selectedNode.id) {
          const newNode = { ...n, data: { ...n.data, [key]: value } }
          setSelectedNode(newNode)
          return newNode
        }
        return n
      })
    )
  }

  const handleSave = async () => {
    try {
      if (!name.trim()) { alert("Please enter a workflow name first."); return; }
      if (platforms.length === 0) { alert("Please select at least one platform (Instagram or WhatsApp)."); return; }
      if (!nodes.some((n) => n.type === "trigger")) { alert("Please add a 'When someone messages...' trigger node to start your flow."); return; }
      if (!nodes.some((n) => n.type === "sendText" || n.type === "sendTemplate")) { alert("Please add a 'Reply with a message' or 'Send a template' node so the flow has an action."); return; }

      const triggerNodes = nodes.filter((n) => n.type === "trigger")
      const triggers = triggerNodes.map((n) => ({
        type: n.data.triggerType,
        pattern: n.data.pattern || null,
        platform: n.data.platform || null,
      }))

      const actionNodes = nodes.filter((n) => n.type === "sendText" || n.type === "sendTemplate")
      const actions = actionNodes.map((n) => ({
        type: n.type === "sendText" ? "text" : "template",
        text: n.type === "sendText" ? n.data.text : undefined,
        templateName: n.type === "sendTemplate" ? n.data.templateName : undefined,
      }))

      const nodesData = {
        actions,
        canvasNodes: nodes,
        canvasEdges: edges,
      }

      await onSave({
        name,
        platforms,
        isActive,
        nodes: nodesData,
        triggers,
      })
    } catch (err) { alert("Failed to save: " + String(err)) }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px" }}>
        <h1 className="page-title">{initialData ? "Edit Workflow" : "New Workflow"}</h1>
        <div className="topbar-actions">
          {onDelete && (
            <button className="btn btn-gray" onClick={onDelete}>
              Delete
            </button>
          )}
          <button className="btn btn-primary" onClick={handleSave}>
            Save Workflow
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ width: 240, padding: 20, borderRight: "1px solid #eee" }}>
          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Workflow Name</label>
            <input
              style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Welcome DM"
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="form-label">Platforms</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={platforms.includes("instagram")}
                  onChange={(e) => {
                    if (e.target.checked) setPlatforms([...platforms, "instagram"])
                    else setPlatforms(platforms.filter((p) => p !== "instagram"))
                  }}
                />{" "}
                Instagram
              </label>
            </div>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={platforms.includes("whatsapp")}
                  onChange={(e) => {
                    if (e.target.checked) setPlatforms([...platforms, "whatsapp"])
                    else setPlatforms(platforms.filter((p) => p !== "whatsapp"))
                  }}
                />{" "}
                WhatsApp
              </label>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />{" "}
              Is Active
            </label>
          </div>

          <div style={{ padding: "10px", background: "#f8f8f8", borderRadius: "6px", border: "1px solid #eee", marginBottom: "20px", fontSize: "11px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>How it works</div>
            <div>Step 1 🖱️ Drag nodes to canvas</div>
            <div>Step 2 🔗 Connect them with arrows</div>
            <div>Step 3 💾 Click Save Workflow</div>
          </div>

          <h3 className="card-title" style={{ marginTop: 20, marginBottom: 10 }}>Node Palette</h3>
          
          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "trigger")
              event.dataTransfer.effectAllowed = "move"
            }}
            draggable
            style={{ padding: 10, border: "2px solid purple", marginBottom: 10, cursor: "grab", borderRadius: 5 }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>✉️</div>
            <div style={{ fontWeight: "bold" }}>When someone messages...</div>
            <div style={{ fontSize: "11px", color: "gray" }}>Choose what keyword starts this flow</div>
          </div>

          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "sendText")
              event.dataTransfer.effectAllowed = "move"
            }}
            draggable
            style={{ padding: 10, border: "2px solid blue", marginBottom: 10, cursor: "grab", borderRadius: 5 }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>💬</div>
            <div style={{ fontWeight: "bold" }}>Reply with a message</div>
            <div style={{ fontSize: "11px", color: "gray" }}>Send an automatic text reply</div>
          </div>

          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "sendTemplate")
              event.dataTransfer.effectAllowed = "move"
            }}
            draggable
            style={{ padding: 10, border: "2px solid green", marginBottom: 10, cursor: "grab", borderRadius: 5 }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>📋</div>
            <div style={{ fontWeight: "bold" }}>Send a template</div>
            <div style={{ fontSize: "11px", color: "gray" }}>Use a pre-approved message template</div>
          </div>

          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "delay")
              event.dataTransfer.effectAllowed = "move"
            }}
            draggable
            style={{ padding: 10, border: "2px solid gray", marginBottom: 10, cursor: "grab", borderRadius: 5 }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>⏳</div>
            <div style={{ fontWeight: "bold" }}>Wait before replying</div>
            <div style={{ fontSize: "11px", color: "gray" }}>Add a pause between steps</div>
          </div>

          <div
            onDragStart={(event) => {
              event.dataTransfer.setData("application/reactflow", "condition")
              event.dataTransfer.effectAllowed = "move"
            }}
            draggable
            style={{ padding: 10, border: "2px solid orange", marginBottom: 10, cursor: "grab", borderRadius: 5 }}
          >
            <div style={{ fontSize: "20px", marginBottom: "4px" }}>🔀</div>
            <div style={{ fontWeight: "bold" }}>Split the flow</div>
            <div style={{ fontSize: "11px", color: "gray" }}>Take different paths based on a condition</div>
          </div>
        </div>

        <div style={{ flex: 1, position: "relative" }} ref={reactFlowWrapper}>
          {nodes.length === 0 && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "14px", color: "#999", pointerEvents: "none", zIndex: 10 }}>
              👈 Drag a node from the left panel to get started
            </div>
          )}
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>

        <div style={{ width: 260, padding: 20, borderLeft: "1px solid #eee" }}>
          <h3 className="card-title">Properties</h3>
          {!selectedNode && <div className="page-sub">Select a node to edit</div>}
          {selectedNode && (
            <div>

              {selectedNode.type === "trigger" && (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <label className="form-label">What should trigger this?</label>
                    <select
                      style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                      value={selectedNode.data.triggerType as string}
                      onChange={(e) => updateNodeData("triggerType", e.target.value)}
                    >
                      <option value="keyword">Keyword</option>
                      <option value="exact">Exact</option>
                      <option value="regex">Regex</option>
                    </select>
                    <div style={{ fontSize: "11px", color: "gray", marginTop: 4 }}>
                      {selectedNode.data.triggerType === "keyword" && "Triggers when the message contains your word anywhere"}
                      {selectedNode.data.triggerType === "exact" && "Triggers only when the message is exactly your word"}
                      {selectedNode.data.triggerType === "regex" && "Advanced: triggers using a regular expression pattern"}
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="form-label">Which platform?</label>
                    <select
                      style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                      value={selectedNode.data.platform as string}
                      onChange={(e) => updateNodeData("platform", e.target.value)}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label className="form-label">Keyword or phrase to watch for</label>
                    <input
                      style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                      value={selectedNode.data.pattern as string}
                      onChange={(e) => updateNodeData("pattern", e.target.value)}
                    />
                  </div>
                </>
              )}
              {selectedNode.type === "sendText" && (
                <div style={{ marginBottom: 10 }}>
                  <label className="form-label">What should the reply say?</label>
                  <textarea
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4, minHeight: 100 }}
                    value={selectedNode.data.text as string}
                    onChange={(e) => updateNodeData("text", e.target.value)}
                  />
                </div>
              )}
              {selectedNode.type === "sendTemplate" && (
                <div style={{ marginBottom: 10 }}>
                  <label className="form-label">Template name (from Meta dashboard)</label>
                  <input
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    value={selectedNode.data.templateName as string}
                    onChange={(e) => updateNodeData("templateName", e.target.value)}
                  />
                </div>
              )}
              {selectedNode.type === "delay" && (
                <div style={{ marginBottom: 10 }}>
                  <label className="form-label">How many minutes to wait?</label>
                  <input
                    type="number"
                    style={{ width: "100%", padding: 8, border: "1px solid #ccc", borderRadius: 4 }}
                    value={selectedNode.data.delayMinutes as number}
                    onChange={(e) => updateNodeData("delayMinutes", parseInt(e.target.value))}
                  />
                </div>
              )}
              {selectedNode.type === "condition" && (
                <div style={{ marginBottom: 10 }}>
                  <div className="page-sub">Condition node splits flow based on matching attributes.</div>
                </div>
              )}
              <div style={{ marginTop: 20 }}>
                <button
                  className="btn btn-gray btn-sm"
                  onClick={() => {
                    setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id))
                    setSelectedNode(null)
                  }}
                >
                  Delete Node
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
