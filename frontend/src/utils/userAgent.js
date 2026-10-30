export const parseUserAgent = (userAgent = '') => {
  if (!userAgent) {
    return { browser: 'Unknown browser', platform: 'Unknown device' };
  }

  const browserMatchers = [
    { label: 'Edge', test: /Edg\//i },
    { label: 'Opera', test: /OPR\//i },
    { label: 'Firefox', test: /Firefox\//i },
    { label: 'Chrome', test: /Chrome\//i },
    { label: 'Safari', test: /Safari\//i },
  ];

  const platformMatchers = [
    { label: 'Windows', test: /Windows/i },
    { label: 'macOS', test: /Macintosh|Mac OS X/i },
    { label: 'iPhone', test: /iPhone/i },
    { label: 'iPad', test: /iPad/i },
    { label: 'Android', test: /Android/i },
    { label: 'Linux', test: /Linux/i },
  ];

  return {
    browser:
      browserMatchers.find((matcher) => matcher.test.test(userAgent))?.label ||
      'Unknown browser',
    platform:
      platformMatchers.find((matcher) => matcher.test.test(userAgent))?.label ||
      'Unknown device',
  };
};
