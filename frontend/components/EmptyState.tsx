import { Card, CardHeader } from "@/components/ui/card";

type QuestionCardProps = {
  onClick: (e: any) => void;
  question: string;
};

function QuestionCard(props: QuestionCardProps) {
  return (
    <Card
      className="cursor-pointer bg-slate hover:bg-slate-100"
      onClick={props.onClick}
      onKeyDown={props.onClick}
    >
      <CardHeader>
        <div className="text-xl color-gray ">{props.question}</div>
      </CardHeader>
    </Card>
  );
}

function Row({ children }) {
  return (
    <div className="mt-2 flex space-x-4 grow max-w-xl w-full">{children}</div>
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
        className="text-3xl text-black"
        fontSize="3xl"
        fontWeight={"medium"}
        mb={1}
        color={"white"}
      >
        Chat with (some) EEA documents
      </div>
      <div
        className="text-xl text-black"
        fontSize="xl"
        fontWeight={"normal"}
        mb={1}
        color={"white"}
        marginTop={"10px"}
        textAlign={"center"}
      >
        Try one of the questions bellow
      </div>
      <Row>
        <QuestionCard question={questions[0]} onClick={handleClick} />
        <QuestionCard question={questions[1]} onClick={handleClick} />
      </Row>
      <Row>
        <QuestionCard question={questions[2]} onClick={handleClick} />
        <QuestionCard question={questions[3]} onClick={handleClick} />
      </Row>
    </div>
  );
}
