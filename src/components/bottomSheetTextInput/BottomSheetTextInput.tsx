import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import type {
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from "react-native";
import { TextInput as RNTextInput } from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { useBottomSheetInternal } from "../../hooks";
import { findNodeHandle } from "../../utilities";
import type { BottomSheetTextInputProps } from "./types";

// Infer event types from Gesture Handler TextInput props
type GestureHandlerTextInputProps = React.ComponentProps<typeof TextInput>;
type GHFocusEvent = Parameters<
  NonNullable<GestureHandlerTextInputProps["onFocus"]>
>[0];
type GHBlurEvent = Parameters<
  NonNullable<GestureHandlerTextInputProps["onBlur"]>
>[0];

/**
 * Normalizes focus/blur events from both React Native and Gesture Handler TextInput.
 * Gesture Handler uses event with direct target property.
 * React Native uses NativeSyntheticEvent with nativeEvent.target.
 */
function normalizeFocusEvent(
  e: GHFocusEvent | GHBlurEvent | NativeSyntheticEvent<TextInputFocusEventData>,
): { target: number } {
  // Gesture Handler format: { target: number }
  if ("target" in e && typeof e.target === "number") {
    return { target: e.target };
  }

  // React Native format: { nativeEvent: { target: number } }
  if ("nativeEvent" in e && "target" in e.nativeEvent) {
    return { target: e.nativeEvent.target };
  }

  throw new Error("[BottomSheetTextInput] Unsupported focus/blur event format");
}

const BottomSheetTextInputComponent = forwardRef<
  TextInput | undefined,
  BottomSheetTextInputProps
>(function BottomSheetTextInputComponent(
  { onFocus, onBlur, ...rest },
  providedRef,
) {
  //#region refs
  const ref = useRef<TextInput>(null);
  //#endregion

  //#region hooks
  const { animatedKeyboardState, textInputNodesRef } = useBottomSheetInternal();
  //#endregion

  //#region callbacks
  const handleOnFocus = useCallback(
    (args: GHFocusEvent | NativeSyntheticEvent<TextInputFocusEventData>) => {
      const { target } = normalizeFocusEvent(args);
      animatedKeyboardState.set((state) => ({
        ...state,
        target,
      }));
      if (onFocus) {
        onFocus(args as any); // Props may expect either type
      }
    },
    [onFocus, animatedKeyboardState],
  );
  const handleOnBlur = useCallback(
    (args: GHBlurEvent | NativeSyntheticEvent<TextInputFocusEventData>) => {
      const { target } = normalizeFocusEvent(args);
      const keyboardState = animatedKeyboardState.get();
      const currentFocusedInput = findNodeHandle(
        RNTextInput.State.currentlyFocusedInput() as any,
      );

      /**
       * we need to make sure that we only remove the target
       * if the target belong to the current component and
       * if the currently focused input is not in the targets set.
       */
      const shouldRemoveCurrentTarget = keyboardState.target === target;
      const shouldIgnoreBlurEvent =
        currentFocusedInput &&
        textInputNodesRef.current.has(currentFocusedInput);

      if (shouldRemoveCurrentTarget && !shouldIgnoreBlurEvent) {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: undefined,
        }));
      }

      if (onBlur) {
        onBlur(args as any); // Props may expect either type
      }
    },
    [onBlur, animatedKeyboardState, textInputNodesRef],
  );
  //#endregion

  //#region effects
  useEffect(() => {
    const currentRef = ref.current;
    const textInputNodes = textInputNodesRef.current;
    const componentNode = findNodeHandle(currentRef);
    if (!componentNode) {
      return;
    }

    if (!textInputNodes.has(componentNode)) {
      textInputNodes.add(componentNode);
    }

    return () => {
      const node = findNodeHandle(currentRef);
      if (!node) {
        return;
      }

      const keyboardState = animatedKeyboardState.get();
      /**
       * remove the keyboard state target if it belong
       * to the current component.
       */
      if (keyboardState.target === node) {
        animatedKeyboardState.set((state) => ({
          ...state,
          target: undefined,
        }));
      }

      if (textInputNodes.has(node)) {
        textInputNodes.delete(node);
      }
    };
  }, [textInputNodesRef, animatedKeyboardState]);
  useImperativeHandle(providedRef, () => ref.current ?? undefined, []);
  //#endregion

  return (
    <TextInput
      ref={ref}
      onFocus={handleOnFocus}
      onBlur={handleOnBlur}
      {...rest}
    />
  );
});

const BottomSheetTextInput = memo(BottomSheetTextInputComponent);
BottomSheetTextInput.displayName = "BottomSheetTextInput";

export default BottomSheetTextInput;
