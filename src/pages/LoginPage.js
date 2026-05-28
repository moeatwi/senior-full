import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      if (error === 'unauthorized') {
        setMessageType("danger");
        setMessage("Your email is not authorized for admin access.");
      } else if (error === 'authentication_failed') {
        setMessageType("danger");
        setMessage("Authentication failed. Please try again.");
      }
    }
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const result = await auth.login(email);
    if (result.success) {
      setMessageType("success");
      setMessage(result.message);
    } else {
      setMessageType("danger");
      setMessage(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card p-4 shadow-sm" style={{ maxWidth: 400, width: '100%' }}>
        <div className="text-center mb-4">
          <img
            src="/assets/brands/logo.png"
            alt="ACS Logo"
            style={{ maxWidth: 140, marginBottom: '1rem' }}
          />
          <h2 className="fw-bold mb-1">Admin Login</h2>
          <p className="text-secondary small">Enter your email to receive a magic link</p>
        </div>

        {message && (
          <div className={"alert alert-" + messageType + " py-2"} role="alert">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Sending...
              </>
            ) : (
              "Send Magic Link"
            )}
          </button>
        </form>

        <div className="mt-3 text-center">
          <small className="text-muted">
            We'll send you a link to sign in to your account.
          </small>
        </div>
      </div>
    </div>
  );
}
