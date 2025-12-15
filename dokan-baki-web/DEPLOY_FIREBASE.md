# Deploy to Firebase

I've set up the configuration files for Firebase Hosting with Next.js support.

## Final Steps

1.  **Login to Firebase**
    Run the following command and log in with your Google account:
    ```bash
    npx firebase login
    ```

2.  **Set Project ID**
    Open `.firebaserc` file in your editor and replace `YOUR_PROJECT_ID_HERE` with your actual Firebase Project ID (found in Firebase Console settings).
    
    *Alternatively, you can run:*
    ```bash
    npx firebase use --add
    ```
    And select your project from the list (choose alias 'default').

3.  **Deploy**
    Run this command to build and deploy your application:
    ```bash
    npx firebase deploy
    ```

## Important Note regarding Next.js
Since your app uses API Routes and Server Actions, Firebase will try to deploy these as **Cloud Functions**. 
- You must have the **Blaze (Pay as you go)** plan enabled on your Firebase project.
- The deployment process will automatically detect Next.js and enable "web frameworks" support.
