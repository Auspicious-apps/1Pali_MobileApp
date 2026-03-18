package com.onepali

import android.app.PendingIntent
import android.content.ClipData
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import java.io.File

class NativeShareModule(reactContext: ReactApplicationContext) : 
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    init {
        // Register the listener to detect when the app comes to foreground
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String = "NativeShare"

    companion object {
        private var sharePromise: Promise? = null
        private var isShareInProgress = false

        fun onShareSuccess(packageName: String) {
            sharePromise?.resolve(packageName)
            sharePromise = null
            isShareInProgress = false
        }
    }

    @ReactMethod
    fun shareWithCallback(filePath: String, title: String, message: String, promise: Promise) {
        // Clean up any pending promise if user starts a new share
        if (sharePromise != null) {
            sharePromise?.reject("NEW_SHARE_STARTED", "Another share process started")
        }
        
        sharePromise = promise
        val context = reactApplicationContext

        try {
            val cleanPath = filePath.replace("file://", "")
            val file = File(cleanPath)
            
            val contentUri: Uri = FileProvider.getUriForFile(
                context,
                "${context.packageName}.provider",
                file
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "image/png"
                putExtra(Intent.EXTRA_STREAM, contentUri)
                putExtra(Intent.EXTRA_TEXT, message)
                putExtra(Intent.EXTRA_SUBJECT, title)
                clipData = ClipData.newRawUri("Art Image", contentUri)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val receiverIntent = Intent(context, ShareReceiver::class.java)
            val pendingIntent = PendingIntent.getBroadcast(
                context, 
                163, 
                receiverIntent, 
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
            )

            val chooser = Intent.createChooser(shareIntent, title, pendingIntent.intentSender)
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            
            // Mark share as active
            isShareInProgress = true
            context.startActivity(chooser)

        } catch (e: Exception) {
            promise.reject("SHARE_ERROR", e.message)
            sharePromise = null
            isShareInProgress = false
        }
    }

    // --- Lifecycle Methods ---

    override fun onHostResume() {
        // If the user is back in the app and sharePromise is still active, they cancelled.
        if (isShareInProgress) {
            // We use a small delay because sometimes Resume fires right before Success
            Handler(Looper.getMainLooper()).postDelayed({
                if (sharePromise != null) {
                    sharePromise?.reject("USER_CANCELLED", "User closed the share sheet")
                    sharePromise = null
                    isShareInProgress = false
                }
            }, 500)
        }
    }

    override fun onHostPause() {
        // App is in background (the share sheet is open)
    }

    override fun onHostDestroy() {
        sharePromise = null
    }
}