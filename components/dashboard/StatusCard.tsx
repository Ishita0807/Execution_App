import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Icon } from "next/dist/lib/metadata/types/metadata-types";

const colorClasses:{
    [key: string]: string
} = {
  blue: "from-blue-500 to-blue-600 text-blue-600",
  teal: "from-teal-500 to-teal-600 text-teal-600", 
  red: "from-red-500 to-red-600 text-red-600",
  yellow: "from-yellow-500 to-yellow-600 text-yellow-600",
  green: "from-green-500 to-green-600 text-green-600"
};

export default function StatusCard({ title, value, total, unit = "", icon: Icon, color, trend }: {
    title: string;
    value: number;
    total: number;
    unit?: string;
    icon: React.ElementType;
    color: string;
    trend?: string
}) {
  return (
    <Card className="relative overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{title}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                {value}{unit}
              </span>
              {total && (
                <span className="text-lg text-slate-500">/ {total}</span>
              )}
            </div>
          </div>
          
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${colorClasses[color].split(' ')[2]}`} />
            <span className={`text-sm font-medium ${colorClasses[color].split(' ')[2]}`}>
              {trend}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}