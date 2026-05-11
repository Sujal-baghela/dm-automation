"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PLATFORMS = [
  { id: "instagram", name: "Instagram", emoji: "📸" },
  { id: "linkedin", name: "LinkedIn", emoji: "💼" },
  { id: "youtube", name: "YouTube", emoji: "🎥" },
  { id: "gmb", name: "Google Business", emoji: "📍" },
];

export default function ComposePage() {
  const router = useRouter();

  const [caption, setCaption] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const togglePlatform = (platformId: string) => {
    setPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((p) => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (postNow: boolean) => {
    setError(null);
    setIsSubmitting(true);

    try {
      if (!caption.trim()) {
        setError("Caption is required");
        return;
      }

      if (platforms.length === 0) {
        setError("Select at least one platform");
        return;
      }

      let mediaUrl = "";

      if (mediaFile) {
        const formData = new FormData();
        formData.append("file", mediaFile);

        const uploadRes = await fetch("/api/media/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const data = await uploadRes.json();
          throw new Error(data.error ?? "Media upload failed");
        }

        const uploadData: { url?: string } = await uploadRes.json();
        mediaUrl = uploadData.url ?? "";
      }

      const postRes = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          platforms,
          scheduledAt: postNow ? null : scheduledAt || null,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
        }),
      });

      if (!postRes.ok) {
        const data = await postRes.json();
        throw new Error(data.error ?? "Failed to create post");
      }

      router.push("/dashboard/calendar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="topbar">
        <div>
          <div className="page-title">Compose</div>
          <div className="page-sub">Create and schedule posts across platforms</div>
        </div>
      </div>

      <div className="content">
        <div className="two-col">
          {/* LEFT COLUMN */}
          <div>
            {/* Media Upload */}
            <label
              htmlFor="media-input"
              style={{
                display: "block",
                border: "2px dashed var(--border-gray)",
                borderRadius: "var(--r-card)",
                padding: "40px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all .15s",
                marginBottom: "20px",
                background: "var(--white)",
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (!file) return;
                setMediaFile(file);
                const reader = new FileReader();
                reader.onload = (event) => {
                  setMediaPreview(event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }}
            >
              {mediaPreview ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px" }}
                />
              ) : (
                <>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>📸</div>
                  <div style={{ fontWeight: 600, marginBottom: "4px", fontSize: "14px" }}>
                    Upload image or video
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--silver-blue)" }}>
                    Click or drag and drop
                  </div>
                </>
              )}
              <input
                id="media-input"
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaSelect}
                style={{ display: "none" }}
              />
            </label>

            {/* Caption */}
            <div style={{ marginBottom: "20px" }}>
              <label className="form-label">Caption</label>
              <textarea
                className="textarea"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write your caption here..."
                maxLength={2200}
              />
              <div className="char-count">{caption.length} / 2200</div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="form-label">Platforms</label>
              <div className="platform-pills">
                {PLATFORMS.map((platform) => (
                  <button
                    key={platform.id}
                    type="button"
                    className={`plat-pill ${platforms.includes(platform.id) ? "selected" : ""}`}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    <span style={{ marginRight: "4px" }}>{platform.emoji}</span>
                    {platform.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div>
            <div className="card" style={{ padding: "22px" }}>
              <div className="card-title" style={{ marginBottom: "16px" }}>
                Schedule
              </div>

              {error && (
                <div
                  style={{
                    background: "var(--danger-subtle)",
                    border: "1px solid var(--danger-border)",
                    borderRadius: "var(--r-sm)",
                    padding: "11px 14px",
                    fontSize: "13px",
                    color: "var(--danger)",
                    marginBottom: "16px",
                  }}
                >
                  {error}
                </div>
              )}

              <label className="form-label">Schedule for</label>
              <input
                type="datetime-local"
                className="form-input"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="btn btn-gray"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  Post now
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}