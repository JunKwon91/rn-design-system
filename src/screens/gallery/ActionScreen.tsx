// ============================================================================
// ActionScreen — Action 카테고리 갤러리
// ============================================================================
// Button · IconButton — 컴포넌트 단위 2 탭, 각 탭 안 세부 변형 세로 스크롤.
// ============================================================================

import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { ChevronLeft, Plus, Settings, Star, X } from 'lucide-react-native';
import styled, { useTheme } from 'styled-components/native';

import { Button, FAB, IconButton } from '@/components/action';
import { Tabs } from '@/components/display';
import { Spacer, Text } from '@/components/primitives';
import { Card, Screen, Section } from '@/components/surface';

const alertPress = (component: string, label: string) =>
  () => Alert.alert(component, `${label} 클릭됨`);

const Row = styled.View`
  flex-direction: row;
  align-items: center;
`;

const SECTIONS = [
  { value: 'button', label: 'Button (버튼)' },
  { value: 'iconbutton', label: 'IconButton (아이콘 버튼)' },
  { value: 'fab', label: 'FAB (Floating Action Button)' },
] as const;

type SectionValue = typeof SECTIONS[number]['value'];

export default function ActionScreen() {
  const theme = useTheme();
  const [activeSection, setActiveSection] = useState<SectionValue>(
    SECTIONS[0].value,
  );

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
        {activeSection === 'button' && (
          <>
            <Section title="Button · variants × sizes (변형 × 크기)">
              <Card>
                <Button label="Primary sm" variant="primary" size="sm" onPress={alertPress('Button · primary · sm', 'Primary sm')} />
                <Spacer size="sm" />
                <Button label="Primary md" variant="primary" size="md" onPress={alertPress('Button · primary · md', 'Primary md')} />
                <Spacer size="sm" />
                <Button label="Primary lg" variant="primary" size="lg" onPress={alertPress('Button · primary · lg', 'Primary lg')} />
              </Card>
              <Card>
                <Button label="Secondary sm" variant="secondary" size="sm" onPress={alertPress('Button · secondary · sm', 'Secondary sm')} />
                <Spacer size="sm" />
                <Button label="Secondary md" variant="secondary" size="md" onPress={alertPress('Button · secondary · md', 'Secondary md')} />
                <Spacer size="sm" />
                <Button label="Secondary lg" variant="secondary" size="lg" onPress={alertPress('Button · secondary · lg', 'Secondary lg')} />
              </Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="Button · states & options (상태와 옵션)">
              <Card>
                <Button label="disabled" disabled onPress={alertPress('Button · disabled', 'disabled')} />
                <Spacer size="sm" />
                <Button label="loading" loading onPress={alertPress('Button · loading', 'loading')} />
                <Spacer size="sm" />
                <Button label="fullWidth" fullWidth onPress={alertPress('Button · fullWidth', 'fullWidth')} />
              </Card>
              <Card>
                <Button
                  label="추가하기"
                  size="sm"
                  leftIcon={<Plus size={14} color={theme.colors.primary.onAction} />}
                  onPress={() => Alert.alert("Action", "클릭됨")}
                />
                <Spacer size="sm" />
                <Button
                  label="추가하기"
                  variant="secondary"
                  size="sm"
                  leftIcon={<Plus size={14} color={theme.colors.text.secondary} />}
                  onPress={() => Alert.alert("Action", "클릭됨")}
                />
              </Card>
            </Section>
          </>
        )}

        {activeSection === 'iconbutton' && (
          <>
            <Section title="IconButton · sizes × colors (크기 × 색상)">
              <Card>
                <Text variant="labelSm" color="muted">sm (24×24)</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<Settings />} size="sm" color="primary" accessibilityLabel="설정 primary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="secondary" accessibilityLabel="설정 secondary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="muted" accessibilityLabel="설정 muted" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Settings />} size="sm" color="accent" accessibilityLabel="설정 accent" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
                <Text variant="labelSm" color="muted">md (32×32) — default</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<ChevronLeft />} color="primary" accessibilityLabel="뒤로 primary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="secondary" accessibilityLabel="뒤로 secondary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="muted" accessibilityLabel="뒤로 muted" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<ChevronLeft />} color="accent" accessibilityLabel="뒤로 accent" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
                <Text variant="labelSm" color="muted">lg (44×44) — Apple HIG 권장</Text>
                <Spacer size="sm" />
                <Row>
                  <IconButton icon={<Star />} size="lg" color="primary" accessibilityLabel="별표 primary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="secondary" accessibilityLabel="별표 secondary" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="muted" accessibilityLabel="별표 muted" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<Star />} size="lg" color="accent" accessibilityLabel="별표 accent" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
              </Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="IconButton · disabled (비활성)">
              <Card>
                <Row>
                  <IconButton icon={<X />} accessibilityLabel="닫기" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="md" axis="horizontal" />
                  <IconButton icon={<X />} disabled accessibilityLabel="닫기 disabled" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
              </Card>
            </Section>
          </>
        )}

        {activeSection === 'fab' && (
          <>
            <Section title="FAB · 4 variants (small / default / large / extended)">
              <Card>
                <Row>
                  <FAB variant="small" icon={<Plus />} accessibilityLabel="추가 small" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="lg" axis="horizontal" />
                  <FAB variant="default" icon={<Plus />} accessibilityLabel="추가 default" onPress={() => Alert.alert("Action", "클릭됨")} />
                  <Spacer size="lg" axis="horizontal" />
                  <FAB variant="large" icon={<Plus />} accessibilityLabel="추가 large" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
                <Spacer size="lg" />
                <Row>
                  <FAB variant="extended" icon={<Plus />} label="글쓰기" onPress={() => Alert.alert("Action", "클릭됨")} />
                </Row>
              </Card>
            </Section>
            <Spacer size="2xl" />

            <Section title="FAB · disabled (비활성)">
              <Card>
                <Row>
                  <FAB variant="default" icon={<Plus />} accessibilityLabel="비활성 default" onPress={() => Alert.alert("Action", "클릭됨")} disabled />
                  <Spacer size="lg" axis="horizontal" />
                  <FAB variant="extended" icon={<Plus />} label="비활성" onPress={() => Alert.alert("Action", "클릭됨")} disabled />
                </Row>
              </Card>
            </Section>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}
