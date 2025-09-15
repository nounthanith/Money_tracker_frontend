import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div>
        <h1 className='text-3xl font-bold text-red-600'>404 Not Found</h1>
        <p>Page not found</p>
        <Link to="/dashboard" className='text-blue-600 hover:text-blue-800'>Go back to home</Link>
    </div>
  )
}

export default NotFound