import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "devextreme/dist/css/dx.light.css";
import axios from "axios";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "../i18n/i18n.js";

axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<App />
			</AuthProvider>
		</BrowserRouter>
	</React.StrictMode>
);
