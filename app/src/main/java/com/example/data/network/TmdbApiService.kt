package com.example.data.network

import com.example.BuildConfig
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

interface TmdbApiService {
    @GET("movie/popular")
    suspend fun getPopularMovies(
        @Query("page") page: Int = 1
    ): TmdbListResponse<TmdbMovie>

    @GET("tv/popular")
    suspend fun getPopularTVShows(
        @Query("page") page: Int = 1
    ): TmdbListResponse<TmdbTv>

    @GET("trending/movie/day")
    suspend fun getTrendingMovies(): TmdbListResponse<TmdbMovie>

    @GET("trending/tv/day")
    suspend fun getTrendingTVShows(): TmdbListResponse<TmdbTv>

    @GET("search/movie")
    suspend fun searchMovies(
        @Query("query") query: String
    ): TmdbListResponse<TmdbMovie>

    @GET("search/tv")
    suspend fun searchTVShows(
        @Query("query") query: String
    ): TmdbListResponse<TmdbTv>

    @GET("movie/{movie_id}")
    suspend fun getMovieDetails(
        @Path("movie_id") movieId: Long
    ): TmdbMovieDetail

    @GET("tv/{tv_id}")
    suspend fun getTVDetails(
        @Path("tv_id") tvId: Long
    ): TmdbTvDetail
}

object TmdbClient {
    private const val BASE_URL = "https://api.themoviedb.org/3/"

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val original = chain.request()
            val originalUrl = original.url
            val url = originalUrl.newBuilder()
                .addQueryParameter("api_key", BuildConfig.TMDB_API_KEY)
                .build()
            val request = original.newBuilder().url(url).build()
            chain.proceed(request)
        }
        .build()

    val apiService: TmdbApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create())
            .build()
            .create(TmdbApiService::class.java)
    }
}
