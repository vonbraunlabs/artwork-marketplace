import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    ethereum?: any;
  }
}

@Injectable({
  providedIn: 'root'
})
export class Web3Service {
  private accountSubject = new BehaviorSubject<string | null>(null);
  public account$ = this.accountSubject.asObservable();

  private chainIdSubject = new BehaviorSubject<number | null>(null);
  public chainId$ = this.chainIdSubject.asObservable();

  constructor() {
    this.initializeListeners();
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    const account = accounts[0];
    this.accountSubject.next(account);

    const chainId = await window.ethereum.request({ 
      method: 'eth_chainId' 
    });
    this.chainIdSubject.next(parseInt(chainId, 16));

    return account;
  }

  async switchNetwork(): Promise<void> {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    const chainIdHex = `0x${environment.chainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chainIdHex,
            rpcUrls: [environment.rpcUrl],
            chainName: 'Local Network',
          }],
        });
      } else {
        throw error;
      }
    }
  }

  getAccount(): string | null {
    return this.accountSubject.value;
  }

  getChainId(): number | null {
    return this.chainIdSubject.value;
  }

  isCorrectNetwork(): boolean {
    return this.chainIdSubject.value === environment.chainId;
  }

  private initializeListeners(): void {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        this.accountSubject.next(accounts[0] || null);
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        this.chainIdSubject.next(parseInt(chainId, 16));
        window.location.reload();
      });
    }
  }
}
