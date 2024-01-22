import {
  Table,
  TableCaption,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "./ui/table";

type Record = {
  title: string;
  page?: string;
  file_path?: string;
  source: string;
  text: string;
};

type RecordsExplorerProps = {
  records: Record[];
};

export const RecordsExplorer: React.FC<RecordsExplorerProps> = ({
  records,
}) => {
  return (
    <Table>
      <TableCaption></TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Text</TableHead>
          {/* <TableHead className="w-[100px]">Source</TableHead> */}
          <TableHead>Title</TableHead>
          <TableHead className="text-right">Page</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((rec, i) => (
          <TableRow key={i}>
            <TableCell>{rec.text}</TableCell>
            {/* <TableCell className="font-medium">{rec.source}</TableCell> */}
            <TableCell>{rec.title}</TableCell>
            <TableCell className="text-right">{rec.page}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
