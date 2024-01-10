import { MouseEvent } from "react";
// import {
//   Heading,
//   Link,
//   Card,
//   CardHeader,
//   Flex,
//   Spacer,
// } from "@chakra-ui/react";

import { Card, CardHeader } from "@/components/ui/card";

function QuestionCard(props: {
  onClick: (e: MouseEvent) => void;
  question: string;
}) {
  return (
    <Card
      onClick={props.onClick}
      onKeyDown={props.onClick}
      width={"48%"}
      backgroundColor={"rgb(58, 58, 61)"}
      _hover={{ backgroundColor: "rgb(78,78,81)" }}
      cursor={"pointer"}
      justifyContent={"center"}
    >
      <CardHeader justifyContent={"center"}>
        <div
          fontSize="lg"
          fontWeight={"medium"}
          mb={1}
          color={"gray.200"}
          textAlign={"center"}
        >
          {props.question}
        </div>
      </CardHeader>
    </Card>
  );
}

export function EmptyState(props: {
  questions: string[];
  onChoice: (question: string) => any;
}) {
  const handleClick = (e: MouseEvent) => {
    props.onChoice((e.target as HTMLDivElement).innerText);
  };
  const { questions } = props;
  return (
    <div className="rounded flex flex-col items-center max-w-full md:p-8">
      <div
        className="text-3xl text-white"
        fontSize="3xl"
        fontWeight={"medium"}
        mb={1}
        color={"white"}
      >
        Chat with (some) EEA documents
      </div>
      <div
        className="text-xl text-white"
        fontSize="xl"
        fontWeight={"normal"}
        mb={1}
        color={"white"}
        marginTop={"10px"}
        textAlign={"center"}
      >
        Try one of the questions bellow
      </div>
      <div marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <QuestionCard question={questions[0]} onClick={handleClick} />
        <QuestionCard question={questions[1]} onClick={handleClick} />
      </div>
      <div marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <QuestionCard question={questions[2]} onClick={handleClick} />
        <QuestionCard question={questions[3]} onClick={handleClick} />
      </div>
    </div>
  );
}
