import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from "react";
import { UserManager, User } from "oidc-client-ts";
import jwt_decode from "jwt-decode";
import { generateRedirectUri, getOidcConfig } from "./config";

/**
 * Helper hook to throw errors properly within components
 */
const useThrow = () => {
  const [, setState] = useState();
  const callback = useCallback(
    (error: Error) =>
      setState(() => {
        throw error;
      }),
    [setState]
  );
  return callback;
};

// Singleton UserManager instance
let userManager: UserManager;
const getUserManager = () => {
  if (!userManager) {
    userManager = new UserManager(getOidcConfig());
  }
  return userManager;
};

type AuthContextProps = {
  user: User;
  roles: string[];
  logout: () => void;
};

/**
 * Context provider for user data and logout action trigger
 */
export const AuthContext = React.createContext<AuthContextProps | null>(null);

type AuthProps = PropsWithChildren<{
  location?: Location;
  history?: History;
}>;

type Role = "ROLE_ADMIN" | "ROLE_GESTOR" | "ROLE_USER";

interface JWTToken {
  resource_access: {
    "al-checkit-ui": {
      roles: Role[];
    };
  };
}

/**
 * Main Auth component - to wrap the protected section of an app.
 */
export const Auth: React.FC<AuthProps> = ({
  children,
  location = window.location,
  history = window.history,
}) => {
  const userManager = getUserManager();
  const throwError = useThrow();
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        // Try to get user information
        const user = await userManager.getUser();

        if (user && user.access_token && !user.expired) {
          // User authenticated
          // NOTE: the oidc-client-ts-js library never returns null if the user is not authenticated
          // Checking for existence of BOTH access_token and expired field seems OK
          // Checking only for expired field is not enough
          setUser(user);
          const token = jwt_decode<JWTToken>(user.access_token);
          setRoles(token.resource_access["al-checkit-ui"]?.roles || []);
        } else {
          // User not authenticated -> trigger auth flow
          await userManager.signinRedirect({
            redirect_uri: generateRedirectUri(location.href),
          });
        }
      } catch (error) {
        throwError(error as Error);
      }
    };
    getUser();
  }, [location, history, throwError, setUser]);

  useEffect(() => {
    // Refreshing react state when new state is available in e.g. session storage
    const updateUserData = async () => {
      try {
        const user = await userManager.getUser();
        setUser(user);
        const token = jwt_decode<JWTToken>(user!.access_token);
        setRoles(token.resource_access["al-checkit-ui"]?.roles || []);
      } catch (error) {
        throwError(error as Error);
      }
    };

    userManager.events.addUserLoaded(updateUserData);

    // Unsubscribe on component unmount
    return () => userManager.events.removeUserLoaded(updateUserData);
  }, [throwError, setUser]);

  useEffect(() => {
    // Force log in if session cannot be renewed on background
    const handleSilentRenewError = async () => {
      try {
        await userManager.signinRedirect({
          redirect_uri: generateRedirectUri(location.href),
        });
      } catch (error) {
        throwError(error as Error);
      }
    };

    userManager.events.addSilentRenewError(handleSilentRenewError);

    // Unsubscribe on component unmount
    return () =>
      userManager.events.removeSilentRenewError(handleSilentRenewError);
  }, [location, throwError, setUser]);

  const logout = useCallback(() => {
    const handleLogout = async () => {
      await userManager.signoutRedirect();
    };
    handleLogout();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, logout, roles }}>
      {children}
    </AuthContext.Provider>
  );
};
