"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Sensor, SensorProfileEnum } from "@/types/models";
import { useUser } from "@/providers/usercontext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";

type SensorFormProps = {
  sensor?: Sensor | null; // existing sensor (for edit), optional for create
  onSave: (sensorData: Omit<Sensor, "id" | "installed_at">) => void;
  onCancel: () => void;
};

function SensorForm({ sensor, onSave, onCancel }: SensorFormProps) {
  const {user} = useUser();
  const router = useRouter();
  const [zones, setZones] = useState<{ id: number; name: string }[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const [formData, setFormData] = useState<Omit<Sensor, "id" | "installed_at">>(
    sensor || {
      sensor_id: "",
      zone_name: "",
      status: "active",
      sensor_profile: SensorProfileEnum.GOOD, // ✅ use enum, not string
    }
  );

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axiosInstance.get("/zones");
        if (res.status !== 200) throw new Error("Failed to fetch zones");
        const data = await res.data;
        setZones(data);
      } catch (err) {
        console.error("Error fetching zones:", err);
      } finally {
        setLoadingZones(false);
      }
    };
    fetchZones();
  }, []);

  useEffect(() => {
    if(!user) router.push('/login');
  }, [user, router]);

  const handleChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="sensor_id" className="text-right">
          Sensor ID
        </Label>
        <Input
          id="sensor_id"
          value={formData.sensor_id}
          onChange={(e) => handleChange("sensor_id", e.target.value)}
          className="col-span-3"
          disabled={!!sensor}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="zone_name" className="text-right">
          Zone
        </Label>
        <Select
          value={formData.zone_name}
          onValueChange={(value) => handleChange("zone_name", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select a zone" />
          </SelectTrigger>
          <SelectContent>
            {loadingZones ? (
              <SelectItem value="__loading__" disabled>
                Loading zones...
              </SelectItem>
            ) : (
              zones.map((z) => (
                <SelectItem key={z.id} value={z.name}>
                  {z.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="status" className="text-right">
          Status
        </Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger className="col-span-3">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button onClick={handleSave}>Save</Button>
        </DialogClose>
      </DialogFooter>
    </div>
  );
}

export default function SensorsPage() {
  const [sensors, setSensors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/sensors");
      const data = await res.data;
      setSensors(data);
    } catch (err) {
      console.error("Failed to load sensors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sensorData: any) => {
    try {
      if (editingSensor) {
        await fetch(`/api/sensors/${editingSensor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sensorData),
        });
      } else {
        await fetch(`/api/sensors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sensorData),
        });
      }
      loadData();
    } catch (err) {
      console.error("Failed to save sensor:", err);
    } finally {
      setEditingSensor(null);
      setIsFormOpen(false);
    }
  };

  const handleDelete = async (sensorId: number) => {
    if (confirm("Are you sure you want to delete this sensor?")) {
      try {
        await fetch(`/api/sensors/${sensorId}`, { method: "DELETE" });
        loadData();
      } catch (err) {
        console.error("Failed to delete sensor:", err);
      }
    }
  };

  const openForm = (sensor: any = null) => {
    setEditingSensor(sensor);
    setIsFormOpen(true);
  };

  const getProfileColor = (profile: string) => {
    switch (profile) {
      case "GOOD":
        return "bg-green-100 text-green-800 border-green-200";
      case "MODERATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILING":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Sensors</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Sensor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSensor ? "Edit Sensor" : "Create New Sensor"}
              </DialogTitle>
            </DialogHeader>
            <SensorForm
              sensor={editingSensor}
              onSave={handleSave}
              onCancel={() => {
                setEditingSensor(null);
                setIsFormOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sensor ID</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={6}>
                          <Skeleton className="h-6" />
                        </TableCell>
                      </TableRow>
                    ))
                : sensors.map((sensor) => (
                    <TableRow key={sensor.id}>
                      <TableCell className="font-medium">
                        {sensor.sensor_id}
                      </TableCell>
                      <TableCell>{sensor.zone_name}</TableCell>
                      <TableCell>
                        {sensor.sensor_profile === "FAILING" ? (
                          <span className="text-red-600 font-semibold">
                            Inactive
                          </span>
                        ) : (
                          sensor.status
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getProfileColor(sensor.sensor_profile)}
                        >
                          {sensor.sensor_profile}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openForm(sensor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(sensor.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
