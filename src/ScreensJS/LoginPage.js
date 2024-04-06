// src/LoginPage.js

import React, {useState} from 'react';
import './LoginPage.css'; // Import the CSS file for styling

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from submitting in the traditional way
        console.log(email, password); // For demonstration: log the email and password
        // Here, you would typically handle the login logic, such as making an API call
    };

    return (
        <div className="login-container">
            <div className='signInRegister'>
                <button>
                    Login
                </button>
                <button>
                    Register
                </button>

            </div>

            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Login</h2>
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="login-button">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;
