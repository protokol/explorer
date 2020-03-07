import ApiService from "@/services/api";
import { IApiTransactionWrapper, IApiTransactionsWrapper, ITransaction, ITransactionSearchParams } from "../interfaces";
import { paginationLimit } from "@/constants";
import { Sanitizer } from "@/utils/Sanitizer";

class TransactionService {
  public async latest(limit: number = paginationLimit): Promise<ITransaction[]> {
    const response = (await ApiService.get("transactions", {
      params: {
        orderBy: "timestamp:desc",
        limit,
      },
    })) as IApiTransactionsWrapper;

    return this.sanitizeTransactions(response.data);
  }

  public async find(id: string): Promise<ITransaction> {
    const response = (await ApiService.get(`transactions/${id}`)) as IApiTransactionWrapper;
    return this.sanitizeTransactions(response.data);
  }

  public async filterByType(
    page: number,
    type: number,
    typeGroup?: number,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const params: any = {
      orderBy: "timestamp:desc",
      page,
      limit,
    };

    if (type !== -1) {
      params.type = type;
    }

    if (typeGroup) {
      params.typeGroup = typeGroup;
    }

    const response = (await ApiService.get("transactions", {
      params,
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async search(
    body: ITransactionSearchParams,
    page = 1,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.post("transactions/search", body, {
      params: {
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async byBlock(id: string, page = 1, limit: number = paginationLimit): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.get(`blocks/${id}/transactions`, {
      params: {
        orderBy: "timestamp:desc",
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async allByAddress(address: string, page = 1, limit = paginationLimit): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.get(`wallets/${address}/transactions`, {
      params: {
        orderBy: "timestamp:desc",
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async sentByAddress(
    address: string,
    page = 1,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.get(`wallets/${address}/transactions/sent`, {
      params: {
        orderBy: "timestamp:desc",
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async receivedByAddress(
    address: string,
    page = 1,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.get(`wallets/${address}/transactions/received`, {
      params: {
        orderBy: "timestamp:desc",
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async locksByAddress(
    address: string,
    page = 1,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.get(`wallets/${address}/locks`, {
      params: {
        orderBy: "timestamp:desc",
        page,
        limit,
      },
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async findUnlockedForLocks(
    transactionIds: string[],
    page = 1,
    limit: number = paginationLimit,
  ): Promise<IApiTransactionsWrapper> {
    const response = (await ApiService.post(`locks/unlocked`, {
      ids: transactionIds,
    })) as IApiTransactionsWrapper;

    response.data = this.sanitizeTransactions(response.data);

    return response;
  }

  public async sentByAddressCount(senderId: string): Promise<number> {
    const response = (await ApiService.get("transactions", {
      params: {
        senderId,
        limit: 1,
      },
    })) as IApiTransactionsWrapper;
    return response.meta.totalCount;
  }

  public async receivedByAddressCount(recipientId: string): Promise<number> {
    const response = (await ApiService.get("transactions", {
      params: {
        recipientId,
        limit: 1,
      },
    })) as IApiTransactionsWrapper;
    return response.meta.totalCount;
  }

  public async locksByAddressCount(address: string): Promise<number> {
    const response = (await ApiService.get(`wallets/${address}/locks`, {
      params: {
        limit: 1,
      },
    })) as IApiTransactionsWrapper;
    return response.meta.totalCount;
  }

  private sanitizeTransactions(transactions): any {
    const censoredFields = ["vendorField"];

    const isSingle = !Array.isArray(transactions);

    if (!Array.isArray(transactions)) {
      transactions = [transactions];
    }

    const sanitizerInstance = new Sanitizer();

    for (let i = 0; i < transactions.length; i++) {
      for (const censoredField of censoredFields) {
        transactions[i][censoredField] = sanitizerInstance.apply(transactions[i][censoredField]);
      }
    }

    return isSingle ? transactions[0] : transactions;
  }
}

export default new TransactionService();
