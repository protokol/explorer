import { createLocalVue, shallowMount, Wrapper } from "@vue/test-utils";
import CryptoMixin from "@/mixins/crypto";
import Vue from "vue";
import store from "@/store";

describe("Mixins > Crypto", () => {
  let wrapper: Wrapper<Vue>;

  beforeEach(() => {
    const localVue = createLocalVue();

    const TestComponent = {
      name: "TestComponent",
      template: "<div />",
    };

    wrapper = shallowMount(TestComponent, {
      localVue,
      store,
      mixins: [CryptoMixin],
    });
  });

  describe("addressFromPublicKey", () => {
    it("should generate the proper address for a public key", () => {
      store.dispatch("network/setAddressPrefix", 30);
      expect(wrapper.vm.addressFromPublicKey("03d3fdad9c5b25bf8880e6b519eb3611a5c0b31adebc8455f0e096175b28321aff")).toEqual("D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax");
    });
  });

  describe("addressFromMultiSignatureAsset", () => {
    it("should fail if a public key is of incorrect length", () => {
      store.dispatch("network/setAddressPrefix", 30);
      const asset = {
        min: 2,
        publicKeys: [
          "D7mTAYxWLTs8aJYHzptcM7SXKsThPW5Ux6q",
          "DAkLQwAf8WNLkYDZf6pFBFUQrFB5u3f5K6b",
          "D7oi9A7P9wSg1fqsjJbhC1SKN8vAL8EML1d",
        ]
      };
      expect(wrapper.vm.addressFromMultiSignatureAsset(asset)).toThrow();
    });

    it("should fail if min is lower than 1", () => {
      store.dispatch("network/setAddressPrefix", 30);
      const asset = {
        min: 0,
        publicKeys: [
          "D7mTAYxWLTs8aJYHzptcM7SXKsThPW5Ux6",
        ]
      };
      expect(wrapper.vm.addressFromMultiSignatureAsset(asset)).toThrow();
    });

    it("should fail if min is larger than amount of public keys", () => {
      store.dispatch("network/setAddressPrefix", 30);
      const asset = {
        min: 3,
        publicKeys: [
          "D7mTAYxWLTs8aJYHzptcM7SXKsThPW5Ux6",
          "DAkLQwAf8WNLkYDZf6pFBFUQrFB5u3f5K6",
        ]
      };
      expect(wrapper.vm.addressFromMultiSignatureAsset(asset)).toThrow();
    });

    it("should generate the proper multisig address for a multisig asset", () => {
      store.dispatch("network/setAddressPrefix", 30);
      const asset = {
        min: 2,
        publicKeys: [
          "D7mTAYxWLTs8aJYHzptcM7SXKsThPW5Ux6",
          "DAkLQwAf8WNLkYDZf6pFBFUQrFB5u3f5K6",
          "D7oi9A7P9wSg1fqsjJbhC1SKN8vAL8EML1",
        ]
      };
      expect(wrapper.vm.addressFromMultiSignatureAsset(asset)).toEqual("DRNLnCjzQAcwTpifr7BK7SFfJpWZQHfDu4");
    });
  });
});
