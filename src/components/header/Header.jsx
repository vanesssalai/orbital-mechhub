import React, { useState } from 'react';
import { useAuth } from '../../Auth';
import { Link, useNavigate } from 'react-router-dom';

import MechHub_Logo from "../../assets/Logo/MechHub_logo.png";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { currentUser } = useAuth();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleLogoClick = () => {
        navigate(`/`)
    };

    return (
        <nav className='navbar'>
            <img 
                src={MechHub_Logo} 
                className="MechHub_Logo"
                onClick={handleLogoClick} 
            />
            <div className="hamburger" onClick={toggleMenu}>
                &#9776;
            </div>
            <ul className={menuOpen ? 'open' : 'closed'}>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/search">Search</Link></li>
                {currentUser ? (
                    <li><Link to={`/profile/${currentUser.uid}`}>Profile</Link></li>
                ) : (
                    <li><Link to="/account">Register/ Login</Link></li>
                )}
                <li><Link to="/" className="likes">Liked: <span>0</span></Link></li>
            </ul>
        </nav>
    );
}

export default Header;
