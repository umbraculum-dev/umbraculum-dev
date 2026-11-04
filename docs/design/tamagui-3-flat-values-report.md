# Flat-values codemod dry-run

Corpus: `app`, `../../packages/platform/ui/src`, `../../packages/verticals/brewery/recipes-ui/src`, `../native`, `../../packages/platform/native-shell/src`.

Statically safe conversions were written in place. Flagged legacy syntax remains for manual migration.

## Summary

- 1699 conversion sites found
- 1682 converted with no open questions
- 9 need relocation because the authored target or host cannot evaluate the conversion
- 1 have an unverified host type
- 0 use properties that cannot carry flat clauses
- 0 have nothing to convert until the runtime catches up (see below)
- 1 have syntax or ordering flags for manual work
- 9 have configuration warnings for manual review
- 0 source files skipped by `.tamagui-flat-values-ignore` markers
- 1696 JSX sites: 1680 clean, 16 need review
- 3 styled config sites: 2 clean, 1 need review
- 0 functional variant sites found
- 0 functional variants have automatic styled.dynamic rewrites
- 0 functional variants need manual migration
- 1 Sheet.Frame sites rewritten to Sheet.Container plus Sheet.Background
- 0 Sheet.Frame sites need a human to place a spread or a styled target
- 0 v2 transition values rewritten to the v3 spelling
- 0 v2 transition values need a hand migration

### Functional variant flag reasons

- none

### Remaining manual migration

257 of 258 files have no legacy condition object, flagged functional variant, or flagged Sheet.Frame left after
conversion. V3 has no compatibility setting; finish the remaining files directly:
`../native/brewery/node_modules/@tamagui/text/src/SizableText.tsx`

### Flag reasons

- ambiguous-line-height-expression: 1

### Configuration warning reasons

- legacy-palette-token: 10

### Values left authored for another migration

These are not flat-value migration work. The conversion keeps them exactly as
authored and records them so their follow-up migrations have a corpus inventory.

- dynamic-string-value: 10

## `../native/brewery/node_modules/@tamagui/text/src/SizableText.tsx`

### SizableTextFrame.resolve(…) lineHeight at line 15 (syntax-blocked)

Before:

```tsx
SizableTextFrame.resolve((props, env) => { if (props.fontFamily === 'inherit') { return { fontFamily: 'inherit' } } // This replaces the old `fontFamily: { any: ... }` variant. Only an // authored fontFamily prop triggered that variant; running it for the // component's inherited base family would let this resolver overwrite a // later variant's size (for example H1's unstyled=false -> size=10). if (props.fontFamily === undefined) { return {} } const size = props.size === true && props.fontSize ? props.fontSize : (props.size ?? true) const sized = getFontSized(size as any, env) return { color: sized?.color, fontFamily: sized?.fontFamily, fontSize: sized?.fontSize, fontStyle: sized?.fontStyle, fontWeight: sized?.fontWeight, letterSpacing: sized?.letterSpacing, lineHeight: sized?.lineHeight, textTransform: sized?.textTransform, } })
```

After:

```tsx
SizableTextFrame.resolve((props, env) => { if (props.fontFamily === 'inherit') { return { fontFamily: 'inherit' } } // This replaces the old `fontFamily: { any: ... }` variant. Only an // authored fontFamily prop triggered that variant; running it for the // component's inherited base family would let this resolver overwrite a // later variant's size (for example H1's unstyled=false -> size=10). if (props.fontFamily === undefined) { return {} } const size = props.size === true && props.fontSize ? props.fontSize : (props.size ?? true) const sized = getFontSized(size as any, env) return { color: sized?.color, fontFamily: sized?.fontFamily, fontSize: sized?.fontSize, fontStyle: sized?.fontStyle, fontWeight: sized?.fontWeight, letterSpacing: sized?.letterSpacing, lineHeight: sized?.lineHeight, textTransform: sized?.textTransform, } })
```

Flags:

- **ambiguous-line-height-expression**: lineHeight value "sized?.lineHeight" has no provable numeric type; replace old pixel semantics with an explicit px length by hand

Notes:

- lineHeight was left authored for a manual unit decision


## `../native/brewery/node_modules/tamagui/src/components/Select.tsx`

### <IconGlyph> lineHeight at line 32 (clean)

Before:

```tsx
<IconGlyph fontSize={size} lineHeight={1}>
```

After:

```tsx
<IconGlyph fontSize={size} lineHeight="1px">
```

Notes:

- numeric lineHeight used V2 pixel semantics and now carries an explicit px unit

### <IconGlyph> lineHeight at line 38 (clean)

Before:

```tsx
<IconGlyph fontSize={size} lineHeight={1}>
```

After:

```tsx
<IconGlyph fontSize={size} lineHeight="1px">
```

Notes:

- numeric lineHeight used V2 pixel semantics and now carries an explicit px unit

### <IconGlyph> lineHeight at line 44 (clean)

Before:

```tsx
<IconGlyph fontSize={size} lineHeight={1}>
```

After:

```tsx
<IconGlyph fontSize={size} lineHeight="1px">
```

Notes:

- numeric lineHeight used V2 pixel semantics and now carries an explicit px unit


## `../native/brewery/node_modules/tamagui/src/views/EnsureFlexed.tsx`

### styled(Text, …) lineHeight at line 5 (clean)

Before:

```tsx
styled(Text, { opacity: 0, lineHeight: 0, height: 0, display: 'flex', fontSize: 200, children: 'wwwwwwwwwwwwwwwwwww', pointerEvents: 'none', })
```

After:

```tsx
styled(Text, { opacity: 0, lineHeight: "0px", height: 0, display: 'flex', fontSize: 200, children: 'wwwwwwwwwwwwwwwwwww', pointerEvents: 'none', })
```

Notes:

- numeric lineHeight used V2 pixel semantics and now carries an explicit px unit


## `../native/brewery/src/modules/brewery/components/recipeEdit/sections/RecipeEditNotesSection.tsx`

### <TextArea> at line 37 (clean)

Before:

```tsx
size="$3" background="$background" borderWidth={1} borderColor="$borderColor" height={80}
```

After:

```tsx
size="3" background="background" borderWidth={1} borderColor="border-color" height={80}
```


## `../native/brewery/src/screens/LoginScreen.tsx`

### <YStack> at line 46 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 47 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 60 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```


## `app/_shared-layout/_components/AccessibilityLink.tsx`

### <XStack> at line 15 (needs-relocation)

Before:

```tsx
px="$2" borderRadius="$2" borderWidth={1} borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border))" backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))" height={28} hoverStyle={{ borderColor: "color-mix(in srgb, var(--focus-ring) 25%, var(--border))", backgroundColor: "color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
px="2" borderRadius="2" borderWidth={1} borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border)) hover:color-mix(in srgb, var(--focus-ring) 25%, var(--border))" backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2)) hover:color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))" height={28} outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on XStack — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text)" fontFamily="body"
```


## `app/_shared-layout/_components/AccordionSectionHeader.tsx`

### <XStack> at line 18 (clean)

Before:

```tsx
justifyContent="space-between" alignItems="center" width="100%" gap="$2"
```

After:

```tsx
justifyContent="space-between" alignItems="center" width="100%" gap="2"
```

### <XStack> at line 22 (clean)

Before:

```tsx
alignItems="center" gap="$2"
```

After:

```tsx
alignItems="center" gap="2"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/_shared-layout/_components/AppMainNav.tsx`

### <XStack> at line 23 (clean)

Before:

```tsx
flexWrap="wrap" gap={media.mobile ? "$1.5" : "$2"} width="100%" p="$2" mt="$2" mb="$2" borderWidth={1} borderColor="var(--border)" borderRadius="var(--radius)" backgroundColor="color-mix(in srgb, var(--surface-2) 25%, var(--surface))"
```

After:

```tsx
flexWrap="wrap" gap={`${media.mobile ? "1-5" : "2"}`} width="100%" p="2" mt="2" mb="2" borderWidth={1} borderColor="var(--border)" borderRadius="var(--radius)" backgroundColor="color-mix(in srgb, var(--surface-2) 25%, var(--surface))"
```

### <XStack> at line 42 (clean)

Before:

```tsx
flex={1} minWidth={minWidth} p="$2.5" borderRadius="$2" borderWidth={1} borderColor={item.isActive ? "color-mix(in srgb, var(--info) 35%, var(--border))" : "color-mix(in srgb, var(--border) 85%, var(--info))"} backgroundColor={item.isActive ? "color-mix(in srgb, var(--info) 18%, var(--surface-2))" : "color-mix(in srgb, var(--surface-2) 60%, var(--surface))"} color="var(--text)" textDecoration="none" cursor="pointer" hoverStyle={{ textDecoration: "none", background: "color-mix(in srgb, var(--info) 12%, var(--surface-2))", borderColor: "color-mix(in srgb, var(--info) 28%, var(--border))", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
flex={1} minWidth={minWidth} p="2-5" borderRadius="2" borderWidth={1} borderColor={`${item.isActive ? "color-mix(in srgb, var(--info) 35%, var(--border))" : "color-mix(in srgb, var(--border) 85%, var(--info))"} hover:color-mix(in srgb, var(--info) 28%, var(--border))`} backgroundColor={item.isActive ? "color-mix(in srgb, var(--info) 18%, var(--surface-2))" : "color-mix(in srgb, var(--surface-2) 60%, var(--surface))"} color="var(--text)" textDecoration="none hover:none" cursor="pointer" background="hover:color-mix(in srgb, var(--info) 12%, var(--surface-2))" outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$3" color="var(--text)" fontWeight={item.isActive ? "600" : "400"} fontFamily="$body"
```

After:

```tsx
size="3" color="var(--text)" fontWeight={item.isActive ? "600" : "400"} fontFamily="body"
```


## `app/_shared-layout/_components/AppSelect.tsx`

### <Select> at line 62 (clean)

Before:

```tsx
size="$3" width={width === "full" ? "100%" : 160} minWidth={width === "full" ? undefined : 160}
```

After:

```tsx
size="3" width={width === "full" ? "100%" : 160} minWidth={width === "full" ? undefined : 160}
```

### <Select.Trigger> at line 75 (clean)

Before:

```tsx
size="$3" width={width === "full" ? "100%" : 160} minWidth={width === "full" ? undefined : 160} flexGrow={0} flexShrink={0} px="$2" py="$2" color="var(--text)" backgroundColor={triggerStyles.backgroundColor} borderWidth={1} borderColor={triggerStyles.borderColor} borderRadius="$2" fontFamily="$body"
```

After:

```tsx
size="3" width={width === "full" ? "100%" : 160} minWidth={width === "full" ? undefined : 160} flexGrow={0} flexShrink={0} px="2" py="2" color="var(--text)" backgroundColor={triggerStyles.backgroundColor} borderWidth={1} borderColor={triggerStyles.borderColor} borderRadius="2" fontFamily="body"
```

Left authored:

- **dynamic-string-value**: backgroundColor value "triggerStyles.backgroundColor" is an open string; confirm it never holds a legacy "$token" spelling
- **dynamic-string-value**: borderColor value "triggerStyles.borderColor" is an open string; confirm it never holds a legacy "$token" spelling


## `app/_shared-layout/_components/AppTopBar.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
py="$2" pb="$2.5" mb="$2.5" borderBottomWidth={1} borderColor="var(--border)" minWidth={0}
```

After:

```tsx
paddingTop="2" pb="2-5" mb="2-5" borderBottomWidth={1} borderColor="var(--border)" minWidth={0}
```

### <XStack> at line 27 (clean)

Before:

```tsx
gap={narrow ? "$2" : "$3"} flexWrap="wrap" minWidth={0}
```

After:

```tsx
gap={`${narrow ? "2" : "3"}`} flexWrap="wrap" minWidth={0}
```

### <XStack> at line 34 (clean)

Before:

```tsx
gap="$3" flexWrap={narrow ? "wrap" : "nowrap"} minWidth={0} flex={1}
```

After:

```tsx
gap="3" flexWrap={narrow ? "wrap" : "nowrap"} minWidth={0} flex={1}
```

### <XStack> at line 43 (clean)

Before:

```tsx
gap="$3" flexWrap={narrow ? "wrap" : "nowrap"} minWidth={0}
```

After:

```tsx
gap="3" flexWrap={narrow ? "wrap" : "nowrap"} minWidth={0}
```

### <YStack> at line 55 (clean)

Before:

```tsx
mt="$2" minWidth={0}
```

After:

```tsx
mt="2" minWidth={0}
```


## `app/_shared-layout/_components/AsyncExportButton.tsx`

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" color="var(--danger, #b00020)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--danger, #b00020)" fontFamily="body"
```


## `app/_shared-layout/_components/AuthExpiredNotice.tsx`

### <View> at line 123 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" mb="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3" mb="3"
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$3" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="3" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 136 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1"
```

### <XStack> at line 140 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" mt="2"
```

### <Button> at line 141 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)"
```

### <SizableText> at line 144 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/_shared-layout/_components/AuthStatus.tsx`

### <XStack> at line 18 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" minHeight={28}
```

After:

```tsx
gap="2" flexWrap="wrap" minHeight={28}
```

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 22 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/_shared-layout/_components/CodeInline.tsx`

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color={color ?? "inherit"}
```

After:

```tsx
size="2" color={color ?? "inherit"}
```

Left authored:

- **dynamic-string-value**: color value "color ?? "inherit"" is an open string; confirm it never holds a legacy "$token" spelling


## `app/_shared-layout/_components/FieldLabel.tsx`

### <Label> at line 15 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="block"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="block"
```

### <SizableText> at line 27 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="block"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="block"
```


## `app/_shared-layout/_components/Footer.tsx`

### <View> at line 9 (clean)

Before:

```tsx
borderTopWidth={1} borderColor="var(--border)" mt="$3" pt="$3" pb="$3"
```

After:

```tsx
borderTopWidth={1} borderColor="var(--border)" mt="3" pt="3" pb="3"
```

### <XStack> at line 17 (clean)

Before:

```tsx
justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$3"
```

After:

```tsx
justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="3"
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" m={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" m={0}
```

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 28 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/_shared-layout/_components/ImportExportPanel.tsx`

### <SizableText> at line 17 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 20 (clean)

Before:

```tsx
gap="$2" mt="$2" mb={0} color="var(--text-muted)"
```

After:

```tsx
gap="2" mt="2" mb={0} color="var(--text-muted)"
```

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 28 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <SizableText> at line 31 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <View> at line 42 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```


## `app/_shared-layout/_components/LanguageSwitcher.tsx`

### <XStack> at line 28 (clean)

Before:

```tsx
gap="$2" height={28} flexShrink={0}
```

After:

```tsx
gap="2" height={28} flexShrink={0}
```

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Select> at line 34 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <Select.Trigger> at line 41 (clean)

Before:

```tsx
size="$2" width="auto" minWidth={52} flexGrow={0} flexShrink={0} px="$2" height={28} color="var(--text)" backgroundColor="transparent" borderWidth={1} borderColor="var(--border)" borderRadius="$2" fontFamily="$body"
```

After:

```tsx
size="2" width="auto" minWidth={52} flexGrow={0} flexShrink={0} px="2" height={28} color="var(--text)" backgroundColor="transparent" borderWidth={1} borderColor="var(--border)" borderRadius="2" fontFamily="body"
```


## `app/_shared-layout/_components/LoginLink.tsx`

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color="var(--info)" fontFamily="$body" hoverStyle={{ textDecoration: "underline" }}
```

