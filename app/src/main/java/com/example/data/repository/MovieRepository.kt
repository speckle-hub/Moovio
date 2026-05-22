package com.example.data.repository

import com.example.data.database.FavoriteEntity
import com.example.data.database.HistoryEntity
import com.example.data.database.MovieDao
import com.example.data.model.MediaItem
import com.example.data.network.TmdbClient
import com.example.data.network.TmdbMovie
import com.example.data.network.TmdbTv
import com.example.data.network.TmdbMovieDetail
import com.example.data.network.TmdbTvDetail
import kotlinx.coroutines.flow.Flow
import java.util.concurrent.ConcurrentHashMap

class MovieRepository(private val movieDao: MovieDao) {

    // Thread-safe in-memory cache for dynamic live items
    private val itemCache = ConcurrentHashMap<String, MediaItem>()

    // Local Cinematic Fallbacks
    val curatedMovies = listOf(
        MediaItem(
            tmdbId = "693134",
            title = "Dune: Part Two",
            overview = "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.",
            posterPath = "https://image.tmdb.org/t/p/w500/czinf86YcZ776WbI0pX24fM7v06.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/xOMoY3vPe00N6j766asbrZ6Cc2Y.jpg",
            rating = 8.3,
            releaseDate = "2024-02-27",
            genres = listOf("Sci-Fi", "Adventure", "Action"),
            isTvShow = false
        ),
        MediaItem(
            tmdbId = "569094",
            title = "Spider-Man: Across the Spider-Verse",
            overview = "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
            posterPath = "https://image.tmdb.org/t/p/w500/8VtBz7j6vY6Yf9eZ88CgOOMu97f.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/4fLZ7m670mX6IE767ptSjuZsRN6.jpg",
            rating = 8.4,
            releaseDate = "2023-05-31",
            genres = listOf("Animation", "Action", "Adventure", "Sci-Fi"),
            isTvShow = false
        ),
        MediaItem(
            tmdbId = "872585",
            title = "Oppenheimer",
            overview = "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
            posterPath = "https://image.tmdb.org/t/p/w500/8Gxv2Z7Pvug847pYLO97ZST1Z2b.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/fm6g0GQQ36as6v6YRL2uTJ0qX3u.jpg",
            rating = 8.1,
            releaseDate = "2023-07-19",
            genres = listOf("Drama", "History", "Biography"),
            isTvShow = false
        ),
        MediaItem(
            tmdbId = "157336",
            title = "Interstellar",
            overview = "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
            posterPath = "https://image.tmdb.org/t/p/w500/gEU2Qv6v3xZgXy2vG8G7e3v8P1d.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/xJHok76gqy68v476LaS6gswYfJe.jpg",
            rating = 8.4,
            releaseDate = "2014-11-05",
            genres = listOf("Sci-Fi", "Drama", "Adventure"),
            isTvShow = false
        ),
        MediaItem(
            tmdbId = "772071",
            title = "Everything Everywhere All at Once",
            overview = "An aging Chinese immigrant is swept up in an insane adventure, in which she alone can save the world by exploring other universes connecting with the lives she could have led.",
            posterPath = "https://image.tmdb.org/t/p/w500/w36H0asv7e6Xorv496696gYSTjh.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/8Zby79Sg76Y6gY6Y7gRAtv086C1.jpg",
            rating = 7.8,
            releaseDate = "2022-03-24",
            genres = listOf("Action", "Sci-Fi", "Comedy"),
            isTvShow = false
        ),
        MediaItem(
            tmdbId = "414906",
            title = "The Batman",
            overview = "In his second year of fighting crime, Batman uncovers corruption in Gotham City that connects to his own family while facing a serial killer known as the Riddler.",
            posterPath = "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T6R9SCD.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/5P8A686pZzkKxl9g9tZg69R9Z9Z.jpg",
            rating = 7.7,
            releaseDate = "2022-03-01",
            genres = listOf("Action", "Crime", "Mystery"),
            isTvShow = false
        )
    )

