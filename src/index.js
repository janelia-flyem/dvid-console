import React from "react";
import ReactDOM from "react-dom/client";
import Navigation from "./Navigation";
import Home from "./Home";
import Repo from "./Repo";
import Admin from "./Admin";
import About from "./About";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
 import { ReactQueryDevtools } from 'react-query/devtools';
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const queryClient = new QueryClient();

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigation />}>
          <Route index element={<Home />} />
          <Route path="/repo/:repoId" element={<Repo />} />
          <Route path="admin" element={<Admin />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
     <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
