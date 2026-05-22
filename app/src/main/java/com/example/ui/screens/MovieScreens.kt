package com.example.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.animation.core.spring
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.data.database.FavoriteEntity
import com.example.data.database.HistoryEntity
import com.example.data.model.MediaItem
import com.example.ui.components.VideoPlayerWebView
import com.example.ui.theme.*
import com.example.ui.viewmodel.MovieViewModel

// Sealed Hierarchy for Lightweight and Robust Screen Navigation
sealed class Screen {
    object Home : Screen()
    object Profile : Screen()
    data class Details(val tmdbId: String) : Screen()
    data class Player(val url: String) : Screen()
}

@OptIn(ExperimentalAnimationApi::class)
@Composable
fun MoovioAppContainer(viewModel: MovieViewModel) {
    // Elegant system state controller
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
    val screenBackStack = remember { mutableStateListOf<Screen>(Screen.Home) }

    fun navigateTo(screen: Screen) {
        if (screen is Screen.Home) {
            screenBackStack.clear()
            screenBackStack.add(Screen.Home)
            currentScreen = Screen.Home
        } else if (screen is Screen.Profile) {
            screenBackStack.clear()
            screenBackStack.add(Screen.Home)
            screenBackStack.add(Screen.Profile)
            currentScreen = Screen.Profile
        } else {
            screenBackStack.add(screen)
            currentScreen = screen
        }
    }

    fun navigateBack() {
        if (screenBackStack.size > 1) {
            screenBackStack.removeAt(screenBackStack.size - 1)
            currentScreen = screenBackStack.last()
        }
    }

    // Capture system back buttons/gestures to cleanly return within local navigation stack
    BackHandler(enabled = screenBackStack.size > 1) {
        navigateBack()
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = ObsidianAbyss,
        bottomBar = {
            if (currentScreen is Screen.Home || currentScreen is Screen.Profile) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        modifier = Modifier
                            .clip(RoundedCornerShape(32.dp))
                            .background(TranslucentGlassCard.copy(alpha = 0.85f))
                            .border(1.dp, GlassBorder, RoundedCornerShape(32.dp))
                            .padding(horizontal = 10.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        val isHome = currentScreen is Screen.Home
                        val isProfile = currentScreen is Screen.Profile

                        // Home Glass Capsule Tab
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(24.dp))
                                .background(if (isHome) AmberGold.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable { navigateTo(Screen.Home) }
                                .padding(horizontal = 20.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = if (isHome) Icons.Filled.Home else Icons.Outlined.Home,
                                contentDescription = "Home",
                                tint = if (isHome) AmberGold else CoolGray,
                                modifier = Modifier.size(24.dp)
                            )
                            AnimatedVisibility(
                                visible = isHome,
                                enter = fadeIn() + expandHorizontally(),
                                exit = fadeOut() + shrinkHorizontally()
                            ) {
                                Row {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Home",
                                        color = AmberGold,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        maxLines = 1
                                    )
                                }
                            }
                        }

                        // Profile Glass Capsule Tab
                        Row(
                            modifier = Modifier
                                .clip(RoundedCornerShape(24.dp))
                                .background(if (isProfile) AmberGold.copy(alpha = 0.2f) else Color.Transparent)
                                .clickable { navigateTo(Screen.Profile) }
                                .padding(horizontal = 20.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = if (isProfile) Icons.Filled.Person else Icons.Outlined.Person,
                                contentDescription = "Profile",
                                tint = if (isProfile) AmberGold else CoolGray,
                                modifier = Modifier.size(24.dp)
                            )
                            AnimatedVisibility(
                                visible = isProfile,
                                enter = fadeIn() + expandHorizontally(),
                                exit = fadeOut() + shrinkHorizontally()
                            ) {
                                Row {
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Profile",
                                        color = AmberGold,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        maxLines = 1
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            AnimatedContent(
                targetState = currentScreen,
                transitionSpec = {
                    slideInHorizontally(
                        initialOffsetX = { 600 },
                        animationSpec = spring(stiffness = 380f)
                    ) + fadeIn() with slideOutHorizontally(
                        targetOffsetX = { -600 },
                        animationSpec = spring(stiffness = 380f)
                    ) + fadeOut()
                },
                label = "MoovioScreenTransition"
            ) { targetScreen ->
                when (targetScreen) {
                    is Screen.Home -> {
                        HomeScreen(
                            viewModel = viewModel,
                            onMediaClick = { tmdbId -> navigateTo(Screen.Details(tmdbId)) },
                            onPlayDirect = { url, media, s, e ->
                                viewModel.recordHistory(media, season = s, episode = e)
                                navigateTo(Screen.Player(url))
                            }
                        )
                    }
                    is Screen.Profile -> {
                        ProfileScreen(
                            viewModel = viewModel,
                            onPlayAdultVideo = { url -> navigateTo(Screen.Player(url)) }
                        )
                    }
                    is Screen.Details -> {
                        DetailsScreen(
                            tmdbId = targetScreen.tmdbId,
                            viewModel = viewModel,
                            onBackClick = { navigateBack() },
                            onPlayClick = { url, media, s, e ->
                                viewModel.recordHistory(media, season = s, episode = e)
                                navigateTo(Screen.Player(url))
                            }
                        )
                    }
                    is Screen.Player -> {
                        VideoPlayerWebView(
                            url = targetScreen.url,
                            onClose = { navigateBack() }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HomeScreen(
    viewModel: MovieViewModel,
    onMediaClick: (String) -> Unit,
    onPlayDirect: (String, MediaItem, Int, Int) -> Unit
) {
    // Observe database and API outputs
    val favorites by viewModel.favoriteItems.collectAsState()
    val watchHistory by viewModel.watchHistoryItems.collectAsState()
    val searchResults by viewModel.searchResults.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val selectedFilter by viewModel.selectedFilter.collectAsState()
    val trendingMovies by viewModel.trendingMovies.collectAsState()
    val popularTVShows by viewModel.popularTVShows.collectAsState()

    // Hero Block Media (resolved reactively from trending list)
    val heroMedia = remember(trendingMovies) {
        trendingMovies.firstOrNull() ?: viewModel.getMediaItem("693134")
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // 1. Premium Brand Header
        item {
            MoovioHeader()
        }

        // 2. Cinematic Hero Banner (Only shown if search query is empty)
        if (searchQuery.isBlank()) {
            item {
                HeroBanner(
                    mediaItem = heroMedia,
                    onMediaClick = onMediaClick,
                    onPlayClick = {
                        val playerUrl = "https://www.vidking.net/embed/movie/${heroMedia.tmdbId}?primaryColor=ff8800&autoplay=true"
                        onPlayDirect(playerUrl, heroMedia, 1, 1)
                    }
                )
            }
        }

        // 3. Search and Content Filtering Segment
        item {
            Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                SearchAndDiscoverPanel(
                    query = searchQuery,
                    onQueryChange = { viewModel.onSearchQueryChanged(it) },
                    selectedFilter = selectedFilter,
                    onFilterChange = { viewModel.onFilterChanged(it) }
                )
            }
        }

        // 4. Content results feed
        if (searchQuery.isNotBlank()) {
            // Grid of search outcomes
            item {
                Text(
                    text = "Search Results (${searchResults.size})",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = PremiumWhite,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                )
            }
            if (searchResults.isEmpty()) {
                item {
                    EmptyDiscoveryState(searchQuery) {
                        // Custom direct stream trigger inside search
                        val customPlayerUrl = if (searchQuery.all { it.isDigit() }) {
                            "https://www.vidking.net/embed/movie/$searchQuery?primaryColor=ff8800&autoplay=true"
                        } else null

                        customPlayerUrl?.let { url ->
                            val dynamicMedia = viewModel.getMediaItem(searchQuery)
                            onPlayDirect(url, dynamicMedia, 1, 1)
                        }
                    }
                }
            } else {
                item {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(110.dp),
                        modifier = Modifier
                            .heightIn(max = 800.dp)
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        items(searchResults) { media ->
                            MediaGridCard(mediaItem = media, onClick = { onMediaClick(media.tmdbId) })
                        }
                    }
                }
            }
        } else {
            // Standard curated Cinematic Dashboard Panels

            // Continue Streaming Row (DB History)
            if (watchHistory.isNotEmpty()) {
                item {
                    ContinueWatchingCarousel(
                        historyList = watchHistory,
                        onPlayClick = { history ->
                            val url = if (history.isTvShow) {
                                "https://www.vidking.net/embed/tv/${history.tmdbId}/${history.season}/${history.episode}?primaryColor=ff8800&autoplay=true"
                            } else {
                                "https://www.vidking.net/embed/movie/${history.tmdbId}?primaryColor=ff8800&autoplay=true"
                            }
                            val media = viewModel.getMediaItem(history.tmdbId)
                            onPlayDirect(url, media, history.season, history.episode)
                        },
                        onDeleteClick = { 
                            viewModel.deleteSpecificHistory(it)
                        }
                    )
                }
            }

            // Trending blockbusters
            item {
                HorizontalMediaCarousel(
                    sectionTitle = "Trending Blockbusters",
                    list = trendingMovies,
                    onMediaClick = onMediaClick
                )
            }

            // TV Series
            item {
                HorizontalMediaCarousel(
                    sectionTitle = "Popular TV Shows",
                    list = popularTVShows,
                    onMediaClick = onMediaClick
                )
            }

            // My Bookmarked Watchlist (DB Favorites)
            item {
                WatchlistCarousel(
                    watchlist = favorites,
                    onMediaClick = onMediaClick,
                    onEmptyInfo = {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(TranslucentGlassCard)
                                .border(1.dp, GlassBorder, RoundedCornerShape(12.dp))
                                .padding(24.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(
                                    imageVector = Icons.Outlined.BookmarkBorder,
                                    contentDescription = null,
                                    tint = CoolGray,
                                    modifier = Modifier.size(32.dp)
                                )
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "Your Watchlist is empty",
                                    color = PremiumWhite,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Bookmarked movies will appear here for fast streaming.",
                                    color = CoolGray,
                                    fontSize = 12.sp,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                )
            }
        }

        // 5. Aesthetic Footer Padding
        item {
            Box(modifier = Modifier.height(48.dp))
        }
    }
}

@Composable
fun MoovioHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Gold Gradient Logo
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(AmberGold, CoralFlame)
                        )
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Filled.PlayArrow,
                    contentDescription = "Moovio Play logo",
                    tint = ObsidianAbyss,
                    modifier = Modifier.size(24.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "Moovio",
                fontSize = 24.sp,
                fontWeight = FontWeight.Black,
                color = PremiumWhite,
                letterSpacing = 0.5.sp
            )
        }

        // Cinematic badge
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(20.dp))
                .background(TranslucentGlassCard)
                .border(1.dp, AmberGold.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                .padding(horizontal = 12.dp, vertical = 6.dp)
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(AmberGold)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "PREMIUM STREAM",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    color = AmberGold
                )
            }
        }
    }
}

@Composable
fun HeroBanner(
    mediaItem: MediaItem,
    onMediaClick: (String) -> Unit,
    onPlayClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(340.dp)
            .padding(horizontal = 16.dp)
            .clip(RoundedCornerShape(24.dp))
            .clickable { onMediaClick(mediaItem.tmdbId) }
    ) {
        // High-Quality backdrop loaded via Coil
        AsyncImage(
            model = ImageRequest.Builder(LocalContext.current)
                .data(mediaItem.backdropPath)
                .crossfade(true)
                .build(),
            contentDescription = mediaItem.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )

        // Dark ambient overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            ObsidianAbyss.copy(alpha = 0.5f),
                            ObsidianAbyss
                        )
                    )
                )
        )

        // Banner Metadata and Action buttons
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.Bottom
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(CoralFlame)
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "FEATURED MOVIE",
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = PremiumWhite
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = mediaItem.title,
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = PremiumWhite,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = mediaItem.overview,
                fontSize = 12.sp,
                color = CoolGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                lineHeight = 16.sp
            )
            Spacer(modifier = Modifier.height(14.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Gold Stream Button
                Button(
                    onClick = onPlayClick,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AmberGold,
                        contentColor = ObsidianAbyss
                    ),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 20.dp, vertical = 10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.PlayArrow,
                        contentDescription = "Watch now",
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("STREAM NOW", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Detail indicator icon
                Surface(
                    onClick = { onMediaClick(mediaItem.tmdbId) },
                    shape = RoundedCornerShape(12.dp),
                    color = TranslucentGlassCard,
                    border = BorderStroke(1.dp, GlassBorder)
                ) {
                    Box(modifier = Modifier.padding(10.dp)) {
                        Icon(
                            imageVector = Icons.Outlined.Info,
                            contentDescription = "View detail",
                            tint = PremiumWhite,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SearchAndDiscoverPanel(
    query: String,
    onQueryChange: (String) -> Unit,
    selectedFilter: MovieViewModel.ContentFilter,
    onFilterChange: (MovieViewModel.ContentFilter) -> Unit
) {
    Column {
        // Modern Pill Search Bar
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(30.dp))
                .background(TranslucentGlassCard)
                .border(1.dp, GlassBorder, RoundedCornerShape(30.dp)),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color.Transparent,
                unfocusedBorderColor = Color.Transparent,
                focusedTextColor = PremiumWhite,
                unfocusedTextColor = PremiumWhite,
                focusedLabelColor = AmberGold,
                unfocusedLabelColor = CoolGray,
                unfocusedPlaceholderColor = CoolGray
            ),
            shape = RoundedCornerShape(30.dp),
            placeholder = { Text("Search movies, series, or input TMDB ID...") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Outlined.Search,
                    contentDescription = null,
                    tint = AmberGold
                )
            },
            trailingIcon = {
                if (query.isNotBlank()) {
                    IconButton(onClick = { onQueryChange("") }) {
                        Icon(
                            imageVector = Icons.Filled.Close,
                            contentDescription = "Clear search",
                            tint = CoolGray
                        )
                    }
                }
            },
            singleLine = true
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Tab Filter Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            MovieViewModel.ContentFilter.values().forEach { filter ->
                val isSelected = filter == selectedFilter
                val label = when (filter) {
                    MovieViewModel.ContentFilter.ALL -> "Explore"
                    MovieViewModel.ContentFilter.MOVIES -> "Movies"
                    MovieViewModel.ContentFilter.TV_SHOWS -> "TV Shows"
                }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (isSelected) AmberGold else TranslucentGlassCard)
                        .border(
                            1.dp,
                            if (isSelected) NeonGlow else GlassBorder,
                            RoundedCornerShape(12.dp)
                        )
                        .clickable { onFilterChange(filter) }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isSelected) ObsidianAbyss else PremiumWhite
                    )
                }
            }
        }
    }
}

