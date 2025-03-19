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

  // Function to refresh the list of registered users
  const refreshUserList = () => {
    // Get all users from localStorage
    try {
      console.log("DeleteSpecificUsers - Refreshing user list from localStorage");
      const rawData = localStorage.getItem('valorant_registered_users');
      
      if (rawData) {
        console.log("DeleteSpecificUsers - Raw localStorage data:", rawData);
        try {
          const parsedUsers = JSON.parse(rawData);
          console.log("DeleteSpecificUsers - Parsed users:", parsedUsers.length, parsedUsers);
          
          // Filter out the admin user (we never want to delete the admin)
          const usersWithoutAdmin = parsedUsers.filter((user: any) => 
            user && user.email && user.email !== 'hakan200505@gmail.com'
          );
          
          console.log("DeleteSpecificUsers - Users without admin:", usersWithoutAdmin.length, usersWithoutAdmin);
          
          if (usersWithoutAdmin.length > 0) {
            setEmailsToRemove(usersWithoutAdmin.map((user: any) => user.email));
            console.log("DeleteSpecificUsers - Set emails to remove:", usersWithoutAdmin.map((user: any) => user.email));
          } else {
            setEmailsToRemove([]);
            console.log("DeleteSpecificUsers - No registered users to remove");
          }
        } catch (e) {
          console.error("DeleteSpecificUsers - Error parsing JSON:", e);
          setEmailsToRemove([]);
        }
      } else {
        console.log("DeleteSpecificUsers - No data in localStorage");
        setEmailsToRemove([]);
      }
    } catch (error) {
      console.error("DeleteSpecificUsers - Error parsing localStorage:", error);
      setEmailsToRemove([]);
    }
  };

  // Prepare the list of registered users for deletion
  useEffect(() => {
    refreshUserList();
  }, []);

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
      console.log("Attempting to remove users with emails:", emailsToRemove);
      
      // Check localStorage before deletion
      console.log("LocalStorage BEFORE deletion:", localStorage.getItem('valorant_registered_users'));
      
      await removeUsersByEmails(emailsToRemove);
      
      // Check localStorage after deletion
      console.log("LocalStorage AFTER deletion:", localStorage.getItem('valorant_registered_users'));
      
      toast({
        title: "Kullanıcılar Silindi",
        description: `${emailsToRemove.length} kullanıcı başarıyla silindi.`,
      });
      
      // Refresh the list after deletion
      refreshUserList();
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
        onClick={() => {
          refreshUserList(); // Refresh list before opening dialog
          setDialogOpen(true);
        }} 
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