After:

```tsx
size="2" color="var(--info)" fontFamily="body" textDecoration="hover:underline"
```


## `app/_shared-layout/_components/MessageBox.tsx`

### <View> at line 71 (clean)

Before:

```tsx
mt={mt} mb={mb} alignSelf="stretch" w="100%" bg={styles.bg} borderWidth={1} borderColor={styles.borderColor} rounded="$2" p="$3" maxW="100%"
```

After:

```tsx
mt={mt} mb={mb} alignSelf="stretch" w="100%" bg={styles.bg} borderWidth={1} borderColor={styles.borderColor} rounded="2" p="3" maxW="100%"
```

Left authored:

- **dynamic-string-value**: bg value "styles.bg" is an open string; confirm it never holds a legacy "$token" spelling
- **dynamic-string-value**: borderColor value "styles.borderColor" is an open string; confirm it never holds a legacy "$token" spelling

### <SizableText> at line 86 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" whiteSpace="pre-wrap"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" whiteSpace="pre-wrap"
```


## `app/_shared-layout/_components/NavSheet.tsx`

### <Sheet.Frame> at line 95 (automatic)

Before:

```tsx
<Sheet.Frame
          position="relative"
          background="var(--surface)"
          borderColor="var(--border)"
          borderWidth={1}
          borderTopLeftRadius="var(--radius)"
          borderTopRightRadius="var(--radius)"
          padding={16}
          maxHeight="85%"
        >
          <Button
            unstyled
            position="absolute"
            top={8}
            right={8}
            p="$1"
            backgroundColor="transparent"
            borderWidth={0}
            cursor="pointer"
            fontSize={18}
            onPress={() => setOpen(false)}
            aria-label={t("close")}
          >
            ×
          </Button>
          <YStack
            pt="$4"
            onClickCapture={(e: MouseEvent<HTMLElement>) => {
              if (!open) return;
              const target = e.target;
              if (!(target instanceof HTMLElement)) return;
              if (target.closest('[data-navsheet-keep-open="true"]')) return;

              const shouldClose = Boolean(target.closest('a[href], [data-navsheet-close="true"]'));
              if (shouldClose) setOpen(false);
            }}
          >
            {children}
          </YStack>
        </Sheet.Frame>
```

Automatic rewrite:

```tsx
<Sheet.Container
          position="relative"
          padding={16}
          maxHeight="85%"
        >
          <Sheet.Background background="var(--surface)" borderColor="var(--border)" borderWidth={1} borderTopLeftRadius="var(--radius)" borderTopRightRadius="var(--radius)" />
          <Button
            unstyled
            position="absolute"
            top={8}
            right={8}
            p="$1"
            backgroundColor="transparent"
            borderWidth={0}
            cursor="pointer"
            fontSize={18}
            onPress={() => setOpen(false)}
            aria-label={t("close")}
          >
            ×
          </Button>
          <YStack
            pt="$4"
            onClickCapture={(e: MouseEvent<HTMLElement>) => {
              if (!open) return;
              const target = e.target;
              if (!(target instanceof HTMLElement)) return;
              if (target.closest('[data-navsheet-keep-open="true"]')) return;

              const shouldClose = Boolean(target.closest('a[href], [data-navsheet-close="true"]'));
              if (shouldClose) setOpen(false);
            }}
          >
            {children}
          </YStack>
        </Sheet.Container>
```

### <Button> at line 56 (needs-relocation)

Before:

```tsx
px="$2" py="$1" borderRadius="$2" borderWidth={1} borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border))" backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))" color="var(--text)" fontSize={11} hoverStyle={{ textDecoration: "none", borderColor: "color-mix(in srgb, var(--focus-ring) 25%, var(--border))", backgroundColor: "color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))", }}
```

After:

```tsx
px="2" py="1" borderRadius="2" borderWidth={1} borderColor="color-mix(in srgb, var(--focus-ring) 25%, var(--border)) hover:color-mix(in srgb, var(--focus-ring) 25%, var(--border))" backgroundColor="color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2)) hover:color-mix(in srgb, var(--focus-ring) 14%, var(--surface-2))" color="var(--text)" fontSize={11} textDecoration="hover:none"
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on Button — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <Button> at line 101 (clean)

Before:

```tsx
position="absolute" top={8} right={8} p="$1" backgroundColor="transparent" borderWidth={0} cursor="pointer" fontSize={18}
```

After:

```tsx
position="absolute" top={8} right={8} p="1" backgroundColor="transparent" borderWidth={0} cursor="pointer" fontSize={18}
```

### <YStack> at line 116 (clean)

Before:

```tsx
pt="$4"
```

After:

```tsx
pt="4"
```


## `app/_shared-layout/_components/PrimaryNav.tsx`

### <XStack> at line 172 (clean)

Before:

```tsx
alignItems="center" gap="$3" flexWrap="wrap" minWidth={0}
```

After:

```tsx
alignItems="center" gap="3" flexWrap="wrap" minWidth={0}
```

### <SizableText> at line 179 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/_shared-layout/_components/SwitchAccountLink.tsx`

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" hoverStyle={{ textDecoration: "underline" }}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" textDecoration="hover:underline"
```


## `app/_shared-layout/_components/WebSharedLayoutNotice.tsx`

### <SizableText> at line 76 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```

### <SizableText> at line 111 (clean)

Before:

```tsx
size="$2" fontWeight="650" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="650" color="var(--text)"
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```

### <SizableText> at line 136 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```

### <SizableText> at line 139 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```

### <SizableText> at line 164 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```

### <SizableText> at line 170 (clean)

Before:

```tsx
size="$2" color="var(--text)"
```

After:

```tsx
size="2" color="var(--text)"
```


## `app/[locale]/(auth)/_components/LocaleSelect.tsx`

### <YStack> at line 26 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```


## `app/[locale]/(auth)/login/page.tsx`

### <View> at line 34 (clean)

Before:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 83 (clean)

Before:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 94 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 95 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 97 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 117 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 119 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 141 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <View> at line 151 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <YStack> at line 152 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 153 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" fontWeight="bold"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" fontWeight="bold"
```

### <SizableText> at line 156 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 159 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(auth)/select-workspace/page.tsx`

### <View> at line 91 (clean)

Before:

```tsx
maxWidth={720} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
maxWidth={720} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <SizableText> at line 101 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 106 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 114 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 120 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <Button> at line 122 (clean)

Before:

```tsx
justifyContent="flex-start" width="100%" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" size="$3"
```

After:

```tsx
justifyContent="flex-start" width="100%" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" size="3"
```

### <XStack> at line 134 (clean)

Before:

```tsx
gap="$1" flex={1} justifyContent="flex-start" alignItems="center"
```

After:

```tsx
gap="1" flex={1} justifyContent="flex-start" alignItems="center"
```

### <SizableText> at line 135 (clean)

Before:

```tsx
size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 138 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 142 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(auth)/signup/page.tsx`

### <View> at line 33 (clean)

Before:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <SizableText> at line 42 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 83 (clean)

Before:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
maxWidth={520} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 94 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 95 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 97 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 117 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 119 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 139 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 141 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 161 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <View> at line 171 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <YStack> at line 172 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 173 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" fontWeight="bold"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" fontWeight="bold"
```

### <SizableText> at line 176 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 179 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(automation)/vessels/[vesselCode]/page.tsx`

### <YStack> at line 97 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 98 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <XStack> at line 100 (clean)

Before:

```tsx
gap="$3" alignItems="center"
```

After:

```tsx
gap="3" alignItems="center"
```

### <Button> at line 102 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 118 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 124 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 131 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading" mb="$2"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading" mb="2"
```

### <YStack> at line 140 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 181 (clean)

Before:

```tsx
gap="$3" alignItems="flex-start" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="flex-start" flexWrap="wrap"
```

### <SizableText> at line 182 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" minWidth={200}
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" minWidth={200}
```

### <SizableText> at line 185 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(automation)/vessels/page.tsx`

### <YStack> at line 69 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 70 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 75 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 77 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 93 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 99 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 106 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading" mb="$2"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading" mb="2"
```

### <YStack> at line 118 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <XStack> at line 119 (clean)

Before:

```tsx
justifyContent="space-between" alignItems="flex-start" columnGap="$3" rowGap="$0.5"
```

After:

```tsx
justifyContent="space-between" alignItems="flex-start" columnGap="3" rowGap="0-5"
```

### <SizableText> at line 120 (clean)

Before:

```tsx
flex={1} fontFamily="$body"
```

After:

```tsx
flex={1} fontFamily="body"
```

### <XStack> at line 126 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 127 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 131 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 135 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 139 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 144 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(brewery)/_components/MathHelpPopover.tsx`

### <Button> at line 53 (clean)

Before:

```tsx
size={size === "md" ? "$3" : "$2"} bg="color-mix(in srgb, var(--info) 14%, var(--surface-2))" borderWidth={1} borderColor="color-mix(in srgb, var(--info) 25%, var(--border))"
```

After:

```tsx
size={size === "md" ? "3" : "2"} bg="color-mix(in srgb, var(--info) 14%, var(--surface-2))" borderWidth={1} borderColor="color-mix(in srgb, var(--info) 25%, var(--border))"
```


## `app/[locale]/(brewery)/_components/PageWideActionBar.tsx`

### <View> at line 17 (clean)

Before:

```tsx
position="sticky" bottom={0} left={0} right={0} zIndex={10} bg="var(--background)" borderTopWidth={1} borderColor="var(--border)" p="$3"
```

After:

```tsx
position="sticky" bottom={0} left={0} right={0} zIndex={10} bg="var(--background)" borderTopWidth={1} borderColor="var(--border)" p="3"
```

### <XStack> at line 28 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```


## `app/[locale]/(brewery)/_components/recipe-edit/FieldBadge.tsx`

### <View> at line 13 (clean)

Before:

```tsx
display="inline-block" rounded={999} px="$2" py="$0.5" borderWidth={1} borderColor="var(--border)"
```

After:

```tsx
display="inline-block" rounded={999} px="2" py="0-5" borderWidth={1} borderColor="var(--border)"
```

### <SizableText> at line 22 (clean)

Before:

```tsx
size="$1" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="1" fontFamily="body" color="var(--text)"
```


## `app/[locale]/(brewery)/_components/recipe-edit/RecipeEditField.tsx`

### <YStack> at line 17 (clean)

Before:

```tsx
gap="$1" minW={0}
```

After:

```tsx
gap="1" minW={0}
```


## `app/[locale]/(brewery)/_components/recipe-edit/RecipeEditFieldBlock.tsx`

### <View> at line 59 (clean)

Before:

```tsx
borderWidth={1} borderColor={styles.borderColor} rounded="$2" p="$3" bg={styles.bg} mt={mt} mb={mb}
```

After:

```tsx
borderWidth={1} borderColor={styles.borderColor} rounded="2" p="3" bg={styles.bg} mt={mt} mb={mb}
```

Left authored:

- **dynamic-string-value**: borderColor value "styles.borderColor" is an open string; confirm it never holds a legacy "$token" spelling
- **dynamic-string-value**: bg value "styles.bg" is an open string; confirm it never holds a legacy "$token" spelling

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 69 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" items="baseline"
```

After:

```tsx
gap="2" flexWrap="wrap" items="baseline"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 75 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/_components/recipe-edit/RecipeEditIngredientCard.tsx`

### <View> at line 13 (clean)

Before:

```tsx
bg="color-mix(in srgb, var(--surface-2) 55%, var(--surface))" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
bg="color-mix(in srgb, var(--surface-2) 55%, var(--surface))" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```


## `app/[locale]/(brewery)/_components/recipe-edit/RecipeEditReadOnlyValue.tsx`

### <View> at line 13 (clean)

Before:

```tsx
p="$2" bg="var(--field-readonly-bg)" rounded="$2" borderWidth={1} borderColor="var(--field-readonly-border)" userSelect="none"
```

After:

```tsx
p="2" bg="var(--field-readonly-bg)" rounded="2" borderWidth={1} borderColor="var(--field-readonly-border)" userSelect="none"
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```


## `app/[locale]/(brewery)/_components/recipe-edit/RecipeEditSection.tsx`

### <SizableText> at line 52 (clean)

Before:

```tsx
m={0} size="$5" fontFamily="$heading" color="var(--text)"
```

After:

```tsx
m={0} size="5" fontFamily="heading" color="var(--text)"
```

### <View> at line 60 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```


## `app/[locale]/(brewery)/_components/recipeImport/RecipeImportFormContent.tsx`

### <YStack> at line 21 (clean)

Before:

```tsx
gap="$0"
```

After:

```tsx
gap="0"
```


## `app/[locale]/(brewery)/_components/recipeImport/RecipeImportLegendBox.tsx`

### <View> at line 17 (clean)

Before:

```tsx
mt="$2.5" mb="$4"
```

After:

```tsx
mt="2-5" mb="4"
```

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <YStack> at line 23 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb={0}
```

### <SizableText> at line 27 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb={0}
```

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb={0}
```

### <View> at line 33 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```


## `app/[locale]/(brewery)/_components/recipeImport/sections/RecipeImportBulkSection.tsx`

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb={0}
```

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5" mb="$3" display="block"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5" mb="3" display="block"
```

### <YStack> at line 66 (clean)

Before:

```tsx
gap="$1.5" mt="$3"
```

After:

```tsx
gap="1-5" mt="3"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <XStack> at line 85 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" mt="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 86 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 89 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 92 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <SizableText> at line 119 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <View> at line 127 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <H3> at line 128 (clean)

Before:

```tsx
mb="$1.5"
```

After:

```tsx
mb="1-5"
```

### <SizableText> at line 132 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 144 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <YStack> at line 159 (clean)

Before:

```tsx
gap="$3" mt="$3"
```

After:

```tsx
gap="3" mt="3"
```

### <SizableText> at line 162 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 165 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 173 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 181 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/_components/recipeImport/sections/RecipeImportSingleSection.tsx`

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5" mb="$3" display="block"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5" mb="3" display="block"
```

### <XStack> at line 66 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 82 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <YStack> at line 88 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 102 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <XStack> at line 110 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" mt="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 111 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 114 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <H3> at line 142 (clean)

Before:

```tsx
mt={0} mb="$2"
```

After:

```tsx
mt={0} mb="2"
```

### <SizableText> at line 151 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 161 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 166 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <H3> at line 175 (clean)

Before:

```tsx
mt="$4" mb="$1.5"
```

After:

```tsx
mt="4" mb="1-5"
```

### <SizableText> at line 182 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 190 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 195 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" mt="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 196 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 200 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 209 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```


## `app/[locale]/(brewery)/_components/RecipeTitleWithMeta.tsx`

### <YStack> at line 17 (clean)

Before:

```tsx
gap="$1" mb="$2"
```

After:

