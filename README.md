# X Activity Tracker

A simple desktop application to track your daily X (Twitter) activities and maintain streaks.

![X Activity Tracker Screenshot](screenshot.png)

## Features

- Track daily X activities
- Set goals and maintain streaks
- View your activity history in a calendar
- Get streak status with fire indicator for 10+ day streaks
- Dark mode interface matching X's design

## Installation

### Download Pre-built App

Coming soon!

### Build from Source

1. Clone this repository:
```
git clone https://github.com/Tom-Semple/lowest-minium-standard-tracker.git
cd lowest-minium-standard-tracker
```

2. Install dependencies:
```
npm install
```

3. Run the app in development mode:
```
npm start
```

4. Build the app for your platform:
```
npm run dist
```

This will create distributable packages in the `dist` folder.

## Usage

1. **Add Activities**: Click the "Add Activity" button to log an activity
2. **Remove Activities**: Click the "Remove" button if you added too many
3. **Edit Name**: Click the "Edit" button next to your name to personalize the app
4. **View Calendar**: Scroll through the calendar to see your activity history
5. **Reset Data**: Use the "Reset Data" button to clear all data (use with caution)

## Development

### Project Structure

- `src/main.js` - Main Electron process
- `src/preload.js` - Preload script for secure IPC
- `src/renderer.js` - Renderer process (UI logic)
- `src/index.html` - HTML structure
- `src/styles.css` - CSS styling

### Technologies Used

- Electron
- Electron Store (for data persistence)
- HTML/CSS/JavaScript

## License

MIT 