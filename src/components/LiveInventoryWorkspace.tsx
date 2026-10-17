import { Boxes, Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";

export type InventoryCategory = "Electronics" | "Hardware / PCB" | "Mechanical";

export type InventoryItem = {
  id: string;
  partNumber: string;
  description: string;
  category: InventoryCategory;
  location: string;
  bin: string;
  onHand: number;
  allocated: number;
  reorderPoint: number;
  unit: string;
  updatedAt: string;
  isDemo?: boolean;
};

export type InventoryMovement = {
  id: string;
  inventoryItemId: string;
  change: number;
  reason: "Receipt" | "Issue" | "Adjustment";
  at: string;
  actor: string;
  note: string;
};

type Props = {
  items: InventoryItem[];
  movements: InventoryMovement[];
  allowedCategories: InventoryCategory[];
  readOnly?: boolean;
  onMove: (itemId: string, change: number, reason: InventoryMovement["reason"]) => void;
};

const available = (item: InventoryItem) => Math.max(0, item.onHand - item.allocated);

export function LiveInventoryWorkspace({ items, movements, allowedCategories, readOnly = false, onMove }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "All">("All");
  const visible = useMemo(
    () => items.filter((item) => allowedCategories.includes(item.category) && (category === "All" || item.category === category) && `${item.partNumber} ${item.description} ${item.location} ${item.bin}`.toLowerCase().includes(query.toLowerCase())),
    [allowedCategories, category, items, query],
  );
  const lowStock = visible.filter((item) => available(item) <= item.reorderPoint).length;
  const totalAvailable = visible.reduce((sum, item) => sum + available(item), 0);
  return <section className="ops-section mt-8 overflow-hidden bg-panel">
    <div className="ops-section-header flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2"><Boxes className="size-4 text-steel" /><p className="text-sm font-semibold">Live Inventory</p><span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">PROCUREMENT-OWNED</span></div>
        <p className="mt-1 text-xs text-muted-foreground">On-hand, allocated and available stock. Movements are saved in this portal session.</p>
      </div>
      <div className="flex gap-2 text-xs"><span className="rounded-md border border-border bg-card px-2.5 py-1.5">{totalAvailable} available</span><span className={`rounded-md border px-2.5 py-1.5 ${lowStock ? "border-warning/40 bg-warning/10 text-warning" : "border-moss/30 bg-moss/10 text-moss"}`}>{lowStock} reorder alerts</span></div>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/50 p-3">
      <label className="relative min-w-56 flex-1"><Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search live inventory" placeholder="Search part, bin or location…" className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs" /></label>
      <select aria-label="Inventory category" value={category} onChange={(event) => setCategory(event.target.value as InventoryCategory | "All")} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="All">All permitted stock</option>{allowedCategories.map((value) => <option key={value} value={value}>{value}</option>)}</select>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-xs"><thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-4 py-2">Part / description</th><th className="px-3 py-2">Location</th><th className="px-3 py-2 text-right">On hand</th><th className="px-3 py-2 text-right">Allocated</th><th className="px-3 py-2 text-right">Available</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Movement</th></tr></thead><tbody className="divide-y divide-border/60">{visible.map((item) => { const stock = available(item); const isLow = stock <= item.reorderPoint; return <tr key={item.id} className="hover:bg-secondary/30"><td className="px-4 py-2"><strong className="font-mono text-foreground">{item.partNumber}</strong><span className="mt-0.5 block text-muted-foreground">{item.description} · {item.category}</span></td><td className="px-3 py-2"><span className="font-medium">{item.location}</span><span className="block font-mono text-[10px] text-muted-foreground">Bin {item.bin}</span></td><td className="px-3 py-2 text-right font-mono">{item.onHand} {item.unit}</td><td className="px-3 py-2 text-right font-mono text-muted-foreground">{item.allocated}</td><td className="px-3 py-2 text-right font-mono font-bold text-foreground">{stock}</td><td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${isLow ? "bg-warning/15 text-warning" : "bg-moss/10 text-moss"}`}>{isLow ? `REORDER ≤ ${item.reorderPoint}` : "AVAILABLE"}</span></td><td className="px-3 py-2"><div className="flex justify-end gap-1">{!readOnly && <><button title="Issue one unit" aria-label={`Issue ${item.partNumber}`} onClick={() => onMove(item.id, -1, "Issue")} disabled={stock === 0} className="grid size-7 place-items-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40"><Minus className="size-3" /></button><button title="Receive one unit" aria-label={`Receive ${item.partNumber}`} onClick={() => onMove(item.id, 1, "Receipt")} className="grid size-7 place-items-center rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"><Plus className="size-3" /></button></>}</div></td></tr>; })}</tbody></table></div>
    <div className="border-t border-border bg-card/50 px-4 py-2 text-[10px] text-muted-foreground">{movements.length ? `${movements.length} logged movement${movements.length === 1 ? "" : "s"} · latest ${movements[0]?.at}` : "No movements logged yet."}{readOnly ? " Your current department has read-only access to this stock category." : ""}</div>
  </section>;
}