```tsx
gap="1" mb="2"
```


## `app/[locale]/(brewery)/_components/StripedRow.tsx`

### styled(View, …) at line 7 (clean)

Before:

```tsx
px: "$2", py: "$1", borderRadius: "$2"
```

After:

```tsx
px: "2", py: "1", borderRadius: "2"
```


## `app/[locale]/(brewery)/_components/SurfaceMathToggleRow.tsx`

### <XStack> at line 20 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap" mt={mt} mb={mb}
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap" mt={mt} mb={mb}
```

### <XStack> at line 28 (clean)

Before:

```tsx
marginLeft="auto" gap="$2.5" alignItems="center" flexWrap="wrap"
```

After:

```tsx
marginLeft="auto" gap="2-5" alignItems="center" flexWrap="wrap"
```

### <Button> at line 36 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/BrewdayStepsSettingsPageContent.tsx`

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 36 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 41 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 53 (clean)

Before:

```tsx
position="fixed" top={16} left="50%" zIndex={1000} width="100%" maxWidth={600} px="$4"
```

After:

```tsx
position="fixed" top={16} left="50%" zIndex={1000} width="100%" maxWidth={600} px="4"
```

### <YStack> at line 63 (clean)

Before:

```tsx
gap="$2" width="100%"
```

After:

```tsx
gap="2" width="100%"
```

### <YStack> at line 82 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayBrewingTypeSection.tsx`

### <XStack> at line 43 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap"
```

### <Button> at line 56 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <XStack> at line 70 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap" mt="$3"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap" mt="3"
```

### <Input> at line 75 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 89 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <YStack> at line 102 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 108 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)" flex={1} minW={0}
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)" flex={1} minW={0}
```

### <Button> at line 118 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <XStack> at line 135 (clean)

Before:

```tsx
gap="$3" items="center" mt="$3"
```

After:

```tsx
gap="3" items="center" mt="3"
```

### <Button> at line 136 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayNotesSection.tsx`

### <TextArea> at line 22 (clean)

Before:

```tsx
numberOfLines={6} size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
numberOfLines={6} size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayStepsCustomSection.tsx`

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb="2"
```

### <XStack> at line 44 (clean)

Before:

```tsx
gap="$3" items="center" mt="$3"
```

After:

```tsx
gap="3" items="center" mt="3"
```

### <Button> at line 45 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayStepsDefaultSection.tsx`

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb="2"
```

### <SizableText> at line 51 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 57 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <YStack> at line 60 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 61 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <XStack> at line 62 (clean)

Before:

```tsx
gap="$1" flexShrink={0}
```

After:

```tsx
gap="1" flexShrink={0}
```

### <Button> at line 63 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 76 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Input> at line 94 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Input> at line 111 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <XStack> at line 148 (clean)

Before:

```tsx
gap="$2" items="center"
```

After:

```tsx
gap="2" items="center"
```

### <Checkbox> at line 149 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 160 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 177 (clean)

Before:

```tsx
gap="$3" items="center" mt="$3"
```

After:

```tsx
gap="3" items="center" mt="3"
```

### <Button> at line 178 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayStepsRecapSection.tsx`

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/BrewdayStepsSectionsSection.tsx`

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 48 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <XStack> at line 51 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <SizableText> at line 52 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)" flex={1} minW={0}
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)" flex={1} minW={0}
```

### <XStack> at line 61 (clean)

Before:

```tsx
gap="$2" items="center"
```

After:

```tsx
gap="2" items="center"
```

### <Checkbox> at line 62 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 73 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 88 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <SizableText> at line 89 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)" flex={1} minW={0}
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)" flex={1} minW={0}
```

### <XStack> at line 98 (clean)

Before:

```tsx
gap="$2" items="center"
```

After:

```tsx
gap="2" items="center"
```

### <Checkbox> at line 99 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 110 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 120 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <XStack> at line 136 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap" mt="$3"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap" mt="3"
```

### <Input> at line 141 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 155 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <XStack> at line 168 (clean)

Before:

```tsx
gap="$3" items="center" mt="$3"
```

After:

```tsx
gap="3" items="center" mt="3"
```

### <Button> at line 169 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/custom/BrewdayStepsCustomAddForm.tsx`

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap" mt="$3"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap" mt="3"
```

### <Input> at line 31 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Input> at line 49 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 79 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/brewday-steps-settings/_components/sections/custom/BrewdayStepsCustomStepRows.tsx`

### <YStack> at line 29 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <YStack> at line 32 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <XStack> at line 34 (clean)

Before:

```tsx
gap="$1" flexShrink={0}
```

After:

```tsx
gap="1" flexShrink={0}
```

### <Button> at line 35 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Input> at line 66 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Input> at line 84 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <XStack> at line 119 (clean)

Before:

```tsx
gap="$2" items="center"
```

After:

```tsx
gap="2" items="center"
```

### <Checkbox> at line 120 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 131 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 141 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/create/EquipmentCreateKettleFields.tsx`

### <XStack> at line 39 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 41 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 45 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 66 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 83 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 87 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 104 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 108 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 129 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/create/EquipmentCreateMashFields.tsx`

### <XStack> at line 43 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 45 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 49 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 66 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 70 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 87 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 91 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 108 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 112 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 129 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 133 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 150 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 154 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/create/EquipmentCreateMiscFields.tsx`

### <XStack> at line 18 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 20 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 24 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/create/EquipmentCreateNameField.tsx`

### <YStack> at line 15 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 17 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/edit/EquipmentEditKettleFields.tsx`

### <XStack> at line 20 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 22 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 26 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 47 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 64 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 68 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 85 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 89 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 106 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 110 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/edit/EquipmentEditMashFields.tsx`

### <XStack> at line 20 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 22 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 26 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 47 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 64 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 68 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 85 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 89 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 106 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 110 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 127 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 131 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/edit/EquipmentEditMiscFields.tsx`

### <XStack> at line 20 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 22 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 26 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/edit/EquipmentEditNameField.tsx`

### <YStack> at line 17 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 19 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/EquipmentPageContent.tsx`

### <YStack> at line 19 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 20 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/equipment/_components/EquipmentProfileCreateForm.tsx`

### <View> at line 53 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <View> at line 66 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <XStack> at line 114 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center"
```

After:

```tsx
gap="3" mt="3" alignItems="center"
```

### <Button> at line 115 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/equipment/_components/EquipmentProfileEditForm.tsx`

### <View> at line 30 (clean)

Before:

```tsx
mt="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
mt="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <XStack> at line 72 (clean)

Before:

```tsx
gap="$3" mt="$3"
```

After:

```tsx
gap="3" mt="3"
```

### <Button> at line 73 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 76 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/equipment/_components/EquipmentProfileListSection.tsx`

### <View> at line 23 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <View> at line 36 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <XStack> at line 56 (clean)

Before:

```tsx
gap="$2" display="inline-flex"
```

After:

```tsx
gap="2" display="inline-flex"
```

### <Button> at line 57 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 67 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 86 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```


## `app/[locale]/(brewery)/ferm-data-integration/_components/FermDataIntegrationPageContent.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 21 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 22 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 30 (clean)

Before:

```tsx
gap="$0"
```

After:

```tsx
gap="0"
```


## `app/[locale]/(brewery)/ferm-data-integration/_components/sections/FermIntegrationDevicesSection.tsx`

### <YStack> at line 17 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <SizableText> at line 18 (clean)

Before:

```tsx
size="$3" fontFamily="$body"
```

After:

```tsx
size="3" fontFamily="body"
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <YStack> at line 34 (clean)

Before:

```tsx
gap="$2" p="$3" borderWidth={1} borderColor="var(--border)" borderRadius="$3" backgroundColor="var(--surface)"
```

After:

```tsx
gap="2" p="3" borderWidth={1} borderColor="var(--border)" borderRadius="3" backgroundColor="var(--surface)"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 44 (clean)

Before:

```tsx
size="$3" fontFamily="$body"
```

After:

```tsx
size="3" fontFamily="body"
```

### <SizableText> at line 47 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 61 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/ferm-data-integration/_components/sections/FermIntegrationSessionsSection.tsx`

### <YStack> at line 32 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <XStack> at line 42 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```


## `app/[locale]/(brewery)/ferm-data-integration/_components/sections/FermIntegrationSetupSection.tsx`

### <YStack> at line 39 (clean)

Before:

```tsx
gap="$2" mt={isTilt ? undefined : "$3"}
```

After:

```tsx
gap="2" mt={`${isTilt ? undefined : "3"}`}
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$3" fontFamily="$body"
```

After:

```tsx
size="3" fontFamily="body"
```

### <SizableText> at line 46 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 49 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 50 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 56 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 59 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 67 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 73 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 111 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 121 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <SizableText> at line 122 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <XStack> at line 134 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 146 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 154 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <SizableText> at line 155 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <XStack> at line 159 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 170 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 187 (clean)

Before:

```tsx
size="$2" color="var(--danger)" fontFamily="$body" mt="$3"
```

After:

```tsx
size="2" color="var(--danger)" fontFamily="body" mt="3"
```

### <YStack> at line 192 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <SizableText> at line 193 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 201 (clean)

Before:

```tsx
borderBottomWidth={1} borderColor="var(--border)" my="$3"
```

After:

```tsx
borderBottomWidth={1} borderColor="var(--border)" my="3"
```

### <YStack> at line 205 (clean)

Before:

```tsx
borderBottomWidth={1} borderColor="var(--border)" my="$3"
```

After:

```tsx
borderBottomWidth={1} borderColor="var(--border)" my="3"
```


## `app/[locale]/(brewery)/inventory/_components/InventoryItemCard.tsx`

### <XStack> at line 36 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="center"
```

### <YStack> at line 37 (clean)

Before:

```tsx
flex={1} minWidth={160} gap="$1"
```

After:

```tsx
flex={1} minWidth={160} gap="1"
```

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 42 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 50 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 56 (clean)

Before:

```tsx
minWidth={100} gap="$1"
```

After:

```tsx
minWidth={100} gap="1"
```

### <Input> at line 60 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 86 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/inventory/_components/InventoryPageContent.tsx`

### <YStack> at line 23 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 24 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 29 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```


## `app/[locale]/(brewery)/inventory/_components/sections/fermentables/InventoryFermentablesCustomAddBlock.tsx`

### <View> at line 29 (clean)

Before:

```tsx
borderWidth={1} borderColor="var(--border)" bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" rounded="$2" p="$3"
```

After:

```tsx
borderWidth={1} borderColor="var(--border)" bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" rounded="2" p="3"
```

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb="2"
```

### <XStack> at line 39 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 40 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 42 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 54 (clean)

Before:

```tsx
minWidth={140} gap="$1"
```

After:

```tsx
minWidth={140} gap="1"
```

### <Input> at line 56 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 68 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 70 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 82 (clean)

Before:

```tsx
minWidth={90} gap="$1"
```

After:

```tsx
minWidth={90} gap="1"
```

### <Input> at line 84 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 96 (clean)

Before:

```tsx
minWidth={90} gap="$1"
```

After:

```tsx
minWidth={90} gap="1"
```

### <Input> at line 98 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 110 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 112 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 124 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/inventory/_components/sections/fermentables/InventoryFermentablesItemListBlock.tsx`

### <SizableText> at line 14 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 19 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/fermentables/InventoryFermentablesSearchBlock.tsx`

### <XStack> at line 30 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <XStack> at line 32 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Input> at line 33 (clean)

Before:

```tsx
size="$3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 45 (clean)

Before:

```tsx
size="$3"
```

After:

```tsx
size="3"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <View> at line 63 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 64 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 66 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 67 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 68 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 82 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <Button> at line 84 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 104 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```

### <XStack> at line 109 (clean)

Before:

```tsx
mt="$2" gap="$2"
```

After:

```tsx
mt="2" gap="2"
```

### <Button> at line 116 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 123 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 132 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventoryAcidSaltsSection.tsx`

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 29 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <XStack> at line 31 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Input> at line 32 (clean)

Before:

```tsx
size="$3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 44 (clean)

Before:

```tsx
size="$3"
```

After:

```tsx
size="3"
```

### <Button> at line 47 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <View> at line 62 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 63 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 65 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 67 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 76 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <Button> at line 83 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 103 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```

### <XStack> at line 107 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 108 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 110 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 122 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 124 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 136 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 141 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 143 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventoryDetergentsSection.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 27 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 29 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 41 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 43 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 55 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventoryFermentablesSection.tsx`

### <YStack> at line 23 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventoryHopsSection.tsx`

### <YStack> at line 30 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 31 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Input> at line 34 (clean)

Before:

```tsx
size="$3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" minWidth={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 46 (clean)

Before:

```tsx
size="$3"
```

After:

```tsx
size="3"
```

### <Button> at line 49 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <View> at line 64 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 65 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 67 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 68 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <Button> at line 83 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 103 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```

### <XStack> at line 108 (clean)

Before:

```tsx
mt="$2" gap="$2"
```

After:

```tsx
mt="2" gap="2"
```

### <Button> at line 115 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 122 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 128 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <View> at line 142 (clean)

Before:

```tsx
borderWidth={1} borderColor="var(--border)" bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" rounded="$2" p="$3"
```

After:

```tsx
borderWidth={1} borderColor="var(--border)" bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" rounded="2" p="3"
```

### <SizableText> at line 149 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb="2"
```

### <XStack> at line 152 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 153 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 155 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 167 (clean)

Before:

```tsx
minWidth={90} gap="$1"
```

After:

```tsx
minWidth={90} gap="1"
```

### <Input> at line 169 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 181 (clean)

Before:

```tsx
minWidth={90} gap="$1"
```

After:

```tsx
minWidth={90} gap="1"
```

### <Input> at line 183 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 195 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 197 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 209 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 222 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 224 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventoryKeggingSection.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 27 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 29 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 41 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 43 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 55 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/inventory/_components/sections/InventorySpecialitiesSection.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 27 (clean)

Before:

```tsx
minWidth={120} gap="$1"
```

After:

```tsx
minWidth={120} gap="1"
```

### <Input> at line 29 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 41 (clean)

Before:

```tsx
minWidth={80} gap="$1"
```

After:

```tsx
minWidth={80} gap="1"
```

### <Input> at line 43 (clean)

Before:

```tsx
size="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 55 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/recipes/_components/RecipeEditSectionsNav.tsx`

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 40 (clean)

Before:

