import React, { useRef, useEffect, useState } from 'react';
import Header from '../../components/header/Header';
import Categories from "./categories/Categories";
import Data from "./data.json";
import ProductList from "./ProductList";
import Banner from "./banner/Banner";
import { useAuth } from '../../Auth'; 
import ListingButton from '../../components/listingpopup/Button';
import './LandingPage.css';

function LandingPage() {
    const headerContainerRef = useRef(null);
    const [totalHeight, setTotalHeight] = useState('auto');
    const { currentUser } = useAuth();

    useEffect(() => {
        const calculateHeight = () => {
            if (headerContainerRef.current) {
                const headerElements = headerContainerRef.current.children;
                const combinedHeight = Array.from(headerElements).reduce((acc, element) => {
                    return acc + element.offsetHeight + 102;
                }, 0);
                setTotalHeight(combinedHeight);
            }
        };

        calculateHeight();

        window.addEventListener('resize', calculateHeight);

        return () => window.removeEventListener('resize', calculateHeight);
    }, []);

    return (
        <div className='landing-page'>
            <div className='header-section'>
                <header style={{ height: totalHeight }} ref={headerContainerRef} className="header-container">
                    <Header />
                    <Banner />
                </header>
            </div>
            <div className='main'>
                <section >
                    <div>
                        <Categories />
                    </div>
                    <div>
                        <ProductList heading="Featured Products" products={Data.featured} />
                    </div>
                    {currentUser && <ListingButton />}
            </section>
        </div>
    </div>
    );
}

export default LandingPage
