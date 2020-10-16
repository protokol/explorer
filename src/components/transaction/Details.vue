<template>
  <div>
    <section class="py-5 mb-5 page-section md:py-10">
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.SENDER") }}</div>
          <div class="truncate">
            <LinkWallet :address="transaction.sender" :trunc="false" tooltip-placement="left" />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.RECIPIENT") }}</div>
          <div class="truncate">
            <LinkWallet :address="transaction.recipient" :trunc="false" tooltip-placement="left" />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.TYPE") }}</div>
          <div class="truncate">
            <LinkWallet
              :address="transaction.recipient"
              :type="transaction.type"
              :asset="transaction.asset"
              :trunc="false"
              :type-group="transaction.typeGroup"
              :show-as-type="true"
              tooltip-placement="left"
            />
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("COMMON.CONFIRMATIONS") }}</div>
          <div>{{ readableNumber(confirmations) }}</div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.AMOUNT") }}</div>
          <div
            v-if="isMultiPayment(transaction.type, transaction.typeGroup)"
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(multipaymentAmount, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(multipaymentAmount) }}
          </div>
          <div
            v-else
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(transaction.amount, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(transaction.amount) }}
          </div>
        </div>

        <div class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.FEE") }}</div>
          <div
            v-tooltip="{
              trigger: 'hover click',
              content: price ? readableCurrency(transaction.fee, price) : '',
              placement: 'left',
            }"
          >
            {{ readableCrypto(transaction.fee) }}
          </div>
        </div>

        <div class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("COMMON.TIMESTAMP") }}</div>
          <div v-if="transaction.timestamp">{{ readableTimestamp(transaction.timestamp.unix) }}</div>
        </div>

        <div v-if="transaction.vendorField" class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.SMARTBRIDGE") }}</div>
          <div class="overflow-hidden break-words">{{ transaction.vendorField }}</div>
        </div>

        <div v-if="transaction.nonce" class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.NONCE") }}</div>
          <div>{{ transaction.nonce }}</div>
        </div>

        <div v-if="isIpfs(transaction.type, transaction.typeGroup)" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.IPFS") }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.ipfs }}</div>
        </div>

        <div v-if="isTimelock(transaction.type, transaction.typeGroup)">
          <div class="list-row-border-b-no-wrap">
            <div class="mr-4 whitespace-no-wrap">{{ $t("TRANSACTION.TIMELOCK.SECRET_HASH") }}</div>
            <div class="overflow-hidden break-all">{{ transaction.asset.lock.secretHash }}</div>
          </div>

          <div v-if="transaction.asset.lock.expiration.type === 1" class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.EXPIRATION") }}</div>
            <div>{{ readableTimestampFromEpoch(transaction.asset.lock.expiration.value) }}</div>
          </div>
          <div v-else-if="transaction.asset.lock.expiration.type === 2" class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.BLOCKHEIGHT") }}</div>
            <div
              v-tooltip="{
                trigger: 'hover click',
                content: readableTimestampFromBlockheight(transaction.asset.lock.expiration.value),
                placement: 'left',
              }"
            >
              {{ transaction.asset.lock.expiration.value }}
            </div>
          </div>

          <div class="list-row-border-b-no-wrap">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.STATUS") }}</div>
            <div v-if="timelockLink">
              <LinkTransaction :id="timelockLink">{{ timelockStatus }}</LinkTransaction>
            </div>
            <div v-else>{{ timelockStatus }}</div>
          </div>
        </div>

        <div v-if="isTimelockClaim(transaction.type, transaction.typeGroup)">
          <div class="list-row-border-b-no-wrap">
            <div class="mr-4 whitespace-no-wrap">{{ $t("TRANSACTION.TIMELOCK.UNLOCK_SECRET_HEX") }}</div>
            <div class="overflow-hidden break-all">{{ stringToHex(transaction.asset.claim.unlockSecret) }}</div>
          </div>

          <div class="list-row-border-b">
            <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.CLAIMED") }}</div>
            <div class="overflow-hidden break-all">
              <LinkTransaction :id="transaction.asset.claim.lockTransactionId" />
            </div>
          </div>
        </div>

        <div v-if="isTimelockRefund(transaction.type, transaction.typeGroup)" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.TIMELOCK.REFUNDED") }}</div>
          <div class="overflow-hidden break-all">
            <LinkTransaction :id="transaction.asset.refund.lockTransactionId" />
          </div>
        </div>

        <div class="list-row">
          <div class="mr-4">{{ $t("TRANSACTION.BLOCK_ID") }}</div>
          <div>
            <LinkBlock v-if="transaction.blockId" :id="transaction.blockId">{{ transaction.blockId }}</LinkBlock>
          </div>
        </div>
      </div>
    </section>

    <section
      v-if="isMultiSignature(transaction.type, transaction.typeGroup)"
      class="py-5 mb-5 TransactionDetails__MultiSignature page-section md:py-10"
    >
      <div class="px-5 sm:px-10">
        <div v-if="!isLegacyMultiSignature" class="list-row-border-b">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.ADDRESS") }}</div>
          <div class="truncate">
            <LinkWallet
              :address="addressFromMultiSignatureAsset(multiSignatureAsset)"
              :trunc="false"
              tooltip-placement="left"
            />
          </div>
        </div>
        <div class="list-row-border-b-no-wrap">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.PARTICIPANTS") }}</div>
          <ul>
            <li v-for="publicKey in publicKeysFromMultiSignatureAsset" :key="publicKey" class="mb-1 text-right">
              <LinkWallet
                :address="addressFromPublicKey(publicKey)"
                :trunc="false"
                tooltip-placement="left"
                class="justify-end"
              />
            </li>
          </ul>
        </div>
        <div :class="isLegacyMultiSignature ? 'list-row-border-b' : 'list-row'">
          <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.MIN") }}</div>
          <div>{{ multiSignatureAsset.min }} / {{ publicKeysFromMultiSignatureAsset.length }}</div>
        </div>
        <template v-if="isLegacyMultiSignature">
          <div class="list-row">
            <div class="mr-4">{{ $t("TRANSACTION.MULTI_SIGNATURE.LIFETIME") }}</div>
            <div>
              {{ multiSignatureAsset.lifetime }}
            </div>
          </div>
          <div v-if="isLegacyMultiSignature" class="text-sm list-row text-theme-text-secondary">
            <span>* {{ $t("TRANSACTION.MULTI_SIGNATURE.LEGACY_NOTICE") }}</span>
          </div>
        </template>
      </div>
    </section>

    <section
      v-if="
        transaction.typeGroup === typeGroupTransaction.MAGISTRATE &&
        transaction.type !== magistrateTransaction.BUSINESS_RESIGNATION
      "
      class="py-5 mb-5 page-section md:py-10"
    >
      <div class="px-5 sm:px-10">
        <div
          v-for="(value, prop, index) in assetField"
          :key="prop"
          :class="index === Object.keys(assetField).length - 1 ? 'list-row' : 'list-row-border-b'"
        >
          <div class="mr-4">{{ $t(`TRANSACTION.ASSET.${prop.toUpperCase()}`) }}</div>
          <div class="overflow-hidden break-all">{{ value }}</div>
        </div>
      </div>
    </section>

    <section
      v-if="isNFTRegisterCollection(transaction.type, transaction.typeGroup)"
      class="py-5 mb-5 page-section md:py-10"
    >
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.COLLECTION`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.NAME`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.nftCollection.name }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.DESCRIPTION`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.nftCollection.description }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.MAXIMUM_SUPPLY`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.nftCollection.maximumSupply }}</div>
        </div>
        <div class="list-row-border-b">
          <div>
            <div class="mr-4">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.JSON_SCHEMA`) }}</div>
            <vue-json-pretty style="margin-top: 16px;" :data="transaction.asset.nftCollection.jsonSchema"> </vue-json-pretty>
          </div>
        </div>
        <div v-if="transaction.asset.nftCollection.allowedIssuers" class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_REGISTER_COLLECTION.ALLOWED_ISSUERS`) }}</div>
          <div>
            <div v-for="value in transaction.asset.nftCollection.allowedIssuers" :key="value">
              <LinkWallet :trunc="false" :address="addressFromPublicKey(value)" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isNFTCreate(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_CREATE.TOKEN`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_CREATE.COLLECTION_ID`) }}</div>
          <LinkTransaction :id="transaction.asset.nftToken.collectionId" :truncate-id="false" />
        </div>
        <div class="list-row-border-b">
          <div>
            <div class="mr-4">{{ $t(`TRANSACTION.NFT_CREATE.TOKEN_ATTRIBUTES`) }}</div>
            <vue-json-pretty style="margin-top: 16px;" :data="transaction.asset.nftToken.attributes"> </vue-json-pretty>
          </div>
        </div>
      </div>
    </section>

    <section v-if="isNFTTransfer(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_TRANSFER.TRANSFER`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_TRANSFER.RECIPIENT_ID`) }}</div>
          <LinkWallet :address="transaction.asset.nftTransfer.recipientId" :trunc="false" tooltip-placement="left" />
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_TRANSFER.NFT_IDS`) }}</div>
          <div>
            <LinkTransaction
              v-for="value in transaction.asset.nftTransfer.nftIds"
              :id="value"
              :key="value"
              :truncate-id="false"
            />
          </div>
        </div>
      </div>
    </section>

    <section v-if="isNFTBurn(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_BURN.BURN`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_BURN.NFT_ID`) }}</div>
          <LinkTransaction :id="transaction.asset.nftBurn.nftId" :truncate-id="false" />
        </div>
      </div>
    </section>

    <section v-if="isNFTAuction(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_AUCTION.AUCTION`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_AUCTION.NFT_IDS`) }}</div>
          <div>
            <LinkTransaction
              v-for="value in transaction.asset.nftAuction.nftIds"
              :id="value"
              :key="value"
              :truncate-id="false"
            />
          </div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_AUCTION.START_AMOUNT`) }}</div>
          <div class="overflow-hidden break-all">{{ readableCrypto(transaction.asset.nftAuction.startAmount) }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_AUCTION.EXPIRATION`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.nftAuction.expiration.blockHeight }}</div>
        </div>
      </div>
    </section>

    <section v-if="isNFTAuctionCancel(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_AUCTION_CANCEL.AUCTION_CANCEL`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_AUCTION_CANCEL.AUCTION_ID`) }}</div>
          <LinkTransaction :id="transaction.asset.nftAuctionCancel.auctionId" :truncate-id="false" />
        </div>
      </div>
    </section>

    <section v-if="isNFTBid(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_BID.BID`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_BID.AUCTION_ID`) }}</div>
          <LinkTransaction :id="transaction.asset.nftBid.auctionId" :truncate-id="false" />
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_BID.AMOUNT`) }}</div>
          <div class="overflow-hidden break-all">{{ readableCrypto(transaction.asset.nftBid.bidAmount) }}</div>
        </div>
      </div>
    </section>

    <section v-if="isNFTBidCancel(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.NFT_BID_CANCEL.BID_CANCEL`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.NFT_BID_CANCEL.BID_ID`) }}</div>
          <LinkTransaction :id="transaction.asset.nftBidCancel.bidId" :truncate-id="false" />
        </div>
      </div>
    </section>

    <section v-if="isGroupPermissions(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.GROUP_PERMISSIONS`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.NAME`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.setGroupPermissions.name }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.ACTIVE`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.setGroupPermissions.active }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.DEFAULT`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.setGroupPermissions.default }}</div>
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.PRIORITY`) }}</div>
          <div class="overflow-hidden break-all">{{ transaction.asset.setGroupPermissions.priority }}</div>
        </div>
        <div class="list-row" v-if="transaction.asset.setGroupPermissions.allow">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.ALLOWED_TRANSACTIONS`) }}</div>
        </div>
        <div v-for="value in transaction.asset.setGroupPermissions.allow" class="">
          {{ $t(`TRANSACTION.TYPES.${transactionTypeKey(value.transactionTypeGroup, value.transactionType)}`) }}
        </div>
        <div class="list-row-border-b"></div>
        <div class="list-row" v-if="transaction.asset.setGroupPermissions.deny">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_GROUP_PERMISSIONS.DENIED_TRANSACTIONS`) }}</div>
        </div>
        <div v-for="value in transaction.asset.setGroupPermissions.deny">
          {{ $t(`TRANSACTION.TYPES.${transactionTypeKey(value.transactionTypeGroup, value.transactionType)}`) }}
        </div>
      </div>
    </section>

    <section v-if="isUserPermissions(transaction.type, transaction.typeGroup)" class="py-5 mb-5 page-section md:py-10">
      <h3 class="px-5 sm:px-10">{{ $t(`TRANSACTION.GUARDIAN_SET_USER_PERMISSIONS.USER_PERMISSIONS`) }}</h3>
      <br />
      <div class="px-5 sm:px-10">
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_USER_PERMISSIONS.WALLET`) }}</div>
          <LinkWallet :trunc="false" :address="addressFromPublicKey(transaction.asset.setUserPermissions.publicKey)" />
        </div>
        <div class="list-row-border-b">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_USER_PERMISSIONS.GROUPS`) }}</div>
          <div>
            <div v-for="value in transaction.asset.setUserPermissions.groupNames" :key="value">
              {{value}}
            </div>
          </div>
        </div>
        <div class="list-row-border-b" v-if="transaction.asset.setUserPermissions.allow">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_USER_PERMISSIONS.ALLOWED_TRANSACTIONS`) }}</div>
        </div>
        <div v-for="value in transaction.asset.setUserPermissions.allow">
          {{ $t(`TRANSACTION.TYPES.${transactionTypeKey(value.transactionTypeGroup, value.transactionType)}`) }}
        </div>
        <div class="list-row-border-b"></div>
        <div class="list-row-border-b" v-if="transaction.asset.setUserPermissions.deny">
          <div class="mr-4">{{ $t(`TRANSACTION.GUARDIAN_SET_USER_PERMISSIONS.DENIED_TRANSACTIONS`) }}</div>
        </div>
        <div v-for="value in transaction.asset.setUserPermissions.deny">
          {{ $t(`TRANSACTION.TYPES.${transactionTypeKey(value.transactionTypeGroup, value.transactionType)}`) }}
        </div>
      </div>
    </section>


  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from "vue-property-decorator";
