# Galleon Attributes ⚓

A simple yet powerful tool for the Galleon fleet to manage HTML attributes and create dynamic content in both vanilla HTML and Webflow projects.

## Ahoy there! Welcome aboard! 🏴‍☠️

Galleon Attributes helps you harness the power of custom attributes to create dynamic, data-driven websites without the need to sail into the treacherous waters of complex code. Whether you're working with vanilla HTML or charting your course through Webflow, our tool makes it smooth sailing.

## The Treasure This Tool Provides 💎

- **Data Binding**: Easily connect your HTML elements to data sources
- **Dynamic Content Creation**: Generate content based on JSON data
- **Simplified Attribute Management**: Apply, remove, and toggle HTML attributes with ease
- **Webflow-Friendly**: Designed specifically for Webflow projects
- **No Heavy Coding Required**: Perfect for the low-code/no-code sailors
- **Lightweight**: Won't slow down your ship (website)

## How To Join The Crew

```html
<script src="https://cdn.jsdelivr.net/gh/queen-raae/galleon-attributes@main/dist/galleon-attributes.min.js"></script>
```

Add this script to your project, and you'll be ready to set sail!

## Captain's Maps (Usage Guide)

### Vanilla HTML Usage

Galleon Attributes lets you create dynamic content using simple HTML attributes:

```html
<!-- Fetch data from a JSON endpoint -->
<div gl-get="/projects.json">
  <!-- Bind text content to data properties -->
  <h1 gl-bind="title">Title</h1>
  <p gl-bind="description">Description</p>

  <!-- Bind attributes like image sources -->
  <img width="200" height="200" gl-bind-src="image.url" />

  <!-- Loop through arrays -->
  <ul>
    <li gl-bind="tags">TAG</li>
  </ul>
  
  <!-- Access specific array items -->
  <p>Tag number two: <span gl-bind="tags[1]">TAG1</span></p>

  <!-- Loop through complex objects -->
  <a gl-select="links" gl-bind="label" gl-bind-href="url">Project Link</a>
</div>
```

### Webflow Integration

In Webflow, you can use custom attributes with our utility functions:

```javascript
// Setting an attribute on an element
Galleon.setAttribute(selector, attributeName, attributeValue);

// Removing an attribute from an element
Galleon.removeAttribute(selector, attributeName);

// Toggling an attribute (adds if absent, removes if present)
Galleon.toggleAttribute(selector, attributeName, attributeValue);

// Checking if an element has an attribute
const hasAttribute = Galleon.hasAttribute(selector, attributeName);
```

## Real-World Examples

### Vanilla HTML Example: User Profile

```html
<div gl-get="/me.json">
  <h1 gl-bind="name">Name</h1>
  <p gl-bind="bio">Bio</p>
  <h3>Socials</h3>
  <ul>
    <li gl-select="socials">
      <a gl-bind="label" gl-bind-href="url">Social Link</a>
    </li>
  </ul>
</div>
```

### Webflow Example: Toggle Navigation

```javascript
// When the burger icon is clicked
document.querySelector('.burger-icon').addEventListener('click', function() {
  Galleon.toggleAttribute('.navigation', 'data-open', 'true');
});
```

### Webflow Example: Form Submission State

```javascript
// Mark form as submitting when submit button is clicked
document.querySelector('form').addEventListener('submit', function() {
  Galleon.setAttribute('form', 'data-submitting', 'true');
});
```

## Detailed Usage Guide

### Core Attributes

| Attribute | Purpose | Example |
|-----------|---------|---------|
| `gl-get` | Fetches JSON data from an endpoint | `<div gl-get="/api/data.json">` |
| `gl-bind` | Binds element's text content to a data property | `<h1 gl-bind="title">Title</h1>` |
| `gl-bind-[attr]` | Binds specific attributes to data properties | `<img gl-bind-src="image.url">` |
| `gl-select` | Iterates through array items | `<li gl-select="items">` |

### Advanced Features

- **Array Indexing**: Access specific items with `property[index]` syntax
- **Nested Properties**: Navigate object hierarchies with dot notation (`user.profile.name`)
- **Dynamic Attributes**: Create responsive interfaces with attribute toggling
- **Template Reuse**: Apply consistent data binding across different views

## The Fleet (Related Projects)

Galleon Attributes is part of the larger Galleon fleet, charting new waters by uniting different data sources for Webflow builders without heavy coding:

- [Galleon Core](https://github.com/queen-raae/galleon-core)
- [Galleon Xano](https://github.com/queen-raae/galleon-xano)
- [Galleon APIs](https://github.com/queen-raae/galleon-apis)

## Join the Voyage

- 🐦 [Follow us on Twitter](https://twitter.com/GalleonDev)
- 💬 [Join our Discord server](https://discord.gg/galleon)
- 📰 [Subscribe to our newsletter](https://galleon.dev/newsletter)

## Captain's Log (License)

MIT © [Queen Raae](https://github.com/queen-raae)
