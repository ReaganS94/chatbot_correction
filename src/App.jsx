import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import "./App.css";

function App() {
  const [userInput, setUserInput] = useState("");
  const [disableInput, setDisableInput] = useState(false);
  const [gptBody, setGptBody] = useState({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: "Hello, I need help",
      },
      {
        role: "assistant",
        content: "Of course, how can I help you today",
      },
    ],
    stream: false,
  });

  useEffect(() => {
    const userCount = localStorage.getItem("user");
    if (!userCount) localStorage.setItem("user", 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userCount = parseInt(localStorage.getItem("user"), 10);

    if (userCount >= 5) {
      setDisableInput(true);
      return;
    }

    localStorage.setItem("user", userCount + 1);

    // Add message to array of messages
    // when the user submits the form, we should add the submitted string to the messages array. Before adding it to the messages array, we need to transform it into an object. The role will always be user, and the userInput needs to be added under "content"
    const updatedMessages = [
      ...gptBody.messages,
      { role: "user", content: userInput },
    ];

    setGptBody((prev) => ({
      // FLAG RAISED
      ...prev,
      messages: updatedMessages,
    }));

    console.log("GPT BODY INSIDE SUBMIT HANDLER: ", gptBody);

    // reset the user input
    setUserInput("");
    // send array of messages to gpt API
    try {
      const res = await fetch("http://localhost:5050/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          provider: "open-ai",
          mode: "development",
        },
        body: JSON.stringify({ ...gptBody, messages: updatedMessages }),
      });

      const data = await res.json();

      console.log(data);

      setGptBody((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { role: "assistant", content: data.message.content },
        ],
      }));
    } catch (error) {
      console.log("WHOOPS", error);
    }
    // add the received answer to the array of messages
  };

  return (
    <>
      <h1 style={{ color: "red" }}>
        ASSIGN FORMS EXERCISE AFTER THIS CORRECTION
      </h1>
      <h1>Chatbot Correction</h1>

      {gptBody.messages.map((message, index) => (
        <div key={index} style={{ padding: "5px" }}>
          <p
            style={{
              color: message.role === "assistant" ? "red" : "blueviolet",
            }}
          >
            {message.role}:
          </p>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={disableInput}
        />
      </form>
    </>
  );
}

export default App;
