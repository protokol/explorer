export enum CoreTransaction {
  TRANSFER = 0,
  SECOND_SIGNATURE = 1,
  DELEGATE_REGISTRATION = 2,
  VOTE = 3,
  MULTI_SIGNATURE = 4,
  IPFS = 5,
  MULTI_PAYMENT = 6,
  DELEGATE_RESIGNATION = 7,
  TIMELOCK = 8,
  TIMELOCK_CLAIM = 9,
  TIMELOCK_REFUND = 10,
}

export enum MagistrateTransaction {
  BUSINESS_REGISTRATION = 0,
  BUSINESS_RESIGNATION = 1,
  BUSINESS_UPDATE = 2,
  BRIDGECHAIN_REGISTRATION = 3,
  BRIDGECHAIN_RESIGNATION = 4,
  BRIDGECHAIN_UPDATE = 5,
  ENTITY = 6,
}

export enum MagistrateTransactionEntityType {
  BUSINESS = 0,
  PRODUCT = 1,
  PLUGIN = 2,
  MODULE = 3,
  DELEGATE = 4,
}

export enum MagistrateTransactionEntitySubType {
  NONE = 0,
}

export enum MagistrateTransactionEntityAction {
  REGISTER = 0,
  UPDATE = 1,
  RESIGN = 2,
}

export enum TypeGroupTransaction {
  CORE = 1,
  MAGISTRATE = 2,
  NFT_BASE = 9000,
  NFT_EXCHANGE = 9001,
  GUARDIAN = 9002,
}

export enum NFTBaseTransactionTypes {
  NFT_REGISTER_COLLECTION = 0,
  NFT_CREATE = 1,
  NFT_TRANSFER = 2,
  NFT_BURN = 3,
}

export enum NFTExchangeTransactionTypes {
  NFT_AUCTION = 0,
  NFT_AUCTION_CANCEL = 1,
  NFT_BID = 2,
  NFT_BID_CANCEL = 3,
  NFT_ACCEPT_TRADE = 4,
}

export enum GuardianTransactionTypes {
  GUARDIAN_SET_USER_PERMISSIONS = 0,
  GUARDIAN_SET_GROUP_PERMISSIONS = 1,
}

export enum GuardianPermissionKind {
  Deny,
  Allow,
}

export enum ForgingStatus {
  Forging,
  Missing,
  NotForging,
  NeverForged,
  BecameActive,
}
