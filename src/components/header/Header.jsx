import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../Auth';
import { FaUserAlt, FaPlus } from 'react-icons/fa';

import SearchBar from '../searchbar/Searchbar';
import MechHub_Logo from "../../assets/Logo/MechHub_logo.png";
import Mechhub_Logo_Mobile from "../../assets/Logo/MH_logo.png";
import "./Header.css";

function Header() {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleLogoClick = () => {
        navigate(`/`);
    };

    const handleProfile = () => {
        navigate(`/profile/${currentUser.uid}`);
    };

    const handleListing = () => {
        navigate('/listing');
    }

    const handleForumPost = () => {
        navigate('/newforumpost');
    }

    return (
        <nav className='header'>
            {!isMobile ? (
                <img 
                    src={MechHub_Logo} 
                    className="MechHub_Logo"
                    onClick={handleLogoClick} 
                />
            ) : (
                <img 
                    src={Mechhub_Logo_Mobile} 
                    className="MechHub_Logo_Mobile"
                    onClick={handleLogoClick} 
                />
            )}
            <div className='header-searchbar'>
                <SearchBar onSearch={(query) => navigate(`/search?query=${query}`)} />
            </div>
            {currentUser ? (
                <>
                    <div className='add-button'>
                        <span><FaPlus fontWeight={100}/> Create</span>
                        <div className='header-dropdown'>
                            <div className='dropdown-option'>
                                <p onClick={handleListing}>New Listing</p>
                            </div>
                            <div className='dropdown-option'>
                                <p onClick={handleForumPost}>New Forum Post</p>
                            </div>
                        </div>
                    </div>
                    <div className='header-icon'>
                        <FaUserAlt onClick={handleProfile} cursor="pointer" />
                        <span className='tooltip'>profile</span>
                    </div>
            </>
            ) : (
                <li><Link to="/account">Register/ Login</Link></li>
            )}
        </nav>
    );
}

export default Header;