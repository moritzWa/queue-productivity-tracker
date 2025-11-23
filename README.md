# Queue Productivity Tracker

A RemNote plugin that displays real-time flashcard performance metrics to help you stay motivated and track your study pace.

![Plugin Screenshot](https://github.com/voidtriangle/queue-motivator/assets/107706537/f1f09dfa-45d3-4430-8129-3e0dc74a1418)

## Features

- **Real-time Speed Tracking**: Monitor your cards/minute based on the last 5 minutes of activity
- **Color-coded Performance Indicators**:
  - 🔴 Red (< 3 cards/min): Slow pace with down arrow
  - 🟡 Yellow (3-5 cards/min): Moderate pace
  - 🟢 Green (> 5 cards/min): Fast pace with up arrow
- **Session Statistics**: Track total cards completed, session duration, and accuracy
- **Time Estimates**: See expected completion time based on overall session average
- **Dark Mode Support**: Automatically adapts to RemNote's light/dark theme with transparent background

## Installation

### From Plugin Store
1. Open RemNote
2. Go to **Settings** → **Plugins and Themes**
3. Search for "Queue Productivity Tracker"
4. Click **Install**

**Note**: After installation, the widget may not appear immediately. Please attempt 1-2 queues. It takes a little time to load on the first instance, but after that, it should display without any issues.

### From Zip File
1. Download the latest `PluginZip.zip` from the [releases page](https://github.com/moritzWa/queue-productivity-tracker/releases)
2. In RemNote, go to **Settings** → **Plugins and Themes** → **Build** tab
3. Click **Upload Plugin** and select the zip file

### Development Mode (for developers)
1. Clone this repository:
   ```bash
   git clone https://github.com/moritzWa/queue-productivity-tracker.git
   cd queue-productivity-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. In RemNote, go to **Settings** → **Plugins and Themes** → **Build** tab
5. Click **Develop from localhost**
6. Enter `http://localhost:8080`

## Usage

Once installed, the plugin automatically activates when you enter a flashcard queue. The performance metrics bar appears at the top of your flashcard interface showing:

- **Clock**: Current time
- **Session**: How long you've been studying (HH:MM:SS)
- **Speed**: Cards per minute calculated from the last 5 minutes of activity (not entire session)
- **Status**: Total cards completed and accuracy breakdown [correct/incorrect]
- **Expected**: Estimated time remaining and expected completion time (based on overall session average)

## Development

### Build Plugin
```bash
npm run build
```
This creates a `PluginZip.zip` file in the project root, ready for upload to RemNote.

### Type Checking
```bash
npm run check-types
```

### Validate Plugin
```bash
npm run validate
```

## How It Works

The plugin tracks your flashcard completion timestamps and calculates:
- **Speed metric**: Based on cards completed in the last 5 minutes only (provides immediate feedback on current pace)
- **Time estimates**: Based on overall session average (more accurate for remaining time predictions)

This dual approach gives you real-time pace feedback while maintaining accurate completion estimates.

## Documentation & Resources

- [RemNote Plugin Documentation](https://plugins.remnote.com/)
- [RemNote Plugin SDK API Reference](https://plugins.remnote.com/api/modules)
- [Creating Custom Widgets](https://plugins.remnote.com/advanced/widgets)
- [Plugin Theming and Dark Mode](https://plugins.remnote.com/custom-css)
- [RemNote Help Center](https://help.remnote.com/)

## Support

For issues, feature requests, or questions, please [open an issue on GitHub](https://github.com/moritzWa/queue-productivity-tracker/issues).

## License

MIT

## Credits

- Forked from [voidtriangle/queue-motivator](https://github.com/voidtriangle/queue-motivator)
- Built with [RemNote Plugin SDK](https://github.com/remnoteio/remnote-plugin-sdk)
- Developed with assistance from [Claude Code](https://claude.com/claude-code)
