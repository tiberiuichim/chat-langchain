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
      ></ChatWindow>
    </ChakraProvider>
  );
}
