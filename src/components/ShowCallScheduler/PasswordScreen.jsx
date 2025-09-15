"use client";

import Keypad from "./Keypad";

export default function PasswordScreen({
  Icon,
  title,
  onSuccess,
  onCancel,
  passwordToMatch,
  submitButtonText,
  password,
  setPassword,
  error,
  setError,
}) {
  const attemptUnlock = () => {
    if (password === passwordToMatch) {
      onSuccess();
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      attemptUnlock();
    }
  };

  const addToPassword = (digit) => {
    if (password.length < 10) {
      setPassword((prev) => prev + digit);
      setError("");
    }
  };

  const clearPassword = () => {
    setPassword("");
    setError("");
  };

  const backspacePassword = () => {
    setPassword((prev) => prev.slice(0, -1));
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center p-8 max-w-lg">
        {Icon && <Icon size={64} className="mx-auto mb-8 text-white" />}
        <h2 className="text-2xl font-bold text-white mb-8">{title}</h2>
        <div className="w-80 mx-auto mb-6">
          <input
            type="password"
            value={password}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-4 text-2xl text-center rounded-lg bg-gray-800 text-white border border-gray-600 focus:border-blue-500 focus:outline-none"
            placeholder="Password"
            readOnly
          />
        </div>
        {error && <p className="text-red-500 mb-6 text-lg">{error}</p>}
        <Keypad
          onDigit={addToPassword}
          onClear={clearPassword}
          onBackspace={backspacePassword}
        />
        <div className="flex space-x-4 justify-center mt-6">
          <button
            onClick={attemptUnlock}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-lg transition-colors duration-150"
          >
            {submitButtonText}
          </button>
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-8 py-4 bg-gray-600 hover:bg-gray-700 text-white text-lg font-semibold rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
