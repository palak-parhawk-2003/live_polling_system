import { useEffect, useState } from "react";
import socket from "../socket";
import {
    Box, TextField, Button, Typography, Paper, List, ListItem, ListItemText,
} from "@mui/material";
import ChatBox from "../components/ChatBox";

export default function Teacher() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [duration, setDuration] = useState(60); // seconds
    const [results, setResults] = useState(null);
    const [pastPolls, setPastPolls] = useState([]);
    const [kickName, setKickName] = useState("");
    const [students, setStudents] = useState([]);
    const [detailedAnswers, setDetailedAnswers] = useState({});
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        socket.emit("get_current_poll_state");
        socket.emit("get_student_list");
        socket.on("poll_results", (data) => {
            setResults(data);
        });
        socket.on("poll_answers_detailed", (answers) => {
            setDetailedAnswers(answers);
        });
        socket.on("student_list", (list) => {
            setStudents(list);
        });
        socket.emit("get_past_polls");
        socket.on("past_polls", (polls) => {
            setPastPolls(polls);
        });
        return () => {
            socket.off("poll_results");
            socket.off("past_polls");
            socket.off("poll_answers_detailed");
            socket.off("student_list");
        };
    }, []);

    const getResults = (poll) => {
        const counts = {};
        poll.options.forEach((option) => (counts[option] = 0));
        Object.values(poll.answers || {}).forEach((a) => {
            if (counts[a] != undefined) counts[a]++;
        });
        return counts;
    };

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const addOption = () => {
        setOptions([...options, ""]);
    };

    const sendPoll = () => {
        const trimmedOptions = options.map((o) => o.trim()).filter(Boolean);
        if (!question.trim() || trimmedOptions.length < 2) return;

        socket.emit("new_poll", {
            question: question.trim(),
            options: trimmedOptions,
            duration,
        });

        setQuestion("");
        setOptions(["", ""]);
        alert("Poll sent!");
    };

    return (
        <Box p={4} maxWidth={800} mx="auto">
            <Typography variant="h4" gutterBottom>
                Create New Poll
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <TextField
                    label="Enter question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    fullWidth
                    margin="normal"
                />
                {options.map((opt, i) => (
                    <TextField
                        key={i}
                        label={`Option ${i + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                ))}

                <Box mt={2}>
                    <Button onClick={addOption} variant="outlined">
                        Add Option
                    </Button>
                </Box>

                <TextField
                    label="Time Limit (seconds)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    inputProps={{ min: 10, max: 300 }}
                    fullWidth
                    margin="normal"
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={sendPoll}
                    fullWidth
                    sx={{ mt: 2 }}
                >
                    Send Poll
                </Button>
            </Paper>

            {results && (
                <Paper sx={{ p: 3, mb: 4, backgroundColor: "#e3f2fd" }}>
                    <Typography variant="h6" gutterBottom>
                        Live Poll Results
                    </Typography>
                    <List>
                        {Object.entries(results).map(([option, count]) => (
                            <ListItem key={option}>
                                <ListItemText primary={`${option}: ${count} votes`} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            )}

            <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                    Past Polls
                </Typography>
                {pastPolls.map((poll, index) => (
                    <Paper key={index} sx={{ p: 2, mb: 2 }}>
                        <Typography fontWeight={600}>{poll.question}</Typography>
                        {Object.entries(getResults(poll)).map(([opt, count]) => (
                            <Typography key={opt}>
                                {opt}: {count} votes
                            </Typography>
                        ))}
                    </Paper>
                ))}
            </Box>

            <Button onClick={() => socket.emit("get_past_polls")} variant="outlined">
                Refresh Past Polls
            </Button>

            <Box mb={4}>
                <Typography variant="h6" gutterBottom>
                    Connected Students
                </Typography>
                <List>
                    {students.map((student, idx) => (
                        <ListItem key={idx}>
                            <ListItemText
                                primary={
                                    detailedAnswers[student]
                                        ? `${student} — answered: ${detailedAnswers[student]}`
                                        : student
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>

            <Box display="flex" alignItems="center" gap={2} mb={4}>
                <TextField
                    label="Student name to kick"
                    value={kickName}
                    onChange={(e) => setKickName(e.target.value)}
                    variant="outlined"
                />
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => socket.emit("kick_student", kickName)}
                >
                    Kick Student
                </Button>
            </Box>
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
                <ChatBox name="Teacher" role="teacher" onClose={() => setShowChat(false)} />
            )}

        </Box>
    );
}