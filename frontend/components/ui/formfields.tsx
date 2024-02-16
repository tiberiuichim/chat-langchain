import React from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "./textarea";

type TextFieldInputProps = {
  id: string;
  label: string;
  description: string;
  form: unknown;
  placeholder: string;
};

type TextareaFieldInputProps = {
  rows: number;
} & TextFieldInputProps;

export const TextFieldInput: React.FC<TextFieldInputProps> = ({
  id,
  label,
  description,
  form,
  placeholder,
}) => (
  <FormField
    control={form.control}
    name={id}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input placeholder={placeholder} {...field} />
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);

export const TextareaFieldInput: React.FC<TextareaFieldInputProps> = ({
  id,
  label,
  description,
  form,
  placeholder,
  ...rest
}) => (
  <FormField
    control={form.control}
    name={id}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <div className="grid w-full gap-2">
            <Textarea placeholder={placeholder} {...field} {...rest} />
          </div>
        </FormControl>
        <FormDescription>{description}</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
);
