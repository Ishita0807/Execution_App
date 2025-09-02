"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useUser } from "@/providers/usercontext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

export default function LogsPage() {
  const {user} = useUser();
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isZonesLoading, setIsZonesLoading] = useState(true);

  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [zone, setZone] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(buildQuery(false));
      if (res.status !== 200) throw new Error("Failed to fetch logs");
      const data: string[] = await res.data;
      setLogs(data);
    } catch (err) {
      console.error("Error loading logs:", err);
      setLogs(["⚠️ Failed to load logs"]);
    } finally {
      setIsLoading(false);
    }
  }, [start, end, zone]);

  useEffect(() => {
    loadLogs();
    loadZones();
  }, [loadLogs]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLogs();
    }, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [autoRefresh, start, end, zone]);

  useEffect(()=>{
    if(!user)
      router.push('/login');
  }, [user, router]);

  const buildQuery = (download: boolean) => {
    const params = new URLSearchParams();
    if (start) params.append("start", start);
    if (end) params.append("end", end);
    if (zone && zone !== "ALL") params.append("zone", zone);
    params.append("download", download ? "true" : "false");
    return `/logs?${params.toString()}`;
  };

  const loadZones = async () => {
    try {
      setIsZonesLoading(true);
      const res = await axiosInstance.get("/zones");
      if (res.status !== 200) throw new Error("Failed to fetch zones");
      const data = await res.data;
      console.log(data);
      setZones(data.map((z: { name: string }) => z.name));
    } catch (err) {
      console.error("Error loading zones:", err);
      setZones([]);
    } finally {
      setIsZonesLoading(false);
    }
  };

  const downloadLogs = () => {
    const url = buildQuery(true);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.log";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  //   console.log(zones)

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">System Event Logs</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium">Start</label>
          <Input
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">End</label>
          <Input
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Zone</label>
          <Select value={zone} onValueChange={setZone}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Zones" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Zones</SelectItem>
              {isZonesLoading ? (
                <SelectItem value="__loading__" disabled>
                  Loading...
                </SelectItem>
              ) : (
                zones.map((z) => (
                  <SelectItem key={z} value={z}>
                    {z}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={loadLogs}>Apply Filters</Button>
        <Button variant="secondary" onClick={downloadLogs}>
          Download Logs
        </Button>
        <div className="flex items-center space-x-2">
          <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          <Label className="text-sm">Live Auto-Refresh (30s)</Label>
        </div>
      </div>

      {/* Logs Viewer */}
      <Card className="bg-black text-green-400 font-mono text-sm rounded-lg shadow-inner border border-slate-700">
        <CardContent className="p-4">
          <div className="h-[75vh] overflow-y-auto space-y-1">
            {isLoading
              ? Array(20)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex gap-2">
                      <Skeleton className="h-4 w-48 bg-slate-700" />
                      <Skeleton className="h-4 w-24 bg-slate-700" />
                      <Skeleton className="h-4 flex-1 bg-slate-700" />
                    </div>
                  ))
              : logs.map((log, i) => {
                  let color = "text-slate-300"; // default
                  if (log.includes("ERROR")) color = "text-red-500 font-bold";
                  else if (log.includes("WARNING")) color = "text-yellow-400";
                  else if (log.includes("INFO")) color = "text-blue-400";

                  return (
                    <div
                      key={i}
                      className={`whitespace-pre-wrap break-words leading-relaxed ${color}`}
                    >
                      {log}
                    </div>
                  );
                })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
