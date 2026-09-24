import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";
import { BooksView } from "./Books/Books.view";

const rootElement = document.getElementById("root");
ReactDOM.render(<BooksView />, rootElement);
