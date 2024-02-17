import { Tasks } from "@/components/Tasks";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type QuestionCardProps = {
  onClick: (e: React.SyntheticEvent) => void;
  question: string;
  className?: string;
};

function QuestionCard(props: QuestionCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer bg-slate hover:bg-slate-100",
        props.className,
      )}
      onClick={props.onClick}
      onKeyDown={props.onClick}
    >
      <CardHeader>
        <div className="text-lg color-gray ">{props.question}</div>
      </CardHeader>
    </Card>
  );
}

const Grid = (props: { children: React.JSX.Element[] }) => {
  return (
    <div className="grid grid-cols-2 mt-2 space-y-4 space-x-4 grow max-w-xl w-full">
      {props.children}
    </div>
  );
};

type EmptyStateProps = {
  questions: string[];
  onChoice: (question: string) => void;
  frontmatter: string;
  show_activities_dropdown: boolean;
  // titleText: string;
};

export function EmptyState(props: EmptyStateProps) {
  const { questions, frontmatter, show_activities_dropdown } = props;

  const handleClick = (e: React.SyntheticEvent) => {
    props.onChoice((e.target as HTMLDivElement).innerText);
  };

  return (
    <div className="rounded flex flex-col items-center max-w-full md:p-8">
      {!!show_activities_dropdown && (
        <div className="mb-10">
          <Tasks />
        </div>
      )}

      <div
        className="frontmatter"
        dangerouslySetInnerHTML={{ __html: frontmatter }}
      />
      <Grid>
        <QuestionCard
          question={questions[0]}
          onClick={handleClick}
          className="ml-4 mt-4"
        />
        <QuestionCard question={questions[1]} onClick={handleClick} />
        <QuestionCard question={questions[2]} onClick={handleClick} />
        <QuestionCard question={questions[3]} onClick={handleClick} />
      </Grid>
    </div>
  );
}
