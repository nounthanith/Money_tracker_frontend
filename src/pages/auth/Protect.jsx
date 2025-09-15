import React from 'react'

function Protect({children}) {
    const token = localStorage.getItem("token");
    if (!token) {
        return <Navigate to="/" />;
    }
  return (
    children
  )
}

export default Protect