```tsx
display="block" width="100%" p="$2.5" borderRadius="$2" color="var(--text)" backgroundColor="transparent" textDecoration="none" cursor="pointer" hoverStyle={{ textDecoration: "none", background: "color-mix(in srgb, var(--info) 10%, var(--surface-2))", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
display="block" width="100%" p="2-5" borderRadius="2" color="var(--text)" backgroundColor="transparent" textDecoration="none hover:none" cursor="pointer" background="hover:color-mix(in srgb, var(--info) 10%, var(--surface-2))" outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

### <SizableText> at line 55 (clean)

Before:

```tsx
size="$3" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" color="var(--text)" fontFamily="body"
```

### <XStack> at line 62 (clean)

Before:

```tsx
height={1} backgroundColor="var(--border)" my="$3" border={0}
```

After:

```tsx
height={1} backgroundColor="var(--border)" my="3" border={0}
```

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 70 (clean)

Before:

```tsx
display="block" width="100%" p="$2.5" borderRadius="$2" color="var(--text-muted)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none" cursor="pointer" hoverStyle={{ textDecoration: "none", color: "var(--text)", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
display="block" width="100%" p="2-5" borderRadius="2" color="var(--text-muted) hover:var(--text)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none hover:none" cursor="pointer" outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

### <SizableText> at line 85 (clean)

Before:

```tsx
size="$3" color="inherit" fontFamily="$body"
```

After:

```tsx
size="3" color="inherit" fontFamily="body"
```

### <XStack> at line 91 (clean)

Before:

```tsx
display="block" width="100%" p="$2.5" borderRadius="$2" color="var(--text-muted)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none" cursor="pointer" hoverStyle={{ textDecoration: "none", color: "var(--text)", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
display="block" width="100%" p="2-5" borderRadius="2" color="var(--text-muted) hover:var(--text)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none hover:none" cursor="pointer" outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

### <SizableText> at line 106 (clean)

Before:

```tsx
size="$3" color="inherit" fontFamily="$body"
```

After:

```tsx
size="3" color="inherit" fontFamily="body"
```

### <XStack> at line 112 (clean)

Before:

```tsx
display="block" width="100%" p="$2.5" borderRadius="$2" color="var(--text-muted)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none" cursor="pointer" hoverStyle={{ textDecoration: "none", color: "var(--text)", }} focusStyle={{ outlineWidth: 2, outlineColor: "var(--focus-ring)" }}
```

After:

```tsx
display="block" width="100%" p="2-5" borderRadius="2" color="var(--text-muted) hover:var(--text)" backgroundColor="color-mix(in srgb, var(--surface-2) 35%, transparent)" textDecoration="none hover:none" cursor="pointer" outlineWidth="focus:2px" outlineColor="focus:var(--focus-ring)"
```

### <SizableText> at line 127 (clean)

Before:

```tsx
size="$3" color="inherit" fontFamily="$body"
```

After:

```tsx
size="3" color="inherit" fontFamily="body"
```

### <SizableText> at line 160 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" marginTop={0} marginBottom="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" marginTop={0} marginBottom="2"
```


## `app/[locale]/(brewery)/recipes/_components/RecipesPageContent.tsx`

### <YStack> at line 19 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 20 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" mb="$2"
```

After:

```tsx
size="2" mb="2"
```

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$0"
```

After:

```tsx
gap="0"
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/recipes/_components/sections/RecipesCreateSection.tsx`

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 45 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 60 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 77 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <XStack> at line 83 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center"
```

After:

```tsx
gap="3" mt="3" alignItems="center"
```

### <Button> at line 84 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 96 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/_components/sections/RecipesExportSection.tsx`

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 25 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2.5" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2-5" mb={0}
```


## `app/[locale]/(brewery)/recipes/_components/sections/RecipesListSection.tsx`

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 44 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <XStack> at line 45 (clean)

Before:

```tsx
justifyContent="space-between" alignItems="flex-start" columnGap="$3" rowGap="$0.5"
```

After:

```tsx
justifyContent="space-between" alignItems="flex-start" columnGap="3" rowGap="0-5"
```

### <SizableText> at line 46 (clean)

Before:

```tsx
flex={1} fontFamily="$body"
```

After:

```tsx
flex={1} fontFamily="body"
```

### <Button> at line 59 (clean)

Before:

```tsx
size="$3" color="var(--danger)"
```

After:

```tsx
size="3" color="var(--danger)"
```

### <XStack> at line 70 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <View> at line 76 (clean)

Before:

```tsx
mt="$1.5"
```

After:

```tsx
mt="1-5"
```

### <SizableText> at line 77 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0} mb="$2"
```

After:

```tsx
size="2" fontFamily="body" mt={0} mb="2"
```

### <XStack> at line 81 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="center"
```

### <Button> at line 82 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 93 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <XStack> at line 115 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center"
```

After:

```tsx
gap="3" mt="3" alignItems="center"
```

### <Button> at line 116 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 127 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 130 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/editable/YeastEditorEditableRows.tsx`

### <SizableText> at line 20 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```

### <View> at line 27 (clean)

Before:

```tsx
overflowX="auto" mt="$3"
```

After:

```tsx
overflowX="auto" mt="3"
```

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/editable/YeastEditorEditableSaveFooter.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
mt="$3" mb="$4" gap="$2" alignItems="flex-end"
```

After:

```tsx
mt="3" mb="4" gap="2" alignItems="flex-end"
```

### <Button> at line 26 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/editable/YeastEditorEditableSearch.tsx`

### <XStack> at line 62 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap" mt="$1"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap" mt="1"
```

### <Input> at line 63 (clean)

Before:

```tsx
flex={1} minW={200} size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
flex={1} minW={200} size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 78 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 90 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 105 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 106 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 107 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 114 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 119 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 124 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 131 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 138 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 143 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 148 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <Button> at line 153 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/editable/YeastEditorEditableToolbar.tsx`

### <XStack> at line 17 (clean)

Before:

```tsx
gap="$3" items="center" flexWrap="wrap"
```

After:

```tsx
gap="3" items="center" flexWrap="wrap"
```

### <Button> at line 18 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/rowManualCount/YeastEditorRowManualCountFields.tsx`

### <XStack> at line 27 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end"
```

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 58 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <XStack> at line 59 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="nowrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="nowrap"
```

### <Input> at line 73 (clean)

Before:

```tsx
size="$3" w={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 101 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <XStack> at line 102 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="nowrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="nowrap"
```

### <Input> at line 116 (configuration-warning)

Before:

```tsx
size="$3" w={80} bg="var(--surface)" borderWidth={1} borderColor={isTotalCellsTooLow(r.manualCellCount) ? "$red10" : "var(--border)"} rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={80} bg="var(--surface)" borderWidth={1} borderColor={`${isTotalCellsTooLow(r.manualCellCount) ? "red10" : "var(--border)"}`} rounded="2" fontFamily="body"
```

Configuration warnings:

- **legacy-palette-token**: borderColor preserves `red10`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

### <SizableText> at line 144 (configuration-warning)

Before:

```tsx
size="$1" color="$red10" fontFamily="$body" mt="$1"
```

After:

```tsx
size="1" color="red10" fontFamily="body" mt="1"
```

Configuration warnings:

- **legacy-palette-token**: color preserves `red10`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

### <YStack> at line 157 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <XStack> at line 158 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 159 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 172 (configuration-warning)

Before:

```tsx
p="$2" bg="var(--surface-2)" rounded="$2" borderWidth={1} borderColor={isInvalid ? "$red10" : "var(--border)"}
```

After:

```tsx
p="2" bg="var(--surface-2)" rounded="2" borderWidth={1} borderColor={`${isInvalid ? "red10" : "var(--border)"}`}
```

Configuration warnings:

- **legacy-palette-token**: borderColor preserves `red10`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

### <SizableText> at line 179 (configuration-warning)

Before:

```tsx
size="$2" fontFamily="$body" color={isInvalid ? "$red10" : "var(--text)"}
```

After:

```tsx
size="2" fontFamily="body" color={`${isInvalid ? "red10" : "var(--text)"}`}
```

Configuration warnings:

- **legacy-palette-token**: color preserves `red10`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/rowPitch/YeastEditorRowPitchActions.tsx`

### <XStack> at line 12 (clean)

Before:

```tsx
gap="$2" flexBasis="100%" w="100%" mt={-4} flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexBasis="100%" w="100%" mt={-4} flexWrap="wrap" alignItems="center"
```

### <SizableText> at line 13 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="1" color="var(--text-muted)" fontFamily="body" mb={0}
```

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="1" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/rowPitch/YeastEditorRowPitchAmountFields.tsx`

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <XStack> at line 28 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="nowrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="nowrap"
```

### <YStack> at line 94 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <Input> at line 102 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/rowPitch/YeastEditorRowPitchFields.tsx`

### <YStack> at line 32 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 53 (clean)

Before:

```tsx
gap="$1" minW={220}
```

After:

```tsx
gap="1" minW={220}
```

### <SizableText> at line 57 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)" fontFamily="$body" ml="$1" display="inline"
```

After:

```tsx
size="1" color="var(--text-muted)" fontFamily="body" ml="1" display="inline"
```

### <YStack> at line 80 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <XStack> at line 81 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="nowrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="nowrap"
```

### <YStack> at line 111 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <Input> at line 122 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 151 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <Input> at line 155 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorEditable.tsx`

### <View> at line 74 (clean)

Before:

```tsx
borderTopWidth={1} borderColor="var(--border)" my="$3"
```

After:

```tsx
borderTopWidth={1} borderColor="var(--border)" my="3"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorReadOnly.tsx`

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <XStack> at line 30 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

### <SizableText> at line 32 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <YStack> at line 36 (clean)

Before:

```tsx
gap="$1" flex={1} minW={200}
```

After:

```tsx
gap="1" flex={1} minW={200}
```

### <YStack> at line 41 (clean)

Before:

```tsx
gap="$1" minW={120}
```

After:

```tsx
gap="1" minW={120}
```

### <YStack> at line 47 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 52 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 58 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 65 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 70 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 78 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 98 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <View> at line 106 (clean)

Before:

```tsx
flexBasis="100%" w="100%" mt="$2"
```

After:

```tsx
flexBasis="100%" w="100%" mt="2"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 113 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```

### <YStack> at line 114 (clean)

Before:

```tsx
gap="$1" minW={220}
```

After:

```tsx
gap="1" minW={220}
```

### <YStack> at line 124 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 130 (clean)

Before:

```tsx
gap="$1" minW={180}
```

After:

```tsx
gap="1" minW={180}
```

### <YStack> at line 146 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <SizableText> at line 158 (clean)

Before:

```tsx
size="$2" mt="$3" mb={0}
```

After:

```tsx
size="2" mt="3" mb={0}
```

### <SizableText> at line 166 (configuration-warning)

Before:

```tsx
size="$2" color="$gray10"
```

After:

```tsx
size="2" color="gray10"
```

Configuration warnings:

- **legacy-palette-token**: color preserves `gray10`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorRow.tsx`

### <XStack> at line 24 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Button> at line 52 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 66 (clean)

Before:

```tsx
flexBasis="100%" w="100%" mt="$2"
```

After:

```tsx
flexBasis="100%" w="100%" mt="2"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 73 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$1"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb="1"
```

### <SizableText> at line 76 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb="2"
```

### <XStack> at line 79 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```

### <XStack> at line 83 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorRowAttenuation.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 31 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 37 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Input> at line 41 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 55 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Input> at line 59 (clean)

Before:

```tsx
size="$3" w={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 86 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorRowIdentity.tsx`

### <YStack> at line 26 (clean)

Before:

```tsx
gap="$1" flex={1} minW={200}
```

After:

```tsx
gap="1" flex={1} minW={200}
```

### <Input> at line 33 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 59 (clean)

Before:

```tsx
gap="$1" minW={120}
```

After:

```tsx
gap="1" minW={120}
```

### <YStack> at line 65 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 76 (clean)

Before:

```tsx
gap="$1" minW={200}
```

After:

```tsx
gap="1" minW={200}
```

### <YStack> at line 114 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```


## `app/[locale]/(brewery)/recipes/_components/yeastEditor/YeastEditorRowManualCount.tsx`

### <YStack> at line 44 (clean)

Before:

```tsx
gap="$2" flexBasis="100%" w="100%" mt="$2" pt="$2" borderTopWidth={1} borderColor="var(--border)"
```

After:

```tsx
gap="2" flexBasis="100%" w="100%" mt="2" pt="2" borderTopWidth={1} borderColor="var(--border)"
```

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" fontWeight="600"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" fontWeight="600"
```

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" whiteSpace="pre-line"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" whiteSpace="pre-line"
```

### <SizableText> at line 51 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" whiteSpace="pre-line" textDecorationLine="underline"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" whiteSpace="pre-line" textDecorationLine="underline"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" fontWeight="600"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" fontWeight="600"
```

### <YStack> at line 63 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <Button> at line 66 (clean)

Before:

```tsx
size="$2" alignSelf="flex-start" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" alignSelf="flex-start" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 86 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```

### <YStack> at line 87 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <YStack> at line 88 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 89 (clean)

Before:

```tsx
gap="$2" alignItems="center" flexWrap="nowrap"
```

After:

```tsx
gap="2" alignItems="center" flexWrap="nowrap"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/BrewSessionDetailPageContent.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionActionBarSection.tsx`

### <Button> at line 130 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 142 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 154 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" flex={1}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" flex={1}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionCustomStepSection.tsx`

### <View> at line 129 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="3" p="3"
```

### <XStack> at line 137 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap" mt="$2"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap" mt="2"
```

### <Input> at line 142 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Input> at line 173 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 188 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionDate/BrewSessionDateBlocks.tsx`

### <XStack> at line 45 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap"
```

### <Input> at line 48 (clean)

Before:

```tsx
size="$3" w="100%" minW={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" w="100%" minW={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body" color="var(--text)"
```

### <Input> at line 70 (clean)

Before:

```tsx
size="$3" w="100%" minW={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" w="100%" minW={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body" color="var(--text)"
```

### <XStack> at line 90 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap"
```

### <Button> at line 91 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 103 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 115 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <YStack> at line 148 (clean)

Before:

```tsx
gap="$2" width="100%"
```

After:

```tsx
gap="2" width="100%"
```

### <XStack> at line 149 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <SizableText> at line 150 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)" flexShrink={0}
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)" flexShrink={0}
```

### <Button> at line 165 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionDateSection.tsx`

### <View> at line 14 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="3" p="3"
```

### <YStack> at line 16 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionDetailHeaderSection.tsx`

### <H1> at line 129 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 131 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 140 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionGroupedSection.tsx`

### <View> at line 67 (clean)

Before:

```tsx
px="$2" py="$1" bg={sectionPillStyles.bg} borderWidth={1} borderColor={sectionPillStyles.borderColor} rounded="$2" minWidth={110} alignItems="center"
```

After:

```tsx
px="2" py="1" bg={sectionPillStyles.bg} borderWidth={1} borderColor={sectionPillStyles.borderColor} rounded="2" minWidth={110} alignItems="center"
```

Left authored:

- **dynamic-string-value**: bg value "sectionPillStyles.bg" is an open string; confirm it never holds a legacy "$token" spelling
- **dynamic-string-value**: borderColor value "sectionPillStyles.borderColor" is an open string; confirm it never holds a legacy "$token" spelling

### <SizableText> at line 77 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color={sectionPillStyles.textColor} mt={0}
```

After:

```tsx
size="2" fontFamily="body" color={sectionPillStyles.textColor} mt={0}
```

Left authored:

- **dynamic-string-value**: color value "sectionPillStyles.textColor" is an open string; confirm it never holds a legacy "$token" spelling

### <YStack> at line 88 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionHydrometerSection.tsx`

### <View> at line 15 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="3" p="3"
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionLogsSection.tsx`

### <View> at line 130 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="3" p="3"
```

### <SizableText> at line 141 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text-muted)"
```

After:

```tsx
size="3" fontFamily="body" color="var(--text-muted)"
```

### <XStack> at line 147 (clean)

Before:

```tsx
mt="$2" gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
mt="2" gap="2" items="center" flexWrap="wrap"
```

### <Button> at line 154 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 166 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 178 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```

### <YStack> at line 184 (clean)

Before:

```tsx
gap="$1" mt="$2"
```

After:

```tsx
gap="1" mt="2"
```

### <SizableText> at line 186 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 187 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionSectionAnchorTimer.tsx`

### <YStack> at line 20 (clean)

Before:

```tsx
gap="$1" p="$2" bg={running ? "color-mix(in srgb, var(--warning) 18%, var(--surface))" : "var(--surface-2)"} rounded="$2" borderWidth={1} borderColor={running ? "color-mix(in srgb, var(--warning) 40%, var(--border))" : "var(--border)"}
```

After:

```tsx
gap="1" p="2" bg={running ? "color-mix(in srgb, var(--warning) 18%, var(--surface))" : "var(--surface-2)"} rounded="2" borderWidth={1} borderColor={running ? "color-mix(in srgb, var(--warning) 40%, var(--border))" : "var(--border)"}
```

### <XStack> at line 28 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <SizableText> at line 29 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)"
```

### <Button> at line 33 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 47 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 61 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 76 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 82 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionStep/BrewSessionStepCardActions.tsx`

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap" justifyContent="space-between" width="100%"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap" justifyContent="space-between" width="100%"
```

### <XStack> at line 27 (clean)

Before:

```tsx
gap="$2" items="center" flexShrink={0}
```

After:

```tsx
gap="2" items="center" flexShrink={0}
```

### <Checkbox> at line 34 (clean)

Before:

```tsx
size="$4" bg="var(--surface-2)" borderWidth={2} borderColor="var(--border)"
```

After:

```tsx
size="4" bg="var(--surface-2)" borderWidth={2} borderColor="var(--border)"
```

### <XStack> at line 56 (clean)

Before:

```tsx
gap="$2" items="center" flexShrink={0}
```

After:

```tsx
gap="2" items="center" flexShrink={0}
```

### <Button> at line 57 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 70 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 87 (clean)

Before:

```tsx
alignSelf="flex-end" mt="$2" px="$2" py="$1" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="$2"
```

After:

```tsx
alignSelf="flex-end" mt="2" px="2" py="1" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="2"
```

### <SizableText> at line 97 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionStep/BrewSessionStepCardHeader.tsx`

### <XStack> at line 22 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <XStack> at line 23 (clean)

Before:

```tsx
gap="$1" flexShrink={0}
```

After:

```tsx
gap="1" flexShrink={0}
```

### <Button> at line 24 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 37 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Input> at line 54 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color={ st.status === "done" ? "var(--success)" : st.status === "in_progress" ? "var(--warning)" : st.status === "skipped" || st.status === "not_applicable" ? "var(--info)" : "var(--text-muted)" }
```

After:

```tsx
size="2" fontFamily="body" color={ st.status === "done" ? "var(--success)" : st.status === "in_progress" ? "var(--warning)" : st.status === "skipped" || st.status === "not_applicable" ? "var(--info)" : "var(--text-muted)" }
```

### <View> at line 164 (clean)

Before:

```tsx
p="$2" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="$2"
```

After:

```tsx
p="2" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="2"
```

### <SizableText> at line 171 (clean)

Before:

```tsx
size="$2" color="var(--text)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text)" fontFamily="body" mt={0}
```

### <SizableText> at line 176 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionStep/BrewSessionStepCardScheduleFields.tsx`

### <XStack> at line 19 (clean)

Before:

```tsx
gap="$2" items="flex-end" flexWrap="wrap"
```

After:

```tsx
gap="2" items="flex-end" flexWrap="wrap"
```

### <Input> at line 37 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionStep/BrewSessionStepCardTimerBlock.tsx`

### <XStack> at line 18 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap" width="100%"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap" width="100%"
```

### <Button> at line 20 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 34 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 87 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 95 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 104 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 113 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 114 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 122 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 131 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 150 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 154 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```

### <TextArea> at line 156 (clean)

Before:

```tsx
minHeight={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
minHeight={80} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionStepCard.tsx`

### <YStack> at line 78 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionStepsToolbarSection.tsx`

### <View> at line 129 (clean)

Before:

```tsx
mt="$2" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
mt="2" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <SizableText> at line 137 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionSummary/BrewSessionSummaryActionsBlock.tsx`

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap" mt="$3"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap" mt="3"
```

### <Button> at line 35 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 53 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 67 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 81 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 106 (clean)

Before:

```tsx
w="100%" mt="$2" p="$2" bg="color-mix(in srgb, var(--success) 14%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--success) 40%, var(--border))" rounded="$2"
```

After:

```tsx
w="100%" mt="2" p="2" bg="color-mix(in srgb, var(--success) 14%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--success) 40%, var(--border))" rounded="2"
```

### <SizableText> at line 115 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt={0}
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 126 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <XStack> at line 129 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <Button> at line 130 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 142 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionSummary/BrewSessionSummaryHeaderBlock.tsx`

### <SizableText> at line 14 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 17 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```

### <SizableText> at line 20 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/brewSessionSummary/BrewSessionSummaryStatsBlock.tsx`

### <View> at line 13 (clean)

Before:

```tsx
w="100%" mt="$2" p="$2" bg={ sessionTiming.status === "running" ? "color-mix(in srgb, var(--success) 14%, var(--surface))" : "color-mix(in srgb, var(--warning) 18%, var(--surface))" } borderWidth={1} borderColor={ sessionTiming.status === "running" ? "color-mix(in srgb, var(--success) 40%, var(--border))" : "color-mix(in srgb, var(--warning) 40%, var(--border))" } rounded="$2"
```

After:

```tsx
w="100%" mt="2" p="2" bg={ sessionTiming.status === "running" ? "color-mix(in srgb, var(--success) 14%, var(--surface))" : "color-mix(in srgb, var(--warning) 18%, var(--surface))" } borderWidth={1} borderColor={ sessionTiming.status === "running" ? "color-mix(in srgb, var(--success) 40%, var(--border))" : "color-mix(in srgb, var(--warning) 40%, var(--border))" } rounded="2"
```

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)" mt={0}
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)" mt={0}
```

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```

### <SizableText> at line 41 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/BrewSessionSummarySection.tsx`

### <View> at line 16 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$3" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="3" p="3"
```

### <YStack> at line 23 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/hydrometer/BrewSessionHydrometerControlsBlock.tsx`

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 69 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <Button> at line 70 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 82 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 94 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/sections/hydrometer/BrewSessionHydrometerReadingBlock.tsx`

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 31 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/brew-sessions/page.tsx`

### <YStack> at line 80 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 81 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 82 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 86 (clean)

Before:

```tsx
gap="$3" items="center" flexWrap="wrap"
```

After:

```tsx
gap="3" items="center" flexWrap="wrap"
```

### <Button> at line 87 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 99 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <YStack> at line 118 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <View> at line 120 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 128 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 129 (clean)

Before:

```tsx
size="$3" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 132 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text-muted)" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/RecipeEditPageContent.tsx`

### <SizableText> at line 55 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 63 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 75 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 94 (clean)

Before:

```tsx
position="fixed" top={16} left={0} right={0} zIndex={1000} width="100%" px="$4"
```

After:

```tsx
position="fixed" top={16} left={0} right={0} zIndex={1000} width="100%" px="4"
```

### <YStack> at line 104 (clean)

Before:

```tsx
gap="$2" width="100%"
```

After:

```tsx
gap="2" width="100%"
```

### <XStack> at line 126 (clean)

Before:

```tsx
flexDirection="column" gap="$4" $gtNarrow={{ flexDirection: "row" }} flex={1} minW={0}
```

After:

```tsx
flexDirection="column gtNarrow:row" gap="4" flex={1} minW={0}
```

### <YStack> at line 133 (clean)

Before:

```tsx
gap="$0" flex={1} minW={0}
```

After:

```tsx
gap="0" flex={1} minW={0}
```

### <View> at line 135 (clean)

Before:

```tsx
mb="$3"
```

After:

```tsx
mb="3"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/analysis/RecipeAnalysisAbvPanel.tsx`

### <XStack> at line 14 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 15 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 16 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 17 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 36 (clean)

Before:

```tsx
gap="$1" display="inline-flex"
```

After:

```tsx
gap="1" display="inline-flex"
```

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/analysis/RecipeAnalysisColorPanel.tsx`

### <XStack> at line 23 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 24 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 25 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 51 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 52 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/analysis/RecipeAnalysisGravityPanel.tsx`

### <XStack> at line 14 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 15 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <SizableText> at line 16 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 48 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 49 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 51 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 55 (clean)

Before:

```tsx
gap="$1" display="inline-flex"
```

After:

```tsx
gap="1" display="inline-flex"
```

### <SizableText> at line 57 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 63 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 64 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 65 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 66 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 83 (clean)

Before:

```tsx
gap="$1" display="inline-flex"
```

After:

```tsx
gap="1" display="inline-flex"
```

### <SizableText> at line 85 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 91 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 92 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 93 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 94 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 111 (clean)

Before:

```tsx
gap="$1" display="inline-flex"
```

After:

```tsx
gap="1" display="inline-flex"
```

### <SizableText> at line 113 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 119 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 120 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 121 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 122 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 146 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 147 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 148 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 149 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 173 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 174 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 175 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 176 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/analysis/RecipeAnalysisHopsYeastPanel.tsx`

### <XStack> at line 14 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 15 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 16 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 17 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 38 (clean)

Before:

```tsx
gap="$1" display="inline-flex"
```

After:

```tsx
gap="1" display="inline-flex"
```

### <SizableText> at line 41 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/analysis/RecipeAnalysisIbuPanel.tsx`

### <XStack> at line 15 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 16 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 17 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 18 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 48 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 49 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 51 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 81 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 82 (clean)

Before:

```tsx
minW={180} pr="$3"
```

After:

```tsx
minW={180} pr="3"
```

### <XStack> at line 83 (clean)

Before:

```tsx
gap="$2" alignItems="baseline" flexWrap="wrap"
```

After:

```tsx
gap="2" alignItems="baseline" flexWrap="wrap"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
fontWeight="bold" fontFamily="body" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/fermentables/RecipeEditFermentablesList.tsx`

### <SizableText> at line 11 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```

### <View> at line 18 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 19 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/fermentables/RecipeEditFermentablesRowAmount.tsx`

### <XStack> at line 18 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```

### <YStack> at line 19 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Input> at line 23 (clean)

Before:

```tsx
size="$3" w={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 40 (clean)

Before:

```tsx
gap="$1" minW={80}
```

After:

```tsx
gap="1" minW={80}
```

### <Input> at line 44 (clean)

Before:

```tsx
size="$3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={100} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 63 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 80 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 99 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 116 (clean)

Before:

```tsx
gap="$1" minW={140}
```

After:

```tsx
gap="1" minW={140}
```

### <YStack> at line 140 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Input> at line 144 (clean)

Before:

```tsx
size="$3" w={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={140} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/fermentables/RecipeEditFermentablesRowIdentity.tsx`

### <XStack> at line 22 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" flexDirection="row"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$1" flex={1} minW={240} minWidth={0}
```

After:

```tsx
gap="1" flex={1} minW={240} minWidth={0}
```

### <Input> at line 30 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 57 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <YStack> at line 63 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Button> at line 68 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/fermentables/RecipeEditFermentablesRowMash.tsx`

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 29 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```

### <YStack> at line 32 (clean)

Before:

```tsx
gap="$1" w={220} maxW="100%"
```

After:

```tsx
gap="1" w={220} maxW="100%"
```

### <YStack> at line 46 (clean)

Before:

```tsx
gap="$1" w={260} maxW="100%"
```

After:

```tsx
gap="1" w={260} maxW="100%"
```

### <YStack> at line 85 (clean)

Before:

```tsx
gap="$1" w={200} maxW="100%"
```

After:

```tsx
gap="1" w={200} maxW="100%"
```

### <YStack> at line 91 (clean)

Before:

```tsx
gap="$1" w={240} maxW="100%"
```

After:

```tsx
gap="1" w={240} maxW="100%"
```

### <Input> at line 95 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 114 (clean)

Before:

```tsx
gap="$1" w={280} maxW="100%"
```

After:

```tsx
gap="1" w={280} maxW="100%"
```

### <Input> at line 118 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 137 (clean)

Before:

```tsx
gap="$1" w={200} maxW="100%"
```

After:

```tsx
gap="1" w={200} maxW="100%"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/fermentables/RecipeEditFermentablesToolbar.tsx`

### <View> at line 24 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <XStack> at line 29 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <Input> at line 30 (clean)

Before:

```tsx
flex={1} minW={200} size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
flex={1} minW={200} size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 45 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 57 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 75 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 76 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <SizableText> at line 82 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)" textAlign="right" width="100%"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)" textAlign="right" width="100%"
```

### <XStack> at line 86 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 87 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 88 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 89 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 90 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 91 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <Button> at line 93 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 115 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```

