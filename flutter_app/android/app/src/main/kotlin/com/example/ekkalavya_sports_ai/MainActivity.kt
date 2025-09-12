package com.example.ekkalavya_sports_ai

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.example.ekkalavya_sports_ai/native"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler {
            call, result ->
            when (call.method) {
                "getDeviceInfo" -> {
                    val deviceInfo = mapOf(
                        "manufacturer" to android.os.Build.MANUFACTURER,
                        "model" to android.os.Build.MODEL,
                        "version" to android.os.Build.VERSION.RELEASE
                    )
                    result.success(deviceInfo)
                }
                "requestPermissions" -> {
                    // Handle permission requests if needed
                    result.success(true)
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }
}