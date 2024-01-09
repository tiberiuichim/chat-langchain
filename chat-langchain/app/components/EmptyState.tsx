import { MouseEvent } from "react";
import {
  Heading,
  Link,
  Card,
  CardHeader,
  Flex,
  Spacer,
} from "@chakra-ui/react";

function QuestionCard({ onClick, question }) {
  return <Card
    onClick={onClick}
    onKeyDown={onClick}
    width={"48%"}
    backgroundColor={"rgb(58, 58, 61)"}
    _hover={{ backgroundColor: "rgb(78,78,81)" }}
    cursor={"pointer"}
    justifyContent={"center"}
  >
    <CardHeader justifyContent={"center"}>
      <Heading
        fontSize="lg"
        fontWeight={"medium"}
        mb={1}
        color={"gray.200"}
        textAlign={"center"}
      >
        {question}
      </Heading>
    </CardHeader>
  </Card>
}

export function EmptyState(props: { questions: string[], onChoice: (question: string) => any }) {
  const handleClick = (e: MouseEvent) => {
    props.onChoice((e.target as HTMLDivElement).innerText);
  };
  const { questions } = props
  return (
    <div className="rounded flex flex-col items-center max-w-full md:p-8">
      <Heading fontSize="3xl" fontWeight={"medium"} mb={1} color={"white"}>
        Chat with (some) EEA documents
      </Heading>
      <Heading
        fontSize="xl"
        fontWeight={"normal"}
        mb={1}
        color={"white"}
        marginTop={"10px"}
        textAlign={"center"}
      >
        Try one of the questions bellow
      </Heading>
      <Flex marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <QuestionCard question={questions[0]} onClick={handleClick} />
        <Spacer />
        <QuestionCard question={questions[1]} onClick={handleClick} />
      </Flex>
      <Flex marginTop={"25px"} grow={1} maxWidth={"800px"} width={"100%"}>
        <QuestionCard question={questions[2]} onClick={handleClick} />
        <Spacer />
        <QuestionCard question={questions[3]} onClick={handleClick} />
      </Flex>
    </div>
  );
}
