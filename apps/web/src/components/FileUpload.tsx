"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UploadedFile {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  category: string;
  createdAt: string;
  uploadedBy: { firstName: string; lastName: string };
}

interface FileUploadProps {
  projectId?: string;
  ticketId?: string;
  onUploaded?: (file: UploadedFile) => void;
  initialFiles?: UploadedFile[];
}

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/zip",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <span className="text-blue-400">IMG</span>;
  if (mimeType === "application/pdf") return <span className="text-red-400">PDF</span>;
  return <span className="text-zinc-400">DOC</span>;
}

export function FileUpload({ projectId, ticketId, onUploaded, initialFiles = [] }: FileUploadProps) {
  const { fetchWithAuth } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>(initialFiles);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(`File type not allowed: ${file.type}`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds 10 MB limit");
      return;
    }

    setError(null);
    setUploading(true);

    const form = new FormData();
    form.append("file", file);

    const params = new URLSearchParams();
    if (projectId) params.set("projectId", projectId);
    if (ticketId) params.set("ticketId", ticketId);

    try {
      const res = await fetchWithAuth(`/api/upload?${params}`, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Upload failed");
      }
      const data = (await res.json()) as { file: UploadedFile };
      setFiles((prev) => [data.file, ...prev]);
      onUploaded?.(data.file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [fetchWithAuth, projectId, ticketId, onUploaded]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (dropped[0]) void uploadFile(dropped[0]);
    },
    [uploadFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) void uploadFile(selected);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragging
            ? "border-orange-500/60 bg-orange-500/5"
            : "border-zinc-700 hover:border-zinc-600"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={ALLOWED_TYPES.join(",")}
        />
        <p className="text-sm text-zinc-400">
          {uploading ? "Uploading…" : "Drop a file here or click to browse"}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          Images, PDF, ZIP, Word — max 10 MB
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/30 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold">
                  <FileIcon mimeType={f.mimeType} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-200">{f.originalName}</p>
                  <p className="text-xs text-zinc-600">
                    {formatBytes(f.size)} · {f.uploadedBy.firstName} · {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
