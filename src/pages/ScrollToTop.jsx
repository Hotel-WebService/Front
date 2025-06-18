import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // 히스토리 복원 방지
        if ("scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
        }

        // 무조건 최상단 이동
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

export default ScrollToTop;