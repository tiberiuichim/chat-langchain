"use client";

import { ChatWindow } from "../app/components/ChatWindow";
import { ToastContainer } from "react-toastify";

import { ChakraProvider } from "@chakra-ui/react";

export default function Home() {
  return (
    <ChakraProvider>
      <ToastContainer />
      <ChatWindow
        titleText="Ask me anything about (some) EEA documents!"
        placeholder="What is the trend for emissions in the building sector?"
        presetQuestions={[
          "How many heat pumps were sold?",
          "What is the LULUCF sector?",
          "How much did the industrial sector contribute to total gas emissions?",
          "What is the plan to tackle greenhouse emissions?"
        ]}
      ></ChatWindow>
    </ChakraProvider >
  );
}
