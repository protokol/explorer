<template>
  <RouterLink :to="{ name: 'transaction', params: { id } }" class="flex items-center whitespace-no-wrap">
    <span v-if="hasDefaultSlot">
      <slot />
    </span>
    <template v-else>
      <span v-if="showSmartBridgeIcon && smartBridge" v-tooltip="smartBridge">
        <SvgIcon class="hidden mr-2 fill-current md:block" name="tag" view-box="0 0 18 18" />
      </span>
      <span v-else-if="showSmartBridgeIcon && !smartBridge">
        <SvgIcon class="hidden mr-2 fill-current md:block" name="tag-outline" view-box="0 0 18 18" />
      </span>
      <span>
        <span v-tooltip="id" v-if="truncateId">
          {{ truncate(id) }}
        </span>
        <template v-else>
         <span v-tooltip="id">
          {{ id }}
        </span>
          </template>
      </span>
    </template>
  </RouterLink>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class LinkTransaction extends Vue {
  @Prop({ required: true }) public id: string;
  @Prop({ required: false, default: "" }) public smartBridge: string;
  @Prop({ required: false, default: false }) public showSmartBridgeIcon: boolean;
  @Prop({ required: false, default: true }) public truncateId: boolean;

  get hasDefaultSlot(): boolean {
    return !!this.$slots.default;
  }
}
</script>
