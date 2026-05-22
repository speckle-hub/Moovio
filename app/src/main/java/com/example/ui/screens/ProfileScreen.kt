package com.example.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.data.model.MediaItem
import com.example.ui.theme.*
import com.example.ui.viewmodel.MovieViewModel

import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    viewModel: MovieViewModel,
    onPlayAdultVideo: (String) -> Unit
) {
    val isAdultEnabled by viewModel.adultContentEnabled.collectAsState()

    val adultVideos = listOf(
        MediaItem(
            "adult_1", "Secret Confessions", "https://www.eporner.com/embed/3n2c0x1SjX6/",
            "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            0.0, "", emptyList(), false
        ),
        MediaItem(
            "adult_2", "Late Night Tales", "https://www.eporner.com/embed/5D3B8Jt315p/",
            "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            0.0, "", emptyList(), false
        ),
        MediaItem(
            "adult_3", "Midnight Passions", "https://www.eporner.com/embed/7Vv9gH4S3O1/",
            "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg", "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            0.0, "", emptyList(), false
        )
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianAbyss),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Profile Header
        item {
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(modifier = Modifier.height(32.dp))
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .background(TranslucentGlassCard)
                        .border(1.dp, GlassBorder, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Person,
                        contentDescription = "Profile Avatar",
                        tint = PremiumWhite,
                        modifier = Modifier.size(64.dp)
                    )
                }
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Guest User",
                    color = PremiumWhite,
                    fontWeight = FontWeight.Bold,
                    fontSize = 24.sp
                )
                Text(
                    text = "Premium Plan",
                    color = AmberGold,
                    fontSize = 14.sp
                )
            }
        }

        // Settings Section
        item {
            Text(
                text = "Settings",
                color = PremiumWhite,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            Card(
                colors = CardDefaults.cardColors(containerColor = TranslucentGlassCard),
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, GlassBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Filled.Warning,
                            contentDescription = "Adult Content",
                            tint = CoralFlame,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Adult Content (18+)", color = PremiumWhite, fontWeight = FontWeight.Medium)
                            Text("Enable uncensored streams", color = CoolGray, fontSize = 12.sp)
                        }
                    }
                    Switch(
                        checked = isAdultEnabled,
                        onCheckedChange = { viewModel.toggleAdultContent(it) },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = ObsidianSteel,
                            checkedTrackColor = CoralFlame,
                            uncheckedThumbColor = CoolGray,
                            uncheckedTrackColor = ObsidianSteel
                        )
                    )
                }
            }
        }

        // Adult Section
        if (isAdultEnabled) {
            item {
                Text(
                    text = "Adult Hub (18+)",
                    color = CoralFlame,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(top = 8.dp, bottom = 8.dp)
                )
            }
            
            items(adultVideos) { video ->
                AdultVideoCard(video) {
                    onPlayAdultVideo(video.overview) // Using overview to store url for this mocked item
                }
            }
        }
    }
}

@Composable
fun AdultVideoCard(video: MediaItem, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(180.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, GlassBorder),
        colors = CardDefaults.cardColors(containerColor = TranslucentGlassCard)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            AsyncImage(
                model = video.posterPath,
                contentDescription = video.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                alpha = 0.6f
            )
            Icon(
                imageVector = Icons.Filled.PlayArrow,
                contentDescription = "Play",
                tint = PremiumWhite,
                modifier = Modifier
                    .size(48.dp)
                    .align(Alignment.Center)
            )
            Column(
                modifier = Modifier
                    .align(Alignment.BottomStart)
                    .padding(16.dp)
            ) {
                Text(
                    text = video.title,
                    color = PremiumWhite,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp
                )
                Text(
                    text = "18+ Exclusive",
                    color = CoralFlame,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