### <YStack> at line 120 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 121 (clean)

Before:

```tsx
gap="$3" items="center" flexWrap="wrap" mt="$1"
```

After:

```tsx
gap="3" items="center" flexWrap="wrap" mt="1"
```

### <Button> at line 122 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/other/RecipeEditOtherFooterBlock.tsx`

### <XStack> at line 11 (clean)

Before:

```tsx
mt="$3" justify="flex-end"
```

After:

```tsx
mt="3" justify="flex-end"
```

### <Button> at line 12 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/other/RecipeEditOtherHeaderBlock.tsx`

### <XStack> at line 9 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 10 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" m={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" m={0}
```

### <Button> at line 13 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/other/RecipeEditOtherList.tsx`

### <SizableText> at line 11 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```

### <YStack> at line 18 (clean)

Before:

```tsx
gap="$3" mt="$3" w="100%" minWidth={0}
```

After:

```tsx
gap="3" mt="3" w="100%" minWidth={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/other/RecipeEditOtherRowFields.tsx`

### <XStack> at line 24 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" w="100%" minWidth={0}
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <YStack> at line 30 (clean)

Before:

```tsx
gap="$1" flex={1} minW={280} flexShrink={0}
```

After:

```tsx
gap="1" flex={1} minW={280} flexShrink={0}
```

### <Input> at line 32 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 47 (clean)

Before:

```tsx
gap="$1" w={180} maxW="100%" flexShrink={0}
```

After:

```tsx
gap="1" w={180} maxW="100%" flexShrink={0}
```

### <YStack> at line 59 (clean)

Before:

```tsx
gap="$1" w={160} maxW="100%" flexShrink={0}
```

After:

```tsx
gap="1" w={160} maxW="100%" flexShrink={0}
```

### <YStack> at line 71 (clean)

Before:

```tsx
gap="$1" w={140} maxW="100%" flexShrink={0}
```

