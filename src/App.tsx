import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./components/NotFound";
import Game from "./components/Game";
import GameList from "./components/GameList";
import Register from "./components/Register";
import Login from "./components/Login";
import FreeGames from "./components/FreeGames";
import CreateGame from './components/CreateGame';
import ViewOwnedGames from "./components/ViewOwnGames";
import ViewWishlistGames from "./components/ViewWishlistGames";
import ViewReviewGames from "./components/ViewReviewGames";
import ViewCreateGames from "./components/ViewCreateGames";
import Profile from "./components/Profile";
import ViewProfile from './components/ViewProfile';


function App() {
  return (
      <div className="App">
        <Router>
          <div>
            <Routes>
              <Route path="/listgames" element={<GameList/>}/>
              <Route path="/listgames/freegames" element={<FreeGames/>}/>
              <Route path="/users/register" element={<Register/>} />
              <Route path="/users/login" element={<Login/>}/>
              <Route path="/users/creategame" element={<CreateGame/>}/>
              <Route path="/users/viewownedgames" element={<ViewOwnedGames/>}/>
              <Route path="/users/viewwishlistgames" element={<ViewWishlistGames/>}/>
              <Route path="/users/viewreviewgames" element={<ViewReviewGames/>}/>
              <Route path="/users/viewcreategames" element={<ViewCreateGames/>}/>
              <Route path="/users/profile" element={<Profile/>}/>
              <Route path="/users/viewprofile" element={<ViewProfile/>}/>
              <Route path="/games/:id" element={<Game/>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </div>
  );
}

export default App;
