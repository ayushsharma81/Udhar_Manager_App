package com.udharmanager.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.udharmanager.app.ui.theme.UdharManagerTheme
import com.udharmanager.app.ui.viewmodel.UdharViewModel

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object People : Screen("people", "People", Icons.Default.People)
    object Transactions : Screen("transactions", "Transactions", Icons.Default.ReceiptLong)
    object Analytics : Screen("analytics", "Analytics", Icons.Default.BarChart)
    object Settings : Screen("settings", "Settings", Icons.Default.Settings)
}

class MainActivity : ComponentActivity() {

    private val viewModel: UdharViewModel by viewModels {
        UdharViewModel.Factory((application as UdharApplication).repository)
    }

    @OptIn(ExperimentalMaterial3Api::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            UdharManagerTheme {
                var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
                var showFabBottomSheet by remember { mutableStateOf(false) }

                Scaffold(
                    topBar = {
                        TopAppBar(
                            title = {
                                Text(
                                    text = if (currentScreen == Screen.Home) "Udhar Manager" else currentScreen.title,
                                    style = MaterialTheme.typography.titleLarge
                                )
                            },
                            colors = TopAppBarDefaults.topAppBarColors(
                                containerColor = MaterialTheme.colorScheme.surface,
                                titleContentColor = MaterialTheme.colorScheme.onSurface
                            ),
                            actions = {
                                IconButton(onClick = { /* Search */ }) {
                                    Icon(Icons.Default.Search, contentDescription = "Search")
                                }
                            }
                        )
                    },
                    bottomBar = {
                        NavigationBar {
                            val items = listOf(
                                Screen.Home,
                                Screen.People,
                                Screen.Transactions,
                                Screen.Analytics,
                                Screen.Settings
                            )
                            items.forEach { screen ->
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = screen.title) },
                                    label = { Text(screen.title) },
                                    selected = currentScreen.route == screen.route,
                                    onClick = { currentScreen = screen }
                                )
                            }
                        }
                    },
                    floatingActionButton = {
                        FloatingActionButton(
                            onClick = { showFabBottomSheet = true },
                            containerColor = MaterialTheme.colorScheme.primary,
                            contentColor = MaterialTheme.colorScheme.onPrimary
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Quick Actions")
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (currentScreen) {
                            Screen.Home -> HomeTab(viewModel)
                            Screen.People -> PeopleTab(viewModel)
                            Screen.Transactions -> TransactionsTab(viewModel)
                            Screen.Analytics -> AnalyticsTab(viewModel)
                            Screen.Settings -> SettingsTab(viewModel)
                        }
                    }

                    if (showFabBottomSheet) {
                        QuickActionBottomSheet(
                            onDismiss = { showFabBottomSheet = false },
                            viewModel = viewModel
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun HomeTab(viewModel: UdharViewModel) {
    val summary by viewModel.dashboardSummary.collectAsState()
    val peopleWithBalances by viewModel.peopleWithBalances.collectAsState()
    // Native Compose Dashboard
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Good Morning 👋", style = MaterialTheme.typography.titleMedium)
        Spacer(modifier = Modifier.height(8.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Net Balance", style = MaterialTheme.typography.bodyMedium)
                Text("₹${String.format("%,.0f", summary.netBalance)}", style = MaterialTheme.typography.headlineLarge)
            }
        }
        Spacer(modifier = Modifier.height(16.dp))
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Card(modifier = Modifier.weight(1f)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("Others Owe Me", style = MaterialTheme.typography.bodySmall)
                    Text("₹${String.format("%,.0f", summary.othersOweMe)}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.primary)
                }
            }
            Card(modifier = Modifier.weight(1f)) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Text("I Owe Others", style = MaterialTheme.typography.bodySmall)
                    Text("₹${String.format("%,.0f", summary.iOweOthers)}", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.error)
                }
            }
        }
    }
}

@Composable
fun PeopleTab(viewModel: UdharViewModel) {
    Text("People & Outstanding Balances", modifier = Modifier.padding(16.dp))
}

@Composable
fun TransactionsTab(viewModel: UdharViewModel) {
    Text("Complete Transaction Ledger", modifier = Modifier.padding(16.dp))
}

@Composable
fun AnalyticsTab(viewModel: UdharViewModel) {
    Text("Financial Analytics & Cashflow", modifier = Modifier.padding(16.dp))
}

@Composable
fun SettingsTab(viewModel: UdharViewModel) {
    Text("Settings, Security & Backup", modifier = Modifier.padding(16.dp))
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuickActionBottomSheet(onDismiss: () -> Unit, viewModel: UdharViewModel) {
    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(modifier = Modifier.padding(24.dp).fillMaxWidth()) {
            Text("Quick Actions", style = MaterialTheme.typography.titleLarge)
            Spacer(modifier = Modifier.height(16.dp))
            ListItem(
                headlineContent = { Text("Lend Money") },
                supportingContent = { Text("You gave money to someone") },
                leadingContent = { Icon(Icons.Default.ArrowUpward, contentDescription = null) }
            )
            ListItem(
                headlineContent = { Text("Borrow Money") },
                supportingContent = { Text("You took money from someone") },
                leadingContent = { Icon(Icons.Default.ArrowDownward, contentDescription = null) }
            )
            ListItem(
                headlineContent = { Text("Receive Payment") },
                supportingContent = { Text("Record repayment received") },
                leadingContent = { Icon(Icons.Default.CheckCircle, contentDescription = null) }
            )
            ListItem(
                headlineContent = { Text("Make Payment") },
                supportingContent = { Text("Record money you repaid") },
                leadingContent = { Icon(Icons.Default.Payment, contentDescription = null) }
            )
            ListItem(
                headlineContent = { Text("Add Person") },
                supportingContent = { Text("Create new contact profile") },
                leadingContent = { Icon(Icons.Default.PersonAdd, contentDescription = null) }
            )
        }
    }
}