After:

```tsx
gap="1" w={140} maxW="100%" flexShrink={0}
```

### <Input> at line 73 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 91 (clean)

Before:

```tsx
gap="$1" w={200} maxW="100%" flexShrink={0}
```

After:

```tsx
gap="1" w={200} maxW="100%" flexShrink={0}
```

### <YStack> at line 106 (clean)

Before:

```tsx
gap="$1" w={180} maxW="100%" flexShrink={0}
```

After:

```tsx
gap="1" w={180} maxW="100%" flexShrink={0}
```

### <Input> at line 108 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 145 (clean)

Before:

```tsx
gap="$1" flex={1} minW={240} flexShrink={0}
```

After:

```tsx
gap="1" flex={1} minW={240} flexShrink={0}
```

### <Input> at line 147 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 162 (clean)

Before:

```tsx
gap="$1" flex={1} minW={260} flexShrink={0}
```

After:

```tsx
gap="1" flex={1} minW={260} flexShrink={0}
```

### <Input> at line 164 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 179 (clean)

Before:

```tsx
size="$2" flexShrink={0} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" flexShrink={0} bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditAnalysisSection.tsx`

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <View> at line 50 (clean)

Before:

```tsx
mt="$2" px="$3" py="$2" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="$2"
```

After:

```tsx
mt="2" px="3" py="2" bg="color-mix(in srgb, var(--warning) 18%, var(--surface))" borderWidth={1} borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))" rounded="2"
```

### <SizableText> at line 59 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt="$1"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt="1"
```

### <View> at line 81 (clean)

Before:

```tsx
bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" borderWidth={1} borderColor="var(--field-computed-border)" rounded="$2" p="$3" mt="$3"
```

After:

```tsx
bg="color-mix(in srgb, var(--surface-2) 35%, var(--surface))" borderWidth={1} borderColor="var(--field-computed-border)" rounded="2" p="3" mt="3"
```

### <XStack> at line 91 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" items="baseline" display="inline-flex"
```

After:

```tsx
gap="2" flexWrap="wrap" items="baseline" display="inline-flex"
```

### <SizableText> at line 92 (clean)

Before:

```tsx
size="$3" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="3" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 95 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 102 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 110 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditBasicsSection.tsx`

### <XStack> at line 42 (clean)

Before:

```tsx
gap="$3" mt="$2" flexWrap="wrap" $gtNarrow={{ flexWrap: "nowrap" }}
```

After:

```tsx
gap="3" mt="2" flexWrap="wrap gtNarrow:nowrap"
```

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <Input> at line 51 (clean)

Before:

```tsx
size="$3" flex={1} minW={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" flex={1} minW={180} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 66 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" fontWeight="bold"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" fontWeight="bold"
```

### <SizableText> at line 95 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <YStack> at line 103 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 104 (clean)

Before:

```tsx
gap="$3" items="center" flexWrap="wrap"
```

After:

```tsx
gap="3" items="center" flexWrap="wrap"
```

### <Button> at line 105 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 118 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <SizableText> at line 126 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <Button> at line 129 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 146 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 157 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <SizableText> at line 158 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <Button> at line 161 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditBoilSection.tsx`

### <Input> at line 28 (clean)

Before:

```tsx
size="$3" w={120} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={120} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <XStack> at line 46 (clean)

Before:

```tsx
mt="$3" justify="flex-end"
```

After:

```tsx
mt="3" justify="flex-end"
```

### <Button> at line 47 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditBrewingHistorySection.tsx`

### <YStack> at line 29 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 74 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 96 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 99 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 113 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditBrewSection.tsx`

### <YStack> at line 26 (clean)

Before:

```tsx
gap="$2" mt="$2"
```

After:

```tsx
gap="2" mt="2"
```

### <SizableText> at line 27 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <Button> at line 30 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditEquipmentSection.tsx`

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$3" mt="$3" flexWrap="wrap" items="flex-end"
```

After:

```tsx
gap="3" mt="3" flexWrap="wrap" items="flex-end"
```

### <Button> at line 57 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 69 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 87 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditFermentablesSection.tsx`

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 36 (clean)

Before:

```tsx
borderTopWidth={1} borderColor="var(--border)" my="$3"
```

After:

```tsx
borderTopWidth={1} borderColor="var(--border)" my="3"
```

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 47 (clean)

Before:

```tsx
mt="$3" justify="flex-end"
```

After:

```tsx
mt="3" justify="flex-end"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditHopsRowCard.tsx`

### <XStack> at line 21 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end"
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$1" flex={1} minW={280} minWidth={0}
```

After:

```tsx
gap="1" flex={1} minW={280} minWidth={0}
```

### <Input> at line 29 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 46 (clean)

Before:

```tsx
gap="$1" w={240} maxW="100%"
```

After:

```tsx
gap="1" w={240} maxW="100%"
```

### <Button> at line 51 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <XStack> at line 65 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" items="flex-end" mt="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" items="flex-end" mt="2"
```

### <YStack> at line 66 (clean)

Before:

```tsx
gap="$1" minW={100}
```

After:

```tsx
gap="1" minW={100}
```

### <Input> at line 70 (clean)

Before:

```tsx
size="$3" w={120} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={120} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 87 (clean)

Before:

```tsx
gap="$1" minW={90}
```

After:

```tsx
gap="1" minW={90}
```

### <Input> at line 89 (clean)

Before:

```tsx
size="$3" w={110} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={110} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 108 (clean)

Before:

```tsx
gap="$1" minW={170}
```

After:

```tsx
gap="1" minW={170}
```

### <YStack> at line 131 (clean)

Before:

```tsx
gap="$1" minW={130}
```

After:

```tsx
gap="1" minW={130}
```

### <YStack> at line 145 (clean)

Before:

```tsx
gap="$1" minW={90}
```

After:

```tsx
gap="1" minW={90}
```

### <Input> at line 147 (clean)

Before:

```tsx
size="$3" w={110} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w={110} bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditHopsRows.tsx`

### <XStack> at line 19 (clean)

Before:

```tsx
gap="$3" items="center" mt="$3"
```

After:

```tsx
gap="3" items="center" mt="3"
```

### <Button> at line 20 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 35 (clean)

Before:

```tsx
overflowX="auto" mt="$3"
```

After:

```tsx
overflowX="auto" mt="3"
```

### <YStack> at line 36 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```

### <XStack> at line 48 (clean)

Before:

```tsx
mt="$3" justify="flex-end"
```

After:

```tsx
mt="3" justify="flex-end"
```

### <Button> at line 49 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <SizableText> at line 63 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditHopsSearch.tsx`

### <View> at line 21 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <XStack> at line 24 (clean)

Before:

```tsx
gap="$2" items="center" flexWrap="wrap"
```

After:

```tsx
gap="2" items="center" flexWrap="wrap"
```

### <Input> at line 25 (clean)

Before:

```tsx
flex={1} minW={200} size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
flex={1} minW={200} size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <Button> at line 40 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <Button> at line 52 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```

### <View> at line 67 (clean)

Before:

```tsx
overflowX="auto" mt="$2"
```

After:

```tsx
overflowX="auto" mt="2"
```

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 69 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 72 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 73 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" color="var(--text)"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$2" minW="max-content"
```

After:

```tsx
gap="2" minW="max-content"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" textAlign="right"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" textAlign="right"
```

### <Button> at line 83 (clean)

Before:

```tsx
size="$2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="2" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditHopsSection.tsx`

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditMashingSection.tsx`

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 50 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)"
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)"
```

### <SizableText> at line 59 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0} mb="$3"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0} mb="3"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb="2"
```

### <View> at line 67 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt="2" mb={0}
```

### <View> at line 86 (clean)

Before:

```tsx
mt="$4"
```

After:

```tsx
mt="4"
```

### <SizableText> at line 87 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb="2"
```

### <SizableText> at line 108 (clean)

Before:

```tsx
size="$2" fontFamily="$body" color="var(--text)" mt="$2" mb={0}
```

After:

```tsx
size="2" fontFamily="body" color="var(--text)" mt="2" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditNotesSection.tsx`

### <TextArea> at line 25 (clean)

Before:

```tsx
numberOfLines={6} size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
numberOfLines={6} size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditWaterSection.tsx`

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 29 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" mt="$2"
```

After:

```tsx
gap="2" flexWrap="wrap" mt="2"
```

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 39 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 42 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 46 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/edit/_components/sections/RecipeEditYeastSection.tsx`

### <View> at line 31 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 44 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/versions/page.tsx`

### <YStack> at line 61 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 62 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 63 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 67 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 68 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" fontFamily="body" mb={0}
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```

### <SizableText> at line 74 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" fontFamily="body" mb={0}
```

### <View> at line 79 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```

### <XStack> at line 80 (clean)

Before:

```tsx
gap="$3" items="center" justifyContent="space-between" flexWrap="wrap"
```

After:

```tsx
gap="3" items="center" justifyContent="space-between" flexWrap="wrap"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
fontFamily="$body" fontWeight="bold"
```

After:

```tsx
fontFamily="body" fontWeight="bold"
```

### <Button> at line 84 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 100 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3"
```

### <YStack> at line 109 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 110 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 116 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 120 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubAlkVsBicarbSection.tsx`

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubFinalRecapSection.tsx`

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 54 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 67 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubLinksSection.tsx`

### <SizableText> at line 21 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 27 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 39 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubRecapMergedBlocks.tsx`

### <H3> at line 15 (clean)

Before:

```tsx
mt="$4"
```

After:

```tsx
mt="4"
```

### <H4> at line 42 (clean)

Before:

```tsx
mt="$3" mb="$1.5"
```

After:

```tsx
mt="3" mb="1-5"
```

### <SizableText> at line 46 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 66 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```

### <XStack> at line 92 (clean)

Before:

```tsx
mt="$2" mb="$1.5" gap="$2" alignItems="baseline"
```

After:

```tsx
mt="2" mb="1-5" gap="2" alignItems="baseline"
```

### <SizableText> at line 93 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 121 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb="2"
```

### <View> at line 124 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubRecapPerStreamTable.tsx`

### <H3> at line 12 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <View> at line 13 (clean)

Before:

```tsx
mb="$4"
```

After:

```tsx
mb="4"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubRecapSection.tsx`

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 44 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body"
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 91 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/sections/WaterHubStatusSection.tsx`

### <SizableText> at line 34 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 39 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <SizableText> at line 44 (clean)

Before:

```tsx
size="$2" fontFamily="$body"
```

After:

```tsx
size="2" fontFamily="body"
```

### <XStack> at line 60 (clean)

Before:

```tsx
gap="$3" alignItems="center"
```

After:

```tsx
gap="3" alignItems="center"
```

### <Button> at line 61 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_components/WaterHubPageContent.tsx`

### <YStack> at line 30 (clean)

Before:

```tsx
width="100%" gap="$1" mb="$2"
```

After:

```tsx
width="100%" gap="1" mb="2"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0} mb={0} display="block"
```

After:

```tsx
size="2" fontFamily="body" mt={0} mb={0} display="block"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_lib/acidification/WaterAcidificationModeFields.tsx`

### <YStack> at line 88 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 101 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 114 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 118 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 137 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 141 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_lib/acidification/WaterAcidificationResultPanel.tsx`

### <SizableText> at line 129 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <SizableText> at line 143 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <SizableText> at line 178 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/_lib/acidification/WaterAcidificationSaveBar.tsx`

### <Button> at line 34 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 53 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <YStack> at line 67 (clean)

Before:

```tsx
gap="$2" mt="$3" mb="$3"
```

After:

```tsx
gap="2" mt="3" mb="3"
```

### <XStack> at line 68 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 81 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/boilAdjustment/WaterBoilAdjustmentActionsBlock.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 19 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 20 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 31 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/boilAdjustment/WaterBoilMixedIonsBlock.tsx`

### <SizableText> at line 15 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <SizableText> at line 58 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/boilAdjustment/WaterBoilProfilePickersBlock.tsx`

### <XStack> at line 31 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <View> at line 48 (clean)

Before:

```tsx
mt="$1.5"
```

After:

```tsx
mt="1-5"
```

### <YStack> at line 53 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <View> at line 68 (clean)

Before:

```tsx
mt="$1.5"
```

After:

```tsx
mt="1-5"
```

### <YStack> at line 73 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <View> at line 88 (clean)

Before:

```tsx
mt="$1.5"
```

After:

```tsx
mt="1-5"
```

### <XStack> at line 93 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" mt="$3"
```

After:

```tsx
gap="3" flexWrap="wrap" mt="3"
```

### <YStack> at line 95 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 99 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 115 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 119 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/salts/WaterBoilSaltsActionsBlock.tsx`

### <YStack> at line 22 (clean)

Before:

```tsx
mt="$3" gap="$2"
```

After:

```tsx
mt="3" gap="2"
```

### <XStack> at line 23 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 24 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 27 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 31 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/salts/WaterBoilSaltsEditorBlock.tsx`

### <SizableText> at line 14 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/WaterBoilAcidificationInputs.tsx`

### <XStack> at line 32 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 55 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 59 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 80 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 82 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 100 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 102 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/WaterBoilAcidificationOverallPanel.tsx`

### <View> at line 30 (clean)

Before:

```tsx
height={1} bg="var(--border)" my="$4"
```

After:

```tsx
height={1} bg="var(--border)" my="4"
```

### <SizableText> at line 35 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 39 (clean)

Before:

```tsx
mt="$3" gap="$2"
```

After:

```tsx
mt="3" gap="2"
```

### <XStack> at line 40 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 41 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 52 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 111 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/sections/WaterBoilAdjustmentSection.tsx`

### <SizableText> at line 18 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_components/WaterBoilPageContent.tsx`

### <H1> at line 33 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" fontFamily="body" mt={0}
```

### <YStack> at line 54 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```


## `app/[locale]/(brewery)/recipes/[id]/water/boil/_hooks/useWaterBoilAdjustment.tsx`

### <SizableText> at line 142 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 146 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 148 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/mashAdjustment/WaterMashAdjustmentActionsBlock.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 19 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 20 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 31 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/mashAdjustment/WaterMashMixedIonsBlock.tsx`

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/mashAdjustment/WaterMashProfilePickersBlock.tsx`

### <XStack> at line 26 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 28 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 58 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 73 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 77 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 93 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 97 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/mashOverall/WaterMashOverallBlocks.tsx`

### <YStack> at line 21 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <XStack> at line 22 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 23 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 26 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 29 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 130 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/salts/WaterMashSaltsBlocks.tsx`

### <SizableText> at line 13 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <YStack> at line 37 (clean)

Before:

```tsx
gap="$2" mt="$3"
```

After:

```tsx
gap="2" mt="3"
```

### <Button> at line 39 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 42 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/salts/WaterMashSaltsResultBlock.tsx`

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/WaterMashAcidificationInputs.tsx`

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 35 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 39 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 59 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 63 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1" mb={0}
```

### <Input> at line 66 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 86 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 102 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 104 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/WaterMashAdjustmentSection.tsx`

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 32 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/WaterMashGristSection.tsx`

### <SizableText> at line 151 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 154 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1" mb={0}
```

