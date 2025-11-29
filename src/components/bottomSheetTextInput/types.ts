import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TextInputProps,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";

// Infer event types from Gesture Handler TextInput
type GestureHandlerTextInputProps = React.ComponentProps<typeof TextInput>;
type GHFocusEvent = Parameters<
  NonNullable<GestureHandlerTextInputProps["onFocus"]>
>[0];
type GHBlurEvent = Parameters<
  NonNullable<GestureHandlerTextInputProps["onBlur"]>
>[0];

export interface BottomSheetTextInputProps
  extends Omit<TextInputProps, "onFocus" | "onBlur"> {
  onFocus?:
    | ((e: GHFocusEvent) => void)
    | ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void);
  onBlur?:
    | ((e: GHBlurEvent) => void)
    | ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void);
}
