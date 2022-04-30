import React from "react";
import {
    Routes,
    Route,
    withRouter
} from "react-router-dom";

import MarketPlace from "../pages/MarketPlace";
import Auctions from "../pages/Auctions";
import Profile from "../pages/Profile";
import Detail from "../pages/Detail";
import Mating from "../pages/Mating";
import Mint from "../pages/Mint";

function Router() {
    return (
        <Routes>
            <Route path="/" element={<Mint />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/market" element={<MarketPlace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/mating" element={<Mating />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/mint" element={<Mint />} />
        </Routes>
    )
}

export default Router