    val curatedTVShows = listOf(
        MediaItem(
            tmdbId = "119051",
            title = "Wednesday",
            overview = "Wednesday Addams, a student at Nevermore Academy, attempts to master her emerging psychic ability, thwart a monstrous killing spree, and solve the supernatural mystery that embroiled her parents.",
            posterPath = "https://image.tmdb.org/t/p/w500/9PF66ZGL9zW7736pYg6Be60Y9Xl.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/iH9vgo9I0VcfA36Z76Z70ZpBkv6.jpg",
            rating = 8.5,
            releaseDate = "2022-11-23",
            genres = listOf("Mystery", "Comedy", "Fantasy"),
            isTvShow = true,
            totalSeasons = 2,
            episodesPerSeason = 8
        ),
        MediaItem(
            tmdbId = "66732",
            title = "Stranger Things",
            overview = "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
            posterPath = "https://image.tmdb.org/t/p/w500/49Wp6m94TA6j3nmwgJu6OunR2Yg.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/56vT6Gfh7vYEs6gzoESVofm6iNK.jpg",
            rating = 8.6,
            releaseDate = "2016-07-15",
            genres = listOf("Sci-Fi", "Drama", "Mystery"),
            isTvShow = true,
            totalSeasons = 4,
            episodesPerSeason = 9
        ),
        MediaItem(
            tmdbId = "100088",
            title = "The Last of Us",
            overview = "Twenty years after modern civilization has been destroyed, Joel, a hardened survivor, is hired to smuggle Ellie, a 14-year-old girl, out of an oppressive quarantine zone.",
            posterPath = "https://image.tmdb.org/t/p/w500/uKVZ66z0S6S1Ajj7C69866Y6GfD.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/uDgy6hyXN2g7YBFg6gswYeeuZ33.jpg",
            rating = 8.6,
            releaseDate = "2023-01-15",
            genres = listOf("Action", "Adventure", "Drama"),
            isTvShow = true,
            totalSeasons = 1,
            episodesPerSeason = 9
        ),
        MediaItem(
            tmdbId = "112151",
            title = "Sh\u014dgun",
            overview = "In Japan in the year 1600, Lord Yoshii Toranaga struggles for his life as his enemies on the Council of Regents unite against him, when a mysterious European Englishman is found shipwrecked.",
            posterPath = "https://image.tmdb.org/t/p/w500/7O46492m07XALuCc876LIi8gH6t.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/ooAIP7E7U279m7D0Z2Wkdf8W8R8.jpg",
            rating = 8.7,
            releaseDate = "2024-02-27",
            genres = listOf("Drama", "History", "War"),
            isTvShow = true,
            totalSeasons = 1,
            episodesPerSeason = 10
        ),
        MediaItem(
            tmdbId = "126308",
            title = "Fallout",
            overview = "The story of haves and have-nots in a world in which there\u2019s almost nothing left to have. 200 years after the apocalypse, the gentle inhabitants of luxury fallout shelters are forced to return to the hellscape.",
            posterPath = "https://image.tmdb.org/t/p/w500/6vSgC959sS7mFw167mms69u9K8B.jpg",
            backdropPath = "https://image.tmdb.org/t/p/w1280/stSStGfSgS51XnI1pA77hW2v4l5.jpg",
            rating = 8.4,
            releaseDate = "2024-04-10",
            genres = listOf("Action", "Sci-Fi", "Adventure"),
            isTvShow = true,
            totalSeasons = 1,
            episodesPerSeason = 8
        )
    )

    val allCurated = curatedMovies + curatedTVShows

    init {
        // Pre-cache fallbacks so they can always be resolved
        allCurated.forEach { cacheItem(it) }
    }

    private fun cacheItem(item: MediaItem) {
        itemCache[item.tmdbId] = item
    }

    private fun cacheAll(items: List<MediaItem>) {
        items.forEach { cacheItem(it) }
    }

    // Dynamic TMDb APIs

    suspend fun getTrendingMoviesLive(): List<MediaItem> {
        return try {
            val response = TmdbClient.apiService.getTrendingMovies()
            val list = response.results.map { it.toMediaItem() }
            cacheAll(list)
            list.ifEmpty { curatedMovies }
        } catch (e: Exception) {
            e.printStackTrace()
            curatedMovies
        }
    }

