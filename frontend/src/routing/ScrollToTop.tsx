import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // usuń fokus z elementu (często to on ściąga scroll do “miejsca 50”)
        if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
        }

        // zresetuj scroll po renderze
        requestAnimationFrame(() => {
            const el = document.scrollingElement || document.documentElement;
            el.scrollTop = 0;
            el.scrollLeft = 0;
            // awaryjnie też window:
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
        });
    }, [pathname, search]);

    return null;
}
