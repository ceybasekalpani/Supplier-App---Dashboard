# Real-Time Fertilizer and Item Dropdown Sync

Use this flow when an admin registers, edits, activates, or deactivates fertilizer/item types:

```text
Admin Dashboard -> ASP.NET Core API -> SQL Server -> FCM data push -> Mobile App -> reload dropdown APIs
```

The dashboard already saves configuration through the backend. The mobile app must reload the dropdown data from SQL Server through the backend API.

## 1. Dashboard Actions Already Sent

The dashboard configuration page calls:

```http
GET /api/FertilizerItemConfiguration?includeInactive=true
POST /api/FertilizerItemConfiguration
PUT /api/FertilizerItemConfiguration/{fertilizer|items}/{id}
PATCH /api/FertilizerItemConfiguration/{fertilizer|items}/{id}/active
```

Create payload:

```json
{
  "category": "fertilizer",
  "name": "Organic Compost"
}
```

For items:

```json
{
  "category": "items",
  "name": "Leaf Collection Basket"
}
```

The dashboard side is not the place to connect Firebase directly.

## 2. Backend Must Do This

After `CreateAsync`, `UpdateAsync`, or `SetActiveAsync` saves SQL Server successfully:

1. Save the `FertilizerItemStore` row.
2. Send an FCM data push to all active supplier devices.
3. Return the saved configuration row to the dashboard.

Do not fail the SQL save if Firebase has a temporary error. Log the Firebase error and keep the configuration saved.

## 3. Backend Push Method

Add this to `IFirebasePushService`:

```csharp
Task SendConfigurationChangedAsync(string category, int id, string action);
```

Add implementation to `FirebasePushService`:

```csharp
public Task SendConfigurationChangedAsync(string category, int id, string action)
{
    var normalizedCategory = NormalizeRequestType(category);
    var normalizedAction = string.IsNullOrWhiteSpace(action) ? "changed" : action.Trim().ToLowerInvariant();

    return SendAsync(
        "Request options updated",
        "New fertilizer or item options are available.",
        "AllSuppliers",
        null,
        new Dictionary<string, string>
        {
            ["type"] = "configuration_changed",
            ["category"] = normalizedCategory,
            ["id"] = id.ToString(),
            ["action"] = normalizedAction
        });
}
```

If your existing `NormalizeRequestType` only accepts request types, create a new method:

```csharp
private static string NormalizeConfigurationCategory(string category)
{
    var normalized = category.Trim().ToLowerInvariant();
    return normalized switch
    {
        "fertilizer" or "fertilizers" => "fertilizer",
        "item" or "items" => "items",
        _ => "all"
    };
}
```

Then use `NormalizeConfigurationCategory(category)` in the data payload.

## 4. Backend Configuration Service

Inject `IFirebasePushService` into `FertilizerItemConfigurationService`:

```csharp
private readonly IFirebasePushService _firebasePushService;
private readonly ILogger<FertilizerItemConfigurationService> _logger;

public FertilizerItemConfigurationService(
    ApplicationDbContext context,
    IFirebasePushService firebasePushService,
    ILogger<FertilizerItemConfigurationService> logger)
{
    _context = context;
    _firebasePushService = firebasePushService;
    _logger = logger;
}
```

After create save:

```csharp
await _context.SaveChangesAsync();
await NotifyConfigurationChangedAsync(normalizedCategory, row.Id, "created");
return ToDto(row, normalizedCategory);
```

After update save:

```csharp
await _context.SaveChangesAsync();
await NotifyConfigurationChangedAsync(normalizedCategory, row.Id, "updated");
return ToDto(row, normalizedCategory);
```

After active/inactive save:

```csharp
await _context.SaveChangesAsync();
await NotifyConfigurationChangedAsync(normalizedCategory, row.Id, isActive ? "activated" : "deactivated");
return ToDto(row, normalizedCategory);
```

Helper:

