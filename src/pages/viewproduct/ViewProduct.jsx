import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { useAuth } from '../../Auth';
import { FaRegHeart } from "react-icons/fa";

import Header from '../../components/header/Header';
import './ViewProduct.css';

function ProductPage() {
  const { listingID } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [listing, setListing] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      const listingDocRef = doc(db, 'listings', listingID);
      const listingDocSnap = await getDoc(listingDocRef);

      if (listingDocSnap.exists()) {
        const listingData = listingDocSnap.data();
        setListing(listingData);

        const userDocRef = doc(db, 'Users', listingData.userID);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUser(userDocSnap.data());
        }
      } else {
        console.log('There is Such No Listing');
      }
    };

    fetchListing();
  }, [listingID]);

  const handleUsernameClick = () => {
    navigate(`/profile/${listing.userID}`);
  };

  const handleEditClick = () => {
    navigate(`/listing/${listingID}`);
  };

  const handleLike = () => {

  };

  return (
    <>
      <Header />
      <div className="listing-container">
        <div className="listing-details">
          <img src={listing.image} alt={listing.title} />
          <div className="listing-text">
            <h1>{listing.title}</h1>
            <h2>${listing.price}</h2>
            <h3>{listing.productType}</h3>
            <h4>Details:</h4>
            <p>{listing.description}</p>
          </div>
          <div className='like-button'>
            <FaRegHeart onClick={handleLike}/>
          </div>
        </div>
      </div>
      <div className='user-container'>
        <div className='user-details'>
          <img className='userpic'
            src={user.profilePic}
            alt={user.username}
            onClick={handleUsernameClick}
          />
          <h4 onClick={handleUsernameClick}>{user.username}</h4>
        </div>
        {currentUser?.uid === listing.userID && (
          <button onClick={handleEditClick}>Edit Listing</button>
        )}
      </div>
    </>
  );
}

export default ProductPage;
