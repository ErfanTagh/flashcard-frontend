import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { setPostLoginDest } from "@/lib/postLogin";

/**
 * Stands in for Auth0's withAuthenticationRequired: a signed-out visitor is
 * sent away and brought back here afterwards.
 *
 * options.screen = "signup" sends them to create an account rather than to
 * sign in -- right for a deck link, which is mostly opened by people who do
 * not have an account yet -- with `reason` telling that page what to say.
 * Either page links to the other, and both carry the way back.
 */
export function withAuthenticationRequired(Component, options = {}) {
  const { screen = "login", reason } = options;

  return function Protected(props) {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (isLoading || isAuthenticated) return;
      const here = location.pathname + location.search;
      setPostLoginDest(here);
      const query = new URLSearchParams({ returnTo: here });
      if (reason) query.set("reason", reason);
      navigate(`/${screen === "signup" ? "signup" : "login"}?${query}`, { replace: true });
    }, [isLoading, isAuthenticated, location.pathname, location.search, navigate]);

    if (!isAuthenticated) return null;
    return <Component {...props} />;
  };
}
