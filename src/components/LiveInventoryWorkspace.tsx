import { Boxes, Minus, PackageCheck, Plus, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";

export type InventoryCategory =
  | "Electronics"
  | "Hardware / PCB"
  | "Mechanical"
  | "Firmware / Software"
  | "Test & Calibration"
  | "Production Consumables"
  | "Packaging & Logistics";

export type InventoryAssignment = {
  id: string;
  inventoryItemId: string;
  assignee: string;
  department: "EHW" | "ESW" | "MECH" | "QA";
  project: string;
  quantity: number;
  assignedAt: string;
  note: string;
};

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
  manufacturer?: string;
  packageCase?: string;
  linkedProjects?: string[];
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
  assignments: InventoryAssignment[];
  allowedCategories: InventoryCategory[];
  readOnly?: boolean;
  onMove: (itemId: string, change: number, reason: InventoryMovement["reason"]) => void;
  onAssign: (itemId: string, assignee: string, department: InventoryAssignment["department"], project: string, quantity: number, note: string) => void;
};

const available = (item: InventoryItem) => Math.max(0, item.onHand - item.allocated);

export function LiveInventoryWorkspace({ items, movements, assignments, allowedCategories, readOnly = false, onMove, onAssign }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<InventoryCategory | "All">("All");
  const [status, setStatus] = useState<"All" | "Available" | "Low stock" | "Assigned">("All");
  const [assignmentItem, setAssignmentItem] = useState<InventoryItem | null>(null);
  const [assignee, setAssignee] = useState("Avery Vale");
  const [department, setDepartment] = useState<InventoryAssignment["department"]>("EHW");
  const [project, setProject] = useState("HLPL-AI4T-01");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const visible = useMemo(
    () => items.filter((item) => {
      const stock = available(item);
      const assigned = assignments.some((assignment) => assignment.inventoryItemId === item.id);
      return allowedCategories.includes(item.category) && (category === "All" || item.category === category) && (status === "All" || (status === "Available" && stock > item.reorderPoint) || (status === "Low stock" && stock <= item.reorderPoint) || (status === "Assigned" && assigned)) && `${item.partNumber} ${item.description} ${item.manufacturer ?? ""} ${item.packageCase ?? ""} ${item.location} ${item.bin} ${item.linkedProjects?.join(" ") ?? ""}`.toLowerCase().includes(query.toLowerCase());
    }),
    [allowedCategories, assignments, category, items, query, status],
  );
  const lowStock = visible.filter((item) => available(item) <= item.reorderPoint).length;
  const totalAvailable = visible.reduce((sum, item) => sum + available(item), 0);
  const submitAssignment = () => {
    if (!assignmentItem) return;
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > available(assignmentItem)) return;
    onAssign(assignmentItem.id, assignee, department, project, parsedQuantity, note);
    setAssignmentItem(null);
    setQuantity("1");
    setNote("");
  };
  return <section className="ops-section mt-8 overflow-hidden bg-panel">
    <div className="ops-section-header flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-2"><Boxes className="size-4 text-steel" /><p className="text-sm font-semibold">Live Inventory</p><span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-primary">PROCUREMENT-OWNED</span></div>
        <p className="mt-1 text-xs text-muted-foreground">Searchable master stock with research allocation. Movements and assignments are saved in this portal session.</p>
      </div>
      <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-md border border-border bg-card px-2.5 py-1.5">{totalAvailable} available</span><span className="rounded-md border border-steel/30 bg-steel/10 px-2.5 py-1.5 text-steel">{assignments.length} R&D allocations</span><span className={`rounded-md border px-2.5 py-1.5 ${lowStock ? "border-warning/40 bg-warning/10 text-warning" : "border-moss/30 bg-moss/10 text-moss"}`}>{lowStock} reorder alerts</span></div>
    </div>
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/50 p-3">
      <label className="relative min-w-56 flex-1"><Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search live inventory" placeholder="Search part, manufacturer, package, project, bin or location…" className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs" /></label>
      <select aria-label="Inventory category" value={category} onChange={(event) => setCategory(event.target.value as InventoryCategory | "All")} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="All">All permitted stock</option>{allowedCategories.map((value) => <option key={value} value={value}>{value}</option>)}</select>
      <select aria-label="Inventory status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="h-8 rounded-md border border-input bg-background px-2 text-xs"><option value="All">All statuses</option><option value="Available">Available</option><option value="Low stock">Low stock</option><option value="Assigned">Assigned to R&D</option></select>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[880px] text-left text-xs"><thead className="border-b border-border bg-secondary/50 font-mono text-[10px] uppercase text-muted-foreground"><tr><th className="px-4 py-2">Part / description</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Location</th><th className="px-3 py-2 text-right">Available</th><th className="px-3 py-2">R&D assignment</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Actions</th></tr></thead><tbody className="divide-y divide-border/60">{visible.map((item) => { const stock = available(item); const isLow = stock <= item.reorderPoint; const assignment = assignments.find((entry) => entry.inventoryItemId === item.id); return <tr key={item.id} className="hover:bg-secondary/30"><td className="px-4 py-2"><strong className="font-mono text-foreground">{item.partNumber}</strong><span className="mt-0.5 block text-muted-foreground">{item.description}{item.manufacturer ? ` · ${item.manufacturer}` : ""}{item.packageCase ? ` · ${item.packageCase}` : ""}</span></td><td className="px-3 py-2"><span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[9px]">{item.category}</span></td><td className="px-3 py-2"><span className="font-medium">{item.location}</span><span className="block font-mono text-[10px] text-muted-foreground">Bin {item.bin}</span></td><td className="px-3 py-2 text-right"><strong className="font-mono text-foreground">{stock} {item.unit}</strong><span className="block font-mono text-[10px] text-muted-foreground">{item.onHand} on hand · {item.allocated} allocated</span></td><td className="px-3 py-2">{assignment ? <><span className="font-medium">{assignment.assignee}</span><span className="block font-mono text-[10px] text-steel">{assignment.department} · {assignment.project} · {assignment.quantity} {item.unit}</span></> : <span className="text-muted-foreground">Unassigned</span>}</td><td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${isLow ? "bg-warning/15 text-warning" : "bg-moss/10 text-moss"}`}>{isLow ? `REORDER ≤ ${item.reorderPoint}` : "AVAILABLE"}</span></td><td className="px-3 py-2"><div className="flex justify-end gap-1">{!readOnly && <><button title="Assign to research team" aria-label={`Assign ${item.partNumber} to research team`} onClick={() => setAssignmentItem(item)} disabled={stock === 0} className="grid size-7 place-items-center rounded border border-steel/30 bg-steel/10 text-steel hover:bg-steel/20 disabled:opacity-40"><UserPlus className="size-3" /></button><button title="Issue one unit" aria-label={`Issue ${item.partNumber}`} onClick={() => onMove(item.id, -1, "Issue")} disabled={stock === 0} className="grid size-7 place-items-center rounded border border-border bg-card text-muted-foreground hover:bg-secondary disabled:opacity-40"><Minus className="size-3" /></button><button title="Receive one unit" aria-label={`Receive ${item.partNumber}`} onClick={() => onMove(item.id, 1, "Receipt")} className="grid size-7 place-items-center rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"><Plus className="size-3" /></button></>}</div></td></tr>; })}</tbody></table></div>
    <div className="border-t border-border bg-card/50 px-4 py-2 text-[10px] text-muted-foreground">{movements.length ? `${movements.length} logged movement${movements.length === 1 ? "" : "s"} · latest ${movements[0]?.at}` : "No movements logged yet."}{readOnly ? " Your current department has read-only access to this stock category." : ""}</div>
    {assignmentItem && <div className="border-t border-border bg-card p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="flex items-center gap-2 text-sm font-semibold"><PackageCheck className="size-4 text-steel" />Assign {assignmentItem.partNumber} to research</p><p className="mt-1 text-xs text-muted-foreground">Available now: {available(assignmentItem)} {assignmentItem.unit}</p></div><button aria-label="Close research assignment" onClick={() => setAssignmentItem(null)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Close</button></div><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5"><label className="text-[10px] font-mono uppercase text-muted-foreground">Research owner<select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs normal-case text-foreground"><option>Avery Vale</option><option>Devon Lane</option><option>Samira Holt</option><option>Jordan Blake</option></select></label><label className="text-[10px] font-mono uppercase text-muted-foreground">Department<select value={department} onChange={(event) => setDepartment(event.target.value as InventoryAssignment["department"])} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs normal-case text-foreground"><option value="EHW">EHW</option><option value="ESW">ESW</option><option value="MECH">MECH</option><option value="QA">QA</option></select></label><label className="text-[10px] font-mono uppercase text-muted-foreground">Project<select value={project} onChange={(event) => setProject(event.target.value)} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs normal-case text-foreground"><option>HLPL-AI4T-01</option><option>HLPL-SLCT-01</option><option>HLPL-XLINK-03</option></select></label><label className="text-[10px] font-mono uppercase text-muted-foreground">Quantity<input value={quantity} onChange={(event) => setQuantity(event.target.value)} min="1" max={available(assignmentItem)} type="number" className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs normal-case text-foreground" /></label><label className="text-[10px] font-mono uppercase text-muted-foreground">Purpose<input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Prototype build" className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs normal-case text-foreground" /></label></div><div className="mt-3 flex justify-end gap-2"><button onClick={() => setAssignmentItem(null)} className="h-8 rounded border border-border bg-card px-3 text-xs font-semibold">Cancel</button><button onClick={submitAssignment} className="h-8 rounded bg-primary px-3 text-xs font-semibold text-primary-foreground">Assign part</button></div></div>}
  </section>;
}