# PowerShell script to inspect localStorage in a browser for debugging
# the user account system and data persistence

Write-Host "Juggle Log - User Storage Inspector" -ForegroundColor Green
Write-Host "-------------------------------------" -ForegroundColor Green
Write-Host ""
Write-Host "This script outputs commands you can run in your browser's developer console to inspect localStorage."
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Yellow
Write-Host "1. Run your Juggle Log app in a browser"
Write-Host "2. Open the browser's developer console (F12 or right-click > Inspect)"
Write-Host "3. Copy and paste the commands below to inspect the data"
Write-Host ""

$commands = @(
    "// List of all localStorage keys",
    "Object.keys(localStorage).forEach(key => console.log(key))",
    "",
    "// User accounts data",
    "console.log('User data:', JSON.parse(localStorage.getItem('jugglelog_users') || '[]'))",
    "console.log('Current user:', localStorage.getItem('jugglelog_current_user'))",
    "",
    "// Check if user-specific data exists",
    "function getUserData() {",
    "  const userId = localStorage.getItem('jugglelog_current_user');",
    "  if (!userId) {",
    "    console.log('No active user');",
    "    return;",
    "  }",
    "",
    "  const prefix = `user_${userId}_`;",
    "  console.log('Checking data for user prefix:', prefix);",
    "",
    "  const userData = {};",
    "  Object.keys(localStorage).forEach(key => {",
    "    if (key.startsWith(prefix)) {",
    "      try {",
    "        userData[key] = JSON.parse(localStorage.getItem(key));",
    "      } catch (e) {",
    "        userData[key] = localStorage.getItem(key);",
    "      }",
    "    }",
    "  });",
    "",
    "  console.log('User-specific data:', userData);",
    "}",
    "",
    "getUserData()",
    "",
    "// Reset user data (uncomment to use)",
    "// function resetCurrentUserData() {",
    "//   const userId = localStorage.getItem('jugglelog_current_user');",
    "//   if (!userId) return 'No active user';",
    "//   const prefix = `user_${userId}_`;",
    "//   Object.keys(localStorage).forEach(key => {",
    "//     if (key.startsWith(prefix)) localStorage.removeItem(key);",
    "//   });",
    "//   return 'User data reset';",
    "// }",
    "// resetCurrentUserData()"
)

foreach ($command in $commands) {
    Write-Host $command -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Use these commands to verify that user-specific data is being correctly stored and loaded." -ForegroundColor Green