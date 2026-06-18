# Real-Time News and Notifications

Use this architecture:

```text
Admin Dashboard -> ASP.NET Core API -> SQL Server -> FCM push -> Mobile App -> API refresh
```

Do not store Firebase service account keys in the React dashboard or mobile app.
Firebase Cloud Messaging must be called from the ASP.NET Core backend.

## 1. Admin Dashboard

The dashboard sends these fields when creating news or notifications:

- `title`
- `description` or `message`
- `publishNow`
- `audienceType`: `AllSuppliers` or `SpecificSupplier`
- `targetRegNo`: only for `SpecificSupplier`
- `type`: for notifications, such as `General`, `News`, `Request`, `Fertilizer`, or `Item`

## 2. Backend Database

Keep SQL Server as the main source of truth.

Required backend tables:

- `News`
- `Notifications`
- `Supplier_Management_MobileDeviceTokens`
- `NotificationOutbox`

Use `NotificationOutbox` so news can save successfully even if Firebase is temporarily unavailable.

## 3. Mobile Token Flow

When a supplier logs into the mobile app:

1. Mobile app asks notification permission.
2. Mobile app gets the FCM token.
3. Mobile app sends token to backend.
4. Backend saves or updates `MobileDeviceTokens`.
5. Backend subscribes that token to topic `all_suppliers`.

Backend endpoint:

```http
POST /api/mobile/device-token
```

Payload:

```json
{
  "regNo": 25,
  "fcmToken": "token_from_firebase",
  "platform": "Android",
  "deviceId": "device_unique_id"
}
```

Your backend also accepts `supplierId`, but `regNo` is the clearest match because the controller reads the authenticated `RegNo` claim first.

On logout or token removal:

```http
DELETE /api/mobile/device-token
```

Payload:

```json
{
  "fcmToken": "token_from_firebase",
  "platform": "Android",
  "deviceId": "device_unique_id"
}
```

## 4. Publish News Flow

For all suppliers:

```text
Save News in SQL Server
Create NotificationOutbox row
Background worker sends FCM topic message to all_suppliers
Mobile receives push
Mobile calls GET /api/mobile/news/latest
```

FCM data payload:

```json
{
  "type": "news",
  "newsId": "15"
}
```

## 5. Send Notification Flow

For one supplier:

```text
Save Notification in SQL Server
Find supplier FCM tokens from MobileDeviceTokens
Create NotificationOutbox row
Background worker sends FCM multicast message
Mobile receives push
Mobile calls GET /api/mobile/notifications/latest
```

FCM data payload:

```json
{
  "type": "notification",
  "notificationId": "42"
}
```

## 6. Backend Firebase Setup

Install backend packages:

```bash
dotnet add package FirebaseAdmin
dotnet add package Google.Apis.Auth
```

Initialize Firebase in ASP.NET Core using the service account JSON on the server only.

Your backend implementation should have:

- `IFirebasePushService`
- `FirebasePushService`
- `IMobileDeviceTokenService`
- `MobileDeviceTokenService`
- `MobileDeviceTokenController`
- `Firebase:Enabled = true`
- `Firebase:ServiceAccountPath = firebase-service-account.json`

For Android FCM, keep:

- high priority
- channel id `default`
- sound `default`

## 7. Dashboard Payloads

For all suppliers news:

```json
{
  "title": "Tea leaf collection notice",
  "description": "Collection time has changed.",
  "publishNow": true,
  "audienceType": "AllSuppliers",
  "targetRegNo": null
}
```

For one supplier notification:

```json
{
  "title": "Fertilizer ready",
  "message": "Your fertilizer request is ready.",
  "type": "Fertilizer",
  "publishNow": true,
  "audienceType": "SpecificSupplier",
  "targetRegNo": 123
}
```

`targetRegNo` must be a number, not a string.

## 8. Mobile App Receive Flow

When mobile receives FCM:

```text
Read remoteMessage.data.type
If type = news, call backend news API
If type = notification, call backend notifications API
Refresh local mobile screen list
Open details screen when user taps push
```

The push message is only an alert. Full news and notification data must come from SQL Server through the backend API.

## 9. Test Checklist

