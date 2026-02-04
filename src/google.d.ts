declare namespace google {
  namespace script {
    interface Runner {
      withSuccessHandler(callback: (result: any) => void): Runner;
      withFailureHandler(callback: (error: Error) => void): Runner;
      getWishes(): void;
      getUserVotedThemes(): void;
      addNewWish(wish: { title: string; desc: string }): void;
      addVote(id: number): void;
      updateWish(wish: any): void;
      deleteWish(id: number): void;
    }
    const run: Runner;
  }
}