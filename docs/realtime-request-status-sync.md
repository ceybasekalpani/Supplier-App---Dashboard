# Real-Time Request Status Sync

Use this architecture for advance, fertilizer, and item request actions:

```text
Admin Dashboard -> ASP.NET Core API -> SQL Server -> FCM data push -> Mobile App -> API refresh
```

The dashboard must not call Firebase directly. Firebase Admin SDK stays in the backend.

## 1. Dashboard Actions Already Sent

Request approve/reject actions call:

```http
PUT /api/DashboardRequests/{requestType}/{id}/status
```

Examples:

```http
PUT /api/DashboardRequests/advance/10/status
PUT /api/DashboardRequests/fertilizer/22/status
PUT /api/DashboardRequests/items/35/status
```

Payload:

```json
{
  "status": "approved",
  "remarks": "Approved by admin"
}
```

Reject payload:

```json
{
  "status": "rejected",
  "remarks": "Rejected reason"
}
```

Disbursement issue actions call:

```http
POST /api/Disbursement/{requestType}/{requestId}/issue
```

Examples:

```http
POST /api/Disbursement/advance/10/issue
POST /api/Disbursement/fertilizer/22/issue
POST /api/Disbursement/items/35/issue
```

Payload:

```json
{
  "method": "Physical Delivery"
}
```

For advances, `method` can be the selected payment method.

## 2. Backend Must Do This

For every approve/reject/issue action:

1. Validate the dashboard admin permission.
2. Find the request row by `id` and request type.
3. Update the correct SQL Server table.
4. Save changes first.
5. Find active FCM tokens for that request supplier `RegNo`.
6. Send an FCM data push to those tokens.
7. Return the updated row to the dashboard.

Do not fail the SQL update just because Firebase has a temporary error. Save the database change first, then log/retry the push error.

## 3. Recommended Backend Service Contract

Add a backend push method like this:

```csharp
Task SendRequestStatusChangedAsync(
    string requestType,
    int requestId,
    int regNo,
    string status,
    string? remarks);

Task SendDisbursementStatusChangedAsync(
    string requestType,
    int requestId,
    int regNo,
    string status,
    string? method);
```

Use the existing `Supplier_Management_MobileDeviceTokens` table:

```csharp
var tokens = await _context.MobileDeviceTokens
    .Where(x => x.RegNo == regNo && x.IsActive)
    .Select(x => x.FcmToken)
    .ToListAsync();
```

## 4. FCM Data Payloads

For approve/reject:

```json
{
  "type": "request_status_changed",
  "requestType": "advance",
  "requestId": "10",
  "status": "approved"
}
```

For fertilizer:

```json
{
  "type": "request_status_changed",
  "requestType": "fertilizer",
  "requestId": "22",
  "status": "rejected"
}
```

For item:

```json
{
  "type": "request_status_changed",
  "requestType": "items",
  "requestId": "35",
  "status": "approved"
}
```

For issued/disbursed:

```json
{
  "type": "disbursement_status_changed",
  "requestType": "fertilizer",
  "requestId": "22",
  "status": "issued"
}
```

Recommended notification title/body:

```text
Title: Request approved
Body: Your advance request has been approved.
```

```text
Title: Request rejected
Body: Your fertilizer request was rejected. Open the app for details.
```

```text
Title: Request issued
Body: Your item request has been issued.
```

## 5. Mobile App Must Do This

When FCM arrives, read `remoteMessage.data.type`.

For request status changes:

```text
type == "request_status_changed"
requestType == "advance" -> refresh advance requests from backend
requestType == "fertilizer" -> refresh fertilizer requests from backend
requestType == "items" -> refresh item requests from backend
```

For disbursement changes:

```text
type == "disbursement_status_changed"
refresh the matching request list and any disbursement/history screen
```

The mobile app should update the visible list after refreshing from SQL Server through the backend API. Do not only update local state from the push message, because SQL Server is the source of truth.

## 6. SQL Checks

After approving or rejecting in the dashboard, check the matching request table and verify `Status`, `Remarks`, and update date changed.

Use your actual backend table names. Example pattern:

```sql
SELECT TOP 20 *
FROM AdvanceRequests
ORDER BY Id DESC;

SELECT TOP 20 *
FROM FertilizerRequests
ORDER BY Id DESC;

SELECT TOP 20 *
FROM ItemRequests
ORDER BY Id DESC;
```

Then confirm the supplier has an active token:

```sql
SELECT TOP 20
    RegNo,
    IsActive,
    LastSeenAt,
    LEFT(FcmToken, 25) AS TokenStart
FROM Supplier_Management_MobileDeviceTokens
WHERE RegNo = 123 AND IsActive = 1
ORDER BY LastSeenAt DESC;
```

Replace `123` with the request supplier `RegNo`.

## 7. Test Flow

1. Login to mobile app as supplier.
2. Confirm `Supplier_Management_MobileDeviceTokens` has an active token for that supplier.
3. Create or find a pending advance/fertilizer/item request for that supplier.
4. From dashboard, approve the request.
5. Confirm SQL status changed to `approved`.
6. Confirm mobile receives FCM push.
7. Confirm mobile refreshes the matching request table/list and shows `approved`.
8. Repeat with `rejected`.
9. Approve another request, then issue it from disbursement screen.
10. Confirm mobile shows issued/disbursed status quickly.

## 8. Troubleshooting

| Result | Meaning | Fix |
| --- | --- | --- |
| Dashboard shows API error | Backend rejected the action | Check browser Network response and backend logs |
| Dashboard success but SQL status did not change | Backend action endpoint is not saving the table | Fix `DashboardRequests` or `Disbursement` service update logic |
| SQL changed but no push | Backend did not send FCM or no active token exists | Check `Supplier_Management_MobileDeviceTokens`, Firebase config, and backend logs |
| Push arrives but mobile status stays old | Mobile handler did not refresh backend data | Call the matching request API after FCM receive/tap |
| Specific supplier never receives | Wrong `RegNo` or inactive token | Match request `RegNo` with active token row |

