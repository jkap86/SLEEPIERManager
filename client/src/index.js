import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import store from "./store/store";

// Create a root container where the React application will attach

const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the application within the root container
// The Provider component makes the Redux store available to any nested components that have been wrapped in the connect() function.

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
