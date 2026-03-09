// lib/email/sendResetEmail.ts

export async function sendResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        message: data?.detail || "Failed to send reset email.",
      };
    }

    return {
      success: true,
      message: data?.detail || "Password reset email sent.",
    };
  } catch (error) {
    console.error("Reset email error:", error);
    return {
      success: false,
      message: "An unexpected error occurred.",
    };
  }
}
