package com.budgetmitra.app;

import android.Manifest;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.net.Uri;
import android.provider.Settings;
import android.provider.Telephony;
import androidx.core.content.ContextCompat;
import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;

/**
 * Native Android SMS Reader implementation.
 * Queries on-device SMS Content Provider with strict privacy (only for device debits).
 */
public class SmsReaderPlugin {

    public static boolean hasSmsPermission(Context context) {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.READ_SMS)
                == PackageManager.PERMISSION_GRANTED;
    }

    public static String getMessagesJson(Context context, int daysBack) {
        JSONArray array = new JSONArray();
        if (!hasSmsPermission(context)) {
            return array.toString();
        }

        ContentResolver cr = context.getContentResolver();
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.DAY_OF_YEAR, -daysBack);
        long filterTime = cal.getTimeInMillis();

        String selection = Telephony.Sms.DATE + " >= ?";
        String[] selectionArgs = new String[]{String.valueOf(filterTime)};

        try (Cursor cursor = cr.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                new String[]{Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE},
                selection,
                selectionArgs,
                Telephony.Sms.DATE + " DESC"
        )) {
            if (cursor != null && cursor.moveToFirst()) {
                int addressIdx = cursor.getColumnIndex(Telephony.Sms.ADDRESS);
                int bodyIdx = cursor.getColumnIndex(Telephony.Sms.BODY);
                int dateIdx = cursor.getColumnIndex(Telephony.Sms.DATE);

                int count = 0;
                do {
                    String address = cursor.getString(addressIdx);
                    String body = cursor.getString(bodyIdx);
                    long dateMillis = cursor.getLong(dateIdx);

                    JSONObject obj = new JSONObject();
                    obj.put("address", address != null ? address : "");
                    obj.put("body", body != null ? body : "");
                    obj.put("date", new java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.US).format(new java.util.Date(dateMillis)));
                    array.put(obj);

                    count++;
                    if (count >= 300) break; // Limit to recent 300 SMS for speed
                } while (cursor.moveToNext());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return array.toString();
    }

    public static void openAppSettings(Context context) {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", context.getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        context.startActivity(intent);
    }
}
