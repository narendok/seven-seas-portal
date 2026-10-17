# Inventory Reference Parity and GRN Flow

## Goal
Build the current portal’s Live Inventory into a practical component register and assignment workspace guided by the read-only SSM one phase 8 reference, without copying its records or changing that project.

## Inventory workspace
- Add a structured **Add Part** form for Procurement with part number, description, controlled category/subcategory, manufacturer, value, package/footprint, specifications, reorder threshold, storage location/bin, linked projects, and asset-catalog link.
- Expand filters and sorting to cover category hierarchy, manufacturer, package, location, linked project, stock/review state, and quantity.
- Add a part-detail dialog that shows stock by location, linked projects/assets, specifications, alternatives, movement history, and current allocations.
- Extend the controlled taxonomy to include harnesses and their related subcategories, as well as enclosures, connectors, PCB/electronic parts, test equipment, production consumables, software/firmware tools, and packaging.

## Quantity and assignment dialogs
- Replace one-unit receipt/issue controls with a stock-adjustment dialog that accepts a typed quantity, movement reason, location/bin, and note.
- Provide an assignment dialog that supports one or more parts, typed quantity per part, stock-location selection, optional project, notes, and validation against available stock.
- Select a research owner only; derive and lock that owner’s department automatically.
- Record allocation, issue, return, and adjustment history in the browser-local audit trail.

## GRN and linked assets
- Add a Procurement Goods Received Note flow: receive a selected part, supplier/PO reference, lot or reel number, location/bin, received quantity, and quality-hold state.
- On GRN acceptance, add the received quantity to the corresponding part’s available inventory and retain the GRN reference in its movement history. Rejected or held receipts will not become available for allocation.
- Add a harness inventory category and link harness records to the existing modular asset catalog so Hardware and Mechanical can see compatible harness, enclosure, and mechanical inventory within their permitted scopes.

## Access and DEMO safeguards
- Preserve Procurement ownership for create, receive, adjust, allocate, and archive actions; Hardware and Mechanical will see only their permitted inventory categories.
- Keep all new sample records explicitly DEMO-only and browser-local; no data or source records from the reference project will be copied.

## Verification
- Check Add Part, large numeric GRN receipt, held vs accepted receipt behavior, assignment with automatic department, multi-part quantity validation, search/filter/sort, asset linkage, and Hardware/Mechanical access scopes in the live preview.
- Run the focused inventory rules tests plus typecheck and confirm no runtime or build errors.

## Technical notes
- The reference uses hierarchical component categories, per-location stock, multi-part assignment with numeric quantities, and GRN-linked receiving/quality status. This plan reproduces the interaction patterns in the current portal’s versioned browser-local state, not the reference project’s data or backend.