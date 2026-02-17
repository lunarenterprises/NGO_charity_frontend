import React from 'react'
import LandingPage from '../Components/LandingPage'

function Home({ onQuickDonationOpen }) {
    return (
        <div className='pt-13' >
            <LandingPage onQuickDonationOpen={onQuickDonationOpen} />
        </div>
    )
}

export default Home
