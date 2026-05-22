package com.example.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.data.database.FavoriteEntity
import com.example.data.database.HistoryEntity
import com.example.data.model.MediaItem
import com.example.data.repository.MovieRepository
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

@OptIn(FlowPreview::class)
class MovieViewModel(private val repository: MovieRepository) : ViewModel() {

    // Filter categories
    enum class ContentFilter { ALL, MOVIES, TV_SHOWS }

    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()

    private val _selectedFilter = MutableStateFlow(ContentFilter.ALL)
    val selectedFilter = _selectedFilter.asStateFlow()

    // Expose curated/live items via StateFlow
    private val _trendingMovies = MutableStateFlow<List<MediaItem>>(repository.curatedMovies)
    val trendingMovies = _trendingMovies.asStateFlow()

    private val _popularTVShows = MutableStateFlow<List<MediaItem>>(repository.curatedTVShows)
    val popularTVShows = _popularTVShows.asStateFlow()

    init {
        loadLiveHomeData()
    }

    private fun loadLiveHomeData() {
        viewModelScope.launch {
            try {
                val trending = repository.getTrendingMoviesLive()
                if (trending.isNotEmpty()) {
                    _trendingMovies.value = trending
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

            try {
                val popular = repository.getPopularTVShowsLive()
                if (popular.isNotEmpty()) {
                    _popularTVShows.value = popular
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    // Observe DB lists reactively
    val favoriteItems: StateFlow<List<FavoriteEntity>> = repository.favorites
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    val watchHistoryItems: StateFlow<List<HistoryEntity>> = repository.watchHistory
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Derived State: Live TMDB Search and category filtering with 300ms debounce
    val searchResults: StateFlow<List<MediaItem>> = _searchQuery
        .debounce(300)
        .combine(_selectedFilter) { query, filter ->
            if (query.isBlank()) {
                emptyList()
            } else {
                val liveList = repository.searchLive(query)
                when (filter) {
                    ContentFilter.ALL -> liveList
                    ContentFilter.MOVIES -> liveList.filter { !it.isTvShow }
                    ContentFilter.TV_SHOWS -> liveList.filter { it.isTvShow }
                }
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun onSearchQueryChanged(newQuery: String) {
        _searchQuery.value = newQuery
    }

    fun onFilterChanged(newFilter: ContentFilter) {
        _selectedFilter.value = newFilter
    }

    // Toggle Favorites action
    fun toggleFavorite(item: MediaItem) {
        viewModelScope.launch {
            val isFav = favoriteItems.value.any { it.tmdbId == item.tmdbId }
            if (isFav) {
                repository.removeFavorite(item.tmdbId)
            } else {
                repository.addFavorite(item)
            }
        }
    }

    // Update Watch History
    fun recordHistory(item: MediaItem, season: Int = 1, episode: Int = 1, progress: Float = 1.0f) {
        viewModelScope.launch {
            repository.addWatchHistory(item, season = season, episode = episode, progress = progress)
        }
    }

    // Clear History
    fun clearHistory() {
        viewModelScope.launch {
            repository.clearAllHistory()
        }
    }

    fun deleteSpecificHistory(tmdbId: String) {
        viewModelScope.launch {
            repository.deleteHistory(tmdbId)
        }
    }

    // Local resolver
    fun getMediaItem(tmdbId: String): MediaItem {
        return repository.findMediaItem(tmdbId)
    }

    // Suspended details fetcher directly from live repo
    suspend fun getMediaItemAsync(tmdbId: String): MediaItem? {
        return repository.getMediaItemLive(tmdbId)
    }
}

// Custom factory pattern for MovieViewModel
class MovieViewModelFactory(private val repository: MovieRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MovieViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MovieViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
