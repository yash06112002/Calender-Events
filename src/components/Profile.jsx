import React from 'react'
import { Link } from 'react-router-dom'

const Profile = () => {
    return (
        <div className='relative h-screen w-full bg-gradient-to-r from-indigo-200 from-10% via-sky-200 via-30% to-emerald-200 to-90%'>
            <div className='z-50 absolute flex w-full flex-col md:flex-row md:w-[calc(100%-90px)] justify-around items-center md:mx-10 my-20'>
                <div>
                    <Link to="/">Home</Link>
                </div>
                <div className='flex px-8 py-2 justify-between items-center'>
                    <img className="inline-block mx-4 h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="" />
                    <p>Name</p>
                </div>
                <div>
                    <p>Phone Number</p>
                </div>
            </div>
        </div>
    )
}

export default Profile