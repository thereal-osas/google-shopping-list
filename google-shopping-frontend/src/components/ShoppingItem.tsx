import { Button } from "../components/ui/button";
import { Trash2 } from "lucide-react";

interface ShoppingListItem {
  id: string;
  item_name: string;
  created_at: string;
}

interface ShoppingItemProps {
  item: ShoppingListItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const ShoppingItem = ({ item, onDelete, isDeleting }: ShoppingItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <p className="text-gray-800 font-medium">{item.item_name}</p>
        <p className="text-gray-500 text-sm">
          Added {new Date(item.created_at).toLocaleDateString()}
        </p>
      </div>
      <Button
        onClick={() => onDelete(item.id)}
        variant="ghost"
        size="sm"
        disabled={isDeleting}
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ShoppingItem;
