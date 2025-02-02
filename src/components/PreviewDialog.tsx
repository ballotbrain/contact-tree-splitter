import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
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

// Mock data for previous contacts - in a real app, this would come from an API or database
const previousContacts = [
  { firstName: "Terrence", lastName: "Curtiss", phone: "+1 (914) 979-0417" },
  { firstName: "AB", lastName: "CD", phone: "+1 (765) 585-8841" },
  { firstName: "Caleb", lastName: "Krueger", phone: "+1 (562) 371-7992" },
  { firstName: "Noah", lastName: "Betz", phone: "+1 (281) 928-2089" },
  { firstName: "Santiago", lastName: "Fonn", phone: "+1 (817) 687-9558" },
];

const PreviewDialog = ({ open, onOpenChange }: PreviewDialogProps) => {
  const [showNewContactForm, setShowNewContactForm] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
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
    console.log("Preview sent to:", data);
    toast({
      title: "Preview Sent",
      description: `Preview has been sent to ${data.phone}`,
    });
    setShowNewContactForm(false);
    form.reset();
  };

  const handleSendPreviews = () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No Contacts Selected",
        description: "Please select at least one contact to send previews",
      });
      return;
    }

    toast({
      title: "Previews Sent",
      description: `Previews sent to ${selectedContacts.length} contacts`,
    });
    setSelectedContacts([]);
  };

  const toggleContact = (phone: string) => {
    setSelectedContacts(prev => 
      prev.includes(phone) 
        ? prev.filter(p => p !== phone)
        : [...prev, phone]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Preview</DialogTitle>
        </DialogHeader>

        <Button
          variant="outline"
          onClick={() => setShowNewContactForm(true)}
          className="w-full justify-start gap-2 mb-4"
        >
          <Plus className="h-4 w-4" />
          Add Preview Contact
        </Button>

        {showNewContactForm && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-6">
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
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewContactForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save & Send</Button>
              </div>
            </form>
          </Form>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">Preview Contacts:</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {previousContacts.map((contact, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{contact.phone}</p>
                </div>
                <Toggle
                  pressed={selectedContacts.includes(contact.phone)}
                  onPressedChange={() => toggleContact(contact.phone)}
                  className="data-[state=on]:bg-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSendPreviews}
            disabled={selectedContacts.length === 0}
          >
            Send Previews ({selectedContacts.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewDialog;