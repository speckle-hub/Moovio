package com.example.data.network

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class TmdbListResponse<T>(
    @Json(name = "results") val results: List<T>
)

@JsonClass(generateAdapter = true)
data class TmdbMovie(
    @Json(name = "id") val id: Long,
    @Json(name = "title") val title: String,
    @Json(name = "overview") val overview: String?,
    @Json(name = "poster_path") val posterPath: String?,
    @Json(name = "backdrop_path") val backdropPath: String?,
    @Json(name = "vote_average") val voteAverage: Double?,
    @Json(name = "release_date") val releaseDate: String?,
    @Json(name = "genre_ids") val genreIds: List<Int>?
)

@JsonClass(generateAdapter = true)
data class TmdbTv(
    @Json(name = "id") val id: Long,
    @Json(name = "name") val name: String,
    @Json(name = "overview") val overview: String?,
    @Json(name = "poster_path") val posterPath: String?,
    @Json(name = "backdrop_path") val backdropPath: String?,
    @Json(name = "vote_average") val voteAverage: Double?,
    @Json(name = "first_air_date") val firstAirDate: String?,
    @Json(name = "genre_ids") val genreIds: List<Int>?
)

@JsonClass(generateAdapter = true)
data class TmdbMovieDetail(
    @Json(name = "id") val id: Long,
    @Json(name = "title") val title: String,
    @Json(name = "overview") val overview: String?,
    @Json(name = "poster_path") val posterPath: String?,
    @Json(name = "backdrop_path") val backdropPath: String?,
    @Json(name = "vote_average") val voteAverage: Double?,
    @Json(name = "release_date") val releaseDate: String?,
    @Json(name = "genres") val genres: List<TmdbGenre>?
)

@JsonClass(generateAdapter = true)
data class TmdbTvDetail(
    @Json(name = "id") val id: Long,
    @Json(name = "name") val name: String,
    @Json(name = "overview") val overview: String?,
    @Json(name = "poster_path") val posterPath: String?,
    @Json(name = "backdrop_path") val backdropPath: String?,
    @Json(name = "vote_average") val voteAverage: Double?,
    @Json(name = "first_air_date") val firstAirDate: String?,
    @Json(name = "genres") val genres: List<TmdbGenre>?,
    @Json(name = "number_of_seasons") val numberOfSeasons: Int?
)

@JsonClass(generateAdapter = true)
data class TmdbGenre(
    @Json(name = "id") val id: Int,
    @Json(name = "name") val name: String
)
