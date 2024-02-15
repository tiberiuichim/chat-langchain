"use client";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { TextFieldInput, TextareaFieldInput } from "@/components/ui/formfields";
import { toast } from "@/components/ui/use-toast";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const minMsg = "Needs to be at least 2 characters";

const formSchema = z.object({
  titleText: z.string().min(2, {
    message: minMsg,
  }),
  placeholder: z.string().min(2, { message: minMsg }),
  presetQuestions: z.string().min(2, { message: minMsg }),
});

export default function SettingsPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titleText: "",
      placeholder: "",
      presetQuestions: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <div className={`rounded px-4 py-2 max-w-[80%] mb-8 flex`}>
      <section>
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
              id="presetQuestions"
              label="Preset default questions"
              placeholder="Tell me a joke"
              description="These will be used for the question cards on the frontpage"
              rows={4}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </section>
    </div>
  );
}
