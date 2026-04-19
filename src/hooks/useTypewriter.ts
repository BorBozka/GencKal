import { useState, useEffect } from "react";

export function useTypewriter(text: string, speed: number = 30, startTyping: boolean = false) {
    const [displayed, setDisplayed] = useState("");

    useEffect(() => {
        if (!startTyping) {
            setDisplayed("");
            return;
        }

        let i = 0;
        const interval = setInterval(() => {
            setDisplayed(text.slice(0, i + 1));
            i++;
            if (i >= text.length) clearInterval(interval);
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, startTyping]);

    return displayed;
}