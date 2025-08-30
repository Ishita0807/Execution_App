import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Radio, Check, AlertCircle, TriangleAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Sensor, SensorProfileEnum } from '@/types/models';

export default function SensorHealth({ sensors, isLoading }:{
    sensors: Sensor[];
    isLoading: boolean
}) {
  const getProfileColor = (profile: string|null) => {
    switch (profile) {
      case 'GOOD':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERATE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILING':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProfileIcon = (profile: string|null) => {
    switch (profile) {
      case 'GOOD':
        return <Check className="w-3 h-3" />;
      case 'MODERATE':
        return <AlertCircle className="w-3 h-3" />;
      case 'FAILING':
        return <TriangleAlert className="w-3 h-3" />;
      default:
        return null;
    }
  };
  
    const sensorsByProfile: Record<SensorProfileEnum, number> = sensors.reduce(
    (acc, sensor) => {
      acc[sensor.sensor_profile] = (acc[sensor.sensor_profile] || 0) + 1;
      return acc;
    },
    {
      [SensorProfileEnum.GOOD]: 0,
      [SensorProfileEnum.MODERATE]: 0,
      [SensorProfileEnum.FAILING]: 0,
    }
  );


  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-purple-500" />
          Sensor Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            {['GOOD', 'MODERATE', 'FAILING'].map(profile => (
              <div key={profile} className="flex justify-between items-center">
                <Badge className={getProfileColor(profile)}>
                  {getProfileIcon(profile)}
                  <span className="ml-1">{profile}</span>
                </Badge>
                <span className="font-semibold text-slate-700">
                  {sensorsByProfile[profile as SensorProfileEnum] || 0} sensors
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}