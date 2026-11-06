import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setPostLoginDest } from "@/lib/postLogin";

/**
 * Stands in for Auth0's withAuthenticationRequired: a signed-out visitor is
 * sent to the sign-in page and brought back here afterwards.
 */
export function withAuthenticationRequired(Component) {
  return function Protected(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (isLoading || isAuthenticated) return;
      setPostLoginDest(location.pathname + location.search);
      navigate("/login", { replace: true });
    }, [isLoading, isAuthenticated, location.pathname, location.search, navigate]);

    if (!isAuthenticated) return null;
    return <Component {...props} />;
  };
}
