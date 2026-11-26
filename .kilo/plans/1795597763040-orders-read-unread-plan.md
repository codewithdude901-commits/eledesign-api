# Orders Read/Unread Feature Plan

## Goal
Add global read/unread status to orders in the admin panel with visual differentiation in the orders list view. Orders are marked as read automatically when any admin views the order detail.

## Current State
- Orders collection managed by `@payloadcms/plugin-ecommerce` with B2B overrides in `src/b2b/pluginOverrides.ts`
- Global notification tracking via `AdminNotificationState` collection (`ordersLastSeenAt` per admin)
- No per-order read status exists

## Issues Identified
1. **ReadStatusCell not rendering**: The `admin.cell` property on field config doesn't work in Payload v3 for custom cell components. Custom cells must be registered via collection's `admin.components.views.list.Cell`.
2. **Multiple orders marked as read**: The `afterRead` hook triggers for any `findByID` call. Admin panel may pre-fetch related orders when viewing one order detail, causing multiple orders to be marked as read simultaneously.

## Implementation Plan

### 1. Database Schema - Add `readAt` field to Orders collection
- Add `readAt` (date, nullable, index) to orders collection via `b2bOrdersCollectionOverride`
- Field should be admin-only (create/update: adminOnlyFieldAccess, read: public)
- Hidden from sidebar, shown in list view via custom column

### 2. Admin UI - Orders List View Differentiation (FIXED)
- Add `readAt` to `defaultColumns` in admin config
- Register custom cell component via `admin.components.views.list.Cell` in collection override
- Custom component receives `rowData` and renders:
  - **Blue dot** for unread orders
  - **Green checkmark** for read orders

### 3. Auto-Mark Read on View (FIXED)
- Replace `afterRead` hook with a more targeted approach:
  - **Option A**: Custom admin endpoint `/api/orders/:id/mark-read` called when detail view loads
  - **Option B**: Use `afterRead` hook but add verification that the request is for the detail view (check `req.route` or similar)
  - **Option C**: Use a custom React hook in the admin detail view to call mark-read API
- **Recommended**: Custom endpoint + client-side call from detail view (most reliable)

### 4. Manual Mark Read/Unread Actions (Optional Enhancement)
- Add custom admin actions: "Mark as read", "Mark as unread" in list view
- Bulk action support for multiple orders

## Files to Modify

1. **`src/b2b/pluginOverrides.ts`** - Add `readAt` field, register custom Cell component via admin.components
2. **`src/b2b/hooks/orderHooks.ts`** - Remove `afterRead` hook, add mark-read endpoint/helper
3. **`src/components/admin/ReadStatusCell.tsx`** - Update to work as Payload list Cell component
4. **New: `src/app/api/orders/[id]/mark-read/route.ts`** - Custom endpoint to mark order as read
5. **New: Admin detail view component** - Call mark-read when detail view mounts (or use Payload's afterRead with better guards)

## Technical Details

### `readAt` Field Definition
```typescript
{
  name: 'readAt',
  type: 'date',
  index: true,
  access: {
    create: adminOnlyFieldAccess,
    read: () => true,
    update: adminOnlyFieldAccess,
  },
  admin: {
    position: 'sidebar',
    readOnly: true,
    description: 'Timestamp when this order was first viewed by an admin',
  },
}
```

### Custom Cell Component Registration (Payload v3)
```typescript
admin: {
  ...defaultCollection.admin,
  defaultColumns: ['createdAt', 'customer', 'channel', 'b2bStatus', 'amount', 'status', 'readAt'],
  components: {
    views: {
      list: {
        Cell: ReadStatusCell, // Custom cell for readAt column
      },
    },
  },
}
```

### Mark-Read Endpoint
```typescript
// POST /api/orders/:id/mark-read
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const payload = await getPayload()
  const order = await payload.findByID({ collection: 'orders', id: params.id })
  if (!order.readAt) {
    await payload.update({ collection: 'orders', id: params.id, data: { readAt: new Date().toISOString() } })
  }
  return Response.json({ success: true })
}
```

### Admin Detail View Integration
- Create custom component for order detail view that calls mark-read on mount
- Register via `admin.components.views.edit` or similar

## Validation Steps
1. Create test orders via API/frontend
2. Verify orders appear with blue dot (unread) in admin list
3. Click order to view detail → verify API call marks only that order as read
4. Refresh list → verify order now shows green checkmark (read)
5. Verify other orders remain unread
6. Test bulk mark read/unread actions (if implemented)

## Rollback Plan
- Remove `readAt` field from collection override
- Remove custom admin components and endpoints
- Revert hooks

## Out of Scope
- Per-admin read tracking (global only as specified)
- Email/push notifications for unread orders
- Read status in customer-facing order views