    suspend fun getPopularTVShowsLive(): List<MediaItem> {
        return try {
            val response = TmdbClient.apiService.getPopularTVShows()
            val list = response.results.map { it.toMediaItem() }
            cacheAll(list)
            list.ifEmpty { curatedTVShows }
        } catch (e: Exception) {
            e.printStackTrace()
            curatedTVShows
        }
    }

    suspend fun searchLive(query: String): List<MediaItem> {
        if (query.isBlank()) return emptyList()
        return try {
            val movieResponse = TmdbClient.apiService.searchMovies(query)
            val tvResponse = TmdbClient.apiService.searchTVShows(query)
            val movies = movieResponse.results.map { it.toMediaItem() }
            val tvs = tvResponse.results.map { it.toMediaItem() }
            val mergedList = (movies + tvs).sortedByDescending { it.rating }
            cacheAll(mergedList)
            mergedList
        } catch (e: Exception) {
            e.printStackTrace()
            allCurated.filter {
                it.title.contains(query, ignoreCase = true) ||
                it.overview.contains(query, ignoreCase = true)
            }
        }
    }

    suspend fun getMediaItemLive(tmdbId: String): MediaItem? {
        val cached = itemCache[tmdbId]
        if (cached != null) {
            // If it's cached but has isTvShow, and we don't have complete seasons count from detail view
            if (cached.isTvShow && cached.totalSeasons <= 1) {
                return try {
                    val detail = TmdbClient.apiService.getTVDetails(tmdbId.toLong())
                    val refined = detail.toMediaItem()
                    cacheItem(refined)
                    refined
                } catch (e: Exception) {
                    cached
                }
            }
            return cached
        }

        val id = tmdbId.toLongOrNull() ?: return null
        return try {
            val movieDetail = TmdbClient.apiService.getMovieDetails(id)
            val item = movieDetail.toMediaItem()
            cacheItem(item)
            item
        } catch (eMovie: Exception) {
            try {
                val tvDetail = TmdbClient.apiService.getTVDetails(id)
                val item = tvDetail.toMediaItem()
                cacheItem(item)
                item
            } catch (eTv: Exception) {
                null
            }
        }
    }

    // Synchronous find helper (fallback & fast path)
    fun findMediaItem(tmdbId: String): MediaItem {
        return itemCache[tmdbId] ?: allCurated.find { it.tmdbId == tmdbId } ?: MediaItem(
            tmdbId = tmdbId,
            title = "Custom Stream ($tmdbId)",
            overview = "Custom video feed streamed directly via Moovio player.",
            posterPath = "",
            backdropPath = "",
            rating = 8.0,
            releaseDate = "N/A",
            genres = listOf("Stream"),
            isTvShow = false
        )
    }

    // SQLite persistence bridge (Favorites)
    val favorites: Flow<List<FavoriteEntity>> = movieDao.getAllFavorites()

    suspend fun addFavorite(mediaItem: MediaItem) {
        movieDao.insertFavorite(
            FavoriteEntity(
                tmdbId = mediaItem.tmdbId,
                title = mediaItem.title,
                posterPath = mediaItem.posterPath,
                rating = mediaItem.rating,
                isTvShow = mediaItem.isTvShow
            )
        )
        // Also register in-memory in case it wasn't there
        cacheItem(mediaItem)
    }

    suspend fun removeFavorite(tmdbId: String) {
        movieDao.deleteFavoriteById(tmdbId)
    }

    suspend fun isFavorite(tmdbId: String): Boolean {
        return movieDao.isFavoriteDirect(tmdbId)
    }

    // SQLite persistence bridge (Watch History / Continue Watching)
    val watchHistory: Flow<List<HistoryEntity>> = movieDao.getAllHistory()

    suspend fun addWatchHistory(mediaItem: MediaItem, season: Int = 1, episode: Int = 1, progress: Float = 0.0f) {
        movieDao.insertHistory(
            HistoryEntity(
                tmdbId = mediaItem.tmdbId,
                title = mediaItem.title,
                posterPath = mediaItem.posterPath,
                isTvShow = mediaItem.isTvShow,
                season = season,
                episode = episode,
                progressPercent = progress,
                timestamp = System.currentTimeMillis()
            )
        )
        cacheItem(mediaItem)
    }

