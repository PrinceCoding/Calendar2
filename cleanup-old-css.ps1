# CSS Cleanup Script
# Run this to optionally remove old CSS files that are now handled by Tailwind

Write-Host "🎨 CSS Cleanup Utility for Tailwind Migration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "e:\OneDrive\Documents\GitHub\Calendar2"

# Files to potentially remove
$oldCssFiles = @(
    "css\header.css",
    "apps\calendar\calendar.css",
    "apps\clock\clock.css",
    "apps\pomodoro\pomodoro.css",
    "apps\todo\todo.css",
    "apps\calculator\calculator.css",
    "apps\events\events.css",
    "apps\notes\notes.css",
    "apps\web-browser\web-browser.css",
    "apps\canvas-manager\canvas-manager.css",
    "apps\ambient-sounds\ambient-sounds.css",
    "apps\countdown\countdown.css",
    "apps\settings\settings.css",
    "apps\app-store\app-store.css"
)

Write-Host "The following CSS files are now OPTIONAL (replaced by Tailwind):" -ForegroundColor Yellow
Write-Host ""

foreach ($file in $oldCssFiles) {
    $fullPath = Join-Path $projectRoot $file
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Write-Host "  📄 $file ($size bytes)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Options:" -ForegroundColor Green
Write-Host "  1. Archive old CSS files (move to 'old-css' folder)" -ForegroundColor White
Write-Host "  2. Delete old CSS files (permanent)" -ForegroundColor White
Write-Host "  3. Keep all files (do nothing)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    "1" {
        $archiveDir = Join-Path $projectRoot "old-css"
        New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null
        
        foreach ($file in $oldCssFiles) {
            $fullPath = Join-Path $projectRoot $file
            if (Test-Path $fullPath) {
                $destPath = Join-Path $archiveDir (Split-Path $file -Leaf)
                Move-Item -Path $fullPath -Destination $destPath -Force
                Write-Host "  ✅ Archived: $file" -ForegroundColor Green
            }
        }
        Write-Host ""
        Write-Host "✅ Files archived to: old-css\" -ForegroundColor Green
    }
    
    "2" {
        Write-Host ""
        $confirm = Read-Host "Are you sure you want to DELETE these files? (yes/no)"
        if ($confirm -eq "yes") {
            foreach ($file in $oldCssFiles) {
                $fullPath = Join-Path $projectRoot $file
                if (Test-Path $fullPath) {
                    Remove-Item -Path $fullPath -Force
                    Write-Host "  ❌ Deleted: $file" -ForegroundColor Red
                }
            }
            Write-Host ""
            Write-Host "✅ Files deleted successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Operation cancelled" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "✅ No changes made - all files kept" -ForegroundColor Green
        Write-Host "   Old CSS files won't conflict with Tailwind" -ForegroundColor Gray
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice - no changes made" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 See CSS_MIGRATION_GUIDE.md for more information" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
