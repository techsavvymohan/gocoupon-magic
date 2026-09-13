import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function RecentActivityTable({ rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows : [];
  return (
    <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      <CardHeader>
        <CardTitle className="text-base font-bold text-zinc-900 dark:text-white">Recent Offers</CardTitle>
        <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Latest publishing activity across all stores.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/80 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800">
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Coupon / Deal</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Store</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Type</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Source</TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeRows.map((row, idx) => (
              <TableRow key={`${row.title || 'deal'}-${row.store || 'store'}-${idx}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800/60 transition">
                <TableCell className="font-bold text-zinc-900 dark:text-white text-xs">{row.title}</TableCell>
                <TableCell className="text-zinc-700 dark:text-zinc-300 text-xs font-semibold">{row.store}</TableCell>
                <TableCell>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${row.type === "Coupon" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800"}`}>
                    {row.type || "Offer"}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-600 dark:text-zinc-400 text-xs font-medium">{row.source}</TableCell>
                <TableCell className="text-zinc-500 dark:text-zinc-400 text-xs font-medium">{row.addedAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
