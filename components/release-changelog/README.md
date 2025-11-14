# Release Changelog Web Component

A self-contained, reusable web component for displaying monthly release changelogs with pagination support.

## Features

- 🚀 **Single-file web component** - No dependencies, just import and use
- 📦 **Multiple data sources** - Load from external JSON file or inline data
- 📄 **Pagination support** - Automatically paginates large changelog lists
- 🎨 **Built-in styling** - Responsive design with shadow DOM encapsulation
- 🔄 **Auto-fill defaults** - Missing item properties filled from meta defaults
- 🎯 **Programmatic API** - Control the component via JavaScript

## Installation

### In This Repository

The component is located at:
```
components/release-changelog/release-changelog.js
```

### Include in Your Project

#### Option 1: ES Module (Recommended)

```html
<script type="module">
  import ReleaseChangelog from './components/release-changelog/release-changelog.js';
</script>
```

#### Option 2: Direct Script Tag

```html
<script type="module" src="./components/release-changelog/release-changelog.js"></script>
```

## Usage

### Basic Usage with External JSON

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Release Changelog</title>
</head>
<body>
  <release-changelog src="sample-changelog.json"></release-changelog>
  
  <script type="module" src="./components/release-changelog/release-changelog.js"></script>
</body>
</html>
```

### Usage with Inline JSON

```html
<release-changelog data='{
  "meta": {
    "title": "Product Releases",
    "description": "Latest product updates"
  },
  "items": [
    {
      "version": "1.0.0",
      "date": "2024-01-15",
      "title": "Initial Release",
      "changes": ["Feature 1", "Feature 2"]
    }
  ]
}'></release-changelog>
```

### Custom Items Per Page

```html
<release-changelog 
  src="changelog.json" 
  items-per-page="10">
</release-changelog>
```

## Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `src` | String | - | URL to external JSON file containing changelog data |
| `data` | String | - | Inline JSON string with changelog data |
| `items-per-page` | Number | 5 | Number of changelog items to display per page |

## JSON Format

The component expects data in the following format:

```json
{
  "meta": {
    "title": "Release Changelog",
    "description": "Monthly product releases and updates",
    "lastUpdated": "2024-01-15",
    "issue": "https://github.com/org/repo/issues"
  },
  "items": [
    {
      "version": "1.2.0",
      "date": "2024-01-15",
      "title": "Major Feature Update",
      "description": "Added new capabilities and improvements",
      "changes": [
        "New feature A",
        "Enhancement B",
        "Bug fix C"
      ],
      "lastUpdated": "2024-01-15",
      "issue": "https://github.com/org/repo/issues/123"
    }
  ]
}
```

### JSON Schema

#### `meta` Object (optional)

- `title` (string): Title displayed at the top of the changelog
- `description` (string): Subtitle/description text
- `lastUpdated` (string): Default "last updated" date for all items
- `issue` (string): Default issue tracker URL for all items

#### `items` Array (required)

Each item in the array represents a release:

- `version` (string, required): Version number (e.g., "1.2.0")
- `date` (string, required): Release date (any format)
- `title` (string, required): Release title
- `description` (string, optional): Detailed description
- `changes` (array of strings, optional): List of changes in this release
- `lastUpdated` (string, optional): Override meta.lastUpdated for this item
- `issue` (string, optional): Override meta.issue for this item

**Note:** If `lastUpdated` or `issue` is omitted from an item, the component will automatically use the value from `meta`. This allows you to set defaults once and override only when needed.

## Programmatic API

### `setData(data)`

Programmatically set changelog data:

```javascript
const changelog = document.querySelector('release-changelog');

changelog.setData({
  meta: {
    title: "My Changelog",
    lastUpdated: "2024-01-15"
  },
  items: [
    {
      version: "1.0.0",
      date: "2024-01-15",
      title: "Initial Release",
      changes: ["First feature"]
    }
  ]
});
```

## Examples

### Example 1: Load from External File

```html
<release-changelog src="./sample-changelog.json"></release-changelog>
<script type="module" src="./release-changelog.js"></script>
```

### Example 2: Inline JSON with Custom Pagination

```html
<release-changelog 
  items-per-page="3"
  data='{
    "meta": {"title": "Updates"},
    "items": [
      {"version": "1.0.0", "date": "2024-01", "title": "Release 1", "changes": ["Item 1"]},
      {"version": "1.0.1", "date": "2024-02", "title": "Release 2", "changes": ["Item 2"]}
    ]
  }'>
</release-changelog>
<script type="module" src="./release-changelog.js"></script>
```

### Example 3: Programmatic Control

```html
<release-changelog id="changelog"></release-changelog>

<script type="module">
  import ReleaseChangelog from './release-changelog.js';
  
  // Fetch data from API
  const response = await fetch('/api/changelog');
  const data = await response.json();
  
  // Set data programmatically
  const changelog = document.getElementById('changelog');
  changelog.setData(data);
</script>
```

## Styling

The component uses Shadow DOM, so styles are encapsulated. To customize:

1. Modify the `getStyles()` method in `release-changelog.js`
2. Use CSS custom properties (if implemented)
3. Wrap in a container with custom styles

## Browser Support

Works in all modern browsers that support:
- Custom Elements (Web Components)
- Shadow DOM
- ES6 Modules

## Sample Files

- `sample-changelog.json` - Example JSON data with 8+ items
- `example-release-changelog.html` - Working example page

## License

Open source - use freely in your projects.
