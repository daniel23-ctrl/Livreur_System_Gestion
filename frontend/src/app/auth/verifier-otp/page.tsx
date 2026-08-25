"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifierOtp, renvoyerOtp } from "@/services/auth.service";
import { Button } from "@/components/ui/button"; // Import du bouton shadcn

export default function VerifyOtpForm() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const utilisateurId = searchParams.get("id") ?? "";

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pastedData.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (code.length < 6) {
      setError("Veuillez renseigner les 6 chiffres du code OTP.");
      return;
    }

    if (!utilisateurId) {
      setError("Session invalide. Merci de recommencer l'inscription.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifierOtp({ utilisateur_id: utilisateurId, code });
      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.detail || "Une erreur est survenue lors de la vérification.";
      setError(message);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!utilisateurId) return;
    setResending(true);
    setError(null);
    try {
      await renvoyerOtp(utilisateurId);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : (err as any)?.response?.data?.detail || "Impossible de renvoyer le code.";
      setError(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Vérification du compte</h2>
      <p className="text-sm text-center text-gray-500 mb-6">
        Entrez le code à 6 chiffres envoyé par SMS.
      </p>

      {success ? (
        <p className="text-center text-green-600 font-semibold py-4">
          Numéro vérifié avec succès ! Redirection...
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                className="w-12 h-12 text-center text-xl font-bold bg-gray-50 border-2 border-gray-300 rounded-lg focus:border-[#C49A1A] focus:bg-white focus:outline-none transition"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center font-medium">{error}</p>
          )}

          {/* Bouton de validation principal avec shadcn */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full py-6 bg-[#D4AB30] hover:bg-[#C49A1A] text-white font-semibold rounded-lg shadow-md transition"
          >
            {loading ? "Vérification en cours..." : "Valider le code"}
          </Button>

          <div className="text-center">
            {/* Bouton de renvoi avec shadcn en variant "link" */}
            <Button
              type="button"
              variant="link"
              onClick={handleResend}
              disabled={resending}
              className="text-sm text-indigo-600 hover:underline"
            >
              {resending ? "Envoi..." : "Renvoyer le code"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}