import React, { useState } from "react";
import { FileCode, FileArchive, Cpu, FileCheck, Copy, Check, Download } from "lucide-react";
import type { AttachmentMeta } from "@/lib/document-draft";

function getFormatIcon(format: string) {
  const norm = format.toUpperCase();
  if (norm.includes("BIN") || norm.includes("HEX") || norm.includes("ELF")) {
    return <Cpu className="size-5 text-warning" />;
  }
  if (norm.includes("GERBER") || norm.includes("ZIP") || norm.includes("TAR")) {
    return <FileArchive className="size-5 text-accent" />;
  }
  if (norm.includes("PDF") || norm.includes("CERT")) {
    return <FileCheck className="size-5 text-success" />;
  }
  return <FileCode className="size-5 text-primary" />;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function NativeAttachmentCard({ attachment }: { attachment: AttachmentMeta }) {
  const [copied, setCopied] = useState(false);

  const copySha = () => {
    navigator.clipboard.writeText(attachment.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    // Generate an authentic client-side mock download for demonstration
    const blob = new Blob([`Controlled Native Artifact: ${attachment.filename}\nSHA-256: ${attachment.sha256}\nUploader: ${attachment.uploaderName}\nUploadedAt: ${attachment.uploadedAt}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = attachment.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 text-xs transition-colors hover:border-foreground/30">
      <div className="flex items-center gap-3 min-w-0">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-panel border border-border">
          {getFormatIcon(attachment.format)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-foreground truncate max-w-[280px]">
              {attachment.filename}
            </p>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground uppercase">
              {attachment.format}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatBytes(attachment.sizeBytes)} · Uploaded by {attachment.uploaderName} on {new Date(attachment.uploadedAt).toLocaleDateString("en-IN")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-border">
        {/* SHA-256 Badge */}
        <button
          type="button"
          onClick={copySha}
          className="flex items-center gap-1 font-mono text-[10px] bg-panel hover:bg-secondary px-2 py-1 rounded border border-border transition-colors text-muted-foreground hover:text-foreground"
          title="Click to copy full SHA-256 Checksum"
        >
          <span>SHA-256:</span>
          <span className="font-bold">{attachment.sha256.slice(0, 8)}…{attachment.sha256.slice(-6)}</span>
          {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
        </button>

        {/* Download Action */}
        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1 rounded bg-secondary hover:bg-muted px-2.5 py-1 text-xs font-semibold text-foreground transition-colors"
          title="Download controlled artifact"
        >
          <Download className="size-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
}
