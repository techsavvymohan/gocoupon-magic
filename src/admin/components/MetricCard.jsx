import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricCard({ label, value, change }) {
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <CardHeader className="pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-600 dark:text-zinc-400">{label}</p>
        <CardTitle className="text-3xl font-black text-zinc-900 dark:text-white">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{change}</p>
      </CardContent>
    </Card>
  );
}
