"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Zone } from "@/types/models";
import axiosInstance from "@/utils/axiosInstance";
import axios from "axios";

// ------------------ Form ------------------
type ZoneFormProps = {
  zone?: Zone | null;
  onSave: (zoneData: Partial<Zone>) => void;
  onCancel: () => void;
};

function ZoneForm({ zone, onSave, onCancel }: ZoneFormProps) {
  const [formData, setFormData] = useState<Partial<Zone>>(
    zone || {
      name: "",
      min_c: 0,
      max_c: 10,
      humidity_min: 40,
      humidity_max: 80,
    }
  );

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
        <Label htmlFor="name" className="text-right">
          Name
        </Label>
        <Input
          id="name"
          value={formData.name ?? ""}
          onChange={(e) => handleChange("name", e.target.value)}
          className="col-span-3"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Temp Min (°C)</Label>
          <Input
            type="number"
            value={formData.min_c ?? 0}
            onChange={(e) => handleChange("min_c", parseFloat(e.target.value))}
          />
        </div>
        <div>
          <Label>Temp Max (°C)</Label>
          <Input
            type="number"
            value={formData.max_c ?? 0}
            onChange={(e) => handleChange("max_c", parseFloat(e.target.value))}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Humidity Min (%)</Label>
          <Input
            type="number"
            value={formData.humidity_min ?? 0}
            onChange={(e) =>
              handleChange("humidity_min", parseFloat(e.target.value))
            }
          />
        </div>
        <div>
          <Label>Humidity Max (%)</Label>
          <Input
            type="number"
            value={formData.humidity_max ?? 0}
            onChange={(e) =>
              handleChange("humidity_max", parseFloat(e.target.value))
            }
          />
        </div>
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

// ------------------ Page ------------------
export default function ZonesPage() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    setIsLoading(true);
    const res = await axiosInstance.get("/zones");
    const data = await res.data;
    setZones(data);
    setIsLoading(false);
  };

  const handleSave = async (zoneData: Partial<Zone>) => {
    if (editingZone) {
      await axiosInstance.put(`/zones/${editingZone.id}`, zoneData);
    } else {
      await axios.post("/zones", zoneData);
    }

    setEditingZone(null);
    setIsFormOpen(false);
    loadZones();
  };

  const handleDelete = async (zoneId: number) => {
    if (confirm("Are you sure you want to delete this zone?")) {
      await axios.delete(`/zones/${zoneId}`);
      loadZones();
    }
  };

  const openForm = (zone: Zone | null = null) => {
    setEditingZone(zone);
    setIsFormOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Zones</h1>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Zone
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingZone ? "Edit Zone" : "Create New Zone"}
              </DialogTitle>
            </DialogHeader>
            <ZoneForm
              zone={editingZone}
              onSave={handleSave}
              onCancel={() => {
                setEditingZone(null);
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
                <TableHead>Name</TableHead>
                <TableHead>Temp Threshold</TableHead>
                <TableHead>Humidity Threshold</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}>
                          <Skeleton className="h-6" />
                        </TableCell>
                      </TableRow>
                    ))
                : zones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        {zone.min_c}°C – {zone.max_c}°C
                      </TableCell>
                      <TableCell>
                        {zone.humidity_min}% – {zone.humidity_max}%
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openForm(zone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(zone.id)}
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
