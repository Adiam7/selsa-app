import React, { useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

// Dummy social login functions – replace with real OAuth logic
const handleGoogleLogin = async () => {
  alert("Google login clicked – integrate OAuth here");
};

const handleAppleLogin = async () => {
  alert("Apple login clicked – integrate OAuth here");
};

const handleFacebookLogin = async () => {
  alert("Facebook login clicked – integrate OAuth here");
};

export default function RegisterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password1, setPassword1] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (password1 !== password2) {
        setError(t("Passwords do not match."));
        return;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
          password: password1,
          confirm_password: password2,
        }),
      });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok) {
        const message =
          data?.error ||
          data?.detail ||
          (typeof data === "object" ? JSON.stringify(data) : null) ||
          t("Registration failed. Please check your details and try again.");
        setError(message);
        return;
      }

      setSuccess(t("Registration successful! You can now log in."));
      setEmail("");
      setUsername("");
      setPassword1("");
      setPassword2("");
    } catch (err: any) {
      setError("Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      role="region"
      aria-label="Register"
      className="ins-tile ins-tile--cta ins-tile--story-right ins-tile--has-image ins-tile--same-prev-background mt-auto"
      id="tile-call-to-action-NrWbGx"
    >
      <div className="ins-tile__wrap ins-tile__animated">
        <div className="ins-tile__body">
          <div className="ins-tile__body-inner max-w-md mx-auto">
            <h2 className="ins-tile__title text-4xl font-bold mb-4">{t('Sign Up')}</h2>
            <p className="ins-tile__description mb-6 text-lg">{t(
              'New here? Sign up to save your orders, personalize your experience, and enjoy exclusive perks.'
            )}</p>

            {/* Social Login Buttons */}
            <div className="flex flex-col gap-3 mb-6">{t('Continue with :')}<div className="mt-3 mb-3">
                 <Link href="/login"  role="button"
                         aria-label="Sign Up"
                         onClick={handleGoogleLogin}
                         className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                       passHref>
                         <div className="ins-control__button">
                           <div className="ins-control__wrap">
                             {/* <div className="ins-control__text">  */}
                                <div className="ins-control__icon"> 
                                  <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
                                </div>
                             {/* </div> */}
                           </div>
                        </div>
                 </Link>
              </div>
              {/* <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-2 px-4 py-3 border rounded hover:bg-gray-100 transition"
              >Google   
                <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
                
              </button> */}

              {/* <button
                type="button"
                onClick={handleAppleLogin}
                className="flex items-center justify-center gap-2 px-4 py-3 border rounded hover:bg-gray-100 transition"
              >Apple   
                <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5" />
                
              </button> */}
              <div className="mt-3 mb-3">
                 <Link href="/login"  role="button"
                         aria-label="Sign Up"
                         onClick={handleGoogleLogin}
                         className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                       passHref>
                         <div className="ins-control__button">
                           <div className="ins-control__wrap">
                             <div className="ins-control__text"> 
                                <div className="ins-control__icon"> 
                                  <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5" />
                                </div>
                             </div>
                           </div>
                         </div>
                 </Link>
              </div>
              {/* <button
                type="button"
                onClick={handleFacebookLogin}
                className="flex items-center justify-center gap-2 px-4 py-3 border rounded hover:bg-gray-100 transition"
              >Facebook   
                <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
                
              </button> */}
              <div className="mt-3 mb-3">
                 <Link href="/login"  role="button"
                         aria-label="Sign Up"
                         onClick={handleGoogleLogin}
                         className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                       passHref>
                         <div className="ins-control__button">
                           <div className="ins-control__wrap">
                             <div className="ins-control__text"> 
                                <div className="ins-control__icon"> 
                                  <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5" />
                                </div>
                             </div>
                           </div>
                         </div>
                 </Link>
              </div>
            </div>

            <div className="text-center mb-4 text-gray-500">{t('or use your email')}</div>

            {/* Traditional Email Registration */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">{t('Email Address')}</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* <div>
                <label htmlFor="username" className="block mb-1 font-medium">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div> */}

              <div>
                <label htmlFor="password1" className="block mb-1 font-medium">{t('Password')}</label>
                <input
                  id="password1"
                  type="password"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={password1}
                  onChange={e => setPassword1(e.target.value)}
                  disabled={loading}
                />
              </div>

              {/* <div>
                <label htmlFor="password2" className="block mb-1 font-medium">
                  Confirm Password
                </label>
                <input
                  id="password2"
                  type="password"
                  required
                  className="w-full border rounded px-3 py-2"
                  value={password2}
                  onChange={e => setPassword2(e.target.value)}
                  disabled={loading}
                />
              </div> */}

              {error && <div className="text-red-600">{error}</div>}
              {success && <div className="text-green-600">{success}</div>}

               <div className="mt-6 mb-4">
                 <Link href="/login"  role="button"
                         aria-label="Sign Up"
                         className="ins-control ins-control--button ins-control--outline ins-control--medium ins-control--pill"
                       passHref>
                         <div className="ins-control__button">
                           <div className="ins-control__wrap">
                             <div className="ins-control__text">{t('Sign Up')}</div>
                           </div>
                        </div>
                 </Link>
               </div>


            </form>

            <p className="mt-4 text-center text-gray-600">{t('Already have an account?')}{" "}
              <Link href="/auth/login" className="text-blue-600 underline">{t('Log in here')}</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
