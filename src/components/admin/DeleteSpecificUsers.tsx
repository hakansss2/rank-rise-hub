
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
  const [lastRefreshTime, setLastRefreshTime] = useState<string>('');

  // Function to get the current timestamp
  const getCurrentTimestamp = () => {
    return new Date().toLocaleTimeString();
  };

  // Function to refresh the list of registered users
  const refreshUserList = () => {
    // Get all users from localStorage
    try {
      console.log("DeleteSpecificUsers - Refreshing user list from localStorage");
      const rawData = localStorage.getItem('valorant_registered_users');
      console.log("DeleteSpecificUsers - Raw localStorage data:", rawData);
      
      if (rawData) {
        try {
          const parsedUsers = JSON.parse(rawData);
          console.log("DeleteSpecificUsers - Parsed users:", parsedUsers.length, parsedUsers);
          
          // Validate if users array is valid
          if (!Array.isArray(parsedUsers)) {
            console.error("DeleteSpecificUsers - localStorage data is not an array:", parsedUsers);
            setEmailsToRemove([]);
            return;
          }
          
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
          
          // Update last refresh time
          setLastRefreshTime(getCurrentTimestamp());
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
    
    // Add a debug check of localStorage on mount
    console.log("DeleteSpecificUsers - Initial localStorage check:", localStorage.getItem('valorant_registered_users'));
    
    // Check if we can get more users through the getAllUsers function
    const allUsers = getAllUsers();
    console.log("DeleteSpecificUsers - All users from getAllUsers:", allUsers.length, allUsers);

    // Add a global debug check on localStorage every 10 seconds
    const intervalId = setInterval(() => {
      console.log("DeleteSpecificUsers - Periodic localStorage check:", localStorage.getItem('valorant_registered_users'));
      
      // Manually try to parse the localStorage data
      try {
        const data = JSON.parse(localStorage.getItem('valorant_registered_users') || '[]');
        console.log("DeleteSpecificUsers - Parsed periodic check:", data.length, data);
      } catch (e) {
        console.error("DeleteSpecificUsers - Error parsing JSON in periodic check:", e);
      }
    }, 10000); // Check every 10 seconds
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
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

  // Add a manual refresh button function
  const handleManualRefresh = () => {
    console.log("DeleteSpecificUsers - Manual refresh triggered");
    console.log("DeleteSpecificUsers - Current localStorage:", localStorage.getItem('valorant_registered_users'));
    
    // Try to manually verify localStorage data
    try {
      const data = JSON.parse(localStorage.getItem('valorant_registered_users') || '[]');
      console.log("DeleteSpecificUsers - Manual refresh parsed data:", data.length, data);
      
      // Alternative approach: Get users directly from localStorage
      const usersFromStorage = data.filter((user: any) => 
        user && user.email && user.email !== 'hakan200505@gmail.com'
      );
      
      console.log("DeleteSpecificUsers - Manual refresh filtered users:", usersFromStorage.length, usersFromStorage);
      
      // Update the state with emails
      if (usersFromStorage.length > 0) {
        const emails = usersFromStorage.map((user: any) => user.email);
        setEmailsToRemove(emails);
        console.log("DeleteSpecificUsers - Manual refresh set emails:", emails);
      } else {
        setEmailsToRemove([]);
        console.log("DeleteSpecificUsers - Manual refresh no users found");
      }
    } catch (e) {
      console.error("DeleteSpecificUsers - Error in manual refresh:", e);
    }
    
    refreshUserList();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Button 
          onClick={handleManualRefresh} 
          variant="outline" 
          className="border-valorant-gray/30 hover:bg-blue-500/20 text-blue-500 flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Kullanıcı Listesini Yenile
        </Button>
        
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
      </div>
      
      <div className="text-sm text-gray-400">
        {emailsToRemove.length > 0 ? (
          <div>
            <p>Silinecek kullanıcı e-postaları ({emailsToRemove.length}):</p>
            <ul className="mt-1 list-disc list-inside">
              {emailsToRemove.slice(0, 5).map((email, index) => (
                <li key={index}>{email}</li>
              ))}
              {emailsToRemove.length > 5 && (
                <li>...ve {emailsToRemove.length - 5} kullanıcı daha</li>
              )}
            </ul>
          </div>
        ) : (
          <p>Silinecek kayıtlı kullanıcı bulunmuyor.</p>
        )}
      </div>
      
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
    </div>
  );
};

export default DeleteSpecificUsers;
