// ============================================================================
// InputScreen — Input 카테고리 갤러리
// ============================================================================
// Input · SearchInput · Checkbox · Radio — Tabs 전환 패턴 (4 탭)
// ============================================================================

import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme } from 'styled-components/native';

import { Tabs } from '@/components/display';
import {
  Checkbox,
  Input,
  Radio,
  RadioGroup,
  SearchInput,
} from '@/components/input';
import { Spacer, Text } from '@/components/primitives';
import { Screen, Section } from '@/components/surface';

const SECTIONS = [
  { value: 'input', label: 'Input' },
  { value: 'searchinput', label: 'SearchInput' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Radio' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

type Plan = 'free' | 'pro' | 'team';

export default function InputScreen() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionValue>(
    SECTIONS[0].value,
  );
  const [searchEmpty, setSearchEmpty] = useState('');
  const [searchFilled, setSearchFilled] = useState('옵션 A');

  // Checkbox 시연 상태
  const [agree, setAgree] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [smChecked, setSmChecked] = useState(false);
  const [mdChecked, setMdChecked] = useState(true);
  const [lgChecked, setLgChecked] = useState(false);

  // Radio 시연 상태
  const [plan, setPlan] = useState<Plan>('pro');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');

  return (
    <Screen edges={['bottom']} padded={false}>
      <Tabs
        tabs={[...SECTIONS]}
        value={activeSection}
        onChange={setActiveSection}
        style={{ marginTop: theme.spacing.xs }}
      />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.containerMargin,
          paddingTop: theme.spacing.lg,
          paddingBottom: theme.spacing['2xl'],
        }}
      >
        {activeSection === 'input' && (
          <Section title="Input · states (상태)">
            <Text variant="labelSm" color="muted">
              Default (탭하면 Focus 상태로 전환)
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
            />
            <Text variant="labelSm" color="muted">
              Error
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              error="유효하지 않은 값입니다"
            />
            <Text variant="labelSm" color="muted">
              Disabled
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
              disabled
            />
            <Text variant="labelSm" color="muted">
              showHelper = false
            </Text>
            <Input
              label="텍스트"
              placeholder="값을 입력하세요"
              helper="값을 입력하세요."
              showHelper={false}
            />
          </Section>
        )}

        {activeSection === 'searchinput' && (
          <Section title="SearchInput · states (상태)">
            <Text variant="labelSm" color="muted">
              Empty (타이핑하면 X 버튼 등장)
            </Text>
            <SearchInput
              value={searchEmpty}
              placeholder="검색어 입력"
              onChangeText={setSearchEmpty}
            />
            <Text variant="labelSm" color="muted">
              Filled (X 탭으로 클리어)
            </Text>
            <SearchInput
              value={searchFilled}
              placeholder="검색어 입력"
              onChangeText={setSearchFilled}
            />
          </Section>
        )}

        {activeSection === 'checkbox' && (
          <>
            <Section title="Checkbox · with label (라벨 포함)">
              <Text variant="labelSm" color="muted">
                탭하면 토글
              </Text>
              <Checkbox
                value={agree}
                onValueChange={setAgree}
                label="이용 약관에 동의합니다"
              />
              <Checkbox
                value={newsletter}
                onValueChange={setNewsletter}
                label="뉴스레터 수신에 동의합니다"
              />
              <Checkbox
                value={false}
                label="비활성 옵션 (disabled)"
                disabled
              />
              <Checkbox
                value
                label="비활성 + 선택된 상태"
                disabled
              />
            </Section>
            <Spacer size="2xl" />

            <Section title="Checkbox · sizes (sm / md / lg)">
              <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
                <Checkbox value={smChecked} onValueChange={setSmChecked} size="sm" />
                <Checkbox value={mdChecked} onValueChange={setMdChecked} size="md" />
                <Checkbox value={lgChecked} onValueChange={setLgChecked} size="lg" />
              </View>
            </Section>
            <Spacer size="2xl" />

            <Section title="Checkbox · no label (라벨 없음)">
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Checkbox value={false} onValueChange={() => {}} />
                <Checkbox value onValueChange={() => {}} />
                <Checkbox value={false} disabled />
                <Checkbox value disabled />
              </View>
            </Section>
          </>
        )}

        {activeSection === 'radio' && (
          <>
            <Section title="Radio · plan picker (단일 선택)">
              <Text variant="labelSm" color="muted">
                선택된 값: {plan}
              </Text>
              <RadioGroup value={plan} onValueChange={setPlan}>
                <Radio value="free" label="Free — 무료 플랜" />
                <Spacer size="md" />
                <Radio value="pro" label="Pro — 개인 사용자 추천" />
                <Spacer size="md" />
                <Radio value="team" label="Team — 5인 이상 협업" />
              </RadioGroup>
            </Section>
            <Spacer size="2xl" />

            <Section title="Radio · sizes (sm / md / lg)">
              <Text variant="labelSm" color="muted">
                선택된 값: {size}
              </Text>
              <RadioGroup value={size} onValueChange={setSize}>
                <Radio value="sm" label="작게" size="sm" />
                <Spacer size="md" />
                <Radio value="md" label="중간" size="md" />
                <Spacer size="md" />
                <Radio value="lg" label="크게" size="lg" />
              </RadioGroup>
            </Section>
            <Spacer size="2xl" />

            <Section title="Radio · disabled (그룹 전체 잠금)">
              <Text variant="labelSm" color="muted">
                RadioGroup disabled — 그룹 내 모든 항목 비활성
              </Text>
              <RadioGroup value="b" onValueChange={() => {}} disabled>
                <Radio value="a" label="옵션 A" />
                <Spacer size="md" />
                <Radio value="b" label="옵션 B (선택됨)" />
                <Spacer size="md" />
                <Radio value="c" label="옵션 C" />
              </RadioGroup>
            </Section>
            <Spacer size="2xl" />

            <Section title="Radio · individual disabled (개별 잠금)">
              <Text variant="labelSm" color="muted">
                개별 Radio에 disabled — 일부 항목만 비활성
              </Text>
              <RadioGroup value="x" onValueChange={() => {}}>
                <Radio value="x" label="기본 옵션" />
                <Spacer size="md" />
                <Radio value="y" label="잠긴 옵션" disabled />
              </RadioGroup>
            </Section>
          </>
        )}
        <Spacer size="lg" />
      </ScrollView>
    </Screen>
  );
}
