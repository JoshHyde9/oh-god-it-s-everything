"use client";
import type { App } from "./api/[[...route]]/route";
import type { User } from "@prisma/client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { treaty } from "@elysiajs/eden";
import { z } from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export const { api } = treaty<App>("localhost:3000");

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export default function Home() {
  const registerUser = async (values: z.infer<typeof formSchema>) => {
    try {
      const { data, error } = await api.user.create.post(values);

      if (error) throw error;

      return data;
    } catch (error) {
      throw error;
    }
  };

  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const { mutate } = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllUsers"] });
    },
  });

  const { data, isPending } = useQuery({
    queryKey: ["getAllUsers"],
    queryFn: () => api.user.allUsers.get(),
  });

  const { data: welcomeMessage } = useQuery({
    queryKey: ["helloWorld"],
    queryFn: () => api.hello.get(),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-bold text-3xl mb-4">
          Hello from Nextjs, TailwindCSS, Shadcn UI, Elysiajs, Prisma & Tanstack
          Query
        </h1>

        <h2 className="text-center text-2xl">{!isPending ? welcomeMessage?.data : "Loading..."}</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Jim" {...field} />
                </FormControl>
                <FormDescription>
                  This is your public display name.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="jim@jim.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="mt-5">
            Submit
          </Button>
        </form>
      </Form>

      {isPending && !data && <p className="mt-5">Loading...</p>}

      <div className="mt-5">
        {!isPending &&
          data?.data &&
          data?.data.map((user: User) => (
            <div key={user.id} className="border-b mt-5 pb-2">
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          ))}
      </div>
    </div>
  );
}
