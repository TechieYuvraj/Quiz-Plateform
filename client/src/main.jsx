import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import { Toaster } from 'sonner';

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";

createRoot(document.getElementById('root')).render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <BrowserRouter>
                <App />
                <Toaster position="top-right" richColors expand />
            </BrowserRouter>
        </PersistGate>
    </Provider>
);