1. Restart ASP.NET Core API.
2. Let migration create/update `Supplier_Management_MobileDeviceTokens`.
3. Login from mobile development build, not Expo Go.
4. Mobile calls `POST /api/mobile/device-token`.
5. Check SQL Server table has active FCM token.
6. In dashboard, create news with `Publish now` and `All suppliers`.
7. Mobile should receive FCM push.
8. Mobile should refresh latest news from backend.
9. In dashboard, create notification with `Specific supplier` and numeric reg no.
10. Only that supplier's saved token devices should receive the push.

## 10. SQL Checks

After mobile login, confirm the device token is stored:

```sql
SELECT TOP 20
    RegNo,
    Platform,
    DeviceId,
    IsActive,
    LastSeenAt,
    LEFT(FcmToken, 25) AS TokenStart
FROM Supplier_Management_MobileDeviceTokens
ORDER BY LastSeenAt DESC;
```

Before testing a specific supplier notification, make sure that supplier has an active token:

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

Replace `123` with the supplier registration number used in the dashboard.

Also confirm the dashboard save happened in the backend news/notification tables. Use your actual table names if they differ:

```sql
SELECT TOP 20 *
FROM News
ORDER BY Id DESC;

SELECT TOP 20 *
FROM Notifications
ORDER BY Id DESC;
```

## 11. Dashboard Contract

The React dashboard sends news to:

```http
POST /api/Communications/news
```

With the important Firebase/backend fields:

```json
{
  "title": "Tea leaf collection notice",
  "description": "Collection time has changed.",
  "content": "Collection time has changed.",
  "expiryDate": null,
  "startDate": null,
  "isActive": true,
  "publishNow": true,
  "audienceType": "AllSuppliers",
  "targetRegNo": null,
  "showPopup": false,
  "priority": 1
}
```

The React dashboard sends notifications to:

```http
POST /api/Communications/notifications
```

With:

```json
{
  "title": "Fertilizer ready",
  "message": "Your fertilizer request is ready.",
  "type": "Fertilizer",
  "schedule": null,
  "startDate": null,
  "endDate": null,
  "priority": 1,
  "isActive": true,
  "publishNow": true,
  "audienceType": "SpecificSupplier",
  "targetRegNo": 123
}
```

If `audienceType` is `SpecificSupplier`, `targetRegNo` must match an active token row in `Supplier_Management_MobileDeviceTokens`.

## 12. Troubleshooting Matrix

Use this order when news or notifications do not appear in the mobile app:

| Result | Meaning | Fix |
| --- | --- | --- |
| Dashboard shows API error | Backend rejected the payload before SQL save | Check the toast message and browser Network response body |
| API success but no SQL row | Backend create endpoint is not saving or migration/table mapping is wrong | Debug `POST /api/Communications/news` or `/notifications` in the API |
| SQL row exists but no mobile token row | Mobile app did not register FCM token | Check mobile permission, native development build, auth token, and `POST /api/mobile/device-token` |
| SQL row and token row exist but no push | Firebase send path failed | Check `Firebase:Enabled`, service account path, Firebase project, Android package, and backend logs |
| Push arrives but app list does not update | Mobile receive handler is not refreshing from backend | On FCM receive/tap, call the mobile news/notification API and update local state |
| All suppliers works but specific supplier does not | Target reg no has no active token | Check `RegNo`, `IsActive = 1`, and invalid-token deactivation |

## 13. Required Mobile Behavior

The mobile app must handle both foreground and background/tap notification cases.

For foreground receive:

```text
remoteMessage.data.type == "news" -> refresh news list from backend
remoteMessage.data.type == "notification" -> refresh notification list from backend
```

For notification tap:

```text
newsId exists -> open news detail or refresh news list
notificationId exists -> open notification detail or refresh notification list
```

Do not depend only on the push notification body. The mobile app should always load the full latest data from SQL Server through the backend API.

## 14. Best Decision

Use Firebase Cloud Messaging, not Firestore, for this requirement.

- SQL Server stores real news and notifications.
- FCM only wakes the mobile app immediately.
- Mobile app loads full details from backend APIs.
- SignalR is optional if you need instant in-app updates while the app is open.
