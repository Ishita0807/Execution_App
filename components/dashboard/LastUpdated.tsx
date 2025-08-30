"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";

export default function LastUpdated() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // update immediately on mount
    setTime(format(new Date(), "HH:mm:ss"));

    // update every second
    const interval = setInterval(() => {
      setTime(format(new Date(), "HH:mm:ss"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      Last updated: {time}
    </div>
  );
}
