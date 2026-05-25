"use client";

import { useEffect, useState } from "react";
import { announcements } from "@/lib/config";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % announcements.length),
      4000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-leaf-900 text-center text-white">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center overflow-hidden px-4">
        <p
          key={index}
          className="animate-fade-up text-xs font-medium tracking-wide sm:text-sm"
        >
          {announcements[index]}
        </p>
      </div>
    </div>
  );
}
