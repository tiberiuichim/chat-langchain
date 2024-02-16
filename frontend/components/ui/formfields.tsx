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
import { Checkbox } from "./checkbox";
import type { Control, FieldValues } from "react-hook-form";

type InputFieldProps = {
  id: string;
  label: string;
  description: React.ReactNode;
  form: unknown;
  placeholder: string;
};

type FormFieldProps = InputFieldProps & {
  form: {
    control: Control;
  };
  children: ({ field }: { field: FieldValues }) => React.ReactNode;
};

type TextareaFieldInputProps = {
  rows: number;
} & FormFieldProps;

export const FormFieldWrapper: React.FC<FormFieldProps> = ({
  id,
  label,
  description,
  form,
  children,
}) => {
  return (
    <FormField
      control={form.control}
      name={id}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>{children({ field })}</FormControl>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const TextFieldInput: React.FC<FormFieldProps> = (props) => (
  <FormFieldWrapper {...props}>
    {({ field }) => <Input placeholder={props.placeholder} {...field} />}
  </FormFieldWrapper>
);

export const TextareaFieldInput: React.FC<TextareaFieldInputProps> = (
  props,
) => (
  <FormFieldWrapper {...props}>
    {({ field }) => (
      <div className="grid w-full gap-2">
        <Textarea
          placeholder={props.placeholder}
          rows={props.rows}
          {...field}
        />
      </div>
    )}
  </FormFieldWrapper>
);

export const CheckboxFieldInput: React.FC<FormFieldProps> = ({
  id,
  form,
  label,
  description,
}) => (
  <FormField
    control={form.control}
    name={id}
    render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={(v) => {
              field.onChange(v);
            }}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>{label}</FormLabel>
          <FormDescription>{description}</FormDescription>
        </div>
      </FormItem>
    )}
  />
);
