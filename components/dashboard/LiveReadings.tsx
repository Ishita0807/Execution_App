
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Thermometer, Droplets } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Reading, ReadingResponse } from "@/types/models";

export default function LiveReadings({ readings, isLoading }:{
    readings: ReadingResponse[];
    isLoading: boolean
}) {
  const getStatusColor = (status: string|null) => {
    switch (status) {
      case 'ALL WITHIN RANGE':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-500" />
          Live Readings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          ) : (
            readings.map((reading, index) => (
              <div key={index} className="p-3 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white/50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-slate-900 text-sm">Zone {reading.zone}</span>
                  <Badge className={getStatusColor(reading.status)}>
                    {reading.status.replace('ALERT: ', '')}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-slate-600">
                      {reading.avg_temperature_c}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplets className="w-3 h-3 text-teal-500" />
                    <span className="text-xs text-slate-600">
                      {reading.avg_humidity_pct}%
                    </span>
                  </div>
                </div>
                
                <div className="text-xs text-slate-500">
                  {format(new Date(reading.timestamp), 'HH:mm:ss')}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
