## REST API build in class:
 >> start with a copy of /express-photogallery-cloudinary-REST-build-in-class and add to it oauth with goodgle and user accounts.

### Running the Application
 
- clone project to your local workspace
- run `npm install` to install dependencies
- insert your cloudinary credentials in a .env file in the root of the project 
    - You'll need to add values for CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET
- insert your mongodb credentials in the .env file as well, as DB_USER and DB_PWD. You may have to update the connection string in app.js to match your cluster and database name as well. (We ought to move the whole connection string into .env, really.) 
- insert your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the .env file as well, if you want to use the Google OAuth functionality. You can create credentials for a Google OAuth app in the Google Cloud Console. Make sure to set the authorized redirect URI to `http://localhost:3000/auth/google/callback` for local development. 
- include GOOGLE_CALLBACK_URL and POST_LOGIN_REDIRECT_URL in your .env as well, with values of `http://localhost:3000/auth/google/callback` and `http://localhost:3000/` respectively for local development.
- run `npm start` or `npm run start-dev` to start the application

