import { useState } from "react";
import { Button, ButtonProps } from "react-aria-components";
import Loading from "@/components/Loading";

interface TransitionButtonProps extends Omit<ButtonProps, "onPress"> {
  onPress?: () => Promise<void>;
  loadingLabel?: string;
  loadingVariant?: "page" | "inline" | "minimal" | "fullscreen";
  showLoading?: boolean; // Optional prop to control loading state externally if needed
}

const TransitionButton: React.FC<TransitionButtonProps> = ({
  onPress,
  loadingLabel = "...",
  loadingVariant = "fullscreen",
  children,
  isDisabled = false,
  showLoading = true,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    if (!onPress) return; // If no onPress function is provided, do nothing
    setIsLoading(true);
    try {
      await onPress();
    } finally {
      // Ensures button re-enables even if the async call throws
      setIsLoading(false);
    }
  };


  // Use internal loading if onPress is provided, otherwise use isDisabled as external loading
  const activeLoading = onPress ? isLoading : isDisabled;

  return (
    <>
      {showLoading && <Loading variant={loadingVariant} isActive={activeLoading} />}
      <Button
        isDisabled={isDisabled || activeLoading}
        onPress={onPress ? handlePress : undefined}
        aria-busy={activeLoading ? "true" : undefined}
        {...props}
      >
        {activeLoading ? loadingLabel : children}
      </Button>
    </>
  );
};

export default TransitionButton;