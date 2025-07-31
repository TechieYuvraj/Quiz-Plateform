import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import API from "../../../axios.config";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import logoIMG from "../../assets/image.png"
import DotGrid from "../animated-bg/DotGrid";



export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState("");
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const navigate = useNavigate();

    const sendOtp = async () => {
        if (!email.trim()) {
            toast.error("Please enter your email");
            return;
        }

        setLoading(true);

        try {
            const res = await API.post("/api/auth/send-login-otp", { email });
            toast.success("OTP sent to your email");

            setStep(2);
            setResendTimer(30);
            setCanResend(false);

            const countdown = setInterval(() => {
                setResendTimer((prev) => {
                    if (prev === 1) {
                        clearInterval(countdown);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.warning("Enter a 6-digit OTP");
            return;
        }

        try {
            const res = await API.post("/api/auth/login", { email, otp });
            console.log(res.data.userId)
            toast.success("Login successful");

            // Optionally save session in localStorage if needed

            navigate("/profile");
        } catch (err) {
            toast.error(err?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div className="relative min-h-screen bg-background">
            <DotGrid />

            <div className="relative z-10 flex justify-center items-center min-h-screen px-4">
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                <Card className="w-full max-w-sm sm:max-w-md shadow-lg rounded-xl border-2">
                    <CardContent className="p-6">
                        {/* <h2 className="text-xl sm:text-2xl font-bold text-center mb-6">Login</h2> */}
                        <h2 className="text-xl flex flex-col items-center  sm:text-2xl font-bold text-center mb-6 gap-3"><img className="rounded-full" width={50} src={logoIMG} alt="" />Login</h2>


                        {step === 1 ? (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <Label htmlFor="email" className="text-sm">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="user@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <Button
                                    className="w-full mt-2"
                                    onClick={sendOtp}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span>Sending...</span><Loader2 className="w-4 h-4 animate-spin ml-2" />
                                        </>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center min-h-[50vh] mt-[-100px]">
                                <div className="flex flex-col items-center space-y-4">
                                    <h3 className="text-lg font-semibold">Enter OTP</h3>

                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={setOtp}
                                        className="mx-auto"
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>

                                    {canResend ? (
                                        <Button variant="outline" onClick={sendOtp}>
                                            Resend OTP
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Resend OTP in {resendTimer}s
                                        </p>
                                    )}

                                    <Button
                                        className="w-full mt-4"
                                        onClick={handleVerify}
                                        disabled={otp.length !== 6}
                                    >
                                        Verify & Login
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
