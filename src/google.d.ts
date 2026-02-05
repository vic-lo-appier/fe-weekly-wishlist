declare namespace google {
  namespace script {
    interface Runner {
      withSuccessHandler(callback: (result: any) => void): Runner;
      withFailureHandler(callback: (error: Error) => void): Runner;
      getWishes(): void;
      getUserVotedThemes(): void;
      addNewWish(wish: { id: string; title: string; desc: string }): void;
      addVote(id: string): void;
      updateWish(wish: any): void;
      deleteWish(id: string): void;
      isAdmin(): void;
    }
    const run: Runner;
  }
}