    suspend fun deleteHistory(tmdbId: String) {
        movieDao.deleteHistoryById(tmdbId)
    }

    suspend fun clearAllHistory() {
        movieDao.clearHistory()
    }

    // DTO mapping extensions

    private fun TmdbMovie.toMediaItem(): MediaItem {
        return MediaItem(
            tmdbId = id.toString(),
            title = title,
            overview = overview ?: "",
            posterPath = posterPath?.let { "https://image.tmdb.org/t/p/w500$it" } ?: "",
            backdropPath = backdropPath?.let { "https://image.tmdb.org/t/p/w1280$it" } ?: "",
            rating = voteAverage ?: 0.0,
            releaseDate = releaseDate ?: "",
            genres = genreIds?.map { getGenreName(it, false) } ?: listOf("Movie"),
            isTvShow = false
        )
    }

    private fun TmdbTv.toMediaItem(): MediaItem {
        return MediaItem(
            tmdbId = id.toString(),
            title = name,
            overview = overview ?: "",
            posterPath = posterPath?.let { "https://image.tmdb.org/t/p/w500$it" } ?: "",
            backdropPath = backdropPath?.let { "https://image.tmdb.org/t/p/w1280$it" } ?: "",
            rating = voteAverage ?: 0.0,
            releaseDate = firstAirDate ?: "",
            genres = genreIds?.map { getGenreName(it, true) } ?: listOf("TV Series"),
            isTvShow = true,
            totalSeasons = 1,
            episodesPerSeason = 10
        )
    }

    private fun TmdbMovieDetail.toMediaItem(): MediaItem {
        return MediaItem(
            tmdbId = id.toString(),
            title = title,
            overview = overview ?: "",
            posterPath = posterPath?.let { "https://image.tmdb.org/t/p/w500$it" } ?: "",
            backdropPath = backdropPath?.let { "https://image.tmdb.org/t/p/w1280$it" } ?: "",
            rating = voteAverage ?: 0.0,
            releaseDate = releaseDate ?: "",
            genres = genres?.map { it.name } ?: listOf("Movie"),
            isTvShow = false
        )
    }

    private fun TmdbTvDetail.toMediaItem(): MediaItem {
        return MediaItem(
            tmdbId = id.toString(),
            title = name,
            overview = overview ?: "",
            posterPath = posterPath?.let { "https://image.tmdb.org/t/p/w500$it" } ?: "",
            backdropPath = backdropPath?.let { "https://image.tmdb.org/t/p/w1280$it" } ?: "",
            rating = voteAverage ?: 0.0,
            releaseDate = firstAirDate ?: "",
            genres = genres?.map { it.name } ?: listOf("TV Series"),
            isTvShow = true,
            totalSeasons = numberOfSeasons ?: 1,
            episodesPerSeason = 10
        )
    }

    private fun getGenreName(id: Int, isTv: Boolean): String {
        return if (isTv) {
            when (id) {
                10759 -> "Action & Adventure"
                16 -> "Animation"
                35 -> "Comedy"
                80 -> "Crime"
                99 -> "Documentary"
                18 -> "Drama"
                10751 -> "Family"
                10762 -> "Kids"
                9648 -> "Mystery"
                10763 -> "News"
                10764 -> "Reality"
                10765 -> "Sci-Fi & Fantasy"
                10766 -> "Soap"
                10767 -> "Talk"
                10768 -> "War & Politics"
                37 -> "Western"
                else -> "TV Show"
            }
        } else {
            when (id) {
                28 -> "Action"
                12 -> "Adventure"
                16 -> "Animation"
                35 -> "Comedy"
                80 -> "Crime"
                99 -> "Documentary"
                18 -> "Drama"
                10751 -> "Family"
                14 -> "Fantasy"
                36 -> "History"
                27 -> "Horror"
                10402 -> "Music"
                9648 -> "Mystery"
                10749 -> "Romance"
                878 -> "Sci-Fi"
                10770 -> "TV Movie"
                53 -> "Thriller"
                10752 -> "War"
                37 -> "Western"
                else -> "Movie"
            }
        }
    }
}
