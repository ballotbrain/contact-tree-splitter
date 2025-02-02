import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type ContactFormData = z.infer<typeof formSchema>;

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PreviewDialog = ({ open, onOpenChange }: PreviewDialogProps) => {
  const [sendEnabled, setSendEnabled] = useState(false);
  const { toast } = useToast();
  const form = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  const onSubmit = (data: ContactFormData) => {
    if (!sendEnabled) {
      toast({
        title: "Enable sending",
        description: "Please enable sending using the toggle before submitting",
      });
      return;
    }
    
    console.log("Preview sent to:", data);
    toast({
      title: "Preview Sent",
      description: `Preview has been sent to ${data.phone}`,
    });
    onOpenChange(false);
    form.reset();
    setSendEnabled(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Preview</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="(555) 555-5555" 
                      {...field} 
                      required
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between">
              <Toggle 
                pressed={sendEnabled}
                onPressedChange={setSendEnabled}
                className="data-[state=on]:bg-green-500"
              >
                Enable Sending
              </Toggle>
              <Button type="submit">Send Preview</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;