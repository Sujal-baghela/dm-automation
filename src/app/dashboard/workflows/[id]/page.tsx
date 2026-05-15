"use client"

import React, { useEffect, useState, use } from "react"
import { ReactFlowProvider } from "@xyflow/react"
import WorkflowBuilder from "../components/WorkflowBuilder"
import { useRouter } from "next/navigation"

export default function EditWorkflowPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [initialData, setInitialData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/workflows")
      .then((res) => res.json())
      .then((data) => {
        const wf = data.find((w: any) => w.id === resolvedParams.id)
        if (wf) {
          setInitialData(wf)
        } else {
          alert("Workflow not found")
          router.push("/dashboard/workflows")
        }
      })
      .finally(() => setLoading(false))
  }, [resolvedParams.id, router])

  const handleSave = async (data: any) => {
    const res = await fetch(`/api/workflows/${resolvedParams.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (res.ok) {
      router.push("/dashboard/workflows")
    } else {
      const error = await res.json()
      alert("Error saving workflow: " + error.error)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workflow?")) return

    const res = await fetch(`/api/workflows/${resolvedParams.id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      router.push("/dashboard/workflows")
    } else {
      const error = await res.json()
      alert("Error deleting workflow: " + error.error)
    }
  }

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>
  if (!initialData) return null

  return (
    <ReactFlowProvider>
      <WorkflowBuilder initialData={initialData} onSave={handleSave} onDelete={handleDelete} />
    </ReactFlowProvider>
  )
}
