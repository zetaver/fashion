import { useEffect } from "react";
import { useRouter } from "next/router";
import { setCookie } from "nookies";

const GoogleCallback = () => {
  const router = useRouter();

  useEffect(() => {
    const { token, user } = router.query;

    if (token && user) {
      // Storing data in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);

      // Optionally store token in cookies
      setCookie(null, "token", token, { path: "/" });

      // Redirect to dashboard
      router.push("/dashboard/zain");
    }
  }, [router]);

  return <div>Processing Google Login...</div>;
};

export default GoogleCallback;
