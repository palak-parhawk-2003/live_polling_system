import { useEffect, useState } from "react";
import socket from "../socket";
import {
    Box, TextField, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio, Alert,
} from "@mui/material";
import ChatBox from "../components/ChatBox";

export default function Student() {
    const [name, setName] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [currentPoll, setCurrentPoll] = useState(null);
    const [selected, setSelected] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);
    const [answered, setAnswered] = useState(false);
    const [results, setResults] = useState(null);
    const [kicked, setKicked] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        if (!currentPoll || answered || timeLeft <= 0) return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [currentPoll, answered, timeLeft]);

    useEffect(() => {
        const storedName = sessionStorage.getItem("studentName");
        if (storedName) {
            setName(storedName);
            setSubmitted(true);
            socket.emit("student_joined", storedName, () => {
                socket.emit("get_student_list");
            });
        }
        socket.on("poll_question", (poll) => {
            setCurrentPoll(poll);
            setTimeLeft(poll.duration);
            setAnswered(false);
            setSelected("");
            setResults(null);
        });
        socket.on("poll_results", (results) => {
            setResults(results);
        });
        socket.on("kicked", () => {
            setKicked(true);
            sessionStorage.clear();
            setSubmitted(false);
            setAnswered(false);
            setResults(null);
            setCurrentPoll(null);
            setSelected("");
            setTimeLeft(0);
            setTimeout(() => {
                setKicked(false);
            }, 20000);
        })
        return () => {
            socket.off("poll_question");
            socket.off("poll_results");
            socket.off("kicked");
        }
    }, []);

    useEffect(() => {
        if (!kicked && !submitted) {
            const storedName = sessionStorage.getItem("studentName");
            if (storedName) {
                setName(storedName);
                setSubmitted(true);
                socket.emit("student_joined", storedName);
            }
        }
    }, [kicked]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        sessionStorage.setItem("studentName", name.trim());
        setSubmitted(true);
        socket.emit("student_joined", name.trim());
    };

    const submitAnswer = () => {
        if (!selected || !currentPoll) return;
        socket.emit("submit_answer", { name, answer: selected });
        setAnswered(true);
    };

    return (
        <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={4} bgcolor="green.50">
            {kicked && (
                <Alert severity="error" sx={{ mb: 4, width: "100%", maxWidth: 400 }}>
                    You have been kicked out. You can rejoin in 20 seconds.
                </Alert>
            )}

            {!submitted && !kicked ? (
                <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
                    <Typography variant="h5" gutterBottom>
                        Enter Your Name
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Your name"
                            fullWidth
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <Button type="submit" variant="contained" color="success" fullWidth>
                            Join Poll
                        </Button>
                    </form>
                </Paper>
            ) : (
                <>
                    <Typography variant="h6" gutterBottom>
                        Welcome, {name}
                    </Typography>

                    {currentPoll && !answered && timeLeft > 0 && (
                        <Paper elevation={4} sx={{ mt: 4, p: 3, width: "100%", maxWidth: 500 }}>
                            <Typography variant="h6" gutterBottom>
                                {currentPoll.question}
                            </Typography>

                            <RadioGroup
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                            >
                                {currentPoll.options.map((opt, idx) => (
                                    <FormControlLabel
                                        key={idx}
                                        value={opt}
                                        control={<Radio />}
                                        label={opt}
                                    />
                                ))}
                            </RadioGroup>

                            <Button
                                variant="contained"
                                color="success"
                                onClick={submitAnswer}
                                disabled={!selected}
                                sx={{ mt: 2 }}
                            >
                                Submit
                            </Button>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Time left: {timeLeft}s
                            </Typography>
                        </Paper>
                    )}

                    {(answered || timeLeft === 0) && !kicked && (
                        <>
                            <Typography color="success.main" sx={{ mt: 4 }}>
                                Thanks! Waiting for results...
                            </Typography>

                            {results && (
                                <Paper sx={{ mt: 4, p: 3, width: "100%", maxWidth: 500 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Poll Results
                                    </Typography>
                                    <ul style={{ paddingLeft: 16 }}>
                                        {Object.entries(results).map(([option, count]) => (
                                            <li key={option}>
                                                <strong>{option}</strong>: {count} votes
                                            </li>
                                        ))}
                                    </ul>
                                </Paper>
                            )}
                        </>
                    )}
                </>
            )}
            <Button
                variant="contained"
                sx={{
                    position: "fixed",
                    bottom: 16,
                    right: 16,
                    borderRadius: "50%",
                    minWidth: 56,
                    minHeight: 56,
                    fontSize: 24,
                }}
                onClick={() => setShowChat(!showChat)}
            >
                💬
            </Button>

            {showChat && (
                <ChatBox name={name} role="student" onClose={() => setShowChat(false)} />
            )}

        </Box>
    );
}