import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import moment from "moment";

const VoiceCommand = ({ onTransactionAdd }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcriptText = event.results[current][0].transcript;
      setTranscript(transcriptText);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "not-allowed") {
        toast.error("Microphone permission denied. Please enable it in browser settings.");
      } else if (event.error === "no-speech") {
        toast.info("No speech detected. Try again.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Process command when transcript changes and listening stops
  useEffect(() => {
    if (!isListening && transcript) {
      const timer = setTimeout(() => {
        processVoiceCommand(transcript);
        setTranscript(""); // Clear after processing
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isListening, transcript, onTransactionAdd]);

  const processVoiceCommand = (text) => {
    const lowerText = text.toLowerCase().trim();

    // Patterns for voice commands
    // Examples:
    // "add expense 500 for food"
    // "add income 2000 salary"
    // "spent 300 on travel"
    // "earned 5000 freelance"

    let type = null;
    let amount = null;
    let tag = "miscellaneous";
    let name = "";

    // Detect transaction type
    if (
      lowerText.includes("expense") ||
      lowerText.includes("spent") ||
      lowerText.includes("spend") ||
      lowerText.includes("paid")
    ) {
      type = "expense";
    } else if (
      lowerText.includes("income") ||
      lowerText.includes("earned") ||
      lowerText.includes("received") ||
      lowerText.includes("salary")
    ) {
      type = "income";
    }

    // Extract amount (look for numbers)
    const amountMatch = lowerText.match(/(\d+(?:\.\d+)?)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    // Extract tag/category (common categories)
    const categories = [
      "food",
      "travel",
      "shopping",
      "health",
      "education",
      "office",
      "bills",
      "salary",
      "freelance",
      "investment",
    ];

    for (const category of categories) {
      if (lowerText.includes(category)) {
        tag = category;
        break;
      }
    }

    // Extract name/description (text after "for" or "on")
    const forMatch = lowerText.match(/(?:for|on)\s+(.+?)(?:\s+(?:rupee|rs|₹))?$/i);
    if (forMatch) {
      name = forMatch[1].trim();
    } else {
      // Use first few words as name
      const words = lowerText.split(/\s+/);
      const relevantWords = words.slice(0, 3).join(" ");
      name = relevantWords || "Voice Transaction";
    }

    // Validate and create transaction
    if (type && amount && amount > 0) {
      const transaction = {
        type,
        amount,
        tag,
        name: name || `${type} transaction`,
        date: moment().format("YYYY-MM-DD"),
      };

      onTransactionAdd(transaction);
      setTranscript("");
      toast.success(`Added ${type}: ₹${amount} for ${tag}`);
    } else {
      toast.error(
        "Couldn't understand the command. Try: 'Add expense 500 for food' or 'Add income 2000 salary'"
      );
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition not supported in this browser.");
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      if (error.message.includes("already started")) {
        recognitionRef.current.stop();
        setTimeout(() => recognitionRef.current.start(), 100);
      } else {
        toast.error("Failed to start voice recognition.");
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const isSupported = !!(
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  if (!isSupported) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">
          Voice commands are not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
      <button
        onClick={isListening ? stopListening : startListening}
        className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
          isListening
            ? "bg-red-500 hover:bg-red-600 animate-pulse"
            : "bg-primary-600 hover:bg-primary-700"
        } text-white shadow-lg`}
        title={isListening ? "Stop listening" : "Start voice command"}
      >
        {isListening ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v4a1 1 0 11-2 0V7zM12 9a1 1 0 10-2 0v2a1 1 0 102 0V9z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>

      {isListening && (
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">Listening...</p>
          <p className="text-xs text-gray-500 mt-1">
            Say: "Add expense 500 for food" or "Add income 2000 salary"
          </p>
        </div>
      )}

      {transcript && !isListening && (
        <p className="text-xs text-gray-600 italic">"{transcript}"</p>
      )}

      <div className="text-xs text-gray-500 text-center mt-2">
        <p className="font-semibold mb-1">Voice Command Examples:</p>
        <p>"Add expense 500 for food"</p>
        <p>"Add income 2000 salary"</p>
        <p>"Spent 300 on travel"</p>
      </div>
    </div>
  );
};

export default VoiceCommand;

