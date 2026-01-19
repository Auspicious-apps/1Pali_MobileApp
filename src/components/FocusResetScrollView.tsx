import React, { forwardRef, useRef, useImperativeHandle } from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export type FocusResetScrollViewHandle = ScrollView | null;

const FocusResetScrollView = forwardRef<FocusResetScrollViewHandle, ScrollViewProps>((props, ref) => {
  const innerRef = useRef<ScrollView | null>(null);

  useImperativeHandle(ref, () => innerRef.current!);

  useFocusEffect(
    React.useCallback(() => {
      // When screen gets focus, reset scroll position to top without animation
      innerRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      return undefined;
    }, []),
  );

  return <ScrollView ref={innerRef} {...props} />;
});

export default FocusResetScrollView;
