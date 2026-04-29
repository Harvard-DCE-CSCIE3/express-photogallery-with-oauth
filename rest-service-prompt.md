I would like to create a shared photo service module in services/photoService.js that encapsulates all database interactions related to the Photo model. This will allow us to reuse this logic across different parts of the application, such as API routes, without duplicating code. The service should provide methods for list, find, create, update, and remove operations, each returning a Promise that resolves to the appropriate data. The existing routes in routes/photos.js should be refactored to use this new service, while keeping their current behavior intact.  
Provide a well-constructed prompt for copilot agent to assist with writing the code for the photoService functions, using the existing code in routes/photos.js as a reference for how to interact with the Photo model and handle database operations. Use photoService.list() as an example, and follow the same pattern for the other functions.

































Workspace context:
- File to implement: services/photoService.js
- File to refactor: routes/photos.js
- The service will later be reused by API routes, but do NOT create API routes yet.

Goal:
Create a shared photo service module and refactor HTML routes to use it.

Tasks:

1) Complete services/photoService.js by implementing these methods using the Photo model:
   - list() → returns Promise resolving to all photos
   - find(photoId) → returns Promise resolving to one photo by id
   - create(photoData) → returns Promise resolving to saved new photo
   - update(photoId, updates) → returns Promise resolving to updated photo document
   - remove(photoId) → returns Promise resolving to deleted photo document

   Important: Each method returns only a Promise (Mongoose query). No HTTP responses, no JSON, no render logic.

2) Refactor routes/photos.js:
   - Replace all direct Photo model queries with calls to photoService methods
   - Keep existing route behavior unchanged (views, redirects, error handling)
   - Routes remain responsible for HTTP concerns (res.render, res.redirect, res.status)

Constraints:
- Do not modify the Photo schema/model
- Keep existing style and naming conventions
- Preserve all route URLs and form behavior