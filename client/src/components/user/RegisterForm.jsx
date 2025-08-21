import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { toast } from "sonner";
import API from "../../../axios.config";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "../ThemeToggle";
import logoIMG from "../../assets/image.png"
import { useDispatch } from "react-redux";
import { login } from "../../redux/slices/authSlice.js";
import DotGrid from "../animated-bg/DotGrid";




export default function RegisterForm() {
    const dispatch = useDispatch();
    const navi = useNavigate();

    const validateForm = () => {
        const missing = [];

        if (!form.name.trim()) missing.push("Name");
        if (!form.email.trim()) missing.push("Email");
        if (!form.phone.trim()) missing.push("Phone");
        if (!form.college.trim()) missing.push("College");
        if (!form.course.trim()) missing.push("Course");
        if (!form.year.trim()) missing.push("Year");
        if (!form.password.trim()) missing.push("Password");

        if (missing.length > 0) {
            toast.error(`Please fill: ${missing.join(", ")}`);
            return false;
        }

        return true;
    };

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        college: "",
        course: "",
        year: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1 = user details, 2 = OTP
    const [otp, setOtp] = useState("");
    const [errors, setErrors] = useState({});
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    // const { toast } = useToast();


    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const sendOtp = async () => {
        if (!validateForm()) return;
        setLoading(true); // start loading

        try {
            // //const API.post("/api/auth/send-otp",{
            //     email: form.email,
            // })
            const res = await API.post("/api/auth/send-otp", { email: form.email })
            console.log(res.data);
            setStep(2)
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
            console.error(err.response?.data || err.message);
            alert("Failed to send OTP");
        } finally {
            setLoading(false); // always stop loading
        }
    };

    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.warning("Please enter a 6-digit OTP");
            return;
        }

        try {
            const res = await API.post("/api/auth/register", {
                email: form.email,
                otp,
                ...form,
            });

            toast.success("Registered successfully!");
            // console.log(res.data)
            dispatch(login(res.data))
            navi("/profile")
            // Redirect or move to login

        } catch (err) {
            console.log(err)
            const msg = err?.response?.data?.message || "Something went wrong";
            toast.error(msg);
        }

    };

    return (
        <>
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="flex justify-center items-center min-h-screen px-4 ">
                <DotGrid />
                <Card className="w-full max-w-sm sm:max-w-md shadow-lg rounded-xl">
                    <CardContent className="p-6">
                        <h2 className="text-xl flex items-center sm:text-2xl font-bold text-center mb-6 gap-3">
                            <img className="rounded-full" width={50} src={logoIMG} alt="" />
                            Register for CG Quiz
                        </h2>

                        {step === 1 ? (
                            <div className="space-y-4">
                                {["name", "email", "phone", "college", "course", "year", "password"].map((field) => (
                                    <div key={field} className="flex flex-col gap-1">
                                        <Label htmlFor={field} className="text-sm capitalize">
                                            {field}
                                        </Label>
                                        <Input
                                            id={field}
                                            type={field === "password" ? "password" : "text"}
                                            placeholder={field === "email" ? "user@example.com" : field}
                                            value={form[field]}
                                            onChange={handleChange}
                                            className={errors[field] ? "border-red-500" : ""}
                                        />
                                        {errors[field] && (
                                            <p className="text-xs text-red-500">{errors[field]}</p>
                                        )}
                                    </div>
                                ))}

                                <Button
                                    className="w-full mt-2"
                                    onClick={sendOtp}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <span className="">Sending...</span><Loader2 className="w-4 h-4 animate-spin" />
                                        </>
                                    ) : (
                                        "Send OTP"
                                    )}
                                </Button>
                                <div className="text-center mt-4">
                                    <span className="text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            className="text-blue-600 hover:underline"
                                            onClick={() => navi("/login")}
                                        >
                                            Login
                                        </button>
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-center items-center min-h-[50vh] mt-[-100px]">
                                <div className="flex flex-col items-center space-y-4">
                                    <h3 className="text-lg font-semibold">Enter the 6-digit OTP</h3>

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
                                        <Button
                                            variant="outline"
                                            className="mt-2"
                                            onClick={sendOtp}
                                        >
                                            Resend OTP
                                        </Button>
                                    ) : (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Resend OTP in {resendTimer}s
                                        </p>
                                    )}

                                    <Button
                                        className="w-full mt-4"
                                        onClick={handleVerify}
                                        disabled={otp.length !== 6}
                                    >
                                        Verify & Register
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
