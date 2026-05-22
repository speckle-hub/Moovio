package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModelProvider
import com.example.data.database.MovieDatabase
import com.example.data.repository.MovieRepository
import com.example.ui.screens.MoovioAppContainer
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.ObsidianAbyss

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Edge-to-edge status bar masking enabled
        enableEdgeToEdge()

        // Room DB & MVVM layer initialization
        val database = MovieDatabase.getDatabase(applicationContext)
        val repository = MovieRepository(database.movieDao())
        val viewModel = ViewModelProvider(
            this, 
            com.example.ui.viewmodel.MovieViewModelFactory(repository)
        )[com.example.ui.viewmodel.MovieViewModel::class.java]

        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = ObsidianAbyss
                ) {
                    MoovioAppContainer(viewModel = viewModel)
                }
            }
        }
    }
}
