import { t } from "@lingui/core/macro";
import { Rocket } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo() {
    return (
        <Link
            to="/"
            className="flex items-center justify-center space-x-2 group">
            <Rocket className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                {t`BlockFund`}
            </span>
        </Link>
    );
}
