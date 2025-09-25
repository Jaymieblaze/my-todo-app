import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
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

// Icons for password visibility
const EyeIcon = ({ className }: { className?: string }) => (
  <svg className={cn('h-5 w-5 text-gray-500 dark:text-gray-400', className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className }: { className?: string }) => (
  <svg className={cn('h-5 w-5 text-gray-500 dark:text-gray-400', className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </svg>
);

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state based on the URL search parameter.
  // If '?mode=signup' is in the URL, show the signup form. Otherwise, show login.
  const [isLogin, setIsLogin] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('mode') !== 'signup';
  });

  const [isResetMode, setIsResetMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password: string) => password.length >= 8 && /\d/.test(password) && /[a-zA-Z]/.test(password);

  const clearState = () => {
      setError(null);
      setResetSentMessage(null);
      setVerificationSent(false);
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearState();

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
        await sendEmailVerification(userCredential.user);
        setVerificationSent(true);
      }
    } catch (err) {
      setError((err as AuthError).message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    clearState();
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      navigate('/todos');
    } catch (err) {
      setError((err as AuthError).message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    clearState();
    if (!validateEmail(email)) {
        setError('Please enter a valid email to reset your password.');
        return;
    }
    setLoading(true);
    try {
        await sendPasswordResetEmail(auth, email);
        setResetSentMessage('Password reset link sent! Please check your inbox.');
    } catch (err) {
        setError((err as AuthError).message);
    } finally {
        setLoading(false);
    }
  };

  // Function to toggle between Login and Sign Up modes and update the URL
  const toggleAuthMode = () => {
    const newIsLogin = !isLogin;
    setIsLogin(newIsLogin);
    clearState();

    // Update the URL without a full page reload
    if (newIsLogin) {
      navigate('/login'); // Go to login mode
    } else {
      navigate('/login?mode=signup'); // Go to signup mode
    }
  };


  if (verificationSent) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div className="mx-auto grid w-full max-w-[350px] gap-6">
          <div className="flex justify-center">
            <h2 className="text-2xl font-bold tracking-tight text-indigo-600">MyTodoApp</h2>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold dark:text-white">Verify Your Email</h1>
            <p className="text-balance text-gray-500 dark:text-gray-400">
              We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to activate your account.
            </p>
          </div>
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
      <div className="hidden bg-gray-100 dark:bg-slate-900 lg:block">
        <div 
          className="h-full w-full object-cover" 
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      </div>
      <div className="flex items-center justify-center py-12 px-6">
        <div className="mx-auto grid w-full max-w-[350px] gap-6">
          
          <div className="flex justify-center">
            <h2 className="text-2xl font-bold tracking-tight text-indigo-600">MyTodoApp</h2>
          </div>
          
          {isResetMode ? (
            <>
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold dark:text-white">Reset Password</h1>
                <p className="text-balance text-gray-500 dark:text-gray-400">
                  Enter your email and we'll send you a link to get back into your account.
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="dark:text-gray-200">Email</label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {resetSentMessage && <p className="text-sm text-green-600 text-center">{resetSentMessage}</p>}
                <Button onClick={handlePasswordReset} className="w-full" disabled={loading}>
                  {loading && <LoaderSpin className="mr-2" />}
                  Send Reset Link
                </Button>
              </div>
               <div className="mt-4 text-center text-sm">
                <button onClick={() => setIsResetMode(false)} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                    Back to Login
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold dark:text-white">
                  {isLogin ? 'Welcome Back!' : 'Create an Account'}
                </h1>
                <p className="text-balance text-gray-500 dark:text-gray-400">
                  {isLogin 
                    ? "Enter your email below to login to your account" 
                    : "Enter your information to create an account"}
                </p>
              </div>
              <form onSubmit={handleEmailSubmit} className="grid gap-4">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <label htmlFor="first-name" className="dark:text-gray-200">First Name</label>
                      <Input id="first-name" type="text" placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required disabled={loading} />
                    </div>
                    <div className="grid gap-2">
                      <label htmlFor="last-name" className="dark:text-gray-200">Last Name</label>
                      <Input id="last-name" type="text" placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required disabled={loading} />
                    </div>
                  </div>
                )}
                <div className="grid gap-2">
                  <label htmlFor="email" className="dark:text-gray-200">Email</label>
                  <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required disabled={loading} />
                </div>
                {/* Password input with the visibility toggle */}
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <label htmlFor="password" className="dark:text-gray-200">Password</label>
                        {isLogin && (
                            <button type="button" onClick={() => setIsResetMode(true)} className="ml-auto inline-block text-sm text-indigo-600 hover:underline dark:text-indigo-400">
                                Forgot password?
                            </button>
                        )}
                    </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={isPasswordVisible ? 'text' : 'password'} 
                      placeholder="********" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      disabled={loading} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {isPasswordVisible ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
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
                <button onClick={toggleAuthMode} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

