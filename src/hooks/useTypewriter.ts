import { useState, useEffect } from "react";

export function useTypewriter(text: string, speed: number = 30, startTyping: boolean = false) {
    const [typingState, setTypingState] = useState({ text: "", displayed: "" });

    useEffect(() => {
        if (!startTyping) return;

        let i = 0;
        const interval = setInterval(() => {
            setTypingState({ text, displayed: text.slice(0, i + 1) });
            i++;
            if (i >= text.length) clearInterval(interval);
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, startTyping]);

    if (!startTyping || typingState.text !== text) return "";
    return typingState.displayed;
}
