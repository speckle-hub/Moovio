package com.example.data.model

import java.io.Serializable

data class MediaItem(
    val tmdbId: String,
    val title: String,
    val overview: String,
    val posterPath: String,
    val backdropPath: String,
    val rating: Double,
    val releaseDate: String,
    val genres: List<String>,
    val isTvShow: Boolean,
    val totalSeasons: Int = 1,
    val episodesPerSeason: Int = 8
) : Serializable