import { BigNumber } from "@/utils/BigNumber";
import { TranslateResult } from "vue-i18n";
import { mapGetters } from "vuex";
import { ITransaction, ITransactionType } from "@/interfaces";
import {
  CoreTransaction,
  GuardianPermissionKind,
  MagistrateTransaction,
  NFTBaseTransactionTypes,
  TypeGroupTransaction,
} from "@/enums";
import { CryptoCompareService, LockService, TransactionService } from "@/services";
import VueJsonPretty from "vue-json-pretty";
import { transactionTypes } from "@/constants";

@Component({
  computed: {
    ...mapGetters("currency", { currencySymbol: "symbol" }),
    ...mapGetters("network", ["height"]),
  },
  components: {
    VueJsonPretty,
  },
})
export default class TransactionDetails extends Vue {
  @Prop({ required: true }) public transaction: ITransaction;

  private initialBlockHeight = 0;
  private price: number | null = 0;
  private currencySymbol: string;
  private height: number;
  private multipaymentAmount: BigNumber | null = null;
  private timelockStatus: TranslateResult | null = null;
  private timelockLink: string | null = null;

  transactionTypeKey(typeGroup: number, type: number): string {
    for (const transaction of transactionTypes) {
      if (transaction.typeGroup == typeGroup && transaction.type == type) {
        return transaction.key;
      }
    }
    return null;
  }