@Composable
fun EmptyDiscoveryState(query: String, onLaunchCustomClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(TranslucentGlassCard)
            .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Icon(
                imageVector = Icons.Outlined.LiveTv,
                contentDescription = null,
                tint = AmberGold,
                modifier = Modifier.size(44.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "No curated results for \"$query\"",
                color = PremiumWhite,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "However, you can dynamically stream this ID directly! Let's query your link inside Moovio container.",
                color = CoolGray,
                fontSize = 11.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            // If query is a pure number, provide immediate instant stream trigger
            if (query.all { it.isDigit() } && query.isNotBlank()) {
                Spacer(modifier = Modifier.height(16.dp))
                Button(
                    onClick = onLaunchCustomClick,
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AmberGold,
                        contentColor = ObsidianAbyss
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Filled.Tv,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("STREAM ID $query ON VIDKING", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun HorizontalMediaCarousel(
    sectionTitle: String,
    list: List<MediaItem>,
    onMediaClick: (String) -> Unit
) {
    Column {
        Text(
            text = sectionTitle,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = PremiumWhite,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(list) { item ->
                MediaCarouselCard(mediaItem = item, onClick = { onMediaClick(item.tmdbId) })
            }
        }
    }
}

@Composable
fun MediaCarouselCard(mediaItem: MediaItem, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .width(115.dp)
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .width(115.dp)
                .height(170.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(TranslucentGlassCard)
                .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
        ) {
            AsyncImage(
                model = ImageRequest.Builder(LocalContext.current)
                    .data(mediaItem.posterPath)
                    .crossfade(true)
                    .build(),
                contentDescription = mediaItem.title,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize()
            )

            // Dynamic rating badge overlay
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color.Black.copy(alpha = 0.75f))
                    .padding(horizontal = 5.dp, vertical = 2.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Filled.Star,
                        contentDescription = "Rating icon",
                        tint = AmberGold,
                        modifier = Modifier.size(10.dp)
                    )
                    Spacer(modifier = Modifier.width(2.dp))
                    Text(
                        text = mediaItem.rating.toString(),
                        fontSize = 9.sp,
                        color = PremiumWhite,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = mediaItem.title,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            color = PremiumWhite,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = mediaItem.releaseDate.split("-").firstOrNull() ?: "",
            fontSize = 10.sp,
            color = CoolGray,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun MediaGridCard(mediaItem: MediaItem, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Box(
            modifier = Modifier
                .aspectRatio(0.68f)
                .clip(RoundedCornerShape(14.dp))
                .background(TranslucentGlassCard)
                .border(1.dp, GlassBorder, RoundedCornerShape(14.dp))
        ) {
            if (mediaItem.posterPath.isNotBlank()) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(mediaItem.posterPath)
                        .crossfade(true)
                        .build(),
                    contentDescription = mediaItem.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
            } else {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Filled.Stream,
                        contentDescription = null,
                        tint = AmberGold,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = mediaItem.title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = PremiumWhite,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun ContinueWatchingCarousel(
    historyList: List<HistoryEntity>,
    onPlayClick: (HistoryEntity) -> Unit,
    onDeleteClick: (String) -> Unit
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Continue Watching",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = PremiumWhite
            )
        }
        Spacer(modifier = Modifier.height(8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            items(historyList) { history ->
                Box(
                    modifier = Modifier
                        .width(180.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(TranslucentGlassCard)
                        .border(1.dp, GlassBorder, RoundedCornerShape(16.dp))
                        .clickable { onPlayClick(history) }
                ) {
                    Column {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp)
                                .background(TranslucentGlassCard)
                        ) {
                            if (history.posterPath.isNotBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(history.posterPath)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = history.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = Icons.Filled.SlowMotionVideo,
                                        contentDescription = null,
                                        tint = AmberGold
                                    )
                                }
                            }

                            // Dynamic Orange Play Center overlay
                            Box(
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(RoundedCornerShape(18.dp))
                                    .background(AmberGold)
                                    .align(Alignment.Center),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.PlayArrow,
                                    contentDescription = "Resume",
                                    tint = ObsidianAbyss,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // Dismiss Trash overlay icon
                            IconButton(
                                onClick = { onDeleteClick(history.tmdbId) },
                                modifier = Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(4.dp)
                                    .size(24.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color.Black.copy(alpha = 0.5f))
                            ) {
                                Icon(
                                    imageVector = Icons.Filled.Delete,
                                    contentDescription = "Remove history item",
                                    tint = Color.Red,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }

                        // Text block details
                        Column(modifier = Modifier.padding(10.dp)) {
                            Text(
                                text = history.title,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = PremiumWhite,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            val descriptor = if (history.isTvShow) {
                                "Season ${history.season} • Episode ${history.episode}"
                            } else {
                                "Movie Stream"
                            }
                            Text(
                                text = descriptor,
                                fontSize = 10.sp,
                                color = CoolGray,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WatchlistCarousel(
    watchlist: List<FavoriteEntity>,
    onMediaClick: (String) -> Unit,
    onEmptyInfo: @Composable () -> Unit
) {
    Column {
        Text(
            text = "My Watchlist",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = PremiumWhite,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        if (watchlist.isEmpty()) {
            onEmptyInfo()
        } else {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                items(watchlist) { item ->
                    Column(
                        modifier = Modifier
                            .width(105.dp)
                            .clickable { onMediaClick(item.tmdbId) }
                    ) {
                        Box(
                            modifier = Modifier
                                .width(105.dp)
                                .height(150.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(TranslucentGlassCard)
                                .border(1.dp, GlassBorder, RoundedCornerShape(14.dp))
                        ) {
                            if (item.posterPath.isNotBlank()) {
                                AsyncImage(
                                    model = ImageRequest.Builder(LocalContext.current)
                                        .data(item.posterPath)
                                        .crossfade(true)
                                        .build(),
                                    contentDescription = item.title,
                                    contentScale = ContentScale.Crop,
                                    modifier = Modifier.fillMaxSize()
                                )
                            } else {
                                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                                    Icon(Icons.Filled.Web, null)
                                }
                            }
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = item.title,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = PremiumWhite,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun DetailsScreen(
    tmdbId: String,
    viewModel: MovieViewModel,
    onBackClick: () -> Unit,
    onPlayClick: (String, MediaItem, Int, Int) -> Unit
) {
    val mediaItemState = produceState<MediaItem?>(initialValue = null, key1 = tmdbId) {
        value = viewModel.getMediaItemAsync(tmdbId) ?: viewModel.getMediaItem(tmdbId)
    }

    val mediaItem = mediaItemState.value

    if (mediaItem == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(ObsidianAbyss),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = CoralFlame)
        }
        return
    }

    val favorites by viewModel.favoriteItems.collectAsState()
    val isFavorited = remember(favorites) { favorites.any { it.tmdbId == tmdbId } }

    var selectedSeason by remember { mutableStateOf(1) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // Backdrop Hero Header block
        item {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(280.dp)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(mediaItem.backdropPath)
                        .crossfade(true)
                        .build(),
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )

                // Dark fade ambient mask
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.4f),
                                    Color.Transparent,
                                    ObsidianAbyss
                                )
                            )
                        )
                )

                // Back floating trigger
                IconButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.Black.copy(alpha = 0.6f))
                ) {
                    Icon(
                        imageVector = Icons.Filled.ArrowBack,
                        contentDescription = "Back home",
                        tint = PremiumWhite
                    )
                }

                // Bookmark/watchlist toggle trigger
                IconButton(
                    onClick = { viewModel.toggleFavorite(mediaItem) },
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(16.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color.Black.copy(alpha = 0.6f))
                ) {
                    Icon(
                        imageVector = if (isFavorited) Icons.Filled.Bookmark else Icons.Outlined.BookmarkBorder,
                        contentDescription = "Add to Watchlist",
                        tint = if (isFavorited) AmberGold else PremiumWhite
                    )
                }
            }
        }

        // Details metadata and Summary block
        item {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                // Genres block
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    mediaItem.genres.forEach { genre ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(TranslucentGlassCard)
                                .border(1.dp, GlassBorder, RoundedCornerShape(4.dp))
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = genre,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = CoolGray
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(10.dp))

                // Title
                Text(
                    text = mediaItem.title,
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PremiumWhite,
                    lineHeight = 34.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Release Date and Star Rating info
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Filled.Star,
                            contentDescription = null,
                            tint = AmberGold,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${mediaItem.rating} Rating",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = PremiumWhite
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(3.dp)
                            .clip(RoundedCornerShape(1.5f.dp))
                            .background(CoolGray)
                    )

                    Text(
                        text = "Year: ${mediaItem.releaseDate.split("-").firstOrNull() ?: ""}",
                        fontSize = 12.sp,
                        color = CoolGray,
                        fontWeight = FontWeight.Medium
                    )

                    Box(
                        modifier = Modifier
                            .size(3.dp)
                            .clip(RoundedCornerShape(1.5f.dp))
                            .background(CoolGray)
                    )

                    Text(
                        text = if (mediaItem.isTvShow) "TV Show" else "Movie",
                        fontSize = 12.sp,
                        color = AmberGold,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Description overview
                Text(
                    text = "Description",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PremiumWhite
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = mediaItem.overview,
                    fontSize = 14.sp,
                    color = CoolGray,
                    lineHeight = 20.sp
                )
            }
        }

        // Action Trigger panels
        if (!mediaItem.isTvShow) {
            // MOVIE Watch Button
            item {
                Box(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Button(
                        onClick = {
                            val movieUrl = "https://www.vidking.net/embed/movie/${mediaItem.tmdbId}?primaryColor=ff8800&autoplay=true"
                            onPlayClick(movieUrl, mediaItem, 1, 1)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = AmberGold,
                            contentColor = ObsidianAbyss
                        ),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Filled.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "PLAY MOVIE IN HD",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }
        } else {
            // TV SHOW Expansion layout (Season selection and episode list)
            item {
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    // Season tab rows
                    Text(
                        text = "Seasons",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PremiumWhite
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (s in 1..mediaItem.totalSeasons) {
                            val isSelected = s == selectedSeason
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) AmberGold else TranslucentGlassCard)
                                    .border(
                                        1.dp,
                                        if (isSelected) Color.Transparent else GlassBorder,
                                        RoundedCornerShape(8.dp)
                                    )
                                    .clickable { selectedSeason = s }
                                    .padding(horizontal = 16.dp, vertical = 8.dp)
                            ) {
                                Text(
                                    text = "Season $s",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) ObsidianAbyss else PremiumWhite
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Episode select grid list
                    Text(
                        text = "Episodes",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PremiumWhite
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        for (e in 1..mediaItem.episodesPerSeason) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(TranslucentGlassCard)
                                    .border(1.dp, GlassBorder, RoundedCornerShape(12.dp))
                                    .clickable {
                                        val epPlayerUrl = "https://www.vidking.net/embed/tv/${mediaItem.tmdbId}/$selectedSeason/$e?primaryColor=ff8800&autoplay=true"
                                        onPlayClick(epPlayerUrl, mediaItem, selectedSeason, e)
                                    }
                                    .padding(horizontal = 14.dp, vertical = 12.dp)
                                    .fillMaxWidth(0.48f) // Two items per row, taking full available constraint
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Column {
                                        Text(
                                            text = "Episode $e",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = PremiumWhite
                                        )
                                        Text(
                                            text = "Stream HD Feed",
                                            fontSize = 10.sp,
                                            color = AmberGold,
                                            fontWeight = FontWeight.SemiBold
                                        )
                                    }
                                    Icon(
                                        imageVector = Icons.Filled.PlayArrow,
                                        contentDescription = "Play Episode",
                                        tint = AmberGold,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Padding
        item {
            Box(modifier = Modifier.height(32.dp))
        }
    }
}
