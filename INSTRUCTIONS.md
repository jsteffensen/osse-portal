# Instructions for Claude

## Design imperatives

- This website must load in the following sequence: main html, then all linked assets such as css, js, images, fonts, icons, svg etc. Then finally data and templates using ajax calls.
- This website must preload all data and html templates at the initial page load to ensure fast and responsive user experience.
- The preloaded data and templates must all be put in the cache object and the cache object must be attached to the global window scope.
- The only data loads permitted after initial page load, is if the user creates, updates or deletes data - after which action the cache shall be updated with only the specific data that was changed - not a complete cache refresh.
- json files in ./SiteAssets/FallbackData/ cannot be changed as these serve two purposes: fallback for development environment where tha API is not available, but also to specify the data schema being returned by the API calls.
