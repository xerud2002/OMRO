"use client";
import { Loader2 } from "lucide-react";

export default function LoadingSpinner({
  text = "Se încarcă...",
}: {
  text?: string;
}) {
  return (
    <div className="flex justify-center items-center h-[70vh] text-emerald-600 text-lg">
      <Loader2 className="animate-spin mr-2" /> {text}
    </div>
  );
}
