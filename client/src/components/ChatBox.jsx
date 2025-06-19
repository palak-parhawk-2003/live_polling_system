import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import {
    Box, Typography, Paper, TextField, Button, IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function ChatBox({ name, role, onClose }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            console.log("📩 Received message:", msg);
            setMessages((prev) => [...prev, msg]);
        };

        socket.on("receive_message", handleReceiveMessage);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim()) return;
        socket.emit("send_message", { sender: name, role, message: input.trim() });
        setInput("");
    };

    return (
        <Paper
            elevation={4}
            sx={{
                position: "fixed",
                bottom: 20,
                right: 20,
                width: 300,
                height: 400,
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                p={1}
                bgcolor="primary.main"
                color="white"
            >
                <Typography variant="subtitle1">Live Chat</Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: "white" }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Box
                flex={1}
                overflow="auto"
                p={1}
                bgcolor="#f5f5f5"
                sx={{ wordBreak: "break-word" }}
            >
                {messages.map((msg, idx) => (
                    <Box key={idx} mb={1}>
                        <Typography variant="caption" color="textSecondary">
                            {msg.sender} ({msg.role})
                        </Typography>
                        <Typography variant="body2">{msg.message}</Typography>
                    </Box>
                ))}
                <div ref={messagesEndRef} />
            </Box>

            <Box display="flex" p={1} gap={1}>
                <TextField
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button variant="contained" onClick={sendMessage}>
                    Send
                </Button>
            </Box>
        </Paper>
    );
}
