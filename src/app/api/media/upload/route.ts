import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      throw new Error("Missing Cloudinary configuration")
    }

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
    const dataUri = `data:${file.type};base64,${base64}`

    const cloudinaryForm = new FormData()
    cloudinaryForm.append("file", dataUri)
    cloudinaryForm.append("upload_preset", uploadPreset)

    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryForm,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      throw new Error(`Cloudinary upload failed: ${errorText}`)
    }

    const cloudinaryData: { secure_url?: string } = await cloudinaryResponse.json()
    const secureUrl = cloudinaryData.secure_url

    if (!secureUrl) {
      throw new Error("No secure URL in Cloudinary response")
    }

    const mediaFile = await prisma.mediaFile.create({
      data: {
        userId,
        url: secureUrl,
        type: file.type,
        filename: file.name,
        size: file.size,
      },
    })

    return NextResponse.json({
      url: secureUrl,
      mediaFileId: mediaFile.id,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload media"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