```csharp
private async Task NotifyConfigurationChangedAsync(string category, int id, string action)
{
    try
    {
        await _firebasePushService.SendConfigurationChangedAsync(category, id, action);
    }
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Configuration saved, but Firebase configuration sync push failed. Category={Category}, Id={Id}, Action={Action}.",
            category,
            id,
            action);
    }
}
```

## 5. FCM Data Payload

For a new fertilizer type:

```json
{
  "type": "configuration_changed",
  "category": "fertilizer",
  "id": "15",
  "action": "created"
}
```

For a new item type:

```json
{
  "type": "configuration_changed",
  "category": "items",
  "id": "18",
  "action": "created"
}
```

## 6. Mobile App Must Do This

Your mobile request screen currently loads types on screen open:

```text
fertilizerApi.types(token)
itemApi.types(token)
```

To make dropdowns update quickly, move that logic into a reusable function:

```javascript
const loadTypes = useCallback(async () => {
  try {
    const token = await tokenStorage.get();
    if (!token) return;

    const [fResult, iResult] = await Promise.allSettled([
      fertilizerApi.types(token),
      itemApi.types(token),
    ]);

    if (fResult.status === "fulfilled" && Array.isArray(fResult.value)) {
      setFertilizerTypes(fResult.value.map((tp) => ({ value: tp, label: tp })));
    }

    if (iResult.status === "fulfilled" && Array.isArray(iResult.value)) {
      setItemTypes(iResult.value.map((tp) => ({ value: tp, label: tp })));
    }
  } catch (error) {
    console.log("Error loading types:", error);
  }
}, []);
```

Call it on screen open:

```javascript
useEffect(() => {
  let mounted = true;

  (async () => {
    if (mounted) setTypesLoading(true);
    await loadTypes();
    if (mounted) setTypesLoading(false);
  })();

  return () => {
    mounted = false;
  };
}, [loadTypes]);
```

Also call `loadTypes()` when push data says configuration changed:

```javascript
if (remoteMessage?.data?.type === "configuration_changed") {
  await loadTypes();
}
```

If the app has a central `AppContext`, an even better pattern is:

```text
AppContext receives configuration_changed push
-> AppContext reloads fertilizer/item types
-> dropdown screen reads latest types from AppContext
```

## 7. Also Refresh On Screen Focus

FCM may not always be delivered while the app is foregrounded or if notification permission is denied. Add a screen focus refresh too:

```javascript
useFocusEffect(
  useCallback(() => {
    loadTypes();
  }, [loadTypes])
);
```

This ensures the dropdown is fresh every time the supplier opens the fertilizer/item request screen.

## 8. SQL Check

After registering a type in the dashboard:

```sql
SELECT TOP 50
    Id,
    FertilizerType,
    ItemType,
    IsActive,
    CreatedAt,
    UpdatedAt
FROM FertilizerItemStore
ORDER BY Id DESC;
```

If your actual table name is different, use the table mapped to the `FertilizerItemStore` entity.

## 9. Test Flow

1. Open mobile app and login.
2. Confirm FCM token exists in `Supplier_Management_MobileDeviceTokens`.
3. Open fertilizer/item request screen.
4. In dashboard, register a new fertilizer type.
5. Confirm SQL row is saved.
6. Confirm backend sends `configuration_changed`.
7. Mobile receives the push and calls the type APIs again.
8. Dropdown shows the new type without app restart.
9. Repeat for item type and deactivate/activate.

## 10. Troubleshooting

| Result | Meaning | Fix |
| --- | --- | --- |
| Dashboard save fails | Backend rejected the configuration | Check browser Network response and backend logs |
| Dashboard save succeeds but SQL row missing | Backend configuration service is not saving | Fix `FertilizerItemConfigurationService` |
| SQL row exists but no mobile update | No config FCM push or no active token | Check Firebase logs and `Supplier_Management_MobileDeviceTokens` |
| Push arrives but dropdown old | Mobile handler is not calling type APIs | Call `loadTypes()` on `configuration_changed` |
| Dropdown updates only after reopening screen | Types load only in screen `useEffect` | Add push handler and `useFocusEffect` refresh |

