<template>
  <goa-callout
    :type="type"
    :heading="heading"
    :size="size"
  >
    <slot />
  </goa-callout>
</template>

<script setup lang="ts">
/**
 * GoabCallout - Vue wrapper for goa-callout web component
 *
 * Displays important notifications and alerts with the Alberta Government Design System.
 *
 * @example
 * <GoabCallout type="success" heading="Success!">
 *   Your changes have been saved.
 * </GoabCallout>
 */

defineProps<{
  type?: 'information' | 'important' | 'emergency' | 'success' | 'event'
  heading?: string
  size?: 'medium' | 'large'
}>()
</script>
