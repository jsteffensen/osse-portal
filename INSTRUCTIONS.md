# Instructions for Claude

## Design imperatives

- This website must load in the following sequence: main html, then all linked assets such as css, js, images, fonts, icons, svg etc. Then finally data and templates using ajax calls.
- This website must preload all data and html templates at the initial page load to ensure fast and responsive user experience.
- The preloaded data and templates must all be put in the cache object and the cache object must be attached to the global window scope.
- The only data loads permitted after initial page load, is if the user creates, updates or deletes data - after which action the cache shall be updated with only the specific data that was changed - not a complete cache refresh.
- json files in ./SiteAssets/FallbackData/ cannot be changed as these serve two purposes: fallback for development environment where tha API is not available, but also to specify the data schema being returned by the API calls.

## Data handling practices

- All data interactions must follow the cache-first approach, checking the cache before making API calls.
- When retrieving data for display, always check if the relationship data is already populated (e.g., Requirements array on Parent items).
- All data manipulation functions (create, update, delete) must manage both the direct item cache and any relationship caches.
- Cache invalidation should be specific and targeted - only invalidate the exact cache entries that were affected by a data change.
- When displaying data in lists or forms, handle loading states appropriately using MaterializeCSS preloaders.
- For nested data structures, maintain parent-child relationships in the cache to optimize rendering performance.
- All data access functions should have consistent error handling patterns using promises.
- Status indicators for data (like progress bars) should reflect actual data state whenever possible, not just UI state.
- Always provide appropriate feedback when data operations succeed or fail (using MaterializeCSS toast notifications).
- Each API interaction should update the cache immediately to maintain UI consistency.

## UI component guidelines

- All UI components should leverage the MaterializeCSS framework to the maximum extent possible.
- Custom UI elements should only be created when no suitable functionality is available in MaterializeCSS.
- Follow the consistent color scheme defined in style.css with primary colors being #3f4d67 (dark gray-blue) and #47b2c7 (teal-blue accent).
- All forms should use MaterializeCSS form elements with proper validation styles.
- Navigation between views should use the router and maintain the history state appropriately.
- Collection items should have a consistent layout pattern when displaying the same data type.
- Tables should use MaterializeCSS responsive-table class and follow standard data display patterns.
- Progress indicators should use either the built-in LinearProgress component or be styled consistently with MaterializeCSS design language.
- All icons should come from the Material Icons library for consistency.
- Modal dialogs, tooltips, and other overlay elements should use MaterializeCSS implementations.
- Form inputs should include proper labeling and hint text using MaterializeCSS conventions.
