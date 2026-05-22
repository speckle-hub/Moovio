package com.example.data.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val tmdbId: String,
    val title: String,
    val posterPath: String,
    val rating: Double, // Rating
    val isTvShow: Boolean,
    val addedAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "watch_history")
data class HistoryEntity(
    @PrimaryKey val tmdbId: String,
    val title: String,
    val posterPath: String,
    val isTvShow: Boolean,
    val season: Int = 1,
    val episode: Int = 1,
    val progressPercent: Float = 0.0f,
    val timestamp: Long = System.currentTimeMillis()
)
