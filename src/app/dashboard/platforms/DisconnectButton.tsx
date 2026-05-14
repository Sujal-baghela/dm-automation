"use client"

import { useRouter } from "next/navigation"

export function DisconnectButton({ connectionId }: { connectionId: string }) {
  const router = useRouter()

  async function handleDisconnect() {
    if (!window.confirm("Disconnect this account? Workflows using it will stop.")) return

    await fetch(`/api/accounts?id=${connectionId}`, { method: "DELETE" })
    router.refresh()
  }

  return (
    <button
      type="button"
      className="btn btn-danger btn-sm"
      onClick={handleDisconnect}
    >
      Disconnect
    </button>
  )
}