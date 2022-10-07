import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'

import { AuthContext } from '../../context/auth-context'
import './NavLinks.css'

export default function NavLinks(props) {
  const auth = useContext(AuthContext);

  return (
    <ul className='nav-links'>
      {auth.isLoggedIn && <li>
        <NavLink to="/">All Files</NavLink>
      </li>}
      {auth.isLoggedIn && <li>
        <NavLink to="/my-files">My Files</NavLink>
      </li>}
      {(auth.isLoggedIn && auth.isAdmin) && <li>
        <NavLink to="/users">Users</NavLink>
      </li>}
      {auth.isLoggedIn && <li>
          <NavLink to={`/users/${auth.userId}`}>My Profile</NavLink>
        </li>}
      {!auth.isLoggedIn && <li className="login-link">
        <NavLink to="/login">Login</NavLink>
      </li>}
      {auth.isLoggedIn && <li className='login-link' onClick={auth.logout}><NavLink to="/login">Logout</NavLink></li>}
    </ul>
  )
}
