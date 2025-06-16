import { Button } from "../components/ui/button";
import { LogIn } from "lucide-react";

interface AuthButtonProps {
  onClick: () => void;
}

const AuthButton = ({ onClick }: AuthButtonProps) => {
  return (
    <Button
      onClick={onClick}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
      size="lg"
    >
      <LogIn className="w-5 h-5 mr-3" />
      Sign in with Google
    </Button>
  );
};

export default AuthButton;
