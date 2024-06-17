import React, { useEffect, useState } from 'react';
import { auth, db } from '../../firebase/firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../Auth';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import ReviewList from './userReviews/ReviewList';
import EditPopup from './editUser/EditPopup';
import Header from '../../components/header/Header';
import ListingButton from '../../components/listingpopup/Button';
import ProductList from '../../components/productcards/ProductList';
import './UserProfile.css';

function UserProfile() {
  const { userID } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [viewReviews, setViewReviews] = useState(false);
  const [averageScore, setAverageScore] = useState(0);
  const [numberOfReviews, setNumberOfReviews] = useState(0);
  const [followUser, setFollowUser] = useState(false);
  const [followCount, setFollowCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = () => {
    setIsPopupOpen(false);
    fetchUserData();
  };

  const handleToggleReview = () => {
    setViewReviews(!viewReviews);
  };

  const fetchUsersListings = async (username) => {
    try {
      const listingsCollection = collection(db, 'listings');
      const data = await getDocs(listingsCollection);
      const listingsData = data.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const userSpecificListings = listingsData.filter((listing) => listing.username === username);
      setUserListings(userSpecificListings);
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const reviewsCollection = collection(db, 'Reviews');
      const reviewsQuery = query(reviewsCollection, where('listerID', '==', userID));
      const data = await getDocs(reviewsQuery);
      const reviewsData = data.docs.map((doc) => doc.data());
      setUserReviews(reviewsData);

      const numberOfReviews = reviewsData.length;
      setNumberOfReviews(numberOfReviews);

      if (numberOfReviews > 0) {
        const totalScore = reviewsData.reduce((accumulator, review) => accumulator + review.score, 0);
        const avgScore = totalScore / numberOfReviews;
        setAverageScore(avgScore);
      } else {
        setAverageScore(0);
      }
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };

  const fetchFollowStatus = async () => {
    if (currentUser?.uid) {
      const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
      const followDocSnap = await getDoc(followDocRef);
      console.log(followDocSnap.exists());
      return followDocSnap.exists();
    }
    return false;
  };
  
  const fetchUserData = async () => {
    try {
      const docRef = doc(db, 'Users', userID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserInfo(userData);
        fetchUsersListings(userData.username);
        fetchUserReviews();
        const isFollowing = await fetchFollowStatus();
        setFollowUser(isFollowing);
        const followCount = userData.followCount || 0; 
        const followingCount = userData.followingCount || 0; 
        setFollowCount(followCount);
        setFollowingCount(followingCount);
      } else {
        console.log('No user data found');
      }
    } catch (error) {
      console.log(`Firebase: ${error}`);
    }
  };
  
  useEffect(() => {
    fetchUserData();
  }, [userID]);
  
  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User logged out successfully!');
      navigate('/');
    } catch (error) {
      console.error('Error logging out: ', error.message);
    }
  };

  const handleLoginNavigation = () => {
    navigate('/account');
  };

  const handleUserFollow = async () => {
    if (currentUser?.uid !== userID) {
      const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
      const followingDocRef = doc(db, 'Users', currentUser.uid, 'following', userID);
      const followDocSnap = await getDoc(followDocRef);
      const followingDocSnap = await getDoc(followingDocRef);
  
      if (followDocSnap.exists()) {
        setFollowUser(true);
        console.log('Already following this user');
      } else {
        try {
          await setDoc(followDocRef, {
            followerID: currentUser.uid,
            timestamp: new Date()
          });
          const userDocRef = doc(db, 'Users', userID);
          await updateDoc(userDocRef, {
            followCount: firebase.firestore.FieldValue.increment(1)
          });
          await setDoc(followingDocRef, {
            followedUserID: userID,
            timestamp: new Date()
          });
          const followerDocRef = doc(db, 'Users', currentUser.uid);
          if (followingDocSnap.exists()) {
            console.log('Already following this user');
          } else {
            await updateDoc(followerDocRef, {
              followingCount: firebase.firestore.FieldValue.increment(1)});
          }
          setFollowUser(true);
          setFollowCount((prevCount) => prevCount + 1);
          setFollowingCount((prevCount) => prevCount + 1);
          console.log('Successfully followed the user');
        } catch (err) {
          console.error('Error following user: ', err);
        }
      }
    } else {
      console.log('You cannot follow yourself');
    }
  };

  const handleUserUnFollow = async () => {
    if (currentUser?.uid !== userID) {
      const followDocRef = doc(db, 'Users', userID, 'followers', currentUser.uid);
      const followingDocRef = doc(db, 'Users', currentUser.uid, 'following', userID);
  
      try {
        const followDocSnap = await getDoc(followDocRef);
        if (followDocSnap.exists()) {
          await deleteDoc(followDocRef);
          const userDocRef = doc(db, 'Users', userID);
          await updateDoc(userDocRef, {
            followCount: firebase.firestore.FieldValue.increment(-1)
          });
          await deleteDoc(followingDocRef);
          setFollowUser(false);
          setFollowCount((prevCount) => prevCount - 1);
          setFollowingCount((prevCount) => prevCount - 1);
          console.log('Successfully unfollowed the user');
        } else {
          console.log('You are not following this user');
        }
      } catch (err) {
        console.error('Error unfollowing user: ', err);
      }
    } else {
      console.log('You cannot unfollow yourself');
    }
  };

  return (
    <div className='content'>
      <Header />
      {userInfo ? (
        <>
          <div className="profile-container">
            <div className='profile-info-container'>
              <div className='profile-info'>
                <div className="profile-pic" style={{ backgroundImage: `url(${userInfo.profilePic})` }} />
                <p>@{userInfo.username}</p>
              </div>
              <div className='profile-follow'>
                <div className='follow-info'>
                  <div className='follow-count'>
                    <h5>{followCount}</h5>
                    <p>Followers</p>
                  </div>
                  <div className='follow-count'>
                    <h5>{followingCount}</h5>
                    <p>Following</p>
                  </div>
                </div>
                <div className='profile-buttons'>
                  {currentUser?.uid === userID ? (
                  <>
                    <button className="edit-profile" onClick={handleOpenPopup}>
                      Edit Profile
                    </button>
                    {isPopupOpen && <EditPopup onClose={handleClosePopup} onSubmit={handleSubmit} />}
                    <button className="logout" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  followUser ? (
                    <button className='unfollow' onClick={handleUserUnFollow}>Unfollow</button>
                  ) : (
                    <button className='follow' onClick={handleUserFollow}>Follow</button>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="profile-toggle">
              <div
                className={`toggle ${!viewReviews ? 'active' : ''}`}
                onClick={() => setViewReviews(false)}
              >
                Listings
              </div>
              <div
                className={`toggle ${viewReviews ? 'active' : ''}`}
                onClick={() => setViewReviews(true)}
              >
                Reviews
              </div>
            </div>
            <ListingButton />
          </div>
          <div className="user-content">
            {viewReviews ? (
              <div className="user-reviews">
                {userReviews.length > 0 ? (
                  <ReviewList
                    heading={`${userInfo.username}'s Reviews`}
                    reviews={userReviews} averageScore={averageScore} numberOfReviews={numberOfReviews}
                  />
                ) : (
                  <h2>This user has no reviews ( ˘･з･)</h2>
                )}
              </div>
            ) : (
              <div className="users-listings">
                {userListings.length > 0 ? (
                  <ProductList heading={`${userInfo.username}'s Listings`} products={userListings} />
                ) : (
                  <h2>This user has no listings ( ˘･з･)</h2>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div>
          <p>No user found.</p>
          <button onClick={handleLoginNavigation}>Login</button>
        </div>
      )}
    </div>
  );  
}

export default UserProfile;