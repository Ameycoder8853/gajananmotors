
'use client';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle2, XCircle, Clock, ShieldQuestion, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { User } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const dealerFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  phone: z.string().min(10, "Phone number is required."),
});


export default function DealersPage() {
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const dealersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), where('role', '==', 'dealer'));
    }, [firestore]);

    const { data: dealers, isLoading } = useCollection<User>(dealersQuery);
    
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof dealerFormSchema>>({
      resolver: zodResolver(dealerFormSchema),
    });

    useEffect(() => {
      if (selectedUser) {
        form.reset({
          name: selectedUser.name,
          phone: selectedUser.phone,
        });
      }
    }, [selectedUser, form]);

    const handleViewDetails = (user: User) => {
        setSelectedUser(user);
        setIsDialogOpen(true);
    };

    const handleApprove = (userId: string) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userDocRef, { verificationStatus: 'verified' });
        toast({ title: 'Dealer Approved', description: 'The dealer has been marked as verified.' });
        setIsDialogOpen(false);
    };

    const handleReject = (userId: string) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userDocRef, { verificationStatus: 'rejected' });
        toast({ variant: 'destructive', title: 'Dealer Rejected', description: 'The dealer has been marked as rejected.' });
        setIsDialogOpen(false);
    };
    
    const handleUnverify = (userId: string) => {
        if (!firestore) return;
        const userDocRef = doc(firestore, 'users', userId);
        updateDocumentNonBlocking(userDocRef, { verificationStatus: 'unverified' });
        toast({ title: 'Dealer Unverified', description: 'The dealer has been marked as unverified.' });
        setIsDialogOpen(false);
    };

    async function onInfoSubmit(values: z.infer<typeof dealerFormSchema>) {
      if (!selectedUser || !firestore) return;
      const userDocRef = doc(firestore, 'users', selectedUser.id);
      updateDocumentNonBlocking(userDocRef, values);
      toast({ title: 'Dealer Updated', description: "The dealer's information has been saved." });
      setIsDialogOpen(false);
    }

    const VerificationStatusBadge = ({ status }: { status: User['verificationStatus'] }) => {
        switch (status) {
            case 'verified':
                return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="mr-1 h-3 w-3" />Verified</Badge>;
            case 'pending':
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
            case 'rejected':
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
            case 'unverified':
            default:
                return <Badge variant="outline"><ShieldQuestion className="mr-1 h-3 w-3" />Unverified</Badge>;
        }
    };


  return (
    <>
    <Card className="animate-fade-in-up">
      <CardHeader>
        <CardTitle>Dealers</CardTitle>
        <CardDescription>
          A list of all dealers in the system and their verification status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <p>Loading dealers...</p>}
        {!isLoading && (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Email Verified</TableHead>
                <TableHead>Phone Verified</TableHead>
                <TableHead>
                    <span className="sr-only">Actions</span>
                </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {dealers?.map((user) => (
                <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>
                        <VerificationStatusBadge status={user.verificationStatus} />
                    </TableCell>
                    <TableCell className="text-center">
                        {user.emailVerified ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    </TableCell>
                    <TableCell className="text-center">
                        {user.isPhoneVerified ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                    </TableCell>
                    <TableCell>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             {user.verificationStatus !== 'verified' && (
                                <>
                                <DropdownMenuItem onClick={() => handleApprove(user.id)}>Approve</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleReject(user.id)}>Reject</DropdownMenuItem>
                                </>
                            )}
                             {user.verificationStatus === 'verified' && (
                                <DropdownMenuItem className="text-red-600" onClick={() => handleUnverify(user.id)}>Unverify</DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>

    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Dealer Details</DialogTitle>
                <DialogDescription>
                    View, edit, and manage details for {selectedUser?.name}.
                </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Info & Verification</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
              </TabsList>
              <TabsContent value="info">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onInfoSubmit)} className="space-y-4 py-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Full Name</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <Label>Phone Number</Label>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div>
                      <Label>Email</Label>
                      <Input value={selectedUser?.email} disabled />
                    </div>

                    <div className="space-y-2 pt-4">
                      <h3 className="font-semibold">Verification Documents</h3>
                       {selectedUser?.aadharUrl ? (
                          <a href={selectedUser.aadharUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                              Aadhar Card <ExternalLink className="h-4 w-4" />
                          </a>
                      ) : <p className="text-sm text-muted-foreground">No Aadhar Card uploaded.</p>}
                      {selectedUser?.panUrl ? (
                          <a href={selectedUser.panUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                              PAN Card <ExternalLink className="h-4 w-4" />
                          </a>
                      ) : <p className="text-sm text-muted-foreground">No PAN Card uploaded.</p>}
                      {selectedUser?.shopLicenseUrl ? (
                           <a href={selectedUser.shopLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                              Shop License <ExternalLink className="h-4 w-4" />
                          </a>
                      ) : <p className="text-sm text-muted-foreground">No Shop License uploaded.</p>}
                    </div>

                    <DialogFooter className="pt-4">
                       <div className="flex-1 flex justify-start gap-2">
                            {selectedUser?.verificationStatus !== 'verified' ? (
                                <>
                                    <Button type="button" variant="outline" onClick={() => handleReject(selectedUser!.id)}>Reject</Button>
                                    <Button type="button" onClick={() => handleApprove(selectedUser!.id)}>Approve</Button>
                                </>
                            ) : (
                                <Button type="button" variant="destructive" onClick={() => handleUnverify(selectedUser!.id)}>Unverify</Button>
                            )}
                        </div>
                      <Button type="submit">Save Changes</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="subscription">
                 <div className="space-y-4 py-4">
                  {selectedUser?.isPro ? (
                    <>
                      <div>
                        <Label>Current Plan</Label>
                        <p className="font-semibold">{selectedUser.subscriptionType}</p>
                      </div>
                       <div>
                        <Label>Ad Credits Remaining</Label>
                        <p className="font-semibold">{selectedUser.adCredits}</p>
                      </div>
                       <div>
                        <Label>Subscription Start</Label>
                        <p className="font-semibold">{selectedUser.createdAt ? new Date(selectedUser.createdAt as any).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <Label>Subscription End</Label>
                        <p className="font-semibold">{selectedUser.proExpiresAt ? new Date(selectedUser.proExpiresAt as any).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-muted-foreground">This dealer does not have an active subscription.</p>
                  )}
                 </div>
              </TabsContent>
            </Tabs>
        </DialogContent>
    </Dialog>
    </>
  );
}
