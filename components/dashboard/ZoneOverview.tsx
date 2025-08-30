
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Thermometer, Droplets, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Zone, Reading, ReadingResponse } from "@/types/models";

export default function ZoneOverview({ zones, readings, isLoading }: {
    zones: Zone[];
    readings: ReadingResponse[];
    isLoading: boolean
}) {
  const getLatestReadingForZone = (zoneId: string) => {
    const zoneReadings = readings.filter(r => r.zone === zoneId);
    return zoneReadings.length > 0 ? zoneReadings[0] : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ALL WITHIN RANGE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ALERT: Temperature Exceeded':
      case 'ALERT: Temperature Warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ALERT: Humidity Too High':
      case 'ALERT: Humidity Too Low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SENSOR FAILURE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-500" />
          Zone Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-xl">
                <Skeleton className="h-4 w-16 mb-3" />
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : (
            zones.map((zone) => {
              const latestReading = getLatestReadingForZone(zone.name);
              
              return (
                <div key={zone.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-shadow bg-white/50">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-900">{zone.name}</h3>
                    <Badge className={getStatusColor(latestReading?.status || "")}>
                      {latestReading?.status || 'No Data'}
                    </Badge>
                  </div>
                  
                  {latestReading ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Thermometer className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-slate-600">Temperature</span>
                        </div>
                        <span className="font-medium text-slate-900">
                          {latestReading.avg_temperature_c}°C
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-teal-500" />
                          <span className="text-sm text-slate-600">Humidity</span>
                        </div>
                        <span className="font-medium text-slate-900">
                          {latestReading.avg_humidity_pct}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">No recent readings</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
