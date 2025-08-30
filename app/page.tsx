"use client";

import React, { useState, useEffect } from "react";
import { Zone, Sensor, Reading, SensorProfileEnum } from "@/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Thermometer,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Radio,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import LastUpdated from "@/components/dashboard/LastUpdated";

import StatusCard from "@/components/dashboard/StatusCard";
import ZoneOverview from "@/components/dashboard/ZoneOverview";
import SensorHealth from "@/components/dashboard/SensorHealth";
import LiveReadings from "@/components/dashboard/LiveReadings";

export default function Dashboard() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<
    {
      timestamp: string;
      zone: string;
      status: string;
      avg_temperature_c: number;
      avg_humidity_pct: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [zonesRes, sensorsRes, readingsRes] = await Promise.all([
        fetch("/api/zones").then((r) => r.json()),
        fetch("/api/sensors").then((r) => r.json()),
        fetch("/api/record?limit=200&order=desc").then((r) => r.json()),
      ]);
      setZones(zonesRes);
      setSensors(sensorsRes);
      setReadings(readingsRes);
    } catch (err) {
      console.error("Error loading data:", err);
    }
    setIsLoading(false);
  };

  // ----------------------------
  // Derived metrics
  // ----------------------------
  const activeSensors = sensors.filter((s) => s.status === "active").length;

  // Build "alerts" dynamically from readings
  const alerts = readings.filter(
    (r) => r.status && r.status !== "ALL WITHIN RANGE"
  );
  const criticalAlerts = alerts.filter(
    (a) =>
      a.status === "SENSOR FAILURE" ||
      a.status.includes("Exceeded") ||
      a.status.includes("Too High") ||
      a.status.includes("Too Low")
  ).length;
  const warningAlerts = alerts.length - criticalAlerts;

  // Chart data (last 24 readings)
  const recentReadings = readings
    .slice(0, 24)
    .reverse()
    .map((reading) => ({
      time: format(new Date(reading.timestamp), "HH:mm"),
      temperature: reading.avg_temperature_c,
      humidity: reading.avg_humidity_pct,
      zone: reading.zone,
    }));

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Cold Storage Dashboard
          </h1>
          <p className="text-slate-600">
            Real-time warehouse monitoring and alerts
          </p>
        </div>
        <LastUpdated />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusCard
          title="Active Sensors"
          value={activeSensors}
          total={sensors.length}
          icon={Radio}
          color="teal"
          trend="98% uptime"
        />
        <StatusCard
          title="Active Alerts"
          value={alerts.length}
          total={readings.length}
          icon={AlertTriangle}
          color={
            criticalAlerts > 0 ? "red" : warningAlerts > 0 ? "yellow" : "green"
          }
          trend={
            criticalAlerts > 0
              ? `${criticalAlerts} critical`
              : warningAlerts > 0
              ? `${warningAlerts} warnings`
              : "All normal"
          }
        />
        <StatusCard
          title="System Health"
          value={
            activeSensors > 0
              ? Math.round((activeSensors / sensors.length) * 100)
              : 0
          }
          total={activeSensors}
          unit="%"
          icon={CheckCircle}
          color="green"
          trend="Excellent"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-blue-500" />
                Temperature & Humidity Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={recentReadings}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="temp" orientation="left" />
                  <YAxis yAxisId="humidity" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#0ea5e9"
                    strokeWidth={3}
                    dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
                    name="Temperature (°C)"
                  />
                  <Line
                    yAxisId="humidity"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#14b8a6"
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                    name="Humidity (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <ZoneOverview
            zones={zones}
            readings={readings}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-6">
          <SensorHealth sensors={sensors} isLoading={isLoading} />
          <LiveReadings
            readings={readings.slice(0, 10)}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
