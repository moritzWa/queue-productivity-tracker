# Debugging RemNote Plugins

## How to View Console Logs

### Desktop App
1. Open RemNote desktop app
2. Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)
3. Click on "Console" tab
4. Start practicing cards in the queue
5. You'll see logs like:
   - "Queue entered - widget opened"
   - "QueueCompleteCard event fired: {...}"
   - "Updated stats: {...}"

### Browser
1. Open RemNote in browser (whatever your RemNote URL is)
2. Press `F12` or Right-click → "Inspect"
3. Click on "Console" tab
4. Start practicing cards

**Note:** RemNote has a lot of internal logs, so you may need to scroll or filter to find the plugin logs.

### Filtering Logs
To see only plugin logs, type one of these in the console filter box:
- `Queue` - Shows queue-related logs
- `QueueCompleteCard` - Shows card completion logs
- `Widget` - Shows widget-related logs
- `index.tsx` - Shows all logs from the main plugin file

## What to Look For

### When Queue Starts
```
Queue entered - initializing
```

### When You Complete a Card
```
QueueCompleteCard event fired: {
  queueItemType: 1,
  queueItemTypeName: "ForwardCard",
  score: 1,
  cardId: "AdDEsHG8paQRiAFDP",
  cardType: "forward",
  remId: "U9rumWelerKK0MLvj"
}
```

### If a System Card is Skipped
```
Skipping non-flashcard queue item: DailyCheckpoint
```

### After Each Card
```
Card age from Rem: {
  remId: "umsBQ1LectzBgy5At",
  createdAt: "10/29/2023",
  ageMonths: 24
}

Widget opened/refreshed with stats: {
  cardPerMinute: 10.02,
  totalCardsCompleted: 1,
  totalAgainCount: 0,
  remainingTime: "0H 25M",
  cardAgeMonths: 24
}
```

### If Duplicate Prevention Works (Debouncing)
```
Cancelled pending widget update (debouncing)
```

This means multiple cards were completed rapidly, and we're debouncing to only show one widget update.

### If Safety Flag Prevents Duplicate
```
Widget already open, skipping duplicate open
```

This is the safety net - even if multiple event handlers fire, only one widget can be open at a time.

## Common Issues

### Duplicate Popups
- **FIXED**: Dual-layer protection system
  1. **Global debounce timer**: Shared across all event listener instances (fixes HMR duplication)
  2. **Widget open flag**: Hard limit preventing multiple widgets from opening simultaneously
- When multiple `QueueCompleteCard` events fire rapidly, only the last one creates a widget
- When HMR reloads the plugin (during development), old event listeners can't create duplicate widgets
- Logs to watch for:
  - "Cancelled pending widget update (debouncing)" - Debouncer working
  - "Widget already open, skipping duplicate open" - Safety flag working
- Debounce delay: 100ms

### Widget Not Updating
- Check if session storage is being updated
- Look for "Widget opened/refreshed with stats" logs
- Make sure you're in the queue (should see "Queue entered - initializing" log)

### Card Age Showing Wrong Date
- **FIXED**: Now uses Rem's `createdAt` instead of Card's `createdAt`
- Card objects can have incorrect timestamps when re-added to queue (e.g., "Again" button)
- Rem creation date is the true source of truth
- Look for "Card age from Rem:" logs to verify correct ages

### "Queue element not found" Spam
- **FIXED**: Removed faulty queue element check
- The popup widget is in a sandboxed iframe and can't access the main page's DOM
- Widget now closes automatically when `AppEvents.QueueExit` fires

### Plugin Not Loading
- Make sure dev server is running: `npm run dev`
- Check RemNote plugin settings to ensure plugin is enabled
- Try refreshing RemNote
