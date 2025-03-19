
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2, RefreshCw } from 'lucide-react';

const DeleteSpecificUsers: React.FC = () => {
  const { removeUsersByEmails, getAllUsers } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailsToRemove, setEmailsToRemove] = useState<string[]>([]);

  // Prepare the list of registered users for deletion
  useEffect(() => {
    const allUsers = getAllUsers();
    // Filter non-admin registered users
    const registeredUsers = allUsers.filter(user => 
      user.email !== 'hakan200505@gmail.com' && 
      !user.id.startsWith('1') // Skip default users
    );
    
    if (registeredUsers.length > 0) {
      setEmailsToRemove(registeredUsers.map(user => user.email));
    } else {
      setEmailsToRemove([]);
    }
    
    console.log("DeleteSpecificUsers - Registered users to remove:", registeredUsers.length);
  }, [getAllUsers]);

  const handleDeleteSpecificUsers = async () => {
    if (emailsToRemove.length === 0) {
      toast({
        title: "Bilgi",
        description: "Silinecek kayıtlı kullanıcı bulunmuyor.",
      });
      setDialogOpen(false);
      return;
    }

    setLoading(true);
    try {
      await removeUsersByEmails(emailsToRemove);
      
      toast({
        title: "Kullanıcılar Silindi",
        description: `${emailsToRemove.length} kullanıcı başarıyla silindi.`,
      });
      
      // Clear emails after successful removal
      setEmailsToRemove([]);
      setDialogOpen(false);
    } catch (error) {
      console.error("Error removing specific users:", error);
      toast({
        title: "Hata",
        description: "Kullanıcılar silinirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={() => setDialogOpen(true)} 
        variant="outline" 
        className="border-valorant-gray/30 hover:bg-orange-500/20 text-orange-500 flex items-center gap-2"
        disabled={loading || emailsToRemove.length === 0}
      >
        {loading ? (
          <RefreshCw className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        Kayıtlı Kullanıcıları Sil ({emailsToRemove.length})
      </Button>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-valorant-black border border-valorant-gray/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-orange-500" />
              Kayıtlı Kullanıcıları Sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Bu işlem, <strong>{emailsToRemove.length}</strong> kayıtlı kullanıcıyı silecektir. 
              Bu işlem geri alınamaz. Devam etmek istiyor musunuz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-valorant-gray/20 border-valorant-gray/30 text-white hover:bg-valorant-gray/30">
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSpecificUsers}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Kullanıcıları Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeleteSpecificUsers;
