"use client"

import React from "react"
import { ReactFlowProvider } from "@xyflow/react"
import WorkflowBuilder from "../components/WorkflowBuilder"
import { useRouter } from "next/navigation"

export default function NewWorkflowPage() {
  const router = useRouter()

  const handleSave = async (data: any) => {
    const res = await fetch("/api/workflows", {
      method: "POST",
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

  return (
    <ReactFlowProvider>
      <WorkflowBuilder onSave={handleSave} />
    </ReactFlowProvider>
  )
}