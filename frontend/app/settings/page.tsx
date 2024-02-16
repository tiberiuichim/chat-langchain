"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextFieldInput, TextareaFieldInput } from "@/components/ui/formfields";
import { toast } from "@/components/ui/use-toast";
import { useBackendSettings } from "@/lib/useBackendSettings";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const minMsg = "Needs to be at least 2 characters";
import type { BackendSettings } from "@/types";

const frontmatter = `
<div className="text-3xl text-black">Chat with EEA reports</div>
<div className="text-md text-black mt-2">
  Try one of the questions bellow
</div>
`;

const tolist = (s: string) =>
  s
    .trim()
    .split("\n")
    .map((l) => l.trim());

const formSchema = z.object({
  titleText: z.string().min(2, {
    message: minMsg,
  }),
  placeholder: z.string().min(2, { message: minMsg }),
  presetQuestions: z.string().min(2, { message: minMsg }),
  frontmatter: z.string().min(2, { message: minMsg }),
});

function SettingsForm({
  data,
  mutation,
}: {
  data: BackendSettings;
  mutation: any;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titleText: data?.titleText || "",
      placeholder: data?.placeholder || "",
      presetQuestions: data?.presetQuestions?.join("\n") || "",
      frontmatter: data?.frontmatter || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    mutation.mutate({
      ...values,
      presetQuestions: tolist(values.presetQuestions),
    });

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  console.log("mut", mutation);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <TextFieldInput
          form={form}
          id="titleText"
          label="Site Title"
          placeholder="EEA Chatbot"
          description="Used on main page"
        />
        <TextFieldInput
          form={form}
          id="placeholder"
          label="Chat input box placeholder"
          placeholder="Ask a question"
          description=""
        />
        <TextareaFieldInput
          form={form}
          id="frontmatter"
          label="Frontmatter"
          placeholder={frontmatter.trim()}
          description=<>
            The frontmatter. HTML code. You need to use{" "}
            <a className="font-bold" href="https://tailwindcss.com/">
              Tailwindcss classes
            </a>
          </>
          rows={4}
        />
        <TextareaFieldInput
          form={form}
          id="presetQuestions"
          label="Preset default questions"
          placeholder="Tell me a joke"
          description="These will be used for the question cards on the frontpage. One question per line"
          rows={4}
        />
        <Button isLoading={mutation.isPending} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}

export default function SettingsPage() {
  const { query, mutation } = useBackendSettings();
  const { data } = query;

  return (
    <div className={`rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      <section>
        {!!data && <SettingsForm data={data} mutation={mutation} />}
      </section>
    </div>
  );
}