### <XStack> at line 169 (clean)

Before:

```tsx
gap="$3" alignItems="center"
```

After:

```tsx
gap="3" alignItems="center"
```

### <Button> at line 170 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 183 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/sections/WaterMashOverallSection.tsx`

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_components/WaterMashPageContent.tsx`

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" fontFamily="body" mt={0}
```

### <YStack> at line 60 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/mash/_hooks/useWaterMashAdjustment.tsx`

### <SizableText> at line 167 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 171 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 173 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/config/WaterSpargeConfigFieldBlocks.tsx`

### <XStack> at line 12 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 14 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 18 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 34 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 38 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 54 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 71 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 75 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/config/WaterSpargeConfigSaveBlock.tsx`

### <YStack> at line 10 (clean)

Before:

```tsx
mt="$3" gap="$2"
```

After:

```tsx
mt="3" gap="2"
```

### <XStack> at line 11 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 12 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/spargeSalts/WaterSpargeSaltsCombinedBlock.tsx`

### <SizableText> at line 58 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <View> at line 65 (clean)

Before:

```tsx
display="inline" ml="$1"
```

After:

```tsx
display="inline" ml="1"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/spargeSalts/WaterSpargeSaltsEditorBlock.tsx`

### <YStack> at line 35 (clean)

Before:

```tsx
mt="$3" gap="$2"
```

After:

```tsx
mt="3" gap="2"
```

### <XStack> at line 36 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 37 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 60 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/WaterSpargeAcidificationInputs.tsx`

### <XStack> at line 38 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 40 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 81 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 85 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 105 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 107 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 123 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 125 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 142 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 144 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/WaterSpargeAcidificationSection.tsx`

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1" mb={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/sections/WaterSpargeSaltsSection.tsx`

### <SizableText> at line 22 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/WaterSpargePageContent.tsx`

### <SizableText> at line 44 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" fontFamily="body" mt={0}
```

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```


## `app/[locale]/(brewery)/recipes/[id]/water/sparge/_lib/waterSpargeSelectedProfileInfo.tsx`

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb={0}
```

### <SizableText> at line 30 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <SizableText> at line 34 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" display="inline"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" display="inline"
```

### <XStack> at line 47 (clean)

Before:

```tsx
mt="$2" gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
mt="2" gap="3" alignItems="center" flexWrap="wrap"
```

### <Button> at line 48 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/recipes/[id]/yeast/_components/YeastPageContent.tsx`

### <H1> at line 46 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 54 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" fontFamily="body" mt={0}
```

### <SizableText> at line 71 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 80 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <H2> at line 81 (clean)

Before:

```tsx
mt={0} size="$5" fontFamily="$heading" color="var(--text)"
```

After:

```tsx
mt={0} size="5" fontFamily="heading" color="var(--text)"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2" mb="$3"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2" mb="3"
```

### <SizableText> at line 125 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="3" mb={0}
```


## `app/[locale]/(brewery)/recipes/import/page.tsx`

### <YStack> at line 20 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 21 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 22 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 27 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(brewery)/water-profiles/_components/WaterProfileCreateForm.tsx`

### <Accordion.Item> at line 32 (unknown-host)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

Conversion assessment:

- **unknown-host: marginTop**: the component's identity could not be established, so host validity for "marginTop" is unverified. Remedy: verify the component accepts this style prop, or supply type-aware provenance so the check can run.

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" opacity={0.7}
```

After:

```tsx
size="2" opacity={0.7}
```

### <SizableText> at line 47 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <XStack> at line 52 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 54 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 56 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 72 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 87 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 102 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 104 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <SizableText> at line 124 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 128 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 140 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 142 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <XStack> at line 161 (clean)

Before:

```tsx
gap="$3" mt="$3" alignItems="center"
```

After:

```tsx
gap="3" mt="3" alignItems="center"
```

### <Button> at line 162 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(brewery)/water-profiles/_components/WaterProfileListSection.tsx`

### <SizableText> at line 31 (clean)

Before:

```tsx
size="$2" opacity={0.7}
```

After:

```tsx
size="2" opacity={0.7}
```

### <SizableText> at line 38 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 46 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 68 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 73 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 78 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 90 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Button> at line 91 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 94 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 107 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 119 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/(brewery)/water-profiles/_components/WaterProfilesPageContent.tsx`

### <YStack> at line 18 (clean)

Before:

```tsx
width="100%" gap="$1" mb="$2"
```

After:

```tsx
width="100%" gap="1" mb="2"
```

### <SizableText> at line 20 (clean)

Before:

```tsx
size="$2" fontFamily="$body" mt={0} mb={0} display="block"
```

After:

```tsx
size="2" fontFamily="body" mt={0} mb={0} display="block"
```

### <View> at line 37 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(crp)/_components/crpReadOnly/CapacityBucketSummary.tsx`

### <YStack> at line 26 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 27 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 31 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 35 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/_components/crpReadOnly/ConflictSummary.tsx`

### <YStack> at line 25 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 30 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 35 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/_components/crpReadOnly/CrpMeta.tsx`

### <SizableText> at line 7 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(crp)/_components/crpReadOnly/CrpReadOnlyLayout.tsx`

### <YStack> at line 24 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading"
```

### <XStack> at line 36 (clean)

Before:

```tsx
gap="$3" alignItems="flex-start" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="flex-start" flexWrap="wrap"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" minWidth={180}
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" minWidth={180}
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(crp)/_components/crpReadOnly/ResourceSummary.tsx`

### <YStack> at line 36 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 46 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/_components/crpReadOnly/ScheduledOperationSummary.tsx`

### <YStack> at line 39 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 40 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 44 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 49 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 54 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/_components/crpReadOnly/WorkCenterSummary.tsx`

### <YStack> at line 36 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 37 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 46 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/capacity/page.tsx`

### <YStack> at line 64 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 66 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 73 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 94 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 100 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 110 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 112 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/resources/[resourceId]/page.tsx`

### <YStack> at line 93 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 95 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 99 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 111 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 117 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <XStack> at line 131 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/resources/page.tsx`

### <YStack> at line 81 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 83 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 86 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 90 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 115 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 127 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 141 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 147 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 150 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(crp)/schedule/page.tsx`

### <YStack> at line 93 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 95 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 98 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 102 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 130 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 137 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 144 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 146 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 167 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(mrp)/_components/MrpReadOnly.tsx`

### <YStack> at line 51 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 52 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading"
```

### <XStack> at line 63 (clean)

Before:

```tsx
gap="$3" alignItems="flex-start" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="flex-start" flexWrap="wrap"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" fontWeight="bold" fontFamily="$body" minWidth={180}
```

After:

```tsx
size="2" fontWeight="bold" fontFamily="body" minWidth={180}
```

### <SizableText> at line 67 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 131 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 132 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 136 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 141 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 148 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 173 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 174 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 178 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 213 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 214 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 217 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <XStack> at line 225 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 235 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(mrp)/material-requirements/page.tsx`

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 73 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 88 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 94 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 104 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 106 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(mrp)/production-orders/[orderId]/_components/ProductionOrderDetailContent.tsx`

### <YStack> at line 46 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 52 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 70 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 77 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="center"
```

### <YStack> at line 109 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 125 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 144 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(mrp)/production-orders/page.tsx`

### <YStack> at line 70 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 72 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 75 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 79 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 100 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 106 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 116 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 118 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```


## `app/[locale]/(pim)/attribute-sets/[setId]/page.tsx`

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 76 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 80 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
fontWeight="bold" mt="$2"
```

After:

```tsx
fontWeight="bold" mt="2"
```

### <SizableText> at line 90 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <Button> at line 97 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(pim)/attribute-sets/page.tsx`

### <YStack> at line 57 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 59 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <XStack> at line 60 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <Button> at line 61 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 75 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)"
```

After:

```tsx
size="2" color="var(--text-muted)"
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 85 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <SizableText> at line 89 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)"
```

After:

```tsx
size="2" color="var(--text-muted)"
```


## `app/[locale]/(pim)/categories/page.tsx`

### <SizableText> at line 29 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <YStack> at line 73 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 75 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <Button> at line 76 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <SizableText> at line 89 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)"
```

After:

```tsx
size="2" color="var(--text-muted)"
```


## `app/[locale]/(pim)/products/[productId]/page.tsx`

### <YStack> at line 75 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 83 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <XStack> at line 84 (clean)

Before:

```tsx
gap="$3" alignItems="center"
```

After:

```tsx
gap="3" alignItems="center"
```

### <Button> at line 86 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <H1> at line 101 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 102 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 106 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <SizableText> at line 114 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading" mb="$2"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading" mb="2"
```

### <SizableText> at line 124 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)"
```

After:

```tsx
size="2" color="var(--text-muted)"
```

### <SizableText> at line 132 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```


## `app/[locale]/(pim)/products/page.tsx`

### <YStack> at line 27 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 28 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 29 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="center"
```

### <Button> at line 42 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/(pim)/products/PimProductCreateForm.tsx`

### <YStack> at line 39 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <SizableText> at line 40 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading"
```

### <XStack> at line 43 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 44 (clean)

Before:

```tsx
gap="$1.5" flex={1} minWidth={180}
```

After:

```tsx
gap="1-5" flex={1} minWidth={180}
```

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 50 (clean)

Before:

```tsx
gap="$1.5" flex={1} minWidth={180}
```

After:

```tsx
gap="1-5" flex={1} minWidth={180}
```

### <SizableText> at line 51 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 56 (clean)

Before:

```tsx
gap="$1.5" flex={1} minWidth={180}
```

After:

```tsx
gap="1-5" flex={1} minWidth={180}
```

### <SizableText> at line 57 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 68 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 69 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 84 (clean)

Before:

```tsx
size="$2" color="var(--success)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--success)" fontFamily="body"
```


## `app/[locale]/(pim)/products/PimProductsTable.tsx`

### <SizableText> at line 18 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 26 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$4" fontWeight="bold" fontFamily="$heading" mb="$2"
```

After:

```tsx
size="4" fontWeight="bold" fontFamily="heading" mb="2"
```

### <YStack> at line 42 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 43 (clean)

Before:

```tsx
fontFamily="$body"
```

After:

```tsx
fontFamily="body"
```

### <XStack> at line 47 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 51 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(platform-layout)/about/page.tsx`

### <YStack> at line 10 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 11 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 12 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 15 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 19 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(platform-layout)/accessibility/page.tsx`

### <View> at line 149 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" maxW={720}
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3" maxW={720}
```

### <SizableText> at line 151 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 156 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 160 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 161 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 182 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 204 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <SizableText> at line 224 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 230 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/(platform-layout)/ai/_components/UsageTokenChart.tsx`

### <YStack> at line 46 (needs-relocation)

Before:

```tsx
backgroundColor="$background" padding="$2" borderRadius="$3" borderWidth={1} borderColor="$borderColor"
```

After:

```tsx
backgroundColor="background" padding="2" borderRadius="3" borderWidth={1} borderColor="border-color"
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on YStack — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).


## `app/[locale]/(platform-layout)/ai/page.tsx`

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <XStack> at line 34 (clean)

Before:

```tsx
alignItems="center" gap="$3" mb="$2"
```

After:

```tsx
alignItems="center" gap="3" mb="2"
```

### <XStack> at line 36 (clean)

Before:

```tsx
gap="$3" marginLeft="auto"
```

After:

```tsx
gap="3" marginLeft="auto"
```


## `app/[locale]/(platform-layout)/ai/settings/_components/AiSettingsAdminForm.tsx`

### <YStack> at line 31 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 33 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 45 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <YStack> at line 50 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 53 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <YStack> at line 58 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 62 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <SizableText> at line 76 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <XStack> at line 81 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 91 (clean)

Before:

```tsx
size="$1"
```

After:

```tsx
size="1"
```

### <YStack> at line 97 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 99 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 113 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <SizableText> at line 117 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 127 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <YStack> at line 130 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 132 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <YStack> at line 157 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 174 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <YStack> at line 187 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 190 (clean)

Before:

```tsx
mt="$1"
```

After:

```tsx
mt="1"
```

### <XStack> at line 200 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```


## `app/[locale]/(platform-layout)/ai/settings/_components/AiSettingsPageContent.tsx`

### <YStack> at line 47 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <YStack> at line 48 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 50 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)"
```

After:

```tsx
size="2" color="var(--text-muted)"
```


## `app/[locale]/(platform-layout)/ai/upgrade/page.tsx`

### <YStack> at line 73 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <YStack> at line 76 (clean)

Before:

```tsx
gap="$1" mt="$2"
```

After:

```tsx
gap="1" mt="2"
```

### <YStack> at line 102 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 105 (clean)

Before:

```tsx
size="$1"
```

After:

```tsx
size="1"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$1" color="var(--text-muted)"
```

After:

```tsx
size="1" color="var(--text-muted)"
```

### <XStack> at line 116 (clean)

Before:

```tsx
mt="$2"
```

After:

```tsx
mt="2"
```

### <YStack> at line 132 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 135 (clean)

Before:

```tsx
mt="$1"
```

After:

```tsx
mt="1"
```


## `app/[locale]/(platform-layout)/ai/usage/_components/AiUsagePageContent.tsx`

### <YStack> at line 32 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <View> at line 37 (needs-relocation, configuration-warning)

Before:

```tsx
backgroundColor="$red3" padding="$3" borderRadius="$3"
```

After:

```tsx
backgroundColor="red3" padding="3" borderRadius="3"
```

Configuration warnings:

- **legacy-palette-token**: backgroundColor preserves `red3`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on View — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <SizableText> at line 38 (configuration-warning)

Before:

```tsx
color="$red11"
```

After:

```tsx
color="red11"
```

Configuration warnings:

- **legacy-palette-token**: color preserves `red11`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

### <XStack> at line 43 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <YStack> at line 53 (needs-relocation, configuration-warning)

Before:

```tsx
gap="$2" backgroundColor="$yellow3" padding="$3" borderRadius="$3"
```

After:

```tsx
gap="2" backgroundColor="yellow3" padding="3" borderRadius="3"
```

Configuration warnings:

- **legacy-palette-token**: backgroundColor preserves `yellow3`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on YStack — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <H2> at line 61 (clean)

Before:

```tsx
size="$5"
```

After:

```tsx
size="5"
```

### <XStack> at line 90 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 110 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <H2> at line 111 (clean)

Before:

```tsx
size="$6"
```

After:

```tsx
size="6"
```

### <YStack> at line 116 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <H2> at line 117 (clean)

Before:

```tsx
size="$6"
```

After:

```tsx
size="6"
```


## `app/[locale]/(platform-layout)/ai/usage/_components/AiUsageSummaryCard.tsx`

### <YStack> at line 7 (needs-relocation)

Before:

```tsx
backgroundColor="$background" padding="$3" borderRadius="$3" borderWidth={1} borderColor="$borderColor" minWidth={140}
```

After:

```tsx
backgroundColor="background" padding="3" borderRadius="3" borderWidth={1} borderColor="border-color" minWidth={140}
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on YStack — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <SizableText> at line 15 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 18 (clean)

Before:

```tsx
size="$7" fontWeight="700"
```

After:

```tsx
size="7" fontWeight="700"
```


## `app/[locale]/(platform-layout)/ai/usage/_components/AiUsageTable.tsx`

### <SizableText> at line 64 (clean)

Before:

```tsx
size="$1"
```

After:

```tsx
size="1"
```


## `app/[locale]/(platform-layout)/contact/page.tsx`

### <YStack> at line 14 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 15 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 20 (clean)

Before:

```tsx
mt="$3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
mt="3" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <SizableText> at line 32 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 35 (clean)

Before:

```tsx
size="$2" color="var(--text)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text)" fontFamily="body" mb={0}
```


## `app/[locale]/(platform-layout)/contributing/page.tsx`

### <YStack> at line 47 (clean)

Before:

```tsx
gap="$4" maxWidth={860}
```

After:

```tsx
gap="4" maxWidth={860}
```

### <SizableText> at line 49 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 53 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 64 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 65 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <H3> at line 69 (clean)

Before:

```tsx
mb="$1.5"
```

After:

```tsx
mb="1-5"
```

### <H3> at line 79 (clean)

Before:

```tsx
mb="$1.5"
```

After:

```tsx
mb="1-5"
```

### <SizableText> at line 80 (clean)

Before:

```tsx
size="$3" color="var(--text)" fontFamily="$body"
```

After:

```tsx
size="3" color="var(--text)" fontFamily="body"
```

### <H3> at line 88 (clean)

Before:

```tsx
mb="$1.5"
```

After:

```tsx
mb="1-5"
```

### <SizableText> at line 89 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <H3> at line 93 (clean)

Before:

```tsx
mb="$1.5"
```

After:

```tsx
mb="1-5"
```

### <View> at line 103 (clean)

Before:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3"
```

After:

```tsx
bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3"
```

### <YStack> at line 114 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 115 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 123 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```


## `app/[locale]/HomeAuthenticated.tsx`

### <YStack> at line 23 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <H1> at line 24 (clean)

Before:

```tsx
mb="$2"
```

After:

```tsx
mb="2"
```

### <SizableText> at line 25 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 29 (clean)

Before:

```tsx
gap="$0"
```

After:

```tsx
gap="0"
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$2" mt="$2" mb={0}
```

After:

```tsx
gap="2" mt="2" mb={0}
```

### <YStack> at line 101 (clean)

Before:

```tsx
gap="$2" mt="$2" mb={0}
```

After:

```tsx
gap="2" mt="2" mb={0}
```


## `app/[locale]/platform/ads/_components/PlatformAdForm.tsx`

### <YStack> at line 49 (clean)

Before:

```tsx
mt="$3" gap="$3"
```

After:

```tsx
mt="3" gap="3"
```

### <XStack> at line 50 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap"
```

After:

```tsx
gap="3" flexWrap="wrap"
```

### <YStack> at line 52 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <YStack> at line 66 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 70 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 87 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 91 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 106 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 110 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <YStack> at line 125 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```

### <Input> at line 129 (clean)

Before:

```tsx
size="$3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="$2" fontFamily="$body"
```

After:

```tsx
size="3" w="100%" bg="var(--surface)" borderWidth={1} borderColor="var(--border)" rounded="2" fontFamily="body"
```

### <XStack> at line 144 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Checkbox> at line 145 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 155 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 160 (clean)

Before:

```tsx
gap="$2" justifyContent="flex-end"
```

After:

```tsx
gap="2" justifyContent="flex-end"
```

### <Button> at line 161 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

### <Button> at line 164 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/platform/ads/_components/PlatformAdsTable.tsx`

### <SizableText> at line 23 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <XStack> at line 57 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <Checkbox> at line 58 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <SizableText> at line 68 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <Button> at line 74 (clean)

Before:

```tsx
size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```

After:

```tsx
size="3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)"
```


## `app/[locale]/platform/ads/page.tsx`

### <SizableText> at line 16 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 24 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```

### <YStack> at line 33 (clean)

Before:

```tsx
gap="$4" maxWidth={900}
```

After:

```tsx
gap="4" maxWidth={900}
```

### <SizableText> at line 36 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 39 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <SizableText> at line 42 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```


## `app/[locale]/platform/layout.tsx`

### <YStack> at line 26 (clean)

Before:

```tsx
gap="$4"
```

After:

```tsx
gap="4"
```

### <XStack> at line 28 (clean)

Before:

```tsx
flexWrap="wrap" gap="$3"
```

After:

```tsx
flexWrap="wrap" gap="3"
```

### <SizableText> at line 33 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 41 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/[locale]/platform/recipes/page.tsx`

### <SizableText> at line 105 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 113 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mb={0}
```

### <YStack> at line 122 (clean)

Before:

```tsx
gap="$4" maxWidth={900}
```

After:

```tsx
gap="4" maxWidth={900}
```

### <SizableText> at line 125 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt={0}
```

### <View> at line 129 (clean)

Before:

```tsx
mt="$3"
```

After:

```tsx
mt="3"
```

### <SizableText> at line 145 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1.5"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="1-5"
```

### <XStack> at line 158 (clean)

Before:

```tsx
gap="$3" alignItems="center" flexWrap="wrap"
```

After:

```tsx
gap="3" alignItems="center" flexWrap="wrap"
```

### <SizableText> at line 191 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body" mt="$2.5" mb={0}
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body" mt="2-5" mb={0}
```

### <SizableText> at line 204 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/DashboardClient.tsx`

### <SizableText> at line 52 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```


## `app/HealthPanel.tsx`

### <SizableText> at line 43 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 46 (clean)

Before:

```tsx
gap="$3" mt="$3"
```

After:

```tsx
gap="3" mt="3"
```

### <View> at line 47 (clean)

Before:

```tsx
bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" rounded="$2" p="$3" overflow="auto"
```

After:

```tsx
bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" rounded="2" p="3" overflow="auto"
```

### <SizableText> at line 48 (clean)

Before:

```tsx
size="$2" whiteSpace="pre-wrap"
```

After:

```tsx
size="2" whiteSpace="pre-wrap"
```

### <SizableText> at line 109 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <YStack> at line 113 (clean)

Before:

```tsx
gap="$1.5" mt="$2.5"
```

After:

```tsx
gap="1-5" mt="2-5"
```

### <SizableText> at line 114 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 117 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <SizableText> at line 120 (clean)

Before:

```tsx
size="$2" color="var(--text-muted)" fontFamily="$body"
```

After:

```tsx
size="2" color="var(--text-muted)" fontFamily="body"
```

### <View> at line 125 (clean)

Before:

```tsx
mt="$2.5"
```

After:

```tsx
mt="2-5"
```


## `../../packages/platform/ui/src/ai/AiChatPanel.tsx`

### <YStack> at line 72 (clean)

Before:

```tsx
gap="$4" {...({ "aria-labelledby": "ai-chat-title", role: "main" } as any)}
```

After:

```tsx
gap="4" aria-labelledby={"ai-chat-title"} role={"main"}
```

### <YStack> at line 77 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 79 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <View> at line 85 (needs-relocation, configuration-warning)

Before:

```tsx
backgroundColor="$yellow3" borderColor="$yellow8" borderWidth={1} padding="$3" borderRadius="$3" {...({ role: "alert" } as any)}
```

After:

```tsx
backgroundColor="yellow3" borderColor="yellow8" borderWidth={1} padding="3" borderRadius="3" role={"alert"}
```

Configuration warnings:

- **legacy-palette-token**: backgroundColor preserves `yellow3`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value
- **legacy-palette-token**: borderColor preserves `yellow8`, which @tamagui/config/v6 does not define; choose an absolute palette token or an adaptive color-N value

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on View — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <XStack> at line 96 (clean)

Before:

```tsx
marginTop="$2"
```

After:

```tsx
marginTop="2"
```

### <YStack> at line 109 (needs-relocation)

Before:

```tsx
gap="$3" minHeight={300} padding="$3" backgroundColor="$background" borderRadius="$3" borderWidth={1} borderColor="$borderColor" {...({ "aria-live": "polite" } as any)}
```

After:

```tsx
gap="3" minHeight={300} padding="3" backgroundColor="background" borderRadius="3" borderWidth={1} borderColor="border-color" aria-live={"polite"}
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on YStack — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).

### <YStack> at line 124 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <SizableText> at line 133 (clean)

Before:

```tsx
size="$1"
```

After:

```tsx
size="1"
```

### <YStack> at line 140 (clean)

Before:

```tsx
gap="$2" padding="$2" borderWidth={1} borderColor="$borderColor" borderRadius="$2"
```

After:

```tsx
gap="2" padding="2" borderWidth={1} borderColor="border-color" borderRadius="2"
```

### <SizableText> at line 148 (clean)

Before:

```tsx
size="$2"
```

After:

```tsx
size="2"
```

### <XStack> at line 150 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <SizableText> at line 167 (clean)

Before:

```tsx
size="$1"
```

After:

```tsx
size="1"
```

### <XStack> at line 180 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```


## `../../packages/platform/ui/src/primitives/AdSlotCard.tsx`

### <YStack> at line 28 (clean)

Before:

```tsx
marginVertical={12} gap="$1.5"
```

After:

```tsx
marginVertical={12} gap="1-5"
```

### <YStack> at line 37 (clean)

Before:

```tsx
gap="$1.5"
```

After:

```tsx
gap="1-5"
```


## `../../packages/platform/ui/src/primitives/Collapsible.tsx`

### <YStack> at line 37 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `../../packages/platform/ui/src/primitives/ModeFieldset.tsx`

### <YStack> at line 37 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <RadioGroup.Item> at line 42 (clean)

Before:

```tsx
size="$3" borderColor="$borderColor"
```

After:

```tsx
size="3" borderColor="border-color"
```

### <RadioGroup.Indicator> at line 48 (needs-relocation)

Before:

```tsx
width={10} height={10} borderRadius={9999} backgroundColor="$color8"
```

After:

```tsx
width={10} height={10} borderRadius={9999} backgroundColor="color8"
```

Conversion assessment:

- **needs-relocation: backgroundColor**: "backgroundColor" is not a valid style on RadioGroup.Indicator — the runtime drops it. Remedy: move this style to a component that accepts it (a Text-based component, or html.* on web).


## `../../packages/platform/ui/src/primitives/ReadOnlyField.tsx`

### <YStack> at line 28 (clean)

Before:

```tsx
padding="$2" backgroundColor={isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG} borderRadius="$2" borderWidth={1} borderColor={isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER} userSelect="none"
```

After:

```tsx
padding="2" backgroundColor={isWeb ? "var(--field-readonly-bg)" : FIELD_READONLY_BG} borderRadius="2" borderWidth={1} borderColor={isWeb ? "var(--field-readonly-border)" : FIELD_READONLY_BORDER} userSelect="none"
```

### <YStack> at line 54 (clean)

Before:

```tsx
gap="$1" minWidth={minWidth} flex={flex}
```

After:

```tsx
gap="1" minWidth={minWidth} flex={flex}
```

### <XStack> at line 67 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="flex-end"
```


## `../../packages/platform/ui/src/primitives/Text.tsx`

### <SizableText> at line 17 (clean)

Before:

```tsx
fontFamily={props.fontFamily ?? "$body"} fontWeight={fontWeight ?? "700"} size={size ?? "$8"} {...props}
```

After:

```tsx
fontFamily={props.fontFamily ?? "$body"} fontWeight={fontWeight ?? "700"} size={size ?? "8"} {...props}
```


## `../../packages/verticals/brewery/recipes-ui/src/charts/HydrometerChart.native.tsx`

### <YStack> at line 73 (clean)

Before:

```tsx
gap="$2" marginTop="$2"
```

After:

```tsx
gap="2" marginTop="2"
```

### <XStack> at line 141 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" marginTop="$2"
```

After:

```tsx
gap="3" flexWrap="wrap" marginTop="2"
```


## `../../packages/verticals/brewery/recipes-ui/src/charts/HydrometerChart.web.tsx`

### <YStack> at line 76 (clean)

Before:

```tsx
gap="$2" marginTop="$2"
```

After:

```tsx
gap="2" marginTop="2"
```

### <XStack> at line 145 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" marginTop="$2" justifyContent="flex-start"
```

After:

```tsx
gap="3" flexWrap="wrap" marginTop="2" justifyContent="flex-start"
```


## `../../packages/verticals/brewery/recipes-ui/src/mash/MashStepRowEditable.tsx`

### <YStack> at line 43 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

### <YStack> at line 44 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <YStack> at line 64 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 83 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap"
```

After:

```tsx
gap="2" flexWrap="wrap"
```

### <YStack> at line 84 (clean)

Before:

```tsx
gap="$1" flex={1} minWidth={120}
```

After:

```tsx
gap="1" flex={1} minWidth={120}
```

### <YStack> at line 99 (clean)

Before:

```tsx
gap="$1" flex={1} minWidth={120}
```

After:

```tsx
gap="1" flex={1} minWidth={120}
```

### <YStack> at line 115 (clean)

Before:

```tsx
gap="$1"
```

After:

```tsx
gap="1"
```

### <XStack> at line 145 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```


## `../../packages/verticals/brewery/recipes-ui/src/mash/MashStepsEditor.tsx`

### <YStack> at line 66 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```


## `../../packages/verticals/brewery/recipes-ui/src/mash/MashStepsReadOnlyView.tsx`

### <YStack> at line 16 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `../../packages/verticals/brewery/recipes-ui/src/mash/MashStepsToolbar.tsx`

### <XStack> at line 65 (clean)

Before:

```tsx
gap="$2" alignItems="center"
```

After:

```tsx
gap="2" alignItems="center"
```

### <XStack> at line 121 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <XStack> at line 129 (clean)

Before:

```tsx
gap="$2" flexWrap="wrap" alignItems="center"
```

After:

```tsx
gap="2" flexWrap="wrap" alignItems="center"
```

### <YStack> at line 144 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `../../packages/verticals/brewery/recipes-ui/src/mash/SpargeStepReadOnlyRow.tsx`

### <YStack> at line 44 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```


## `../../packages/verticals/brewery/recipes-ui/src/water/SaltAdditionsEditor.tsx`

### <YStack> at line 39 (clean)

Before:

```tsx
gap="$3"
```

After:

```tsx
gap="3"
```

### <XStack> at line 41 (clean)

Before:

```tsx
gap="$3" flexWrap="wrap" alignItems="flex-end"
```

After:

```tsx
gap="3" flexWrap="wrap" alignItems="flex-end"
```

### <YStack> at line 42 (clean)

Before:

```tsx
flex={1} minWidth={180} gap="$1.5"
```

After:

```tsx
flex={1} minWidth={180} gap="1-5"
```

### <YStack> at line 58 (clean)

Before:

```tsx
flex={1} minWidth={140} gap="$1.5"
```

After:

```tsx
flex={1} minWidth={140} gap="1-5"
```


## `../../packages/verticals/brewery/recipes-ui/src/yeast/ManualCellCountHelpBox.tsx`

### <YStack> at line 62 (clean)

Before:

```tsx
gap="$2"
```

After:

```tsx
gap="2"
```

