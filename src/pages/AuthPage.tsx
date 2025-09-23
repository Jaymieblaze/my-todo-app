import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification, // Import the email verification function
  AuthError,
} from 'firebase/auth';
import { auth } from '../firebase';
import Button from '../components/Button';
import Input from '../components/Input';
import { LoaderSpin } from '../components/Icons';

const GoogleIcon = () => (
    <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false); // State to track if verification email was sent
  const navigate = useNavigate();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVerificationSent(false); // Reset on new submission

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isLogin && !validatePassword(password)) {
        setError('Password must be at least 8 characters long and include numbers and letters.');
        return;
    }
    if (!isLogin && (!firstName.trim() || !lastName.trim())) {
      setError('First and last name are required.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/todos');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: `${firstName.trim()} ${lastName.trim()}` });
        
        // ## Send the verification email after creating the user
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true); // Trigger the confirmation UI
      }
    } catch (err) {
      setError((err as AuthError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/todos');
    } catch (err) {
      setError((err as AuthError).message);
    } finally {
      setLoading(false);
    }
  };

  // ## If a verification email has been sent, show a confirmation message instead of the form.
  if (verificationSent) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="mx-auto grid w-[350px] gap-6 text-center">
          <h1 className="text-3xl font-bold">Verify Your Email</h1>
          <p className="text-balance text-muted-foreground">
            We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }}
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:block">
        <div 
          className="h-full w-full object-cover" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isLogin ? 'Welcome Back' : 'Create an Account'}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isLogin 
                ? "Enter your email below to login to your account" 
                : "Enter your information to create an account"}
            </p>
          </div>
          <form onSubmit={handleEmailSubmit} className="grid gap-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="first-name">First Name</label>
                  <Input id="first-name" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={loading} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="last-name">Last Name</label>
                  <Input id="last-name" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={loading} />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <label htmlFor="email">Email</label>
              <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password">Password</label>
              <Input id="password" type="password" placeholder="********" value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} />
            </div>
            
            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <LoaderSpin className="mr-2" />}
              {isLogin ? 'Login' : 'Create Account'}
            </Button>
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
              <GoogleIcon />
              {isLogin ? 'Login with Google' : 'Sign up with Google'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setError(null); }} className="font-medium text-indigo-600 hover:underline">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

