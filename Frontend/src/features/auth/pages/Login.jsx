import React, { useState } from 'react'
import '../auth.form.scss'
import { useNavigate , Link } from "react-router";
import { useAuth } from '../hooks/useAuth';

const Login = () => {
    const navigate = useNavigate()
    const {loading , handleLogin} = useAuth()
    const [email , setEmail] = useState("")
    const [password , setPassword] = useState("")
    const handleSubmit = async(e) => {
        e.preventDefault();
        const isLoggedIn = await handleLogin({email,password})

        if (isLoggedIn) {
            navigate("/")
        }
    }
    if(loading){
        return (
            <main className='auth-page'><h1>Loading...</h1></main>
        )
    }
  return (
    <main className='auth-page'>
        <div className='auth-card'>
            <p className='auth-eyebrow'>Welcome back</p>
            <h1>Sign in to your workspace</h1>
            <p>Access your dashboard, uploads, and generated interview reports.</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder='Enter your email' onChange={(e)=>{setEmail(e.target.value)}} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder='Enter your password' onChange={(e)=>{setPassword(e.target.value)}} />
                </div>
                <button className='primary-link primary-link--button'>Login</button>
            </form>
            <p className='auth-footer'>Don't have an account? <Link to="/register">Register</Link></p>
        </div>
    </main>
  )
}

export default Login
