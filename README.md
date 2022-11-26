# Flashcard Project 

With React and Typescript, I developed the frontend for my website [recallcards.uk](https://recallcards.uk/).\
You can also view the [Python back-end repository](https://github.com/ErfanTagh/flashcard-backend).\
Feel free to give it a try!\
It's all free, no credit cards required! 

## Project Overview 

The authentication was handled by [Auth0](https://auth0.com).\
You can see the private and public root settings as well as redirect callbacks in the root App.js file.\
The react components can be found in the components folder.\
To make multiple requests to the Rest API, this project uses the JS fetch API. 

## `React Components`

The react components can be found in the components folder.\ 
The folder Auth0 components is related to the Auth0 service, as its name suggests.\
The component of the app that the user is redirected to after authentication is the [MainPage Component](https://github.com/ErfanTagh/flashcard-frontend/blob/main/src/Components/MainPage.tsx).\
Here the user can choose between reviewing existing flashcards or adding a new card. 

## `Api Requests`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `To Do, Future Improvements`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

