# Instructions for AI development agents

## Design imperatives

- At any time do not act eagerly and implement functionality that has not been directed to implement - suggest it instead.
- This website must load in the following sequence: main html, then all linked assets such as css, js, images, fonts, icons, svg etc. Then finally data and templates using ajax calls.
- This website must preload all data and html templates at the initial page load to ensure fast and responsive user experience, and limit any network traffic after initial load.
- The preloaded data and templates must all be put in the cache object and the cache object must be attached to the global window scope.
- The only data loads permitted after initial page load, is if the user creates, updates or deletes data - after which action the cache shall be updated with only the specific data that was changed - not a complete cache refresh.
- No comments shall be added inline in the js files.
- No console.log() cals shall be made in the js files.


## JS Structure

- The following directives serves to avoid cyclic and criss-crossing function calls and thereby cyclic dependencies. It further enables the ability to swap out one service without worrying about breaking the app in multiple places. Wherefore:
- The only functions that can call functions in the data-service, are functions in the data-service itself, or the cache-service.
- All functions in the data-service are inside the "data" namespace.
- The only functions that can call functions in the cache-service, are functions in the cache-service itself, or the app.js.
- All functions in the cache-service are inside the "cache" namespace.
- The only functions that can call functions in the app.js, are functions in the app.js itself, or triggered from the html user interface.
- app.js handles business logic and updates to the DOM elements from two namespaces; "app" and "ui" respectively.
- Functions in utils.js can be called from anywhere, but util.js must return a value immediately and not a promise.
- All functions in the util.js are inside the "util" namespace.
- The only script embedded in script tags in the html page must be the app.init() call. 
- Most function calls rely on a chain of promises that propagate from the app to the cache to the data saervice and resolves backwards to the app and html again - sometimes interleaving to use the utils.
- Chained promises shall use this style of implementation: 
```
.then((result) => {
        console.log('First result:', result);
        return fetchData(result);
    }, (err) => {
        console.error('Error after first promise:', err);
        // Handle or propagate error
        return 'Error handled';  // Example of error recovery
    })
    .then((result) => {
        console.log('Second result:', result);
        return fetchData(result);
    }, (err) => {
        console.error('Error after second promise:', err);
        // Decide to continue or not
        return 'Error handled';
    })
    .then((result) => {
        console.log('Third result:', result);
        return fetchData(result);
    }, (err) => {
        console.error('Error after third promise:', err);
        // Further error handling
        return 'Error handled';
    })
    .then((finalResult) => {
        console.log('Final result:', finalResult);
    }, (err) => {
        console.error('Final catch:', err);
        // Final error handling
    });
```

- Errors from the lower most data-service must likewise propagate all the way up to the app.js as an object that has keys associated with each namespace and the error it threw at that level; therefore an error in app.js arrives as an object with a data key, a cache key, potentially a util key. Wherever the error is thrown that initial error is wrapped in an object and passed upwards.

## CSS structure

- CSS can only exist in either the materializecss css file or the style.css file. Therefore CSS must not be put inline in the DOM element or within style tags of the html.
- classes from the materializecss.css file should be used to the widest extent possible. Only when strictly necessary should any custom css be applied and then only in the style.css file-

## Data handling practices

- All data interactions must follow the cache-first approach, checking the cache before making API calls.
- When retrieving data for display, always check if the relationship data is already joined (e.g., Requirements array on Parent items).
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
- When implementing components, refer to the Demo Components page for examples of the correct color usage and styling patterns.
- All forms should use MaterializeCSS form elements with proper validation styles.
- Navigation between views should use the router and maintain the history state appropriately.
- Collection items should have a consistent layout pattern when displaying the same data type.
- Tables should use MaterializeCSS responsive-table class and follow standard data display patterns.
- Progress indicators should use either the built-in LinearProgress component or be styled consistently with MaterializeCSS design language.
- All icons should come from the Material Icons library for consistency.
- Modal dialogs, tooltips, and other overlay elements should use MaterializeCSS implementations.
- Form inputs should include proper labeling and hint text using MaterializeCSS conventions.
