import React, { useState } from "react";
import { useNavigate , Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
    const navigate = useNavigate();
    const {loading , handleRegister} = useAuth();
    const [username , setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword]= useState("");
     const handleSubmit = async(e) => {
        e.preventDefault();
        const isRegistered = await handleRegister({username,email,password})

        if (isRegistered) {
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
            <p className='auth-eyebrow'>Create account</p>
            <h1>Set up your interview workspace</h1>
            <p>Register once and manage uploads, reports, and profile details from one dashboard.</p>

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input type="text" id="username" name="username" placeholder='Enter your username' onChange={(e)=>{setUsername(e.target.value)}} />
                </div>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder='Enter your email' onChange={(e)=>{setEmail(e.target.value)}} />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" placeholder='Enter your password' onChange={(e)=>{setPassword(e.target.value)}} />
                </div>
                <button className='primary-link primary-link--button'>Register</button>
            </form>

            <p className='auth-footer'>Already have an account? <Link to="/login">Login</Link></p>
        </div>
    </main>
  )
}

export default Register;
