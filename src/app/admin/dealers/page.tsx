
'use client';
import { useState } from 'react';
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
} from "@/components/ui/dialog"
import { useToast } from '@/hooks/use-toast';


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

    const handleViewDocuments = (user: User) => {
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
    <Card>
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
                            <DropdownMenuItem onClick={() => handleViewDocuments(user)}>View Documents</DropdownMenuItem>
                            <DropdownMenuSeparator />
                             {user.verificationStatus === 'pending' && (
                                <>
                                <DropdownMenuItem onClick={() => handleApprove(user.id)}>Approve</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleReject(user.id)}>Reject</DropdownMenuItem>
                                </>
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
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Verification Documents</DialogTitle>
                <DialogDescription>
                    Documents uploaded by {selectedUser?.name}. Review and then approve or reject.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {selectedUser?.aadharUrl ? (
                    <div>
                        <h3 className="font-semibold">Aadhar Card</h3>
                        <a href={selectedUser.aadharUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            View Document <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                ) : <p>No Aadhar Card uploaded.</p>}
                {selectedUser?.panUrl ? (
                    <div>
                        <h3 className="font-semibold">PAN Card</h3>
                         <a href={selectedUser.panUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            View Document <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                ) : <p>No PAN Card uploaded.</p>}
                {selectedUser?.shopLicenseUrl ? (
                    <div>
                        <h3 className="font-semibold">Shop License</h3>
                         <a href={selectedUser.shopLicenseUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                            View Document <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                ) : <p>No Shop License uploaded.</p>}
            </div>
            {selectedUser?.verificationStatus === 'pending' && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => handleReject(selectedUser.id)}>Reject</Button>
                    <Button onClick={() => handleApprove(selectedUser.id)}>Approve</Button>
                </div>
            )}
        </DialogContent>
    </Dialog>
    </>
  );
}
