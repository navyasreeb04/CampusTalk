import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Phone,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const OTP_LENGTH = 6;
const EMPTY_OTP = Array.from({ length: OTP_LENGTH }, () => "");

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState("email");
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(EMPTY_OTP);
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState("");
  const [webOtpStatus, setWebOtpStatus] = useState("");
  const [otpRequestKey, setOtpRequestKey] = useState(0);
  const otpInputs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => setResendTimer((currentValue) => currentValue - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
    if (step !== 3 || method !== "phone" || !identifier.trim()) {
      setWebOtpStatus("");
      return undefined;
    }

    if (!window.isSecureContext || !("OTPCredential" in window) || !navigator.credentials?.get) {
      setWebOtpStatus("Type the code manually or use your device's one-time-code autofill.");
      return undefined;
    }

    const abortController = new AbortController();
    let isActive = true;

    setWebOtpStatus("Listening for the OTP from your SMS inbox...");

    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: abortController.signal,
      })
      .then((credential) => {
        if (!isActive) {
          return;
        }

        const incomingCode = credential?.code?.replace(/\D/g, "").slice(0, OTP_LENGTH);

        if (!incomingCode || incomingCode.length !== OTP_LENGTH) {
          return;
        }

        const nextOtp = incomingCode.split("");
        setOtp(nextOtp);
        setWebOtpStatus("OTP detected. Tap Verify OTP to continue.");
        otpInputs.current[OTP_LENGTH - 1]?.focus();
      })
      .catch((webOtpError) => {
        if (!isActive || webOtpError?.name === "AbortError") {
          return;
        }

        setWebOtpStatus("Type the code manually or use your device's one-time-code autofill.");
      });

    return () => {
      isActive = false;
      abortController.abort();
    };
  }, [step, method, identifier, otpRequestKey]);

  const getIdentifierPayload = () =>
    method === "email" ? { email: identifier.trim() } : { phone: identifier.trim() };

  const updateOtp = (value) => {
    const cleanOtp = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    const nextOtp = cleanOtp.split("").concat(EMPTY_OTP).slice(0, OTP_LENGTH);
    setOtp(nextOtp);

    const nextIndex = Math.min(cleanOtp.length, OTP_LENGTH - 1);
    otpInputs.current[nextIndex]?.focus();
  };

  const handleOtpChange = (index, value) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      const nextOtp = [...otp];
      nextOtp[index] = "";
      setOtp(nextOtp);
      return;
    }

    if (numericValue.length > 1) {
      updateOtp(numericValue);
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = numericValue;
    setOtp(nextOtp);

    if (index < OTP_LENGTH - 1) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();
    updateOtp(event.clipboardData.getData("text"));
  };

  const handleSendOTP = async () => {
    if (!identifier.trim()) {
      setError(`Please enter your ${method === "email" ? "email" : "phone number"}`);
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", getIdentifierPayload());
      setOtp(EMPTY_OTP);
      setDeliveryMethod(data.deliveryMethod || method);
      setSuccess(`OTP sent to your ${method === "email" ? "email" : "phone"}`);
      setStep(3);
      setResendTimer(data.resendInSeconds || 30);
      setOtpRequestKey((currentValue) => currentValue + 1);
      window.setTimeout(() => otpInputs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpCode = otp.join("")) => {
    if (otpCode.length !== OTP_LENGTH) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/verify-otp", {
        ...getIdentifierPayload(),
        otp: otpCode,
      });
      setSuccess("OTP verified successfully!");
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) {
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/forgot-password", getIdentifierPayload());
      setOtp(EMPTY_OTP);
      setDeliveryMethod(data.deliveryMethod || method);
      setSuccess(`OTP resent to your ${method === "email" ? "email" : "phone"}`);
      setResendTimer(data.resendInSeconds || 30);
      setOtpRequestKey((currentValue) => currentValue + 1);
      window.setTimeout(() => otpInputs.current[0]?.focus(), 80);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwords.newPassword || !passwords.confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        ...getIdentifierPayload(),
        otp: otp.join(""),
        newPassword: passwords.newPassword,
        confirmPassword: passwords.confirmPassword,
      });
      setSuccess("Password reset successfully!");
      window.setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (field) => {
    setShowPasswords((currentState) => ({
      ...currentState,
      [field]: !currentState[field],
    }));
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link className="back-link" to="/login">
          <ArrowLeft size={16} />
          Back to login
        </Link>

        <div className="auth-heading">
          <p className="eyebrow">Reset Password</p>
          <h1>
            {step === 1 && "Forgot Password?"}
            {step === 2 && "Enter Details"}
            {step === 3 && "Verify OTP"}
            {step === 4 && "New Password"}
          </h1>
          <p className="auth-copy">
            {step === 1 && "Choose how you want to receive your verification code."}
            {step === 2 &&
              `Enter your ${method === "email" ? "email" : "phone number"} to receive OTP.`}
            {step === 3 &&
              `Enter the 6-digit code sent to your ${deliveryMethod || method}. Supported browsers may suggest autofill automatically.`}
            {step === 4 && "Create a new password for your account."}
          </p>
        </div>

        {step === 1 ? (
          <div className="forgot-methods">
            <button
              className={`method-card ${method === "email" ? "active" : ""}`}
              onClick={() => setMethod("email")}
              type="button"
            >
              <Mail size={24} />
              <span>Via Email</span>
            </button>
            <button
              className={`method-card ${method === "phone" ? "active" : ""}`}
              onClick={() => setMethod("phone")}
              type="button"
            >
              <Phone size={24} />
              <span>Via SMS</span>
            </button>
            <button className="primary-button auth-button" onClick={() => setStep(2)} type="button">
              Continue <ArrowRight size={16} />
            </button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="forgot-identifier">
            <label>
              {method === "email" ? "Email Address" : "Phone Number"}
              <input
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={method === "email" ? "yourname@example.com" : "+91 9876543210"}
                type={method === "email" ? "email" : "tel"}
                value={identifier}
              />
            </label>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button
              className="primary-button auth-button"
              disabled={loading}
              onClick={handleSendOTP}
              type="button"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="forgot-otp">
            <div className="otp-card" onPaste={handleOtpPaste}>
              <div className="otp-inputs-container">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    className={`otp-digit-input ${digit ? "filled" : ""}`}
                    inputMode="numeric"
                    maxLength={OTP_LENGTH}
                    name={`otp-${index}`}
                    onChange={(event) => handleOtpChange(index, event.target.value)}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(event) => handleOtpKeyDown(index, event)}
                    ref={(element) => {
                      otpInputs.current[index] = element;
                    }}
                    type="text"
                    value={digit}
                  />
                ))}
              </div>

              <div className="otp-helper-row">
                <span className="otp-status">{webOtpStatus}</span>
                <div className="otp-resend">
                  {resendTimer > 0 ? (
                    <span className="resend-timer">Resend OTP in {resendTimer}s</span>
                  ) : (
                    <button className="resend-btn" onClick={handleResendOTP} type="button">
                      <RefreshCw size={14} />
                      Resend OTP
                    </button>
                  )}
                </div>
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button
              className="primary-button auth-button"
              disabled={loading || otp.join("").length !== OTP_LENGTH}
              onClick={() => handleVerifyOTP()}
              type="button"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="forgot-new-password">
            <label>
              New Password
              <div className="password-input-wrapper">
                <input
                  onChange={(event) =>
                    setPasswords((currentState) => ({
                      ...currentState,
                      newPassword: event.target.value,
                    }))
                  }
                  placeholder="Enter new password"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwords.newPassword}
                />
                <button className="password-toggle" onClick={() => togglePassword("new")} type="button">
                  {showPasswords.new ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label>
              Confirm Password
              <div className="password-input-wrapper">
                <input
                  onChange={(event) =>
                    setPasswords((currentState) => ({
                      ...currentState,
                      confirmPassword: event.target.value,
                    }))
                  }
                  placeholder="Confirm new password"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwords.confirmPassword}
                />
                <button
                  className="password-toggle"
                  onClick={() => togglePassword("confirm")}
                  type="button"
                >
                  {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            {error && <p className="error-text">{error}</p>}
            {success && <p className="success-text">{success}</p>}

            <button
              className="primary-button auth-button"
              disabled={loading}
              onClick={handleResetPassword}
              type="button"
            >
              <Lock size={16} />
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ForgotPassword;
