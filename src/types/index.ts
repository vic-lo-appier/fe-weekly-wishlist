export interface Wish {
  id: string;
  votes: number;
  title: string;
  desc: string;
  isOwner: boolean;
  isTemp?: boolean;
}

export interface ToastState {
  msg: string;
  type: 'success' | 'error';
}
