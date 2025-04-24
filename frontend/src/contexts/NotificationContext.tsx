import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from "react";

interface NotificationContextType {
    forceRefreshBadge: () => void;
    lastRefreshed: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

    const forceRefreshBadge = useCallback(() => {
        setLastRefreshed(Date.now());
    }, []);

    return (
        <NotificationContext.Provider
            value={{ forceRefreshBadge, lastRefreshed }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error(
            "useNotifications must be used within a NotificationProvider"
        );
    }
    return context;
}
