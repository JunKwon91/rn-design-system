// ============================================================================
// RadioGroup — Radio 그룹 컨테이너 (단일 선택 + 접근성)
// ============================================================================
//
// 자식 Radio들이 공유할 value / onValueChange / disabled를 Context로 주입한다.
// Radio는 RadioGroup 외부에서 단독 사용 시 에러를 던지므로, 반드시 RadioGroup
// 안에서 렌더한다.
//
// 사용 예:
//   const [pick, setPick] = useState<'a' | 'b' | 'c'>('a');
//   <RadioGroup value={pick} onValueChange={setPick}>
//     <Radio value="a" label="옵션 A" />
//     <Radio value="b" label="옵션 B" />
//     <Radio value="c" label="옵션 C" disabled />
//   </RadioGroup>
//
//   // 그룹 전체 disabled:
//   <RadioGroup value={pick} onValueChange={setPick} disabled>
//     ...
//   </RadioGroup>
// ============================================================================

import { createContext, useContext, useMemo } from 'react';
import { View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  disabled: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** Radio 내부에서 그룹 상태를 읽기 위한 훅. 그룹 외부 사용 시 에러. */
export function useRadioGroup(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('Radio must be rendered inside a <RadioGroup>.');
  }
  return ctx;
}

export interface RadioGroupProps<T extends string = string> {
  value: T;
  onValueChange: (value: T) => void;
  children: React.ReactNode;
  /** true면 그룹 내 모든 Radio가 disabled로 잠긴다. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Radio 그룹 컨테이너. 자식 Radio에 value/onValueChange를 Context로 전달.
 *
 * Generic<T extends string>로 value와 onValueChange의 타입이 일치하도록 강제.
 *
 * @example
 * const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
 * <RadioGroup value={size} onValueChange={setSize}>
 *   <Radio value="sm" label="작게" />
 *   <Radio value="md" label="중간" />
 *   <Radio value="lg" label="크게" />
 * </RadioGroup>
 */
function RadioGroup<T extends string>({
  value,
  onValueChange,
  children,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: RadioGroupProps<T>) {
  const ctxValue = useMemo<RadioGroupContextValue>(
    () => ({
      value,
      // Radio 내부에서는 string 단위로 호출되지만 외부로는 T로 좁혀 전달
      onValueChange: (v: string) => onValueChange(v as T),
      disabled,
    }),
    [value, onValueChange, disabled],
  );

  return (
    <RadioGroupContext.Provider value={ctxValue}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={style}
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export default RadioGroup;
