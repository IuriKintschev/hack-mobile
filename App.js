import React from "react";
import { StatusBar } from "react-native";

import Root from "./src/root";

const App = () => (
  <>
    <StatusBar backgroundColor="#222" barStyle="light-content" />
    <Root />
  </>
);

export default App;
