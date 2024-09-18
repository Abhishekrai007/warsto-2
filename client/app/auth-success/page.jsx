"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/auth/authSlice";

const AuthSuccess = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      localStorage.setItem("token", token);
      dispatch(setUser(token));
      setTimeout(() => router.push("/"), 100);
    }
  }, [router, dispatch]);

  return <div>Redirecting...</div>;
};

export default AuthSuccess;
