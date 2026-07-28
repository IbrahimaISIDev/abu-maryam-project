export interface Dictionary {
  skipLink: string;
  nav: {
    home: string;
    library: string;
    live: string;
    events: string;
    about: string;
    watchLive: string;
    search: string;
  };
  mobileHeader: {
    search: string;
    menu: string;
    back: string;
  };
  bottomNav: {
    home: string;
    library: string;
    live: string;
    events: string;
    profile: string;
  };
  search: {
    placeholder: string;
    minChars: string;
    navigate: string;
    open: string;
    close: string;
    groups: {
      teachings: string;
      series: string;
      events: string;
    };
  };
  home: {
    liveBadge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroParagraph: string;
    watchLive: string;
    exploreTeachings: string;
    joinSeminar: string;
    teachingsGridTitle: string;
    viewAll: string;
    liveReplaysTitle: string;
    rewatchLives: string;
    viewers: string;
    themeGridTitle: string;
    ctaTitle: string;
    exploreLibrary: string;
    viewEvents: string;
    continueListeningTitle: string;
    seminarBadge: string;
    seminarDatesLabel: string;
    seminarClosingLabel: string;
    seminarPriceLabel: string;
    seminarRegisterCta: string;
    liveBannerLabel: string;
    liveBannerWatch: string;
  };
}
