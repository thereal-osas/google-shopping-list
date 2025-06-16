import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { ShoppingCart, Plus, Trash2 } from "lucide-react";
import ShoppingItem from "../components/ShoppingItem";
import AuthButton from "../components/AuthButton";

interface ShoppingListItem {
  id: string;
  name: string;
  created_at: string;
}

const API_BASE_URL = "http://localhost:8080"; // Update this to your backend URL

const Index = () => {
  const [newItem, setNewItem] = useState("");
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("jwt_token")
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is authenticated
  const isAuthenticated = !!token;

  // Fetch shopping list items
  const {
    data: items = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["shopping-items"],
    queryFn: async () => {
      if (!token) return [];

      const response = await fetch(`${API_BASE_URL}/api/items`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("jwt_token");
          setToken(null);
          throw new Error("Session expired");
        }
        throw new Error("Failed to fetch items");
      }

      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (itemName: string) => {
      const response = await fetch(`${API_BASE_URL}/api/item`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: itemName }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
      setNewItem("");
      toast({
        title: "Item added!",
        description: "Your item has been added to the shopping list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`${API_BASE_URL}/api/item/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
      toast({
        title: "Item deleted!",
        description: "The item has been removed from your shopping list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete all items mutation
  const deleteAllItemsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete all items");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-items"] });
      toast({
        title: "List cleared!",
        description: "All items have been removed from your shopping list.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear list. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      addItemMutation.mutate(newItem.trim());
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  const handleDeleteAllItems = () => {
    if (items.length > 0) {
      deleteAllItemsMutation.mutate();
    }
  };

  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  };

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jwtToken = urlParams.get("token");

    if (jwtToken) {
      localStorage.setItem("jwt_token", jwtToken);
      setToken(jwtToken);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
      toast({
        title: "Welcome!",
        description: "You've been successfully logged in.",
      });
    }
  }, [toast]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Shopping List
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Keep track of your shopping items with ease. Sign in with Google
              to get started.
            </p>
          </CardHeader>
          <CardContent>
            <AuthButton onClick={handleLogin} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              My Shopping List
            </h1>
          </div>
          <Button
            onClick={() => {
              localStorage.removeItem("jwt_token");
              setToken(null);
            }}
            variant="outline"
          >
            Logout
          </Button>
        </div>

        {/* Add Item Form */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleAddItem} className="flex space-x-3">
              <Input
                type="text"
                placeholder="Add a new item to your shopping list..."
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1"
                disabled={addItemMutation.isPending}
              />
              <Button
                type="submit"
                disabled={!newItem.trim() || addItemMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Shopping List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl">
              Shopping Items ({items.length})
            </CardTitle>
            {items.length > 0 && (
              <Button
                onClick={handleDeleteAllItems}
                variant="destructive"
                size="sm"
                disabled={deleteAllItemsMutation.isPending}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                Failed to load shopping list. Please try again.
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Your shopping list is empty
                </p>
                <p className="text-gray-400">Add some items to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item: ShoppingListItem) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onDelete={handleDeleteItem}
                    isDeleting={deleteItemMutation.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