  permissionsKindMessage(allowType: number) {
    if (allowType === GuardianPermissionKind.Deny) {
      return this.$t(`TRANSACTION.GUARDIAN_PERMISSION_KIND.DENY`);
    } else {
      return this.$t(`TRANSACTION.GUARDIAN_PERMISSION_KIND.ALLOW`);
    }
  }

  get confirmations() {
    return this.initialBlockHeight ? this.height - this.initialBlockHeight : this.transaction.confirmations;
  }

  get coreTransaction() {
    return CoreTransaction;
  }

  get magistrateTransaction() {
    return MagistrateTransaction;
  }

  get nftBaseTransactions() {
    return NFTBaseTransactionTypes;
  }

  get typeGroupTransaction() {
    return TypeGroupTransaction;
  }

  get isLegacyMultiSignature() {
    return !!this.transaction.asset.multiSignatureLegacy;
  }

  get multiSignatureAsset() {
    return this.transaction.asset.multiSignature || this.transaction.asset.multiSignatureLegacy;
  }

  get publicKeysFromMultiSignatureAsset() {
    return this.isLegacyMultiSignature
      ? this.multiSignatureAsset.keysgroup.map((publicKey) => publicKey.slice(1))
      : this.multiSignatureAsset.publicKeys;
  }

  get assetField() {
    // @ts-ignore
    if (this.isLegacyBusinessRegistration(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset.businessRegistration;
    }

    // @ts-ignore
    if (this.isLegacyBusinessUpdate(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset.businessUpdate;
    }

    if (
      // @ts-ignore
      this.isLegacyBridgechainRegistration(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)
    ) {
      return this.transaction.asset.bridgechainRegistration;
    }

    if (
      // @ts-ignore
      this.isLegacyBridgechainResignation(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)
    ) {
      return this.transaction.asset.bridgechainResignation;
    }

    // @ts-ignore
    if (this.isLegacyBridgechainUpdate(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset.bridgechainUpdate;
    }

    // @ts-ignore
    if (this.isEntityRegistration(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset;
    }

    // @ts-ignore
    if (this.isEntityResignation(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset;
    }

    // @ts-ignore
    if (this.isEntityUpdate(this.transaction.type, this.transaction.typeGroup, this.transaction.asset)) {
      return this.transaction.asset;
    }

    return [];
  }

  @Watch("transaction")
  public async onTransactionChanged() {
    this.updatePrice();
    this.handleMultipayment();
    this.getTimelockStatus();
    this.setInitialBlockHeight();
  }

  @Watch("currencySymbol")
  public async onCurrencySymbolChanged() {
    await this.updatePrice();
  }

  @Watch("height")
  public onHeightChanged(newValue: number, oldValue: number) {
    if (!oldValue) {
      this.setInitialBlockHeight();
    }
  }

  public async mounted() {
    this.updatePrice();
    this.handleMultipayment();
    this.getTimelockStatus();
  }

  private async updatePrice() {
    this.price = await CryptoCompareService.dailyAverage(this.transaction.timestamp.unix);
  }

  private setInitialBlockHeight() {
    this.initialBlockHeight = this.height - this.transaction.confirmations;
  }

  private handleMultipayment() {
    // @ts-ignore
    if (this.isMultiPayment(this.transaction.type, this.transaction.typeGroup)) {
      // @ts-ignore
      this.multipaymentAmount = this.calculateMultipaymentAmount(this.transaction);
    }
  }

  private async getTimelockStatus() {
    // @ts-ignore
    if (this.isTimelock(this.transaction.type, this.transaction.typeGroup)) {
      const response = await TransactionService.findUnlockedForLocks([this.transaction.id]);
      if (response.data.length === 0) {
        const lock = await LockService.find(this.transaction.id);
        this.timelockStatus = lock.isExpired
          ? this.$t("TRANSACTION.TIMELOCK.EXPIRED")
          : this.$t("TRANSACTION.TIMELOCK.OPEN");
      } else if (response.data[0].type === CoreTransaction.TIMELOCK_CLAIM) {
        this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.CLAIMED");
        this.timelockLink = response.data[0].id;
      } else if (response.data[0].type === CoreTransaction.TIMELOCK_REFUND) {
        this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.REFUNDED");
        this.timelockLink = response.data[0].id;
      }
    } else {
      this.timelockStatus = this.$t("TRANSACTION.TIMELOCK.UNKNOWN");
    }
  }
}
</script>

<style scoped>
.list-row-border-b-no-wrap > div:last-child {
  text-align: right;
}
</style>
