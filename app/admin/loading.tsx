"use client";
import { Infinity } from "ldrs/react";
import "ldrs/react/Infinity.css";

export default function Loading() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-6">
      <Infinity
        size="70"
        stroke="5"
        strokeLength="0.15"
        bgOpacity="0.1"
        speed="1.3"
        color="#3b82f6"
      />
      <p className="animate-pulse text-xs font-light tracking-widest text-slate-500 uppercase">
        Loading..
      </p>
    </div>
  );
}
