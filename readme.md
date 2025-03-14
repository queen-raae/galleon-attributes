# Galleon Attributes ⚓

A simple yet powerful tool for Webflow Pirates to create dynamic content using data attributes.

## Ahoy there! Welcome aboard! 🏴‍☠️

Galleon Attributes helps you create dynamic, data-driven websites without sailing into the treacherous waters of complex code. Made for Webflow, but works with any tool that supports data attributes.

## The Treasure This Tool Provides 💎

- **Data Binding**: Easily connect your HTML elements to data sources
- **Webflow-Friendly**: Designed specifically for Webflow projects
- **No Heavy Coding Required**: Perfect for the low-code/no-code sailors
- **Lightweight**: Won't slow down your ship (website)

## Set Sail ⛵ (Quick Start)

### Add the Galleon Script

Add the following to your Webflow project's `Site Settings > Custom Code > Head Code`:

```html
<script
  async
  src="https://cdn.jsdelivr.net/npm/raae/galleon-attributes@latest/dist/script.js"
></script>
```

### Use the Galleon Attributes

Start by using our test APIs to get the hang of it.

#### 1. Select an element

| Attribute | Value                                                                         | Description                                                                      |
| --------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `gl-get`  | `https://cdn.jsdelivr.net/npm/raae/galleon-attributes@latest/dist/queen.json` | Fetches data from the URL and makes it available to the element and its children |

#### 2. Select a _multiple text lines_ child of the element

| Attribute | Value | Description                                                             |
| --------- | ----- | ----------------------------------------------------------------------- |
| `gl-bind` | `bio` | Binds the text content of the element to the `bio` property of the data |

#### 3. Select an _image_ child of the element

| Attribute     | Value        | Description                                                                       |
| ------------- | ------------ | --------------------------------------------------------------------------------- |
| `gl-bind-src` | `avatar.url` | Binds the `src` attribute of the element to the `avatar.url` property of the data |
| `gl-bind-alt` | `avatar.alt` | Binds the `alt` attribute of the element to the `avatar.alt` property of the data |

#### 4. Select a _link_ child of the element

| Attribute      | Value     | Description                                                                                           |
| -------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `gl-select`    | `socials` | Selects the `socials` property of the data and creates a copy of the element for each item            |
| `gl-bind-href` | `url`     | Binds the `href` attribute of the element to the `url` property of the `socials` item data            |
| `gl-bind`      | `label`   | Binds the inner HTML content (text) of the element to the `label` property of the `socials` item data |

## Treasure Map (User Guide)

Coming...

### The Attributes

| Attribute        | Purpose                                         | Example                          |
| ---------------- | ----------------------------------------------- | -------------------------------- |
| `gl-get`         | Fetches JSON data from an endpoint              | `<div gl-get="/api/data.json">`  |
| `gl-bind`        | Binds element's text content to a data property | `<h1 gl-bind="title">Title</h1>` |
| `gl-bind-[attr]` | Binds specific attributes to data properties    | `<img gl-bind-src="image.url">`  |
| `gl-select`      | Iterates through array items                    | `<li gl-select="items">`         |

### The Values

- **Properties**: Access properties with dot notation, such as `user.profile.name`
- **Array Indexing**: Access specific items with `property[index]` syntax, such as `socials[0].url`

## The Galleon Tools

Galleon Attributes will be a part a larger Galleon fleet, aiming to unlock user data for Webflow Pirates:

- Galleon Gateway: Fetch personalized content from tools like Airtable, Notion, Google Sheets, etc.
- Galleon ???: Pitch your user data needs!

## Join the Voyage

- 📰 [Subscribe to our Galleon newsletter](https://galleon.tools)

## Captain's Log (License)

MIT © [Queen Raae](https://github.com/queen-raae)
