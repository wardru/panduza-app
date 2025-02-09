import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Scanner from './Scanner';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route
                    path='/'
                    element={<App />}
                />
                <Route
                    path='/scanner'
                    element={<Scanner />}
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
);
