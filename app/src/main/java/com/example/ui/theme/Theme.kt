package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val CinematicDarkColorScheme = darkColorScheme(
    primary = AmberGold,
    secondary = DarkAmberGold,
    tertiary = CoralFlame,
    background = ObsidianAbyss,
    surface = SolidObsidian,
    onPrimary = ObsidianAbyss,
    onSecondary = PremiumWhite,
    onBackground = PremiumWhite,
    onSurface = PremiumWhite,
    primaryContainer = ObsidianSteel,
    onPrimaryContainer = PremiumWhite,
    surfaceVariant = TranslucentGlassCard,
    onSurfaceVariant = CoolGray
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    // Keep it luxurious theater dark theme by default
    content: @Composable () -> Unit,
) {
    MaterialTheme(
        colorScheme = CinematicDarkColorScheme,
        typography = Typography,
        content = content
    )
}
