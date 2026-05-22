package com.example.ui.components

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.pm.ActivityInfo
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.ObsidianAbyss

@Composable
fun VideoPlayerWebView(
    url: String,
    modifier: Modifier = Modifier,
    onClose: () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val activity = context.findActivity()

    // 1. Remember custom WebChromeClient to manage fullscreen custom view safely
    val customChromeClient = remember {
        object : WebChromeClient() {
            var customView: View? = null
            var customViewCallback: CustomViewCallback? = null
            var originalSystemUiVisibility = 0

            override fun onShowCustomView(view: View, callback: CustomViewCallback) {
                if (activity == null || activity.isFinishing || activity.isDestroyed) {
                    try {
                        callback.onCustomViewHidden()
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    return
                }
                if (customView != null) {
                    onHideCustomView()
                    return
                }

                customViewCallback = callback
                originalSystemUiVisibility = activity.window?.decorView?.systemUiVisibility ?: 0

                try {
                    activity.window?.decorView?.systemUiVisibility = (
                        View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                        View.SYSTEM_UI_FLAG_FULLSCREEN or
                        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    )
                } catch (e: Exception) {
                    e.printStackTrace()
                }

                try {
                    // Detach view from any existing parent first to prevent IllegalStateException
                    val parentView = view.parent as? ViewGroup
                    parentView?.removeView(view)

                    val decorView = activity.window?.decorView as? ViewGroup
                    val container = FrameLayout(context).apply {
                        setBackgroundColor(Color.BLACK)
                        addView(
                            view,
                            FrameLayout.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                        )
                    }
                    decorView?.addView(
                        container,
                        ViewGroup.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                    )
                    customView = container
                } catch (e: Exception) {
                    e.printStackTrace()
                    try {
                        callback.onCustomViewHidden()
                    } catch (ex: Exception) {
                        ex.printStackTrace()
                    }
                }
            }

            override fun onHideCustomView() {
                if (activity == null) return
                val decorView = activity.window?.decorView as? ViewGroup
                customView?.let {
                    try {
                        if (it is ViewGroup) {
                            it.removeAllViews()
                        }
                        decorView?.removeView(it)
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }
                customView = null

                if (!activity.isFinishing && !activity.isDestroyed) {
                    try {
                        activity.window?.decorView?.systemUiVisibility = originalSystemUiVisibility
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }

                try {
                    customViewCallback?.onCustomViewHidden()
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                customViewCallback = null
            }
        }
    }

    // 2. Remember a single WebView instance across composition lifecycle
    val webView = remember {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.BLACK)

            // Configure web settings safely
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                mediaPlaybackRequiresUserGesture = false
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                useWideViewPort = true
                loadWithOverviewMode = true
                cacheMode = WebSettings.LOAD_DEFAULT
                javaScriptCanOpenWindowsAutomatically = false
                setSupportMultipleWindows(false)
            }

            // Remove WebView restrictions from User-Agent to render standard mobile players
            try {
                val defaultUserAgent = settings.userAgentString
                val customUserAgent = defaultUserAgent
                    ?.replace("; wv)", ")")
                    ?.replace("Version/4.0 ", "")
                if (customUserAgent != null) {
                    settings.userAgentString = customUserAgent
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            // Enable third-party cookies for cross-origin stream session tokens
            try {
                val cookieManager = android.webkit.CookieManager.getInstance()
                cookieManager.setAcceptCookie(true)
                cookieManager.setAcceptThirdPartyCookies(this, true)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            webViewClient = object : WebViewClient() {
                private fun isAdOrRedirectUrl(targetUrl: String?): Boolean {
                    if (targetUrl.isNullOrEmpty()) return true
                    
                    val parsedUri = try {
                        android.net.Uri.parse(targetUrl)
                    } catch (e: Exception) {
                        return true
                    }
                    
                    val scheme = parsedUri.scheme
                    // Safe guard against non-http/https/about crashes (like intent:// schemes, market://, mailto:, tel:)
                    if (scheme != null && scheme != "http" && scheme != "https" && scheme != "about") {
                        return true
                    }
                    
                    val host = parsedUri.host ?: ""
                    val path = parsedUri.path ?: ""

                    // Block known intrusive ad/tracker networks & redirects
                    val adKeywords = listOf(
                        "adsterra", "adclick", "popunder", "onclick", "doubleclick",
                        "adsystem", "adservice", "adskeeper", "juicyads", "exoclick",
                        "propeller", "bet", "casino", "yandex", "mgid", "outbrain",
                        "taboola", "clickund", "popads", "popcash", "push", "ad避",
                        "coinhive"
                    )
                    
                    for (keyword in adKeywords) {
                        if (host.contains(keyword, ignoreCase = true) || path.contains(keyword, ignoreCase = true)) {
                            return true
                        }
                    }
                    
                    return false
                }

                @Deprecated("Deprecated in Java")
                override fun shouldOverrideUrlLoading(view: WebView, urlStr: String): Boolean {
                    if (isAdOrRedirectUrl(urlStr)) {
                        return true // Block ads
                    }
                    return false
                }

                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    if (!request.isForMainFrame) {
                        return false // Allow nested player iframes & CDNs to load natively
                    }
                    
                    val requestUrl = request.url.toString()
                    if (isAdOrRedirectUrl(requestUrl)) {
                        return true // Block popup / redirect ad navigation
                    }
                    
                    return false
                }
            }

            webChromeClient = customChromeClient
        }
    }

    // 3. Load the URL when it changes
    DisposableEffect(url) {
        try {
            webView.onResume()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        try {
            webView.resumeTimers()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        webView.loadUrl(url)
        onDispose {
            try {
                webView.stopLoading()
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // 4. Handle clean teardown of WebView when the screen leaves composition
    DisposableEffect(Unit) {
        onDispose {
            // Safe cleanup of custom full screen views
            try {
                customChromeClient.onHideCustomView()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                webView.onPause()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                webView.pauseTimers()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                webView.stopLoading()
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                webView.loadUrl("about:blank")
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            // Safely detach WebView from its parent first
            val parent = webView.parent as? ViewGroup
            try {
                parent?.removeView(webView)
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                webView.clearHistory()
            } catch (e: Exception) {
                e.printStackTrace()
            }
            
            // Critical warning: Never call webView.destroy() here. Doing so causes native crashes during 
            // AnimatedContent transitions because parent layout hierarchies may process the detached 
            // WebView container asynchronously. Let the Garbage Collector clean up the WebView safely.
        }
    }

    // Custom back click handling: exit fullscreen or close the stream
    BackHandler {
        onClose()
    }

    // Elegant Dark Theatre Backdrop
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(ObsidianAbyss),
        contentAlignment = Alignment.Center
    ) {
        AndroidView(
            factory = { webView },
            modifier = Modifier.fillMaxSize()
        )
    }
}

// Tailored recursive helper to resolve holding activity from Context
fun Context.findActivity(): Activity? {
    var currContext = this
    while (currContext is ContextWrapper) {
        if (currContext is Activity) return currContext
        currContext = currContext.baseContext
    }
    return null
}
