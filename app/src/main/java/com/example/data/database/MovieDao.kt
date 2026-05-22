package com.example.data.database

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface MovieDao {
    // Favorites Queries
    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    fun getAllFavorites(): Flow<List<FavoriteEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFavorite(favorite: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE tmdbId = :tmdbId")
    suspend fun deleteFavoriteById(tmdbId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE tmdbId = :tmdbId LIMIT 1)")
    fun isFavoriteFlow(tmdbId: String): Flow<Boolean>

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE tmdbId = :tmdbId LIMIT 1)")
    suspend fun isFavoriteDirect(tmdbId: String): Boolean

    // Watch History Queries
    @Query("SELECT * FROM watch_history ORDER BY timestamp DESC")
    fun getAllHistory(): Flow<List<HistoryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertHistory(history: HistoryEntity)

    @Query("DELETE FROM watch_history WHERE tmdbId = :tmdbId")
    suspend fun deleteHistoryById(tmdbId: String)

    @Query("DELETE FROM watch_history")
    suspend fun clearHistory()
}
