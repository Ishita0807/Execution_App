"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ReadingsPage() {
  const [readings, setReadings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 50; // rows per page

  // Initial + auto refresh
  useEffect(() => {
    loadReadings(page);

    const interval = setInterval(() => {
      loadReadings(page);
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [page]);

  const loadReadings = async (pageNum: number) => {
    try {
      setIsLoading(true);
      const offset = (pageNum - 1) * pageSize;
      const res = await fetch(
        `/api/record?limit=${pageSize}&offset=${offset}&order=desc`
      );
      if (!res.ok) throw new Error("Failed to fetch readings");

      const data = await res.json();
      setReadings(data.rows || data); // API can return {rows,total}
      setHasMore((data.total ?? 0) > offset + pageSize);
    } catch (err) {
      console.error("Error loading readings:", err);
      setReadings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (status?.includes("ALERT"))
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status?.includes("FAILURE"))
      return "bg-red-100 text-red-800 border-red-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Sensor Readings</h1>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Sensor ID</TableHead>
                <TableHead>Temperature</TableHead>
                <TableHead>Humidity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(pageSize)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-6" />
                      </TableCell>
                    </TableRow>
                  ))
              ) : readings.length > 0 ? (
                readings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>
                      {format(new Date(reading.timestamp), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>{reading.zone_name}</TableCell>
                    <TableCell>{reading.sensor_id}</TableCell>
                    <TableCell>
                      {reading.temperature_c !== null
                        ? `${reading.avg_temperature_c}°C`
                        : "—"}
                    </TableCell>
                    <TableCell>{reading.avg_humidity_pct}%</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reading.status)}>
                        {reading.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500">
                    No readings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination controls */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">Page {page}</span>
            <Button
              variant="outline"
              disabled={!hasMore}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
