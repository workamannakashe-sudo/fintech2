package com.example

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import com.budgetmitra.app.SmsReaderPlugin
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

class MainActivity : ComponentActivity() {

    private val TAG = "BudgetMitraWeb"
    private lateinit var webView: WebView

    private val requestSmsPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { isGranted ->
            webView.evaluateJavascript(
                "window.dispatchEvent(new CustomEvent('sms_permission_result', { detail: { granted: $isGranted } }));",
                null
            )
        }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Light background matching BudgetMitra canvas to avoid white flash
        window.decorView.setBackgroundColor(Color.parseColor("#F8F9FA"))

        webView = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#F8F9FA"))
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
                loadWithOverviewMode = true
                useWideViewPort = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }

            // JavaScript Bridge Interface for native calls
            addJavascriptInterface(AndroidNativeBridge(), "AndroidBridge")

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                    if (consoleMessage != null) {
                        Log.d(TAG, "JS [${consoleMessage.messageLevel()}]: ${consoleMessage.message()} (Line ${consoleMessage.lineNumber()} in ${consoleMessage.sourceId()})")
                    }
                    return super.onConsoleMessage(consoleMessage)
                }
            }

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false
                    // Intercept external WhatsApp or UPI intents
                    if (url.startsWith("whatsapp://") || url.startsWith("https://wa.me/") || url.startsWith("upi://")) {
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                            startActivity(intent)
                            return true
                        } catch (e: Exception) {
                            // If WhatsApp not installed, open fallback share sheet
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, url)
                                type = "text/plain"
                            }
                            startActivity(Intent.createChooser(sendIntent, "Share via"))
                            return true
                        }
                    }
                    return false
                }

                override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
                    val url = request?.url ?: return null
                    val path = url.path ?: return null

                    // If request is looking for assets (e.g. /assets/foo.js or ./assets/foo.js)
                    if (path.contains("/assets/") || path.endsWith(".js") || path.endsWith(".css") || path.endsWith(".svg") || path.endsWith(".html")) {
                        val assetPath = when {
                            path.contains("/public/") -> path.substringAfter("/public/")
                            path.startsWith("/assets/") -> "assets" + path.substring("/assets".length)
                            path.startsWith("/") -> path.substring(1)
                            else -> path
                        }

                        val fullAssetPath = "public/$assetPath"
                        try {
                            val inputStream: InputStream = assets.open(fullAssetPath)
                            val mimeType = when {
                                path.endsWith(".html") -> "text/html"
                                path.endsWith(".js") || path.endsWith(".mjs") -> "application/javascript"
                                path.endsWith(".css") -> "text/css"
                                path.endsWith(".svg") -> "image/svg+xml"
                                path.endsWith(".png") -> "image/png"
                                path.endsWith(".json") -> "application/json"
                                path.endsWith(".woff2") -> "font/woff2"
                                else -> "application/octet-stream"
                            }

                            val response = WebResourceResponse(mimeType, "UTF-8", inputStream)
                            response.responseHeaders = mapOf(
                                "Access-Control-Allow-Origin" to "*",
                                "Cache-Control" to "no-cache"
                            )
                            return response
                        } catch (e: Exception) {
                            Log.w(TAG, "Asset not found: $fullAssetPath ($e)")
                        }
                    }

                    return super.shouldInterceptRequest(view, request)
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    super.onReceivedError(view, request, error)
                    Log.e(TAG, "WebView error: ${error?.description} for ${request?.url}")
                }
            }
        }

        setContentView(webView)

        // Handle Back button
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        // Load bundled web app
        webView.loadUrl("file:///android_asset/public/index.html")
    }

    inner class AndroidNativeBridge {
        @JavascriptInterface
        fun hasSmsPermission(): Boolean {
            return SmsReaderPlugin.hasSmsPermission(this@MainActivity)
        }

        @JavascriptInterface
        fun requestSmsPermission() {
            requestSmsPermissionLauncher.launch(Manifest.permission.READ_SMS)
        }

        @JavascriptInterface
        fun getSmsListJson(daysBack: Int): String {
            return SmsReaderPlugin.getMessagesJson(this@MainActivity, daysBack)
        }

        @JavascriptInterface
        fun openAppSettings() {
            SmsReaderPlugin.openAppSettings(this@MainActivity)
        }

        @JavascriptInterface
        fun shareViaWhatsApp(text: String): Boolean {
            return try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse("whatsapp://send?text=" + Uri.encode(text)))
                startActivity(intent)
                true
            } catch (e: Exception) {
                val sendIntent = Intent().apply {
                    action = Intent.ACTION_SEND
                    putExtra(Intent.EXTRA_TEXT, text)
                    type = "text/plain"
                }
                startActivity(Intent.createChooser(sendIntent, "BudgetMitra Bill Split"))
                true
            }
        }

        @JavascriptInterface
        fun shareBillPdf(base64Data: String, filename: String): Boolean {
            return try {
                val decoded = android.util.Base64.decode(
                    base64Data.substringAfter("base64,"),
                    android.util.Base64.DEFAULT
                )
                val cacheFile = File(cacheDir, filename)
                FileOutputStream(cacheFile).use { it.write(decoded) }

                val fileUri = FileProvider.getUriForFile(
                    this@MainActivity,
                    "${packageName}.fileprovider",
                    cacheFile
                )

                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, fileUri)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                startActivity(Intent.createChooser(intent, "Share Bill PDF"))
                true
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }
}
